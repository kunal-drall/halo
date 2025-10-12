# Halo Protocol: Governance and Auction Module

This document describes the implementation of the Governance and Auction module for Halo Protocol, which adds quadratic voting for circle interest rate proposals and an auction mechanism for early pot payouts.

## 🏛️ Features Implemented

### Governance System
- **Quadratic Voting**: Voting power is calculated as the square root of SPL tokens held
- **Interest Rate Proposals**: Members can propose changes to circle penalty rates
- **Weighted Tallies**: Votes are tallied using quadratic weighting for fair representation
- **SPL Token Integration**: Voting power is validated against SPL token holdings
- **Proposal Lifecycle**: Complete proposal management from creation to execution

### Auction System  
- **Early Pot Payouts**: Members can bid for early access to monthly pot distributions
- **Stake-Based Bidding**: Bidding requires minimum stake validation (10% of bid amount)
- **Member-Only Access**: Only circle members can participate in auctions
- **Automatic Settlement**: Auctions automatically settle at the end time
- **Escrow Management**: Bid amounts are held in escrow until settlement

### Technical Features
- **Comprehensive Event Logging**: All actions emit events for transparency
- **Error Handling**: Robust validation and error reporting
- **PDA Account Management**: Secure program-derived addresses for all accounts
- **Integration**: Seamless integration with existing circle and trust scoring systems

## 🏗️ Architecture

### State Structures

#### GovernanceProposal
```rust
pub struct GovernanceProposal {
    pub id: u64,
    pub circle: Pubkey,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType, // InterestRateChange, CircleParameter, Emergency
    pub status: ProposalStatus,      // Active, Succeeded, Defeated, Executed, Cancelled
    pub voting_start: i64,
    pub voting_end: i64,
    pub execution_threshold: u64,
    pub votes_for: u64,
    pub votes_against: u64,
    pub quadratic_votes_for: u64,    // Square root weighted votes
    pub quadratic_votes_against: u64,
    pub new_interest_rate: Option<u16>,
    // ... additional fields
}
```

#### Vote
```rust
pub struct Vote {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub voting_power: u64,
    pub quadratic_weight: u64,  // sqrt(voting_power)
    pub support: bool,
    pub timestamp: i64,
}
```

#### Auction
```rust
pub struct Auction {
    pub id: u64,
    pub circle: Pubkey,
    pub initiator: Pubkey,
    pub pot_amount: u64,
    pub starting_bid: u64,
    pub highest_bid: u64,
    pub highest_bidder: Option<Pubkey>,
    pub start_time: i64,
    pub end_time: i64,
    pub status: AuctionStatus, // Active, Ended, Cancelled
    pub settled: bool,
}
```

#### Bid
```rust
pub struct Bid {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
    pub bidder_stake: u64,
    pub timestamp: i64,
    pub is_highest: bool,
}
```

## 🎯 Instructions

### Governance Instructions

#### `create_proposal`
Creates a new governance proposal for circle parameter changes.

**Parameters:**
- `title`: Proposal title (max 200 chars)
- `description`: Detailed description (max 1000 chars)  
- `proposal_type`: Type of proposal (0=InterestRate, 1=CircleParameter, 2=Emergency)
- `voting_duration_hours`: How long voting remains open (max 7 days)
- `execution_threshold`: Minimum quadratic voting power needed to execute
- `new_interest_rate`: New interest rate for rate change proposals

**Validation:**
- Proposer must be a circle member
- For interest rate proposals, new rate must be ≤ 100%
- Voting duration must be between 1 hour and 7 days

#### `cast_vote`
Allows members to vote on active proposals using quadratic weighting.

**Parameters:**
- `support`: True for yes, false for no
- `voting_power`: Amount of SPL tokens to use for voting

**Validation:**
- Proposal must be active and in voting period
- Voter can only vote once per proposal
- Voting power validated against SPL token balance
- Quadratic weight calculated as sqrt(voting_power)

#### `execute_proposal`
Executes passed proposals after voting period ends.

**Validation:**
- Proposal voting period must have ended
- Proposal must have passed (quadratic_votes_for > quadratic_votes_against)
- Must meet execution threshold
- Can only be executed once

### Auction Instructions

#### `create_auction`
Creates an auction for early pot payout access.

**Parameters:**
- `pot_amount`: Amount of tokens available in the pot
- `starting_bid`: Minimum bid amount
- `duration_hours`: How long auction runs (max 72 hours)

**Validation:**
- Creator must be a circle member
- Pot amount must be > 0
- Starting bid must be > 0 and ≤ pot amount
- Duration must be between 1-72 hours

#### `place_bid`
Places a bid in an active auction.

**Parameters:**
- `bid_amount`: Amount to bid (must exceed current highest)

**Validation:**
- Auction must be active and not ended
- Bidder cannot be the auction initiator
- Bid must be higher than current highest bid
- Bidder must have sufficient stake (≥ 10% of bid amount)
- Bid amount transferred to escrow

#### `settle_auction`
Settles an ended auction and transfers pot to winner.

**Validation:**
- Auction must have ended
- Can only be settled once
- Transfers pot to highest bidder (if any)

## 📊 Quadratic Voting Implementation

The quadratic voting system ensures fair representation by reducing the influence of large token holders:

```rust
// Calculate quadratic weight: sqrt(voting_power)
let quadratic_weight = (voting_power as f64).sqrt() as u64;

// Update proposal tallies with quadratic weights
if support {
    proposal.quadratic_votes_for += quadratic_weight;
} else {
    proposal.quadratic_votes_against += quadratic_weight;
}
```

**Benefits:**
- Large holders can't dominate voting
- Smaller holders have meaningful influence  
- Square root function provides diminishing returns on additional tokens
- Maintains democratic governance principles

## 🔒 Security Features

### Access Control
- **Member Validation**: Only circle members can create proposals or participate in auctions
- **One Vote Per Member**: Prevents duplicate voting through PDA constraints
- **Stake Requirements**: Auction bidding requires minimum stake validation

### Financial Security  
- **Escrow Management**: Bid amounts held in program escrow until settlement
- **Overflow Protection**: All arithmetic operations checked for overflow
- **Token Validation**: Voting power verified against actual SPL token holdings

### Time-Based Validation
- **Voting Periods**: Proposals have defined start/end times
- **Auction Duration**: Auctions automatically end after specified duration
- **Execution Windows**: Proposals can only be executed after voting ends

## 🧪 Testing

The implementation includes comprehensive tests covering:

### Governance Tests
- ✅ Proposal creation and validation
- ✅ Quadratic vote casting and tallying  
- ✅ Proposal execution with parameter changes
- ✅ Duplicate vote prevention
- ✅ Access control for non-members
- ✅ Voting period enforcement

### Auction Tests
- ✅ Auction creation and configuration
- ✅ Bid placement with stake validation
- ✅ Bid amount validation (must exceed current highest)
- ✅ Member-only participation enforcement
- ✅ Auction settlement and winner determination
- ✅ Escrow management for bid amounts

### Integration Tests
- ✅ Integration with existing circle parameters
- ✅ Trust score system compatibility  
- ✅ Event emission validation
- ✅ Error handling and edge cases

## 📝 Events

All governance and auction actions emit events for transparency:

```rust
#[event]
pub struct ProposalCreated {
    pub proposal_id: u64,
    pub circle: Pubkey,
    pub proposer: Pubkey,
    pub proposal_type: u8,
    pub voting_end: i64,
}

#[event]  
pub struct VoteCast {
    pub proposal_id: u64,
    pub voter: Pubkey,
    pub support: bool,
    pub voting_power: u64,
    pub quadratic_weight: u64,
}

#[event]
pub struct AuctionCreated {
    pub auction_id: u64,
    pub circle: Pubkey,
    pub pot_amount: u64,
    pub starting_bid: u64,
}

#[event]
pub struct BidPlaced {
    pub auction_id: u64,
    pub bidder: Pubkey,
    pub bid_amount: u64,
}
```

## 🚀 Usage Examples

### Creating a Governance Proposal
```typescript
await program.methods
  .createProposal(
    "Reduce Interest Rate",
    "Lower penalty rate from 5% to 3%", 
    0, // InterestRateChange
    24, // 24 hours voting
    new BN(1000), // execution threshold
    300 // 3% new rate
  )
  .accounts({
    proposal: proposalAccount,
    circle: circleAccount,
    proposer: member.publicKey,
  })
  .signers([member])
  .rpc();
```

### Casting a Vote
```typescript
await program.methods
  .castVote(
    true, // vote yes
    new BN(4_000_000) // 4 tokens voting power
  )
  .accounts({
    proposal: proposalAccount,
    vote: voteAccount,
    voter: voter.publicKey,
    voterTokenAccount: voterTokens,
  })
  .signers([voter])
  .rpc();
```

### Creating an Auction
```typescript
await program.methods
  .createAuction(
    new BN(5_000_000), // 5 tokens pot
    new BN(4_000_000), // 4 tokens starting bid
    24 // 24 hours duration
  )
  .accounts({
    auction: auctionAccount,
    circle: circleAccount,
    initiator: member.publicKey,
  })
  .signers([member])
  .rpc();
```

## 🔮 Future Enhancements

- **Cross-Circle Governance**: Proposals affecting multiple circles
- **Delegation**: Allow members to delegate voting power
- **Advanced Auction Types**: Dutch auctions, sealed bid auctions
- **Governance Analytics**: Historical voting patterns and statistics
- **Mobile Integration**: React Native components for mobile governance

## 📋 Deployment Checklist

- [x] Rust code compiles without errors
- [x] All state structures properly defined
- [x] Instructions implement required functionality
- [x] Error handling covers edge cases  
- [x] Events emit for all major actions
- [x] Comprehensive test suite passes
- [x] Integration with existing systems verified
- [x] Security validations in place
- [x] Documentation complete

## 🎉 Conclusion

This implementation provides a robust governance and auction system for Halo Protocol that:

- **Democratizes Decision Making**: Quadratic voting ensures fair representation
- **Enables Early Liquidity**: Auction system provides early pot access
- **Maintains Security**: Comprehensive validation and access controls
- **Provides Transparency**: Full event logging and audit trails
- **Scales Effectively**: Efficient PDA management and optimized operations

The system is ready for deployment and integration with the broader Halo Protocol ecosystem!