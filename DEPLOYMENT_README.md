# Halo Protocol - Complete Deployment Guide

Step-by-step instructions for deploying Halo Protocol to Solana devnet/mainnet with frontend and automation.

## 📋 Overview

This guide covers:
1. Deploying Anchor programs to Solana
2. Configuring Switchboard automation
3. Deploying Next.js frontend to Vercel
4. Post-deployment verification and testing

**Estimated Time:** 30-45 minutes

---

## 🚀 Part 1: Deploy Anchor Program

### Prerequisites

- Solana CLI installed
- Anchor CLI v0.28.0
- Wallet with SOL (2 SOL for devnet, 20+ SOL for mainnet)
- Program built (`anchor build`)

### Step 1: Configure Network

```bash
# For Devnet
solana config set --url https://api.devnet.solana.com

# For Mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Set your keypair
solana config set --keypair ~/.config/solana/id.json
```

### Step 2: Check Balance

```bash
solana balance

# If on devnet and balance is low:
solana airdrop 2

# For mainnet, ensure you have at least 20 SOL for deployment
```

### Step 3: Build Program

```bash
# Build the program
anchor build

# Verify the build
ls -lh target/deploy/
# You should see halo_protocol.so and halo_protocol-keypair.json
```

### Step 4: Deploy Using Script

```bash
# Deploy to devnet
./scripts/deploy-anchor.sh devnet

# Or deploy to mainnet
./scripts/deploy-anchor.sh mainnet-beta
```

**Save the Program ID!** It will be displayed after successful deployment.

### Step 5: Verify Deployment

```bash
# Check program exists
solana program show <PROGRAM_ID>

# View on explorer
# Devnet: https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet
# Mainnet: https://explorer.solana.com/address/<PROGRAM_ID>
```

### Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Build
anchor build

# Deploy
anchor deploy --provider.cluster devnet

# Or for mainnet
anchor deploy --provider.cluster mainnet-beta
```

### Update Anchor.toml

After deployment, update `Anchor.toml`:

```toml
[programs.devnet]
halo_protocol = "YOUR_PROGRAM_ID"

# Or for mainnet
[programs.mainnet]
halo_protocol = "YOUR_PROGRAM_ID"
```

---

## ⏰ Part 2: Configure Switchboard Automation

Switchboard provides automated execution for monthly payouts, reminders, and penalties.

### Step 1: Install Switchboard CLI (Optional)

```bash
npm install -g @switchboard-xyz/cli
```

### Step 2: Run Setup Script

```bash
./scripts/setup-switchboard.sh devnet <YOUR_PROGRAM_ID>
```

This creates function templates in `switchboard-functions/`.

### Step 3: Create Functions on Switchboard Dashboard

1. **Visit:** https://app.switchboard.xyz
2. **Connect Wallet:** Connect your Solana wallet
3. **Create Functions:** Click "Create Function"

#### Function 1: Monthly Contribution Reminder

```
Name: Halo Contribution Reminder
Description: Sends reminders to members on day 1 of each month
Schedule: Cron: 0 0 1 * * (Day 1, 00:00 UTC)
Container: switchboardlabs/function-example
Parameters:
  - CIRCLE_ADDRESS: <your_circle_address>
  - PROGRAM_ID: <your_program_id>
  - RPC_URL: https://api.devnet.solana.com
```

#### Function 2: Automated Payout Distribution

```
Name: Halo Payout Distribution
Description: Executes monthly payout on day 20
Schedule: Cron: 0 0 20 * * (Day 20, 00:00 UTC)
Container: switchboardlabs/function-example
Parameters:
  - CIRCLE_ADDRESS: <your_circle_address>
  - PROGRAM_ID: <your_program_id>
  - AUTHORITY_KEYPAIR: <encrypted_keypair>
  - RPC_URL: https://api.devnet.solana.com
```

#### Function 3: Penalty Assessment

```
Name: Halo Penalty Assessment
Description: Checks for late contributions and applies penalties
Schedule: Cron: 0 0 16 * * (Day 16, 00:00 UTC)
Container: switchboardlabs/function-example
Parameters:
  - CIRCLE_ADDRESS: <your_circle_address>
  - PROGRAM_ID: <your_program_id>
  - RPC_URL: https://api.devnet.solana.com
```

#### Function 4: Trust Score Update

```
Name: Halo Trust Score Update
Description: Recalculates member trust scores
Schedule: Cron: 0 0 25 * * (Day 25, 00:00 UTC)
Container: switchboardlabs/function-example
Parameters:
  - CIRCLE_ADDRESS: <your_circle_address>
  - PROGRAM_ID: <your_program_id>
  - RPC_URL: https://api.devnet.solana.com
