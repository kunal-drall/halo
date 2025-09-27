# Halo Protocol Frontend

A modern, responsive Next.js frontend for the Halo Protocol - a decentralized savings circle platform built on Solana.

## Features

✨ **Core Features:**
- 🔐 **Wallet Integration** - Phantom & Solflare wallet support
- 👥 **Circle Management** - Create, join, and manage savings circles
- 📊 **Dashboard** - Track contributions, distributions, and performance
- 💰 **Solend Integration** - Earn yield on pooled funds
- 🏆 **Trust Scoring** - Build reputation with social proofs
- 🗳️ **Governance** - Participate in protocol governance
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🌐 **Network Switching** - Easy devnet/mainnet switching

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS + shadcn/ui components
- **Wallet**: Solana Wallet Adapter
- **State**: Zustand + React Query
- **Blockchain**: Solana Web3.js + Anchor
- **Icons**: Lucide React
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd halo/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Environment Configuration

The application supports environment-based configuration for different networks:

```env
# Development (Devnet)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Production (Mainnet)
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Homepage
│   ├── dashboard/         # User dashboard
│   ├── circles/           # Circle management
│   ├── lending/           # Solend integration
│   ├── governance/        # DAO governance
│   └── trust-score/       # Trust scoring system
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── wallet/           # Wallet connection components
│   └── *.tsx             # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── types/                # TypeScript type definitions
```

## Key Pages

### 🏠 Homepage (`/`)
- Landing page with protocol overview
- Wallet connection interface
- Feature highlights and statistics

### 📊 Dashboard (`/dashboard`)
- User overview and statistics
- Active circles management
- Lending positions
- Recent activity

### 👥 Circles (`/circles`)
- Browse available circles
- Create new circles
- Join existing circles
- Circle details and management

### 💰 Lending (`/lending`)
- Solend protocol integration
- Supply and borrow assets
- Portfolio analytics
- Market data

### 🏆 Trust Score (`/trust-score`)
- Trust score overview
- Social proof verification
- Contribution history
- Tier benefits

### 🗳️ Governance (`/governance`)
- Active proposals
- Voting interface
- Proposal creation
- Governance statistics

## Components

### Wallet Integration
- **WalletContextProvider**: Global wallet state management
- **WalletConnection**: Wallet connection UI
- **WalletButton**: Compact wallet button

### UI Components
- Built with shadcn/ui for consistency
- Fully accessible and responsive
- Dark mode support ready
- Custom components for specific features

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - `NEXT_PUBLIC_SOLANA_NETWORK`
   - `NEXT_PUBLIC_RPC_ENDPOINT`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Network Switching

The application supports seamless switching between Solana networks:

- **Devnet**: For development and testing
- **Mainnet**: For production use

Use the network switch in the header to toggle between networks.

## Wallet Support

### Supported Wallets
- **Phantom** - Most popular Solana wallet
- **Solflare** - Feature-rich web and mobile wallet

### Wallet Features
- Auto-connect on page load
- Connection state persistence
- Transaction signing
- Account switching

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Style

- ESLint + Prettier for code formatting
- TypeScript for type safety
- Component-first architecture
- Responsive design patterns

### Adding New Features

1. Create components in `/src/components/`
2. Add pages in `/src/app/`
3. Define types in `/src/types/`
4. Use custom hooks in `/src/hooks/`

## Integration Points

### Solana Program Integration
- Program calls through Anchor
- Transaction handling
- Account state management
- Error handling

### Solend Integration
- Market data fetching
- Lending operations
- Yield calculations
- Risk management

## Security Considerations

- Client-side wallet integration only
- No private key handling
- Transaction verification
- Input validation
- XSS protection

## Performance

- Code splitting with Next.js
- Image optimization
- Lazy loading
- Caching strategies
- Bundle size optimization

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [Project README](../README.md)
- Issues: [GitHub Issues](../../issues)
- Community: [Discord/Telegram links]

---

**Built with ❤️ for the Solana ecosystem**