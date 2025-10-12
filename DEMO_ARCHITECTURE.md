# Halo Protocol Demo - Architecture & Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HALO PROTOCOL DEMO                          │
│                    Solana Devnet Implementation                     │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐
│   Frontend Dashboard       │
│   (Next.js + Privy)        │
│                            │
│  ┌──────────────────────┐  │
│  │  Live Dashboard      │  │
│  │  - Circle Overview   │  │
│  │  - Trust Scores      │  │
│  │  - Governance Panel  │  │
│  │  - Payout Progress   │  │
│  │  - Solend Stats      │  │
│  └──────────────────────┘  │
└────────────┬───────────────┘
             │
             │ WebSocket / Polling
             │ (10s refresh)
             ↓
┌────────────────────────────┐
│   Demo Scripts Layer       │
│   (TypeScript CLI)         │
│                            │
│  ┌──────────────────────┐  │
│  │ demo-5-member        │  │
│  │ simulate-*           │  │
│  │ run-full-demo        │  │
│  └──────────────────────┘  │
└────────────┬───────────────┘
             │
             │ RPC Calls
             │
             ↓
┌────────────────────────────┐
│   Solana Devnet            │
│                            │
│  ┌──────────────────────┐  │
│  │ Halo Protocol        │  │
│  │ Smart Contract       │  │
│  │                      │  │
│  │ - Circles            │  │
│  │ - Members            │  │
│  │ - Escrows            │  │
│  │ - Trust Scores       │  │
│  │ - Governance         │  │
│  └──────────────────────┘  │
└────────────┬───────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌──────────┐    ┌──────────────┐
│ Solend   │    │ Switchboard  │
│ Protocol │    │ Automation   │
│          │    │              │
│ - Yield  │    │ - Triggers   │
│ - APY    │    │ - Schedule   │
└──────────┘    └──────────────┘
```

## 🔄 Demo Flow Diagram

```
START
  │
  ├─► 1. SETUP PHASE
  │   │
  │   ├─► Connect to Solana Devnet
  │   ├─► Generate/Load Wallet
  │   ├─► Request SOL Airdrop
  │   └─► Create Mock USDC Token
  │
  ├─► 2. CIRCLE INITIALIZATION
  │   │
  │   ├─► Initialize Circle Account
  │   │   ├─ Contribution: 10 USDC
  │   │   ├─ Duration: 5 months
  │   │   ├─ Max Members: 5
  │   │   └─ Penalty: 10%
  │   │
  │   └─► Create Circle Escrow (PDA)
  │
  ├─► 3. MEMBER ONBOARDING
  │   │
  │   ├─► For each member (Alice, Bob, Charlie, Diana, Eve):
  │   │   │
  │   │   ├─► Generate Member Keypair
  │   │   ├─► Request SOL Airdrop
  │   │   ├─► Create Token Account
  │   │   ├─► Mint 20 USDC (stake)
  │   │   ├─► Initialize Trust Score
  │   │   └─► Join Circle
  │   │
  │   └─► All 5 members joined ✓
  │
  ├─► 4. MONTH 1 - CONTRIBUTIONS
  │   │
  │   ├─► For each member:
  │   │   ├─► Mint 10 USDC
  │   │   ├─► Contribute to Circle
  │   │   └─► Update Trust Score
  │   │
  │   └─► Total in Escrow: 50 USDC
  │
  ├─► 5. SOLEND INTEGRATION
  │   │
  │   ├─► Deposit 50 USDC to Solend
  │   ├─► Start earning 5.2% APY
  │   └─► Yield accumulating...
  │
  ├─► 6. MONTH 1 - PAYOUT
  │   │
  │   ├─► Calculate Pot: 50 USDC + yield
  │   ├─► Determine Recipient: Alice (rotation)
  │   ├─► Withdraw from Solend
  │   ├─► Transfer to Alice
  │   └─► Update Trust Score: Alice +10
  │
  ├─► 7. GOVERNANCE PROPOSAL
  │   │
  │   ├─► Create Proposal
  │   │   ├─ Type: Interest Rate Change
  │   │   ├─ Title: "Reduce Penalty to 5%"
  │   │   └─ Duration: 24 hours
  │   │
  │   ├─► Members Cast Votes
  │   │   ├─ Alice: YES (4 USDC → √4 = 2)
  │   │   ├─ Bob: YES (3 USDC → √3 = 1.73)
  │   │   ├─ Charlie: NO (2 USDC → √2 = 1.41)
  │   │   ├─ Diana: YES (5 USDC → √5 = 2.24)
  │   │   └─ Eve: NO (1 USDC → √1 = 1)
  │   │
  │   ├─► Tally Results
  │   │   ├─ For: 5.97
  │   │   ├─ Against: 2.41
  │   │   └─ Approval: 71%
  │   │
  │   └─► Execute Proposal ✓
  │       └─ New Penalty Rate: 5%
  │
  ├─► 8. MONTH 2 - CONTRIBUTIONS
  │   │
  │   ├─► All members contribute 10 USDC
  │   ├─► Deposit to Solend
  │   └─► Total in Escrow: 100 USDC + yield
  │
  ├─► 9. MONTH 2 - PAYOUT
  │   │
  │   ├─► Calculate Pot: 50 USDC + yield
  │   ├─► Recipient: Bob (rotation)
  │   ├─► Transfer to Bob
  │   └─► Update Trust Score: Bob +10
  │
  ├─► 10. DASHBOARD UPDATE
  │   │
  │   ├─► Circle Status
  │   │   ├─ Month: 2/5
  │   │   ├─ Members: 5/5
  │   │   ├─ Escrow: 150.43 USDC
  │   │   └─ Status: Active
  │   │
  │   ├─► Trust Scores
  │   │   ├─ Alice: 825 (Platinum) ✓
  │   │   ├─ Bob: 745 (Gold) ✓
  │   │   ├─ Charlie: 680 (Gold)
  │   │   ├─ Diana: 590 (Silver)
  │   │   └─ Eve: 520 (Silver)
  │   │
  │   ├─► Governance
  │   │   ├─ Passed: "Reduce Penalty" ✓
  │   │   └─ Active: "Extend Duration"
  │   │
  │   ├─► Payouts
  │   │   ├─ Month 1: Alice (50 USDC) ✓
  │   │   ├─ Month 2: Bob (50.43 USDC) ✓
  │   │   ├─ Month 3: Charlie (Pending)
  │   │   ├─ Month 4: Diana (Pending)
  │   │   └─ Month 5: Eve (Pending)
  │   │
  │   └─► Solend Stats
  │       ├─ APY: 5.2%
  │       ├─ Deposited: 148 USDC
  │       ├─ Yield: +2.43 USDC
  │       └─ Days: 45
  │
  └─► END
      │
      └─► Demo Summary
          ├─ Circle Value: 250 USDC
          ├─ Contributions: 100 USDC
          ├─ Payouts: 100.43 USDC
          ├─ Yield: 2.43 USDC
          ├─ Proposals: 2 (1 passed)
          └─ Avg Trust Score: 725
