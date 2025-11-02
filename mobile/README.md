# Halo Protocol Mobile App

**Privacy-First Decentralized Lending Circles on Solana**

Powered by Arcium (encrypted compute) and Reflect (capital-efficient stablecoins)

## 📱 Overview

The Halo Protocol mobile app is a React Native application built with Expo that brings privacy-first DeFi lending circles to mobile devices. The app showcases cutting-edge integrations with Arcium's Multi-Party Computation for privacy and Reflect's yield-bearing stablecoins for maximum capital efficiency.

### Key Features

**🔒 Privacy Features (Arcium)**
- Encrypted trust score calculations
- Private borrowing (loan amounts hidden from others)
- Anonymous circle participation
- Sealed bid auctions
- Zero-knowledge proofs for verification

**💰 Dual Yield Features (Reflect)**
- USDC+ staking (5.2% APY price appreciation)
- USDJ staking (6.8% APY funding rate capture)
- Combined with Solend lending yields (3.8% APY)
- Real-time yield tracking from both sources
- Auto-compounding earnings

**🔵 Circle Features**
- Create and join lending circles
- Fixed rotation, random, or sealed-bid payout methods
- Trust score-based lending
- Automated payment reminders
- Social features and member coordination

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- **React Native** with **Expo** (v49)
- **TypeScript** for type safety
- **React Navigation** for routing
- **Reanimated** for smooth animations
- **React Native SVG** for custom graphics

**Blockchain & Web3**
- **@solana/web3.js** - Solana blockchain interaction
- **@coral-xyz/anchor** - Program interaction
- **Privy** - Embedded wallet solution
- **Arcium SDK** - Encrypted compute integration
- **Reflect SDK** - Yield stablecoin integration

**State Management**
- React Context API for global state
- Local state with hooks
- Secure storage for sensitive data (SecureStore)

**Backend Services**
- REST API for off-chain data
- Push notifications (Expo Notifications)
- Real-time yield tracking
- Analytics and monitoring

### Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── PrivacyBadge.tsx
│   │   ├── YieldDisplay.tsx
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   └── ...
│   ├── screens/             # Main app screens
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── StakeScreen.tsx
│   │   ├── CirclesScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── ...
│   ├── navigation/          # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── AuthStack.tsx
│   ├── contexts/            # React contexts
│   │   ├── SolanaContext.tsx
│   │   ├── PrivacyContext.tsx
│   │   └── YieldContext.tsx
│   ├── services/            # API & blockchain services
│   │   ├── api.ts
│   │   ├── arcium.ts
│   │   ├── reflect.ts
│   │   ├── solana.ts
│   │   └── notifications.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useWallet.ts
│   │   ├── useYield.ts
│   │   ├── usePrivacy.ts
│   │   └── useCircles.ts
│   ├── theme/               # Design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   ├── utils/               # Utility functions
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── crypto.ts
│   └── types/               # TypeScript type definitions
│       ├── circle.ts
│       ├── user.ts
│       └── yield.ts
├── assets/                  # Images, fonts, etc.
├── app.json                 # Expo configuration
├── package.json
└── tsconfig.json
```

---

## 🎨 Design System

### Color Palette

**Primary Colors**
```typescript
primary: '#a855f7'      // Purple
primaryDark: '#7c3aed'
primaryLight: '#c084fc'
```

**Privacy Theme**
```typescript
privacy: {
  purple: '#a855f7',    // Arcium brand
  pink: '#ec4899',
  cyan: '#06b6d4',
  arcium: '#8b5cf6',
}
```

**Yield Theme**
```typescript
yield: {
  green: '#10b981',     // General yield
  reflect: '#22c55e',   // Reflect yields
  solend: '#3b82f6',    // Solend yields
}
```

**Background**
```typescript
background: '#0f172a'        // Dark blue
backgroundLight: '#1e293b'
backgroundCard: '#1e293b'
```

### Typography

```typescript
h1: { fontSize: 32, fontWeight: '700' }
h2: { fontSize: 24, fontWeight: '700' }
h3: { fontSize: 20, fontWeight: '600' }
h4: { fontSize: 18, fontWeight: '600' }
body: { fontSize: 16, fontWeight: '400' }
bodySmall: { fontSize: 14, fontWeight: '400' }
caption: { fontSize: 12, fontWeight: '400' }
```

### Spacing Scale

```typescript
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
xxl: 48px
```

---

## 📱 Screen Specifications

### 1. Onboarding Screen

**Purpose:** First-time user experience with wallet connection and privacy setup

**Components:**
- Welcome message
- Feature highlights (Privacy + Dual Yields)
- Connect Wallet button (Privy integration)
- Privacy Setup Modal:
  - Toggle for encrypted trust score
  - Toggle for private borrowing
  - Toggle for anonymous participation
  - "Enable Privacy" CTA with Arcium branding

**User Flow:**
```
1. User opens app for first time
2. Sees welcome screen with feature highlights
3. Taps "Connect Wallet"
4. Privy modal opens (email, social, or existing wallet)
5. After connection, Privacy Setup modal appears
6. User chooses privacy settings
7. Redirected to Home screen
```

**Key States:**
- Initial (not connected)
- Connecting (loading)
- Privacy setup
- Complete (navigates to Home)

---

### 2. Home Screen (Dashboard)

**Purpose:** Overview of user's portfolio and quick actions

**Layout:**

**Header**
- Privacy mode indicator (if enabled)
- Notification icon
- Settings icon

**Portfolio Card**
```
Total Portfolio Value
$12,345.67

