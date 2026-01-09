# Halo Protocol

## Overview
Halo Protocol is a Solana-based ROSCA (Rotating Savings and Credit Association) platform that enables trusted savings circles built on blockchain technology. The project includes:
- A Next.js 14 frontend application
- Solana Anchor smart contracts (Rust)
- Mobile application (React Native - not active)
- Various integration services (Arcium deferred, Solend, Reflect deferred)

## Current Status: ~60% Production Ready
- [x] Environment setup complete (Solana CLI 1.18.26, Anchor 0.31.1)
- [x] PostgreSQL database provisioned with schema
- [x] Frontend updated to use real data stores (instead of hardcoded mock data)
- [x] API routes updated to query database
- [ ] Smart contract build and deployment pending
- [ ] Solend integration needs real SDK implementation
- [ ] Helius indexer not yet configured

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

## Development Setup

### Prerequisites
- Solana CLI and Anchor are installed via Nix
- Node.js with npm (installed)
- PostgreSQL database (provisioned)

### Running the Frontend
```bash
cd frontend && npm run dev
# Runs on http://0.0.0.0:5000
```

### Database Commands
```bash
npm run db:push    # Push schema changes
npm run db:studio  # Open Drizzle Studio
```

### Building Smart Contract
```bash
anchor build       # Build the program
anchor deploy --provider.cluster devnet  # Deploy to devnet
```

## Environment Variables
Configured in shared environment:
- `NEXT_PUBLIC_SOLANA_NETWORK`: devnet
- `NEXT_PUBLIC_RPC_ENDPOINT`: https://api.devnet.solana.com
- `NEXT_PUBLIC_PROGRAM_ID`: 58Fg8uB36CJwb9gqGxSwmR8RYBWrXMwFbTRuW1694qcd
- `DATABASE_URL`: Auto-provisioned PostgreSQL connection

## Key Changes Made
1. Updated circles page to use circleStore instead of hardcoded mock data
2. Updated trust store to fetch from API instead of returning mock data
3. Updated API routes (/api/trust-score/*) to query PostgreSQL
4. Created shared database schema with Drizzle
5. Configured environment variables for devnet

## Remaining Work
1. **Smart Contract Deployment**: Build and deploy to devnet (requires wallet with SOL)
2. **Solend Integration**: Replace mock service with real @solendprotocol/solend-sdk
3. **Helius Indexer**: Set up webhook for on-chain event indexing
4. **Switchboard Automation**: Configure automated callbacks

## Technologies
- **Frontend**: Next.js 14, React 18, TailwindCSS, Zustand, Solana wallet adapters
- **Smart Contracts**: Anchor 0.31.1, Rust
- **Database**: PostgreSQL with Drizzle ORM
- **Blockchain**: Solana devnet

## Workflows
- **Frontend**: Runs the Next.js development server on port 5000

## Deployment
- Configured for autoscale deployment
- Build: `npm run build --prefix frontend`
- Start: `npm run start --prefix frontend -p 5000`
