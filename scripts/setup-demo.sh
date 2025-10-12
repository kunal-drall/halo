#!/bin/bash

# Halo Protocol Demo Setup Script
# This script prepares your environment for running the demo

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print banner
print_banner() {
    echo ""
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                                                               ║${NC}"
    echo -e "${PURPLE}║           ${CYAN}🌟 HALO PROTOCOL DEMO SETUP 🌟${PURPLE}             ║${NC}"
    echo -e "${PURPLE}║                                                               ║${NC}"
    echo -e "${PURPLE}║              ${YELLOW}Solana Devnet | 5-Member Circle${PURPLE}                  ║${NC}"
    echo -e "${PURPLE}║                                                               ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print step
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

# Print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Main setup function
main() {
    print_banner

    # Step 1: Check Node.js
    print_step "Checking Node.js installation..."
    if command_exists node; then
        NODE_VERSION=$(node -v)
        print_success "Node.js $NODE_VERSION installed"
    else
        print_error "Node.js not found"
        echo "Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi

    # Step 2: Check npm
    print_step "Checking npm installation..."
    if command_exists npm; then
        NPM_VERSION=$(npm -v)
        print_success "npm $NPM_VERSION installed"
    else
        print_error "npm not found"
        exit 1
    fi

    # Step 3: Install root dependencies
    print_step "Installing root dependencies..."
    if npm install; then
        print_success "Root dependencies installed"
    else
        print_error "Failed to install root dependencies"
        exit 1
    fi

    # Step 4: Install frontend dependencies
    print_step "Installing frontend dependencies..."
    cd frontend
    if npm install; then
        print_success "Frontend dependencies installed"
    else
        print_warning "Failed to install frontend dependencies (optional)"
    fi
    cd ..

    # Step 5: Setup environment files
    print_step "Setting up environment files..."
    if [ ! -f "frontend/.env" ]; then
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env
            print_success "Created frontend/.env from template"
        else
            print_warning "No .env.example found, skipping"
        fi
    else
        print_success "frontend/.env already exists"
    fi

    # Step 6: Check Solana CLI (optional)
    print_step "Checking Solana CLI (optional)..."
    if command_exists solana; then
        SOLANA_VERSION=$(solana --version | head -n1)
        print_success "$SOLANA_VERSION installed"
    else
        print_warning "Solana CLI not found (optional for demo)"
    fi

    # Success message
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}║                  ${CYAN}✨ Setup Complete! ✨${GREEN}                       ║${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Show next steps
    echo -e "${CYAN}Next steps:${NC}"
    echo ""
    echo -e "1. ${YELLOW}Run the full demo:${NC}"
    echo -e "   ${PURPLE}npm run demo${NC}"
    echo ""
    echo -e "2. ${YELLOW}Start the frontend dashboard:${NC}"
    echo -e "   ${PURPLE}cd frontend && npm run dev${NC}"
    echo -e "   ${CYAN}Then open: http://localhost:3000/demo${NC}"
    echo ""
    echo -e "3. ${YELLOW}Try individual components:${NC}"
    echo -e "   ${PURPLE}npm run demo:5-member${NC}     - Circle initialization"
    echo -e "   ${PURPLE}npm run demo:contributions${NC} - Contribution simulation"
    echo -e "   ${PURPLE}npm run demo:payouts${NC}       - Payout distribution"
    echo -e "   ${PURPLE}npm run demo:governance${NC}    - Governance voting"
    echo ""
    echo -e "${BLUE}For more information:${NC}"
    echo -e "   ${CYAN}cat QUICKSTART_DEMO.md${NC}"
    echo ""
}

# Run main function
main
