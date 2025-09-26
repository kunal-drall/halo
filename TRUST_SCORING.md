# Trust Scoring System - Halo Protocol

The Halo Protocol includes a comprehensive on-chain trust scoring system that dynamically adjusts user requirements based on their reputation and behavior within the ecosystem.

## Overview

The trust scoring system evaluates users across four key dimensions with weighted contributions:

- **Payment History (40%)**: Track record of consistent contributions to circles
- **Circle Completions (30%)**: Successfully completed rotating savings circles
- **DeFi Activity (20%)**: External DeFi engagement via Solend SDK integration
- **Social Proofs (10%)**: Verified social media and identity credentials

## Trust Tiers

Users progress through four trust tiers based on their overall score:

### 🥉 Newcomer (0-249 points)
- **Stake Requirement**: 2x base contribution
- **Initial tier for new users**
- **Higher collateral to mitigate risk**

### 🥈 Silver (250-499 points)
- **Stake Requirement**: 1.5x base contribution
- **Moderate trust level**
- **Reduced collateral requirements**

### 🥇 Gold (500-749 points)
- **Stake Requirement**: 1x base contribution
- **High trust level**
- **Standard collateral requirements**

### 💎 Platinum (750-1000 points)
- **Stake Requirement**: 0.75x base contribution
- **Highest trust level**
- **Premium benefits with reduced collateral**

## Scoring Components

### Payment History (400 points max)
- Tracks contribution consistency across all circles
- Penalizes missed payments
- Rewards perfect payment records
- Updates automatically with each contribution

### Circle Completions (300 points max)
- Awards points for successfully completed circles
- Considers completion rate vs. joined circles
- Builds long-term reputation
- Updates when circles reach completion

### DeFi Activity (200 points max)
- Integrates with Solend SDK for external DeFi tracking
- Considers lending positions, trading activity, etc.
- Updated via oracle/external data feeds
- Demonstrates broader DeFi engagement

### Social Proofs (100 points max)
- Verified social media accounts (Twitter, Discord, etc.)
- Identity verification documents
- GitHub profiles for developers
- 20 points per verified proof (max 5 proofs)

## Smart Contract Instructions

### Core Instructions

```rust
// Initialize trust score for new user
initialize_trust_score(ctx: Context<InitializeTrustScore>)

// Recalculate score based on current metrics
update_trust_score(ctx: Context<UpdateTrustScore>)

// Add social proof for verification
add_social_proof(ctx: Context<AddSocialProof>, proof_type: String, identifier: String)

// Verify social proof (oracle/verifier only)
verify_social_proof(ctx: Context<VerifySocialProof>, proof_type: String, identifier: String)

// Update DeFi activity score (oracle only)
update_defi_activity_score(ctx: Context<UpdateDefiActivityScore>, activity_score: u16)

// Update trust score after circle completion
complete_circle_update_trust(ctx: Context<CompleteCircleUpdateTrust>)
```

### Integration Points

The trust scoring system integrates seamlessly with existing Halo Protocol operations:

- **Circle Joining**: Enforces tier-based stake requirements
- **Contributions**: Automatically tracks payment history
- **Circle Completion**: Updates completion scores for all participants

## TypeScript Client Usage

```typescript
import { HaloProtocolClient } from './halo-client';

const client = new HaloProtocolClient(program);

// Initialize trust score
const { trustScoreAccount } = await client.initializeTrustScore(user);

// Add social proof
await client.addSocialProof(user, "Twitter", "@username");

// Verify proof (as oracle/verifier)
await client.verifySocialProof(userPubkey, verifier, "Twitter", "@username");

// Update DeFi activity (as oracle)
await client.updateDefiActivityScore(userPubkey, oracle, 150);

// Get current trust score
const trustData = await client.getTrustScoreInfo(trustScoreAccount);
console.log(`Score: ${trustData.score}, Tier: ${client.getTierName(trustData.tier)}`);

// Calculate required stake for joining circle
const requiredStake = await client.getMinimumStakeRequirement(
  userPubkey, 
  baseContribution
);
```

## Benefits

### For Users
- **Lower Costs**: Higher trust tiers require less collateral
- **Reputation Building**: On-chain credit history that follows users
- **Incentive Alignment**: Rewards consistent, trustworthy behavior
- **Portability**: Trust scores work across all Halo Protocol circles

### For the Protocol
- **Risk Mitigation**: Higher collateral from unproven users
- **Quality Assurance**: Attracts and retains reliable participants
- **Network Effects**: Trust scores encourage ecosystem participation
- **Scalability**: Automated trust assessment without manual reviews

## Security Considerations

- **Oracle Security**: DeFi activity scores require trusted oracles
- **Social Proof Verification**: Robust verification process prevents gaming
- **Score Calculation**: Weighted system prevents single-vector manipulation
- **State Management**: On-chain storage ensures tamper-proof history

## Future Enhancements

- **Cross-Chain Trust**: Extend scoring across multiple blockchains
- **Advanced Metrics**: Incorporate additional behavioral indicators
- **Dynamic Weights**: Adjust scoring weights based on market conditions
- **Trust Delegation**: Allow users to stake on others' trustworthiness

## Running the Demo

```bash
# Run the trust scoring demonstration
npm run ts-node app/trust-scoring-demo.ts
```

This demonstrates the complete trust scoring workflow from newcomer to experienced user, showing how stake requirements adjust dynamically based on trust levels.