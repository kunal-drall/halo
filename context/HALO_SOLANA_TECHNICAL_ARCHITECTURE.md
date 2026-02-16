# Halo Protocol: Technical Architecture for Solana

**Version:** 2.0.0  
**Date:** February 2026  
**Author:** XXIX Labs (29Projects)  
**Classification:** Technical Specification  
**Target Chain:** Solana (Mainnet-Beta)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Identity Layer Architecture](#3-identity-layer-architecture)
4. [On-Chain Program Architecture (Anchor)](#4-on-chain-program-architecture-anchor)
5. [Credit Scoring Algorithm](#5-credit-scoring-algorithm)
6. [Oracle & Automation Layer](#6-oracle--automation-layer)
7. [Yield Integration Layer](#7-yield-integration-layer)
8. [Insurance Pool System](#8-insurance-pool-system)
9. [Revenue & Treasury System](#9-revenue--treasury-system)
10. [Governance & Auction System](#10-governance--auction-system)
11. [Privacy Layer (Arcium MPC)](#11-privacy-layer-arcium-mpc)
12. [Off-Chain Infrastructure](#12-off-chain-infrastructure)
13. [Database Schema](#13-database-schema)
14. [API Architecture](#14-api-architecture)
15. [Frontend Architecture](#15-frontend-architecture)
16. [Security Model](#16-security-model)
17. [Solana-Specific Considerations](#17-solana-specific-considerations)
18. [Deployment Architecture](#18-deployment-architecture)

---

## 1. Executive Summary

Halo Protocol is on-chain credit infrastructure built on Solana that transforms informal lending circles (ROSCAs) into verifiable, portable credit scores. The protocol digitizes a $1+ trillion informal savings system used by 200+ million people globally, leveraging Solana's sub-second finality, negligible transaction costs (~$0.00025), and robust DeFi ecosystem.

### Key Technical Differentiators (Solana)

| Feature | Halo on Solana | Traditional ROSCA |
|---------|---------------|-------------------|
| Finality | ~400ms | Manual coordination |
| Transaction Cost | ~$0.00025 | Cash handling costs |
| Trust Mechanism | On-chain Trust Score (0-1000) | Social trust only |
| Payout Methods | Fixed/Auction/Random (smart contract) | Manual rotation |
| Yield on Idle Funds | Solend/Reflect integration | None |
| Insurance | On-chain insurance pool | None |
| Privacy | Arcium MPC (optional) | Inherent |
| Automation | Switchboard Functions | Manual |
| Credit Portability | Cross-protocol via PDA | Not portable |

### Existing Beta Metrics

- **50 users** in beta testing
- **94% retention** rate
- **Zero defaults** recorded
- Built on Anchor Framework (v0.30.1)

---

## 2. System Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          HALO PROTOCOL - SOLANA                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   FRONTEND   │  │   BACKEND    │  │   DATABASE   │  │   ORACLES    │   │
│  │  (Next.js)   │──│  (Express/   │──│ (Supabase    │  │ (Switchboard │   │
│  │  + Wallet    │  │   Hono)      │  │  PostgreSQL) │  │  + Pyth)     │   │
│  │  Adapter     │  │              │  │              │  │              │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  └──────┬───────┘   │
│         │                 │                                     │           │
│         ▼                 ▼                                     ▼           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SOLANA BLOCKCHAIN (Mainnet-Beta)                  │   │
│  │                                                                     │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │  IDENTITY   │ │   CIRCLE    │ │   CREDIT    │ │  INSURANCE  │  │   │
│  │  │  (TrustScore│ │ (Circle +   │ │  (TrustScore│ │  (Insurance │  │   │
│  │  │  + Social   │ │  Escrow +   │ │   scoring   │ │   Pool)     │  │   │
│  │  │   Proofs)   │ │  Member)    │ │   engine)   │ │             │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  │                                                                     │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │  REVENUE    │ │ GOVERNANCE  │ │   AUCTION   │ │   YIELD     │  │   │
│  │  │ (Treasury + │ │ (Proposals  │ │  (Bid +     │ │  (Solend +  │  │   │
│  │  │  Fees)      │ │  + Votes)   │ │   Settle)   │ │   Reflect)  │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  │                                                                     │   │
│  │  ┌─────────────┐ ┌─────────────┐                                   │   │
│  │  │ AUTOMATION  │ │   PRIVACY   │                                   │   │
│  │  │(Switchboard │ │  (Arcium    │                                   │   │
│  │  │ Functions)  │ │   MPC)      │                                   │   │
│  │  └─────────────┘ └─────────────┘                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Program ID & PDAs

```
Program ID: 58Fg8uB36CJwb9gqGxSwmR8RYBWrXMwFbTRuW1694qcd

PDA Derivation Seeds:
┌────────────────────┬──────────────────────────────────────────────────┐
│ Account            │ Seeds                                            │
├────────────────────┼──────────────────────────────────────────────────┤
│ Circle             │ ["circle", creator_pubkey, timestamp_bytes]      │
│ CircleEscrow       │ ["escrow", circle_pubkey]                        │
│ Member             │ ["member", circle_pubkey, member_pubkey]         │
│ TrustScore         │ ["trust_score", authority_pubkey]                │
│ Treasury           │ ["treasury"]                                     │
│ RevenueParams      │ ["revenue_params"]                               │
│ RevenueReport      │ ["revenue_report", period_start, period_end]     │
│ AutomationState    │ ["automation_state"]                             │
│ CircleAutomation   │ ["circle_automation", circle_pubkey]             │
│ AutomationEvent    │ ["automation_event", circle_pubkey, timestamp]   │
│ GovernanceProposal │ ["proposal", circle_pubkey]                      │
│ Vote               │ ["vote", proposal_pubkey, voter_pubkey]          │
│ Auction            │ ["auction", circle_pubkey]                       │
│ Bid                │ ["bid", auction_pubkey, bidder_pubkey]           │
│ InsurancePool      │ ["insurance", circle_pubkey]                     │
└────────────────────┴──────────────────────────────────────────────────┘
```

### 2.3 Module Dependency Graph

```
lib.rs (entry point)
├── state.rs          ← All account structs, enums, impl blocks
├── errors.rs         ← HaloError enum (80+ error codes)
├── instructions.rs   ← Core circle + trust + governance + auction + ROSCA
├── revenue.rs        ← Treasury, fees, revenue reporting
├── insurance.rs      ← Insurance pool staking/claiming/slashing
└── yield_integration.rs ← Solend deposit/withdraw/yield distribution
```

---

## 3. Identity Layer Architecture

### 3.1 Social Auth → Wallet Binding

Unlike traditional DeFi that requires crypto-native users, Halo bridges Web2 identity to Solana wallets via social authentication.

```
┌─────────────────────────────────────────────────────────────────┐
│                    IDENTITY FLOW                                 │
│                                                                  │
│  1. User signs in via Google/Twitter/Discord                     │
│  2. Backend verifies OAuth token                                 │
│  3. User connects Phantom/Solflare/Backpack wallet               │
│  4. Backend generates unique_id = hash(provider + provider_id)   │
│  5. On-chain: initialize_trust_score(authority=wallet)           │
│  6. Social proof: add_social_proof(type, identifier)             │
│  7. Admin/Oracle: verify_social_proof(type, identifier)          │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐           │
│  │ OAuth    │───▶│ Backend  │───▶│ TrustScore PDA   │           │
│  │ Provider │    │ Verify   │    │ (on-chain)       │           │
│  └──────────┘    └──────────┘    └──────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Trust Score Account (On-Chain)

The `TrustScore` PDA is the core identity primitive. Derived from `["trust_score", authority_pubkey]`, it stores:

| Field | Type | Description |
|-------|------|-------------|
| authority | Pubkey | Wallet that owns this score |
| score | u16 | Overall trust score (0-1000) |
| tier | TrustTier | Newcomer/Silver/Gold/Platinum |
| payment_history_score | u16 | 40% weight, max 400 |
| completion_score | u16 | 30% weight, max 300 |
| defi_activity_score | u16 | 20% weight, max 200 |
| social_proof_score | u16 | 10% weight, max 100 |
| circles_completed | u16 | Successful completions |
| circles_joined | u16 | Total circles joined |
| total_contributions | u64 | Lifetime contributions |
| missed_contributions | u16 | Total missed |
| social_proofs | Vec\<SocialProof\> | Up to 5 proofs |

### 3.3 Supported Wallets

| Wallet | Integration | Notes |
|--------|------------|-------|
| Phantom | `@solana/wallet-adapter-phantom` | Primary, mobile + extension |
| Solflare | `@solana/wallet-adapter-solflare` | Mobile + extension |
| Backpack | `@solana/wallet-adapter-backpack` | xNFT support |
| Glow | `@solana/wallet-adapter-glow` | Mobile-first |
| Ledger | `@solana/wallet-adapter-ledger` | Hardware wallet |

---

## 4. On-Chain Program Architecture (Anchor)

### 4.1 Program Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               HALO ON-CHAIN PROGRAM (Anchor v0.30.1)                        │
│               Program ID: 58Fg8uB36CJwb9gqGxSwmR8RYBWrXMwFbTRuW1694qcd    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CORE MODULE (instructions.rs)                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  Circle Lifecycle │  │  Trust System    │  │  ROSCA Payouts   │          │
│  │  ─────────────── │  │  ────────────── │  │  ────────────── │          │
│  │  initialize_circle│  │  initialize_trust│  │  claim_payout    │          │
│  │  join_circle      │  │  update_trust    │  │  bid_for_payout  │          │
│  │  contribute       │  │  add_social_proof│  │  process_payout  │          │
│  │  distribute_pot   │  │  verify_proof    │  │    _round        │          │
│  │  claim_penalty    │  │  update_defi     │  │                  │          │
│  │  leave_circle     │  │  complete_circle │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                             │
│  GOVERNANCE MODULE                    AUCTION MODULE                        │
│  ┌──────────────────┐                ┌──────────────────┐                  │
│  │  create_proposal  │                │  create_auction   │                  │
│  │  cast_vote        │                │  place_bid        │                  │
│  │  execute_proposal │                │  settle_auction   │                  │
│  └──────────────────┘                └──────────────────┘                  │
│                                                                             │
│  AUTOMATION MODULE                    REVENUE MODULE (revenue.rs)           │
│  ┌──────────────────┐                ┌──────────────────┐                  │
│  │  init_automation  │                │  init_treasury    │                  │
│  │  setup_circle_    │                │  init_revenue_    │                  │
│  │    automation     │                │    params         │                  │
│  │  auto_contribute  │                │  update_revenue   │                  │
│  │  auto_distribute  │                │  collect_mgmt_fee │                  │
│  │  auto_penalty     │                │  distribute_yield │                  │
│  │  switchboard_cb   │                │  create_report    │                  │
│  └──────────────────┘                └──────────────────┘                  │
│                                                                             │
│  INSURANCE MODULE (insurance.rs)      YIELD MODULE (yield_integration.rs)  │
│  ┌──────────────────┐                ┌──────────────────┐                  │
│  │  stake_insurance  │                │  deposit_to_solend│                  │
│  │  claim_insurance  │                │  withdraw_solend  │                  │
│  │  return_with_bonus│                │  calculate_yield  │                  │
│  │  slash_insurance  │                │  distribute_yield │                  │
│  └──────────────────┘                └──────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Core Account Structures

#### Circle Account

The main Circle PDA stores all circle configuration and state. Key fields:

- **Configuration:** creator, contribution_amount, duration_months, max_members, penalty_rate
- **State:** current_members, current_month, status (Forming/Active/Completed/Terminated), total_pot
- **ROSCA Fields:** payout_method (FixedRotation/Auction/Random), payout_queue, next_payout_recipient
- **Advanced:** circle_type, min_trust_tier, insurance_pool, invite_code, is_public
- **Yield:** escrow_account, total_yield_earned

#### Member Account

Per-member state within a circle, derived from `["member", circle, authority]`:

- **Identity:** authority, circle, trust_score (cached), trust_tier (cached)
- **Financial:** stake_amount, contribution_history, penalties, insurance_staked
- **Status:** status (Active/Defaulted/Exited), has_received_pot, payout_claimed, payout_position
- **Records:** contribution_records with on-time tracking, days_late

#### CircleEscrow Account

Holds all pooled funds with yield tracking:

- **Balances:** total_amount, monthly_pots, solend_c_token_balance
- **Yield:** total_yield_earned, reflect_yield_earned, solend_yield_earned
- **Reflect:** reflect_token_type (USDC+/USDJ), reflect_initial_price
- **Distribution:** member_yield_shares (per-member yield tracking)

### 4.3 Instruction Flow: Complete Circle Lifecycle

```
Phase 1: FORMATION
──────────────────
Creator → initialize_circle(contribution_amount, duration, max_members, penalty_rate)
  → Creates Circle PDA + CircleEscrow PDA
  
Members → join_circle(stake_amount)
  → Checks TrustScore tier → Calculates minimum stake
  → Transfers stake to escrow → Creates Member PDA

Phase 2: ACTIVE CONTRIBUTIONS
─────────────────────────────
Monthly → contribute(amount)
  → Validates: active circle, active member, correct amount, no duplicate
  → Transfers to escrow → Records in contribution_history
  → Updates TrustScore (if account provided) → Recalculates score

Phase 3: PAYOUT DISTRIBUTION
─────────────────────────────
Option A (Fixed): distribute_pot()
  → Calculates distribution fee (0.5%) → Transfers fee to Treasury
  → Transfers net amount to recipient → Marks member as received

Option B (Auction): create_auction() → place_bid() → settle_auction()
  → Members bid for early payout → Highest bidder wins
  → Discount goes to remaining members

Option C (Random): process_payout_round()
  → Pseudo-random selection from remaining members
  → Uses Clock timestamp as entropy source

Phase 4: COMPLETION
───────────────────
When current_month >= duration_months - 1:
  → Circle status → Completed
  → complete_circle_update_trust() for each member
  → return_insurance_with_bonus() → 5% bonus on insurance stake
  → Stakes returned to all members
```

### 4.4 Token Flow Diagram

```
                    Member Wallets
                   ┌─────────────┐
                   │  SPL Token   │
                   │  (USDC)      │
                   └──────┬───────┘
                          │
            ┌─────────────┼─────────────┐
            │ contribute  │ join_circle  │ stake_insurance
            ▼             ▼              ▼
    ┌──────────────┐ ┌──────────┐ ┌─────────────┐
    │ CircleEscrow │ │ Escrow   │ │ Insurance   │
    │ Token Acct   │ │ (stakes) │ │ Pool Acct   │
    └──────┬───────┘ └──────────┘ └─────────────┘
           │
    ┌──────┼──────────┐
    │      │          │
    ▼      ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Solend  │ │Treasury│ │Recipient│
│(yield) │ │(fees)  │ │(payout) │
└────────┘ └────────┘ └─────────┘
```

---

## 5. Credit Scoring Algorithm

### 5.1 Score Composition (0-1000 Scale)

```
┌────────────────────────────────────────────────────────────────┐
│              HALO TRUST SCORE (0-1000)                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────┐  40% WEIGHT  │
│  │  PAYMENT HISTORY (max 400 points)            │              │
│  │  ──────────────────────────────────────────  │              │
│  │  Formula:                                    │              │
│  │  total_expected = circles_joined × 12        │              │
│  │  success_rate = (expected - missed) / expected│              │
│  │  score = min(success_rate × 400, 400)        │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  ┌──────────────────────────────────────────────┐  30% WEIGHT  │
│  │  CIRCLE COMPLETION (max 300 points)          │              │
│  │  ──────────────────────────────────────────  │              │
│  │  Formula:                                    │              │
│  │  completion_ratio = completed / joined        │              │
│  │  score = min(completion_ratio × 300, 300)    │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  ┌──────────────────────────────────────────────┐  20% WEIGHT  │
│  │  DeFi ACTIVITY (max 200 points)              │              │
│  │  ──────────────────────────────────────────  │              │
│  │  Set via update_defi_activity_score()        │              │
│  │  Oracle-provided based on on-chain activity  │              │
│  │  Max 200 points (capped)                     │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  ┌──────────────────────────────────────────────┐  10% WEIGHT  │
│  │  SOCIAL PROOF (max 100 points)               │              │
│  │  ──────────────────────────────────────────  │              │
│  │  20 points per verified proof                │              │
│  │  Max 5 proofs × 20 = 100 points              │              │
│  │  Supported: Twitter, Discord, GitHub, etc.   │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  TOTAL = payment + completion + defi + social                   │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Trust Tiers & Stake Requirements

| Tier | Score Range | Stake Multiplier | Min Stake (% of contribution) | Benefits |
|------|------------|------------------|-------------------------------|----------|
| Newcomer | 0-249 | 2.0x | 200% | Basic access |
| Silver | 250-499 | 1.5x | 150% | Reduced stake |
| Gold | 500-749 | 1.0x | 100% | Standard stake |
| Platinum | 750-1000 | 0.75x | 75% | Premium circles, lower stake |

### 5.3 Score Update Triggers

```
Event                        → Score Impact
─────────────────────────────────────────────
On-time contribution         → +payment_history_score (up to 400)
Circle completion            → +completion_score (up to 300), circles_completed++
Missed contribution          → -payment_history_score, missed_contributions++
Social proof verified        → +20 social_proof_score (up to 100)
DeFi activity (oracle)       → Set defi_activity_score (up to 200)
Default                      → Major penalty, tier downgrade
```

---

## 6. Oracle & Automation Layer

### 6.1 Switchboard Integration (Free Tier)

Switchboard provides decentralized oracle and automation services. The free tier supports up to 100 feeds.

```
┌─────────────────────────────────────────────────────────────────┐
│                   SWITCHBOARD AUTOMATION                         │
│                                                                  │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐  │
│  │ Automation  │────▶│ Switchboard  │────▶│ Circle          │  │
│  │ State (PDA) │     │ Functions    │     │ Automation (PDA)│  │
│  └─────────────┘     └──────────────┘     └─────────────────┘  │
│                                                                  │
│  Schedules Generated Per Circle:                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Contribution Schedule: Day 1 of each month                │  │
│  │ Distribution Schedule: Day 25 of each month               │  │
│  │ Penalty Schedule:     Day 27 of each month                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Automation Flow:                                                │
│  1. Switchboard Function triggers callback                      │
│  2. switchboard_automation_callback() checks timestamp          │
│  3. If scheduled: fires auto_contribute / auto_distribute       │
│  4. AutomationEvent PDA logs result                             │
└─────────────────────────────────────────────────────────────────┘
```

**Key Account Structures:**

- **AutomationState** (global): authority, switchboard_queue, enabled, active_jobs, min_interval
- **CircleAutomation** (per-circle): contribution_schedule[], distribution_schedule[], penalty_schedule[]
- **AutomationEvent** (per-event): circle, event_type, timestamp, success, error_message

### 6.2 Pyth Network Integration (Free)

Pyth provides free price feeds on Solana for USDC/USD, SOL/USD, and other asset pricing.

```javascript
// Price feed IDs (Solana Mainnet)
const PYTH_FEEDS = {
  "SOL/USD":  "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
  "USDC/USD": "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD",
  "USDT/USD": "3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL",
};

// Usage in backend/oracle service
import { PriceServiceConnection } from "@pythnetwork/price-service-client";
const connection = new PriceServiceConnection("https://hermes.pyth.network");
```

### 6.3 Oracle Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    ORACLE STACK (All Free)                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  Purpose: Automation & Scheduling        │
│  │  SWITCHBOARD     │  - Cron-based circle automation          │
│  │  Functions       │  - Contribution collection triggers      │
│  │  (Free: 100)     │  - Penalty enforcement                  │
│  └─────────────────┘  - Payout distribution                   │
│                                                               │
│  ┌─────────────────┐  Purpose: Price Feeds                    │
│  │  PYTH NETWORK   │  - SOL/USD for gas estimation            │
│  │  (Free: ∞)       │  - USDC/USD for stablecoin validation   │
│  │                   │  - Asset pricing for insurance calcs    │
│  └─────────────────┘                                          │
│                                                               │
│  ┌─────────────────┐  Purpose: DeFi Activity Scoring          │
│  │  CUSTOM ORACLE  │  - Reads on-chain DeFi activity           │
│  │  (Backend Cron) │  - Calculates defi_activity_score         │
│  │                  │  - Calls update_defi_activity_score()    │
│  └─────────────────┘                                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Yield Integration Layer

### 7.1 Dual Yield Strategy

Idle escrow funds earn yield from two sources:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DUAL YIELD STRATEGY                           │
│                                                                  │
│  Source 1: SOLEND (Lending Protocol)                             │
│  ──────────────────────────────────                             │
│  ┌──────────┐    deposit_to_solend()    ┌──────────────┐        │
│  │ Escrow   │ ─────────────────────────▶│ Solend Pool  │        │
│  │ USDC     │                           │ (cTokens)    │        │
│  └──────────┘    withdraw_from_solend() └──────────────┘        │
│                 ◀─────────────────────── APY: ~3-5%             │
│                                                                  │
│  Source 2: REFLECT (Yield-Bearing Stablecoins)                  │
│  ────────────────────────────────────────                       │
│  ┌──────────┐    swap to USDC+/USDJ    ┌──────────────┐        │
│  │ Escrow   │ ─────────────────────────▶│ Reflect      │        │
│  │ USDC     │                           │ USDC+ / USDJ│        │
│  └──────────┘    price appreciation     └──────────────┘        │
│                 ◀─────────────────────── APY: ~4-7%             │
│                                                                  │
│  Combined APY Target: 5-10%                                     │
│  Yield Fee: 0.25% (to Treasury)                                 │
│  Distribution: Pro-rata to circle members                       │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Yield Calculation

```rust
// Per-member yield share = total_yield / total_members
// Tracked in CircleEscrow.member_yield_shares

// Combined APY calculation (from CircleEscrow impl):
fn get_combined_apy(total_amount, reflect_yield, solend_yield, time_elapsed):
    total_yield = reflect_yield + solend_yield
    annualized = total_yield * SECONDS_PER_YEAR / time_elapsed
    apy_bps = annualized * 10_000 / total_amount
```

### 7.3 Minimum Deposit Threshold

```
Minimum Solend Deposit: 100 USDC (100_000_000 in 6-decimal)
```

---

## 8. Insurance Pool System

### 8.1 Insurance Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    INSURANCE POOL                                │
│                                                                  │
│  On Join: stake_insurance(amount)                                │
│  ─────────────────────────────────                              │
│  Minimum: 10% of contribution_amount                            │
│  Maximum: 20% of contribution_amount                            │
│  Stored in: InsurancePool PDA ["insurance", circle]             │
│                                                                  │
│  On Default: claim_insurance(defaulting_member)                  │
│  ──────────────────────────────────────────                     │
│  Claimable = (defaulter's stake × member's stake) / total_staked│
│  Deducted from: available_coverage                              │
│                                                                  │
│  On Completion: return_insurance_with_bonus()                    │
│  ──────────────────────────────────────────                     │
│  Returns: original stake + 5% bonus                             │
│  Incentivizes: Good behavior throughout circle                  │
│                                                                  │
│  On Default (Offender): slash_insurance()                        │
│  ────────────────────────────────────────                       │
│  Slashes: 100% of defaulter's insurance                        │
│  Status: Member → Defaulted                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Revenue & Treasury System

### 9.1 Fee Structure

| Fee Type | Rate | Trigger | Default |
|----------|------|---------|---------|
| Distribution Fee | 0.5% (50 bps) | On pot distribution | Per payout |
| Yield Fee | 0.25% (25 bps) | On yield distribution | Per yield event |
| Management Fee | 2% annual (200 bps) | Time-based on staked amount | Monthly collection |

### 9.2 Revenue Flow

```
Member Contributions
       │
       ▼
┌──────────────┐    0.5% on distribution    ┌──────────────┐
│ CircleEscrow │ ──────────────────────────▶ │   Treasury   │
│              │    0.25% on yield           │   PDA        │
│              │ ──────────────────────────▶ │              │
│              │    2% annual on stakes      │              │
│              │ ──────────────────────────▶ │              │
└──────────────┘                             └──────────────┘
                                                    │
                                             Revenue Reports
                                             (RevenueReport PDAs)
```

### 9.3 Governance-Adjustable Parameters

All fee rates are stored in `RevenueParams` PDA and can be updated via governance proposals:

- Maximum fee rate: 10% (1000 bps) for any single fee
- Minimum management fee interval: 1 day (86400 seconds)

---

## 10. Governance & Auction System

### 10.1 Governance Flow

```
1. create_proposal(title, description, type, voting_duration, threshold)
   → Proposal types: InterestRateChange, CircleParameter, Emergency
   → Max voting duration: 7 days
   
2. cast_vote(support, voting_power)
   → Quadratic voting: weight = sqrt(voting_power)
   → Prevents plutocracy

3. execute_proposal()
   → Requires: voting ended + quadratic_votes_for > quadratic_votes_against
   → Requires: total_voting_power >= execution_threshold
```

### 10.2 Auction System

```
1. create_auction(pot_amount, starting_bid, duration_hours)
   → Max duration: 72 hours
   → Only circle members can initiate

2. place_bid(bid_amount)
   → Must exceed current highest bid
   → Requires minimum 10% stake coverage
   → Cannot bid on own auction

3. settle_auction()
   → After end_time: winner receives pot at discount
   → Discount distributed to other members
```

---

## 11. Privacy Layer (Arcium MPC)

### 11.1 Privacy Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| Public | All data visible on-chain | Default circles |
| Anonymous | Member identities hidden | Semi-private circles |
| FullyEncrypted | All data encrypted via Arcium MPC | Maximum privacy |

### 11.2 Privacy Account Structures

- **EncryptedTrustScore**: Encrypted score calculated in Arcium MPC environment
- **PrivateCircle**: Privacy config per circle with encrypted member data
- **SealedBid**: Encrypted bids for sealed-bid auctions (commitment-reveal scheme)
- **PrivateLoan**: Encrypted loan terms for private borrowing

### 11.3 Arcium Integration Flow

```
1. User opts into privacy mode
2. Arcium session created for circle
3. Trust scores computed in MPC environment
4. Only final tier (not exact score) revealed for eligibility
5. Sealed bids encrypted until reveal phase
6. Loan terms encrypted between borrower and lender
```

---

## 12. Off-Chain Infrastructure

### 12.1 Free-Tier Infrastructure Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                FREE-TIER INFRASTRUCTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  COMPUTE                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Vercel (Hobby/Free)                                    │    │
│  │  - Next.js frontend (SSR + static)                      │    │
│  │  - API routes (serverless functions)                     │    │
│  │  - Edge functions for auth                               │    │
│  │  Limits: 100GB bandwidth, 100 deployments/day           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  DATABASE                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Supabase (Free Tier)                                   │    │
│  │  - PostgreSQL database (500MB)                          │    │
│  │  - Auth (50,000 MAU)                                    │    │
│  │  - Realtime subscriptions                               │    │
│  │  - Storage (1GB)                                        │    │
│  │  - Edge Functions (500K invocations/month)              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  CACHING / QUEUES                                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Upstash Redis (Free Tier)                              │    │
│  │  - 10,000 commands/day                                  │    │
│  │  - 256MB storage                                        │    │
│  │  - REST API (serverless-compatible)                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  SOLANA RPC                                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Helius (Free: 100K credits/month)                      │    │
│  │  OR QuickNode (Free: 10M API credits)                   │    │
│  │  OR Alchemy (Free: 300M compute units)                  │    │
│  │  + Solana public RPC as fallback                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  MONITORING                                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Sentry (Free: 5K errors/month)                         │    │
│  │  Vercel Analytics (Free tier)                           │    │
│  │  Helius Webhooks (transaction monitoring)               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ORACLES                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Switchboard (Free: 100 feeds)                          │    │
│  │  Pyth Network (Free: unlimited reads)                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  INDEXING                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Helius Webhooks (Free tier) - transaction indexing     │    │
│  │  OR Shyft (Free: 100K credits)                          │    │
│  │  OR custom geyser plugin via Yellowstone                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Monthly Cost: $0 (all free tiers)
```

### 12.2 Backend Architecture

```
Backend Stack:
├── Runtime: Next.js API Routes (Vercel Serverless)
│   OR Hono.js (lightweight, edge-compatible)
├── Auth: Supabase Auth (Google, Twitter, Discord OAuth)
├── ORM: Prisma (with Supabase PostgreSQL)
├── Solana SDK: @solana/web3.js + @coral-xyz/anchor
├── Queue: Upstash Redis (for async jobs)
└── Webhooks: Helius (transaction monitoring)
```

---

## 13. Database Schema

### 13.1 PostgreSQL Schema (Supabase)

```sql
-- ============================================
-- USERS & IDENTITY
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(100),
    avatar_url TEXT,
    auth_provider VARCHAR(20), -- google, twitter, discord
    auth_provider_id VARCHAR(255),
    unique_id VARCHAR(64) UNIQUE, -- hash(provider + provider_id)
    
    -- Cached on-chain data
    trust_score INTEGER DEFAULT 0,
    trust_tier VARCHAR(20) DEFAULT 'newcomer',
    trust_score_pda VARCHAR(44),
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_trust_tier ON users(trust_tier);

-- ============================================
-- SOCIAL PROOFS (off-chain mirror)
-- ============================================

CREATE TABLE social_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    proof_type VARCHAR(32) NOT NULL, -- twitter, discord, github
    identifier VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    on_chain_tx VARCHAR(88), -- transaction signature
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, proof_type, identifier)
);

-- ============================================
-- CIRCLES
-- ============================================

CREATE TABLE circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    on_chain_pubkey VARCHAR(44) UNIQUE NOT NULL,
    creator_id UUID REFERENCES users(id),
    
    -- Configuration
    name VARCHAR(100),
    description TEXT,
    contribution_amount BIGINT NOT NULL, -- in token base units
    token_mint VARCHAR(44) NOT NULL, -- USDC mint address
    duration_months SMALLINT NOT NULL,
    max_members SMALLINT NOT NULL,
    penalty_rate INTEGER NOT NULL, -- basis points
    
    -- ROSCA Config
    payout_method VARCHAR(20) DEFAULT 'fixed_rotation',
    circle_type VARCHAR(20) DEFAULT 'standard',
    min_trust_tier VARCHAR(20) DEFAULT 'newcomer',
    is_public BOOLEAN DEFAULT true,
    invite_code VARCHAR(20),
    
    -- State (synced from chain)
    status VARCHAR(20) DEFAULT 'forming',
    current_members SMALLINT DEFAULT 0,
    current_month SMALLINT DEFAULT 0,
    total_pot BIGINT DEFAULT 0,
    total_yield_earned BIGINT DEFAULT 0,
    
    -- Accounts
    escrow_pubkey VARCHAR(44),
    insurance_pool_pubkey VARCHAR(44),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_circles_status ON circles(status);
CREATE INDEX idx_circles_creator ON circles(creator_id);
CREATE INDEX idx_circles_public ON circles(is_public, status);

-- ============================================
-- CIRCLE MEMBERS
-- ============================================

CREATE TABLE circle_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID REFERENCES circles(id),
    user_id UUID REFERENCES users(id),
    member_pda VARCHAR(44),
    
    -- State
    status VARCHAR(20) DEFAULT 'active',
    stake_amount BIGINT DEFAULT 0,
    insurance_staked BIGINT DEFAULT 0,
    payout_position SMALLINT,
    has_received_pot BOOLEAN DEFAULT false,
    payout_claimed BOOLEAN DEFAULT false,
    penalties BIGINT DEFAULT 0,
    contributions_missed SMALLINT DEFAULT 0,
    
    -- Trust (cached)
    trust_score_at_join INTEGER DEFAULT 0,
    trust_tier_at_join VARCHAR(20) DEFAULT 'newcomer',
    
    -- Timestamps
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    exited_at TIMESTAMPTZ,
    
    UNIQUE(circle_id, user_id)
);

CREATE INDEX idx_members_circle ON circle_members(circle_id);
CREATE INDEX idx_members_user ON circle_members(user_id);

-- ============================================
-- CONTRIBUTIONS
-- ============================================

CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID REFERENCES circles(id),
    user_id UUID REFERENCES users(id),
    
    month SMALLINT NOT NULL,
    amount BIGINT NOT NULL,
    on_time BOOLEAN DEFAULT true,
    days_late SMALLINT DEFAULT 0,
    
    -- Transaction
    tx_signature VARCHAR(88) NOT NULL,
    block_slot BIGINT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contributions_circle_month ON contributions(circle_id, month);
CREATE INDEX idx_contributions_user ON contributions(user_id);

-- ============================================
-- PAYOUTS
-- ============================================

CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID REFERENCES circles(id),
    recipient_id UUID REFERENCES users(id),
    
    month SMALLINT NOT NULL,
    gross_amount BIGINT NOT NULL,
    fee_amount BIGINT DEFAULT 0,
    net_amount BIGINT NOT NULL,
    yield_share BIGINT DEFAULT 0,
    
    payout_method VARCHAR(20),
    tx_signature VARCHAR(88),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GOVERNANCE
-- ============================================

CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    on_chain_pubkey VARCHAR(44),
    circle_id UUID REFERENCES circles(id),
    proposer_id UUID REFERENCES users(id),
    
    title VARCHAR(200) NOT NULL,
    description TEXT,
    proposal_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    
    voting_start TIMESTAMPTZ NOT NULL,
    voting_end TIMESTAMPTZ NOT NULL,
    execution_threshold BIGINT,
    
    votes_for BIGINT DEFAULT 0,
    votes_against BIGINT DEFAULT 0,
    quadratic_votes_for BIGINT DEFAULT 0,
    quadratic_votes_against BIGINT DEFAULT 0,
    
    executed BOOLEAN DEFAULT false,
    executed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposals(id),
    voter_id UUID REFERENCES users(id),
    
    support BOOLEAN NOT NULL,
    voting_power BIGINT NOT NULL,
    quadratic_weight BIGINT NOT NULL,
    
    tx_signature VARCHAR(88),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(proposal_id, voter_id)
);

-- ============================================
-- NOTIFICATIONS & ACTIVITY
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    data JSONB,
    
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE NOT read;

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    circle_id UUID REFERENCES circles(id),
    
    action VARCHAR(50) NOT NULL,
    details JSONB,
    tx_signature VARCHAR(88),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_log(user_id, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

-- Public circles visible to all, private only to members
CREATE POLICY circles_select ON circles FOR SELECT USING (
    is_public = true 
    OR creator_id = auth.uid()
    OR id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
);

-- Members can see their own circle membership
CREATE POLICY members_select ON circle_members FOR SELECT USING (
    user_id = auth.uid()
    OR circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
);

-- Users can only see their own notifications
CREATE POLICY notifications_select ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (user_id = auth.uid());
```

---

## 14. API Architecture

### 14.1 REST API Endpoints

```
BASE URL: /api/v1

AUTHENTICATION
──────────────
POST   /auth/login            - OAuth login (Google/Twitter/Discord)
POST   /auth/wallet-connect   - Connect Solana wallet
POST   /auth/wallet-verify    - Verify wallet signature
GET    /auth/session           - Get current session
POST   /auth/logout            - Logout

USER PROFILE
────────────
GET    /users/me                      - Get current user profile
PUT    /users/me                      - Update profile
GET    /users/me/trust-score          - Get trust score details
GET    /users/me/circles              - Get user's circles
GET    /users/me/contributions        - Get contribution history
GET    /users/me/notifications        - Get notifications
PATCH  /users/me/notifications/:id    - Mark notification read

CIRCLES
───────
GET    /circles                       - List public circles (paginated)
POST   /circles                       - Create new circle
GET    /circles/:id                   - Get circle details
GET    /circles/:id/members           - Get circle members
GET    /circles/:id/contributions     - Get contribution history
GET    /circles/:id/payouts           - Get payout history
GET    /circles/:id/yield             - Get yield information
POST   /circles/:id/join              - Join circle (builds + signs tx)
POST   /circles/:id/contribute        - Make contribution
POST   /circles/:id/claim-payout      - Claim payout

TRUST SCORE
───────────
POST   /trust/initialize              - Initialize trust score PDA
POST   /trust/social-proof            - Add social proof
POST   /trust/verify-proof            - Verify social proof (admin)
GET    /trust/leaderboard             - Trust score leaderboard

GOVERNANCE
──────────
POST   /governance/proposals          - Create proposal
GET    /governance/proposals           - List proposals
POST   /governance/proposals/:id/vote - Cast vote
POST   /governance/proposals/:id/exec - Execute proposal

TRANSACTIONS
────────────
GET    /transactions/build/:type      - Build unsigned transaction
POST   /transactions/submit           - Submit signed transaction
GET    /transactions/:sig/status      - Check transaction status

WEBHOOKS (Helius)
─────────────────
POST   /webhooks/helius               - Transaction event handler
```

### 14.2 Webhook Processing (Helius)

```javascript
// Helius webhook processes on-chain events → updates Supabase
const MONITORED_EVENTS = [
  "CircleInitialized",     // → Create circle in DB
  "MemberJoined",          // → Add member record
  "ContributionMade",      // → Record contribution
  "PotDistributed",        // → Record payout
  "TrustScoreUpdated",     // → Update cached score
  "ProposalCreated",       // → Create proposal record
  "VoteCast",              // → Record vote
  "AuctionCreated",        // → Create auction record
  "PayoutClaimed",         // → Record ROSCA payout
];
```

---

## 15. Frontend Architecture

### 15.1 Tech Stack

```
Frontend Stack:
├── Framework: Next.js 14 (App Router)
├── Language: TypeScript
├── Styling: Tailwind CSS + shadcn/ui
├── State: Zustand (global) + TanStack Query (server)
├── Wallet: @solana/wallet-adapter-react
├── Solana: @solana/web3.js + @coral-xyz/anchor
├── Charts: Recharts (trust score visualization)
├── Forms: React Hook Form + Zod
└── Hosting: Vercel (Free tier)
```

### 15.2 Key Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Landing | `/` | Hero, features, social proof |
| Login | `/login` | OAuth + wallet connect |
| Dashboard | `/dashboard` | Overview, active circles, trust score |
| Circle Browse | `/circles` | Discover public circles |
| Circle Detail | `/circles/[id]` | Members, contributions, payouts, yield |
| Create Circle | `/circles/new` | Circle creation wizard |
| Trust Score | `/trust` | Score breakdown, social proofs, history |
| Governance | `/governance` | Proposals, voting |
| Profile | `/profile` | User settings, wallet, connected accounts |

---

## 16. Security Model

### 16.1 On-Chain Security

| Measure | Implementation |
|---------|---------------|
| PDA Authority | All escrow transfers require PDA signer seeds |
| Membership Validation | `circle.members.contains()` checks |
| Duplicate Prevention | PDA seeds include unique identifiers |
| Overflow Protection | `checked_add`, `checked_sub`, `checked_mul` everywhere |
| Status Guards | `require!()` checks for circle/member status |
| Fee Caps | Maximum 10% (1000 bps) on any fee |
| Stake Requirements | Trust-tier-based minimum stakes |
| Time Guards | Automation min_interval prevents spam |

### 16.2 Off-Chain Security

| Measure | Implementation |
|---------|---------------|
| Authentication | Supabase Auth + wallet signature verification |
| Row Level Security | PostgreSQL RLS policies on all tables |
| API Rate Limiting | Upstash Redis rate limiter |
| Input Validation | Zod schemas on all API endpoints |
| CORS | Strict origin whitelist |
| Environment Variables | Vercel encrypted env vars |
| Transaction Signing | Client-side only (never server-side) |
| Webhook Verification | Helius webhook signatures |

---

## 17. Solana-Specific Considerations

### 17.1 Account Size Limits

Solana accounts have a maximum size of 10MB (reallocatable). Current allocations:

| Account | Estimated Size | Notes |
|---------|---------------|-------|
| Circle | ~8KB | Includes Vec fields for 20 members |
| Member | ~500B | Per-member per-circle |
| CircleEscrow | ~4KB | Yield tracking for 20 members |
| TrustScore | ~1KB | 5 social proofs max |
| GovernanceProposal | ~2KB | 200 char title, 1000 char description |
| AutomationState | ~150B | Global singleton |
| CircleAutomation | ~1.5KB | 36 schedule items max |

### 17.2 Transaction Size Limits

Solana transactions are limited to 1232 bytes. Strategies:

- **Versioned Transactions**: Use v0 with Address Lookup Tables
- **Instruction Batching**: Combine related instructions where possible
- **Separate Instructions**: Large operations split across transactions

### 17.3 Compute Budget

Default: 200,000 compute units per instruction. Complex operations may need:

```rust
// Request additional compute
ComputeBudgetInstruction::set_compute_unit_limit(400_000)
```

### 17.4 Rent Exemption

All PDAs are initialized with rent-exempt balances. Approximate costs:

| Account | Rent (~SOL) | Rent (~USD at $20/SOL) |
|---------|------------|----------------------|
| Circle | ~0.07 SOL | ~$1.40 |
| Member | ~0.005 SOL | ~$0.10 |
| TrustScore | ~0.01 SOL | ~$0.20 |

---

## 18. Deployment Architecture

### 18.1 Environment Configuration

```
ENVIRONMENTS:
├── Local Development
│   ├── Solana: solana-test-validator
│   ├── Database: Supabase local (Docker)
│   └── Frontend: next dev
│
├── Devnet (Testing)
│   ├── Solana: Devnet cluster
│   ├── Database: Supabase project (free tier)
│   ├── RPC: Helius devnet
│   └── Frontend: Vercel preview
│
└── Mainnet-Beta (Production)
    ├── Solana: Mainnet-Beta cluster
    ├── Database: Supabase project (free → Pro)
    ├── RPC: Helius mainnet (free → paid)
    └── Frontend: Vercel production
```

### 18.2 CI/CD Pipeline

```
GitHub Actions:
├── On PR:
│   ├── anchor test (Bankrun/local validator)
│   ├── TypeScript tests
│   └── Vercel preview deployment
│
├── On merge to main:
│   ├── anchor build
│   ├── anchor deploy --provider.cluster devnet
│   ├── Run integration tests
│   └── Vercel production deployment
│
└── On release tag:
    ├── anchor build --verifiable
    ├── anchor deploy --provider.cluster mainnet
    └── Program verification on Solscan
```

---

## Appendix A: Dependency Versions

```toml
# Anchor Program
anchor-lang = "0.30.1"
anchor-spl = "0.30.1"
spl-token = "3.5.0"

# Frontend / Backend
@solana/web3.js = "^1.95"
@coral-xyz/anchor = "^0.30.1"
@solana/wallet-adapter-react = "^0.15"
next = "14.x"
```

## Appendix B: Token Support

| Token | Mint Address (Mainnet) | Decimals | Use |
|-------|----------------------|----------|-----|
| USDC | EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v | 6 | Primary contribution token |
| USDT | Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB | 6 | Alternative stable |
| SOL | Native | 9 | Gas + potential contributions |

---

*End of Technical Architecture Document*