```

## 🎯 Component Interactions

```
┌───────────────────┐
│  User Interface   │
│  (Frontend)       │
└─────────┬─────────┘
          │
          │ User Actions:
          │ - Connect Wallet
          │ - View Dashboard
          │ - Cast Vote
          │
          ↓
┌───────────────────┐
│  Demo Scripts     │
│  (Backend)        │
└─────────┬─────────┘
          │
          │ Operations:
          │ - initializeCircle()
          │ - joinCircle()
          │ - contribute()
          │ - distributePot()
          │ - castVote()
          │
          ↓
┌───────────────────┐
│  Smart Contract   │
│  (On-chain)       │
└─────────┬─────────┘
          │
          │ State Updates:
          │ - Circle Account
          │ - Member Accounts
          │ - Escrow Account
          │ - Trust Scores
          │ - Proposals
          │
          ↓
┌───────────────────┐
│  External Systems │
│  (Solend, SB)     │
└───────────────────┘
```

## 📊 Data Flow

### Circle Creation Flow
```
Creator → Script → Program
              ↓
         Circle PDA Created
              ↓
         Escrow PDA Created
              ↓
       Circle Initialized ✓
```

### Member Join Flow
```
Member → Script → Program
              ↓
         Member PDA Created
              ↓
         Stake Transferred
              ↓
         Trust Score Init
              ↓
       Member Joined ✓
```

### Contribution Flow
```
Member → Script → Program
              ↓
         Validate Amount
              ↓
         Transfer to Escrow
              ↓
         Update Contribution
              ↓
       Contribution Recorded ✓
```

### Payout Flow
```
Trigger → Script → Program
               ↓
          Calculate Pot
               ↓
          Determine Recipient
               ↓
          Transfer from Escrow
               ↓
          Update Member Status
               ↓
          Update Trust Score
               ↓
        Payout Distributed ✓
```

### Governance Flow
```
Proposer → Script → Program
                ↓
           Create Proposal
                ↓
           Open Voting
                ↓
     Members Cast Votes
                ↓
           Tally Results
                ↓
           Execute if Passed
                ↓
         Governance Complete ✓
