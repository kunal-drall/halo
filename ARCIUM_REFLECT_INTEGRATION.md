# Arcium & Reflect Integration Guide

## Overview

This document provides a comprehensive guide to the Arcium and Reflect integrations in Halo Protocol, enabling privacy-preserving operations and dual yield generation for decentralized lending circles.

## Table of Contents

1. [Arcium Privacy Integration](#arcium-privacy-integration)
2. [Reflect Yield Integration](#reflect-yield-integration)
3. [Quick Start](#quick-start)
4. [API Reference](#api-reference)
5. [Examples](#examples)
6. [Deployment](#deployment)

---

## Arcium Privacy Integration

### Overview

Arcium provides Multi-Party Computation (MPC) privacy features that allow sensitive data to remain encrypted while still enabling computations and verifications.

### Key Features

#### 1. **Encrypted Trust Score Calculation**

Trust scores are calculated in Arcium's MPC environment, keeping raw data encrypted:

```typescript
import { HaloProtocolClient } from './app/halo-client';

// Initialize client with Arcium
await client.initializeArcium();

// Encrypt trust score data
const encryptedScore = await client.encryptTrustScore({
  paymentHistory: {
    totalPayments: 12,
    onTimePayments: 11,
    latePayments: 1,
    missedPayments: 0
  },
  circleCompletion: {
    circlesCompleted: 2,
    circlesJoined: 3
  },
  defiActivity: {
    score: 150,
    activityTypes: ['lending', 'staking']
  },
  socialProofs: {
    verified: 3,
    total: 4,
    types: ['twitter', 'discord', 'github']
  }
});

// Only final score is revealed, not raw data
```

**Benefits:**
- Payment history stays private
- Circle participation details encrypted
- DeFi activity masked
- Only trust tier is public

#### 2. **Private Borrowing**

Loan amounts and terms are encrypted, invisible to other circle members:

```typescript
const encryptedLoan = await client.createPrivateLoan({
  amount: 5000,
  termMonths: 12,
  interestRate: 8.5,
  collateralAmount: 6000,
  borrower: borrowerPublicKey
});

// Other members see: "Member #3 has an active loan"
// They don't see: amount, terms, or interest rate
```

**Benefits:**
- Loan amounts hidden
- Terms confidential
- Collateral requirements private
- Reduces social pressure

#### 3. **Sealed Bid Auctions**

Bids remain encrypted until auction ends:

```typescript
// Place encrypted bid
const sealedBid = await client.placeSealedBid({
  amount: 1500,
  circleId: 'circle_123',
  bidder: bidderPublicKey,
  timestamp: Date.now()
});

// Bid is sealed with commitment hash
// Revealed only after auction ends

// After auction
const revealedBids = await arciumService.revealAllBids(allBids);
const winner = revealedBids[0]; // Highest bid
```

**Benefits:**
- Prevents bid sniping
- Fair auction process
- Verifiable commitments
- Transparent reveals

#### 4. **Anonymous Circle Participation**

Members can participate anonymously:

```typescript
// Create anonymous circle
const { circleAccount, privacySettings } = await client.createPrivateCircle(
  creator,
  1000, // contribution amount
  12,   // duration
  10,   // max members
  'anonymous' // privacy mode
);

// Members shown as "Member #1", "Member #2", etc.
// Only payment status is public
```

**Privacy Modes:**
- **Public**: All data visible (default)
- **Anonymous**: Member identities hidden
- **Fully Encrypted**: All data encrypted via MPC

### Smart Contract Integration

New state accounts added to `programs/halo-protocol/src/state.rs`:

```rust
// Encrypted trust score
#[account]
pub struct EncryptedTrustScore {
    pub authority: Pubkey,
    pub encrypted_score: Vec<u8>,
    pub arcium_compute_key: Pubkey,
    pub privacy_enabled: bool,
    pub last_updated: i64,
    pub bump: u8,
}

// Private circle configuration
#[account]
pub struct PrivateCircle {
    pub circle: Pubkey,
    pub privacy_mode: PrivacyMode,
    pub arcium_session: Pubkey,
    pub encrypted_member_data: Vec<EncryptedMemberInfo>,
    pub allow_public_stats: bool,
    pub bump: u8,
}

// Sealed bid for auctions
#[account]
pub struct SealedBid {
    pub auction: Pubkey,
    pub sealed_bid_data: Vec<u8>,
    pub commitment_hash: [u8; 32],
    pub bidder_commitment: Pubkey,
    pub timestamp: i64,
    pub is_revealed: bool,
    pub bump: u8,
}

// Private loan terms
#[account]
pub struct PrivateLoan {
    pub circle: Pubkey,
    pub borrower: Pubkey,
    pub encrypted_amount: Vec<u8>,
    pub encrypted_terms: Vec<u8>,
    pub arcium_session_key: Pubkey,
    pub created_at: i64,
    pub bump: u8,
}
```

---

## Reflect Yield Integration

### Overview

Reflect provides capital-efficient stablecoins that generate yield through price appreciation (USDC+) or funding rate capture (USDJ), which can be combined with Solend lending yields.

### Key Features

#### 1. **USDC+ Staking**

Yield-bearing stablecoin with price appreciation:

```typescript
await client.initializeReflect();

// Stake to USDC+
await client.stakeWithReflect(
  10000,              // $10,000
  'USDC+',            // token type
  escrowAccount,      // destination
  userWallet          // user
);

// Get current APY
const usdcPlusAPY = await reflectService.getUSDCPlusAPY();
// Returns: 4.5% (example)
```

**Characteristics:**
- Lower risk
- Stable returns
- Price appreciates over time
- Best for conservative investors

#### 2. **USDJ Staking**

Delta-neutral strategy capturing funding rates:

```typescript
// Stake to USDJ
await client.stakeWithReflect(
  10000,              // $10,000
  'USDJ',             // token type
  escrowAccount,      // destination
  userWallet          // user
);

// Get current APY
const usdjAPY = await reflectService.getUSDJAPY();
// Returns: 8.2% (example)
```

**Characteristics:**
- Higher returns
- Moderate risk
- Captures perp funding rates
- Best for growth-focused investors

#### 3. **Dual Yield Tracking**

Combines Reflect and Solend yields:

```typescript
// Get comprehensive yield breakdown
const breakdown = await client.getDualYieldBreakdown(10000, 'USDC+');

console.log('Reflect Yield:', breakdown.reflectYield);
// { name: 'Reflect USDC+ Price Appreciation',
//   apy: 4.5,
//   amountEarned: 450 }

console.log('Solend Yield:', breakdown.solendYield);
// { name: 'Solend Lending Yield',
//   apy: 3.2,
//   amountEarned: 320 }

console.log('Total APY:', breakdown.totalAPY);
// 7.7% (4.5% + 3.2%)

console.log('Total Earned:', breakdown.totalEarned);
// $770 per year on $10,000
```

#### 4. **Price Appreciation Tracking**

Monitor Reflect token price changes:

```typescript
// Get 30-day price appreciation
const appreciation = await client.getReflectPriceAppreciation('USDC+', '30d');

console.log('Price Change:', appreciation.percentageChange);
// 0.35% (monthly)

console.log('Start Price:', appreciation.startPrice);
// 1.0000

console.log('Current Price:', appreciation.currentPrice);
// 1.0035
```

#### 5. **Strategy Recommendations**

Get personalized yield strategy recommendations:

```typescript
const recommendation = await client.getRecommendedReflectStrategy({
  riskTolerance: 'medium',
  investmentPeriod: 'long',
  amount: 50000
});

console.log(recommendation);
// {
//   name: 'Conservative USDC+',
//   description: 'Lower risk with stable USDC+ appreciation plus Solend lending',
//   reflectToken: 'USDC+',
//   expectedTotalAPY: 7.7,
//   riskLevel: 'low',
//   projectedAnnualReturn: 3850
// }
```

### Smart Contract Integration

Enhanced `CircleEscrow` with dual yield tracking:

```rust
#[account]
pub struct CircleEscrow {
    // ... existing fields ...

    // Dual yield tracking
    pub reflect_yield_earned: u64,
    pub solend_yield_earned: u64,
    pub reflect_token_type: Option<ReflectTokenType>,
    pub reflect_initial_price: u64,
}

impl CircleEscrow {
    /// Calculate total yield from both sources
    pub fn calculate_total_dual_yield(&self) -> u64 {
        self.reflect_yield_earned.saturating_add(self.solend_yield_earned)
    }

    /// Get combined APY (returns basis points)
    pub fn get_combined_apy(&self, current_time: i64) -> u64 {
        // Calculates annualized return from both sources
    }
}
```

New `ReflectYieldTracking` account:

```rust
#[account]
pub struct ReflectYieldTracking {
    pub circle: Pubkey,
    pub usdc_plus_deposited: u64,
    pub usdj_deposited: u64,
    pub reflect_yield_earned: u64,
    pub solend_yield_earned: u64,
    pub last_yield_calculation: i64,
    pub reflect_price_at_deposit: u64,
    pub current_reflect_price: u64,
    pub token_type: ReflectTokenType,
    pub bump: u8,
}

impl ReflectYieldTracking {
    pub fn calculate_total_yield(&self) -> u64 { ... }
    pub fn get_combined_apy(&self, time_elapsed: i64) -> u64 { ... }
    pub fn get_reflect_apy(&self, time_elapsed: i64) -> u64 { ... }
    pub fn get_solend_apy(&self, time_elapsed: i64) -> u64 { ... }
}
```

---

## Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/kunal-drall/halo.git
cd halo

# Install dependencies
npm install

# Build program
anchor build
```

### Basic Usage

```typescript
import { HaloProtocolClient } from './app/halo-client';

// Initialize client
const client = new HaloProtocolClient(program);

// Initialize all services at once
await client.initializeAllServices();

// Now you have access to:
// - Solend lending yields
// - Arcium privacy features
// - Reflect dual yields

// Create a private circle with dual yields
const { circleAccount } = await client.createPrivateCircle(
  creator,
  1000,  // monthly contribution
  12,    // 12 months
  10,    // max 10 members
  'anonymous'
);

// Stake to Reflect for enhanced yields
await client.stakeWithReflect(
  10000,
  'USDC+',
  escrowAccount,
  userWallet
);

// Get analytics
const analytics = await client.getCircleAnalytics(circleAccount);
console.log('Total APY:', analytics.yieldBreakdown.totalAPY);
console.log('Reflect Yield:', analytics.reflectYield);
console.log('Solend Yield:', analytics.solendYield);
```

### Running Examples

```bash
# Arcium privacy demo
npm run example:arcium

# Reflect yield demo
npm run example:reflect

# Original Halo demo (with new features)
npm run example
```

---

## API Reference

### Arcium Methods

#### `initializeArcium(): Promise<void>`
Initialize Arcium privacy service.

#### `encryptTrustScore(trustData: TrustScoreData): Promise<EncryptedScore>`
Encrypt trust score calculation using MPC.

#### `createPrivateLoan(loanData: LoanData): Promise<EncryptedLoan>`
Create encrypted loan terms.

#### `placeSealedBid(bidData: BidData): Promise<EncryptedBid>`
Place sealed bid in auction.

#### `anonymizeMember(wallet: PublicKey, id: number, stake?: number): Promise<EncryptedMemberInfo>`
Anonymize member in private circle.

#### `createPrivateCircle(...): Promise<{circleAccount, privacySettings}>`
Create circle with privacy features.

### Reflect Methods

#### `initializeReflect(): Promise<void>`
Initialize Reflect yield service.

#### `stakeWithReflect(amount, tokenType, destination, user): Promise<string>`
Stake funds to USDC+ or USDJ.

#### `getDualYieldBreakdown(amount, tokenType): Promise<YieldBreakdown>`
Get combined Reflect + Solend yield breakdown.

#### `getReflectPriceAppreciation(token, period): Promise<PriceAppreciation>`
Get price appreciation over time period.

#### `getRecommendedReflectStrategy(params): Promise<DualYieldStrategy>`
Get personalized strategy recommendation.

#### `getCircleAnalytics(circleAccount): Promise<CircleAnalytics>`
Get comprehensive circle analytics with dual yields.

---

## Examples

### Example 1: Private Circle with Enhanced Yields

```typescript
// Initialize all services
await client.initializeAllServices();

// Create private anonymous circle
const { circleAccount } = await client.createPrivateCircle(
  creator,
  2000,   // $2000/month
  12,     // 1 year
  8,      // 8 members
  'anonymous'
);

// Stake circle funds to USDC+ for enhanced yields
const escrowAccount = getEscrowPDA(circleAccount);
await client.stakeWithReflect(
  16000,  // $2000 * 8 members
  'USDC+',
  escrowAccount,
  creator.publicKey
);

// Get yield breakdown
const breakdown = await client.getDualYieldBreakdown(16000, 'USDC+');
console.log(`Total APY: ${breakdown.totalAPY}%`);
console.log(`Annual earnings: $${breakdown.totalEarned}`);

// Members are anonymous
// Yields are automatically tracked and distributed
```

### Example 2: Sealed Bid Payout Auction

```typescript
// Initialize Arcium
await client.initializeArcium();

// Create auction
const auctionId = await createAuction(circleAccount, 5000);

// Members place sealed bids
const bids = await Promise.all([
  client.placeSealedBid({ amount: 4800, circleId, bidder: member1 }),
  client.placeSealedBid({ amount: 5200, circleId, bidder: member2 }),
  client.placeSealedBid({ amount: 5000, circleId, bidder: member3 })
]);

// After auction ends, reveal
const arcium = client.getArciumService();
const revealed = await arcium.revealAllBids(bids);

console.log('Winner:', revealed[0].bidder.toBase58());
console.log('Winning bid:', revealed[0].amount);
```

### Example 3: Yield Strategy Comparison

```typescript
const amount = 25000;

// Get all strategies
const strategies = await client.getReflectStrategies();

for (const strategy of strategies) {
  const breakdown = await client.getDualYieldBreakdown(
    amount,
    strategy.reflectToken as any
  );

  console.log(`\n${strategy.name}:`);
  console.log(`  APY: ${breakdown.totalAPY}%`);
  console.log(`  Annual: $${breakdown.totalEarned}`);
  console.log(`  Risk: ${strategy.riskLevel}`);
}
```

---

## Deployment

### 1. Build the Program

```bash
anchor build
```

### 2. Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

### 3. Update SDK References

After deployment, update the program ID in your client code:

```typescript
// In your app
const programId = new PublicKey('YOUR_DEPLOYED_PROGRAM_ID');
```

### 4. Install Dependencies

Note: Arcium and Reflect SDKs are currently mocked. Once official SDKs are available:

```bash
npm install @arcium/sdk@latest
npm install @reflect-money/sdk@latest
```

Then update the imports in:
- `app/arcium-service.ts`
- `app/reflect-service.ts`

---

## Testing

### Unit Tests

```bash
# Test everything
anchor test

# Test specific modules
npm run test:revenue
npm run test:solend
npm run test:automation
```

### Integration Tests

```bash
# Run example scripts
npm run example:arcium
npm run example:reflect
npm run example
```

---

## Architecture

### Service Layer

```
HaloProtocolClient
├── SolendService (existing)
├── ArciumPrivacyService (new)
│   ├── encryptTrustScore()
│   ├── encryptLoanTerms()
│   ├── encryptBid()
│   └── anonymizeMember()
└── ReflectYieldService (new)
    ├── stakeUSDCPlus()
    ├── stakeUSDJ()
    ├── getYieldBreakdown()
    └── getPriceAppreciation()
```

### Smart Contract Layer

```
programs/halo-protocol/src/
├── state.rs
│   ├── Circle (existing)
│   ├── CircleEscrow (enhanced with dual yields)
│   ├── TrustScore (existing)
│   ├── EncryptedTrustScore (new)
│   ├── PrivateCircle (new)
│   ├── SealedBid (new)
│   ├── PrivateLoan (new)
│   └── ReflectYieldTracking (new)
└── instructions.rs
    └── (existing instructions work with new features)
```

---

## Benefits Summary

### Privacy Benefits (Arcium)
- 🔒 Trust scores calculated privately
- 🔒 Loan amounts hidden
- 🔒 Bid amounts sealed until reveal
- 🔒 Member identities can be anonymous
- 🔒 Payment history encrypted

### Yield Benefits (Reflect)
- 💰 USDC+: ~4.5% APY from price appreciation
- 💰 USDJ: ~8.2% APY from funding rates
- 💰 Solend: ~3.2% APY from lending
- 💰 Combined: Up to ~11.4% total APY
- 💰 Dual yield tracking
- 💰 Automatic compounding

### Combined Benefits
- ✅ Private circles with enhanced yields
- ✅ Transparent yet confidential operations
- ✅ Multiple yield strategies
- ✅ User choice and control
- ✅ Backward compatible

---

## Troubleshooting

### Issue: Arcium service not initializing

```typescript
// Make sure to initialize before use
await client.initializeArcium();

// Check if initialized
if (!client.getArciumService().isInitialized()) {
  console.error('Arcium not ready');
}
```

### Issue: Reflect yields not showing

```typescript
// Ensure both services are initialized
await client.initializeReflect();
await client.initializeSolend();

// Then get breakdown
const breakdown = await client.getDualYieldBreakdown(amount);
```

### Issue: Build errors

```bash
# Clean build
anchor clean
anchor build

# If state size issues, increase space allocation
# in state.rs space() methods
```

---

## Roadmap

### Phase 1: Current (Mock Implementation)
- ✅ Service interfaces defined
- ✅ Smart contract state updated
- ✅ Client SDK integration complete
- ✅ Example scripts created

### Phase 2: SDK Integration (When Available)
- ⏳ Replace mock Arcium client with real SDK
- ⏳ Replace mock Reflect client with real SDK
- ⏳ Add actual MPC computations
- ⏳ Connect to real Reflect price feeds

### Phase 3: Enhanced Features
- ⏳ Zero-knowledge proofs for trust scores
- ⏳ Advanced privacy modes
- ⏳ Auto-rebalancing yield strategies
- ⏳ Cross-chain Reflect yields

### Phase 4: Production
- ⏳ Security audits
- ⏳ Mainnet deployment
- ⏳ Performance optimization
- ⏳ User interface integration

---

## Resources

- **Halo Protocol**: [GitHub](https://github.com/kunal-drall/halo)
- **Arcium**: [Website](https://arcium.com) | [Docs](https://docs.arcium.com)
- **Reflect**: [Website](https://reflect.money) | [Docs](https://docs.reflect.money)
- **Solana**: [Docs](https://docs.solana.com)
- **Anchor**: [Docs](https://www.anchor-lang.com)

---

## Support

For questions or issues:
1. Check this documentation
2. Review example scripts (`app/*-example.ts`)
3. Open an issue on GitHub
4. Contact the Halo Protocol team

---

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ for the Solana ecosystem**
