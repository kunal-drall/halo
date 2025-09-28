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
import { TrustScoreDashboardService } from './trust-score-dashboard-service';

const client = new HaloProtocolClient(program);

// Initialize trust score
const { trustScoreAccount } = await client.initializeTrustScore(user);

// Add social proof
await client.addSocialProof(user, "Twitter", "@username");

// Verify proof (as oracle/verifier)
await client.verifySocialProof(userPubkey, verifier, "Twitter", "@username");

// Update DeFi activity (as oracle)
await client.updateDefiActivityScore(userPubkey, oracle, 150);

// Get current trust score (dashboard-optimized format)
const trustData = await client.getDashboardTrustScore(userPubkey);
console.log(`Score: ${trustData.score}, Tier: ${trustData.tier}`);

// Calculate required stake for joining circle
const requiredStake = await client.getMinimumStakeRequirement(
  userPubkey, 
  baseContribution
);

// Dashboard service for frontend integration
const dashboardService = new TrustScoreDashboardService(client, connection);

// Batch fetch multiple users for leaderboards
const batchScores = await dashboardService.fetchBatchTrustScores([
  "User1PublicKey...",
  "User2PublicKey...",
  "User3PublicKey..."
]);

// Get trust score statistics
const stats = await dashboardService.getTrustScoreStatistics();

// Validate circle eligibility
const eligibility = await dashboardService.validateCircleEligibility(
  userAddress,
  circleId,
  contributionAmount
);
```

## Dashboard API Endpoints

The trust scoring system provides RESTful API endpoints for frontend dashboard integration:

### Individual User Trust Score
```
GET /api/trust-score?user=<publicKey>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": "PublicKey...",
    "score": 675,
    "tier": "Gold",
    "stakeMultiplier": 100,
    "breakdown": {
      "paymentHistory": {
        "score": 320,
        "maxScore": 400,
        "weight": 40,
        "percentage": 80
      },
      "circleCompletions": {
        "score": 180,
        "maxScore": 300,
        "weight": 30,
        "percentage": 60
      },
      "defiActivity": {
        "score": 120,
        "maxScore": 200,
        "weight": 20,
        "percentage": 60
      },
      "socialProofs": {
        "score": 55,
        "maxScore": 100,
        "weight": 10,
        "percentage": 55
      }
    },
    "metadata": {
      "circlesCompleted": 12,
      "circlesJoined": 18,
      "totalContributions": "145000",
      "missedContributions": 3,
      "socialProofs": [...],
      "lastUpdated": "1695234567"
    }
  }
}
```

### Batch Trust Score Queries
```
POST /api/trust-score/batch
```

**Request Body:**
```json
{
  "users": ["PublicKey1...", "PublicKey2...", "PublicKey3..."]
}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "user": "PublicKey1...",
      "score": 850,
      "tier": "Platinum",
      "breakdown": {...}
    },
    {
      "user": "PublicKey2...",
      "score": 420,
      "tier": "Silver",
      "breakdown": {...}
    },
    {
      "user": "PublicKey3...",
      "score": 680,
      "tier": "Gold", 
      "breakdown": {...}
    }
  ]
}
```

### Trust Score Analytics
```
GET /api/trust-score/analytics?period=30d&metric=summary
```

**Parameters:**
- `period`: `24h`, `7d`, `30d`, `90d` (default: `30d`)
- `metric`: `distribution`, `trends`, `summary` (default: `summary`)

**Response:**
```json
{
  "success": true,
  "period": "30d",
  "metric": "summary", 
  "data": {
    "totalUsers": 15234,
    "averageScore": 542,
    "tierDistribution": {
      "newcomer": { "count": 3458, "percentage": 23 },
      "silver": { "count": 6821, "percentage": 45 },
      "gold": { "count": 3947, "percentage": 26 },
      "platinum": { "count": 1008, "percentage": 6 }
    },
    "insights": {
      "avgPaymentHistory": 78.5,
      "avgCircleCompletions": 68.2,
      "avgDefiActivity": 45.3,
      "avgSocialProofs": 72.1
    }
  }
}
```

### Custom Analytics Queries
```
POST /api/trust-score/analytics/custom
```

**Request Body:**
```json
{
  "filters": {
    "tier": "gold",
    "scoreRange": [500, 749],
    "dateRange": ["2024-01-01", "2024-12-31"],
    "metrics": ["paymentHistory", "circleCompletions"]
  },
  "groupBy": "tier",
  "orderBy": "score"
}
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

# Run the dashboard API demonstration
node app/simple-trust-score-demo.ts

# Test individual API endpoints (requires Next.js server)
npm run dev
# Then visit:
# GET /api/trust-score?user=<publicKey>
# POST /api/trust-score/batch
# GET /api/trust-score/analytics
```

This demonstrates the complete trust scoring workflow from newcomer to experienced user, showing how stake requirements adjust dynamically based on trust levels, and how dashboard APIs provide queryable endpoints for frontend integration.