💰 Reflect Yield: +$45.20 (5.2% APY)
📈 Solend Yield: +$28.40 (3.8% APY)
Combined APY: 9.0%

24h Change: +$12.45 (+2.3%)
```

**Quick Stats Grid** (2x2)
```
┌─────────────┬─────────────┐
│ Total APY   │ Active      │
│ 9.0%        │ Circles     │
│ ↑ 0.3%      │ 3 circles   │
├─────────────┼─────────────┤
│ Trust       │ Next        │
│ Score       │ Payment     │
│ 785/1000 🥇 │ $100        │
│             │ in 3 days   │
└─────────────┴─────────────┘
```

**Yield Sources** (Horizontal scroll)
```
[Reflect USDC+] [Reflect USDJ] [Solend]
   5.2% APY        6.8% APY     3.8% APY
```

**Actions**
- Stake button
- Create Circle button
- Borrow button

**Recent Activity List**
- Latest transactions
- Circle updates
- Yield distributions

---

### 3. Stake Screen

**Purpose:** Stake assets to earn dual yields

**Components:**

**Token Selector Tabs**
```
[USDC+]  [USDJ]  [SOL]
  ✓
```

**Yield Breakdown Card**
```
┌─────────────────────────────────┐
│ USDC+ DUAL YIELD                │
│                                 │
│ Reflect Base Yield:    5.2% APY │
│ Solend Lending Yield: +3.8% APY │
│ ─────────────────────────────── │
│ Total APY:             9.0% 📈  │
│                                 │
│ Your Earnings (24h): +$12.45    │
│   • Reflect: +$7.80             │
│   • Solend: +$4.65              │
└─────────────────────────────────┘
```

**Current Stake Card**
```
Amount Staked: 2,500 USDC+
Current Value: $2,512.50 (↑0.5%)
Total Yield Earned: $156.80

Yield Split:
Reflect: $98.20 (63%)
Solend: $58.60 (37%)

[View Detailed Chart]
```

**Stake/Unstake Interface**
- Amount input field
- Available balance display
- Slider for quick amounts (25%, 50%, 75%, 100%)
- Privacy toggle: "🔒 Encrypt my staking amount"
- Buttons:
  - "Stake USDC+" (primary gradient button)
  - "Unstake" (outline button)

**Info Box**
```
✨ Capital Efficient Staking with Reflect

Your funds earn from TWO sources:
- Reflect price appreciation (4.5% APY)
- Solend lending yield (3.8% APY)

🔒 Privacy Optional:
Stake amounts can be encrypted via Arcium

🚀 Liquid - withdraw anytime
```

**Transaction Flow:**
```
1. User selects token (USDC+)
2. Enters amount or uses slider
3. Optionally enables privacy
4. Taps "Stake USDC+"
5. Review modal shows:
   - Staking amount
   - Dual yield breakdown
   - New borrowing capacity
   - Gas fees
   - Privacy settings
