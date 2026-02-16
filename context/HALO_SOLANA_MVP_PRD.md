# Halo Protocol: Solana MVP Product Requirements Document

**Version:** 2.0.0  
**Date:** February 2026  
**Author:** XXIX Labs (29Projects)  
**Classification:** Product Specification  
**Target Chain:** Solana (Mainnet-Beta)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users](#2-target-users)
3. [Feature Matrix](#3-feature-matrix)
4. [User Flows](#4-user-flows)
5. [Screen Specifications](#5-screen-specifications)
6. [On-Chain Transaction Flows](#6-on-chain-transaction-flows)
7. [API Specification](#7-api-specification)
8. [Database Schema](#8-database-schema)
9. [Notification System](#9-notification-system)
10. [Free Infrastructure Stack](#10-free-infrastructure-stack)
11. [Analytics & Metrics](#11-analytics--metrics)
12. [Success Criteria](#12-success-criteria)
13. [Known Limitations](#13-known-limitations)

---

## 1. Product Overview

### 1.1 One-Liner

Halo Protocol is a Solana-based platform that transforms informal lending circles (ROSCAs) into smart contract-powered savings groups with verifiable, portable credit scores.

### 1.2 Problem Statement

1.4 billion unbanked people worldwide rely on informal lending circles for savings and credit. These systems suffer from:
- **No trust guarantees** — defaults destroy circles with no recourse
- **No credit history** — perfect participation leaves no verifiable record
- **No yield** — idle funds earn nothing while waiting for distribution
- **No portability** — reputation in one circle doesn't transfer

### 1.3 Solution

Halo Protocol solves these by moving ROSCAs on-chain with:
- **Smart contract enforcement** — automatic contributions, penalties, and payouts
- **Trust Score (0-1000)** — on-chain credit score built from ROSCA participation
- **Yield generation** — idle funds earn yield via Solend/Reflect
- **Insurance pool** — economic protection against defaults
- **Multiple payout methods** — fixed rotation, auction, or random

### 1.4 Existing Traction

- 50 beta users, 94% retention, zero defaults
- Anchor program substantially complete (~3,000 LOC)
- Solana SuperteamDE hackathon winner

---

## 2. Target Users

### 2.1 Primary Personas

| Persona | Description | Motivation |
|---------|-------------|------------|
| **Community Saver** | Participates in informal savings groups | Wants security, yield, and credit building |
| **Circle Organizer** | Creates and manages lending circles | Wants automation and trust verification |
| **Credit Builder** | Needs credit history for DeFi/TradFi | Wants portable, verifiable credit score |
| **Crypto-Native Saver** | Already in DeFi, wants structured savings | Wants yield-bearing savings discipline |

### 2.2 User Demographics

- Age: 20-40
- Geography: Global (India, SE Asia, Africa, Latin America priority)
- Crypto Experience: Beginner to Intermediate
- Financial Goal: Build savings, build credit, earn yield

---

## 3. Feature Matrix

### 3.1 MVP (Must-Have)

| Feature | Description | On-Chain | Off-Chain |
|---------|-------------|----------|-----------|
| **Social Auth** | Google/Twitter/Discord login | — | Supabase Auth |
| **Wallet Connect** | Phantom/Solflare/Backpack | — | Wallet Adapter |
| **Create Circle** | Configure contribution, duration, members | `initialize_circle` | API + DB |
| **Join Circle** | Trust-based stake, join queue | `join_circle` | API + DB |
| **Contribute** | Monthly USDC contribution | `contribute` | API + webhook |
| **Payout (Fixed)** | Rotation-based pot distribution | `distribute_pot` | API + webhook |
| **Trust Score** | 0-1000 score with 4 tiers | `TrustScore` PDA | Dashboard |
| **Social Proofs** | Twitter/Discord verification | `add/verify_social_proof` | API |
| **Insurance** | Stake/claim/return | `InsurancePool` | API |
| **Dashboard** | Overview of circles, score, activity | — | Frontend |
| **Circle Browser** | Discover public circles | — | API + Frontend |
| **Notifications** | Contribution reminders, payouts | — | Supabase Realtime |

### 3.2 Nice-to-Have (Post-MVP)

| Feature | Description |
|---------|-------------|
| **Auction Payout** | Bid for early payout (on-chain code exists) |
| **Random Payout** | Random selection (on-chain code exists) |
| **Governance** | Proposals + quadratic voting (on-chain code exists) |
| **Yield Display** | Show Solend/Reflect APY and earnings |
| **Automation** | Switchboard-powered auto-contributions |
| **Revenue Reports** | Treasury analytics dashboard |
| **Leaderboard** | Trust score ranking |
| **Dark Mode** | UI theme toggle |
| **PWA** | Installable mobile app |

### 3.3 Out of Scope (Future)

| Feature | Notes |
|---------|-------|
| Arcium Privacy | MPC integration complex, defer |
| Multi-chain | Focus Solana first |
| Fiat on/off ramp | Requires partnerships |
| Mobile native app | PWA sufficient for MVP |
| Institutional API | B2B feature, post-growth |
| Token launch | Not needed for MVP |

---

## 4. User Flows

### 4.1 Onboarding Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Landing     │───▶│  Social     │───▶│  Connect    │───▶│  Initialize │
│  Page        │    │  Login      │    │  Wallet     │    │  Trust Score│
│  (CTA)       │    │  (OAuth)    │    │  (Phantom)  │    │  (On-chain) │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                 │
                                                                 ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │  Dashboard  │◀───│  Add Social │◀───│  Profile    │
                   │  (Ready!)   │    │  Proofs     │    │  Setup      │
                   └─────────────┘    └─────────────┘    └─────────────┘
```

**Steps:**
1. User visits landing page → clicks "Get Started"
2. Selects OAuth provider (Google/Twitter/Discord)
3. Supabase Auth creates session
4. Prompted to connect Solana wallet (Phantom recommended)
5. Backend creates user record with `wallet_address`
6. Frontend calls `initialize_trust_score` — user signs transaction
7. Optional: User adds social proofs (Twitter handle, Discord)
8. Redirected to Dashboard with score = 0, tier = Newcomer

### 4.2 Create Circle Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Click       │───▶│  Configure  │───▶│  Review &   │───▶│  Sign &     │
│  "Create     │    │  Circle     │    │  Confirm    │    │  Deploy     │
│   Circle"    │    │  Details    │    │  Settings   │    │  (Wallet)   │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                 │
                                                                 ▼
                                                          ┌─────────────┐
                                                          │  Circle     │
                                                          │  Created!   │
                                                          │  Share link │
                                                          └─────────────┘
```

**Configuration Fields:**
| Field | Type | Validation |
|-------|------|-----------|
| Circle Name | Text | 3-100 chars |
| Description | Text | Optional, max 500 chars |
| Contribution Amount | Number | Min 1 USDC |
| Duration | Select | 1-24 months |
| Max Members | Select | 2-20 |
| Penalty Rate | Slider | 0-50% |
| Visibility | Toggle | Public/Private |
| Payout Method | Select | Fixed Rotation (MVP) |
| Min Trust Tier | Select | Newcomer/Silver/Gold/Platinum |

**On-chain cost:** ~0.07 SOL ($1.40 at $20/SOL)

### 4.3 Join Circle Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Browse or   │───▶│  View Circle│───▶│  Review     │───▶│  Sign Tx    │
│  Search      │    │  Details    │    │  Stake Req  │    │  (stake +   │
│  Circles     │    │  + Members  │    │  + Insurance│    │   insurance)│
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                 │
                                                                 ▼
                                                          ┌─────────────┐
                                                          │  Joined!    │
                                                          │  First due: │
                                                          │  [date]     │
                                                          └─────────────┘
```

**Stake Requirements Display:**
```
Your Trust Tier: Silver (Score: 380)
Stake Multiplier: 1.5x
Contribution: 100 USDC/month
Required Stake: 150 USDC
Insurance (10-20%): 10-20 USDC
────────────────────────────
Total to deposit: 160-170 USDC
```

### 4.4 Monthly Contribution Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Dashboard   │───▶│  Click      │───▶│  Confirm    │───▶│  Sign Tx    │
│  shows "Due" │    │  "Contribute"│   │  100 USDC   │    │  (Phantom)  │
│  badge       │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                 │
                                                                 ▼
                                                          ┌─────────────┐
                                                          │  Confirmed! │
                                                          │  Trust score│
                                                          │  +X points  │
                                                          └─────────────┘
```

### 4.5 Receive Payout Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Notification│───▶│  View Payout│───▶│  Claim      │
│  "Your turn  │    │  Amount     │    │  (auto or   │
│   for payout"│    │  + yield    │    │   manual)   │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  Received!  │
                                       │  500 USDC   │
                                       │  + 2.5 yield│
                                       └─────────────┘
```

---

## 5. Screen Specifications

### Screen 1: Landing Page

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Halo Protocol            [Get Started] [Login]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│           Build Credit. Save Together.                   │
│           Earn Yield. On Solana.                        │
│                                                          │
│  Transform lending circles into portable credit          │
│  scores with smart contract security.                    │
│                                                          │
│           [Create Your Circle →]                         │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 50+      │  │ 94%      │  │ 0        │              │
│  │ Users    │  │ Retention│  │ Defaults │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  HOW IT WORKS                                            │
│  1. Create or join a lending circle                      │
│  2. Make monthly contributions (USDC)                    │
│  3. Build your Trust Score (0-1000)                     │
│  4. Earn yield on idle funds                            │
│                                                          │
│  FEATURES                                                │
│  [Trust Score] [Insurance] [Yield] [Governance]         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Screen 2: Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard  Circles  Trust  [🔔 3] [Wallet ▼] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Welcome back, Kunal!                                    │
│                                                          │
│  ┌────────────────────┐  ┌──────────────────────────┐  │
│  │  TRUST SCORE       │  │  QUICK ACTIONS           │  │
│  │  ┌───────┐         │  │                          │  │
│  │  │  380  │ Silver  │  │  [+ Create Circle]       │  │
│  │  │ /1000 │         │  │  [Browse Circles]        │  │
│  │  └───────┘         │  │  [Add Social Proof]      │  │
│  │  Payment: ████░ 320│  │                          │  │
│  │  Complete: ███░░ 240│  └──────────────────────────┘  │
│  │  DeFi:    █░░░░  60│                                 │
│  │  Social:  ██░░░  40│                                 │
│  └────────────────────┘                                 │
│                                                          │
│  ACTIVE CIRCLES                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  🟢 Dev Team Savings                             │  │
│  │  100 USDC/mo • 5/5 members • Month 3/6          │  │
│  │  Next contribution: Feb 15 (9 days)              │  │
│  │  Your position: #3 in payout queue               │  │
│  │  ████████████░░░░░░░ 50%              [View →]   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  🟢 Crypto Builders Circle                       │  │
│  │  50 USDC/mo • 8/10 members • Month 1/12         │  │
│  │  ⚠️ Contribution due TODAY                       │  │
│  │  ░░░░░░░░░░░░░░░░░░░ 8%              [Pay Now →]│  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  RECENT ACTIVITY                                         │
│  • Contributed 100 USDC to Dev Team Savings (2h ago)    │
│  • Trust Score updated: 370 → 380 (yesterday)           │
│  • Payout received: 500 USDC from Alpha Circle (3d ago) │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Screen 3: Circle Detail

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Circles                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Dev Team Savings                                        │
│  Created by alice.sol • Public • Fixed Rotation         │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │ 100     │ │ 6       │ │ 5/5     │ │ 3/6     │     │
│  │ USDC/mo │ │ months  │ │ members │ │ month   │     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│                                                          │
│  [Contribute Now: 100 USDC]                             │
│                                                          │
│  ═══════════════════════════════════════                │
│  CONTRIBUTION TRACKER                                    │
│  ─────────────────────────────────────                  │
│  Month    M1    M2    M3    M4    M5    M6              │
│  alice    ✅    ✅    ✅    ⬜    ⬜    ⬜              │
│  bob      ✅    ✅    ⚠️    ⬜    ⬜    ⬜              │
│  carol    ✅    ✅    ✅    ⬜    ⬜    ⬜              │
│  dave     ✅    ✅    ✅    ⬜    ⬜    ⬜              │
│  you      ✅    ✅    ✅    ⬜    ⬜    ⬜              │
│                                                          │
│  ═══════════════════════════════════════                │
│  PAYOUT SCHEDULE                                         │
│  ─────────────────────────────────────                  │
│  M1: alice    ✅ 500 USDC (distributed)                 │
│  M2: bob      ✅ 500 USDC (distributed)                 │
│  M3: carol    🔜 Pending (25th)                         │
│  M4: dave     ⬜ Upcoming                                │
│  M5: you      ⬜ Upcoming                                │
│  M6: alice    ⬜ Upcoming                                │
│                                                          │
│  ═══════════════════════════════════════                │
│  MEMBERS (5)                                             │
│  ─────────────────────────────────────                  │
│  👤 alice.sol   Gold (650)    Stake: 100 USDC           │
│  👤 bob.sol     Silver (380)  Stake: 150 USDC           │
│  👤 carol.sol   Gold (520)    Stake: 100 USDC           │
│  👤 dave.sol    Newcomer (80) Stake: 200 USDC           │
│  👤 you         Silver (380)  Stake: 150 USDC           │
│                                                          │
│  ═══════════════════════════════════════                │
│  YIELD & INSURANCE                                       │
│  ─────────────────────────────────────                  │
│  Total in Escrow: 500 USDC                              │
│  Yield Earned: 2.34 USDC (4.2% APY)                    │
│  Insurance Pool: 75 USDC                                │
│  Your Yield Share: 0.47 USDC                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Screen 4: Trust Score Page

```
┌─────────────────────────────────────────────────────────┐
│  ← Dashboard                                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  YOUR TRUST SCORE                                        │
│                                                          │
│            ┌─────────────────┐                          │
│            │      380        │                          │
│            │    ───────      │                          │
│            │    SILVER       │                          │
│            │   out of 1000   │                          │
│            └─────────────────┘                          │
│                                                          │
│  SCORE BREAKDOWN                                         │
│  ─────────────────                                      │
│  Payment History   ████████████░░░░░░░░░  320/400 (40%)│
│  Circle Completion ██████████░░░░░░░░░░░  240/300 (30%)│
│  DeFi Activity     ███░░░░░░░░░░░░░░░░░░   60/200 (20%)│
│  Social Proofs     ████░░░░░░░░░░░░░░░░░   40/100 (10%)│
│                                                          │
│  TIER BENEFITS                                           │
│  ─────────────                                          │
│  Current: Silver (250-499)                              │
│  Stake Requirement: 1.5x contribution                   │
│  Next Tier: Gold at 500 points (need 120 more)          │
│  Gold Benefits: 1.0x stake, premium circles access      │
│                                                          │
│  HOW TO IMPROVE                                          │
│  ────────────                                           │
│  ✅ Make on-time contributions (+up to 80 pts)          │
│  ✅ Complete more circles (+up to 60 pts)               │
│  🔗 Verify more social proofs (+up to 60 pts)          │
│  📊 Increase DeFi activity (+up to 140 pts)            │
│                                                          │
│  SOCIAL PROOFS                                           │
│  ─────────────                                          │
│  ✅ Twitter: @kunal_xxix          Verified              │
│  ✅ Discord: kunal#1234           Verified              │
│  ⬜ GitHub                        [+ Add]               │
│  ⬜ LinkedIn                      [+ Add]               │
│  ⬜ Telegram                      [+ Add]               │
│                                                          │
│  SCORE HISTORY                                           │
│  ─────────────                                          │
│  [Chart showing score over time]                        │
│  Jan: 0 → Feb: 120 → Mar: 250 → Apr: 320 → Now: 380  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Screen 5: Create Circle Wizard

```
Step 1/4: BASICS
┌─────────────────────────────────────────────────────────┐
│  Circle Name: [Dev Team Savings                      ]  │
│  Description: [Monthly savings for our dev team      ]  │
│  Visibility:  (●) Public  ( ) Private                   │
│                                          [Next →]       │
└─────────────────────────────────────────────────────────┘

Step 2/4: CONFIGURATION
┌─────────────────────────────────────────────────────────┐
│  Contribution:  [100] USDC per month                    │
│  Duration:      [6] months                              │
│  Max Members:   [5]                                     │
│  Penalty Rate:  [5] % ──────●───── 50%                 │
│                                          [Next →]       │
└─────────────────────────────────────────────────────────┘

Step 3/4: PAYOUT & TRUST
┌─────────────────────────────────────────────────────────┐
│  Payout Method:   (●) Fixed Rotation                    │
│                   ( ) Auction (coming soon)              │
│                   ( ) Random (coming soon)               │
│                                                          │
│  Min Trust Tier:  [Newcomer ▼]                          │
│  Require Insurance: [✅]                                 │
│                                          [Next →]       │
└─────────────────────────────────────────────────────────┘

Step 4/4: REVIEW & CREATE
┌─────────────────────────────────────────────────────────┐
│  Dev Team Savings                                        │
│  ─────────────────                                      │
│  Contribution: 100 USDC/month                           │
│  Duration: 6 months                                      │
│  Members: up to 5                                        │
│  Penalty: 5%                                             │
│  Payout: Fixed Rotation                                  │
│  Min Trust: Newcomer                                     │
│                                                          │
│  Estimated cost: ~0.07 SOL (~$1.40)                     │
│                                                          │
│  [Create Circle →] (opens wallet for signing)           │
└─────────────────────────────────────────────────────────┘
```

---

## 6. On-Chain Transaction Flows

### 6.1 Transaction Building Pattern

All transactions follow the same pattern:

```
User Action → API builds unsigned tx → Frontend signs → API submits → Webhook syncs DB
```

```typescript
// Frontend: TransactionService
class TransactionService {
  async createCircle(params: CreateCircleParams) {
    // 1. API builds transaction
    const { transaction, circlePda } = await api.post("/circles/create", params);
    
    // 2. Decode and sign
    const tx = Transaction.from(Buffer.from(transaction, "base64"));
    const signed = await wallet.signTransaction(tx);
    
    // 3. Submit
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(sig, "confirmed");
    
    // 4. Return (webhook will sync to DB)
    return { signature: sig, circlePda };
  }
}
```

### 6.2 Transaction Types & Costs

| Action | Instructions | Est. SOL Cost | User Pays |
|--------|-------------|---------------|-----------|
| Initialize Trust Score | 1 | 0.01 | Yes |
| Create Circle | 2 (circle + escrow) | 0.07 | Yes |
| Join Circle | 1 + token transfer | 0.005 | Yes |
| Contribute | 1 + token transfer | 0.0003 | Yes |
| Claim Payout | 1 + token transfer | 0.0003 | Yes |
| Add Social Proof | 1 | 0.0003 | Yes |

---

## 7. API Specification

### 7.1 Authentication Endpoints

```typescript
// POST /api/auth/login
// Body: { provider: "google" | "twitter" | "discord" }
// Returns: { redirectUrl: string }

// POST /api/auth/wallet-connect
// Body: { walletAddress: string, signature: string, message: string }
// Returns: { user: User, session: Session }

// GET /api/auth/session
// Headers: Authorization: Bearer <token>
// Returns: { user: User } | 401
```

### 7.2 Circle Endpoints

```typescript
// GET /api/circles?status=active&page=1&limit=20
// Returns: { circles: Circle[], total: number, page: number }

// POST /api/circles
// Body: { name, description, contributionAmount, durationMonths, maxMembers, penaltyRate, payoutMethod, minTrustTier, isPublic }
// Returns: { transaction: string (base64), circlePda: string }

// GET /api/circles/:id
// Returns: { circle: CircleDetail, members: Member[], contributions: Contribution[] }

// POST /api/circles/:id/join
// Body: { stakeAmount: number }
// Returns: { transaction: string (base64), memberPda: string }

// POST /api/circles/:id/contribute
// Returns: { transaction: string (base64) }

// POST /api/circles/:id/claim-payout
// Returns: { transaction: string (base64) }
```

### 7.3 Trust Score Endpoints

```typescript
// POST /api/trust/initialize
// Returns: { transaction: string (base64), trustScorePda: string }

// GET /api/trust/me
// Returns: { score: number, tier: string, breakdown: ScoreBreakdown, history: ScoreHistory[] }

// POST /api/trust/social-proof
// Body: { proofType: string, identifier: string }
// Returns: { transaction: string (base64) }

// GET /api/trust/leaderboard?limit=50
// Returns: { users: LeaderboardEntry[] }
```

### 7.4 Webhook Endpoint

```typescript
// POST /api/webhooks/helius
// Body: HeliusWebhookPayload[]
// Processing: Decode instruction → update Supabase → send notifications
// Returns: 200 OK
```

---

## 8. Database Schema

*(Full SQL schema provided in Technical Architecture document, Section 13)*

**Key Tables:**

| Table | Purpose | Est. Rows (100 users) |
|-------|---------|----------------------|
| `users` | User accounts + wallet binding | 100 |
| `social_proofs` | Verified social identities | 200 |
| `circles` | Circle configuration + state | 20 |
| `circle_members` | Membership records | 100 |
| `contributions` | Monthly payment records | 600 |
| `payouts` | Distribution records | 60 |
| `proposals` | Governance proposals | 5 |
| `votes` | Voting records | 20 |
| `notifications` | User notifications | 2,000 |
| `activity_log` | Audit trail | 5,000 |

**Supabase Free Tier Limits:**
- 500MB storage → sufficient for ~50K users
- 50K monthly active users → sufficient
- 2GB bandwidth → sufficient for MVP
- 500K edge function invocations → sufficient

---

## 9. Notification System

### 9.1 Notification Types & Triggers

| Type | Trigger | Urgency | Channel |
|------|---------|---------|---------|
| `contribution_reminder_7d` | 7 days before due | Low | In-app |
| `contribution_reminder_3d` | 3 days before due | Medium | In-app + push |
| `contribution_reminder_1d` | 1 day before due | High | In-app + push |
| `contribution_overdue` | Past due date | Critical | In-app + push |
| `contribution_received` | Contribution confirmed | Info | In-app |
| `payout_your_turn` | Your payout slot | High | In-app + push |
| `payout_distributed` | Funds received | Info | In-app |
| `member_joined` | New member in your circle | Info | In-app |
| `member_defaulted` | Default in your circle | High | In-app |
| `trust_score_updated` | Score change | Info | In-app |
| `circle_completed` | Circle finished | High | In-app + push |
| `proposal_created` | New governance proposal | Low | In-app |
| `insurance_claimed` | Insurance claim processed | High | In-app |

### 9.2 Implementation

```typescript
// Supabase Realtime subscription (frontend)
const { data: notifications } = supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .eq('read', false)
  .order('created_at', { ascending: false })
  .limit(20);

// Real-time listener
supabase
  .channel('user-notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, handleNewNotification)
  .subscribe();
```

---

## 10. Free Infrastructure Stack

### 10.1 Complete Stack Overview

```
┌─────────────────────────────────────────────────────────┐
│                HALO MVP INFRASTRUCTURE                    │
│                    Monthly Cost: $0                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  FRONTEND: Vercel (Free)                         │   │
│  │  Next.js 14 + Tailwind + shadcn/ui               │   │
│  │  100GB bandwidth, serverless API routes           │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  DATABASE: Supabase (Free)                       │   │
│  │  PostgreSQL 500MB + Auth 50K MAU + Realtime      │   │
│  │  + Row Level Security + Edge Functions            │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  BLOCKCHAIN: Solana + Helius RPC (Free: 100K)    │   │
│  │  Anchor Program + Helius Webhooks + Indexing      │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ORACLES: Switchboard (Free: 100) + Pyth (Free)  │   │
│  │  Automation crons + Price feeds                    │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  SUPPORTING: Upstash Redis (Free) + Sentry (Free)│   │
│  │  Rate limiting + Error tracking                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 10.2 Scaling Path (When Free Tiers Are Exceeded)

| Service | Free Limit | When to Upgrade | Paid Cost |
|---------|-----------|----------------|-----------|
| Supabase | 500MB, 50K MAU | ~5K users | $25/mo (Pro) |
| Vercel | 100GB BW | ~50K visits/day | $20/mo (Pro) |
| Helius | 100K credits | ~5K tx/day | $49/mo (Starter) |
| Upstash | 10K cmds/day | ~1K users | $10/mo |

**Total cost at 5K users: ~$104/month**

---

## 11. Analytics & Metrics

### 11.1 Product Metrics (Tracked via Supabase)

| Metric | Query | Dashboard |
|--------|-------|-----------|
| Total Users | `SELECT COUNT(*) FROM users` | Admin |
| Active Users (WAU) | `SELECT COUNT(DISTINCT user_id) FROM activity_log WHERE created_at > NOW() - '7d'` | Admin |
| Circles Created | `SELECT COUNT(*) FROM circles` | Admin |
| Active Circles | `SELECT COUNT(*) FROM circles WHERE status = 'active'` | Admin |
| Total Contributions | `SELECT SUM(amount) FROM contributions` | Admin |
| Avg Trust Score | `SELECT AVG(trust_score) FROM users WHERE trust_score > 0` | Admin |
| Default Rate | `SELECT COUNT(*) FILTER (WHERE status = 'defaulted') / COUNT(*) FROM circle_members` | Admin |
| Retention (30d) | Users active in last 30 days / total users | Admin |

### 11.2 On-Chain Metrics

| Metric | Source | Tracking |
|--------|--------|----------|
| TVL (Total Value Locked) | Sum of all escrow token accounts | Helius webhook |
| Protocol Revenue | Treasury PDA balance | On-chain query |
| Yield Generated | Sum of yield_earned across escrows | On-chain query |
| Gas Costs | Transaction fee analysis | Helius analytics |

---

## 12. Success Criteria

### 12.1 MVP Launch Criteria

| Criteria | Metric | Target |
|----------|--------|--------|
| Functional | All MVP features working | 100% |
| Deployed | Live on mainnet + production URL | ✅ |
| Users | Registered accounts | ≥ 50 |
| Circles | Active circles | ≥ 5 |
| Contributions | Total contributions | ≥ 100 |
| Zero Critical | No data loss or fund loss bugs | 0 |
| Performance | Page load time | < 3s |
| Mobile | Responsive on 375px+ | ✅ |

### 12.2 Month 1 Targets

| Metric | Target |
|--------|--------|
| Users | 100 |
| Active circles | 10 |
| Contributions | 500 |
| Default rate | < 5% |
| Trust scores > 250 (Silver+) | 30% of users |
| NPS | > 40 |

---

## 13. Known Limitations

### 13.1 MVP Limitations

| Limitation | Impact | Mitigation |
|-----------|--------|------------|
| USDC only | Limits to USDC holders | Add SOL/USDT post-MVP |
| Fixed rotation only | No auction/random payouts in UI | On-chain code exists, UI later |
| No mobile app | Web-only experience | PWA support, responsive design |
| No privacy | All circle data public | Arcium integration post-MVP |
| Manual yield claiming | Members must claim yield | Automation post-MVP |
| English only | Limits non-English users | i18n post-MVP |
| Phantom-focused | Other wallets supported but not optimized | Wallet adapter handles all |

### 13.2 Technical Debt

| Item | Description | Priority |
|------|-------------|----------|
| `insurance.rs` error module | Uses local ErrorCode instead of HaloError | P0 (pre-launch) |
| `yield_integration.rs` signer seeds | Missing PDA signer for escrow transfers | P0 (pre-launch) |
| `bid_for_payout` queue logic | Simplified insertion, needs proper ordering | P1 |
| Account reallocation | Some Vecs may need realloc for large circles | P2 |
| Solend real CPI | Currently mock transfers, need real Solend SDK | P1 |

---

*End of MVP Product Requirements Document*
