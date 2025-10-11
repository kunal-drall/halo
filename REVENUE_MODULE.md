# Halo Protocol Revenue Module

The Revenue Module is a comprehensive fee collection and treasury management system for the Halo Protocol. It automatically collects protocol fees from various operations and routes them to a secure treasury PDA, with governance-controlled parameters.

## Features

### 🏦 Fee Collection
- **Distribution Fees**: 0.5% default fee on loan/pot distributions (`distribute_pot`)
- **Yield Fees**: 0.25% default fee on interest yield distribution (`distribute_yield`)
- **Management Fees**: 2% annual fee on locked stakes, calculated pro-rata

### 🏛️ Governance
- All fee rates are adjustable by governance
- Fee rate caps prevent excessive fees (max 10% per category)
- Management fee collection intervals are configurable
- Secure authorization checks prevent unauthorized changes

### 📊 Treasury Management
- Secure PDA-based treasury with separate tracking for each fee type
- Automatic accounting and balance reconciliation
- Real-time fee accumulation tracking
- Treasury authority management

### 📈 Revenue Reporting
- Period-based revenue reports for analytics
- Detailed breakdown by fee category
- Historical tracking of revenue trends
- Integration-ready data structures

## Architecture

### State Accounts

#### Treasury
```rust
pub struct Treasury {
    pub authority: Pubkey,           // Governance authority
    pub total_fees_collected: u64,   // Cumulative total
    pub distribution_fees: u64,      // From pot distributions
    pub yield_fees: u64,            // From yield distributions
    pub management_fees: u64,       // From stake management
    pub last_management_fee_collection: i64,
    pub bump: u8,
}
```

#### RevenueParams
```rust
pub struct RevenueParams {
    pub authority: Pubkey,           // Governance authority
    pub distribution_fee_rate: u16,  // Basis points (50 = 0.5%)
    pub yield_fee_rate: u16,        // Basis points (25 = 0.25%)
    pub management_fee_rate: u16,   // Basis points (200 = 2%)
    pub management_fee_interval: i64, // Minimum seconds between collections
    pub last_updated: i64,
    pub bump: u8,
}
```

#### RevenueReport
```rust
pub struct RevenueReport {
    pub period_start: i64,
    pub period_end: i64,
    pub total_period_fees: u64,
    pub period_distribution_fees: u64,
    pub period_yield_fees: u64,
    pub period_management_fees: u64,
    pub active_circles: u32,
    pub total_distributions: u64,
    pub total_yield: u64,
    pub total_managed_stake: u64,
    pub bump: u8,
}
```

## Instructions

### Initialization

#### `initialize_treasury`
Creates the global treasury PDA account.
```typescript
await program.methods
  .initializeTreasury()
  .accounts({
    treasury: treasuryPDA,
    authority: governance.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([governance])
  .rpc();
```

#### `initialize_revenue_params`
Initializes revenue parameters with default values.
```typescript
await program.methods
  .initializeRevenueParams()
  .accounts({
    revenueParams: revenueParamsPDA,
    authority: governance.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([governance])
  .rpc();
```

### Governance

#### `update_revenue_params`
Updates fee rates and collection intervals (governance only).
```typescript
await program.methods
  .updateRevenueParams(
    75,   // 0.75% distribution fee
    50,   // 0.5% yield fee
    250,  // 2.5% management fee
    new BN(15 * 24 * 60 * 60) // 15 days
  )
  .accounts({
    revenueParams: revenueParamsPDA,
    authority: governance.publicKey,
  })
  .signers([governance])
  .rpc();
```

### Fee Collection

#### `distribute_pot` (Modified)
Now automatically collects distribution fees.
```typescript
await program.methods
  .distributePot()
  .accounts({
    circle: circleAccount,
    recipientMember: memberAccount,
    escrow: escrowAccount,
    treasury: treasuryPDA,                    // NEW: Required
    revenueParams: revenueParamsPDA,          // NEW: Required
    authority: creator.publicKey,
    recipientTokenAccount: recipientTokens,
    escrowTokenAccount: escrowTokens,
    treasuryTokenAccount: treasuryTokens,     // NEW: Required
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .signers([creator])
  .rpc();
```

#### `distribute_yield`
Distributes yield with automatic fee collection.
```typescript
await program.methods
  .distributeYield(yieldAmount)
  .accounts({
    treasury: treasuryPDA,
    revenueParams: revenueParamsPDA,
    authority: yieldProvider.publicKey,
    sourceTokenAccount: yieldSourceTokens,
    recipientTokenAccount: recipientTokens,
    treasuryTokenAccount: treasuryTokens,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .signers([yieldProvider])
  .rpc();
```