6. User confirms
7. Privy handles transaction
8. Success toast + updated balance
```

---

### 4. Circles Screen

**Purpose:** Browse, create, and manage lending circles

**Components:**

**Header**
- Privacy filter: `[All] [Public] [🔒 Private]`
- Search bar
- "Create Circle" button

**Active Circles List**

Each card:
```
┌─────────────────────────────────┐
│ 🔒 Tech Professionals Circle    │
│                                 │
│ 👥 8/10 members                 │
│ 💰 $400/month USDC+             │
│ 📈 Earning 9.2% APY             │
│                                 │
│ Next Payout:                    │
│ 🔒 Member #3 (in 5 days)        │
│                                 │
│ Progress: ████████░░ 8/12 months│
│                                 │
│ [Pay] [View Details]            │
└─────────────────────────────────┘
```

**Privacy Indicators:**
- 🔒 Private circles show anonymous members
- Public circles show real names
- Encrypted payment amounts in private circles

**Discover Circles Section**

Filters:
- Trust score range
- Monthly contribution
- Duration
- Privacy type
- Yield strategy (USDC+, USDJ)

Circle Discovery Cards:
```
┌─────────────────────────────────┐
│ Startup Founders Circle         │
│ 👁️ Public                       │
│                                 │
│ 💰 $500/month × 12 months       │
│ 📈 9.5% APY with USDC+          │
│ 👥 5/8 members                  │
│ ⭐ Min Trust: 700               │
│                                 │
│ Est. Yield: ~$342 over 12mo     │
│                                 │
│ [Request to Join]               │
└─────────────────────────────────┘
```

---

### 5. Circle Details Screen

**Purpose:** View and interact with a specific circle

**Components:**

**Header**
- Circle name
- Privacy badges
- Share button
- Menu (Leave, Report)

**Overview Card**
```
Status: Active
Progress: 8/12 months (66%)

Yield Earned:
• From Reflect: $156.20
• From Solend: $94.30
• Total: $250.50

Next Distribution: Nov 15, 2025

Next Payout:
🔒 Member #4 → $1,200 USDC+
```

**Members Section**

If Private:
```
┌───────────────────┐
│ Member #1    ✅   │  Payment Status: Paid
│ 🔒 Encrypted      │
│ 785 trust score   │
└───────────────────┘

┌───────────────────┐
│ Member #2    ⏳   │  Payment Status: Pending
│ 🔒 Encrypted      │
│ 820 trust score   │
└───────────────────┘
```

If Public:
```
┌───────────────────┐
│ Alice (@alice)✅  │
│ 785 trust score   │
│ Paid $400 USDC+   │
└───────────────────┘
```

**Your Private Stats** (Only visible to you)
```
┌─────────────────────────────────┐
│ YOUR STATS (Only you see this)  │
│                                 │
│ Contributed:     $3,200         │
│ Payout Received: $3,200         │
│ Reflect Yield:   +$144.00       │
│ Solend Yield:    +$86.40        │
│ Trust Impact:    +40 points     │
│                                 │
│ 🔒 Encrypted by Arcium          │
└─────────────────────────────────┘
```

**Payout Schedule**
- Timeline view showing all months
- Past/future payouts
- Anonymous in private circles

**Actions**
- Make Payment button
- View Transactions
- Contact Members (if public)
- Encrypted Bid (if auction-based)

---

### 6. Create Circle Flow

**Purpose:** Create a new lending circle

**Step 1: Basic Details**
```
Circle Name: _________________

Privacy Settings:
○ 👁️ Public Circle
  All data visible to members

● 🔒 Private Circle (Recommended)
  ✓ Member identities hidden
  ✓ Payment amounts encrypted
  ✓ Powered by Arcium MPC

[Continue]
```

**Step 2: Financial Terms**
```
Stablecoin Selection:
● USDC+ (Recommended)
  • 5.2% base yield
  • +3.8% from Solend
  • Total: 9.0% APY

○ USDJ
  • 6.8% funding rate yield
  • +3.8% from Solend
  • Total: 10.6% APY

○ Regular USDC
  • 3.8% Solend only

Monthly Contribution: $________
Duration: ___ months (6-24)

Estimated Circle Yield:
$XXX over XX months

[Continue]
```

**Step 3: Member Settings**
```
Number of Members: ___ (2-20)

Min Trust Score: ___ (0-1000)

Privacy Requirements:
□ Require encrypted trust scores
□ Anonymous member participation
□ Private payment amounts

[Continue]
```

**Step 4: Payout Method**
```
How should payouts be distributed?

○ Fixed Rotation
  Members receive in predetermined order

○ Random Lottery
  Fair random selection each month

○ 🔒 Encrypted Auction (Arcium)
  Members bid in sealed envelopes
  Highest bidder wins round
  Bids revealed after selection

