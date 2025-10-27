#!/bin/bash

# Halo Protocol Demo Information Display
# Shows current demo status and helpful commands

# Colors
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                               ║${NC}"
echo -e "${PURPLE}║         ${CYAN}🌟 HALO PROTOCOL DEMO INFORMATION 🌟${PURPLE}          ║${NC}"
echo -e "${PURPLE}║                                                               ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}📋 Available Demo Commands:${NC}"
echo ""

echo -e "${YELLOW}Full Demo:${NC}"
echo -e "  ${CYAN}npm run demo${NC}"
echo -e "  Runs complete end-to-end demo with all features"
echo ""

echo -e "${YELLOW}Individual Components:${NC}"
echo -e "  ${CYAN}npm run demo:5-member${NC}"
echo -e "  Initialize and display 5-member circle"
echo ""
echo -e "  ${CYAN}npm run demo:contributions${NC}"
echo -e "  Simulate monthly contributions"
echo ""
echo -e "  ${CYAN}npm run demo:payouts${NC}"
echo -e "  Simulate automated payout distributions"
echo ""
echo -e "  ${CYAN}npm run demo:governance${NC}"
echo -e "  Simulate governance voting and proposals"
echo ""

echo -e "${YELLOW}Frontend Dashboard:${NC}"
echo -e "  ${CYAN}cd frontend && npm run dev${NC}"
echo -e "  Launch live dashboard at http://localhost:3000/demo"
echo ""

echo -e "${GREEN}📊 Demo Features:${NC}"
echo ""
echo -e "  ✓ 5-member circle (Alice, Bob, Charlie, Diana, Eve)"
echo -e "  ✓ 10 USDC monthly contributions"
echo -e "  ✓ Solend yield generation (~5.2% APY)"
echo -e "  ✓ Switchboard automation scheduling"
echo -e "  ✓ Trust score tracking"
echo -e "  ✓ Governance voting with quadratic weighting"
echo -e "  ✓ Live dashboard with Privy authentication"
echo ""

echo -e "${GREEN}📚 Documentation:${NC}"
echo ""
echo -e "  ${CYAN}QUICKSTART_DEMO.md${NC}    - Quick start guide"
echo -e "  ${CYAN}DEMO_README.md${NC}        - Comprehensive demo documentation"
echo -e "  ${CYAN}README.md${NC}             - Main project documentation"
echo ""

echo -e "${GREEN}🔧 Setup:${NC}"
echo ""
echo -e "  ${CYAN}./scripts/setup-demo.sh${NC}  - Run setup script"
echo -e "  ${CYAN}npm install${NC}             - Install dependencies manually"
echo ""

echo -e "${GREEN}💡 Tips:${NC}"
echo ""
echo -e "  • Run setup first: ${CYAN}./scripts/setup-demo.sh${NC}"
echo -e "  • Demo uses Solana devnet (no real funds)"
echo -e "  • Frontend requires Privy App ID in .env (optional)"
echo -e "  • All scripts include detailed console output"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""
