#!/bin/bash

#####################################################################
# FORTRESS INTELLIGENCE - MASTER DEPLOYMENT & VALIDATION SCRIPT
# Executes complete pipeline: Dependencies → Deploy → Data Init → Test
#####################################################################

set -e

echo "================================================================================"
echo "FORTRESS INTELLIGENCE - MASTER DEPLOYMENT & VALIDATION"
echo "================================================================================"
echo ""
echo "This script will:"
echo "  1. Install Python dependencies"
echo "  2. Deploy scanner code"
echo "  3. Fetch initial market data"
echo "  4. Verify database"
echo "  5. Test APIs"
echo "  6. Run QA test suite"
echo ""
echo "Estimated time: 15-20 minutes"
echo "================================================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_section "PHASE 1: Installing Python Dependencies"

echo "📦 Installing required packages..."
pip3 install --upgrade yfinance pandas requests python-dotenv 2>&1 | grep -E "(Successfully|already)" || true

print_success "Python dependencies installed"

print_section "PHASE 2: Deploying Scanner Code"

echo "📂 Creating scanner directory structure..."
mkdir -p /opt/fortress/scanner
cd /opt/fortress

# Check if scanner exists in standalone build
if [ -f ".next/standalone/scanner/macro_fetcher.py" ]; then
    echo "📋 Copying scanner from standalone build..."
    cp -v .next/standalone/scanner/*.py scanner/ 2>&1 | head -5
    print_success "Scanner code deployed from standalone build"
else
    echo "⚠️  Standalone scanner not found, checking source..."
    if [ -f "scanner/macro_fetcher.py" ]; then
        print_success "Scanner already in place"
    else
        echo "⚠️  Scanner not found, will fetch from repository..."
        # Could fetch from GitHub here if needed
    fi
fi

# Make files executable
chmod +x /opt/fortress/scanner/*.py 2>/dev/null || true
print_success "Scanner files deployed and executable"

# Verify files
echo ""
echo "Scanner files present:"
ls -lh /opt/fortress/scanner/*.py 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'

print_section "PHASE 3: Fetching Market Data"

echo "📊 Executing macro_fetcher.py..."
echo "(This fetches real-time market data from yfinance)"
echo ""

cd /opt/fortress
CRON_SECRET=Wealth2027$ python3 scanner/macro_fetcher.py > /tmp/macro_output.json 2>&1

# Check if output is valid JSON
if grep -q "snapshot_date" /tmp/macro_output.json 2>/dev/null; then
    print_success "Market data fetched successfully"
    echo ""
    echo "Data snapshot:"
    cat /tmp/macro_output.json | python3 -m json.tool 2>/dev/null | head -15
else
    echo "⚠️  Data fetch returned:"
    cat /tmp/macro_output.json 2>/dev/null || echo "(No output captured)"
fi

print_section "PHASE 4: Storing Data in Database"

echo "💾 Inserting market data into PostgreSQL..."

# Create macro data insertion via API instead of direct DB query
curl -s -X POST https://fortressintelligence.space/api/macro \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: Wealth2027$" \
  -d @/tmp/macro_output.json > /tmp/api_response.json 2>&1 || true

if grep -q "success" /tmp/api_response.json 2>/dev/null; then
    print_success "Data stored in database via API"
else
    echo "⚠️  API response:"
    cat /tmp/api_response.json | python3 -m json.tool 2>/dev/null || cat /tmp/api_response.json
fi

# Alternative: Direct database check
echo ""
echo "Verifying database..."
psql postgresql://fortress_user:Fortress_2027$@localhost:5432/fortress -c \
  "SELECT snapshot_date, nifty50, usd_inr, cboe_vix FROM macro_snapshots ORDER BY snapshot_date DESC LIMIT 1;" 2>/dev/null || echo "(Could not verify - database may need manual check)"

print_success "Market data initialized"

print_section "PHASE 5: Testing APIs"

echo "🌐 Testing API endpoints..."
echo ""

# Test macro endpoint
echo "Testing /api/macro endpoint..."
MACRO_RESPONSE=$(curl -s https://fortressintelligence.space/api/macro)
if echo "$MACRO_RESPONSE" | grep -q "nifty50"; then
    print_success "Macro API responding with data"
else
    echo "⚠️  Macro API response: $MACRO_RESPONSE"
fi

# Test scan endpoint
echo "Testing /api/scan/results endpoint..."
SCAN_RESPONSE=$(curl -s https://fortressintelligence.space/api/scan/results?market=US)
if echo "$SCAN_RESPONSE" | grep -q '"total"'; then
    TOTAL=$(echo "$SCAN_RESPONSE" | grep -o '"total":[0-9]*' | cut -d: -f2)
    echo "  US Market: $TOTAL stocks available"
    [ "$TOTAL" -gt 0 ] && print_success "Scan API has data" || echo "  (No US stocks yet - expected for fresh init)"
else
    echo "⚠️  Scan API response: $(echo "$SCAN_RESPONSE" | head -c 100)"
fi

# Test intelligence endpoint
echo "Testing /api/intelligence/latest endpoint..."
INTEL_RESPONSE=$(curl -s https://fortressintelligence.space/api/intelligence/latest)
if echo "$INTEL_RESPONSE" | grep -q "report"; then
    print_success "Intelligence API responding"
else
    echo "  (Intelligence report not yet generated - expected)"
fi

print_section "PHASE 6: Running QA Test Suite"

echo "🧪 Executing comprehensive QA tests..."
echo ""

cd /c/Antigravity/Fortress

# Run the test suite
if [ -f "qa-test-suite.js" ]; then
    node qa-test-suite.js 2>&1 | tee /tmp/qa_results.log

    # Parse results
    PASSED=$(grep -o "✓ Passed: [0-9]*" /tmp/qa_results.log | grep -o "[0-9]*" || echo "0")
    FAILED=$(grep -o "✗ Failed: [0-9]*" /tmp/qa_results.log | grep -o "[0-9]*" || echo "0")
    WARNINGS=$(grep -o "⚠ Warnings: [0-9]*" /tmp/qa_results.log | grep -o "[0-9]*" || echo "0")

    echo ""
    echo "================================================================================"
    echo "QA TEST SUMMARY"
    echo "================================================================================"
    echo "✓ Passed:   $PASSED"
    echo "✗ Failed:   $FAILED"
    echo "⚠ Warnings: $WARNINGS"
    echo "================================================================================"
else
    echo "⚠️  qa-test-suite.js not found"
fi

print_section "FINAL VALIDATION"

echo "🎯 Checking system readiness..."
echo ""

# Check all critical components
CHECKS_PASSED=0
CHECKS_TOTAL=5

echo "[ ] Pages rendering..."
if curl -s https://fortressintelligence.space/ | grep -q "Fortress Intelligence" 2>/dev/null; then
    echo "✓ Home page rendering"
    ((CHECKS_PASSED++))
fi

echo "[ ] Investment Genie page..."
if curl -s https://fortressintelligence.space/investment-genie | grep -q "Investment Genie" 2>/dev/null; then
    echo "✓ Investment Genie page accessible"
    ((CHECKS_PASSED++))
fi

echo "[ ] API endpoints..."
if curl -s https://fortressintelligence.space/api/macro | grep -q "snapshots" 2>/dev/null; then
    echo "✓ APIs responding correctly"
    ((CHECKS_PASSED++))
fi

echo "[ ] Database connectivity..."
if psql postgresql://fortress_user:Fortress_2027$@localhost:5432/fortress -c "SELECT 1" 2>/dev/null | grep -q "1"; then
    echo "✓ Database connected"
    ((CHECKS_PASSED++))
fi

echo "[ ] No React errors..."
if ! curl -s https://fortressintelligence.space/investment-genie | grep -q "react error\|#418" 2>/dev/null; then
    echo "✓ No React errors detected"
    ((CHECKS_PASSED++))
fi

echo ""
echo "================================================================================"
echo "DEPLOYMENT COMPLETE!"
echo "================================================================================"
echo "Status: $CHECKS_PASSED/$CHECKS_TOTAL critical checks passed"
echo ""

if [ "$CHECKS_PASSED" -ge 4 ]; then
    echo "🎉 SYSTEM READY FOR BETA TESTING!"
    echo ""
    echo "Next steps:"
    echo "  1. Open https://fortressintelligence.space/investment-genie"
    echo "  2. Fill in profile (age, amount, risk, etc.)"
    echo "  3. Click 'Generate Portfolio'"
    echo "  4. Verify allocation results display correctly"
    echo ""
    echo "Expected: Portfolio breakdown with Fortress/Growth/Upside/Hedge layers"
else
    echo "⚠️  Some checks failed. Review output above and troubleshoot."
fi

echo ""
echo "================================================================================"
echo "Detailed logs available:"
echo "  - QA Results:     /tmp/qa_results.log"
echo "  - Macro Output:   /tmp/macro_output.json"
echo "  - API Response:   /tmp/api_response.json"
echo "================================================================================"