[Continue]
```

**Step 5: Review & Create**
```
Circle Summary:
Name: Tech Professionals Circle
Privacy: 🔒 Private
Token: USDC+ (9.0% APY)
Contribution: $400/month
Duration: 12 months
Members: 10
Min Trust: 700
Payout: Encrypted Auction

Estimated Yields:
• Per Member: ~$216/year
• Total Circle: ~$2,160/year

□ I agree to circle terms

[Create Circle] ($X.XX fee)
```

---

### 7. Borrow Screen

**Purpose:** Borrow against staked collateral

**Components:**

**Header**
```
Private Borrowing
🔒 Powered by Arcium
```

**Borrowing Power Card**
```
Available to Borrow: $2,250

Based on:
• Staked USDC+: $2,500 ($2,512 value)
• Trust Score: 785 (Gold)
• LTV Ratio: 90%

🔒 Your borrowing activity is encrypted
```

**Trust Score Display**
```
┌─────────────────────────────────┐
│  🔒 ENCRYPTED TRUST SCORE       │
│                                 │
│        ┌───────────┐            │
│        │    785    │  🥇 Gold   │
│        │  ─────    │            │
│        │   1000    │            │
│        └───────────┘            │
│                                 │
│  Calculated via Arcium MPC      │
│  [Verify Calculation]           │
└─────────────────────────────────┘
```

**Borrow Interface**
```
Loan Amount: $________

Privacy Settings:
□ 🔒 Private Loan
  Others won't see your borrowing activity

Interest Rate: 6.0% APR
(Reduced from 8% due to Gold tier)

Repayment Term:
○ 3 months    ○ 6 months
○ 12 months   ○ 24 months

Collateral Requirements:
• Current: $2,500 USDC+
• Required: $2,500 (110% LTV)
• Buffer: $0 ✓

[Review Loan Terms]
```

**Privacy Guarantee Box**
```
🔒 YOUR LOAN IS PRIVATE

When privacy is enabled:
✓ Loan amount encrypted
✓ Purpose hidden
✓ Repayment schedule private
✓ Only you and protocol see details

Powered by Arcium MPC
Zero-knowledge proof verification

[Learn More]
```

**Loan Calculator**
```
Borrowing: $2,000
Term: 12 months
Rate: 6.0% APY

Monthly Payment: $172.55
Total Interest: $70.60
Total Repayment: $2,070.60

During loan period:
Your collateral earns: ~$225 yield
Net cost: -$154.40 (interest - yield)

[Borrow Now]
```

**Active Loans List**
```
┌─────────────────────────────────┐
│ 🔒 Private Loan                 │
│ $2,000 borrowed                 │
│ 6.0% APR • 8/12 months paid     │
│                                 │
│ Next Payment: $172.55 (Nov 15)  │
│ Collateral: $2,500 USDC+        │
│ Yield Earned: +$150.20          │
│                                 │
│ [Make Payment] [View Details]   │
└─────────────────────────────────┘
```

---

### 8. Profile Screen

**Purpose:** User profile, settings, and privacy management

**Components:**

**Header**
```
@username
GtR8...k3pQ

🔒 Privacy Mode: Active
[Manage Privacy]
```

**Trust Score Section**
```
┌─────────────────────────────────┐
│  🔒 ENCRYPTED TRUST SCORE       │
│                                 │
│        ┌───────────┐            │
│        │    785    │  🥇 Gold   │
│        │  ─────    │            │
│        │   1000    │            │
│        └───────────┘            │
│                                 │
│  Calculated via Arcium MPC      │
│                                 │
│  Benefits Unlocked:             │
│  ✓ 90% LTV ratio                │
│  ✓ Private circles access       │
│  ✓ 6% interest rate             │
│  ✓ Premium features             │
│                                 │
│  Next tier: 65 points away      │
│  [View Breakdown]               │
└─────────────────────────────────┘
```

**Privacy Dashboard**
```
┌─────────────────────────────────┐
│ PRIVACY SETTINGS                │
│                                 │
│ Encrypted Features Active:      │
│ ✓ Trust score calculation       │
│ ✓ Payment history               │
│ ✓ Borrowing amounts             │
│ ✓ Circle participation          │
│                                 │
│ Data encrypted via Arcium MPC   │
│                                 │
│ [Manage Privacy]                │
│ [Privacy Audit Log]             │
│ [Export Encrypted Data]         │
└─────────────────────────────────┘
```

**Lifetime Yield Card**
```
┌─────────────────────────────────┐
│ LIFETIME YIELD EARNED           │
│                                 │
│ From Reflect:     $456.80      │
│ From Solend:      $284.20      │
│ ─────────────────────────────── │
│ Total:            $741.00      │
│                                 │
│ Current APY: 9.2%               │
│ [View History]                  │
└─────────────────────────────────┘
```

**Financial Overview**
```
Staked Assets:
• USDC+: $2,500 (earning 5.2%)
• USDJ: $1,000 (earning 6.8%)
• SOL: 12 SOL (earning 7.5%)

