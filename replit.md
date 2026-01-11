# Halo Protocol

## Overview
Halo Protocol is a Solana-based ROSCA (Rotating Savings and Credit Association) platform that enables trusted savings circles built on blockchain technology. The project includes:
- A Next.js 14 frontend application
- Solana Anchor smart contracts (Rust)
- PostgreSQL database for off-chain data
- Various integration services (Solend, Helius indexer)

## Current Status: ~70% Production Ready

### Completed
- [x] Environment setup (Solana CLI 1.18.26, Anchor 0.31.1)
- [x] PostgreSQL database provisioned with Drizzle ORM schema
- [x] Frontend updated to use real data stores
- [x] API routes updated to query database with proper response format
- [x] Solana wallet keypair generated (8Bb4wBrpVdANHtjFQPBLjWYMGf2c9sKeDk1tgFVv91yo)
- [x] Wallet funded with 2 SOL on devnet
- [x] IDL file configured with program address
- [x] Client-side Solana initialization (gracefully handles program not deployed)

### Pending for Production
- [ ] Smart contract deployment to devnet (requires external build due to Nix/rustup incompatibility)
- [ ] Replace Solend mock service with real SDK integration
- [ ] Set up Helius webhook for on-chain event indexing
- [ ] Configure Switchboard for automated callbacks
- [ ] End-to-end testing with connected wallet

## Project Structure
```
halo/
├── frontend/           # Next.js 14 web application (port 5000)
│   ├── src/
│   │   ├── app/        # Pages and API routes
│   │   ├── components/ # React components
│   │   ├── stores/     # Zustand state stores
│   │   ├── services/   # Service layer
│   │   └── lib/        # Utilities and clients
│   └── public/         # Static assets including IDL
├── programs/           # Solana Anchor smart contracts
│   └── halo-protocol/  # Main program (Rust)
├── app/                # Backend services and scripts
├── server/             # Database connection
├── shared/             # Shared schema definitions
├── tests/              # Test suites
└── scripts/            # Utility scripts
```

## Database Schema
Using Drizzle ORM with PostgreSQL:
- `circles` - Savings circle data
- `users` - User profiles and trust scores
- `members` - Circle membership
- `transactions` - Transaction history
- `analytics` - Aggregated analytics data

## Wallet Configuration
- **Keypair location**: ~/.config/solana/devnet-wallet.json
- **Public key**: 8Bb4wBrpVdANHtjFQPBLjWYMGf2c9sKeDk1tgFVv91yo
- **Network**: devnet
- **Balance**: 2 SOL (airdropped)

## Environment Variables
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=58Fg8uB36CJwb9gqGxSwmR8RYBWrXMwFbTRuW1694qcd
DATABASE_URL=(auto-provisioned PostgreSQL)
```

## Development Commands

### Run Frontend
```bash
cd frontend && npm run dev
```

### Database Commands
```bash
npm run db:push    # Push schema changes
npm run db:studio  # Open Drizzle Studio
```

### Solana Commands
```bash
solana balance           # Check wallet balance
solana airdrop 1         # Request more devnet SOL
anchor deploy            # Deploy after building externally
```

## Known Limitations

### Smart Contract Build
Building Solana smart contracts in Replit is blocked due to incompatibility between Nix-managed Rust and Solana's rustup dependency. **Workaround**: Build the smart contract externally and copy the `.so` file to `target/deploy/`.

### Program Initialization
The frontend gracefully handles when the program isn't deployed yet. Blockchain features will show warnings but the app remains functional for browsing.

## Remaining Work for Production

### 1. Smart Contract Deployment
Build externally then deploy:
```bash
anchor deploy --provider.cluster devnet
```

### 2. Solend Integration
Replace mock service in `app/solend-service.ts` with real SDK calls:
- Use `@solendprotocol/solend-sdk` for deposits/withdrawals
- Connect to Solend's devnet or mainnet markets

### 3. Helius Indexer
Set up webhook to index on-chain events:
- Circle created events
- Contribution events
- Payout events

### 4. Testing
- Connect wallet and test circle creation
- Verify trust score API responses
- Test database persistence

## Workflows
- **Frontend**: Runs Next.js development server on port 5000

## Deployment
- Configured for autoscale deployment
- Build: `npm run build --prefix frontend`
- Start: `npm run start --prefix frontend -p 5000`