```

### Step 4: Fund Functions

Each function needs SOL for execution:

```bash
# Fund each function with 0.1 SOL
solana transfer <FUNCTION_ESCROW_ADDRESS> 0.1 --url devnet
```

### Step 5: Enable Functions

In the Switchboard dashboard:
1. Click on each function
2. Click "Enable"
3. Monitor the "Executions" tab for successful runs

---

## 🌐 Part 3: Deploy Frontend to Vercel

### Step 1: Configure Environment

```bash
cd frontend

# Create .env from template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Environment Variables:**

```bash
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet  # or mainnet-beta
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<YOUR_PROGRAM_ID>

# Privy Authentication (get from privy.io)
NEXT_PUBLIC_PRIVY_APP_ID=<YOUR_PRIVY_APP_ID>

# Solend Integration
NEXT_PUBLIC_SOLEND_MARKET=4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY

# Optional: Telegram Bot
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=<YOUR_BOT_TOKEN>
```

### Step 2: Test Locally

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Visit http://localhost:3000
# Test all features before deploying
```

### Step 3: Deploy to Vercel

#### Option A: Using Script (Recommended)

```bash
cd ..  # Back to root directory
./scripts/deploy-vercel.sh production
```

#### Option B: Manual Deployment

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 4: Configure Vercel Environment

After deployment, add environment variables in Vercel:

1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add all variables from `.env`
5. Redeploy: `vercel --prod`

### Step 5: Custom Domain (Optional)

```bash
# Add custom domain
vercel domains add your-domain.com

# Configure DNS
# Add CNAME record: your-domain.com → cname.vercel-dns.com
```

---

## 🎯 Part 4: Privy Authentication Setup

### Step 1: Create Privy Account

1. Visit https://privy.io
2. Sign up / Login
3. Click "Create App"
4. Name your app: "Halo Protocol"

### Step 2: Configure Privy App

In Privy Dashboard:

1. **Allowed Domains:**
   - Add your Vercel domain
   - Add `localhost:3000` for development

2. **Login Methods:**
   - Enable: Wallet, Email, Google
   - Configure: Embedded Wallets

3. **Blockchain Networks:**
   - Enable: Solana
   - Add: Devnet (for testing) and Mainnet

4. **Appearance:**
   - Theme: Dark
   - Accent Color: #8B5CF6 (purple)

### Step 3: Get App ID

1. In Privy dashboard, go to "Settings"
2. Copy "App ID"
3. Add to `frontend/.env`:
   ```bash
   NEXT_PUBLIC_PRIVY_APP_ID=clp...
   ```

### Step 4: Test Authentication

```bash
cd frontend
npm run dev

# Visit http://localhost:3000
# Click "Connect Wallet"
# Try different login methods
```

---

## ✅ Part 5: Post-Deployment Verification

### Verify Program Deployment

```bash
# Check program is deployed
solana program show <PROGRAM_ID> --url devnet

# Expected output:
# Program Id: <PROGRAM_ID>
# Owner: BPFLoaderUpgradeab1e11111111111111111111111
# ProgramData Address: <DATA_ADDRESS>
# ...
```

### Test Program Instructions

```bash
# Run demo to test all instructions
npm run demo

# Expected output:
# ✅ Circle initialized
# ✅ Members joined
# ✅ Contributions made
# ✅ Payouts distributed
# ✅ Governance votes cast
```

### Verify Frontend

Visit your deployed URL and test:

- [ ] Homepage loads
- [ ] Wallet connects (Privy)
- [ ] Dashboard displays
- [ ] Can create circle
- [ ] Can join circle
- [ ] Can contribute
- [ ] Trust scores visible
- [ ] Governance page works

### Verify Switchboard

In Switchboard dashboard:

- [ ] All 4 functions created
- [ ] Functions are enabled
- [ ] Functions have SOL balance
- [ ] At least 1 execution successful
- [ ] No error logs

### Test End-to-End Flow

```bash
# Create a test circle
ts-node app/demo-5-member-circle.ts

# Monitor on explorer
# Visit: https://explorer.solana.com/address/<CIRCLE_ADDRESS>?cluster=devnet

# Check frontend shows the circle
# Visit your Vercel URL
```

---

## 📊 Monitoring and Maintenance

### Program Monitoring

```bash
# View program logs
solana logs <PROGRAM_ID> --url devnet

# Check program balance
solana balance <PROGRAM_ID> --url devnet

# View recent transactions
solana transaction-history <PROGRAM_ID> --url devnet --limit 10
```

### Switchboard Monitoring

Dashboard: https://app.switchboard.xyz

- Check execution logs daily
- Monitor function balances
- Set up alerts for failures
- Review error logs

### Frontend Monitoring

Vercel Dashboard: https://vercel.com/dashboard

- Monitor deployment status
- Check error logs
- Review analytics
- Set up performance alerts

### Cost Estimation

**Devnet (Free):**
- Program deployment: 0 SOL (airdrop)
- Transactions: 0 SOL (airdrop)
- Switchboard: ~0.4 SOL/month
- Frontend: $0 (Vercel free tier)

**Mainnet:**
- Program deployment: ~20 SOL (one-time)
- Transaction costs: ~0.000005 SOL each
- Switchboard: ~0.4 SOL/month per function
- Frontend: $0-20/month (Vercel)

---

## 🔄 Updates and Upgrades

### Upgrading Program

```bash
# Build new version
anchor build