Total Value: $4,240

Active Circles: 3
Total Borrowed: 🔒 Private

[View Details]
```

**Settings Menu**
- Notification Preferences
- Security & Privacy
- Connected Wallet
- Language & Currency
- Help & Support
- Terms & Privacy Policy
- Log Out

---

### 9. Yield Dashboard Screen

**Purpose:** Detailed view of all yield sources

**Components:**

**Header**
```
Yield Sources
[24h] [7d] [30d] [All]
         ✓
```

**Yield Breakdown Cards**

**Reflect Yield Card**
```
┌─────────────────────────────────┐
│ REFLECT MONEY YIELD             │
│                                 │
│ USDC+ Price Appreciation:       │
│ • APY: 5.2%                     │
│ • 7d Earnings: +$15.20          │
│ • Staked: $2,500                │
│                                 │
│ USDJ Funding Yield:             │
│ • APY: 6.8%                     │
│ • 7d Earnings: +$12.80          │
│ • Staked: $1,000                │
│                                 │
│ Total Reflect: +$28.00          │
│                                 │
│ [View Reflect Dashboard] →      │
└─────────────────────────────────┘
```

**Solend Yield Card**
```
┌─────────────────────────────────┐
│ SOLEND LENDING YIELD            │
│                                 │
│ Current APY:          3.8%      │
│ 7d Earnings:         +$16.65    │
│                                 │
│ Your Lending:        $3,500     │
│ Utilization:          87%       │
│                                 │
│ [View Solend Dashboard] →       │
└─────────────────────────────────┘
```

**Combined Chart**
- Stacked area chart
- Purple: Reflect yield
- Blue: Solend yield
- Green line: Total
- Interactive touch tooltips

**Yield Distribution History**
```
Oct 29, 2025
+ $12.45 total
  • Reflect USDC+: $7.80
  • Solend: $4.65

Oct 28, 2025
+ $11.90 total
  • Reflect USDC+: $7.45
  • Solend: $4.45

...
```

---

### 10. Privacy Settings Screen

**Purpose:** Manage privacy and encryption settings

**Components:**

**Header**
```
Privacy & Encryption
🔒 Powered by Arcium
```

**Privacy Controls**

**Trust Score Privacy**
```
┌─────────────────────────────────┐
│ Trust Score Calculation         │
│ [Toggle ON]                     │
│                                 │
│ Your payment history and        │
│ account data is processed in    │
│ Arcium's encrypted MPC          │
│ environment.                    │
│                                 │
│ Status: ✓ Encrypted             │
└─────────────────────────────────┘
```

**Borrowing Privacy**
```
┌─────────────────────────────────┐
│ Private Loans                   │
│ [Toggle ON]                     │
│                                 │
│ Others won't see your           │
│ borrowing activity or loan      │
│ amounts.                        │
│                                 │
│ Status: ✓ Active                │
└─────────────────────────────────┘
```

**Circle Privacy**
```
┌─────────────────────────────────┐
│ Anonymous Participation         │
│ [Toggle ON]                     │
│                                 │
│ Show as "Member #X" in          │
│ circles instead of your         │
│ identity.                       │
│                                 │
│ Status: ✓ Anonymous             │
└─────────────────────────────────┘
```

**Staking Privacy**
```
┌─────────────────────────────────┐
│ Hide Staking Amounts            │
│ [Toggle OFF]                    │
│                                 │
│ Others see you're staking       │
│ but not the amounts.            │
│                                 │
│ Status: ○ Public                │
└─────────────────────────────────┘
```

**Privacy Audit Log**
```
Recent Encrypted Operations:

Oct 29, 15:30
Trust score recalculated
✓ Verified on Arcium
Hash: 0x4f3a...8b2c

Oct 28, 09:15
Private loan created
✓ Verified on Arcium
Hash: 0x7a2b...3e9f

