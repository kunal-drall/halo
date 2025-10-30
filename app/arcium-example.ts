/**
 * Arcium Privacy Integration Example
 *
 * Demonstrates privacy features powered by Arcium MPC:
 * - Encrypted trust score calculations
 * - Private borrowing with encrypted loan terms
 * - Sealed bid auctions
 * - Anonymous circle participation
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { HaloProtocolClient } from "./halo-client";
import fs from "fs";

async function main() {
  console.log("================================================");
  console.log("🔒 ARCIUM PRIVACY INTEGRATION DEMO");
  console.log("================================================\n");

  // Setup connection and provider
  const connection = new anchor.web3.Connection(
    "http://localhost:8899",
    "confirmed"
  );

  const wallet = Keypair.generate();

  // Airdrop SOL for testing
  console.log("Requesting airdrop...");
  const airdropSig = await connection.requestAirdrop(
    wallet.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSig);
  console.log("✅ Airdrop confirmed\n");

  // Load program
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const idl = JSON.parse(
    fs.readFileSync("./target/idl/halo_protocol.json", "utf8")
  );
  const programId = new anchor.web3.PublicKey(idl.metadata.address);
  const program = new Program(idl, programId, provider) as Program;

  // Initialize client
  const client = new HaloProtocolClient(program);

  // Initialize Arcium service
  console.log("================================================");
  console.log("1. Initializing Arcium Privacy Service");
  console.log("================================================");
  await client.initializeArcium();
  const arciumService = client.getArciumService();
  console.log();

  // ============================================================================
  // DEMO 1: Encrypted Trust Score Calculation
  // ============================================================================
  console.log("================================================");
  console.log("2. Encrypted Trust Score Calculation");
  console.log("================================================");

  const trustData = {
    paymentHistory: {
      totalPayments: 12,
      onTimePayments: 11,
      latePayments: 1,
      missedPayments: 0,
    },
    circleCompletion: {
      circlesCompleted: 2,
      circlesJoined: 3,
    },
    defiActivity: {
      score: 150, // out of 200
      activityTypes: ["lending", "staking", "liquidity_provision"],
    },
    socialProofs: {
      verified: 3,
      total: 4,
      types: ["twitter", "discord", "github"],
    },
  };

  console.log("Input trust data:");
  console.log("  Payment Success Rate: 91.6% (11/12)");
  console.log("  Circles Completed: 2/3 (66.6%)");
  console.log("  DeFi Activity Score: 150/200");
  console.log("  Social Proofs Verified: 3/4");
  console.log();

  console.log("Encrypting trust score calculation with Arcium MPC...");
  const encryptedScore = await client.encryptTrustScore(trustData);
  console.log("✅ Trust score encrypted");
  console.log("  Compute Key:", encryptedScore.computeKey.toBase58());
  console.log("  Privacy Level:", encryptedScore.privacyLevel);
  console.log("  Timestamp:", new Date(encryptedScore.timestamp).toISOString());
  console.log("\n⚠️  Raw input data remains encrypted. Only final score is revealed.");
  console.log();

  // Decrypt to show the result (in production, this would be restricted)
  const finalScore = await arciumService.decryptTrustScore(encryptedScore);
  console.log("Decrypted Final Score:", finalScore);
  console.log();

  // ============================================================================
  // DEMO 2: Private Circle Creation
  // ============================================================================
  console.log("================================================");
  console.log("3. Private Circle Creation");
  console.log("================================================");

  const creator = Keypair.generate();

  // Try each privacy mode
  const privacyModes: Array<'public' | 'anonymous' | 'fully_encrypted'> = [
    'public',
    'anonymous',
    'fully_encrypted'
  ];

  for (const mode of privacyModes) {
    console.log(`\nCreating ${mode.toUpperCase()} circle...`);

    const recommendation = arciumService.getRecommendedPrivacyLevel(
      10, // circle size
      'lending' // purpose
    );

    console.log(`Recommended privacy level for lending circle: ${recommendation}`);

    const privacySettings = await arciumService.setupCirclePrivacy(
      creator.publicKey,
      mode === 'public' ? 0 : mode === 'anonymous' ? 1 : 2
    );

    console.log("Privacy Settings:");
    console.log("  Mode:", privacySettings.privacyMode);
    console.log("  Anonymize Members:", privacySettings.anonymizeMemberIds);
    console.log("  Encrypt Amounts:", privacySettings.encryptAmounts);
    console.log("  Encrypt History:", privacySettings.encryptPaymentHistory);
    console.log("  Allow Public Stats:", privacySettings.allowPublicStats);
  }
  console.log();

  // ============================================================================
  // DEMO 3: Anonymous Member Participation
  // ============================================================================
  console.log("================================================");
  console.log("4. Anonymous Member Participation");
  console.log("================================================");

  const members = [
    { wallet: Keypair.generate().publicKey, stake: 1000 },
    { wallet: Keypair.generate().publicKey, stake: 1500 },
    { wallet: Keypair.generate().publicKey, stake: 2000 },
  ];

  console.log("Anonymizing circle members...\n");

  for (let i = 0; i < members.length; i++) {
    const encrypted = await client.anonymizeMember(
      members[i].wallet,
      i + 1,
      members[i].stake
    );

    console.log(`${encrypted.memberId}:`);
    console.log(`  Real Address: ${members[i].wallet.toBase58()}`);
    console.log(`  Encrypted Address: [HIDDEN - ${encrypted.encryptedWalletAddress.length} bytes]`);
    console.log(`  Stake Amount: [HIDDEN]`);
    console.log(`  Payment Status: ${encrypted.publicPaymentStatus ? '✅ Current' : '⚠️  Behind'}`);
    console.log();
  }

  console.log("✅ All member identities encrypted");
  console.log("⚠️  Only payment status is publicly visible\n");

  // ============================================================================
  // DEMO 4: Private Borrowing
  // ============================================================================
  console.log("================================================");
  console.log("5. Private Borrowing with Encrypted Terms");
  console.log("================================================");

  const borrower = Keypair.generate();
  const loanData = {
    amount: 5000,
    termMonths: 12,
    interestRate: 8.5,
    collateralAmount: 6000,
    borrower: borrower.publicKey,
  };

  console.log("Loan Request (before encryption):");
  console.log(`  Borrower: ${loanData.borrower.toBase58()}`);
  console.log(`  Amount: $${loanData.amount}`);
  console.log(`  Term: ${loanData.termMonths} months`);
  console.log(`  Interest Rate: ${loanData.interestRate}%`);
  console.log(`  Collateral: $${loanData.collateralAmount}`);
  console.log();

  console.log("Encrypting loan terms...");
  const encryptedLoan = await client.createPrivateLoan(loanData);
  console.log("✅ Loan terms encrypted");
  console.log("  Session Key:", encryptedLoan.arciumSessionKey.toBase58());
  console.log("  Encrypted Amount: [HIDDEN]");
  console.log("  Encrypted Terms: [HIDDEN]");
  console.log("\n⚠️  Other circle members cannot see loan amount or terms\n");

  // Decrypt (only authorized parties can do this)
  console.log("Decrypting loan terms (authorized access only)...");
  const decryptedLoan = await arciumService.decryptLoanTerms(
    encryptedLoan,
    encryptedLoan.arciumSessionKey
  );
  console.log("Decrypted Loan Data:");
  console.log(`  Amount: $${decryptedLoan.amount}`);
  console.log(`  Term: ${decryptedLoan.termMonths} months`);
  console.log(`  Interest: ${decryptedLoan.interestRate}%`);
  console.log();

  // ============================================================================
  // DEMO 5: Sealed Bid Auctions
  // ============================================================================
  console.log("================================================");
  console.log("6. Sealed Bid Auctions");
  console.log("================================================");

  const circleId = "circle_" + Date.now();
  const bidders = [
    { wallet: Keypair.generate().publicKey, amount: 1200 },
    { wallet: Keypair.generate().publicKey, amount: 1500 },
    { wallet: Keypair.generate().publicKey, amount: 1350 },
  ];

  console.log(`Auction for Circle: ${circleId}`);
  console.log("Placing sealed bids...\n");

  const sealedBids = [];

  for (let i = 0; i < bidders.length; i++) {
    const bidData = {
      amount: bidders[i].amount,
      circleId,
      bidder: bidders[i].wallet,
      timestamp: Date.now(),
    };

    const sealedBid = await client.placeSealedBid(bidData);
    sealedBids.push(sealedBid);

    console.log(`Bidder ${i + 1}:`);
    console.log(`  Wallet: ${bidders[i].wallet.toBase58()}`);
    console.log(`  Sealed Bid: [ENCRYPTED]`);
    console.log(`  Commitment Hash: ${sealedBid.commitmentHash}`);
    console.log(`  Real Amount: $${bidders[i].amount} (hidden until reveal)`);
    console.log();
  }

  console.log("✅ All bids sealed and encrypted");
  console.log("⚠️  Bid amounts remain secret until auction ends\n");

  console.log("Revealing all bids after auction ends...");
  const revealedBids = await arciumService.revealAllBids(sealedBids);

  console.log("\n📊 Auction Results:");
  revealedBids.forEach((bid, i) => {
    console.log(`  ${i + 1}. $${bid.amount} - ${bid.bidder.toBase58().slice(0, 8)}...`);
  });

  const winner = revealedBids[0];
  console.log(`\n🏆 Winner: $${winner.amount}`);
  console.log();

  // ============================================================================
  // DEMO 6: Privacy Cost Estimation
  // ============================================================================
  console.log("================================================");
  console.log("7. Privacy Operations Cost Estimation");
  console.log("================================================");

  const operations = [
    'encrypt_trust_score',
    'encrypt_loan',
    'seal_bid',
    'reveal_bid',
    'anonymize_member'
  ];

  console.log("Estimated gas costs for privacy operations:\n");

  operations.forEach(op => {
    const cost = arciumService.estimatePrivacyGasCost(op);
    console.log(`  ${op.padEnd(25)}: ${cost.toLocaleString()} gas units`);
  });

  console.log();

  // ============================================================================
  // Summary
  // ============================================================================
  console.log("================================================");
  console.log("✅ ARCIUM PRIVACY DEMO COMPLETE");
  console.log("================================================");
  console.log("\nKey Privacy Features Demonstrated:");
  console.log("  ✅ Encrypted trust score calculations (MPC)");
  console.log("  ✅ Anonymous circle participation");
  console.log("  ✅ Private borrowing with encrypted terms");
  console.log("  ✅ Sealed bid auctions");
  console.log("  ✅ Privacy mode recommendations");
  console.log("  ✅ Gas cost estimation");
  console.log("\nPrivacy Benefits:");
  console.log("  🔒 Sensitive financial data stays encrypted");
  console.log("  🔒 Member identities can be hidden");
  console.log("  🔒 Bid amounts secret until reveal");
  console.log("  🔒 Loan terms only visible to authorized parties");
  console.log("\n⚠️  Note: Currently using mock implementation.");
  console.log("   Replace with actual Arcium SDK when available.");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