# Upgrade deployed program
solana program deploy target/deploy/halo_protocol.so --url devnet --program-id <PROGRAM_ID>

# Or use anchor
anchor upgrade target/deploy/halo_protocol.so --program-id <PROGRAM_ID> --provider.cluster devnet
```

### Updating Frontend

```bash
cd frontend

# Make changes
# ...

# Redeploy
vercel --prod

# Or use script
cd ..
./scripts/deploy-vercel.sh production
```

### Modifying Switchboard Functions

1. Edit function code in `switchboard-functions/`
2. Build new container
3. Update function in Switchboard dashboard
4. Test execution

---

## 🆘 Troubleshooting

### Program Deployment Issues

**Error: "Insufficient funds"**
```bash
# Solution: Add more SOL
solana balance
solana airdrop 2  # devnet only
```

**Error: "Account already exists"**
```bash
# Solution: The program is already deployed
# To upgrade: anchor upgrade <path-to-so>
```

**Error: "Program hash mismatch"**
```bash
# Solution: Rebuild the program
anchor clean
anchor build
anchor deploy
```

### Switchboard Issues

**Functions not executing:**
```bash
# Check:
1. Function is enabled in dashboard
2. Function has sufficient SOL balance
3. Cron schedule is correct
4. No errors in execution logs
```

**"Insufficient balance" error:**
```bash
# Solution: Fund the function escrow
solana transfer <ESCROW_ADDRESS> 0.1 --url devnet
```

### Frontend Issues

**Build fails on Vercel:**
```bash
# Common fixes:
1. Check environment variables are set
2. Verify NEXT_PUBLIC_PROGRAM_ID is correct
3. Run `npm run build` locally first
4. Check Node.js version (use 18.x)
```

**Privy authentication fails:**
```bash
# Check:
1. NEXT_PUBLIC_PRIVY_APP_ID is correct
2. Domain is added to Privy allowed list
3. Privy app is in production mode (not test)
```

---

## 📚 Additional Resources

### Documentation
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Complete API reference
- [DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md) - Getting started guide
- [DEMO_README.md](./DEMO_README.md) - Demo instructions

### Scripts
- `./scripts/deploy-anchor.sh` - Anchor deployment
- `./scripts/deploy-vercel.sh` - Frontend deployment
- `./scripts/setup-switchboard.sh` - Switchboard setup

### Support
- GitHub Issues: Report bugs
- Solana Discord: Get help from community
- Privy Docs: https://docs.privy.io
- Switchboard Docs: https://docs.switchboard.xyz

---

## ✅ Deployment Checklist

Print this checklist and check off each item:

**Pre-Deployment:**
- [ ] Anchor CLI installed (v0.28.0)
- [ ] Solana CLI installed and configured
- [ ] Wallet funded with sufficient SOL
- [ ] Program builds successfully (`anchor build`)
- [ ] Tests pass (`anchor test`)
- [ ] Environment variables prepared

**Program Deployment:**
- [ ] Program deployed to devnet/mainnet
- [ ] Program ID saved
- [ ] Deployment verified on explorer
- [ ] Anchor.toml updated with program ID
- [ ] Program tested with demo script

**Switchboard Setup:**
- [ ] Switchboard account created
- [ ] 4 functions created
- [ ] Functions configured with correct parameters
- [ ] Functions funded with SOL
- [ ] Functions enabled
- [ ] At least one execution successful

**Frontend Deployment:**
- [ ] Environment variables configured
- [ ] Privy app created and configured
- [ ] Frontend builds locally
- [ ] Vercel account created
- [ ] Deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

**Verification:**
- [ ] Can connect wallet on frontend
- [ ] Can create circle
- [ ] Can join circle
- [ ] Can make contribution
- [ ] Trust scores display correctly
- [ ] Governance voting works
- [ ] Solend integration functional
- [ ] Switchboard automation working

**Documentation:**
- [ ] README updated with deployment info
- [ ] API keys documented (securely)
- [ ] Monitoring setup documented
- [ ] Handoff document created (if needed)

---

## 🎉 Deployment Complete!

Your Halo Protocol instance is now live and ready for users!

**Next Steps:**
1. Share your deployment URL
2. Create first circle
3. Invite users to join
4. Monitor performance
5. Iterate and improve

**For hackathons:** You're now ready to present!

**For production:** Consider additional security audits and monitoring.

---

**Questions?** Open an issue on GitHub or reach out to the community.

**Happy Deploying! 🚀**
