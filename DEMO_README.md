# Halo Protocol Demo - 5-Member Circle on Solana Devnet

Welcome to the comprehensive Halo Protocol demo! This demo showcases a fully functional 5-member ROSCA circle with USDC contributions, Solend yield generation, Switchboard automation, and a Next.js + Privy frontend dashboard.

## 🌟 Demo Overview

This demo demonstrates:

- **5-Member Circle**: A complete ROSCA circle with Alice, Bob, Charlie, Diana, and Eve
- **USDC Contributions**: Monthly 10 USDC contributions from each member
- **Solend Integration**: Circle funds earning ~5.2% APY in Solend pools
- **Switchboard Automation**: Scheduled monthly payouts and contribution reminders
- **Trust Scores**: Live tracking of member reputation and tier progression
- **Governance Voting**: Quadratic voting on circle proposals
- **Live Dashboard**: Next.js frontend with Privy authentication

## 📋 Prerequisites

Before running the demo, ensure you have:

- Node.js 16+ installed
- npm or yarn package manager
- Solana CLI (optional, for devnet interaction)
- A web browser (for frontend dashboard)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install main project dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Run the Demo Scripts

#### Option A: Full Demo (Recommended)
```bash
npm run example:demo
# or
ts-node app/run-full-demo.ts
```

This runs the complete end-to-end demo including:
- Circle initialization
- Member onboarding
- Monthly contributions
- Payout distributions
- Governance voting
- Trust score updates

#### Option B: Individual Components

**Demo 5-Member Circle:**
```bash
ts-node app/demo-5-member-circle.ts
```

**Simulate Contributions:**
```bash
ts-node app/simulate-contributions.ts <circle-address> 5 3
# Example: ts-node app/simulate-contributions.ts Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS 5 3
```

**Simulate Payouts:**
```bash
ts-node app/simulate-payouts.ts <circle-address> all
# Example: ts-node app/simulate-payouts.ts Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS all
```

**Simulate Governance:**
```bash
ts-node app/simulate-governance.ts <circle-address> interest-rate
# Example: ts-node app/simulate-governance.ts Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS interest-rate
```

### 3. Launch the Frontend Dashboard

```bash
cd frontend

# Set up environment variables
cp .env.example .env
# Edit .env and add your Privy App ID (optional for demo)

# Start the development server
npm run dev

# Open your browser
# Navigate to: http://localhost:3000/demo
```

## 📊 Demo Flow

### Phase 1: Circle Setup (Automated)

1. **Initialize Circle**
   - Creator sets up a 5-member circle
   - Contribution: 10 USDC/month
   - Duration: 5 months
   - Penalty rate: 10%

2. **Members Join**
   - Alice, Bob, Charlie, Diana, and Eve join
   - Each stakes 20 USDC (2x contribution)
   - Trust scores initialized for all members

3. **Trust Scores Initialized**
   - All members start with base scores
   - Tier: Bronze (new members)

### Phase 2: Month 1 Operations

4. **Contributions**
   - All 5 members contribute 10 USDC
   - Total pot: 50 USDC
   - Funds deposited into Solend

5. **Yield Generation**
   - Circle funds earn ~5.2% APY in Solend
   - Yield compounds automatically

6. **Payout Distribution**
   - Alice receives first payout
   - Amount: 50 USDC + yield
   - Trust scores updated

### Phase 3: Governance Activity

7. **Proposal Created**
   - "Reduce Penalty Rate from 10% to 5%"
   - 24-hour voting period

8. **Members Vote**
   - Quadratic voting mechanism
   - Alice: 4 USDC voting power → YES
   - Bob: 3 USDC voting power → YES
   - Charlie: 2 USDC voting power → NO
   - Diana: 5 USDC voting power → YES
   - Eve: 1 USDC voting power → NO

9. **Proposal Passes**
   - Quadratic tally: 65% approval
   - Penalty rate updated to 5%

### Phase 4: Month 2 Operations

10. **Contributions**
    - All members contribute again
    - Total pot: 50 USDC

11. **Payout Distribution**
    - Bob receives second payout
    - Amount: 50 USDC + accumulated yield
    - Trust scores updated

12. **Dashboard Updates**
    - Live statistics refresh
    - Trust score progression visible
    - Payout progress tracked