#### `collect_management_fees`
Collects management fees based on time elapsed and stake amounts.
```typescript
await program.methods
  .collectManagementFees()
  .accounts({
    treasury: treasuryPDA,
    revenueParams: revenueParamsPDA,
    circle: circleAccount,
    escrow: escrowAccount,
    escrowTokenAccount: escrowTokens,
    treasuryTokenAccount: treasuryTokens,
    tokenProgram: TOKEN_PROGRAM_ID,
    authority: automationService.publicKey,
  })
  .signers([automationService])
  .rpc();
```

### Reporting

#### `create_revenue_report`
Generates a revenue report for a specified time period.
```typescript
const periodStart = new BN(startTimestamp);
const periodEnd = new BN(endTimestamp);

const [reportPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("revenue_report"),
    periodStart.toArray("le", 8),
    periodEnd.toArray("le", 8),
  ],
  program.programId
);

await program.methods
  .createRevenueReport(periodStart, periodEnd)
  .accounts({
    revenueReport: reportPDA,
    treasury: treasuryPDA,
    authority: reporter.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([reporter])
  .rpc();
```

## PDA Derivations

```typescript
// Treasury PDA
const [treasury] = PublicKey.findProgramAddressSync(
  [Buffer.from("treasury")],
  program.programId
);

// Revenue Parameters PDA
const [revenueParams] = PublicKey.findProgramAddressSync(
  [Buffer.from("revenue_params")],
  program.programId
);

// Revenue Report PDA
const [revenueReport] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("revenue_report"),
    periodStart.toArray("le", 8),
    periodEnd.toArray("le", 8),
  ],
  program.programId
);
```

## Default Parameters

- **Distribution Fee**: 50 basis points (0.5%)
- **Yield Fee**: 25 basis points (0.25%)
- **Management Fee**: 200 basis points (2% annually)
- **Management Fee Interval**: 30 days (2,592,000 seconds)

## Security Features

- **Authorization**: All governance functions require authority signature
- **Rate Limiting**: Management fees can't be collected too frequently
- **Parameter Validation**: Fee rates capped at 10% (1000 basis points)
- **PDA Security**: All treasury operations use program-derived addresses
- **Arithmetic Safety**: All calculations use checked math to prevent overflows

## Integration Guide

### For Circle Operations
When calling `distribute_pot`, you now need to include treasury accounts:

```typescript
// Before (old version)
.accounts({
  circle, recipientMember, escrow, authority,
  recipientTokenAccount, escrowTokenAccount, tokenProgram
})

// After (with revenue module)
.accounts({
  circle, recipientMember, escrow, 
  treasury, revenueParams,           // NEW
  authority, recipientTokenAccount, escrowTokenAccount,
  treasuryTokenAccount,              // NEW
  tokenProgram
})
```

### For Solend Integration
Use `distribute_yield` when distributing yield from lending protocols:

```typescript
const yieldAmount = await calculateYieldFromSolend();
await program.methods.distributeYield(yieldAmount)
  .accounts({
    treasury, revenueParams, authority,
    sourceTokenAccount: solendYieldAccount,
    recipientTokenAccount: userAccount,
    treasuryTokenAccount, tokenProgram
  })
  .rpc();
```

### For Automated Management Fees
Set up automated collection of management fees:

```typescript
// Run periodically (e.g., daily)
for (const circle of activeCircles) {
  try {
    await program.methods.collectManagementFees()
      .accounts({
        treasury, revenueParams, circle,
        escrow: circle.escrow,
        escrowTokenAccount: circle.escrowTokens,
        treasuryTokenAccount, tokenProgram,
        authority: automationService.publicKey
      })
      .rpc();
  } catch (error) {
    if (error.message.includes("RevenueCollectionTooFrequent")) {
      // Skip - not enough time elapsed
      continue;
    }
    throw error;
  }
}
```

## Testing

Run the comprehensive test suite:

```bash
npm run test:revenue
```

Run the integration example:
```bash
npm run example:revenue
```

## Error Codes

- `InvalidFeeRate`: Fee rate exceeds maximum allowed (10%)
- `TreasuryNotInitialized`: Treasury account not initialized
- `UnauthorizedRevenueOperation`: Non-governance account attempting parameter changes
- `RevenueCollectionTooFrequent`: Management fees collected too soon
- `InvalidRevenueReportPeriod`: Report period end before start

## Development Notes

- All fee calculations use basis points (1/100th of a percent) for precision
- Treasury balance should always equal sum of individual fee categories
- Management fees are calculated pro-rata based on time elapsed
- The module is designed to be backward compatible with proper account additions
- Consider gas costs when implementing automated management fee collection