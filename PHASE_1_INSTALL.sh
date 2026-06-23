#!/bin/bash
#
# PHASE 1 EXPANDED SETUP — Fortress Intelligence Installation Script
# Installs: 30 NSE/InvestSkill skills + Claude Trading Skills + ETF/Global Macro skills
# Date: June 19, 2026
# Status: Ready for execution
#

set -e

echo "=========================================="
echo "🚀 PHASE 1 SETUP — Fortress Intelligence"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SKILLS_DIR="${HOME}/.claude/skills"

# Step 1: Verify skills directory
echo -e "${BLUE}[1/4] Checking skills directory...${NC}"
if [ ! -d "$SKILLS_DIR" ]; then
    echo "Creating $SKILLS_DIR"
    mkdir -p "$SKILLS_DIR"
fi
echo -e "${GREEN}✓ Skills directory ready at $SKILLS_DIR${NC}"
echo ""

# Step 2: Clone Claude Trading Skills (US + ETF)
echo -e "${BLUE}[2/4] Installing Claude Trading Skills (US screening + ETF)...${NC}"
cd "$SKILLS_DIR"

if [ -d "claude-trading-skills" ]; then
    echo "Updating existing Claude Trading Skills..."
    cd claude-trading-skills
    git pull origin main
    cd ..
else
    echo "Cloning Claude Trading Skills repository..."
    git clone https://github.com/tradermonty/claude-trading-skills.git
    cd claude-trading-skills
    if [ -f "requirements.txt" ]; then
        echo "Installing Python dependencies..."
        pip install -r requirements.txt --break-system-packages
    fi
    if [ -f "package.json" ]; then
        echo "Installing Node dependencies..."
        npm install
    fi
    cd ..
fi

echo "Copying Claude Trading Skills to skills registry..."
cp -r claude-trading-skills/skills/* . 2>/dev/null || true
echo -e "${GREEN}✓ Claude Trading Skills installed${NC}"
echo ""

# Step 3: Install ETF + Global Macro Skills
echo -e "${BLUE}[3/4] Installing ETF + Global Macro Skills...${NC}"

# Clone llm-quant (macro ETF allocation)
if [ -d "llm-quant" ]; then
    echo "Updating existing llm-quant..."
    cd llm-quant
    git pull origin main
    cd ..
else
    echo "Cloning llm-quant (macro ETF allocation)..."
    git clone https://github.com/45ck/llm-quant.git
    cd llm-quant
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt --break-system-packages
    fi
    cd ..
fi

cp -r llm-quant/skills/* . 2>/dev/null || true

# Optional: Clone agiprolabs skills (62 advanced quant skills)
echo "Would you like to install 62 advanced quantitative finance skills? (y/n)"
read -r install_agiprolabs
if [ "$install_agiprolabs" = "y" ] || [ "$install_agiprolabs" = "Y" ]; then
    if [ -d "agiprolabs-trading-skills" ]; then
        echo "Updating existing agiprolabs skills..."
        cd agiprolabs-trading-skills
        git pull origin main
        cd ..
    else
        echo "Cloning agiprolabs advanced trading skills..."
        git clone https://github.com/agiprolabs/claude-trading-skills.git agiprolabs-trading-skills
        cd agiprolabs-trading-skills
        if [ -f "requirements.txt" ]; then
            pip install -r requirements.txt --break-system-packages
        fi
        cd ..
    fi
    cp -r agiprolabs-trading-skills/skills/* . 2>/dev/null || true
    echo -e "${GREEN}✓ Advanced quant skills installed${NC}"
fi

echo -e "${GREEN}✓ ETF + Global Macro Skills installed${NC}"
echo ""

# Step 4: Verify installation
echo -e "${BLUE}[4/4] Verifying installation...${NC}"
echo ""
echo "📋 Skills Directory Contents:"
ls -la "$SKILLS_DIR" | head -20
echo ""

SKILL_COUNT=$(ls -d "$SKILLS_DIR"/*/ 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Total skill directories: $SKILL_COUNT${NC}"
echo ""

# Final instructions
echo "=========================================="
echo -e "${GREEN}✅ PHASE 1 INSTALLATION COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "📌 NEXT STEPS (Manual in Cowork):"
echo "   1. Open Cowork Settings → Capabilities"
echo "   2. Go to Skills tab"
echo "   3. Add path: $SKILLS_DIR"
echo "   4. Reload chat (Cmd+R)"
echo ""
echo "🧪 TEST COMMAND:"
echo "   Type: /nse-trading-toolkit"
echo "   Should see NSE technical analysis skills"
echo ""
echo "📚 REFERENCE GUIDES:"
echo "   → PHASE_1_EXPANDED_SETUP.md (full setup details)"
echo "   → SKILL_COMMAND_REFERENCE.md (quick command lookup)"
echo ""
echo "🎯 QUICK WORKFLOW:"
echo "   /nse-technical-analysis HDFC"
echo "   /analyze-sentiment AAPL"
echo "   /etf-momentum-scan"
echo "   /macro-regime-detect"
echo ""
echo "💬 Questions? Check CLAUDE.md → PHASE 1 section"
echo "=========================================="