[View All]
```

**Education Section**
```
📚 How Your Privacy Works

Arcium MPC ensures:
✓ Calculations in encrypted state
✓ No single party can decrypt
✓ Verifiable integrity
✓ Zero-knowledge proofs

[Learn More About Arcium] →
[View Privacy Policy]
```

**Data Management**
- Export Encrypted Data
- Download Privacy Report
- Verify Encryption Status
- Revoke Access (emergency)

---

## 🔐 Privy Wallet Integration

### Setup

```typescript
// App.tsx
import { PrivyProvider } from '@privy-io/expo';

<PrivyProvider
  appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID}
  clientId={process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID}
>
  {/* Your app */}
</PrivyProvider>
```

### Usage in Components

```typescript
import { usePrivy } from '@privy-io/expo';

const MyComponent = () => {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    sendTransaction,
  } = usePrivy();

  const handleConnect = async () => {
    await login();
  };

  const handleStake = async (amount: number) => {
    const tx = await buildStakeTransaction(amount);
    const signature = await sendTransaction(tx);
    return signature;
  };

  return (
    <Button onPress={handleConnect}>
      {authenticated ? user.wallet.address : 'Connect Wallet'}
    </Button>
  );
};
```

### Embedded Wallet Features

**Email/Social Login**
- Email + OTP
- Google
- Twitter
- Discord
- Apple

**Key Management**
- Non-custodial
- MPC key shares
- Biometric unlock
- Recovery options

**Transaction Signing**
```typescript
const signature = await sendTransaction({
  to: programId,
  data: instructionData,
  value: 0,
});
```

---

## 🔒 Arcium Integration

### Encrypted Trust Score

```typescript
// services/arcium.ts
import { RescueCipher, x25519, getMXEPublicKeyWithRetry } from '@arcium-hq/client';

export const encryptTrustScore = async (
  trustData: TrustScoreData,
  programId: PublicKey
): Promise<EncryptedScore> => {
  // 1. Get MXE public key
  const mxePublicKey = await getMXEPublicKeyWithRetry(
    connection,
    programId
  );

  // 2. Generate keypair
  const privateKey = x25519.utils.randomSecretKey();
  const publicKey = x25519.getPublicKey(privateKey);

  // 3. Create shared secret
  const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);

  // 4. Initialize cipher
  const cipher = new RescueCipher(sharedSecret);

  // 5. Encrypt data
  const plaintext = [
    BigInt(trustData.paymentHistory.onTimePayments),
    BigInt(trustData.paymentHistory.totalPayments),
    BigInt(trustData.circlesCompleted),
    BigInt(trustData.circlesJoined),
  ];

  const nonce = randomBytes(16);
  const ciphertext = cipher.encrypt(plaintext, nonce);

  return {
    encryptedData: ciphertext[0],
    computeKey: mxePublicKey,
    nonce,
    publicKey,
  };
};
```

### Private Borrowing

```typescript
export const createPrivateLoan = async (
  loanData: LoanData
): Promise<EncryptedLoan> => {
  const { ciphertext, nonce, publicKey } = await encryptLoanTerms(loanData);

  // Queue computation via Solana program
  const tx = await program.methods
    .createPrivateLoan(
      Array.from(ciphertext),
      Array.from(publicKey),
      new BN(nonce.toString())
    )
    .accounts({
      // ... accounts
    })
    .transaction();

  return { tx, ciphertext, nonce };
};
```

### Sealed Bid Auctions

```typescript
export const placeSealedBid = async (
  circleId: string,
  bidAmount: number
): Promise<SealedBid> => {
  const { ciphertext, commitmentHash } = await sealBid({
    circleId,
    amount: bidAmount,
    bidder: userWallet,
    timestamp: Date.now(),
  });

  return {
    sealedBid: ciphertext,
    commitmentHash,
    timestamp: Date.now(),
  };
};

export const revealBids = async (
  sealedBids: SealedBid[]
): Promise<BidData[]> => {
  // Reveals happen after auction ends
  const revealed = await Promise.all(
    sealedBids.map(bid => revealBid(bid))
  );

  // Sort by amount (highest first)
  return revealed.sort((a, b) => b.amount - a.amount);
};
```

---

## 💰 Reflect Integration

### USDC+ Staking

```typescript
// services/reflect.ts
import { UsdcPlusStablecoin } from '@reflectmoney/stable.ts';

