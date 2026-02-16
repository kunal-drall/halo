#!/bin/bash
set -euo pipefail

# Halo Protocol - Devnet Deployment Script
# Usage: ./scripts/deploy-devnet.sh

export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

PROGRAM_ID="25yXdB1i6MN7MvRoR17Q5okn3pEktaMEH2QP4wJv3Bs5"
PROGRAM_KEYPAIR="target/deploy/halo_protocol-keypair.json"
PROGRAM_SO="target/deploy/halo_protocol.so"

echo "=== Halo Protocol Devnet Deployment ==="
echo ""

# 1. Verify prerequisites
echo "[1/6] Checking prerequisites..."
if ! command -v solana &>/dev/null; then
    echo "ERROR: solana CLI not found. Install from https://docs.solanalabs.com/cli/install"
    exit 1
fi
if ! command -v anchor &>/dev/null; then
    echo "ERROR: anchor CLI not found. Install with: cargo install --git https://github.com/coral-xyz/anchor anchor-cli"
    exit 1
fi
echo "  Solana CLI: $(solana --version)"
echo "  Anchor CLI: $(anchor --version)"

# 2. Configure for devnet
echo ""
echo "[2/6] Configuring for devnet..."
solana config set --url devnet
WALLET=$(solana address)
echo "  Wallet: $WALLET"

# 3. Check balance
echo ""
echo "[3/6] Checking balance..."
BALANCE=$(solana balance | awk '{print $1}')
echo "  Balance: $BALANCE SOL"

REQUIRED_SOL=8
if (( ${BALANCE%.*} < REQUIRED_SOL )); then
    echo ""
    echo "  Insufficient balance. Need ~${REQUIRED_SOL} SOL for deployment."
    echo "  Get devnet SOL from: https://faucet.solana.com"
    echo "  Your wallet address: $WALLET"
    echo ""
    echo "  Run: solana airdrop 5 --url devnet"
    echo "  (May need multiple airdrops, rate limited to 2 per 8 hours)"
    exit 1
fi

# 4. Build program
echo ""
echo "[4/6] Building program..."
if [ ! -f "$PROGRAM_SO" ]; then
    echo "  Building from source..."
    anchor build
else
    echo "  Using existing build: $PROGRAM_SO"
    echo "  (Run 'anchor build' to rebuild)"
fi

# Verify keypair matches expected program ID
KEYPAIR_ADDR=$(solana address -k "$PROGRAM_KEYPAIR")
if [ "$KEYPAIR_ADDR" != "$PROGRAM_ID" ]; then
    echo "ERROR: Keypair address ($KEYPAIR_ADDR) doesn't match expected program ID ($PROGRAM_ID)"
    echo "The program will deploy to the keypair's address. Update PROGRAM_ID if needed."
    exit 1
fi

# 5. Deploy to devnet
echo ""
echo "[5/6] Deploying to devnet..."
solana program deploy \
    --program-id "$PROGRAM_KEYPAIR" \
    "$PROGRAM_SO" \
    --url devnet

# 6. Verify deployment
echo ""
echo "[6/6] Verifying deployment..."
solana program show "$PROGRAM_ID" --url devnet

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Program ID: $PROGRAM_ID"
echo "Explorer:   https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet"
echo ""
echo "Next steps:"
echo "  1. Set up environment variables (see .env.example)"
echo "  2. Initialize Supabase database (see supabase/schema.sql)"
echo "  3. Deploy frontend: cd frontend && npx next build"
echo "  4. Configure Helius webhooks for program ${PROGRAM_ID}"
