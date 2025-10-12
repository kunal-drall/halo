# Halo Protocol - Complete Developer Guide

Comprehensive guide for developers building with Halo Protocol on Solana.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Program Instructions](#program-instructions)
3. [Privy Integration](#privy-integration)
4. [Solend SDK Usage](#solend-sdk-usage)
5. [Governance Flows](#governance-flows)
6. [Code Examples](#code-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/kunal-drall/halo.git
cd halo

# Install dependencies
npm install

# Build the program
anchor build

# Run tests
anchor test
```

### Environment Setup

```bash
# Frontend environment
cp frontend/.env.example frontend/.env

# Edit frontend/.env with your values:
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<your_program_id>
NEXT_PUBLIC_PRIVY_APP_ID=<your_privy_app_id>
```

### Deploy to Devnet

```bash
# Deploy Anchor program
./scripts/deploy-anchor.sh devnet

# Deploy frontend to Vercel
./scripts/deploy-vercel.sh

# Setup Switchboard automation
./scripts/setup-switchboard.sh devnet <program_id>
```

---

## Program Instructions

### 1. Initialize Circle

Creates a new ROSCA circle with specified parameters.

**Parameters:**
- `contribution_amount: u64` - Monthly contribution in lamports (e.g., 10_000_000 = 10 USDC with 6 decimals)
- `duration_months: u8` - Circle duration (1-24 months)
- `max_members: u8` - Maximum members (1-20)
- `penalty_rate: u16` - Penalty rate in basis points (1% = 100, max 10000 = 100%)

**TypeScript Example:**

```typescript
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";

const creator = Keypair.generate();
const timestamp = Date.now();

// Generate circle PDA
const [circleAccount] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("circle"),
    creator.publicKey.toBuffer(),
    Buffer.from(new anchor.BN(timestamp).toArray("le", 8)),
  ],
  program.programId
);

// Generate escrow PDA
const [escrowAccount] = PublicKey.findProgramAddressSync(
  [Buffer.from("escrow"), circleAccount.toBuffer()],
  program.programId
);

// Initialize circle
await program.methods
  .initializeCircle(
    new anchor.BN(10_000_000), // 10 USDC
    5,                         // 5 months
    5,                         // max 5 members
    1000                       // 10% penalty
  )
  .accounts({
    circle: circleAccount,
    escrow: escrowAccount,
    creator: creator.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .signers([creator])
  .rpc();

console.log("Circle created:", circleAccount.toString());
```

**Rust Validation:**

```rust
// The program validates:
require!(duration_months > 0 && duration_months <= 24, HaloError::InvalidDuration);
require!(max_members > 0 && max_members <= 20, HaloError::InvalidMaxMembers);
require!(contribution_amount > 0, HaloError::InvalidContributionAmount);
require!(penalty_rate <= 10000, HaloError::InvalidPenaltyRate);
```

### 2. Join Circle

Allows a member to join an existing circle with a stake.

**Parameters:**
- `stake_amount: u64` - Stake to deposit (must be >= contribution_amount)

**TypeScript Example:**

```typescript
const member = Keypair.generate();

// Generate member PDA
const [memberAccount] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("member"),
    circleAccount.toBuffer(),
    member.publicKey.toBuffer(),
  ],
  program.programId
);

// Generate trust score PDA
const [trustScoreAccount] = PublicKey.findProgramAddressSync(
  [Buffer.from("trust_score"), member.publicKey.toBuffer()],
  program.programId
);

// Create member token account
const memberTokenAccount = await createAccount(
  connection,
  member,
  mintAddress,
  member.publicKey
);

// Join circle
await program.methods
  .joinCircle(new anchor.BN(20_000_000)) // 20 USDC stake (2x contribution)
  .accounts({
    circle: circleAccount,
    member: memberAccount,
    escrow: escrowAccount,
    memberAuthority: member.publicKey,
    trustScore: trustScoreAccount,
    memberTokenAccount: memberTokenAccount,
    escrowTokenAccount: escrowTokenAccount,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .signers([member])
  .rpc();

console.log("Member joined:", memberAccount.toString());
```

### 3. Contribute

Make a monthly contribution to the circle.

**Parameters:**
- `amount: u64` - Contribution amount (must equal circle's contribution_amount)

**TypeScript Example:**

```typescript
await program.methods
  .contribute(new anchor.BN(10_000_000)) // 10 USDC
  .accounts({
    circle: circleAccount,
    member: memberAccount,
    escrow: escrowAccount,
    memberAuthority: member.publicKey,
    trustScore: trustScoreAccount,
    memberTokenAccount: memberTokenAccount,
    escrowTokenAccount: escrowTokenAccount,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .signers([member])
  .rpc();

console.log("Contribution made successfully");
```

### 4. Distribute Pot

Distribute the monthly pot to a designated member.

**TypeScript Example:**

```typescript
await program.methods
  .distributePot()
  .accounts({
    circle: circleAccount,
    recipientMember: recipientMemberAccount,
    escrow: escrowAccount,
    authority: creator.publicKey,
    recipientTokenAccount: recipientTokenAccount,
    escrowTokenAccount: escrowTokenAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .signers([creator])
  .rpc();

console.log("Payout distributed to recipient");
```

### 5. Create Governance Proposal

Create a proposal for circle governance.

**Parameters:**
- `title: String` - Proposal title (max 200 chars)
- `description: String` - Proposal description (max 1000 chars)
- `proposal_type: u8` - Type: 0 = InterestRateChange, 1 = CircleParameter, 2 = Emergency
- `voting_duration_hours: u16` - Voting period in hours (max 168 = 7 days)
- `execution_threshold: u64` - Minimum votes needed
- `new_interest_rate: Option<u16>` - New rate if type is InterestRateChange

**TypeScript Example:**

```typescript
const proposalKeypair = Keypair.generate();

const [proposalAccount] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("proposal"),
    circleAccount.toBuffer(),
    proposalKeypair.publicKey.toBuffer(),
  ],
  program.programId
);

await program.methods
  .createProposal(
    "Reduce Penalty Rate",
    "Reduce penalty rate from 10% to 5% to encourage participation",
    0, // InterestRateChange
    24, // 24 hours
    new anchor.BN(1_000_000), // 1 USDC threshold
    500 // 5% new rate
  )
  .accounts({
    proposal: proposalAccount,
    circle: circleAccount,
    proposer: member.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .signers([member, proposalKeypair])
  .rpc();

console.log("Proposal created:", proposalAccount.toString());
```

### 6. Cast Vote

Vote on a governance proposal using quadratic voting.

**Parameters:**
- `support: bool` - true for yes, false for no
- `voting_power: u64` - Amount of tokens to use for voting

**TypeScript Example:**

```typescript
const [voteAccount] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("vote"),
    proposalAccount.toBuffer(),
    voter.publicKey.toBuffer(),
  ],
  program.programId
);

await program.methods
  .castVote(
    true, // vote yes
    new anchor.BN(4_000_000) // 4 tokens voting power -> √4 = 2 weight
  )
  .accounts({
    proposal: proposalAccount,
    vote: voteAccount,
    voter: voter.publicKey,
    voterTokenAccount: voterTokenAccount,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .signers([voter])
  .rpc();

console.log("Vote cast successfully");
```

---

## Privy Integration

### Setup

1. **Create Privy Account:**
   - Visit [privy.io](https://privy.io)
   - Create a new app
   - Get your App ID

2. **Configure Environment:**

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

3. **Update Providers:**

```typescript
// frontend/src/app/providers.tsx
import { PrivyProvider } from '@privy-io/react-auth';
import { solana, solanaDevnet } from '@privy-io/react-auth/solana';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#8B5CF6',
        },
        loginMethods: ['wallet', 'email', 'google'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        supportedChains: NETWORK === 'devnet' ? [solanaDevnet] : [solana],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
```

### Using Privy Hooks

```typescript
'use client'

import { usePrivy } from '@privy-io/react-auth';

export default function MyComponent() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return (
      <button onClick={login}>
        Connect Wallet
      </button>
    );
  }

  return (
    <div>
      <p>Welcome, {user?.wallet?.address}</p>
      <button onClick={logout}>Disconnect</button>
    </div>
  );
}
```

### Advanced Features

**Custom Login UI:**

```typescript
import { usePrivy } from '@privy-io/react-auth';

const { createWallet, linkEmail, linkWallet } = usePrivy();

// Create embedded wallet
const wallet = await createWallet();

// Link email
await linkEmail('user@example.com');

// Link external wallet
await linkWallet();
```

---

## Solend SDK Usage

### Installation

```bash
npm install @solendprotocol/solend-sdk @solendprotocol/common
```

### Initialize Solend Service

```typescript
import { SolendMarket, SolendReserve } from '@solendprotocol/solend-sdk';

class SolendService {
  private market: SolendMarket | null = null;

  async initialize(connection: Connection, environment: 'devnet' | 'production') {
    this.market = await SolendMarket.initialize(
      connection,
      environment,
      new PublicKey('4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY') // Main market
    );
    
    await this.market.loadReserves();
    console.log('Solend market initialized');
  }

  async depositFunds(
    tokenMint: PublicKey,
    amount: number,
    ownerTokenAccount: PublicKey,
    owner: Keypair
  ) {
    if (!this.market) throw new Error('Market not initialized');

    const reserve = this.market.reserves.find(
      r => r.config.liquidityToken.mint === tokenMint.toString()
    );

    if (!reserve) throw new Error('Reserve not found');

    const depositIx = await reserve.depositReserveLiquidityInstruction(
      amount,
      ownerTokenAccount,
      owner.publicKey
    );

    // Create and send transaction
    const tx = new Transaction().add(depositIx);
    const signature = await connection.sendTransaction(tx, [owner]);
    await connection.confirmTransaction(signature);

    return signature;
  }

  async borrowFunds(
    borrowMint: PublicKey,
    collateralMint: PublicKey,
    borrowAmount: number,
    borrower: Keypair
  ) {
    if (!this.market) throw new Error('Market not initialized');

    const borrowReserve = this.market.reserves.find(
      r => r.config.liquidityToken.mint === borrowMint.toString()
    );

    const borrowIx = await borrowReserve.borrowObligationLiquidityInstruction(
      borrowAmount,
      borrower.publicKey,
      borrower.publicKey
    );

    const tx = new Transaction().add(borrowIx);
    const signature = await connection.sendTransaction(tx, [borrower]);

    return signature;
  }

  async fetchMarketYields() {
    if (!this.market) throw new Error('Market not initialized');

    const reserves = this.market.reserves.map(reserve => ({
      symbol: reserve.config.liquidityToken.symbol,
      mint: reserve.config.liquidityToken.mint,
      depositApy: reserve.stats?.depositInterestAPY || 0,
      borrowApy: reserve.stats?.borrowInterestAPY || 0,
      utilizationRate: reserve.stats?.utilizationRate || 0,
      totalDeposits: reserve.stats?.totalDepositsWad || 0,
      totalBorrows: reserve.stats?.totalBorrowsWad || 0,
    }));

    return reserves;
  }
}
```

### Example: Deposit Circle Funds

```typescript
const solendService = new SolendService();
await solendService.initialize(connection, 'devnet');

// Deposit circle escrow funds to earn yield
const signature = await solendService.depositFunds(
  usdcMint,
  50_000_000, // 50 USDC
  escrowTokenAccount,
  escrowAuthority
);

console.log('Funds deposited to Solend:', signature);

// Fetch current yields
const yields = await solendService.fetchMarketYields();
console.log('USDC APY:', yields.find(r => r.symbol === 'USDC')?.depositApy);
```

---

## Governance Flows

### Complete Proposal Lifecycle

```typescript
// 1. Create Proposal
const proposal = await createProposal({
  title: "Increase Circle Duration",
  description: "Extend circle by 2 months",
  type: 1, // CircleParameter
  votingHours: 48,
  threshold: new BN(5_000_000),
});

// 2. Members Vote (Quadratic)
const votes = [
  { member: alice, power: 9_000_000, support: true },  // √9 = 3
  { member: bob, power: 4_000_000, support: true },    // √4 = 2
  { member: charlie, power: 1_000_000, support: false }, // √1 = 1
];

for (const vote of votes) {
  await castVote(proposal, vote.member, vote.support, vote.power);
}

// 3. Check Results
const proposalData = await program.account.governanceProposal.fetch(proposal);
const quadraticFor = Math.sqrt(9000000) + Math.sqrt(4000000); // 3 + 2 = 5
const quadraticAgainst = Math.sqrt(1000000); // 1

console.log('Votes For:', quadraticFor);
console.log('Votes Against:', quadraticAgainst);
console.log('Result:', quadraticFor > quadraticAgainst ? 'PASSED' : 'FAILED');

// 4. Execute Proposal (if passed and voting ended)
if (proposalData.quadraticVotesFor > proposalData.quadraticVotesAgainst) {
  await program.methods
    .executeProposal()
    .accounts({
      proposal: proposal,
      circle: circleAccount,
      executor: authority.publicKey,
    })
    .signers([authority])
    .rpc();
  
  console.log('Proposal executed');
}
```

### Governance Best Practices

1. **Minimum Voting Period**: At least 24 hours for member participation
2. **Execution Threshold**: Set based on circle size (e.g., 50% of total stake)
3. **Quadratic Voting**: Prevents whale dominance (vote weight = √tokens)
4. **Proposal Types**:
   - **InterestRateChange**: Adjust penalty rates
   - **CircleParameter**: Change duration, contribution amount
   - **Emergency**: Pause/unpause circle operations

---

## Code Examples

### Complete Circle Creation Flow

```typescript
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";

async function createCompleteCircle() {
  // Setup
  const connection = new Connection("https://api.devnet.solana.com");
  const creator = Keypair.generate();
  
  // Airdrop SOL
  const airdrop = await connection.requestAirdrop(creator.publicKey, 2e9);
  await connection.confirmTransaction(airdrop);
  
  // Create token mint (USDC simulation)
  const mint = await createMint(
    connection,
    creator,
    creator.publicKey,
    null,
    6 // 6 decimals like USDC
  );
  
  // Initialize program
  const program = anchor.workspace.HaloProtocol as Program<HaloProtocol>;
  
  // Generate PDAs
  const timestamp = Date.now();
  const [circle] = PublicKey.findProgramAddressSync(
    [Buffer.from("circle"), creator.publicKey.toBuffer(), Buffer.from(new anchor.BN(timestamp).toArray("le", 8))],
    program.programId
  );
  
  const [escrow] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), circle.toBuffer()],
    program.programId
  );
  
  // Create escrow token account
  const escrowTokenAccount = await createAccount(
    connection,
    creator,
    mint,
    escrow
  );
  
  // Initialize circle
  await program.methods
    .initializeCircle(
      new anchor.BN(10_000_000), // 10 USDC
      5,                         // 5 months
      5,                         // 5 members
      1000                       // 10% penalty
    )
    .accounts({
      circle,
      escrow,
      creator: creator.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([creator])
    .rpc();
  
  console.log("✅ Circle created:", circle.toString());
  
  return { circle, escrow, escrowTokenAccount, mint, creator };
}
```

### Member Contribution Workflow

```typescript
async function memberContribution(
  program: Program<HaloProtocol>,
  connection: Connection,
  circle: PublicKey,
  member: Keypair,
  mint: PublicKey,
  escrowTokenAccount: PublicKey
) {
  // Generate member PDA
  const [memberAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("member"), circle.toBuffer(), member.publicKey.toBuffer()],
    program.programId
  );
  
  const [trustScore] = PublicKey.findProgramAddressSync(
    [Buffer.from("trust_score"), member.publicKey.toBuffer()],
    program.programId
  );
  
  // Create member token account
  const memberTokenAccount = await createAccount(
    connection,
    member,
    mint,
    member.publicKey
  );
  
  // Mint contribution amount
  await mintTo(
    connection,
    member,
    mint,
    memberTokenAccount,
    member,
    10_000_000 // 10 USDC
  );
  
  // Make contribution
  await program.methods
    .contribute(new anchor.BN(10_000_000))
    .accounts({
      circle,
      member: memberAccount,
      escrow: await program.account.circle.fetch(circle).then(c => c.escrow),
      memberAuthority: member.publicKey,
      trustScore,
      memberTokenAccount,
      escrowTokenAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([member])
    .rpc();
  
  console.log("✅ Contribution made");
  
  // Fetch updated trust score
  const trustScoreData = await program.account.trustScore.fetch(trustScore);
  console.log("Trust Score:", trustScoreData.score);
}
```

---

## Best Practices

### Security

1. **PDA Validation**: Always validate PDA derivation
2. **Authority Checks**: Verify signer permissions
3. **Amount Validation**: Check contribution amounts match circle config
4. **Reentrancy Protection**: Use single-instruction atomicity
5. **Error Handling**: Implement comprehensive error checks

### Performance

1. **Batch Operations**: Group multiple instructions when possible
2. **Account Caching**: Cache frequently accessed accounts
3. **RPC Optimization**: Use dedicated RPC nodes for production
4. **Transaction Simulation**: Test before sending to chain

### Testing

```typescript
describe("Halo Protocol", () => {
  it("should create and manage a circle", async () => {
    const result = await createCompleteCircle();
    expect(result.circle).to.exist;
    
    const circleData = await program.account.circle.fetch(result.circle);
    expect(circleData.maxMembers).to.equal(5);
  });
  
  it("should handle contributions correctly", async () => {
    const { circle, member } = await setupCircleWithMember();
    
    await memberContribution(program, connection, circle, member, mint, escrow);
    
    const memberData = await program.account.member.fetch(memberAccount);
    expect(memberData.totalContributions.toNumber()).to.equal(10_000_000);
  });
});
```

---

## Troubleshooting

### Common Issues

**Problem:** Transaction fails with "Account does not exist"
```
Solution: Ensure all PDAs are derived correctly and accounts are initialized
```

**Problem:** "Invalid authority" error
```
Solution: Verify the signer matches the expected authority for the operation
```

**Problem:** Privy login not working
```
Solution: Check NEXT_PUBLIC_PRIVY_APP_ID is set correctly in environment
```

**Problem:** Solend deposit fails
```
Solution: Ensure reserve exists for the token and sufficient balance
```

### Debug Tools

```bash
# View program logs
solana logs <program_id>

# Check account data
solana account <account_address>

# View transaction details
solana confirm -v <transaction_signature>

# Check program deployment
solana program show <program_id>
```

### Support Resources

- **Discord**: [Solana Discord](https://discord.gg/solana)
- **Docs**: [Anchor Documentation](https://anchor-lang.com)
- **Privy**: [Privy Docs](https://docs.privy.io)
- **Solend**: [Solend Docs](https://docs.solend.fi)

---

## Additional Resources

### API Reference

Complete API documentation is available in:
- `GOVERNANCE_AUCTION_MODULE.md` - Governance system
- `TRUST_SCORING.md` - Trust score calculations
- `SOLEND_INTEGRATION.md` - Solend integration details
- `REVENUE_MODULE.md` - Fee structures

### Example Projects

- `app/demo-5-member-circle.ts` - Complete demo
- `app/simulate-contributions.ts` - Contribution simulation
- `app/simulate-governance.ts` - Governance simulation

### Community

- GitHub: [github.com/kunal-drall/halo](https://github.com/kunal-drall/halo)
- Issues: Report bugs and request features

---

**Happy Building! 🚀**

For questions or support, please open an issue on GitHub.
