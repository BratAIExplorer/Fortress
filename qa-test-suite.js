/**
 * COMPREHENSIVE QA TEST SUITE
 * Testing all critical functionality systematically
 * Senior QA approach: Test each flow independently, validate API contracts, check UI rendering
 */

const BASE_URL = 'http://localhost:3000';

class QATestSuite {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  log(level, test, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level} | ${test} | ${message}`);
  }

  async testAPIEndpoint(name, url, expectedStatus = 200) {
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (res.status === expectedStatus) {
        this.results.passed.push(name);
        this.log('PASS', name, `Status ${res.status} OK`);
        return { success: true, data };
      } else {
        this.results.failed.push(name);
        this.log('FAIL', name, `Expected ${expectedStatus}, got ${res.status}`);
        return { success: false, data };
      }
    } catch (error) {
      this.results.failed.push(name);
      this.log('ERROR', name, error.message);
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    console.log('\n' + '='.repeat(80));
    console.log('FORTRESS INTELLIGENCE - COMPREHENSIVE QA TEST SUITE');
    console.log('='.repeat(80) + '\n');

    // PHASE 1: API Connectivity Tests
    console.log('PHASE 1: API CONNECTIVITY & DATA INTEGRITY');
    console.log('-'.repeat(80));

    const scanTest = await this.testAPIEndpoint(
      'API: GET /api/scan/results?market=US',
      `${BASE_URL}/api/scan/results?market=US`
    );

    const macroTest = await this.testAPIEndpoint(
      'API: GET /api/macro',
      `${BASE_URL}/api/macro`
    );

    const intelligenceTest = await this.testAPIEndpoint(
      'API: GET /api/intelligence/latest',
      `${BASE_URL}/api/intelligence/latest`
    );

    // PHASE 2: Frontend Page Rendering
    console.log('\nPHASE 2: FRONTEND PAGE RENDERING');
    console.log('-'.repeat(80));

    try {
      const homePage = await fetch(`${BASE_URL}`);
      if (homePage.ok) {
        this.results.passed.push('PAGE: Home');
        this.log('PASS', 'PAGE: Home', 'Rendered successfully');
      } else {
        this.results.failed.push('PAGE: Home');
        this.log('FAIL', 'PAGE: Home', `Status ${homePage.status}`);
      }
    } catch (error) {
      this.results.failed.push('PAGE: Home');
      this.log('ERROR', 'PAGE: Home', error.message);
    }

    try {
      const geniePage = await fetch(`${BASE_URL}/investment-genie`);
      if (geniePage.ok) {
        this.results.passed.push('PAGE: Investment Genie');
        this.log('PASS', 'PAGE: Investment Genie', 'Rendered successfully');
      } else {
        this.results.failed.push('PAGE: Investment Genie');
        this.log('FAIL', 'PAGE: Investment Genie', `Status ${geniePage.status}`);
      }
    } catch (error) {
      this.results.failed.push('PAGE: Investment Genie');
      this.log('ERROR', 'PAGE: Investment Genie', error.message);
    }

    try {
      const fortress30Page = await fetch(`${BASE_URL}/fortress-30`);
      if (fortress30Page.ok) {
        this.results.passed.push('PAGE: Fortress 30');
        this.log('PASS', 'PAGE: Fortress 30', 'Rendered successfully');
      } else {
        this.results.failed.push('PAGE: Fortress 30');
        this.log('FAIL', 'PAGE: Fortress 30', `Status ${fortress30Page.status}`);
      }
    } catch (error) {
      this.results.failed.push('PAGE: Fortress 30');
      this.log('ERROR', 'PAGE: Fortress 30', error.message);
    }

    // PHASE 3: Data Structure Validation
    console.log('\nPHASE 3: DATA STRUCTURE VALIDATION');
    console.log('-'.repeat(80));

    if (scanTest.success && scanTest.data) {
      const hasResults = Array.isArray(scanTest.data.results);
      const hasMetadata = scanTest.data.scanDate || scanTest.data.market;
      if (hasResults && hasMetadata) {
        this.results.passed.push('DATA: Scan Results Structure');
        this.log('PASS', 'DATA: Scan Results', `${scanTest.data.results.length} stocks returned`);
      } else {
        this.results.failed.push('DATA: Scan Results Structure');
        this.log('FAIL', 'DATA: Scan Results', 'Missing required fields');
      }
    }

    if (macroTest.success && macroTest.data) {
      const snapshot = macroTest.data.snapshots?.[0] || macroTest.data.snapshot;
      const hasRequiredFields = snapshot && (snapshot.nifty50 || snapshot.cboe_vix);
      if (hasRequiredFields) {
        this.results.passed.push('DATA: Macro Snapshot Structure');
        this.log('PASS', 'DATA: Macro Snapshot', 'Structure valid');
      } else {
        this.results.failed.push('DATA: Macro Snapshot Structure');
        this.log('FAIL', 'DATA: Macro Snapshot', 'Missing required fields');
      }
    }

    if (intelligenceTest.success && intelligenceTest.data) {
      const report = intelligenceTest.data.report;
      if (report) {
        const hasSignals = Array.isArray(report.signals);
        this.results.passed.push('DATA: Intelligence Report Structure');
        this.log('PASS', 'DATA: Intelligence Report', `Signals array: ${hasSignals ? 'Present' : 'Missing'}`);

        if (hasSignals && report.signals.length > 0) {
          this.log('INFO', 'DATA: Signals Sample', JSON.stringify(report.signals[0], null, 2).substring(0, 200));
        }
      } else {
        this.results.warnings.push('DATA: No Intelligence Report');
        this.log('WARN', 'DATA: Intelligence Report', 'No reports in database yet (expected for fresh system)');
      }
    }

    // PHASE 4: Allocation Engine Logic
    console.log('\nPHASE 4: ALLOCATION ENGINE LOGIC');
    console.log('-'.repeat(80));

    if (scanTest.success && macroTest.success) {
      const hasUSStocks = scanTest.data.results?.some(r => r.market === 'US');
      const hasNSEStocks = scanTest.data.results?.some(r => r.market === 'NSE');

      if (hasUSStocks) {
        this.results.passed.push('DATA: US Market Candidates');
        this.log('PASS', 'DATA: US Market', 'Candidates available for allocation');
      } else {
        this.results.warnings.push('DATA: No US Market Candidates');
        this.log('WARN', 'DATA: US Market', 'No candidates available');
      }

      if (hasNSEStocks) {
        this.results.passed.push('DATA: NSE Market Candidates');
        this.log('PASS', 'DATA: NSE Market', 'Candidates available for allocation');
      } else {
        this.results.warnings.push('DATA: No NSE Market Candidates');
        this.log('WARN', 'DATA: NSE Market', 'No candidates available (expected if not yet populated)');
      }
    }

    // PHASE 5: React Component Rendering
    console.log('\nPHASE 5: REACT COMPONENT ERROR DETECTION');
    console.log('-'.repeat(80));

    try {
      const response = await fetch(`${BASE_URL}/investment-genie`);
      const html = await response.text();

      // Check for React errors
      const hasReactError = html.includes('react error') || html.includes('#418') || html.includes('invalid props');
      if (!hasReactError) {
        this.results.passed.push('REACT: No Console Errors');
        this.log('PASS', 'REACT: Error Detection', 'No obvious React errors detected');
      } else {
        this.results.failed.push('REACT: Component Rendering');
        this.log('FAIL', 'REACT: Error Detection', 'React errors detected in HTML');
      }
    } catch (error) {
      this.log('ERROR', 'REACT: Component Check', error.message);
    }

    // SUMMARY
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`✓ Passed: ${this.results.passed.length}`);
    console.log(`✗ Failed: ${this.results.failed.length}`);
    console.log(`⚠ Warnings: ${this.results.warnings.length}`);
    console.log('='.repeat(80) + '\n');

    if (this.results.failed.length > 0) {
      console.log('FAILED TESTS:');
      this.results.failed.forEach(test => console.log(`  ✗ ${test}`));
      console.log();
    }

    if (this.results.warnings.length > 0) {
      console.log('WARNINGS:');
      this.results.warnings.forEach(test => console.log(`  ⚠ ${test}`));
      console.log();
    }

    return {
      passed: this.results.passed.length,
      failed: this.results.failed.length,
      warnings: this.results.warnings.length,
      totalTests: this.results.passed.length + this.results.failed.length
    };
  }
}

// Run tests
(async () => {
  const suite = new QATestSuite();
  const results = await suite.runAllTests();
  process.exit(results.failed > 0 ? 1 : 0);
})();
