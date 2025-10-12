# Halo Protocol - Developer Onboarding Guide

Welcome! This guide will get you from zero to deploying your first Halo Protocol circle in under 30 minutes.

## 🎯 What You'll Learn

By the end of this guide, you'll be able to:
- Deploy Halo Protocol to Solana devnet
- Create your first ROSCA circle
- Enable members to join and contribute
- Set up automated payouts with Switchboard
- Deploy a live dashboard to Vercel
- Integrate governance voting

Perfect for hackathons, demos, and production deployment!

---

## ⚡ Quick Setup (5 minutes)

### Prerequisites

```bash
# Check your installations
node --version    # Need v16+
npm --version     # Need v8+
solana --version  # Need v1.16+
anchor --version  # Need v0.28+
```

Don't have these installed? Follow the [Installation Guide](#installation-guide) below.

### Clone and Install

```bash
# Clone repository
git clone https://github.com/kunal-drall/halo.git
cd halo

# Install dependencies
npm install

# Install frontend dependencies
cd frontend && npm install --legacy-peer-deps && cd ..

# Run setup script
./scripts/setup-demo.sh
```

**Done!** ✅ You now have Halo Protocol ready to deploy.

---

## 🚀 Deployment Walkthrough (10 minutes)

### Step 1: Deploy Anchor Program to Devnet

```bash
# Build the program
anchor build

# Deploy to devnet
./scripts/deploy-anchor.sh devnet

# ✅ You'll see:
# Program ID: <your_program_id>
# Explorer: https://explorer.solana.com/address/<program_id>?cluster=devnet
```

**Save your Program ID!** You'll need it for the frontend.

### Step 2: Configure Frontend

```bash
cd frontend

# Create environment file
cp .env.example .env

# Edit .env with your values:
nano .env  # or use your preferred editor
```

**Required values in `.env`:**

```bash
NEXT_PUBLIC_PROGRAM_ID=<your_program_id_from_step_1>
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Optional but recommended:
NEXT_PUBLIC_PRIVY_APP_ID=<get_from_privy.io>
NEXT_PUBLIC_SOLEND_MARKET=4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY
```

### Step 3: Deploy Frontend to Vercel

```bash
cd ..  # Back to root

# Deploy (will prompt for Vercel login)
./scripts/deploy-vercel.sh

# ✅ You'll get a live URL:
# https://your-app.vercel.app
```

**Your dashboard is now live!** 🎉

### Step 4: Setup Switchboard (Optional)

```bash
./scripts/setup-switchboard.sh devnet <your_program_id>

# Follow the instructions to:
# 1. Visit app.switchboard.xyz
# 2. Create functions for automation
# 3. Fund and enable them
```

---

## 💡 Your First Circle (5 minutes)

### Using the Demo Script

The fastest way to create and test a circle:

```bash
# Run the interactive demo
npm run demo

# This will:
# ✅ Create a 5-member circle
# ✅ Simulate contributions
# ✅ Demonstrate payouts
# ✅ Show governance voting
```

### Using Code

Create `my-first-circle.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount } from "@solana/spl-token";

async function createMyCircle() {
  // Connect to devnet
  const connection = new Connection("https://api.devnet.solana.com");
  const creator = Keypair.generate();
  
  // Get SOL for transactions
  console.log("Requesting SOL...");
  const airdrop = await connection.requestAirdrop(creator.publicKey, 2e9);
  await connection.confirmTransaction(airdrop);
  
  // Create USDC-like token
  console.log("Creating token...");
  const mint = await createMint(
    connection,
    creator,
    creator.publicKey,
    null,
    6  // 6 decimals like USDC
  );
  
  // Load your program
  const programId = new PublicKey("YOUR_PROGRAM_ID");
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(creator),
    { commitment: "confirmed" }
  );
  const program = new anchor.Program(
    require("./target/idl/halo_protocol.json"),
    programId,
    provider
  );
  
  // Generate circle address
  const timestamp = Date.now();
  const [circle] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("circle"),
      creator.publicKey.toBuffer(),
      Buffer.from(new anchor.BN(timestamp).toArray("le", 8))
    ],
    programId
  );
  
  const [escrow] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), circle.toBuffer()],
    programId
  );
  
  // Create escrow token account
  const escrowTokenAccount = await createAccount(
    connection,
    creator,
    mint,
    escrow
  );
  
  // Initialize circle
  console.log("Creating circle...");
  await program.methods
    .initializeCircle(
      new anchor.BN(10_000_000),  // 10 USDC per month
      3,                          // 3 months duration
      5,                          // max 5 members
      1000                        // 10% penalty
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
  
  console.log("✅ Circle created!");
  console.log(`   Address: ${circle.toString()}`);
  console.log(`   View on Explorer: https://explorer.solana.com/address/${circle}?cluster=devnet`);
  
  return { circle, escrow, mint, creator };
}

