# Halo Protocol — Deployment Guide

**Program ID:** `25yXdB1i6MN7MvRoR17Q5okn3pEktaMEH2QP4wJv3Bs5`

## Prerequisites

- Node.js 20+
- Rust 1.93.0 (`rustup install 1.93.0`)
- Solana CLI v2.2+ (`sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"`)
- Anchor CLI 0.31.1 (`cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.1 anchor-cli`)
- Docker (optional, for containerized deployment)

## Environment Setup

1. Copy the env template:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

2. Fill in all values (see table below for required vs optional):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SOLANA_NETWORK` | Yes | `devnet` or `mainnet-beta` |
| `NEXT_PUBLIC_RPC_ENDPOINT` | Yes | Helius RPC URL with API key |
| `NEXT_PUBLIC_PROGRAM_ID` | Yes | Deployed program address |
| `NEXT_PUBLIC_USDC_MINT` | Yes | USDC token mint address |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `HELIUS_API_KEY` | Yes | Helius API key |
| `HELIUS_WEBHOOK_SECRET` | Yes | Webhook signature secret |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST token |
| `SESSION_SECRET` | **Yes (production)** | Min 32-char random string |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry error tracking DSN |
| `NEXT_PUBLIC_SOLEND_PROGRAM` | No | Solend program ID |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins |

## Smart Contract

### Quick Deploy (Devnet)
```bash
# 1. Fund your wallet (~8 SOL needed)
solana config set --url devnet
solana airdrop 5  # may need multiple, rate limited 2 per 8 hours
# Alternative: https://faucet.solana.com

# 2. Build and deploy
./scripts/deploy-devnet.sh
# Or manually:
anchor build
solana program deploy --program-id target/deploy/halo_protocol-keypair.json target/deploy/halo_protocol.so --url devnet
```

**Note:** blake3 and constant_time_eq are pinned in Cargo.toml for SBF toolchain compatibility. Do not remove these pins unless the platform-tools rustc supports edition2024 (1.85+).

### Build
```bash
anchor build
```

### Deploy to Devnet
```bash
solana program deploy --program-id target/deploy/halo_protocol-keypair.json target/deploy/halo_protocol.so --url devnet
```

### Deploy to Mainnet
```bash
# 1. Build verifiable
anchor build --verifiable

# 2. Deploy
solana program deploy --program-id target/deploy/halo_protocol-keypair.json target/deploy/halo_protocol.so --url mainnet-beta

# 3. Verify on Solscan
anchor verify 25yXdB1i6MN7MvRoR17Q5okn3pEktaMEH2QP4wJv3Bs5 --provider.cluster mainnet-beta
```

### Initialize On-Chain State
After deploying, initialize the Treasury and RevenueParams PDAs:
```bash
cd /workspaces/halo
npx ts-node scripts/initialize-protocol.ts
```
This creates two global accounts needed for fee collection:
- **Treasury** PDA (seeds: `[b"treasury"]`) — tracks collected fees
- **RevenueParams** PDA (seeds: `[b"revenue_params"]`) — fee rates (0.5% distribution, 0.25% yield, 2% annual management)

### Recover Buffer Accounts
If a deploy failed partway through, recover orphaned buffer SOL:
```bash
solana program close <BUFFER_ADDRESS> --url devnet
```

## Frontend

### Development
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
cd frontend
npm ci
npm run build
npm start
```

### Docker
```bash
# Build and run
docker compose up -d

# Or build manually
cd frontend
docker build -t halo-frontend .
docker run -p 3000:3000 --env-file .env.local halo-frontend
```

### Vercel Deployment
1. Connect your GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add all environment variables in Vercel dashboard
4. Deploy triggers automatically on push to `main`

Required Vercel secrets:
```
VERCEL_TOKEN     # For CI/CD deploy workflow
VERCEL_ORG_ID    # From .vercel/project.json
VERCEL_PROJECT_ID # From .vercel/project.json
```

## CI/CD

Three GitHub Actions workflows are configured:

### `ci.yml` — Runs on every push/PR
1. **Contract Build Check** — `cargo check` + clippy + fmt
2. **Anchor Build** — Full `anchor build` + IDL artifact upload
3. **Frontend Build** — npm install → lint → type check → build
4. **Frontend Tests** — Vitest test suite (42 tests)

### `deploy.yml` — Runs on push to main
1. Runs full CI pipeline
2. Deploys frontend to Vercel (preview or production)
3. Runs smoke test against `/api/health`

### `security.yml` — Runs on push/PR + weekly
1. `npm audit` for frontend dependencies
2. `cargo audit` for Rust dependencies
3. Secret scanning in source code

## Database

### Initial Setup
Run the migration against your Supabase instance:
```bash
# Via Supabase CLI
supabase db push

# Or manually paste supabase/migrations/001_initial_schema.sql
# into the Supabase SQL editor
```

### Helius Webhook
1. Go to Helius dashboard
2. Create webhook for your program ID
3. Set webhook URL: `https://your-domain.com/api/webhooks/helius`
4. Set the webhook secret in `HELIUS_WEBHOOK_SECRET`

## Health Check

The `/api/health` endpoint checks all service dependencies:

```bash
curl https://your-domain.com/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "uptime": 3600,
  "services": {
    "supabase": "ok",
    "redis": "ok",
    "solana": "ok"
  }
}
```

Status codes:
- `200` — Healthy or degraded
- `503` — All services down

## Testing

### Frontend Tests
```bash
cd frontend
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Smart Contract Tests
```bash
# Requires solana-test-validator running
anchor test
```

## Security Checklist

- [ ] `SESSION_SECRET` is set (min 32 random chars)
- [ ] `HELIUS_WEBHOOK_SECRET` is set
- [ ] `ALLOWED_ORIGINS` is set for production CORS
- [ ] Supabase RLS policies are enabled
- [ ] API rate limiting is functional (test with `curl` burst)
- [ ] No secrets in source code (run `npm run security-scan`)
- [ ] HTTPS enforced (Vercel handles this)
- [ ] Security headers verified (X-Frame-Options, CSP, etc.)

## Monitoring

| Service | Purpose | Setup |
|---------|---------|-------|
| Sentry | Error tracking | Set `NEXT_PUBLIC_SENTRY_DSN` |
| `/api/health` | Uptime monitoring | Point UptimeRobot/Pingdom here |
| Vercel Analytics | Performance | Enable in Vercel dashboard |
| Supabase | DB monitoring | Built-in dashboard |