export const stakeUSDCPlus = async (
  amount: number,
  userWallet: PublicKey
): Promise<string> => {
  const usdcPlus = new UsdcPlusStablecoin(connection);
  await usdcPlus.load(connection);

  const mintIx = await usdcPlus.mint(
    userWallet,
    new BN(amount),
    new BN(amount * 0.999) // 0.1% slippage
  );

  // Build versioned transaction
  const lookupTable = await connection.getAddressLookupTable(
    usdcPlus.lookupTable
  );

  const { blockhash } = await connection.getLatestBlockhash();

  const message = new TransactionMessage({
    instructions: mintIx,
    payerKey: userWallet,
    recentBlockhash: blockhash,
  }).compileToV0Message([lookupTable.value]);

  const tx = new VersionedTransaction(message);

  // Sign and send via Privy
  const signature = await sendTransaction(tx);

  return signature;
};
```

### Dual Yield Tracking

```typescript
export const getYieldBreakdown = async (
  amount: number
): Promise<YieldBreakdown> => {
  // Get Reflect APY
  const reflectAPY = await getUSDCPlusAPY();

  // Get Solend APY
  const solendAPY = await getSolendAPY();

  // Calculate earnings
  const reflectEarnings = amount * (reflectAPY / 100);
  const solendEarnings = amount * (solendAPY / 100);

  return {
    reflectYield: {
      name: 'Reflect USDC+ Appreciation',
      apy: reflectAPY,
      earned: reflectEarnings,
    },
    solendYield: {
      name: 'Solend Lending Yield',
      apy: solendAPY,
      earned: solendEarnings,
    },
    totalAPY: reflectAPY + solendAPY,
    totalEarned: reflectEarnings + solendEarnings,
  };
};
```

### Price Appreciation

```typescript
export const getPriceAppreciation = async (
  token: 'USDC+' | 'USDJ',
  period: '24h' | '7d' | '30d'
): Promise<PriceAppreciation> => {
  const client = token === 'USDC+'
    ? new UsdcPlusStablecoin(connection)
    : new UsdjStablecoin(connection);

  await client.load(connection);

  // Get current price from oracle
  const currentPrice = await client.getCurrentPrice();

  // Calculate appreciation
  const startPrice = await getHistoricalPrice(token, period);
  const percentChange = ((currentPrice - startPrice) / startPrice) * 100;

  return {
    token,
    period,
    currentPrice,
    startPrice,
    percentageChange: percentChange,
    absoluteChange: currentPrice - startPrice,
  };
};
```

---

## 📊 API Service Layer

### Backend API Structure

```
api/
├── auth/
│   ├── login
│   ├── logout
│   └── verify
├── users/
│   ├── profile
│   ├── trust-score
│   └── settings
├── circles/
│   ├── list
│   ├── create
│   ├── join
│   ├── details/:id
│   └── members/:id
├── yield/
│   ├── breakdown
│   ├── history
│   └── projections
├── privacy/
│   ├── settings
│   ├── audit-log
│   └── verify
└── notifications/
    ├── register
    ├── preferences
    └── history
```

### API Client

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle auth error
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Example API Calls

```typescript
// Get user profile
export const getUserProfile = async (walletAddress: string) => {
  return api.get(`/users/profile/${walletAddress}`);
};

// Get circles
export const getCircles = async (filters?: CircleFilters) => {
  return api.get('/circles/list', { params: filters });
};

// Get yield breakdown
export const getYieldBreakdown = async (walletAddress: string) => {
  return api.get(`/yield/breakdown/${walletAddress}`);
};

// Update privacy settings
export const updatePrivacySettings = async (settings: PrivacySettings) => {
  return api.post('/privacy/settings', settings);
};
```

---

## 🔔 Push Notifications

### Setup

```typescript
// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync();

  // Send token to backend
  await api.post('/notifications/register', {
    token: token.data,
    platform: Device.osName,
  });

  return token.data;
};
```

### Notification Types

**Payment Reminders**
```json
{
  "title": "Payment Due Tomorrow",
  "body": "Tech Circle - $400 USDC+ due Oct 31",
  "data": {
    "type": "payment_reminder",
    "circleId": "abc123",
    "amount": 400,
    "dueDate": "2025-10-31"
  }
}
```

**Payout Notifications**
```json
{
  "title": "You're Next for Payout!",
  "body": "Travel Circle - $1,200 in 3 days",
  "data": {
    "type": "payout_upcoming",
    "circleId": "def456",
    "amount": 1200,
    "date": "2025-11-02"
  }
}
```

**Yield Updates**
```json
{
  "title": "Yield Earned: +$12.45",
  "body": "Reflect: $7.80 | Solend: $4.65",
  "data": {
    "type": "yield_update",
    "total": 12.45,
    "reflect": 7.80,
    "solend": 4.65
  }
}
```

### Handling Notifications

```typescript
// App.tsx
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Listen for notifications
Notifications.addNotificationReceivedListener((notification) => {
  console.log('Notification received:', notification);
});

