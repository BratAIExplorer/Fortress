#!/usr/bin/env node

/**
 * Diagnostic script to check scan status in the database
 * Usage: node diagnostic-scan-status.js
 */

const { resolve } = require('path');
require('dotenv').config({ path: resolve(__dirname, './fortress-app/.env.local') });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log('🔍 Checking scan status...\n');

    // Query 1: Get all scans ordered by date
    const scansRes = await pool.query(`
      SELECT
        id,
        run_at,
        status,
        market,
        total_scanned,
        good_results_count,
        error_message,
        created_at
      FROM scans
      ORDER BY run_at DESC
      LIMIT 10
    `);

    console.log('📊 Latest 10 Scans:');
    console.log('─'.repeat(100));
    scansRes.rows.forEach((scan, i) => {
      const date = new Date(scan.run_at).toLocaleString();
      console.log(`${i + 1}. Market: ${scan.market.padEnd(6)} | Status: ${scan.status.padEnd(10)} | Date: ${date} | Good Results: ${scan.good_results_count}/${scan.total_scanned}`);
      if (scan.error_message) {
        console.log(`   Error: ${scan.error_message}`);
      }
    });

    // Query 2: Specific check for US market scans
    console.log('\n📈 US Market Scans (All Time):');
    console.log('─'.repeat(100));
    const usScansRes = await pool.query(`
      SELECT
        id,
        run_at,
        status,
        good_results_count,
        total_scanned
      FROM scans
      WHERE market = 'US'
      ORDER BY run_at DESC
      LIMIT 10
    `);

    if (usScansRes.rows.length === 0) {
      console.log('⚠️  No US market scans found in database!');
    } else {
      usScansRes.rows.forEach((scan, i) => {
        const date = new Date(scan.run_at).toLocaleString();
        const passed = scan.status === 'COMPLETED' ? '✅' : '❌';
        console.log(`${i + 1}. ${passed} ${date} | Status: ${scan.status} | Results: ${scan.good_results_count}/${scan.total_scanned}`);
      });
    }

    // Query 3: Check for May 2-3, 2026 scans
    console.log('\n📅 Scans on May 2-3, 2026:');
    console.log('─'.repeat(100));
    const recentRes = await pool.query(`
      SELECT
        id,
        run_at,
        status,
        market,
        good_results_count,
        total_scanned
      FROM scans
      WHERE run_at >= '2026-05-02'::date
        AND run_at < '2026-05-04'::date
      ORDER BY run_at DESC
    `);

    if (recentRes.rows.length === 0) {
      console.log('⚠️  No scans found for May 2-3, 2026');
    } else {
      recentRes.rows.forEach((scan) => {
        const date = new Date(scan.run_at).toLocaleString();
        const icon = scan.status === 'COMPLETED' ? '✅' : scan.status === 'FAILED' ? '❌' : '⏳';
        console.log(`${icon} ${date} | ${scan.market} | ${scan.status} | ${scan.good_results_count}/${scan.total_scanned}`);
      });
    }

    // Summary
    console.log('\n📝 Summary:');
    console.log('─'.repeat(100));
    const completedRes = await pool.query(`
      SELECT market, COUNT(*) as count FROM scans WHERE status = 'COMPLETED' GROUP BY market
    `);
    completedRes.rows.forEach(row => {
      console.log(`${row.market}: ${row.count} completed scans`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
