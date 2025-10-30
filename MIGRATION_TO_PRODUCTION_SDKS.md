# Migration Guide: Moving to Production Arcium & Reflect SDKs

This guide helps you transition from the mock implementations to the real Arcium and Reflect SDKs when you're ready for production deployment.

## Table of Contents

1. [Overview](#overview)
2. [Arcium SDK Migration](#arcium-sdk-migration)
3. [Reflect SDK Migration](#reflect-sdk-migration)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [Testing Checklist](#testing-checklist)

---

## Overview

The current Halo Protocol integration uses **mock implementations** of Arcium and Reflect services to provide a working interface and demonstrate the integration patterns. When ready for production, you'll replace these with the official SDKs.

**Current Status:**
- ✅ Mock Arcium service (`app/arcium-service.ts`) - Interface-compatible
- ✅ Mock Reflect service (`app/reflect-service.ts`) - Interface-compatible
- ✅ Smart contract state accounts ready for production
- ✅ Client SDK integration points defined

**Production Requirements:**
- 🔄 Install `@arcium-hq/client` package
- 🔄 Install `@reflectmoney/stable.ts` package
- 🔄 Replace mock implementations with real SDK calls
- 🔄 Deploy to Arcium testnet/mainnet
- 🔄 Configure Reflect stablecoin mints

---

## Arcium SDK Migration

### 1. Install the Real SDK

```bash
# Add Arcium client SDK
npm install @arcium-hq/client
# or
yarn add @arcium-hq/client
```

### 2. Update Arcium Service Imports

**Current (Mock):**
```typescript
// app/arcium-service.ts
import { Connection, PublicKey } from '@solana/web3.js';

// Mock implementations
class MockArciumClient {
  // ...
}
```

**Production:**
```typescript
// app/arcium-service.ts
import { Connection, PublicKey } from '@solana/web3.js';
import {
  RescueCipher,
  x25519,
  awaitComputationFinalization,
  getMXEPublicKeyWithRetry
} from '@arcium-hq/client';
```

### 3. Update Encryption Implementation

**Current (Mock):**
```typescript
async encrypt(data: any): Promise<Uint8Array> {
  // Mock encryption
  const jsonData = JSON.stringify(data);
  return new Uint8Array(Buffer.from(jsonData));
}
```

**Production:**
```typescript
async encrypt(
  data: any,
  mxePublicKey: Uint8Array,
  privateKey?: Uint8Array
): Promise<{ ciphertext: Uint8Array; nonce: Uint8Array; publicKey: Uint8Array }> {
  // Generate keys if not provided
  const privKey = privateKey || x25519.utils.randomSecretKey();
  const pubKey = x25519.getPublicKey(privKey);

  // Perform key exchange
  const sharedSecret = x25519.getSharedSecret(privKey, mxePublicKey);

  // Initialize cipher with shared secret
  const cipher = new RescueCipher(sharedSecret);

  // Generate nonce
  const nonce = randomBytes(16);

  // Encrypt data (convert to BigInt array for Rescue cipher)
  const plaintext = this.dataToFieldElements(data);
  const ciphertext = cipher.encrypt(plaintext, nonce);

  return { ciphertext, nonce, publicKey: pubKey };
}

private dataToFieldElements(data: any): BigInt[] {
  // Convert data to field elements for Rescue cipher
  // Implementation depends on your data structure
  if (typeof data === 'number') {
    return [BigInt(data)];
  }
  if (Array.isArray(data)) {
    return data.map(d => BigInt(d));
  }
  // Add more conversion logic as needed
  throw new Error('Unsupported data type for encryption');
}
```

### 4. Update MXE Integration

**Production pattern for calling encrypted instructions:**

```typescript
import { Program } from '@coral-xyz/anchor';
import { getMXEPublicKeyWithRetry, awaitComputationFinalization } from '@arcium-hq/client';

async encryptTrustScore(
  program: Program,
  trustData: TrustScoreData
): Promise<EncryptedScore> {
  // 1. Get MXE public key
  const mxePublicKey = await getMXEPublicKeyWithRetry(
    this.connection,
    program.programId
  );

  // 2. Generate keypair for this computation
  const privateKey = x25519.utils.randomSecretKey();
  const publicKey = x25519.getPublicKey(privateKey);

  // 3. Create shared secret
  const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);

  // 4. Initialize cipher
  const cipher = new RescueCipher(sharedSecret);

  // 5. Prepare data (convert to field elements)
  const plaintext = [
    BigInt(trustData.paymentHistory.onTimePayments),
    BigInt(trustData.paymentHistory.totalPayments),
    BigInt(trustData.circleCompletion.circlesCompleted),
    BigInt(trustData.circleCompletion.circlesJoined),
    BigInt(trustData.defiActivity.score),
    BigInt(trustData.socialProofs.verified)
  ];

  // 6. Encrypt
  const nonce = randomBytes(16);
  const ciphertext = cipher.encrypt(plaintext, nonce);

  // 7. Queue computation via your Solana program
  const computationOffset = new BN(randomBytes(8), 'hex');

  const tx = await program.methods
    .calculateEncryptedTrustScore(
      computationOffset,
      Array.from(ciphertext[0]), // encrypted onTimePayments
      Array.from(ciphertext[1]), // encrypted totalPayments
      // ... other encrypted fields
      Array.from(publicKey),
      new BN(Buffer.from(nonce).readBigUInt64LE().toString())
    )
    .accounts({
      // ... your accounts
    })
    .rpc();

  // 8. Wait for computation to complete
  const finalizeSig = await awaitComputationFinalization(
    this.connection,
    computationOffset,
    program.programId,
    'confirmed'
  );

  return {
    encryptedData: ciphertext[0],
    computeKey: mxePublicKey,
    timestamp: Date.now(),
    privacyLevel: PrivacyMode.FullyEncrypted
  };
}
```

### 5. Add Rust Encrypted Instructions

You'll need to add encrypted instructions to your Solana program using Arcis framework:

```rust
// programs/halo-protocol/src/encrypted_instructions.rs
use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    pub struct TrustScoreInput {
        on_time_payments: u64,
        total_payments: u64,
        circles_completed: u64,
        circles_joined: u64,
        defi_score: u64,
        social_proofs: u64,
    }

    #[instruction]
    pub fn calculate_trust_score(
        input_ctxt: Enc<Shared, TrustScoreInput>
    ) -> Enc<Shared, u64> {
        let input = input_ctxt.to_arcis();

        // Calculate trust score components
        let payment_score = (input.on_time_payments * 400) / input.total_payments;
        let completion_score = (input.circles_completed * 300) / input.circles_joined;
        let defi_score_weighted = input.defi_score * 2; // 0-200 -> weighted
        let social_score = input.social_proofs * 20; // Max 100

        // Total score (max 1000)
        let total_score = payment_score + completion_score + defi_score_weighted + social_score;

        // Return encrypted score
        input_ctxt.owner.from_arcis(total_score)
    }

    #[instruction]
    pub fn seal_bid(
        bid_amount: Enc<Shared, u64>,
        recipient: Shared
    ) -> Enc<Shared, u64> {
        let amount = bid_amount.to_arcis();
        // Re-encrypt for the recipient (sealed bid)
        recipient.from_arcis(amount)
    }
}
```

---

## Reflect SDK Migration

### 1. Install the Real SDK

```bash
# Add Reflect stablecoin SDK
npm install @reflectmoney/stable.ts
```

### 2. Update Reflect Service Imports

**Current (Mock):**
```typescript
// app/reflect-service.ts
class MockReflectClient {
  // Mock token mints
  public readonly USDC_PLUS_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
}
```

**Production:**
```typescript
// app/reflect-service.ts
import {
  UsdcPlusStablecoin,
  UsdjStablecoin,
  LstStablecoin,
  ReflectTokenizedBond
} from '@reflectmoney/stable.ts';
import { Connection } from '@solana/web3.js';

export class ReflectYieldService {
  private connection: Connection;
  private usdcPlus: UsdcPlusStablecoin;
  private usdj: UsdjStablecoin;
  private lst: LstStablecoin;
  private tokenizedBond: ReflectTokenizedBond;

  constructor(connection: Connection) {
    this.connection = connection;
    this.usdcPlus = new UsdcPlusStablecoin(connection);
    this.usdj = new UsdjStablecoin(connection);
    this.lst = new LstStablecoin(connection);
    this.tokenizedBond = new ReflectTokenizedBond(connection);
  }

  async initialize(): Promise<void> {
    // Load controller data for up-to-date stablecoin setup
    await this.usdcPlus.load(this.connection);
    await this.usdj.load(this.connection);
    await this.lst.load(this.connection);

    console.log('✓ Reflect service initialized with production SDKs');
  }
}
```

### 3. Update Staking Methods

**Production implementation:**

```typescript
async stakeUSDCPlus(
  amount: number,
  destination: PublicKey,
  userWallet: PublicKey
): Promise<string> {
  console.log(`Staking ${amount} to USDC+...`);

  // Use real SDK to build mint instruction
  const mintInstructions = await this.usdcPlus.mint(
    userWallet,
    new BN(amount),
    new BN(amount * 0.999) // 0.1% slippage protection
  );

  // Get lookup table for versioned transaction
  const lookupTableAccount = await this.connection.getAddressLookupTable(
    this.usdcPlus.lookupTable
  );

  // Build versioned transaction
  const { blockhash } = await this.connection.getLatestBlockhash();

  const message = new TransactionMessage({
    instructions: mintInstructions,
    payerKey: userWallet,
    recentBlockhash: blockhash
  }).compileToV0Message([lookupTableAccount.value!]);

  const transaction = new VersionedTransaction(message);

  // Note: Actual signing and sending would be done by the wallet
  return 'transaction_prepared';
}

async stakeUSDJ(
  amount: number,
  userWallet: PublicKey,
  strategy: 'funding-rate-capture' | 'balanced' | 'aggressive' = 'funding-rate-capture'
): Promise<string> {
  console.log(`Staking ${amount} to USDJ with ${strategy} strategy...`);

  // Use real SDK to build mint instruction
  const mintInstructions = await this.usdj.mint(
    userWallet,
    new BN(amount),
    new BN(amount * 0.999) // 0.1% slippage protection
  );

  // Build versioned transaction (same pattern as USDC+)
  const lookupTableAccount = await this.connection.getAddressLookupTable(
    this.usdj.lookupTable
  );

  const { blockhash } = await this.connection.getLatestBlockhash();

  const message = new TransactionMessage({
    instructions: mintInstructions,
    payerKey: userWallet,
    recentBlockhash: blockhash
  }).compileToV0Message([lookupTableAccount.value!]);

  const transaction = new VersionedTransaction(message);

  return 'transaction_prepared';
}
```

### 4. Integrate Tokenized Bonds for Yield

For stablecoins that use tokenized bonds (USDJ, LST):

```typescript
async stakeWithYieldBond(
  baseStablecoin: 'USDJ' | 'LST',
  amount: number,
  userWallet: PublicKey
): Promise<string> {
  const stablecoin = baseStablecoin === 'USDJ' ? this.usdj : this.lst;

  // 1. Mint base stablecoin
  const mintIx = await stablecoin.mint(
    userWallet,
    new BN(amount),
    new BN(amount * 0.999)
  );

  // 2. Wrap in tokenized bond for yield
  const depositIx = this.tokenizedBond.deposit(
    userWallet,
    stablecoin.index, // 1 for USDJ, 2 for LST
    new BN(amount)
  );

  // 3. Combine instructions in single transaction
  const { blockhash } = await this.connection.getLatestBlockhash();

  const message = new TransactionMessage({
    instructions: [...mintIx, depositIx],
    payerKey: userWallet,
    recentBlockhash: blockhash
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);

  return 'bond_deposit_prepared';
}
```

### 5. Get Real-Time APY Data

```typescript
async getUSDCPlusAPY(): Promise<number> {
  // In production, this would fetch from Reflect's oracle or on-chain data
  // For now, calculate from price appreciation

  const controller = await this.usdcPlus.connection.getAccountInfo(
    this.usdcPlus.controller
  );

  if (!controller) {
    throw new Error('Controller account not found');
  }

  // Parse controller data to get current exchange rate
  // The exchange rate increases over time as yield accrues
  // APY = ((currentRate / initialRate) - 1) * (365 / daysSinceStart)

  // Placeholder - actual implementation would parse on-chain data
  return 4.5;
}
```

---

## Step-by-Step Migration

### Phase 1: Install Dependencies

```bash
# 1. Install Arcium SDK
npm install @arcium-hq/client

# 2. Install Reflect SDK
npm install @reflectmoney/stable.ts

# 3. Verify installations
npm list | grep -E "@arcium|@reflect"
```

### Phase 2: Update Service Files

1. **Update `app/arcium-service.ts`:**
   - Replace mock `MockArciumClient` with real `RescueCipher` and `x25519`
   - Update encryption methods to use production patterns
   - Keep the same public API for `ArciumPrivacyService`

2. **Update `app/reflect-service.ts`:**
   - Replace mock `MockReflectClient` with real stablecoin classes
   - Update staking methods to use `UsdcPlusStablecoin.mint()`
   - Add tokenized bond support for USDJ and LST

3. **No changes needed to `app/halo-client.ts`:**
   - The client interface remains the same
   - Only internal service implementations change

### Phase 3: Deploy Encrypted Instructions

```bash
# 1. Build with Arcium CLI (replaces anchor build)
arcium build

# 2. Deploy to Arcium testnet
arcium deploy --cluster-offset <cluster-id> \
  --keypair-path ~/.config/solana/id.json \
  --rpc-url https://api.devnet.solana.com

# 3. Initialize computation definitions
# Run your initialization scripts
npm run example:arcium
```

### Phase 4: Configure Reflect Mints

Update your configuration with real Reflect token mints:

```typescript
// config/reflect.ts
export const REFLECT_CONFIG = {
  // USDC+ mainnet mint
  USDC_PLUS_MINT: new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'),

  // USDJ mainnet mint (when available)
  USDJ_MINT: new PublicKey('...'),

  // LST mainnet mint
  LST_MINT: new PublicKey('...'),

  // Controller accounts
  USDC_PLUS_CONTROLLER: new PublicKey('...'),
  USDJ_CONTROLLER: new PublicKey('...'),
  LST_CONTROLLER: new PublicKey('...'),
};
```

### Phase 5: Update Tests

```typescript
// tests/arcium-integration.test.ts
import { expect } from 'chai';
import { RescueCipher, x25519, getMXEPublicKeyWithRetry } from '@arcium-hq/client';

describe('Arcium Production Integration', () => {
  it('should encrypt and compute trust scores', async () => {
    const mxePublicKey = await getMXEPublicKeyWithRetry(
      provider,
      program.programId
    );

    // Use real encryption
    const privateKey = x25519.utils.randomSecretKey();
    const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
    const cipher = new RescueCipher(sharedSecret);

    // ... rest of test
  });
});
```

---

## Testing Checklist

### Arcium Integration Tests

- [ ] Can encrypt trust score data using RescueCipher
- [ ] Can queue encrypted computations via Solana program
- [ ] Computations finalize successfully with correct results
- [ ] Sealed bid auctions work with re-encryption
- [ ] Anonymous member data is properly encrypted
- [ ] Gas costs are reasonable (~21-32 CU per update)

### Reflect Integration Tests

- [ ] Can mint USDC+ using production SDK
- [ ] Can redeem USDC+ back to USDC
- [ ] USDC+ price appreciates over time (check exchange rate)
- [ ] Can mint USDJ (when available)
- [ ] Can deposit in tokenized bonds
- [ ] Can withdraw from tokenized bonds
- [ ] Yield calculations match on-chain data
- [ ] APY values are realistic

### Integration Tests

- [ ] Private circles work with Arcium encryption
- [ ] Dual yields track correctly (Reflect + Solend)
- [ ] Circle analytics show proper yield breakdown
- [ ] Can switch between USDC+, USDJ, and LST
- [ ] Versioned transactions work with lookup tables
- [ ] All example scripts run successfully

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] All tests passing with production SDKs
- [ ] Smart contracts audited (if required)
- [ ] Encrypted instructions deployed to Arcium network
- [ ] Computation definitions initialized
- [ ] Reflect token mints configured correctly
- [ ] RPC endpoints configured for production
- [ ] Error handling and logging in place

### Deployment

- [ ] Deploy Solana program to mainnet
- [ ] Initialize all PDAs and accounts
- [ ] Configure Arcium cluster connection
- [ ] Verify Reflect integration works
- [ ] Test with small amounts first
- [ ] Monitor initial transactions closely

### Post-Deployment

- [ ] Monitor gas costs and optimization opportunities
- [ ] Track yield generation accuracy
- [ ] Set up alerts for errors/failures
- [ ] Document any issues and resolutions
- [ ] Update documentation with production addresses

---

## Support Resources

### Arcium

- **Documentation**: https://docs.arcium.com
- **Discord**: https://discord.gg/arcium
- **GitHub**: https://github.com/arcium-hq
- **TypeScript SDK**: https://ts.arcium.com/api

### Reflect

- **Documentation**: https://docs.reflect.money
- **Twitter**: https://x.com/reflectmoney
- **SDK Repository**: https://github.com/palindrome-eng
- **API**: https://prod.api.reflect.money

---

## Common Issues and Solutions

### Issue: "Cannot find module '@arcium-hq/client'"

**Solution:** The package might not be published yet. Check Arcium documentation for installation instructions or stay with mock implementation until release.

### Issue: "MXE public key not found"

**Solution:** Ensure your program is properly deployed with `arcium deploy` and computation definitions are initialized.

### Issue: "Reflect mint not recognized"

**Solution:** Verify you're using the correct mainnet mint addresses from Reflect documentation.

### Issue: "Transaction too large"

**Solution:** Use address lookup tables (already configured in Reflect SDK). Ensure you're using versioned transactions.

### Issue: "Yield calculations don't match"

**Solution:** Make sure you're using the latest controller data by calling `.load()` on stablecoin instances before operations.

---

## Need Help?

1. Check the [Arcium documentation](https://docs.arcium.com)
2. Check the [Reflect documentation](https://docs.reflect.money)
3. Review the example scripts in `app/*-example.ts`
4. Open an issue on GitHub
5. Ask in Discord communities

**Remember:** The mock implementations provide a working interface. Migration to production SDKs should be gradual and well-tested!
