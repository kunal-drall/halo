# Halo Protocol - ROSCA Smart Contract

A Solana Anchor smart contract that implements ROSCA (Rotating Savings and Credit Association) circles, enabling groups of people to pool funds and take turns receiving the total pot.

## Overview

ROSCA circles are traditional savings groups where members contribute a fixed amount monthly, and each month one member receives the entire pot. Halo Protocol brings this concept to the blockchain with added security, transparency, and programmable rules.

## Features

- **Configurable Circles**: Set contribution amounts, duration, member limits, and penalty rates
- **Secure Escrows**: All funds are held in Program Derived Accounts (PDAs) 
- **Member Management**: Join circles with stake requirements, track contribution history
- **Monthly Distributions**: Automated pot distribution with tamper-proof records
- **Penalty System**: Built-in penalties for defaulting members
- **Reentrancy Protection**: Secure against common attack vectors
- **Comprehensive Testing**: Full test suite with edge case coverage

## Smart Contract Architecture

### Core Accounts

1. **Circle Account**: Stores circle configuration and state
   - Creator, contribution amount, duration, member limits
   - Current status and monthly contribution tracking
   - Member list and pot distribution history

2. **Member Account**: Individual member data per circle
   - Stake amount and contribution history
   - Status (Active/Defaulted/Exited) and penalties
   - Pot receipt tracking

3. **Circle Escrow**: Secure fund storage
   - Holds all member stakes and contributions
   - Monthly pot allocations
   - PDA-controlled for security

### Key Instructions

- `initialize_circle`: Create a new ROSCA circle
- `join_circle`: Join an existing circle with stake
- `contribute`: Make monthly contribution
- `distribute_pot`: Distribute monthly pot to designated member
- `claim_penalty`: Claim penalties from defaulted members
- `leave_circle`: Exit a circle (with restrictions)

## Getting Started

### Prerequisites

- Node.js 16+
- Rust 1.70+
- Solana CLI 1.16+
- Anchor CLI 0.29+

### Installation

```bash
# Clone the repository
git clone https://github.com/kunal-drall/halo.git
cd halo

# Install dependencies
npm install

# Build the smart contract
anchor build

# Run tests
anchor test
```

### Usage Example

```typescript
import * as anchor from "@coral-xyz/anchor";
import { HaloProtocol } from "./target/types/halo_protocol";

const program = anchor.workspace.HaloProtocol as Program<HaloProtocol>;

// Initialize a new circle
await program.methods
  .initializeCircle(
    new anchor.BN(1000000), // 1 token contribution
    3,                       // 3 months duration
    5,                       // max 5 members
    1000                     // 10% penalty rate
  )
  .accounts({
    circle: circleAccount,
    escrow: escrowAccount,
    creator: creator.publicKey,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .signers([creator])
  .rpc();

// Join the circle
await program.methods
  .joinCircle(new anchor.BN(2000000)) // 2x contribution as stake
  .accounts({
    circle: circleAccount,
    member: memberAccount,
    escrow: escrowAccount,
    memberAuthority: member.publicKey,
    memberTokenAccount: memberTokenAccount,
    escrowTokenAccount: escrowTokenAccount,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .signers([member])
  .rpc();
```

## Security Features

### Reentrancy Protection
- Single instruction atomic operations
- State checks before external calls
- PDA-controlled fund transfers

### Access Control
- Member-specific PDAs with seed validation
- Authority checks on all sensitive operations
- Circle creator privileges for distributions

### Data Validation
- Comprehensive input validation
- Arithmetic overflow protection
- State consistency checks

### Economic Security
- Stake requirements to discourage defaults
- Penalty mechanisms for non-compliance
- Escrow isolation per circle

## Testing

The project includes comprehensive tests covering:

- Circle initialization and configuration
- Member onboarding and stake validation
- Contribution tracking and validation
- Pot distribution mechanics
- Error handling and edge cases
- Security feature verification

Run tests with:
```bash
anchor test
```

## API Reference

### Circle Management

#### `initialize_circle`
Creates a new ROSCA circle with specified parameters.

**Parameters:**
- `contribution_amount: u64` - Monthly contribution required
- `duration_months: u8` - Circle duration (1-24 months)
- `max_members: u8` - Maximum members allowed (1-20)
- `penalty_rate: u16` - Penalty rate in basis points (0-10000)

#### `join_circle`
Allows a user to join an existing circle.

**Parameters:**
- `stake_amount: u64` - Stake to deposit (must be >= contribution_amount)

### Member Operations

#### `contribute`
Make a monthly contribution to the circle.

**Parameters:**
- `amount: u64` - Contribution amount (must equal circle's contribution_amount)

#### `leave_circle`
Exit a circle (only allowed before active period or if defaulted).

### Distribution

#### `distribute_pot`
Distribute the monthly pot to a designated member.

**Requirements:**
- Must be called by authorized entity (circle creator)
- Recipient must not have received pot before
- Contributions must exist for current month

#### `claim_penalty`
Claim penalties from defaulted members.

**Requirements:**
- Target member must be in default status
- Penalties must be available to claim

## Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 6000 | CircleFull | Circle has reached maximum members |
| 6001 | InvalidContributionAmount | Contribution amount doesn't match requirement |
| 6002 | MemberAlreadyExists | Member is already in the circle |
| 6003 | MemberNotFound | Member not found in circle |
| 6004 | CircleNotActive | Circle is not in active state |
| 6005 | InsufficientStake | Stake amount is too low |
| 6006 | ContributionAlreadyMade | Member already contributed this month |
| 6007 | InvalidContributionMonth | Cannot contribute for future months |
| 6008 | PotAlreadyDistributed | Monthly pot already distributed |
| 6009 | NoContributionsToDistribute | No contributions available for distribution |
| 6010 | NotAuthorizedToDistribute | Not authorized to distribute pot |
| 6011 | MemberAlreadyReceivedPot | Member already received their pot |
| 6012 | InvalidPenaltyRate | Penalty rate exceeds maximum |
| 6013 | MemberInDefault | Member is in default status |
| 6014 | CannotLeaveActivePeriod | Cannot leave during active contribution period |
| 6015 | ArithmeticOverflow | Arithmetic operation overflow |
| 6016 | InvalidDuration | Circle duration is invalid |
| 6017 | InvalidMaxMembers | Maximum members count is invalid |
| 6018 | CircleEnded | Circle has already ended |

## Architecture Decisions

### Why PDAs?
Program Derived Addresses ensure:
- Deterministic account addresses
- Program-controlled fund custody
- Elimination of signature requirements for escrow operations

### Time-based Operations
The current implementation uses a simplified time calculation. Production versions should implement:
- Solana's Clock sysvar for accurate timestamps
- More sophisticated month calculation logic
- Time zone considerations

### Economic Design
- Stakes discourage defaults and ensure skin in the game
- Penalties provide compensation for disrupted circles
- Configurable parameters allow adaptation to different economic conditions

## Future Enhancements

- **Governance**: Decentralized circle management
- **Insurance**: Optional insurance pools for default protection
- **Interest**: Yield generation on escrowed funds
- **Credit Scoring**: Member reputation system
- **Mobile App**: User-friendly interface
- **Multi-token**: Support for various SPL tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This smart contract is provided for educational and development purposes. Always conduct thorough security audits before deploying to mainnet with real funds.