#!/bin/bash

# Halo Protocol - Vercel Frontend Deployment Script
# Deploys the Next.js dashboard to Vercel

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                               ║${NC}"
echo -e "${PURPLE}║         ${CYAN}🚀 VERCEL FRONTEND DEPLOYMENT 🚀${PURPLE}              ║${NC}"
echo -e "${PURPLE}║                                                               ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found${NC}"
    echo ""
    echo "Install with:"
    echo "  npm install -g vercel"
    echo ""
    read -p "Install now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g vercel
    else
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Vercel CLI found"

# Navigate to frontend directory
cd frontend

# Check if .env file exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}⚠️  .env not found, creating from .env.example${NC}"
        cp .env.example .env
        echo ""
        echo -e "${RED}⚠️  IMPORTANT: Edit frontend/.env with your configuration${NC}"
        echo "Required variables:"
        echo "  - NEXT_PUBLIC_PROGRAM_ID"
        echo "  - NEXT_PUBLIC_PRIVY_APP_ID"
        echo "  - NEXT_PUBLIC_SOLANA_NETWORK"
        echo ""
        read -p "Press enter to continue once .env is configured..."
    else
        echo -e "${RED}❌ No .env or .env.example found${NC}"
        exit 1
    fi
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Validate required environment variables
echo ""
echo -e "${BLUE}==>${NC} Validating environment configuration..."

if [ -z "$NEXT_PUBLIC_PROGRAM_ID" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_PROGRAM_ID not set${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Program ID: $NEXT_PUBLIC_PROGRAM_ID"

if [ -z "$NEXT_PUBLIC_PRIVY_APP_ID" ]; then
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_PRIVY_APP_ID not set (optional but recommended)${NC}"
else
    echo -e "${GREEN}✓${NC} Privy App ID configured"
fi

if [ -z "$NEXT_PUBLIC_SOLANA_NETWORK" ]; then
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SOLANA_NETWORK not set, defaulting to devnet${NC}"
    export NEXT_PUBLIC_SOLANA_NETWORK=devnet
else
    echo -e "${GREEN}✓${NC} Network: $NEXT_PUBLIC_SOLANA_NETWORK"
fi

# Check dependencies
echo ""
echo -e "${BLUE}==>${NC} Checking dependencies..."
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install --legacy-peer-deps
fi
echo -e "${GREEN}✓${NC} Dependencies installed"

# Build the project
echo ""
echo -e "${BLUE}==>${NC} Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Build successful"

# Login to Vercel (if not already logged in)
echo ""
echo -e "${BLUE}==>${NC} Checking Vercel authentication..."
vercel whoami > /dev/null 2>&1 || vercel login

# Deploy to Vercel
echo ""
echo -e "${BLUE}==>${NC} Deploying to Vercel..."

# Set environment variables for Vercel
echo -e "${YELLOW}Setting environment variables...${NC}"
vercel env add NEXT_PUBLIC_PROGRAM_ID production <<< "$NEXT_PUBLIC_PROGRAM_ID" 2>/dev/null || true
vercel env add NEXT_PUBLIC_SOLANA_NETWORK production <<< "$NEXT_PUBLIC_SOLANA_NETWORK" 2>/dev/null || true
vercel env add NEXT_PUBLIC_RPC_ENDPOINT production <<< "$NEXT_PUBLIC_RPC_ENDPOINT" 2>/dev/null || true

if [ -n "$NEXT_PUBLIC_PRIVY_APP_ID" ]; then
    vercel env add NEXT_PUBLIC_PRIVY_APP_ID production <<< "$NEXT_PUBLIC_PRIVY_APP_ID" 2>/dev/null || true
fi

if [ -n "$NEXT_PUBLIC_SOLEND_MARKET" ]; then
    vercel env add NEXT_PUBLIC_SOLEND_MARKET production <<< "$NEXT_PUBLIC_SOLEND_MARKET" 2>/dev/null || true
fi

# Deploy
echo ""
DEPLOYMENT_ENV=${1:-production}
if [ "$DEPLOYMENT_ENV" == "preview" ]; then
    echo -e "${YELLOW}Deploying preview...${NC}"
    DEPLOYMENT_URL=$(vercel --yes)
else
    echo -e "${YELLOW}Deploying to production...${NC}"
    DEPLOYMENT_URL=$(vercel --prod --yes)
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Display deployment information
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║              ${CYAN}✨ Deployment Complete! ✨${GREEN}                     ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📋 Deployment Summary:${NC}"
echo -e "   Environment: ${YELLOW}$DEPLOYMENT_ENV${NC}"
echo -e "   Network: ${YELLOW}$NEXT_PUBLIC_SOLANA_NETWORK${NC}"
echo -e "   Program ID: ${YELLOW}$NEXT_PUBLIC_PROGRAM_ID${NC}"
echo ""

echo -e "${CYAN}🔗 Access Your Dashboard:${NC}"
echo -e "   ${YELLOW}${DEPLOYMENT_URL}${NC}"
echo ""
echo -e "   Demo page: ${YELLOW}${DEPLOYMENT_URL}/demo${NC}"
echo ""

echo -e "${CYAN}📝 Next Steps:${NC}"
echo -e "   1. Visit your dashboard and connect wallet"
echo -e "   2. Create a circle or join existing ones"
echo -e "   3. Configure Privy authentication if not done"
echo -e "   4. Set up custom domain (optional):"
echo -e "      ${YELLOW}vercel domains add <your-domain.com>${NC}"
echo ""

echo -e "${CYAN}🛠️  Additional Commands:${NC}"
echo -e "   View logs: ${YELLOW}vercel logs${NC}"
echo -e "   List deployments: ${YELLOW}vercel ls${NC}"
echo -e "   Rollback: ${YELLOW}vercel rollback${NC}"
echo ""

cd ..
