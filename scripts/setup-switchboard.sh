#!/bin/bash

# Halo Protocol - Switchboard Automation Setup Script
# Sets up Switchboard Functions for automated payouts and reminders

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
echo -e "${PURPLE}║       ${CYAN}⏰ SWITCHBOARD AUTOMATION SETUP ⏰${PURPLE}              ║${NC}"
echo -e "${PURPLE}║                                                               ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

NETWORK=${1:-devnet}
PROGRAM_ID=${2:-$(grep 'NEXT_PUBLIC_PROGRAM_ID' frontend/.env 2>/dev/null | cut -d= -f2)}

echo -e "${BLUE}Network:${NC} $NETWORK"
echo -e "${BLUE}Program ID:${NC} $PROGRAM_ID"
echo ""

# Validate requirements
echo -e "${BLUE}==>${NC} Checking prerequisites..."

if [ -z "$PROGRAM_ID" ]; then
    echo -e "${RED}❌ Program ID not found${NC}"
    echo "Please provide program ID or ensure frontend/.env has NEXT_PUBLIC_PROGRAM_ID set"
    exit 1
fi

echo -e "${GREEN}✓${NC} Program ID configured"

# Check if Switchboard CLI is installed
if ! command -v sb &> /dev/null; then
    echo -e "${YELLOW}⚠️  Switchboard CLI not found${NC}"
    echo ""
    echo "Install with:"
    echo "  npm install -g @switchboard-xyz/cli"
    echo ""
    echo "Or use Docker:"
    echo "  docker pull switchboardlabs/node"
    echo ""
    read -p "Continue without Switchboard CLI? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    SKIP_CLI=true
else
    echo -e "${GREEN}✓${NC} Switchboard CLI found"
    SKIP_CLI=false
fi

# Display Switchboard setup information
echo ""
echo -e "${CYAN}📋 Switchboard Configuration for Halo Protocol${NC}"
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Required Functions:${NC}"
echo ""
echo -e "1. ${GREEN}Monthly Contribution Reminder${NC}"
echo -e "   Trigger: Day 1 of each month"
echo -e "   Action: Notify members to contribute"
echo -e "   Parameters:"
echo -e "     - Circle Address: <circle_pubkey>"
echo -e "     - Notification Channel: Email/Discord/Telegram"
echo ""

echo -e "2. ${GREEN}Automated Payout Distribution${NC}"
echo -e "   Trigger: Day 20 of each month"
echo -e "   Action: Execute distribute_pot instruction"
echo -e "   Parameters:"
echo -e "     - Circle Address: <circle_pubkey>"
echo -e "     - Recipient Rotation: Automatic"
echo ""

echo -e "3. ${GREEN}Penalty Assessment${NC}"
echo -e "   Trigger: Day 16 of each month"
echo -e "   Action: Check late contributions and apply penalties"
echo -e "   Parameters:"
echo -e "     - Circle Address: <circle_pubkey>"
echo -e "     - Penalty Rate: From circle config"
echo ""

echo -e "4. ${GREEN}Trust Score Update${NC}"
echo -e "   Trigger: Day 25 of each month"
echo -e "   Action: Recalculate all member trust scores"
echo -e "   Parameters:"
echo -e "     - Circle Address: <circle_pubkey>"
echo ""

if [ "$SKIP_CLI" = false ]; then
    echo ""
    echo -e "${BLUE}==>${NC} Creating Switchboard Functions..."
    
    # Create functions directory
    mkdir -p switchboard-functions
    cd switchboard-functions
    
    # Create contribution reminder function
    cat > contribution-reminder.ts << 'EOF'
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export async function contributionReminder(params: any): Promise<void> {
  const { circleAddress, programId } = params;
  
  // Connect to Solana
  const connection = new anchor.web3.Connection(
    process.env.RPC_URL || "https://api.devnet.solana.com"
  );
  
  // Fetch circle data
  const circleData = await fetchCircleData(connection, circleAddress);
  
  // Get all members
  const members = await fetchCircleMembers(connection, circleAddress);
  
  // Send reminders to members who haven't contributed this month
  for (const member of members) {
    if (!member.contributedThisMonth) {
      await sendReminder(member.authority, circleData);
    }
  }
  
  console.log(`Sent ${members.length} contribution reminders`);
}

async function fetchCircleData(connection: any, address: string) {
  // Implementation to fetch circle data
  return {};
}

async function fetchCircleMembers(connection: any, circleAddress: string) {
  // Implementation to fetch members
  return [];
}

async function sendReminder(memberAddress: string, circleData: any) {
  // Implementation to send notification
  console.log(`Reminder sent to ${memberAddress}`);
}
EOF
    
    # Create payout distribution function
    cat > payout-distribution.ts << 'EOF'
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export async function payoutDistribution(params: any): Promise<void> {
  const { circleAddress, programId } = params;
  
  // Connect to Solana
  const connection = new anchor.web3.Connection(
    process.env.RPC_URL || "https://api.devnet.solana.com"
  );
  
  // Load program
  const program = loadProgram(connection, programId);
  
  // Get circle data and determine recipient
  const circleData = await program.account.circle.fetch(circleAddress);
  const recipient = determineRecipient(circleData);
  
  // Execute payout
  await program.methods
    .distributePot()
    .accounts({
      circle: circleAddress,
      recipientMember: recipient,
      // ... other accounts
    })
    .rpc();
  
  console.log(`Payout distributed to ${recipient}`);
}

function loadProgram(connection: any, programId: string) {
  // Implementation
  return null;
}

function determineRecipient(circleData: any): PublicKey {
  // Implementation
  return new PublicKey("11111111111111111111111111111111");
}
EOF
    
    echo -e "${GREEN}✓${NC} Function templates created in ./switchboard-functions/"
    cd ..
fi

# Display configuration instructions
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║           ${CYAN}✨ Switchboard Setup Complete! ✨${GREEN}              ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📝 Manual Setup Steps:${NC}"
echo ""
echo -e "1. ${YELLOW}Visit Switchboard Dashboard:${NC}"
echo -e "   https://app.switchboard.xyz"
echo ""
echo -e "2. ${YELLOW}Create a new Function for each automation:${NC}"
echo -e "   - Contribution Reminder (Cron: 0 0 1 * *)"
echo -e "   - Payout Distribution (Cron: 0 0 20 * *)"
echo -e "   - Penalty Assessment (Cron: 0 0 16 * *)"
echo -e "   - Trust Score Update (Cron: 0 0 25 * *)"
echo ""
echo -e "3. ${YELLOW}Configure Function Parameters:${NC}"
echo -e "   - Program ID: ${PROGRAM_ID}"
echo -e "   - Circle Address: <your_circle_address>"
echo -e "   - Network: ${NETWORK}"
echo ""
echo -e "4. ${YELLOW}Fund the Functions:${NC}"
echo -e "   - Each function needs ~0.01 SOL for execution"
echo -e "   - Use Switchboard dashboard to add funds"
echo ""
echo -e "5. ${YELLOW}Enable and Monitor:${NC}"
echo -e "   - Enable each function in the dashboard"
echo -e "   - Monitor execution logs"
echo -e "   - Set up alerts for failures"
echo ""

echo -e "${CYAN}🔗 Resources:${NC}"
echo -e "   Switchboard Docs: https://docs.switchboard.xyz"
echo -e "   Solana Functions: https://docs.switchboard.xyz/functions"
echo ""

echo -e "${CYAN}💡 Alternative - Docker Setup:${NC}"
echo -e "   For local testing, run:"
echo -e "   ${YELLOW}docker run -d -p 8080:8080 switchboardlabs/node${NC}"
echo ""
