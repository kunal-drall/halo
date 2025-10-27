# Halo Protocol Demo - Quick Start Guide

Get the Halo Protocol demo running in under 5 minutes!

## 🚀 One-Command Demo

```bash
# Install dependencies and run the full demo
npm install && npm run demo
```

That's it! The demo will:
1. Initialize a 5-member circle on Solana devnet
2. Simulate 2 months of contributions and payouts
3. Demonstrate governance voting
4. Display comprehensive results

## 📱 View the Live Dashboard

While the backend demo runs, you can launch the frontend:

```bash
# In a new terminal
cd frontend
npm install
npm run dev

# Open browser to http://localhost:3000/demo
```

## 🎯 What You'll See

### Console Output
```
🌟 HALO PROTOCOL COMPREHENSIVE DEMO 🌟
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔵 Initializing 5-Member Circle...
✅ Circle initialized successfully

👥 Adding 5 Members to Circle...
✅ Alice joined the circle - Stake: 20 USDC
✅ Bob joined the circle - Stake: 20 USDC
✅ Charlie joined the circle - Stake: 20 USDC
✅ Diana joined the circle - Stake: 20 USDC
✅ Eve joined the circle - Stake: 20 USDC

📅 Month 1: Simulating Contributions...
✅ All members contributed 10 USDC each

💸 Simulating Payout to Alice...
✅ Payout distributed: 50.00 USDC

🗳️ Simulating Governance Vote...
✅ Proposal passed with 65% approval

📊 Circle Status Dashboard
================================
Circle Members: 5/5
Escrow Balance: 150.43 USDC
Yield Earned: 2.43 USDC
Trust Score Average: 725 (Gold Tier)
```

### Live Dashboard Features

**http://localhost:3000/demo** displays:

- **📊 Circle Overview**
  - Current month: 2/5
  - Escrow balance: 150.43 USDC
  - Solend yield: +2.43 USDC
  - Status: Active

- **🏆 Trust Scores**
  - Alice: 825 (Platinum)
  - Bob: 745 (Gold)
  - Charlie: 680 (Gold)
  - Diana: 590 (Silver)
  - Eve: 520 (Silver)

- **🗳️ Governance**
  - Active proposal: "Extend Circle Duration"
  - Voting: 54% approval
  - Time remaining: 12 hours

- **💸 Payout Progress**
  - ✅ Month 1: Alice (50 USDC)
  - ✅ Month 2: Bob (50.43 USDC)
  - ⏳ Month 3: Charlie (Pending)
  - ⏳ Month 4: Diana (Pending)
  - ⏳ Month 5: Eve (Pending)

## 🎬 Demo Scenarios

### Scenario 1: Quick Demo (Default)
```bash
npm run demo
# Runs 2-month simulation with governance vote
```

### Scenario 2: Just the 5-Member Circle
```bash
npm run demo:5-member
# Shows circle initialization and member onboarding
```

### Scenario 3: Contribution Simulation
```bash
npm run demo:contributions
# Simulates multiple months of contributions
```

### Scenario 4: Governance Voting
```bash
npm run demo:governance
# Shows different proposal types and voting
```

### Scenario 5: Payout Distribution
```bash
npm run demo:payouts
# Demonstrates automated payout system
```

## 🔧 Customization

### Change Circle Parameters

Edit `app/demo-5-member-circle.ts`:

```typescript
const config: CircleConfig = {
  contributionAmount: 10_000_000, // 10 USDC
  durationMonths: 5,              // 5 months
  maxMembers: 5,                  // 5 members
  penaltyRate: 1000,              // 10%
};
```

### Change Member Names

Edit the `memberNames` array:

```typescript
const memberNames = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
```

### Adjust Yield Rate

Mock yield is calculated in the demo. To change:

```typescript
// In simulate-payouts.ts
const yieldRate = 0.052; // 5.2% APY
const yieldEarned = (potAmount * yieldRate * daysInPool) / 365;
```

## 📚 Next Steps

After running the demo:

1. **Explore the Code**
   - Check `app/` for backend scripts
   - Review `frontend/src/` for dashboard code
   - Read `DEMO_README.md` for details

2. **Customize the Demo**
   - Add more members
   - Try different contribution amounts
   - Create custom proposals

3. **Deploy on Devnet**
   - Deploy the actual program
   - Connect to real Solend pools
   - Use Switchboard for automation

4. **Build Your Own Features**
   - Extend the protocol
   - Create new governance types
   - Add analytics dashboard

## 🐛 Troubleshooting

**Issue**: Demo fails immediately
```bash
# Solution: Install dependencies first
npm install
```

**Issue**: "Module not found" error
```bash
# Solution: Ensure you're in the root directory
cd /path/to/halo
npm install
```

**Issue**: Frontend won't start
```bash
# Solution: Install frontend dependencies
cd frontend
npm install
npm run dev
```

**Issue**: Port 3000 already in use
```bash
# Solution: Kill existing process or use different port
PORT=3001 npm run dev
```

## 📞 Get Help

- Read the [full demo guide](./DEMO_README.md)
- Check the [main README](./README.md)
- Review [troubleshooting section](./DEMO_README.md#troubleshooting)

## 🎉 Success!

If you see:
- ✅ Console output with circle activity
- ✅ Dashboard showing live data
- ✅ Trust scores updating
- ✅ Payouts being distributed

**Congratulations!** You've successfully run the Halo Protocol demo.

---

**Ready for Production?**

See the deployment guide in [README.md](./README.md) for instructions on deploying to Solana mainnet with real USDC, live Solend integration, and Switchboard automation.