```

## 🔐 Security & State Management

```
┌─────────────────────────────────────┐
│         State Structure             │
├─────────────────────────────────────┤
│                                     │
│  Circle Account (PDA)               │
│  ├─ id: u64                         │
│  ├─ creator: Pubkey                 │
│  ├─ contribution_amount: u64        │
│  ├─ duration_months: u8             │
│  ├─ max_members: u8                 │
│  ├─ current_members: u8             │
│  ├─ current_month: u8               │
│  ├─ status: CircleStatus            │
│  └─ payout_history: Vec<Payout>    │
│                                     │
│  Member Account (PDA)               │
│  ├─ circle: Pubkey                  │
│  ├─ authority: Pubkey               │
│  ├─ stake_amount: u64               │
│  ├─ total_contributions: u64        │
│  ├─ status: MemberStatus            │
│  └─ received_payout: bool           │
│                                     │
│  Trust Score (PDA)                  │
│  ├─ user: Pubkey                    │
│  ├─ score: u16                      │
│  ├─ tier: TrustTier                 │
│  ├─ payment_history: u16            │
│  ├─ participation: u16              │
│  ├─ social_proof: u16               │
│  └─ governance: u16                 │
│                                     │
│  Governance Proposal (PDA)          │
│  ├─ circle: Pubkey                  │
│  ├─ proposer: Pubkey                │
│  ├─ title: String                   │
│  ├─ proposal_type: u8               │
│  ├─ voting_start: i64               │
│  ├─ voting_end: i64                 │
│  ├─ quadratic_votes_for: u64        │
│  ├─ quadratic_votes_against: u64    │
│  └─ status: ProposalStatus          │
│                                     │
└─────────────────────────────────────┘
```

## 🎨 Frontend Component Hierarchy

```
App
 └─ Providers
     ├─ PrivyProvider (Auth)
     └─ QueryClientProvider (State)
         └─ LiveDashboard
             ├─ Header
             │   ├─ Title
             │   └─ WalletInfo
             │
             ├─ CircleOverview
             │   ├─ CurrentMonth
             │   ├─ EscrowBalance
             │   ├─ SolendYield
             │   └─ CircleStatus
             │
             ├─ TrustScoresPanel
             │   └─ MemberCard (×5)
             │       ├─ Name & Address
             │       ├─ Score & Tier
             │       ├─ ProgressBar
             │       └─ Stats
             │
             ├─ GovernancePanel
             │   └─ ProposalCard (×2)
             │       ├─ Title & Status
             │       ├─ Voting Stats
             │       └─ VoteBar
             │
             ├─ PayoutProgress
             │   ├─ ProgressBar
             │   ├─ PayoutList (×5)
             │   └─ NextTrigger
             │
             └─ SolendStats
                 ├─ CurrentAPY
                 ├─ TotalDeposited
                 ├─ YieldEarned
                 └─ TimeInPool
```

## 🔄 Automation Flow (Switchboard)

```
Time-Based Triggers:

Day 1-15: Contribution Window
   │
   ├─► Day 1: Send contribution reminders
   ├─► Day 5: Check contribution status
   ├─► Day 10: Send second reminder
   └─► Day 15: Close contribution window

Day 16: Penalty Assessment
   │
   └─► Check for missing contributions
       └─► Apply penalties to defaulters

Day 20: Payout Distribution
   │
   ├─► Calculate total pot
   ├─► Add Solend yield
   ├─► Determine recipient (rotation)
   ├─► Execute payout transaction
   └─► Update trust scores

Day 25: Trust Score Update
   │
   ├─► Calculate payment factor
   ├─► Calculate participation factor
   ├─► Update all member scores
   └─► Adjust tiers if needed

Day 30/31: Month End
   │
   ├─► Increment current_month
   ├─► Reset contribution flags
   └─► Prepare for next month
```

## 💾 Storage Structure

```
Solana Accounts:

/circle/<id>
  ├─ Circle Account (280 bytes)
  └─ Escrow Account (PDA)

/circle/<id>/members
  ├─ alice.member (200 bytes)
  ├─ bob.member (200 bytes)
  ├─ charlie.member (200 bytes)
  ├─ diana.member (200 bytes)
  └─ eve.member (200 bytes)

/trust_scores
  ├─ alice.score (150 bytes)
  ├─ bob.score (150 bytes)
  ├─ charlie.score (150 bytes)
  ├─ diana.score (150 bytes)
  └─ eve.score (150 bytes)

/governance
  ├─ proposal-1 (300 bytes)
  ├─ proposal-2 (300 bytes)
  └─ votes
      ├─ alice.vote (80 bytes)
      ├─ bob.vote (80 bytes)
      └─ ... (×5)

Total Storage: ~2.5 KB
```

## 🌐 Network Architecture

```
Internet
    │
    └─► Solana Devnet RPC
        (https://api.devnet.solana.com)
            │
            ├─► Halo Protocol Program
            │   (Fg6PaFpo...FsLnS)
            │
            ├─► Solend Protocol
            │   (Market: 4UpD2fh7...)
            │
            └─► Switchboard Oracle
                (Automation)

Local Environment
    │
    ├─► Demo Scripts
    │   (Node.js + TypeScript)
    │
    └─► Frontend Server
        (Next.js on localhost:3000)
```

## 📈 Performance Metrics

```
Transaction Times (Devnet):
├─ Circle Init: ~2-3 seconds
├─ Member Join: ~1-2 seconds
├─ Contribution: ~1 second
├─ Payout: ~2 seconds
└─ Vote Cast: ~1 second

Frontend Refresh:
├─ Auto-refresh: Every 10 seconds
├─ Initial Load: ~1-2 seconds
└─ Component Render: <100ms

Demo Execution:
├─ Full Demo: ~2-3 minutes
├─ Quick Demo: ~1 minute
└─ Single Operation: ~5-10 seconds
```

---

This architecture enables a seamless demo experience showcasing all features of the Halo Protocol on Solana devnet.