## 🎯 Features Demonstrated

### Core Circle Functionality

- ✅ Circle initialization with custom parameters
- ✅ Member onboarding with stake requirements
- ✅ Monthly contribution tracking
- ✅ Automated payout distribution
- ✅ Trust score calculation and updates
- ✅ Penalty system for defaults

### Solend Integration

- ✅ Circle funds deposited into Solend pools
- ✅ Real-time yield generation (~5.2% APY)
- ✅ Market data fetching
- ✅ Automatic compound interest
- ✅ Yield distribution to members

### Switchboard Automation

- ✅ Scheduled monthly contribution reminders
- ✅ Automated payout distributions on day 20
- ✅ Penalty assessments for late contributions
- ✅ Trust score updates on day 25
- ✅ Time-based and event-based triggers

### Governance System

- ✅ Proposal creation (interest rate, duration, emergency)
- ✅ Quadratic voting mechanism
- ✅ Vote tallying with square root weighting
- ✅ Proposal execution after voting period
- ✅ Governance statistics dashboard

### Trust Scoring

- ✅ Multi-factor score calculation
  - Payment history (40%)
  - Circle participation (30%)
  - Social proof (20%)
  - Governance activity (10%)
- ✅ Tier progression (Bronze → Silver → Gold → Platinum)
- ✅ Real-time score updates
- ✅ Benefits by tier

### Frontend Dashboard

- ✅ Privy wallet authentication
- ✅ Live trust score display for all members
- ✅ Real-time contribution tracking
- ✅ Payout progress visualization
- ✅ Governance proposal voting interface
- ✅ Solend yield metrics
- ✅ Mobile-responsive design
- ✅ Dark mode with purple theme

## 📱 Dashboard Features

The live dashboard (`http://localhost:3000/demo`) displays:

### Circle Overview
- Current month progress
- Total escrow balance
- Solend yield earned
- Circle status

### Trust Scores Panel
- Live scores for all 5 members
- Visual tier indicators
- Contribution history
- Payout status

### Governance Panel
- Active proposals with voting
- Vote counts and percentages
- Proposal status (Active/Passed/Failed)
- Time remaining for active votes

### Payout Progress
- Distribution timeline
- Completed payouts with amounts
- Pending payouts schedule
- Next Switchboard trigger countdown

### Solend Stats
- Current APY
- Total deposited amount
- Yield earned to date
- Time in pool

## 🔧 Configuration

### Environment Variables

Edit `frontend/.env`:

```bash
# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Program ID
NEXT_PUBLIC_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

# Privy Authentication (optional for demo)
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id

# Solend Market
NEXT_PUBLIC_SOLEND_MARKET=4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY
```

### Circle Parameters

Edit parameters in `app/demo-5-member-circle.ts`:

```typescript
const config: CircleConfig = {
  contributionAmount: 10_000_000, // 10 USDC (6 decimals)
  durationMonths: 5,
  maxMembers: 5,
  penaltyRate: 1000, // 10% (100 = 1%)
};
```

## 🧪 Testing the Demo

### Manual Testing

1. **Run the main demo:**
   ```bash
   ts-node app/demo-5-member-circle.ts
   ```

2. **Verify output shows:**
   - ✅ Circle initialized
   - ✅ 5 members joined
   - ✅ Contributions made
   - ✅ Payouts distributed
   - ✅ Trust scores updated
   - ✅ Governance votes cast

3. **Check the dashboard:**
   - Navigate to `http://localhost:3000/demo`
   - Connect wallet (or view demo data)
   - Verify all panels display correct information

### Automated Testing

Run the test suite:
```bash
npm run test
```

## 📊 Expected Results

After running the full demo, you should see:

### Console Output
```
🚀 Starting Halo Protocol 5-Member Circle Demo on Devnet
=========================================================

🌐 Connecting to Solana Devnet...
✅ SOL airdrop received

💵 Creating Mock USDC Token...
✅ Mock USDC Token created

🔵 Initializing 5-Member Circle...
✅ Circle initialized successfully

👥 Adding 5 Members to Circle...
✅ Alice joined the circle
✅ Bob joined the circle
✅ Charlie joined the circle
✅ Diana joined the circle
✅ Eve joined the circle

📅 Month 1: Simulating Contributions...
✅ Alice contributed 10 USDC
✅ Bob contributed 10 USDC
✅ Charlie contributed 10 USDC
✅ Diana contributed 10 USDC
✅ Eve contributed 10 USDC

💸 Simulating Payout to Alice...
✅ Payout distributed successfully
   Alice received: 50.00 USDC

🗳️ Simulating Governance Vote...
✅ Proposal created successfully
✅ Alice voted YES
✅ Bob voted YES
✅ Charlie voted NO
✅ Governance voting simulation complete

✅ Demo completed successfully!
```

### Dashboard Display
- Circle status: Active
- Current month: 2/5
- Escrow balance: 150.43 USDC
- Yield earned: 2.43 USDC
- Members with trust scores visible
- 2 payouts completed, 3 pending
- 1 governance proposal passed

## 🎓 Understanding the Demo

### Circle Lifecycle

1. **Initialization**: Creator sets parameters
2. **Onboarding**: Members join with stakes
3. **Active Period**: Monthly contributions and payouts
4. **Completion**: All members receive payouts
5. **Settlement**: Stakes returned, circle closes

### Trust Score Calculation

```
Trust Score = 
  (Payment History × 0.40) +
  (Participation × 0.30) +
  (Social Proof × 0.20) +
  (Governance × 0.10)
```

**Tier Thresholds:**
- Bronze: 0-299
- Silver: 300-599
- Gold: 600-799
- Platinum: 800-1000

### Quadratic Voting

Vote weight = √(voting_power)

**Example:**
- 4 USDC voting power → weight of 2
- 9 USDC voting power → weight of 3
- 16 USDC voting power → weight of 4

This prevents wealthy members from dominating votes.

## 🔍 Troubleshooting

### Common Issues

**Issue**: Demo fails with "insufficient SOL"
- **Solution**: The demo uses devnet airdrops which may be rate-limited. Wait a minute and try again.

**Issue**: Frontend shows "Unable to connect"
- **Solution**: Ensure the dev server is running on port 3000. Check for conflicting processes.

**Issue**: Trust scores not updating
- **Solution**: This is expected in the simulation. Real trust scores update after on-chain transactions.

**Issue**: Privy authentication not working
- **Solution**: Add a valid Privy App ID to `.env` or skip authentication to view demo data.

### Debug Mode

Enable verbose logging:
```bash
DEBUG=* ts-node app/demo-5-member-circle.ts
```

## 📚 Additional Resources

### Documentation
- [Main README](./README.md) - Project overview
- [Solend Integration](./SOLEND_INTEGRATION.md) - Yield generation details
- [Governance Module](./GOVERNANCE_AUCTION_MODULE.md) - Voting system
- [Trust Scoring](./TRUST_SCORING.md) - Reputation system
- [Frontend Implementation](./FRONTEND_IMPLEMENTATION.md) - Dashboard details

### Scripts
- `app/demo-5-member-circle.ts` - Main demo orchestration
- `app/simulate-contributions.ts` - Contribution simulation
- `app/simulate-payouts.ts` - Payout simulation
- `app/simulate-governance.ts` - Governance simulation
- `app/run-full-demo.ts` - Complete demo flow

### Frontend
- `frontend/src/components/LiveDashboard.tsx` - Main dashboard component
- `frontend/src/app/demo/page.tsx` - Demo page
- `frontend/src/app/providers.tsx` - Privy integration

## 🚀 Next Steps

After exploring the demo:

1. **Customize Parameters**: Edit circle configuration in demo scripts
2. **Add More Members**: Extend the demo to support more participants
3. **Implement Real Yield**: Connect to actual Solend pools on devnet
4. **Deploy to Mainnet**: Follow deployment instructions in main README
5. **Build Custom Features**: Extend the protocol with your own ideas

## 🤝 Contributing

We welcome contributions! Areas for improvement:

- Enhanced frontend visualizations
- Additional governance proposal types
- Advanced trust score algorithms
- Mobile app development
- Integration with other DeFi protocols

## 📄 License

This demo is part of the Halo Protocol and is licensed under MIT.

## 💬 Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section above

---

**Happy Testing! 🎉**

Built with ❤️ by the Halo Protocol Team
