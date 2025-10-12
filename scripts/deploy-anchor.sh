#!/bin/bash

# Halo Protocol - Anchor Program Deployment Script
# Deploys the Halo Protocol smart contract to Solana

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Print banner
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                               ║${NC}"
echo -e "${PURPLE}║         ${CYAN}🚀 HALO PROTOCOL ANCHOR DEPLOYMENT 🚀${PURPLE}          ║${NC}"
echo -e "${PURPLE}║                                                               ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get network from arguments (default to devnet)
NETWORK=${1:-devnet}
KEYPAIR=${2:-~/.config/solana/id.json}

echo -e "${BLUE}Network:${NC} $NETWORK"
echo -e "${BLUE}Keypair:${NC} $KEYPAIR"
echo ""

# Validate network
if [[ ! "$NETWORK" =~ ^(localnet|devnet|testnet|mainnet-beta)$ ]]; then
    echo -e "${RED}❌ Invalid network: $NETWORK${NC}"
    echo "Valid options: localnet, devnet, testnet, mainnet-beta"
    exit 1
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found${NC}"
    echo "Install with: cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
    exit 1
fi

echo -e "${GREEN}✓${NC} Anchor CLI found: $(anchor --version)"

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found${NC}"
    echo "Install with: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi

echo -e "${GREEN}✓${NC} Solana CLI found: $(solana --version | head -1)"

# Check if keypair exists
if [ ! -f "$KEYPAIR" ]; then
    echo -e "${RED}❌ Keypair not found: $KEYPAIR${NC}"
    echo "Generate with: solana-keygen new -o $KEYPAIR"
    exit 1
fi

echo -e "${GREEN}✓${NC} Keypair found"

# Set Solana config
echo ""
echo -e "${BLUE}==>${NC} Setting Solana configuration..."

if [ "$NETWORK" == "localnet" ]; then
    solana config set --url http://127.0.0.1:8899
elif [ "$NETWORK" == "devnet" ]; then
    solana config set --url https://api.devnet.solana.com
elif [ "$NETWORK" == "testnet" ]; then
    solana config set --url https://api.testnet.solana.com
elif [ "$NETWORK" == "mainnet-beta" ]; then
    solana config set --url https://api.mainnet-beta.solana.com
fi

solana config set --keypair "$KEYPAIR"

# Check balance
echo ""
echo -e "${BLUE}==>${NC} Checking SOL balance..."
BALANCE=$(solana balance | awk '{print $1}')
echo -e "Balance: ${GREEN}$BALANCE SOL${NC}"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    if [ "$NETWORK" == "devnet" ] || [ "$NETWORK" == "testnet" ]; then
        echo -e "${YELLOW}⚠️  Low balance. Requesting airdrop...${NC}"
        solana airdrop 2 || echo -e "${YELLOW}Airdrop may have failed, continuing anyway${NC}"
    else
        echo -e "${RED}❌ Insufficient balance. Need at least 2 SOL for deployment.${NC}"
        exit 1
    fi
fi

# Build the program
echo ""
echo -e "${BLUE}==>${NC} Building Halo Protocol program..."
anchor build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build successful"

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/halo_protocol-keypair.json)
echo ""
echo -e "${CYAN}Program ID: ${PROGRAM_ID}${NC}"

# Update Anchor.toml if needed
echo ""
echo -e "${BLUE}==>${NC} Updating Anchor.toml..."
if [ "$NETWORK" == "devnet" ]; then
    # Add devnet configuration if not exists
    if ! grep -q "\[programs.devnet\]" Anchor.toml; then
        echo "" >> Anchor.toml
        echo "[programs.devnet]" >> Anchor.toml
        echo "halo_protocol = \"$PROGRAM_ID\"" >> Anchor.toml
    fi
elif [ "$NETWORK" == "mainnet-beta" ]; then
    if ! grep -q "\[programs.mainnet\]" Anchor.toml; then
        echo "" >> Anchor.toml
        echo "[programs.mainnet]" >> Anchor.toml
        echo "halo_protocol = \"$PROGRAM_ID\"" >> Anchor.toml
    fi
fi

# Deploy the program
echo ""
echo -e "${BLUE}==>${NC} Deploying to $NETWORK..."
anchor deploy --provider.cluster $NETWORK

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Deployment successful"

# Verify deployment
echo ""
echo -e "${BLUE}==>${NC} Verifying deployment..."
solana program show $PROGRAM_ID

# Display deployment information
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║              ${CYAN}✨ Deployment Complete! ✨${GREEN}                     ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 Deployment Summary:${NC}"
echo -e "   Network: ${YELLOW}$NETWORK${NC}"
echo -e "   Program ID: ${YELLOW}$PROGRAM_ID${NC}"
echo -e "   Keypair: ${YELLOW}$KEYPAIR${NC}"
echo ""

if [ "$NETWORK" == "devnet" ]; then
    echo -e "${CYAN}🔗 Explorer:${NC}"
    echo -e "   https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
    echo ""
elif [ "$NETWORK" == "mainnet-beta" ]; then
    echo -e "${CYAN}🔗 Explorer:${NC}"
    echo -e "   https://explorer.solana.com/address/$PROGRAM_ID"
    echo ""
fi

echo -e "${CYAN}📝 Next Steps:${NC}"
echo -e "   1. Update frontend/.env with: ${YELLOW}NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID${NC}"
echo -e "   2. Deploy frontend: ${YELLOW}./scripts/deploy-vercel.sh${NC}"
echo -e "   3. Set up Switchboard: ${YELLOW}./scripts/setup-switchboard.sh${NC}"
echo -e "   4. Run demo: ${YELLOW}npm run demo${NC}"
echo ""
