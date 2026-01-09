# Halo Protocol

## Overview
Halo Protocol is a Solana-based ROSCA (Rotating Savings and Credit Association) platform that enables trusted savings circles built on blockchain technology. The project includes:
- A Next.js frontend application
- Solana Anchor smart contracts
- Mobile application (React Native)
- Various integration services (Arcium, Solend, Reflect)

## Project Structure
```
├── frontend/          # Next.js web application (runs on port 5000)
├── mobile/            # React Native mobile application
├── programs/          # Solana Anchor smart contracts
├── app/               # Backend services and scripts
├── tests/             # Test suites
└── scripts/           # Utility scripts
```

## Development Setup
- **Frontend**: Next.js 14 running on port 5000
  - Command: `cd frontend && npm run dev`
  - Configured for Replit environment (0.0.0.0 binding)

## Environment Variables
- `NEXT_PUBLIC_SOLANA_NETWORK`: Solana network (default: devnet)
- `NEXT_PUBLIC_RPC_ENDPOINT`: RPC endpoint URL

## Technologies
- **Frontend**: Next.js 14, React 18, TailwindCSS, Solana wallet adapters
- **Smart Contracts**: Anchor framework, Rust
- **State Management**: Zustand
- **Blockchain**: Solana

## Workflows
- **Frontend**: Runs the Next.js development server on port 5000

## Deployment
- Configured for autoscale deployment
- Build: `npm run build --prefix frontend`
- Start: `npm run start --prefix frontend`
