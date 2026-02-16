# Halo Protocol: Solana POC Implementation Plan

**Version:** 2.0.0  
**Date:** February 2026  
**Author:** XXIX Labs (29Projects)  
**Classification:** Implementation Roadmap  
**Target Chain:** Solana (Mainnet-Beta)

---

## Table of Contents

1. [Overview & Objectives](#1-overview--objectives)
2. [Current State Assessment](#2-current-state-assessment)
3. [Phase 1: Foundation (Weeks 1-2)](#3-phase-1-foundation-weeks-1-2)
4. [Phase 2: Core Protocol (Weeks 3-4)](#4-phase-2-core-protocol-weeks-3-4)
5. [Phase 3: Advanced Features (Weeks 5-6)](#5-phase-3-advanced-features-weeks-5-6)
6. [Phase 4: Integration & Yield (Weeks 7-8)](#6-phase-4-integration--yield-weeks-7-8)
7. [Phase 5: Frontend MVP (Weeks 9-10)](#7-phase-5-frontend-mvp-weeks-9-10)
8. [Phase 6: Testing & Deployment (Weeks 11-12)](#8-phase-6-testing--deployment-weeks-11-12)
9. [Infrastructure Setup Guide](#9-infrastructure-setup-guide)
10. [Testing Strategy](#10-testing-strategy)
11. [Budget Breakdown](#11-budget-breakdown)
12. [Risk Assessment & Mitigation](#12-risk-assessment--mitigation)
13. [Success Metrics](#13-success-metrics)
14. [Post-MVP Roadmap](#14-post-mvp-roadmap)

---

## 1. Overview & Objectives

### 1.1 POC Goal

Deliver a production-ready MVP of Halo Protocol on Solana Mainnet-Beta with:
- Functional lending circles (ROSCA) with USDC contributions
- On-chain trust scoring (0-1000) with social proof verification
- Yield generation on idle funds (Solend integration)
- Insurance pool for default protection
- Governance and auction mechanisms
- Full web frontend with wallet integration

### 1.2 Key Constraints

| Constraint | Approach |
|-----------|----------|
| Budget | $0 infrastructure (all free tiers) |
| Timeline | 12 weeks to mainnet |
| Team | Solo developer (Kunal) |
| Existing Code | Anchor program 80% complete |
| Users | Target: 100 users in first month |

### 1.3 What's Already Built

The Anchor program is substantially complete with:
- ✅ Circle lifecycle (create, join, contribute, distribute, leave)
- ✅ Trust score system (0-1000, 4 tiers, social proofs)
- ✅ ROSCA payout methods (fixed, auction, random)
- ✅ Governance (proposals, quadratic voting, execution)
- ✅ Auction system (create, bid, settle)
- ✅ Insurance pool (stake, claim, return, slash)
- ✅ Yield integration scaffolding (Solend + Reflect)
- ✅ Revenue system (treasury, fees, reports)
- ✅ Automation state (Switchboard)
- ✅ Privacy structures (Arcium MPC)
- ⬜ Missing: Tests, frontend, backend API, database, deployment

---

## 2. Current State Assessment

### 2.1 Code Audit Findings

| File | LOC | Status | Issues to Fix |
|------|-----|--------|---------------|
| `lib.rs` | ~180 | ✅ Complete | None |
| `state.rs` | ~900 | ✅ Complete | Account space calculations need verification |
| `errors.rs` | ~100 | ✅ Complete | None |
| `instructions.rs` | ~1200 | ⚠️ 90% | Some ROSCA instructions need escrow signer seeds |
| `revenue.rs` | ~350 | ✅ Complete | None |
| `insurance.rs` | ~300 | ⚠️ 85% | Uses wrong error module (local ErrorCode vs HaloError) |
| `yield_integration.rs` | ~200 | ⚠️ 80% | Solend CPI needs real program ID, missing signer seeds |

### 2.2 Priority Fixes Before Testing

1. **insurance.rs**: Replace local `ErrorCode` with `HaloError` from errors.rs
2. **yield_integration.rs**: Add proper escrow PDA signer seeds for transfers
3. **instructions.rs**: Fix `bid_for_payout` queue ordering logic
4. **state.rs**: Verify all `space()` calculations against actual field sizes
5. **Cargo.toml**: Consider adding `solend-sdk` for real CPI integration

---

## 3. Phase 1: Foundation (Weeks 1-2)

### Week 1: Fix & Compile

**Objective:** Get the program compiling cleanly and passing basic tests.

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Fix `insurance.rs` error module imports | Clean compile |
| 1 | Fix `yield_integration.rs` signer seeds | Clean compile |
| 2 | Verify all account `space()` calculations | Spreadsheet of sizes |
| 2 | Fix `bid_for_payout` queue logic | Working auction flow |
| 3 | Run `anchor build` — fix all compiler errors | Successful build |
| 3 | Generate IDL (`anchor build` outputs IDL) | `target/idl/halo_protocol.json` |
| 4 | Write first 5 unit tests (init circle, trust score) | Passing tests |
| 5 | Set up local validator testing environment | `anchor test` passing |

**Deliverables:**
- [ ] `anchor build` succeeds
- [ ] 5 basic tests passing
- [ ] IDL generated

### Week 2: Infrastructure Setup

**Objective:** Set up all free-tier infrastructure.

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Create Supabase project + run SQL schema | Database live |
| 1 | Configure Supabase Auth (Google, Twitter, Discord) | OAuth working |
| 2 | Create Next.js project with wallet adapter | Frontend scaffold |
| 2 | Set up Vercel project + env vars | Preview URL live |
| 3 | Register Helius account (free tier) | RPC endpoint |
| 3 | Set up Helius webhooks for transaction monitoring | Webhook URL |
| 4 | Create Upstash Redis instance | Redis URL |
| 4 | Deploy Anchor program to Devnet | Devnet program ID |
| 5 | Verify all services connected | Integration smoke test |

**Infrastructure Checklist:**

```
□ Supabase Project
  □ PostgreSQL database created
  □ Schema migrated (users, circles, members, contributions, etc.)
  □ RLS policies applied
  □ Auth providers configured (Google, Twitter, Discord)
  □ API keys stored in Vercel env

□ Vercel Project
  □ Next.js deployed
  □ Environment variables set
  □ Custom domain (optional)
  □ Preview deployments working

□ Helius Account
  □ Free tier activated (100K credits/month)
  □ Devnet RPC endpoint
  □ Mainnet RPC endpoint (for later)
  □ Webhook endpoint registered

□ Upstash Redis
  □ Database created
  □ REST API token
  □ Rate limiting configured

□ Solana Devnet
  □ Program deployed
  □ Test wallets funded (airdrop)
  □ Token mint created (devnet USDC)
```

---

## 4. Phase 2: Core Protocol (Weeks 3-4)

### Week 3: Complete Test Suite

**Objective:** Comprehensive tests for all core instructions.

| Test Category | Tests | Priority |
|--------------|-------|----------|
| Circle Lifecycle | init, join, contribute, distribute, leave | P0 |
| Trust Score | init, update, add proof, verify, complete | P0 |
| Fee Collection | distribute with fee, management fees | P0 |
| ROSCA Payouts | claim_payout, process_round | P1 |
| Edge Cases | overflow, duplicate member, full circle | P0 |
| Insurance | stake, claim, return_with_bonus, slash | P1 |
| Governance | create_proposal, vote, execute | P1 |

**Test File Structure:**

```
tests/
├── circle-lifecycle.ts      # Core circle operations
├── trust-score.ts           # Trust score system
├── rosca-payouts.ts         # Payout methods
├── governance.ts            # Proposals and voting
├── insurance.ts             # Insurance pool
├── revenue.ts               # Fee collection
├── yield-integration.ts     # Solend mocks
├── automation.ts            # Switchboard mocks
└── utils/
    ├── helpers.ts           # PDA derivation, token setup
    └── constants.ts         # Test values
```

### Week 4: Backend API Development

**Objective:** Build the REST API layer connecting frontend to Solana + Supabase.

```
api/
├── auth/
│   ├── login.ts             # OAuth flow
│   ├── wallet-connect.ts    # Wallet binding
│   └── session.ts           # Session management
├── users/
│   ├── profile.ts           # Get/update profile
│   ├── trust-score.ts       # Trust score details
│   └── notifications.ts     # Notification management
├── circles/
│   ├── list.ts              # Browse/search circles
│   ├── create.ts            # Create circle (build tx)
│   ├── [id]/
│   │   ├── details.ts       # Circle details
│   │   ├── join.ts          # Join (build tx)
│   │   ├── contribute.ts    # Contribute (build tx)
│   │   └── payout.ts        # Claim payout (build tx)
├── governance/
│   ├── proposals.ts         # List/create proposals
│   └── vote.ts              # Cast vote
├── transactions/
│   ├── build.ts             # Build unsigned tx
│   └── submit.ts            # Submit signed tx
└── webhooks/
    └── helius.ts            # Transaction event handler
```

**Key API Pattern: Transaction Building**

```typescript
// Backend builds unsigned transaction, frontend signs
// POST /api/circles/create
export async function POST(req: Request) {
  const { contributionAmount, durationMonths, maxMembers, penaltyRate } = await req.json();
  const user = await getAuthUser(req);
  
  // Build Anchor instruction
  const ix = await program.methods
    .initializeCircle(
      new BN(contributionAmount),
      durationMonths,
      maxMembers,
      penaltyRate
    )
    .accounts({
      circle: circlePda,
      escrow: escrowPda,
      creator: user.walletAddress,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  
  // Return serialized transaction for client signing
  const tx = new Transaction().add(ix);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = new PublicKey(user.walletAddress);
  
  return Response.json({
    transaction: tx.serialize({ requireAllSignatures: false }).toString('base64'),
    circlePda: circlePda.toString(),
  });
}
```

---

## 5. Phase 3: Advanced Features (Weeks 5-6)

### Week 5: Webhook Processing & State Sync

**Objective:** Build the Helius webhook handler to sync on-chain state to Supabase.

```typescript
// POST /api/webhooks/helius
export async function handleHeliusWebhook(events: HeliusEvent[]) {
  for (const event of events) {
    const decoded = decodeAnchorInstruction(event);
    
    switch (decoded.name) {
      case "initializeCircle":
        await supabase.from("circles").insert({
          on_chain_pubkey: decoded.accounts.circle,
          creator_id: await getUserByWallet(decoded.accounts.creator),
          contribution_amount: decoded.data.contributionAmount,
          duration_months: decoded.data.durationMonths,
          // ...
        });
        break;
        
      case "contribute":
        await supabase.from("contributions").insert({
          circle_id: await getCircleByPubkey(decoded.accounts.circle),
          user_id: await getUserByWallet(decoded.accounts.memberAuthority),
          month: decoded.data.currentMonth,
          amount: decoded.data.amount,
          tx_signature: event.signature,
        });
        // Also update cached circle state
        break;
        
      // ... handle all 30+ instruction types
    }
  }
}
```

### Week 6: Automation & Oracle Setup

**Objective:** Configure Switchboard Functions for automated circle operations.

**Switchboard Setup (Free Tier):**

```bash
# Install Switchboard CLI
npm install -g @switchboard-xyz/cli

# Create automation function
sb solana function create \
  --name "halo-circle-automation" \
  --container "ghcr.io/halo-protocol/automation:latest" \
  --schedule "0 0 * * *"  # Daily check
```

**Automation Function Logic:**

```typescript
// Switchboard Function Container
async function main() {
  const circles = await getActiveCircles();
  
  for (const circle of circles) {
    const automation = await getCircleAutomation(circle);
    const now = Math.floor(Date.now() / 1000);
    
    // Check contribution collection
    if (automation.shouldCollectContributions(now)) {
      await program.methods
        .automatedContributionCollection()
        .accounts({ circleAutomation: automation.pubkey })
        .rpc();
    }
    
    // Check payout distribution
    if (automation.shouldDistributePayouts(now)) {
      await program.methods
        .automatedPayoutDistribution(nextRecipient)
        .accounts({ circleAutomation: automation.pubkey })
        .rpc();
    }
    
    // Check penalty enforcement
    if (automation.shouldEnforcePenalties(now)) {
      await program.methods
        .automatedPenaltyEnforcement()
        .accounts({ circleAutomation: automation.pubkey, circle: circle.pubkey })
        .rpc();
    }
  }
}
```

**Pyth Price Feed Integration:**

```typescript
// For displaying SOL/USD prices and gas estimation
import { PriceServiceConnection } from "@pythnetwork/price-service-client";

const pyth = new PriceServiceConnection("https://hermes.pyth.network");

export async function getSOLPrice(): Promise<number> {
  const feeds = await pyth.getLatestPriceFeeds([
    "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d" // SOL/USD
  ]);
  return feeds[0].price.price * Math.pow(10, feeds[0].price.expo);
}
```

---

## 6. Phase 4: Integration & Yield (Weeks 7-8)

### Week 7: Solend Yield Integration

**Objective:** Connect Solend for idle fund yield generation.

**Solend Integration Steps:**

1. **Create Solend reserve accounts** for USDC lending
2. **Implement deposit flow**: escrow → Solend (when pool has excess)
3. **Implement withdraw flow**: Solend → escrow (before payout)
4. **Yield calculation**: Track cToken exchange rate changes
5. **Fee deduction**: 0.25% yield fee to treasury

```typescript
// Solend SDK integration
import { SolendAction } from "@solendprotocol/solend-sdk";

// Deposit to Solend when escrow has idle funds
async function depositToSolend(circle: PublicKey, amount: number) {
  const action = await SolendAction.buildDepositTxns(
    connection,
    amount,
    "USDC",
    escrowAuthority,
    "production"  // or "devnet"
  );
  
  // Execute via program CPI
  await program.methods
    .depositToSolend(new BN(amount))
    .accounts({ /* ... */ })
    .rpc();
}
```

### Week 8: Notification System & Real-time Updates

**Objective:** Build notification system and real-time UI updates.

**Notification Types:**

| Type | Trigger | Channel |
|------|---------|---------|
| `contribution_due` | 3 days before due date | Push + In-app |
| `contribution_received` | On-chain contribution event | In-app |
| `payout_available` | Your turn for payout | Push + In-app |
| `payout_distributed` | Payout sent to you | Push + In-app |
| `member_joined` | New member in your circle | In-app |
| `member_defaulted` | Member missed contribution | In-app |
| `trust_score_updated` | Score recalculated | In-app |
| `proposal_created` | New governance proposal | In-app |
| `circle_completed` | Circle finished | Push + In-app |

**Supabase Realtime:**

```typescript
// Subscribe to real-time notifications
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    showToast(payload.new.title, payload.new.body);
  })
  .subscribe();
```

---

## 7. Phase 5: Frontend MVP (Weeks 9-10)

### Week 9: Core UI Screens

**Objective:** Build essential screens for the MVP.

| Screen | Components | Priority |
|--------|-----------|----------|
| **Landing Page** | Hero, features, CTA, social proof | P0 |
| **Login/Connect** | OAuth buttons, wallet adapter modal | P0 |
| **Dashboard** | Active circles, trust score widget, recent activity | P0 |
| **Circle Browser** | Grid/list view, filters, search | P0 |
| **Circle Detail** | Members list, contribution tracker, payout schedule, yield info | P0 |
| **Create Circle** | Multi-step wizard (config → token → payout method) | P0 |
| **Trust Score** | Score dial, component breakdown, social proof manager | P1 |
| **Profile** | Settings, connected accounts, transaction history | P1 |

**Component Library:**

```
components/
├── layout/
│   ├── Navbar.tsx             # Wallet button, navigation
│   └── Footer.tsx
├── circles/
│   ├── CircleCard.tsx         # Browse grid item
│   ├── CircleDetail.tsx       # Full circle view
│   ├── ContributionTracker.tsx # Monthly progress
│   ├── PayoutSchedule.tsx     # Who gets paid when
│   ├── MemberList.tsx         # Circle members with scores
│   └── CreateCircleWizard.tsx # Multi-step creation
├── trust/
│   ├── TrustScoreDial.tsx     # Animated score visualization
│   ├── ScoreBreakdown.tsx     # Component scores
│   └── SocialProofManager.tsx # Add/verify proofs
├── wallet/
│   ├── WalletButton.tsx       # Connect/disconnect
│   └── TransactionModal.tsx   # Sign & submit
├── governance/
│   ├── ProposalCard.tsx       # Proposal summary
│   └── VotingInterface.tsx    # Cast vote UI
└── shared/
    ├── LoadingState.tsx
    ├── ErrorBoundary.tsx
    └── NotificationBell.tsx
```

### Week 10: Polish & Mobile Responsiveness

**Objective:** Responsive design, animations, error handling.

| Task | Details |
|------|---------|
| Mobile responsive | All screens work on 375px+ |
| Loading states | Skeleton loaders for all data fetches |
| Error handling | User-friendly error messages for tx failures |
| Transaction feedback | Toast notifications for tx confirmations |
| Dark mode | Tailwind dark mode support |
| PWA manifest | Installable on mobile |
| SEO | Meta tags, OG images |
| Analytics | Vercel Analytics integration |

---

## 8. Phase 6: Testing & Deployment (Weeks 11-12)

### Week 11: End-to-End Testing

**Test Scenarios:**

```
E2E Test Plan:
├── Happy Path
│   ├── User registers (OAuth + wallet connect)
│   ├── User initializes trust score
│   ├── User adds social proofs
│   ├── User creates circle (USDC, 6 months, 5 members)
│   ├── 4 more users join
│   ├── All 5 contribute month 1
│   ├── Pot distributed to member 1
│   ├── Continue for 6 months
│   ├── Circle completes → trust scores updated
│   └── Insurance returned with 5% bonus
│
├── Edge Cases
│   ├── Member misses contribution → penalty applied
│   ├── Member defaults → insurance claimed
│   ├── Governance proposal → vote → execute
│   ├── Auction payout → bid → settle
│   ├── Circle fills up → reject new member
│   ├── Try to contribute twice in same month
│   └── Try to leave during active period
│
├── Integration
│   ├── Helius webhook processes all instruction types
│   ├── Supabase syncs with on-chain state
│   ├── Notifications delivered in real-time
│   ├── Pyth price feeds display correctly
│   └── Solend yield calculation accurate
│
└── Performance
    ├── 20 members in circle (max)
    ├── 24 month circle (max duration)
    ├── Multiple concurrent circles
    └── Transaction confirmation times
```

### Week 12: Mainnet Deployment

**Deployment Checklist:**

```
Pre-Deployment:
□ All tests passing on devnet
□ Security review complete (self-audit)
□ Account sizes verified (no rent issues)
□ Fee parameters set correctly
□ Treasury initialized
□ Revenue params initialized
□ Program built with --verifiable flag

Deployment:
□ Deploy to mainnet-beta
□ Verify program on Solscan
□ Initialize Treasury PDA
□ Initialize RevenueParams PDA
□ Initialize AutomationState PDA
□ Set up Switchboard mainnet functions
□ Configure Helius mainnet webhooks
□ Switch Supabase to production mode
□ Deploy frontend to production

Post-Deployment:
□ Monitor first transactions
□ Verify fee collection working
□ Test with small amounts first
□ Enable public access
□ Share on social media
□ Submit to Solana ecosystem registry
```

---

## 9. Infrastructure Setup Guide

### 9.1 Supabase Setup (Free Tier)

```bash
# 1. Create project at supabase.com
# 2. Run migrations
supabase db push

# 3. Configure Auth providers
# Dashboard → Authentication → Providers
# Enable: Google, Twitter, Discord

# 4. Get connection strings
# Settings → Database → Connection string
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:5432/postgres"

# 5. Get API keys
# Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

### 9.2 Helius Setup (Free: 100K Credits/Month)

```bash
# 1. Register at helius.dev
# 2. Create API key
HELIUS_API_KEY="YOUR_KEY"

# 3. RPC URLs
SOLANA_RPC_DEVNET="https://devnet.helius-rpc.com/?api-key=YOUR_KEY"
SOLANA_RPC_MAINNET="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"

# 4. Create webhook
curl -X POST https://api.helius.xyz/v0/webhooks?api-key=YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "webhookURL": "https://your-app.vercel.app/api/webhooks/helius",
    "transactionTypes": ["ANY"],
    "accountAddresses": ["58Fg8uB36CJwb9gqGxSwmR8RYBWrXMwFbTRuW1694qcd"],
    "webhookType": "enhanced"
  }'
```

### 9.3 Vercel Setup (Free Tier)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add HELIUS_API_KEY
vercel env add NEXT_PUBLIC_SOLANA_RPC_URL
vercel env add NEXT_PUBLIC_PROGRAM_ID
```

### 9.4 Upstash Redis Setup (Free Tier)

```bash
# 1. Create database at upstash.com
# 2. Get credentials
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# 3. Usage (rate limiting)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

### 9.5 Complete Environment Variables

```env
# Solana
NEXT_PUBLIC_PROGRAM_ID=58Fg8uB36CJwb9gqGxSwmR8RYBWrXMwFbTRuW1694qcd
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=KEY
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Helius
HELIUS_API_KEY=xxx

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Oracle
SWITCHBOARD_QUEUE=<queue_pubkey>
PYTH_SOL_USD_FEED=H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG

# Token Mints
NEXT_PUBLIC_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
NEXT_PUBLIC_USDC_DECIMALS=6
```

---

## 10. Testing Strategy

### 10.1 Test Pyramid

```
                    ┌───────────┐
                    │   E2E     │  5 critical user flows
                    │  (Cypress)│  
                   ─┤           ├─
                  / └───────────┘ \
                 /                  \
               ─┤  Integration (20) ├─   API + webhook tests
              / └───────────────────┘ \
             /                          \
           ─┤    Anchor Tests (50+)      ├─  On-chain instruction tests
          / └────────────────────────────┘ \
         /                                  \
       ─┤     Unit Tests (30+)               ├─  Helper functions, score calc
        └────────────────────────────────────┘
```

### 10.2 Anchor Test Coverage Targets

| Module | Tests | Coverage Target |
|--------|-------|----------------|
| Circle Lifecycle | 15 | 100% of instructions |
| Trust Score | 10 | 100% of score paths |
| ROSCA Payouts | 8 | All 3 payout methods |
| Governance | 6 | Proposal → vote → execute |
| Insurance | 6 | All 4 operations |
| Revenue | 5 | Fee collection + reports |
| Yield | 4 | Deposit/withdraw/calculate |
| Automation | 3 | Setup + trigger |
| Edge Cases | 10 | Overflow, auth, limits |

---

## 11. Budget Breakdown

### 11.1 Infrastructure Costs: $0/month

| Service | Free Tier | Limit | Sufficient For |
|---------|-----------|-------|----------------|
| Supabase | Free | 500MB DB, 50K MAU | 1,000 users |
| Vercel | Hobby | 100GB BW, serverless | 10K visits/day |
| Helius | Free | 100K credits/month | 5K tx/day |
| Upstash Redis | Free | 10K cmds/day | Rate limiting |
| Switchboard | Free | 100 feeds | 50 circles |
| Pyth | Free | Unlimited reads | ∞ |
| Sentry | Free | 5K errors/month | Error tracking |

### 11.2 Solana Costs (Mainnet)

| Operation | Cost (SOL) | Cost (USD @ $20) |
|-----------|-----------|-------------------|
| Program deployment | ~5 SOL | ~$100 |
| Initialize Treasury | ~0.002 | ~$0.04 |
| Initialize Revenue | ~0.002 | ~$0.04 |
| Create Circle | ~0.07 | ~$1.40 |
| Join Circle | ~0.005 | ~$0.10 |
| Contribute | ~0.00025 | ~$0.005 |
| Distribute Pot | ~0.00025 | ~$0.005 |

**Total estimated mainnet costs: ~$150 for initial deployment + first 100 circles**

### 11.3 Developer Time Budget

| Phase | Weeks | Focus |
|-------|-------|-------|
| Foundation | 1-2 | Fix code, setup infra |
| Core Protocol | 3-4 | Tests, backend API |
| Advanced | 5-6 | Webhooks, automation |
| Integration | 7-8 | Yield, notifications |
| Frontend | 9-10 | UI, responsiveness |
| Deployment | 11-12 | Testing, mainnet |

**Total: 12 weeks (solo developer)**

---

## 12. Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Solend integration complexity | Medium | High | Start with mock, integrate real CPI last |
| Account size exceeds rent limit | Low | High | Pre-calculate all sizes, test with max data |
| Free tier limits exceeded | Low | Medium | Monitor usage, scale to paid only if needed |
| Smart contract vulnerability | Medium | Critical | Self-audit, keep upgrade authority, start with small amounts |
| Low initial user adoption | Medium | Medium | Launch on Twitter/crypto communities, leverage existing 50 beta users |
| Switchboard automation failures | Medium | Low | Fallback: manual cron job backend |
| Transaction size limits | Low | Medium | Use versioned transactions + ALTs |

---

## 13. Success Metrics

### 13.1 POC Success Criteria (12 weeks)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Program deployed to mainnet | ✅ | On-chain verification |
| Circles created | ≥ 10 | Supabase query |
| Active users | ≥ 100 | Supabase auth count |
| Successful contributions | ≥ 500 | On-chain events |
| Pots distributed | ≥ 20 | On-chain events |
| Default rate | < 10% | On-chain member status |
| Yield generated | > 0 | Solend integration |
| Trust scores initialized | ≥ 100 | On-chain PDAs |
| Average response time | < 2s | Vercel analytics |
| Uptime | > 99% | Monitoring |

### 13.2 Technical KPIs

| KPI | Target |
|-----|--------|
| Test coverage (Anchor) | > 80% |
| API response p95 | < 500ms |
| Transaction confirmation | < 1s |
| Webhook processing latency | < 5s |
| Zero critical bugs post-launch | 0 |

---

## 14. Post-MVP Roadmap

### Phase 7: Growth (Month 4-6)

- Multi-token support (USDT, mSOL)
- Mobile app (React Native / Expo)
- Referral program
- Staking rewards for trust score leaders
- Cross-protocol credit score queries

### Phase 8: Advanced (Month 7-12)

- Arcium privacy integration (encrypted circles)
- Cross-chain credit portability
- Institutional lending pool
- Credit-to-DeFi bridge (use Halo score in other protocols)
- DAO governance for protocol parameters

### Phase 9: Scale (Year 2)

- Multi-chain deployment (Ethereum L2s, Near, Aptos)
- Fiat on/off ramp integration
- Regulatory compliance framework
- Enterprise API for fintech partners
- Target: 100K users, $10M TVL

---

## Appendix: Quick Start Commands

```bash
# Clone & setup
git clone https://github.com/xxix-labs/halo-protocol.git
cd halo-protocol

# Install dependencies
yarn install
anchor build

# Run tests
anchor test

# Deploy to devnet
solana config set --url devnet
solana airdrop 5
anchor deploy

# Start frontend
cd app
yarn dev

# Start with local validator
solana-test-validator &
anchor deploy --provider.cluster localnet
```

---

*End of POC Implementation Plan*