createMyCircle().catch(console.error);
```

Run it:

```bash
npx ts-node my-first-circle.ts
```

---

## 🎓 Example Use Cases

### 1. Member Joining

```typescript
async function joinCircle(
  program: Program,
  circle: PublicKey,
  member: Keypair,
  mint: PublicKey
) {
  const [memberAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("member"), circle.toBuffer(), member.publicKey.toBuffer()],
    program.programId
  );
  
  const [trustScore] = PublicKey.findProgramAddressSync(
    [Buffer.from("trust_score"), member.publicKey.toBuffer()],
    program.programId
  );
  
  // Create member's token account
  const memberTokenAccount = await createAccount(
    connection,
    member,
    mint,
    member.publicKey
  );
  
  // Join with 20 USDC stake (2x contribution)
  await program.methods
    .joinCircle(new BN(20_000_000))
    .accounts({
      circle,
      member: memberAccount,
      escrow: escrowAccount,
      memberAuthority: member.publicKey,
      trustScore,
      memberTokenAccount,
      escrowTokenAccount,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([member])
    .rpc();
  
  console.log("✅ Joined circle!");
}
```

### 2. Monthly Contribution

```typescript
async function contribute(
  program: Program,
  circle: PublicKey,
  member: Keypair
) {
  const [memberAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("member"), circle.toBuffer(), member.publicKey.toBuffer()],
    program.programId
  );
  
  // Contribute 10 USDC
  await program.methods
    .contribute(new BN(10_000_000))
    .accounts({
      circle,
      member: memberAccount,
      escrow,
      memberAuthority: member.publicKey,
      trustScore,
      memberTokenAccount,
      escrowTokenAccount,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([member])
    .rpc();
  
  console.log("✅ Contribution made!");
}
```

### 3. Borrowing from Solend

```typescript
import { SolendService } from './app/solend-service';

async function borrowAgainstStake() {
  const solend = new SolendService();
  await solend.initialize(connection, 'devnet');
  
  // Borrow 5 USDC against 20 USDC collateral
  const signature = await solend.borrowAgainstCollateral(
    usdcMint,      // borrow asset
    usdcMint,      // collateral asset
    5_000_000,     // borrow amount
    borrower
  );
  
  console.log("✅ Borrowed from Solend:", signature);
}
```

### 4. Creating Governance Proposal

```typescript
async function createProposal(
  program: Program,
  circle: PublicKey,
  proposer: Keypair
) {
  const proposalKeypair = Keypair.generate();
  const [proposal] = PublicKey.findProgramAddressSync(
    [Buffer.from("proposal"), circle.toBuffer(), proposalKeypair.publicKey.toBuffer()],
    program.programId
  );
  
  await program.methods
    .createProposal(
      "Extend Circle Duration",
      "Add 2 more months to the circle",
      1,  // CircleParameter type
      48, // 48 hours voting
      new BN(3_000_000), // 3 USDC threshold
      null
    )
    .accounts({
      proposal,
      circle,
      proposer: proposer.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([proposer, proposalKeypair])
    .rpc();
  
  console.log("✅ Proposal created!");
  return proposal;
}
```

### 5. Voting on Proposal

```typescript
async function vote(
  program: Program,
  proposal: PublicKey,
  voter: Keypair,
  support: boolean
) {
  const [voteAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), proposal.toBuffer(), voter.publicKey.toBuffer()],
    program.programId
  );
  
  // Vote with 4 USDC power (quadratic weight = √4 = 2)
  await program.methods
    .castVote(support, new BN(4_000_000))
    .accounts({
      proposal,
      vote: voteAccount,
      voter: voter.publicKey,
      voterTokenAccount,
      systemProgram: SystemProgram.programId,
    })
    .signers([voter])
    .rpc();
  
  console.log(`✅ Voted ${support ? "YES" : "NO"}!`);
}
```

---

## 🎪 Hackathon Quick Start

### 30-Minute Demo Flow

```bash
# 1. Setup (5 min)
git clone https://github.com/kunal-drall/halo.git
cd halo && npm install
./scripts/setup-demo.sh

# 2. Deploy (10 min)
./scripts/deploy-anchor.sh devnet
./scripts/deploy-vercel.sh

# 3. Create Demo (5 min)
npm run demo

# 4. Show Dashboard (5 min)
# Open your Vercel URL in browser
# Walk through live features

# 5. Q&A (5 min)
# Answer questions using docs
```

### Presentation Tips

**Opening (1 min):**
> "Halo Protocol brings ROSCAs to Solana with yield generation and automation."

**Demo (3 min):**
1. Show live dashboard with 5-member circle
2. Point out trust scores and governance
3. Highlight Solend integration earning 5% APY

**Technical Deep Dive (3 min):**
1. Show code for circle creation
2. Explain quadratic voting
3. Demo Switchboard automation

**Close (1 min):**
> "Fully open source, production-ready, deployed on devnet. Try it now!"

---

## 🛠️ Development Workflow

### Local Development

```bash
# Terminal 1: Start local validator
solana-test-validator

# Terminal 2: Deploy and test
anchor build
anchor deploy --provider.cluster localnet
anchor test

# Terminal 3: Frontend dev server
cd frontend
npm run dev
# Visit http://localhost:3000
```

### Testing Changes

```bash
# Run all tests
npm test

# Run specific test
anchor test -- --grep "initialize circle"

# Test with logs
solana logs <program_id>
```

### Debug Tips

```typescript
// Add detailed logging
console.log("Circle:", circle.toString());
console.log("Member:", memberAccount.toString());

// Fetch and display account data
const circleData = await program.account.circle.fetch(circle);
console.log("Circle data:", circleData);

// Simulate before sending
const simulation = await connection.simulateTransaction(tx);
console.log("Simulation:", simulation);
```

---

## 📚 Next Steps

### Enhance Your Project

1. **Add More Features:**
   - Multi-token support (USDC, SOL, etc.)
   - Insurance pools
   - Credit scoring
   - Mobile app

2. **Improve UX:**
   - Add notifications (Discord, Telegram)
   - Create analytics dashboard
   - Build mobile-responsive design

3. **Scale Up:**
   - Deploy to mainnet
   - Implement rate limiting
   - Add monitoring and alerts
   - Set up CI/CD pipeline

### Resources

**Documentation:**
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Complete API reference
- [DEMO_ARCHITECTURE.md](./DEMO_ARCHITECTURE.md) - System design
- [GOVERNANCE_AUCTION_MODULE.md](./GOVERNANCE_AUCTION_MODULE.md) - Governance details

**Examples:**
- `app/demo-5-member-circle.ts` - Full demo
- `app/simulate-contributions.ts` - Contribution patterns
- `app/simulate-governance.ts` - Governance flows

**Community:**
- GitHub Issues - Report bugs
- Discussions - Ask questions
- Pull Requests - Contribute

---

## 🐛 Troubleshooting

### "Program not found" error

```bash
# Solution: Deploy the program first
anchor build
anchor deploy --provider.cluster devnet
```

### "Insufficient funds" error

```bash
# Solution: Request airdrop
solana airdrop 2 <your-wallet-address> --url devnet
```

### Frontend build fails

```bash
# Solution: Install with legacy peer deps
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Privy not working

```bash
# Solution: Get Privy App ID
# 1. Visit https://privy.io
# 2. Create app
# 3. Copy App ID to .env
```

### Switchboard automation not triggering

```bash
# Solution: Check function status
# 1. Visit https://app.switchboard.xyz
# 2. Verify function is enabled
# 3. Check wallet is funded
# 4. Review execution logs
```

---

## ✅ Deployment Checklist

Before going live:

- [ ] Program deployed to devnet/mainnet
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Privy authentication working
- [ ] Switchboard functions created
- [ ] Test circle created successfully
- [ ] Members can join and contribute
- [ ] Payouts working correctly
- [ ] Governance voting functional
- [ ] Documentation reviewed
- [ ] Demo prepared (if needed)

---

## 🎉 You're Ready!

You now have everything you need to:
- Deploy Halo Protocol
- Create and manage circles
- Build on top of the protocol
- Demo at hackathons

**Need help?** Open an issue on GitHub!

**Happy building! 🚀**

---

## Installation Guide

### Node.js and npm

```bash
# macOS
brew install node

# Linux
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# Download from nodejs.org
```

### Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="/home/$USER/.local/share/solana/install/active_release/bin:$PATH"

# Verify
solana --version
```

### Anchor CLI

```bash
# Install Rust first
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Anchor Version Manager
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install Anchor 0.28.0
avm install 0.28.0
avm use 0.28.0

# Verify
anchor --version
```

### Vercel CLI

```bash
npm install -g vercel

# Login
vercel login
```

**All set!** Return to [Quick Setup](#-quick-setup-5-minutes)