// Handle notification taps
Notifications.addNotificationResponseReceivedListener((response) => {
  const { type, circleId } = response.notification.request.content.data;

  switch (type) {
    case 'payment_reminder':
      navigation.navigate('CircleDetails', { id: circleId });
      break;
    case 'payout_upcoming':
      navigation.navigate('CircleDetails', { id: circleId });
      break;
    case 'yield_update':
      navigation.navigate('YieldDashboard');
      break;
  }
});
```

---

## 🧪 Testing

### Unit Tests

```typescript
// __tests__/components/PrivacyBadge.test.tsx
import { render } from '@testing-library/react-native';
import { PrivacyBadge } from '../src/components/PrivacyBadge';

describe('PrivacyBadge', () => {
  it('renders encrypted badge correctly', () => {
    const { getByText } = render(
      <PrivacyBadge type="encrypted" showLabel />
    );

    expect(getByText('Encrypted')).toBeTruthy();
  });

  it('shows Arcium branding when enabled', () => {
    const { getByText } = render(
      <PrivacyBadge type="encrypted" showArcium />
    );

    expect(getByText('Powered by Arcium')).toBeTruthy();
  });
});
```

### Integration Tests

```typescript
// __tests__/flows/stake.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { StakeScreen } from '../src/screens/StakeScreen';

describe('Staking Flow', () => {
  it('completes USDC+ staking', async () => {
    const { getByText, getByPlaceholderText } = render(<StakeScreen />);

    // Enter amount
    const input = getByPlaceholderText('Amount to stake');
    fireEvent.changeText(input, '1000');

    // Tap stake button
    const stakeButton = getByText('Stake USDC+');
    fireEvent.press(stakeButton);

    // Wait for confirmation
    await waitFor(() => {
      expect(getByText('Stake successful')).toBeTruthy();
    });
  });
});
```

### E2E Tests (Detox)

```typescript
// e2e/onboarding.e2e.ts
describe('Onboarding', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should complete onboarding', async () => {
    // Connect wallet
    await element(by.id('connect-wallet-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('submit-button')).tap();

    // Setup privacy
    await waitFor(element(by.id('privacy-modal')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('enable-privacy-toggle')).tap();
    await element(by.id('enable-privacy-button')).tap();

    // Should navigate to home
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

---

## 🚀 Deployment

### Development Build

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android
```

### Production Build

#### iOS (via EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

#### Android (via EAS)

```bash
# Build for Android
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

### Environment Variables

Create `.env` file:

```env
# API
EXPO_PUBLIC_API_URL=https://api.haloprotocol.xyz

# Privy
EXPO_PUBLIC_PRIVY_APP_ID=your_app_id
EXPO_PUBLIC_PRIVY_CLIENT_ID=your_client_id

# Solana
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
EXPO_PUBLIC_PROGRAM_ID=your_program_id

# Analytics
EXPO_PUBLIC_ANALYTICS_KEY=your_analytics_key
```

### App Store Requirements

**iOS**
- Privacy manifest
- App tracking transparency
- Screenshot requirements (6.5", 6.7", 5.5")
- App description highlighting privacy features

**Android**
- Privacy policy URL
- Data safety form
- Feature graphic (1024x500)
- Screenshots (phone and tablet)

---

## 📖 Additional Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Privy Documentation](https://docs.privy.io)
- [Arcium Documentation](https://docs.arcium.com)
- [Reflect Documentation](https://docs.reflect.money)

### Community
- Discord: [Halo Protocol Community]
- Twitter: [@HaloProtocol]
- GitHub: [github.com/halo-protocol]

### Support
- Email: support@haloprotocol.xyz
- Documentation: docs.haloprotocol.xyz
- Status: status.haloprotocol.xyz

---

## 📝 License

MIT License - see LICENSE file for details

---

**Built with ❤️ by the Halo Protocol team**

*Privacy-first DeFi for everyone*
