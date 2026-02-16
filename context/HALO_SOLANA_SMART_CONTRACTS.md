# Halo Protocol: Solana Smart Contracts Reference

**Version:** 2.0.0  
**Date:** February 2026  
**Author:** XXIX Labs (29Projects)  
**Framework:** Anchor v0.30.1  
**Program ID:** `58Fg8uB36CJwb9gqGxSwmR8RYBWrXMwFbTRuW1694qcd`

---

## Table of Contents

1. [Program Overview](#1-program-overview)
2. [Account Structures](#2-account-structures)
3. [Core Instructions](#3-core-instructions)
4. [Trust Score System](#4-trust-score-system)
5. [ROSCA Payout Instructions](#5-rosca-payout-instructions)
6. [Governance System](#6-governance-system)
7. [Auction System](#7-auction-system)
8. [Insurance Module](#8-insurance-module)
9. [Yield Integration Module](#9-yield-integration-module)
10. [Revenue Module](#10-revenue-module)
11. [Automation Module](#11-automation-module)
12. [Privacy Module (Arcium)](#12-privacy-module-arcium)
13. [Events Reference](#13-events-reference)
14. [Error Codes Reference](#14-error-codes-reference)
15. [Testing Guide](#15-testing-guide)
16. [Deployment Guide](#16-deployment-guide)

---

## 1. Program Overview

### 1.1 Module Structure

```
programs/halo-protocol/
├── Cargo.toml                    # Dependencies: anchor-lang 0.30.1, anchor-spl 0.30.1
└── src/
    ├── lib.rs                    # Entry point, declare_id!, instruction routing
    ├── state.rs                  # All account structures + enums + impl blocks
    ├── errors.rs                 # HaloError enum (80+ error variants)
    ├── instructions.rs           # Core + governance + auction + ROSCA instructions
    ├── revenue.rs                # Treasury + fee collection + revenue reports
    ├── insurance.rs              # Insurance pool CRUD + slashing
    └── yield_integration.rs      # Solend deposit/withdraw/yield distribution
```

### 1.2 Complete Instruction Set

| Module | Instruction | Description |
|--------|------------|-------------|
| **Core** | `initialize_circle` | Create new lending circle |
| | `join_circle` | Join with trust-based stake |
| | `contribute` | Make monthly contribution |
| | `distribute_pot` | Distribute pot to recipient |
| | `claim_penalty` | Claim penalty from defaulter |
| | `leave_circle` | Exit circle (pre-active only) |
| **Trust** | `initialize_trust_score` | Create TrustScore PDA |
| | `update_trust_score` | Recalculate score |
| | `add_social_proof` | Add social verification |
| | `verify_social_proof` | Admin verifies proof |
| | `update_defi_activity_score` | Oracle updates DeFi score |
| | `complete_circle_update_trust` | Update trust on completion |
| **ROSCA** | `claim_payout` | Claim turn-based payout |
| | `bid_for_payout` | Bid for early payout |
| | `process_payout_round` | Advance payout round |
| **Governance** | `create_proposal` | Create governance proposal |
| | `cast_vote` | Vote with quadratic weight |
| | `execute_proposal` | Execute passed proposal |
| **Auction** | `create_auction` | Create pot auction |
| | `place_bid` | Place bid on auction |
| | `settle_auction` | Settle ended auction |
| **Revenue** | `initialize_treasury` | Create treasury PDA |
| | `initialize_revenue_params` | Set fee parameters |
| | `update_revenue_params` | Update fee rates |
| | `collect_management_fees` | Collect time-based fees |
| | `distribute_yield` | Distribute yield with fee |
| | `create_revenue_report` | Generate revenue report |
| **Insurance** | `stake_insurance` | Stake insurance deposit |
| | `claim_insurance` | Claim against default |
| | `return_insurance_with_bonus` | Return stake + 5% |
| | `slash_insurance` | Slash defaulter's stake |
| **Yield** | `deposit_to_solend` | Deposit idle funds |
| | `withdraw_from_solend` | Withdraw from Solend |
| | `calculate_yield_share` | Calculate member shares |
| | `distribute_yield_to_member` | Pay yield to member |
| **Automation** | `initialize_automation_state` | Setup global automation |
| | `setup_circle_automation` | Configure per-circle |
| | `automated_contribution_collection` | Auto-collect trigger |
| | `automated_payout_distribution` | Auto-distribute trigger |
| | `automated_penalty_enforcement` | Auto-penalty trigger |
| | `update_automation_settings` | Update settings |
| | `switchboard_automation_callback` | Switchboard callback |

---

## 2. Account Structures

### 2.1 Circle (Main State)

```rust
#[account]
pub struct Circle {
    pub creator: Pubkey,              // Circle creator
    pub id: u64,                      // Unique ID (timestamp-based)
    pub contribution_amount: u64,     // Monthly amount (token base units)
    pub duration_months: u8,          // 1-24 months
    pub max_members: u8,              // 1-20 members
    pub current_members: u8,          // Active count
    pub current_month: u8,            // 0-based month index
    pub penalty_rate: u16,            // Basis points (100 = 1%)
    pub status: CircleStatus,         // Forming/Active/Completed/Terminated
    pub created_at: i64,              // Unix timestamp
    pub members: Vec<Pubkey>,         // Member wallet list
    pub monthly_contributions: Vec<MonthlyContribution>,
    pub total_pot: u64,               // Total collected
    pub bump: u8,                     // PDA bump
    
    // ROSCA-specific
    pub payout_method: PayoutMethod,  // FixedRotation/Auction/Random
    pub payout_queue: Vec<Pubkey>,    // Ordered recipients
    pub min_trust_tier: u8,           // Minimum tier to join
    pub insurance_pool: Pubkey,       // Insurance PDA
    pub circle_type: CircleType,      // Standard/AuctionBased/RandomRotation/Hybrid
    pub invite_code: Option<String>,  // Private circle code
    pub is_public: bool,              // Visibility
    pub escrow_account: Pubkey,       // Escrow PDA
    pub total_yield_earned: u64,      // Yield from DeFi
    pub next_payout_recipient: Option<Pubkey>,
}

// PDA Seeds: ["circle", creator.key(), timestamp.to_le_bytes()]
// Space: ~8KB (Circle::space())
// Constants: MAX_MEMBERS = 20, MAX_DURATION = 24
```

### 2.2 Member (Per-User Per-Circle)

```rust
#[account]
pub struct Member {
    pub authority: Pubkey,            // Member wallet
    pub circle: Pubkey,               // Circle PDA
    pub stake_amount: u64,            // Staked amount
    pub contribution_history: Vec<u64>, // Amount per month
    pub status: MemberStatus,         // Active/Defaulted/Exited
    pub has_received_pot: bool,       // Distribution tracking
    pub penalties: u64,               // Accumulated penalties
    pub joined_at: i64,               // Join timestamp
    pub trust_score: u16,             // Cached score
    pub trust_tier: TrustTier,        // Cached tier
    pub contributions_missed: u8,     // Missed count
    pub bump: u8,                     // PDA bump
    
    // ROSCA-specific
    pub payout_claimed: bool,
    pub payout_position: u8,
    pub insurance_staked: u64,
    pub contribution_records: Vec<ContributionRecord>,
}

// PDA Seeds: ["member", circle.key(), member_authority.key()]
// Space: ~500B (Member::space())
```

### 2.3 CircleEscrow (Fund Custody)

```rust
#[account]
pub struct CircleEscrow {
    pub circle: Pubkey,               // Parent circle
    pub total_amount: u64,            // Total held
    pub monthly_pots: Vec<u64>,       // Per-month amounts
    pub bump: u8,
    
    // Yield tracking
    pub total_yield_earned: u64,
    pub solend_c_token_balance: u64,
    pub last_yield_calculation: i64,
    pub member_yield_shares: Vec<MemberYieldShare>,
    
    // Reflect integration
    pub reflect_yield_earned: u64,
    pub solend_yield_earned: u64,
    pub reflect_token_type: Option<ReflectTokenType>,
    pub reflect_initial_price: u64,
}

// PDA Seeds: ["escrow", circle.key()]
// Space: ~4KB (CircleEscrow::space())
```

### 2.4 TrustScore (Identity & Credit)

```rust
#[account]
pub struct TrustScore {
    pub authority: Pubkey,            // Owner wallet
    pub score: u16,                   // 0-1000
    pub tier: TrustTier,              // Newcomer/Silver/Gold/Platinum
    pub payment_history_score: u16,   // Max 400 (40%)
    pub completion_score: u16,        // Max 300 (30%)
    pub defi_activity_score: u16,     // Max 200 (20%)
    pub social_proof_score: u16,      // Max 100 (10%)
    pub circles_completed: u16,
    pub circles_joined: u16,
    pub total_contributions: u64,
    pub missed_contributions: u16,
    pub social_proofs: Vec<SocialProof>, // Max 5
    pub last_updated: i64,
    pub bump: u8,
}

// PDA Seeds: ["trust_score", authority.key()]
// Space: ~1KB (TrustScore::space())
```

### 2.5 Enums

```rust
pub enum CircleStatus { Forming, Active, Completed, Terminated }
pub enum MemberStatus { Active, Defaulted, Exited }
pub enum PayoutMethod { FixedRotation, Auction, Random }
pub enum CircleType { Standard, AuctionBased, RandomRotation, Hybrid }
pub enum TrustTier { Newcomer, Silver, Gold, Platinum }
pub enum ProposalType { InterestRateChange, CircleParameter, Emergency }
pub enum ProposalStatus { Active, Succeeded, Defeated, Executed, Cancelled }
pub enum AuctionStatus { Active, Ended, Cancelled }
pub enum PrivacyMode { Public, Anonymous, FullyEncrypted }
pub enum ReflectTokenType { USDCPlus, USDJ }
pub enum AutomationEventType { ContributionCollection, PayoutDistribution, PenaltyEnforcement, ScheduleUpdate }
```

---

## 3. Core Instructions

### 3.1 initialize_circle

Creates a new lending circle with escrow.

```rust
// Signature
pub fn initialize_circle(
    ctx: Context<InitializeCircle>,
    contribution_amount: u64,    // > 0
    duration_months: u8,         // 1-24
    max_members: u8,             // 1-20
    penalty_rate: u16,           // 0-10000 bps
) -> Result<()>

// Accounts
pub struct InitializeCircle<'info> {
    #[account(init, payer = creator, space = Circle::space(),
              seeds = [b"circle", creator.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()], bump)]
    pub circle: Account<'info, Circle>,
    #[account(init, payer = creator, space = CircleEscrow::space(),
              seeds = [b"escrow", circle.key().as_ref()], bump)]
    pub escrow: Account<'info, CircleEscrow>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

// Validation
// - duration_months: 1-24
// - max_members: 1-20
// - contribution_amount: > 0
// - penalty_rate: 0-10000

// Effects
// - Creates Circle PDA with Active status
// - Creates CircleEscrow PDA with empty monthly_pots
```

### 3.2 join_circle

Join a circle with trust-based stake requirements.

```rust
// Signature
pub fn join_circle(ctx: Context<JoinCircle>, stake_amount: u64) -> Result<()>

// Key Logic
// 1. If TrustScore exists:
//    - Newcomer: 2.0x contribution_amount stake
//    - Silver:   1.5x
//    - Gold:     1.0x
//    - Platinum: 0.75x
// 2. If no TrustScore: default 2.0x (Newcomer)
// 3. Transfers stake_amount from member → escrow token account
// 4. Creates Member PDA
// 5. Adds member to circle.members

// Validation
// - Circle is Active
// - Circle not full
// - Member not already in circle
// - stake_amount >= minimum for trust tier
```

### 3.3 contribute

Make monthly contribution.

```rust
// Signature
pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()>

// Key Logic
// 1. Calculates current_month from timestamp
// 2. Validates no duplicate contribution for month
// 3. Transfers amount to escrow
// 4. Records in member.contribution_history[month]
// 5. If TrustScore provided: updates total_contributions, recalculates score
// 6. Updates MonthlyContribution record
// 7. Updates circle.total_pot and escrow.total_amount

// Validation
// - Circle is Active
// - Member is Active
// - amount == contribution_amount (exact match required)
// - Not already contributed for current month
```

### 3.4 distribute_pot

Distribute monthly pot with fee deduction.

```rust
// Signature
pub fn distribute_pot(ctx: Context<DistributePot>) -> Result<()>

// Key Logic
// 1. Calculates distribution fee (0.5% default)
// 2. Transfers fee to Treasury token account
// 3. Transfers net amount to recipient token account
// 4. Marks recipient.has_received_pot = true
// 5. If final month: sets circle.status = Completed

// Required Accounts (notable)
// - treasury: Account<'info, Treasury>         (fee recipient)
// - revenue_params: Account<'info, RevenueParams>  (fee rate)
// - escrow_token_account → recipient_token_account  (net payout)
// - escrow_token_account → treasury_token_account   (fee)
```

---

## 4. Trust Score System

### 4.1 Score Calculation (On-Chain)

```rust
impl TrustScore {
    pub fn calculate_score(&mut self) {
        // Payment History (40%, max 400)
        let payment_ratio = if self.circles_joined > 0 {
            let total_expected = self.circles_joined * 12;
            let success_rate = if total_expected > self.missed_contributions {
                ((total_expected - self.missed_contributions) * 100) / total_expected
            } else { 0 };
            min(success_rate, 100)
        } else { 0 };
        self.payment_history_score = min((payment_ratio as u16 * 400) / 100, 400);

        // Completion (30%, max 300)
        let completion_ratio = if self.circles_joined > 0 {
            (self.circles_completed * 100) / self.circles_joined
        } else { 0 };
        self.completion_score = min((completion_ratio * 300) / 100, 300);

        // DeFi Activity (20%, max 200) - oracle-set
        self.defi_activity_score = min(self.defi_activity_score, 200);

        // Social Proof (10%, max 100)
        let verified = self.social_proofs.iter().filter(|p| p.verified).count();
        self.social_proof_score = min((verified * 20) as u16, 100);

        // Total
        self.score = self.payment_history_score 
                   + self.completion_score 
                   + self.defi_activity_score 
                   + self.social_proof_score;
        
        self.update_tier();
    }

    pub fn get_minimum_stake_multiplier(&self) -> u64 {
        match self.tier {
            TrustTier::Newcomer  => 200,  // 2.00x
            TrustTier::Silver    => 150,  // 1.50x
            TrustTier::Gold      => 100,  // 1.00x
            TrustTier::Platinum  => 75,   // 0.75x
        }
    }
}
```

### 4.2 Social Proof Flow

```
1. add_social_proof("twitter", "@username")
   → Stored unverified in TrustScore.social_proofs[]

2. verify_social_proof("twitter", "@username")
   → Called by verifier (admin/oracle)
   → Sets proof.verified = true
   → Recalculates score (+20 points per verified proof)
```

---

## 5. ROSCA Payout Instructions

### 5.1 claim_payout (Fixed Rotation)

```rust
// Validates: circle.next_payout_recipient == member.authority
// Calculates: base_payout + member_yield_share
// Transfers: total_payout from escrow to member
// Advances: circle.current_month++, determines next recipient
// On completion: sets CircleStatus::Completed
```

### 5.2 bid_for_payout (Auction-Based)

```rust
// Requires: circle.payout_method == PayoutMethod::Auction
// Validates: member hasn't received payout yet
// Transfers: bid_amount to escrow
// Updates: payout_queue ordering based on bid
```

### 5.3 process_payout_round

```rust
// Determines next recipient based on payout_method:
// - FixedRotation: next in payout_queue
// - Random: pseudo-random from remaining (timestamp-based)
// - Auction: highest bidder from queue
```

---

## 6. Governance System

### 6.1 create_proposal

```rust
pub fn create_proposal(
    ctx: Context<CreateProposal>,
    title: String,          // max 200 chars
    description: String,    // max 1000 chars
    proposal_type: u8,      // 0=InterestRate, 1=CircleParam, 2=Emergency
    voting_duration_hours: u16, // 1-168 (max 7 days)
    execution_threshold: u64,
    new_interest_rate: Option<u16>, // Required for type 0
) -> Result<()>
```

### 6.2 Quadratic Voting

```rust
// In cast_vote:
let quadratic_weight = (voting_power as f64).sqrt() as u64;

// Prevents whale domination:
// 100 tokens → weight 10
// 10,000 tokens → weight 100 (not 100x more, only 10x)
```

### 6.3 Proposal Execution

```rust
// Passes when:
// quadratic_votes_for > quadratic_votes_against
// AND total_voting_power >= execution_threshold

// InterestRateChange: updates circle.penalty_rate
// CircleParameter: extensible parameter changes
// Emergency: emergency actions
```

---

## 7. Auction System

### 7.1 Lifecycle

```
create_auction(pot_amount, starting_bid, duration: 1-72h)
    → place_bid(bid_amount > highest_bid)
        → Requires: 10% of bid covered by member stake
        → Cannot bid on own auction
    → settle_auction() after end_time
        → Winner receives pot at discount
```

---

## 8. Insurance Module

### 8.1 Operations

| Operation | Function | Description |
|-----------|----------|-------------|
| Stake | `stake_insurance(amount)` | 10-20% of contribution, creates InsurancePool |
| Claim | `claim_insurance(defaulter)` | Pro-rata claim against defaulter |
| Return | `return_insurance_with_bonus()` | Original + 5% on circle completion |
| Slash | `slash_insurance()` | 100% slash on default, status → Defaulted |

### 8.2 InsurancePool Account

```rust
#[account]
pub struct InsurancePool {
    pub circle: Pubkey,
    pub total_staked: u64,
    pub available_coverage: u64,
    pub claims_paid: u64,
    pub member_stakes: Vec<MemberStake>,  // max 20
    pub bump: u8,
}
// PDA Seeds: ["insurance", circle.key()]
```

---

## 9. Yield Integration Module

### 9.1 Solend Integration

```rust
// Deposit idle escrow funds to Solend for yield
pub fn deposit_to_solend(ctx: Context<DepositToSolend>, amount: u64) -> Result<()>
// Minimum: 100 USDC (100_000_000 in 6-decimal)
// Updates: escrow.solend_c_token_balance

// Withdraw before payout distribution
pub fn withdraw_from_solend(ctx: Context<WithdrawFromSolend>, amount: u64) -> Result<()>

// Calculate per-member yield shares (equal distribution)
pub fn calculate_yield_share(ctx: Context<CalculateYieldShare>) -> Result<Vec<(Pubkey, u64)>>

// Distribute claimable yield to member
pub fn distribute_yield(ctx: Context<DistributeYield>, member: Pubkey) -> Result<()>
```

### 9.2 Reflect Integration (State Tracking)

```rust
#[account]
pub struct ReflectYieldTracking {
    pub circle: Pubkey,
    pub usdc_plus_deposited: u64,     // USDC+ amount
    pub usdj_deposited: u64,          // USDJ amount
    pub reflect_yield_earned: u64,    // Price appreciation yield
    pub solend_yield_earned: u64,     // Lending yield
    pub reflect_price_at_deposit: u64,
    pub current_reflect_price: u64,
    pub token_type: ReflectTokenType, // USDCPlus or USDJ
}

// APY calculations available:
// get_combined_apy() - Both sources combined
// get_reflect_apy()  - Price appreciation only
// get_solend_apy()   - Lending yield only
```

---

## 10. Revenue Module

### 10.1 Fee Parameters

```rust
#[account]
pub struct RevenueParams {
    pub distribution_fee_rate: u16,   // Default: 50 bps (0.5%)
    pub yield_fee_rate: u16,          // Default: 25 bps (0.25%)
    pub management_fee_rate: u16,     // Default: 200 bps (2% annual)
    pub management_fee_interval: i64, // Default: 30 days
}
// PDA Seeds: ["revenue_params"]
```

### 10.2 Treasury

```rust
#[account]
pub struct Treasury {
    pub authority: Pubkey,
    pub total_fees_collected: u64,
    pub distribution_fees: u64,
    pub yield_fees: u64,
    pub management_fees: u64,
    pub last_management_fee_collection: i64,
}
// PDA Seeds: ["treasury"]
```

---

## 11. Automation Module

### 11.1 Switchboard Integration

```rust
// Global automation state
#[account]
pub struct AutomationState {
    pub authority: Pubkey,
    pub switchboard_queue: Pubkey,
    pub enabled: bool,
    pub active_jobs: u32,
    pub min_interval: i64,      // Minimum seconds between checks
    pub last_check: i64,
}
// PDA Seeds: ["automation_state"]

// Per-circle automation config
#[account]
pub struct CircleAutomation {
    pub circle: Pubkey,
    pub job_account: Pubkey,
    pub auto_collect_enabled: bool,
    pub auto_distribute_enabled: bool,
    pub auto_penalty_enabled: bool,
    pub contribution_schedule: Vec<i64>,   // Day 1 of each month
    pub distribution_schedule: Vec<i64>,   // Day 25
    pub penalty_schedule: Vec<i64>,        // Day 27
}
// PDA Seeds: ["circle_automation", circle.key()]
```

---

## 12. Privacy Module (Arcium)

### 12.1 Account Structures (State Only)

```rust
// Encrypted trust score (MPC-computed)
pub struct EncryptedTrustScore {
    pub authority: Pubkey,
    pub encrypted_score: Vec<u8>,     // max 256 bytes
    pub arcium_compute_key: Pubkey,
    pub privacy_enabled: bool,
}

// Private circle config
pub struct PrivateCircle {
    pub circle: Pubkey,
    pub privacy_mode: PrivacyMode,    // Public/Anonymous/FullyEncrypted
    pub arcium_session: Pubkey,
    pub encrypted_member_data: Vec<EncryptedMemberInfo>,
}

// Sealed-bid auction
pub struct SealedBid {
    pub auction: Pubkey,
    pub sealed_bid_data: Vec<u8>,
    pub commitment_hash: [u8; 32],
    pub is_revealed: bool,
}
```

---

## 13. Events Reference

| Event | Fields | Trigger |
|-------|--------|---------|
| `ProposalCreated` | proposal_id, circle, proposer, type, voting_end | create_proposal |
| `VoteCast` | proposal_id, voter, support, voting_power, quadratic_weight | cast_vote |
| `ProposalExecuted` | proposal_id, circle, executed_at | execute_proposal |
| `AuctionCreated` | auction_id, circle, initiator, pot_amount, starting_bid, end_time | create_auction |
| `BidPlaced` | auction_id, bidder, bid_amount, timestamp | place_bid |
| `AuctionSettled` | auction_id, winner, winning_bid, settled_at | settle_auction |
| `PayoutClaimed` | circle, member, amount, yield_share, timestamp | claim_payout |
| `PayoutRoundProcessed` | circle, current_month, next_recipient, timestamp | process_payout_round |

---

## 14. Error Codes Reference

| Code | Error | Context |
|------|-------|---------|
| 6000 | CircleFull | join_circle: max_members reached |
| 6001 | InvalidContributionAmount | contribute: amount ≠ contribution_amount |
| 6002 | MemberAlreadyExists | join_circle: duplicate member |
| 6003 | MemberNotFound | Various: member not in circle |
| 6004 | CircleNotActive | Various: circle status ≠ Active |
| 6005 | InsufficientStake | join_circle: below tier minimum |
| 6006 | ContributionAlreadyMade | contribute: duplicate for month |
| 6007 | InvalidContributionMonth | contribute: future month |
| 6008 | PotAlreadyDistributed | distribute_pot: already paid |
| 6009 | NoContributionsToDistribute | distribute_pot: empty pot |
| 6010 | NotAuthorizedToDistribute | distribute_pot: wrong authority |
| 6011 | MemberAlreadyReceivedPot | distribute_pot: already received |
| 6012 | InvalidPenaltyRate | initialize_circle: rate > 10000 |
| 6013 | MemberInDefault | contribute: defaulted member |
| 6014 | CannotLeaveActivePeriod | leave_circle: active period |
| 6015 | ArithmeticOverflow | Any checked math failure |
| 6016 | InvalidDuration | initialize_circle: 0 or > 24 |
| 6017 | InvalidMaxMembers | initialize_circle: 0 or > 20 |
| 6018 | CircleEnded | leave_circle: already completed |
| ... | *(80+ total errors)* | See errors.rs for complete list |

---

## 15. Testing Guide

### 15.1 Local Testing Setup

```bash
# Install dependencies
anchor build

# Run local validator
solana-test-validator

# Run Anchor tests
anchor test

# Run with Bankrun (faster, no validator needed)
anchor test --skip-local-validator
```

### 15.2 Test Structure

```typescript
// tests/halo-protocol.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HaloProtocol } from "../target/types/halo_protocol";

describe("halo-protocol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.HaloProtocol as Program<HaloProtocol>;

  it("Initialize Circle", async () => {
    const [circlePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("circle"), provider.wallet.publicKey.toBuffer(), 
       new anchor.BN(Date.now() / 1000).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    
    await program.methods
      .initializeCircle(
        new anchor.BN(1_000_000), // 1 USDC
        6,   // 6 months
        5,   // 5 members
        500  // 5% penalty
      )
      .accounts({ circle: circlePda, creator: provider.wallet.publicKey })
      .rpc();
  });

  it("Initialize Trust Score", async () => {
    const [trustPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trust_score"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );
    
    await program.methods
      .initializeTrustScore()
      .accounts({ trustScore: trustPda, authority: provider.wallet.publicKey })
      .rpc();
    
    const trustScore = await program.account.trustScore.fetch(trustPda);
    assert.equal(trustScore.score, 0);
    assert.deepEqual(trustScore.tier, { newcomer: {} });
  });

  it("Join Circle with Trust-Based Stake", async () => {
    // Trust tier determines minimum stake
    // Newcomer: 2x contribution = 2_000_000
    await program.methods
      .joinCircle(new anchor.BN(2_000_000))
      .accounts({
        circle: circlePda,
        member: memberPda,
        escrow: escrowPda,
        trustScore: trustPda,  // Optional
        memberAuthority: member.publicKey,
        memberTokenAccount: memberAta,
        escrowTokenAccount: escrowAta,
      })
      .signers([member])
      .rpc();
  });

  it("Make Contribution & Update Trust Score", async () => {
    await program.methods
      .contribute(new anchor.BN(1_000_000))
      .accounts({
        circle: circlePda,
        member: memberPda,
        escrow: escrowPda,
        trustScore: trustPda,  // Optional: auto-updates score
        memberAuthority: member.publicKey,
        memberTokenAccount: memberAta,
        escrowTokenAccount: escrowAta,
      })
      .signers([member])
      .rpc();
  });
});
```

### 15.3 Devnet Testing

```bash
# Configure for devnet
solana config set --url devnet

# Airdrop SOL for testing
solana airdrop 2

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Get devnet USDC (from Solana Token Faucet)
# Devnet USDC Mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

---

## 16. Deployment Guide

### 16.1 Build & Deploy

```bash
# Build verifiable (for mainnet)
anchor build --verifiable

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta \
  --provider.wallet ~/.config/solana/deployer.json

# Verify on Solscan
anchor verify <PROGRAM_ID> --provider.cluster mainnet-beta
```

### 16.2 Post-Deployment Initialization

```bash
# 1. Initialize Treasury
anchor run initialize-treasury

# 2. Initialize Revenue Params
anchor run initialize-revenue-params

# 3. Initialize Automation State
anchor run initialize-automation

# 4. Set up Switchboard queue
# (manual setup via Switchboard dashboard)
```

### 16.3 Program Upgrade

```bash
# Upgrade authority: deployer wallet
anchor upgrade target/deploy/halo_protocol.so \
  --program-id 58Fg8uB36CJwb9gqGxSwmR8RYBWrXMwFbTRuW1694qcd \
  --provider.cluster mainnet-beta
```

---

*End of Smart Contracts Reference*
