import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { expect } from "chai";

import {
  airdropSol,
  createTestMint,
  createTokenAccount,
  mintTokens,
  findCirclePDA,
  findEscrowPDA,
  findMemberPDA,
  findProposalPDA,
  findVotePDA,
  findAuctionPDA,
  findBidPDA,
  initializeCircle,
  joinCircle,
  initializeRevenueAccounts,
  expectError,
  CircleContext,
  PROGRAM_ID,
} from "./helpers";

describe("halo-protocol: governance and auctions", () => {
  // -------------------------------------------------------------------------
  // Provider & program setup
  // -------------------------------------------------------------------------
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.HaloProtocol as Program<any>;
  const connection = provider.connection;

  let creator: web3.Keypair;
  let mint: web3.PublicKey;
  let circleCtx: CircleContext;

  // Members for governance tests
  let member1: web3.Keypair;
  let member1Key: web3.PublicKey;
  let member1TokenAccount: web3.PublicKey;

  let member2: web3.Keypair;
  let member2Key: web3.PublicKey;
  let member2TokenAccount: web3.PublicKey;

  // -------------------------------------------------------------------------
  // Global setup
  // -------------------------------------------------------------------------
  before(async () => {
    creator = web3.Keypair.generate();
    await airdropSol(connection, creator.publicKey);
    mint = await createTestMint(connection, creator);

    await initializeRevenueAccounts(program, creator);

    // Create a circle with members for governance tests
    circleCtx = await initializeCircle(program, creator, mint, {
      contributionAmount: new BN(1_000_000),
      durationMonths: 6,
      maxMembers: 10,
      penaltyRate: 500,
    });

    // Add the creator as a member
    member1 = web3.Keypair.generate();
    await airdropSol(connection, member1.publicKey);
    const join1 = await joinCircle(
      program,
      circleCtx,
      member1,
      new BN(2_000_000)
    );
    member1Key = join1.memberKey;
    member1TokenAccount = join1.memberTokenAccount;

    member2 = web3.Keypair.generate();
    await airdropSol(connection, member2.publicKey);
    const join2 = await joinCircle(
      program,
      circleCtx,
      member2,
      new BN(2_000_000)
    );
    member2Key = join2.memberKey;
    member2TokenAccount = join2.memberTokenAccount;
  });

  // =========================================================================
  // create_proposal
  // =========================================================================

  describe("create_proposal", () => {
    it("creates a proposal successfully", async () => {
      const [proposalKey] = findProposalPDA(circleCtx.circleKey);

      await program.methods
        .createProposal(
          "Reduce penalty rate",
          "Proposal to reduce the penalty rate from 5% to 3%",
          0, // InterestRateChange
          48, // 48 hours voting
          new BN(100), // execution threshold
          300 // new rate: 3%
        )
        .accounts({
          proposal: proposalKey,
          circle: circleCtx.circleKey,
          proposer: member1.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([member1])
        .rpc();

      const proposalAccount = await program.account.governanceProposal.fetch(
        proposalKey
      );

      expect(proposalAccount.circle.toBase58()).to.equal(
        circleCtx.circleKey.toBase58()
      );
      expect(proposalAccount.proposer.toBase58()).to.equal(
        member1.publicKey.toBase58()
      );
      expect(proposalAccount.title).to.equal("Reduce penalty rate");
      expect(proposalAccount.description).to.equal(
        "Proposal to reduce the penalty rate from 5% to 3%"
      );
      // proposal_type = InterestRateChange
      expect(JSON.stringify(proposalAccount.proposalType)).to.include(
        "interestRateChange"
      );
      // status = Active
      expect(JSON.stringify(proposalAccount.status)).to.include("active");
      expect(proposalAccount.votesFor.toNumber()).to.equal(0);
      expect(proposalAccount.votesAgainst.toNumber()).to.equal(0);
      expect(proposalAccount.totalVotingPower.toNumber()).to.equal(0);
      expect(proposalAccount.executed).to.be.false;
      expect(proposalAccount.executionThreshold.toNumber()).to.equal(100);
      expect(proposalAccount.newInterestRate).to.equal(300);
      expect(proposalAccount.votingEnd.toNumber()).to.be.greaterThan(
        proposalAccount.votingStart.toNumber()
      );
    });

    it("fails if proposer is not a circle member", async () => {
      // Create a new circle so we get a fresh proposal PDA
      const freshCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      const nonMember = web3.Keypair.generate();
      await airdropSol(connection, nonMember.publicKey);

      const [proposalKey] = findProposalPDA(freshCircle.circleKey);

      await expectError(
        program.methods
          .createProposal(
            "Bad proposal",
            "This should fail",
            1, // CircleParameter
            24,
            new BN(100),
            null // no new interest rate
          )
          .accounts({
            proposal: proposalKey,
            circle: freshCircle.circleKey,
            proposer: nonMember.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([nonMember])
          .rpc(),
        "MemberNotFound"
      );
    });

    it("fails with invalid proposal type (>2)", async () => {
      const freshCircle2 = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      // Add member1 to this circle so they can propose
      await joinCircle(program, freshCircle2, member1, new BN(2_000_000));

      const [proposalKey] = findProposalPDA(freshCircle2.circleKey);

      await expectError(
        program.methods
          .createProposal(
            "Invalid type",
            "Type 3 does not exist",
            3, // invalid
            24,
            new BN(100),
            null
          )
          .accounts({
            proposal: proposalKey,
            circle: freshCircle2.circleKey,
            proposer: member1.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([member1])
          .rpc(),
        "InvalidProposalType"
      );
    });

    it("fails with invalid voting duration (0 hours)", async () => {
      const freshCircle3 = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      await joinCircle(program, freshCircle3, member1, new BN(2_000_000));

      const [proposalKey] = findProposalPDA(freshCircle3.circleKey);

      await expectError(
        program.methods
          .createProposal(
            "Zero duration",
            "Voting duration 0 should fail",
            1,
            0, // invalid: 0 hours
            new BN(100),
            null
          )
          .accounts({
            proposal: proposalKey,
            circle: freshCircle3.circleKey,
            proposer: member1.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([member1])
          .rpc(),
        "InvalidVotingPeriod"
      );
    });
  });

  // =========================================================================
  // cast_vote
  // =========================================================================

  describe("cast_vote", () => {
    let voteCircle: CircleContext;
    let proposalKey: web3.PublicKey;
    let voter: web3.Keypair;
    let voterTokenAccount: web3.PublicKey;

    before(async () => {
      voteCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 6,
        maxMembers: 10,
        penaltyRate: 500,
      });

      voter = web3.Keypair.generate();
      await airdropSol(connection, voter.publicKey);
      const voterJoin = await joinCircle(
        program,
        voteCircle,
        voter,
        new BN(2_000_000)
      );
      voterTokenAccount = voterJoin.memberTokenAccount;

      // Create proposal
      [proposalKey] = findProposalPDA(voteCircle.circleKey);

      await program.methods
        .createProposal(
          "Test vote proposal",
          "A proposal to test voting",
          1, // CircleParameter
          48,
          new BN(50),
          null
        )
        .accounts({
          proposal: proposalKey,
          circle: voteCircle.circleKey,
          proposer: voter.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([voter])
        .rpc();
    });

    it("casts vote with quadratic weight", async () => {
      const [voteKey] = findVotePDA(proposalKey, voter.publicKey);
      const votingPower = new BN(100);

      await program.methods
        .castVote(true, votingPower)
        .accounts({
          proposal: proposalKey,
          vote: voteKey,
          voter: voter.publicKey,
          voterTokenAccount: voterTokenAccount,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([voter])
        .rpc();

      // Verify vote account
      const voteAccount = await program.account.vote.fetch(voteKey);
      expect(voteAccount.proposal.toBase58()).to.equal(
        proposalKey.toBase58()
      );
      expect(voteAccount.voter.toBase58()).to.equal(
        voter.publicKey.toBase58()
      );
      expect(voteAccount.votingPower.toNumber()).to.equal(100);
      // sqrt(100) = 10
      expect(voteAccount.quadraticWeight.toNumber()).to.equal(10);
      expect(voteAccount.support).to.be.true;

      // Verify proposal tallies updated
      const proposalAccount =
        await program.account.governanceProposal.fetch(proposalKey);
      expect(proposalAccount.votesFor.toNumber()).to.equal(100);
      expect(proposalAccount.votesAgainst.toNumber()).to.equal(0);
      expect(proposalAccount.quadraticVotesFor.toNumber()).to.equal(10);
      expect(proposalAccount.totalVotingPower.toNumber()).to.equal(100);
    });

    it("second voter casts against vote", async () => {
      const voter2 = web3.Keypair.generate();
      await airdropSol(connection, voter2.publicKey);
      const voter2Join = await joinCircle(
        program,
        voteCircle,
        voter2,
        new BN(2_000_000)
      );

      const [voteKey2] = findVotePDA(proposalKey, voter2.publicKey);
      const votingPower = new BN(49);

      await program.methods
        .castVote(false, votingPower)
        .accounts({
          proposal: proposalKey,
          vote: voteKey2,
          voter: voter2.publicKey,
          voterTokenAccount: voter2Join.memberTokenAccount,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([voter2])
        .rpc();

      const voteAccount = await program.account.vote.fetch(voteKey2);
      expect(voteAccount.support).to.be.false;
      expect(voteAccount.votingPower.toNumber()).to.equal(49);
      // sqrt(49) = 7
      expect(voteAccount.quadraticWeight.toNumber()).to.equal(7);

      // Verify proposal tallies
      const proposalAccount =
        await program.account.governanceProposal.fetch(proposalKey);
      expect(proposalAccount.votesFor.toNumber()).to.equal(100);
      expect(proposalAccount.votesAgainst.toNumber()).to.equal(49);
      expect(proposalAccount.quadraticVotesFor.toNumber()).to.equal(10);
      expect(proposalAccount.quadraticVotesAgainst.toNumber()).to.equal(7);
      expect(proposalAccount.totalVotingPower.toNumber()).to.equal(149);
    });

    it("fails to vote twice (PDA already initialized)", async () => {
      const [voteKey] = findVotePDA(proposalKey, voter.publicKey);

      await expectError(
        program.methods
          .castVote(true, new BN(50))
          .accounts({
            proposal: proposalKey,
            vote: voteKey,
            voter: voter.publicKey,
            voterTokenAccount: voterTokenAccount,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([voter])
          .rpc(),
        "already in use"
      );
    });

    it("fails with zero voting power", async () => {
      const voter3 = web3.Keypair.generate();
      await airdropSol(connection, voter3.publicKey);
      const voter3Join = await joinCircle(
        program,
        voteCircle,
        voter3,
        new BN(2_000_000)
      );

      const [voteKey3] = findVotePDA(proposalKey, voter3.publicKey);

      await expectError(
        program.methods
          .castVote(true, new BN(0))
          .accounts({
            proposal: proposalKey,
            vote: voteKey3,
            voter: voter3.publicKey,
            voterTokenAccount: voter3Join.memberTokenAccount,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([voter3])
          .rpc(),
        "InsufficientVotingPower"
      );
    });
  });

  // =========================================================================
  // execute_proposal
  // =========================================================================

  describe("execute_proposal", () => {
    it("fails before voting period ends", async () => {
      // Create a fresh circle + proposal with long voting period
      const execCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 6,
        maxMembers: 10,
        penaltyRate: 500,
      });

      const execMember = web3.Keypair.generate();
      await airdropSol(connection, execMember.publicKey);
      await joinCircle(program, execCircle, execMember, new BN(2_000_000));

      const [proposalKey] = findProposalPDA(execCircle.circleKey);

      await program.methods
        .createProposal(
          "Long vote proposal",
          "Voting lasts 168 hours (7 days)",
          0,
          168, // 7 days
          new BN(10),
          200
        )
        .accounts({
          proposal: proposalKey,
          circle: execCircle.circleKey,
          proposer: execMember.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([execMember])
        .rpc();

      // Vote to meet threshold
      const [voteKey] = findVotePDA(proposalKey, execMember.publicKey);
      const execMemberToken = await createTokenAccount(
        connection,
        creator,
        mint,
        execMember.publicKey
      );
      await mintTokens(connection, creator, mint, execMemberToken, 1_000_000);

      await program.methods
        .castVote(true, new BN(100))
        .accounts({
          proposal: proposalKey,
          vote: voteKey,
          voter: execMember.publicKey,
          voterTokenAccount: execMemberToken,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([execMember])
        .rpc();

      // Try to execute immediately -- voting period has not ended
      // Note: execute_proposal checks voting_ended(clock.unix_timestamp)
      // The error message depends on whether the condition evaluates as
      // "VotingPeriodEnded" (the require uses this error name even though
      // semantically it means "voting must have ended to execute").
      const executor = web3.Keypair.generate();
      await airdropSol(connection, executor.publicKey);

      await expectError(
        program.methods
          .executeProposal()
          .accounts({
            proposal: proposalKey,
            circle: execCircle.circleKey,
            executor: executor.publicKey,
          })
          .signers([executor])
          .rpc(),
        "VotingPeriodEnded"
      );
    });
  });

  // =========================================================================
  // create_auction
  // =========================================================================

  describe("create_auction", () => {
    it("creates auction successfully", async () => {
      // Use the main circleCtx (member1 and member2 are members)
      const [auctionKey] = findAuctionPDA(circleCtx.circleKey);

      await program.methods
        .createAuction(
          new BN(5_000_000), // pot_amount
          new BN(1_000_000), // starting_bid
          24 // 24 hours
        )
        .accounts({
          auction: auctionKey,
          circle: circleCtx.circleKey,
          initiator: member1.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([member1])
        .rpc();

      const auctionAccount = await program.account.auction.fetch(auctionKey);

      expect(auctionAccount.circle.toBase58()).to.equal(
        circleCtx.circleKey.toBase58()
      );
      expect(auctionAccount.initiator.toBase58()).to.equal(
        member1.publicKey.toBase58()
      );
      expect(auctionAccount.potAmount.toNumber()).to.equal(5_000_000);
      expect(auctionAccount.startingBid.toNumber()).to.equal(1_000_000);
      expect(auctionAccount.highestBid.toNumber()).to.equal(1_000_000);
      expect(auctionAccount.highestBidder).to.be.null;
      expect(JSON.stringify(auctionAccount.status)).to.include("active");
      expect(auctionAccount.settled).to.be.false;
      expect(auctionAccount.bidCount).to.equal(0);
      expect(auctionAccount.endTime.toNumber()).to.be.greaterThan(
        auctionAccount.startTime.toNumber()
      );
    });

    it("fails with zero pot amount", async () => {
      const auctionCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      const aMember = web3.Keypair.generate();
      await airdropSol(connection, aMember.publicKey);
      await joinCircle(program, auctionCircle, aMember, new BN(2_000_000));

      const [auctionKey] = findAuctionPDA(auctionCircle.circleKey);

      await expectError(
        program.methods
          .createAuction(new BN(0), new BN(0), 24)
          .accounts({
            auction: auctionKey,
            circle: auctionCircle.circleKey,
            initiator: aMember.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([aMember])
          .rpc(),
        "NoPotAvailableForAuction"
      );
    });

    it("fails with invalid auction duration (0 hours)", async () => {
      const auctionCircle2 = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      const aMember2 = web3.Keypair.generate();
      await airdropSol(connection, aMember2.publicKey);
      await joinCircle(program, auctionCircle2, aMember2, new BN(2_000_000));

      const [auctionKey] = findAuctionPDA(auctionCircle2.circleKey);

      await expectError(
        program.methods
          .createAuction(new BN(1_000_000), new BN(100_000), 0)
          .accounts({
            auction: auctionKey,
            circle: auctionCircle2.circleKey,
            initiator: aMember2.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([aMember2])
          .rpc(),
        "InvalidAuctionDuration"
      );
    });

    it("fails with invalid auction duration (>72 hours)", async () => {
      const auctionCircle3 = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      const aMember3 = web3.Keypair.generate();
      await airdropSol(connection, aMember3.publicKey);
      await joinCircle(program, auctionCircle3, aMember3, new BN(2_000_000));

      const [auctionKey] = findAuctionPDA(auctionCircle3.circleKey);

      await expectError(
        program.methods
          .createAuction(new BN(1_000_000), new BN(100_000), 73)
          .accounts({
            auction: auctionKey,
            circle: auctionCircle3.circleKey,
            initiator: aMember3.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([aMember3])
          .rpc(),
        "InvalidAuctionDuration"
      );
    });

    it("fails if initiator is not a member", async () => {
      const auctionCircle4 = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      const nonMember = web3.Keypair.generate();
      await airdropSol(connection, nonMember.publicKey);

      const [auctionKey] = findAuctionPDA(auctionCircle4.circleKey);

      await expectError(
        program.methods
          .createAuction(new BN(1_000_000), new BN(100_000), 24)
          .accounts({
            auction: auctionKey,
            circle: auctionCircle4.circleKey,
            initiator: nonMember.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([nonMember])
          .rpc(),
        "MemberNotFound"
      );
    });
  });

  // =========================================================================
  // place_bid
  // =========================================================================

  describe("place_bid", () => {
    let bidCircle: CircleContext;
    let auctionKey: web3.PublicKey;
    let bidder: web3.Keypair;
    let bidderKey: web3.PublicKey;
    let bidderTokenAccount: web3.PublicKey;
    let auctionEscrowAccount: web3.PublicKey;
    let initiator: web3.Keypair;

    before(async () => {
      bidCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 6,
        maxMembers: 10,
        penaltyRate: 500,
      });

      initiator = web3.Keypair.generate();
      await airdropSol(connection, initiator.publicKey);
      await joinCircle(program, bidCircle, initiator, new BN(2_000_000));

      bidder = web3.Keypair.generate();
      await airdropSol(connection, bidder.publicKey);
      const bidderJoin = await joinCircle(
        program,
        bidCircle,
        bidder,
        new BN(2_000_000)
      );
      bidderKey = bidderJoin.memberKey;
      bidderTokenAccount = bidderJoin.memberTokenAccount;

      // Create auction
      [auctionKey] = findAuctionPDA(bidCircle.circleKey);

      await program.methods
        .createAuction(
          new BN(5_000_000),
          new BN(1_000_000),
          24
        )
        .accounts({
          auction: auctionKey,
          circle: bidCircle.circleKey,
          initiator: initiator.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([initiator])
        .rpc();

      // Create auction escrow token account
      auctionEscrowAccount = await createTokenAccount(
        connection,
        creator,
        mint,
        auctionKey
      );
    });

    it("places bid on active auction", async () => {
      const [bidKey] = findBidPDA(auctionKey, bidder.publicKey);
      const bidAmount = new BN(1_500_000);

      await program.methods
        .placeBid(bidAmount)
        .accounts({
          auction: auctionKey,
          bid: bidKey,
          bidder: bidder.publicKey,
          member: bidderKey,
          bidderTokenAccount: bidderTokenAccount,
          auctionEscrowAccount: auctionEscrowAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([bidder])
        .rpc();

      // Verify bid
      const bidAccount = await program.account.bid.fetch(bidKey);
      expect(bidAccount.auction.toBase58()).to.equal(
        auctionKey.toBase58()
      );
      expect(bidAccount.bidder.toBase58()).to.equal(
        bidder.publicKey.toBase58()
      );
      expect(bidAccount.amount.toNumber()).to.equal(1_500_000);
      expect(bidAccount.isHighest).to.be.true;

      // Verify auction updated
      const auctionAccount = await program.account.auction.fetch(auctionKey);
      expect(auctionAccount.highestBid.toNumber()).to.equal(1_500_000);
      expect(auctionAccount.highestBidder.toBase58()).to.equal(
        bidder.publicKey.toBase58()
      );
      expect(auctionAccount.bidCount).to.equal(1);
    });

    it("fails with bid lower than current highest", async () => {
      const lowBidder = web3.Keypair.generate();
      await airdropSol(connection, lowBidder.publicKey);
      const lowJoin = await joinCircle(
        program,
        bidCircle,
        lowBidder,
        new BN(2_000_000)
      );

      const [lowBidKey] = findBidPDA(auctionKey, lowBidder.publicKey);

      await expectError(
        program.methods
          .placeBid(new BN(500_000)) // below current highest of 1_500_000
          .accounts({
            auction: auctionKey,
            bid: lowBidKey,
            bidder: lowBidder.publicKey,
            member: lowJoin.memberKey,
            bidderTokenAccount: lowJoin.memberTokenAccount,
            auctionEscrowAccount: auctionEscrowAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([lowBidder])
          .rpc(),
        "BidTooLow"
      );
    });

    it("fails if bidder is the initiator", async () => {
      // initiator is a member of bidCircle, but also the auction initiator
      const [initMemberKey] = findMemberPDA(
        bidCircle.circleKey,
        initiator.publicKey
      );

      // Create token account for initiator
      const initToken = await createTokenAccount(
        connection,
        creator,
        mint,
        initiator.publicKey
      );
      await mintTokens(connection, creator, mint, initToken, 10_000_000);

      const [initBidKey] = findBidPDA(auctionKey, initiator.publicKey);

      await expectError(
        program.methods
          .placeBid(new BN(2_000_000))
          .accounts({
            auction: auctionKey,
            bid: initBidKey,
            bidder: initiator.publicKey,
            member: initMemberKey,
            bidderTokenAccount: initToken,
            auctionEscrowAccount: auctionEscrowAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([initiator])
          .rpc(),
        "CannotBidOnOwnAuction"
      );
    });

    it("higher bid gets recorded and updates auction", async () => {
      const highBidder = web3.Keypair.generate();
      await airdropSol(connection, highBidder.publicKey);
      const highJoin = await joinCircle(
        program,
        bidCircle,
        highBidder,
        new BN(2_000_000)
      );

      const [highBidKey] = findBidPDA(auctionKey, highBidder.publicKey);
      const highBidAmount = new BN(3_000_000);

      await program.methods
        .placeBid(highBidAmount)
        .accounts({
          auction: auctionKey,
          bid: highBidKey,
          bidder: highBidder.publicKey,
          member: highJoin.memberKey,
          bidderTokenAccount: highJoin.memberTokenAccount,
          auctionEscrowAccount: auctionEscrowAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([highBidder])
        .rpc();

      const auctionAccount = await program.account.auction.fetch(auctionKey);
      expect(auctionAccount.highestBid.toNumber()).to.equal(3_000_000);
      expect(auctionAccount.highestBidder.toBase58()).to.equal(
        highBidder.publicKey.toBase58()
      );
      expect(auctionAccount.bidCount).to.equal(2);
    });
  });

  // =========================================================================
  // settle_auction
  // =========================================================================

  describe("settle_auction", () => {
    it("fails when auction has not ended", async () => {
      // Create a fresh auction with long duration
      const settleCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      const settler = web3.Keypair.generate();
      await airdropSol(connection, settler.publicKey);
      await joinCircle(program, settleCircle, settler, new BN(2_000_000));

      const [auctionKey] = findAuctionPDA(settleCircle.circleKey);

      await program.methods
        .createAuction(new BN(1_000_000), new BN(100_000), 72)
        .accounts({
          auction: auctionKey,
          circle: settleCircle.circleKey,
          initiator: settler.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([settler])
        .rpc();

      // Try to settle immediately -- auction has 72 hours left
      await expectError(
        program.methods
          .settleAuction()
          .accounts({
            auction: auctionKey,
            settler: settler.publicKey,
          })
          .signers([settler])
          .rpc(),
        "AuctionNotEnded"
      );
    });

    // NOTE: Testing successful settlement requires advancing the clock past
    // end_time. In a full integration test with solana-test-validator, you
    // would use --warp-slot to advance time past the auction's end_time.
  });
});
