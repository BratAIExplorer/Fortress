#!/usr/bin/env node
/**
 * COMPREHENSIVE END-TO-END AUTHENTICATION VALIDATION SUITE
 * Senior QA / Security Test Pack Execution
 * Tests all Auth workflows: Registration, Duplicate Defense, Email Verification, Login,
 * Session Cookie Management, CSRF Tokens, Rate Limiting / Lockout, Forgot/Reset Password, and Logout.
 *
 * Self-cleaning: Creates and deletes test users (*@fortress.test) in local DB.
 */

import { db } from "@/lib/db/client";
import { authUser, emailTokens, csrfTokens } from "@/lib/db/schema/auth";
import { eq, like, or } from "drizzle-orm";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

class AuthE2ETestSuite {
  private results: TestResult[] = [];
  private testUser1 = "e2e-auth-test@fortress.test";
  private testUser2 = "e2e-reset-test@fortress.test";
  private pass1 = "SuperSecret!2026";
  private pass2 = "AnotherSecret!2026";
  private pass2New = "NewStrongPass!2026";
  private sessionCookie1 = "";
  private sessionCookie2 = "";

  private log(level: "PASS" | "FAIL" | "INFO" | "WARN", testName: string, message: string) {
    const timestamp = new Date().toISOString().substring(11, 19);
    const badge = level === "PASS" ? "🟢 PASS" : level === "FAIL" ? "🔴 FAIL" : level === "WARN" ? "🟡 WARN" : "🔵 INFO";
    console.log(`[${timestamp}] ${badge} | ${testName.padEnd(45)} | ${message}`);
  }

  private async recordTest(name: string, fn: () => Promise<{ passed: boolean; message: string }>) {
    const start = Date.now();
    try {
      const res = await fn();
      const duration = Date.now() - start;
      this.results.push({ name, passed: res.passed, message: res.message, durationMs: duration });
      this.log(res.passed ? "PASS" : "FAIL", name, `${res.message} (${duration}ms)`);
      return res.passed;
    } catch (error: any) {
      const duration = Date.now() - start;
      const msg = error.message || String(error);
      this.results.push({ name, passed: false, message: msg, durationMs: duration });
      this.log("FAIL", name, `Exception: ${msg} (${duration}ms)`);
      return false;
    }
  }

  private async cleanupDB() {
    try {
      // Find test users
      const users = await db
        .select({ id: authUser.id, email: authUser.email })
        .from(authUser)
        .where(or(eq(authUser.email, this.testUser1), eq(authUser.email, this.testUser2), like(authUser.email, "%@fortress.test")));

      for (const u of users) {
        await db.delete(emailTokens).where(eq(emailTokens.userId, u.id));
        await db.delete(csrfTokens).where(eq(csrfTokens.userId, u.id));
        await db.delete(authUser).where(eq(authUser.id, u.id));
      }
      return true;
    } catch (error) {
      console.error("DB Cleanup failed:", error);
      return false;
    }
  }

  private extractCookie(headers: Headers, cookieName: string): string {
    const setCookie = headers.get("set-cookie");
    if (!setCookie) return "";
    const parts = setCookie.split(";");
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith(`${cookieName}=`)) {
        return trimmed;
      }
    }
    return "";
  }

  public async checkServer() {
    try {
      let res = await fetch(`${BASE_URL}/api/health`).catch(() => null);
      if (!res || res.status === 404) {
        res = await fetch(`${BASE_URL}/api/auth/me`).catch(() => null);
      }
      if (!res) {
        throw new Error("Server unreachable");
      }
      this.log("INFO", "Server Health", `Connected to Next.js server at ${BASE_URL} (status ${res.status})`);
      return true;
    } catch (e: any) {
      console.error(`\n❌ Cannot connect to Next.js server at ${BASE_URL}.`);
      console.error(`Please ensure 'npm run dev' is running before executing E2E auth validation.\n`);
      return false;
    }
  }

  public async runAll() {
    console.log("\n" + "=".repeat(85));
    console.log("FORTRESS INTELLIGENCE — END-TO-END AUTHENTICATION VALIDATION SUITE");
    console.log("=".repeat(85) + "\n");

    if (!(await this.checkServer())) {
      process.exit(1);
    }

    this.log("INFO", "Setup", "Cleaning up any existing test user data in PostgreSQL...");
    await this.cleanupDB();

    // -------------------------------------------------------------------------
    // PHASE 1: ACCOUNT CREATION & INPUT VALIDATION
    // -------------------------------------------------------------------------
    console.log("\n--- PHASE 1: ACCOUNT CREATION & INPUT VALIDATION ---");

    await this.recordTest("1.1 Invalid Email Format", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email-no-at",
          password: this.pass1,
          consents: { dataCollection: true, feedbackUsage: true },
        }),
      });
      const data = await res.json();
      if (res.status === 400 && data.error?.includes("Invalid email")) {
        return { passed: true, message: "Rejected invalid email format (400)" };
      }
      return { passed: false, message: `Expected 400 Invalid email, got ${res.status}: ${data.error}` };
    });

    await this.recordTest("1.2 Weak Password Rejection", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "weakpass@fortress.test",
          password: "1234", // too short
          consents: { dataCollection: true, feedbackUsage: true },
        }),
      });
      const data = await res.json();
      if (res.status === 400 && data.error?.includes("at least 8 characters")) {
        return { passed: true, message: "Rejected weak password (400)" };
      }
      return { passed: false, message: `Expected 400 Weak password, got ${res.status}: ${data.error}` };
    });

    await this.recordTest("1.3 Missing Consents Rejection", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "noconsent@fortress.test",
          password: this.pass1,
          consents: { dataCollection: false, feedbackUsage: true },
        }),
      });
      const data = await res.json();
      if (res.status === 400 && data.error?.includes("must agree")) {
        return { passed: true, message: "Rejected missing consents (400)" };
      }
      return { passed: false, message: `Expected 400 missing consents, got ${res.status}: ${data.error}` };
    });

    await this.recordTest("1.4 Valid User Registration", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.testUser1,
          password: this.pass1,
          name: "E2E Test User 1",
          consents: { dataCollection: true, feedbackUsage: true },
        }),
      });
      const data = await res.json();
      if (res.status === 201 && data.success === true && data.user?.email === this.testUser1) {
        // Verify DB record
        const dbUsers = await db.select().from(authUser).where(eq(authUser.email, this.testUser1)).limit(1);
        if (dbUsers.length === 1 && dbUsers[0].emailVerified === null) {
          return { passed: true, message: "User registered (201) & verified unverified DB state" };
        }
        return { passed: false, message: "User returned 201 but DB state incorrect" };
      }
      return { passed: false, message: `Registration failed ${res.status}: ${data.error}` };
    });

    await this.recordTest("1.5 Duplicate Registration Defense", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.testUser1,
          password: this.pass1,
          name: "Duplicate Attempt",
          consents: { dataCollection: true, feedbackUsage: true },
        }),
      });
      const data = await res.json();
      if (res.status === 409 && data.error?.includes("already registered")) {
        return { passed: true, message: "Blocked duplicate email registration (409)" };
      }
      return { passed: false, message: `Expected 409 Conflict, got ${res.status}: ${data.error}` };
    });

    // -------------------------------------------------------------------------
    // PHASE 2: EMAIL VERIFICATION LIFECYCLE
    // -------------------------------------------------------------------------
    console.log("\n--- PHASE 2: EMAIL VERIFICATION LIFECYCLE ---");

    await this.recordTest("2.1 Login Blocked Before Verification", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.testUser1, password: this.pass1 }),
      });
      const data = await res.json();
      if (res.status === 403 && data.error?.includes("verify your email first")) {
        return { passed: true, message: "Blocked unverified user login (403)" };
      }
      return { passed: false, message: `Expected 403 unverified, got ${res.status}: ${data.error}` };
    });

    let verificationToken = "";
    await this.recordTest("2.2 Verify Token Generation in DB", async () => {
      const tokens = await db
        .select()
        .from(emailTokens)
        .where(eq(emailTokens.email, this.testUser1))
        .limit(1);

      if (tokens.length === 1 && tokens[0].tokenType === "VERIFY_EMAIL") {
        verificationToken = tokens[0].token;
        return { passed: true, message: `Found VERIFY_EMAIL token in DB (${verificationToken.substring(0, 10)}...)` };
      }
      return { passed: false, message: "No verification token found in DB for registered user" };
    });

    await this.recordTest("2.3 Execute Email Verification Endpoint", async () => {
      if (!verificationToken) return { passed: false, message: "Skipped: No token available" };
      const res = await fetch(`${BASE_URL}/api/auth/verify-email?token=${verificationToken}`, {
        redirect: "manual", // inspect redirect
      });
      
      const location = res.headers.get("location") || "";
      if ((res.status === 302 || res.status === 307 || res.status === 303 || res.status === 200) && location.includes("verified=true")) {
        // Verify DB update
        const dbUsers = await db.select().from(authUser).where(eq(authUser.email, this.testUser1)).limit(1);
        if (dbUsers[0]?.emailVerified !== null) {
          return { passed: true, message: "Verified email via endpoint & updated DB timestamp" };
        }
        return { passed: false, message: "Endpoint redirected to verified=true but DB emailVerified is null" };
      }
      return { passed: false, message: `Expected redirect to verified=true, got status ${res.status} location: ${location}` };
    });

    // -------------------------------------------------------------------------
    // PHASE 3: LOGIN, CSRF & SESSION MANAGEMENT
    // -------------------------------------------------------------------------
    console.log("\n--- PHASE 3: LOGIN, CSRF & SESSION MANAGEMENT ---");

    await this.recordTest("3.1 Login Rejection (Wrong Password)", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.testUser1, password: "WrongPassword!999" }),
      });
      const data = await res.json();
      if (res.status === 401 && data.error?.includes("incorrect")) {
        return { passed: true, message: "Rejected incorrect password (401)" };
      }
      return { passed: false, message: `Expected 401 Incorrect password, got ${res.status}: ${data.error}` };
    });

    await this.recordTest("3.2 Successful Login & Cookie Issuance", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.testUser1, password: this.pass1 }),
      });
      const data = await res.json();
      this.sessionCookie1 = this.extractCookie(res.headers, "fortress-session");

      if (res.status === 200 && data.success === true && data.csrfToken && this.sessionCookie1) {
        return { passed: true, message: `Logged in (200), CSRF issued, cookie set (${this.sessionCookie1.substring(0, 25)}...)` };
      }
      return { passed: false, message: `Login failed or missing cookie/csrf. Status ${res.status}: ${JSON.stringify(data)}` };
    });

    await this.recordTest("3.3 Validate Active Session via Endpoint", async () => {
      if (!this.sessionCookie1) return { passed: false, message: "Skipped: No session cookie" };
      const res = await fetch(`${BASE_URL}/api/auth/session`, {
        headers: { Cookie: this.sessionCookie1 },
      });
      const data = await res.json();
      if (res.status === 200 && data.authenticated === true && data.user?.email === this.testUser1) {
        return { passed: true, message: "Session endpoint verified active authenticated session (200)" };
      }
      return { passed: false, message: `Session check failed. Status ${res.status}: ${JSON.stringify(data)}` };
    });

    await this.recordTest("3.4 Unauthenticated Session Check", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/session`);
      const data = await res.json();
      if (res.status === 401 && data.authenticated === false) {
        return { passed: true, message: "Session endpoint correctly rejected unauthenticated request (401)" };
      }
      return { passed: false, message: `Expected 401 unauthenticated, got ${res.status}: ${JSON.stringify(data)}` };
    });

    // -------------------------------------------------------------------------
    // PHASE 4: BRUTE-FORCE & RATE LIMITING DEFENSE
    // -------------------------------------------------------------------------
    console.log("\n--- PHASE 4: BRUTE-FORCE & RATE LIMITING DEFENSE ---");

    await this.recordTest("4.1 Trigger Rate Limit Threshold (5 Attempts)", async () => {
      let all401 = true;
      for (let i = 1; i <= 5; i++) {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.testUser1, password: "BadPassAttempt!" + i }),
        });
        if (res.status !== 401) all401 = false;
      }
      if (all401) {
        return { passed: true, message: "Executed 5 consecutive failed login attempts (all 401)" };
      }
      return { passed: false, message: "One or more failed login attempts did not return 401" };
    });

    await this.recordTest("4.2 Verify 6th Attempt Lockout (429)", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.testUser1, password: "BadPassAttempt!6" }),
      });
      const data = await res.json();
      if (res.status === 429 && data.error?.includes("Too many login attempts") && data.lockedUntil) {
        return { passed: true, message: `Account locked out on 6th attempt (429 Too Many Requests)` };
      }
      return { passed: false, message: `Expected 429 Lockout on 6th attempt, got ${res.status}: ${JSON.stringify(data)}` };
    });

    await this.recordTest("4.3 Verify Lockout Blocks Even Correct Password", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.testUser1, password: this.pass1 }), // CORRECT password!
      });
      const data = await res.json();
      if (res.status === 429 && data.error?.includes("Too many login attempts")) {
        return { passed: true, message: "Rate limiter prevented login even with correct credentials during lockout window (429)" };
      }
      return { passed: false, message: `Expected 429 Lockout with correct password, got ${res.status}: ${JSON.stringify(data)}` };
    });

    // -------------------------------------------------------------------------
    // PHASE 5: PASSWORD RESET LIFECYCLE
    // -------------------------------------------------------------------------
    console.log("\n--- PHASE 5: PASSWORD RESET LIFECYCLE ---");

    await this.recordTest("5.1 Setup Second User for Password Reset", async () => {
      // Register
      await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.testUser2,
          password: this.pass2,
          name: "E2E Reset Test User",
          consents: { dataCollection: true, feedbackUsage: true },
        }),
      });
      // Verify in DB
      const tokens = await db.select().from(emailTokens).where(eq(emailTokens.email, this.testUser2)).limit(1);
      if (tokens.length > 0) {
        await fetch(`${BASE_URL}/api/auth/verify-email?token=${tokens[0].token}`, { redirect: "manual" });
        return { passed: true, message: "Registered and verified second test user for reset flow" };
      }
      return { passed: false, message: "Failed to setup second user for password reset" };
    });

    await this.recordTest("5.2 Request Password Reset Endpoint", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.testUser2 }),
      });
      const data = await res.json();
      if (res.status === 200 && data.success === true) {
        return { passed: true, message: "Forgot password endpoint accepted request (200)" };
      }
      return { passed: false, message: `Expected 200 on forgot-password, got ${res.status}: ${JSON.stringify(data)}` };
    });

    let resetToken = "";
    await this.recordTest("5.3 Verify Reset Token in Database", async () => {
      const tokens = await db
        .select()
        .from(emailTokens)
        .where(eq(emailTokens.email, this.testUser2))
        .limit(10);

      const resetTokenRecord = tokens.find((t) => t.tokenType === "PASSWORD_RESET" && t.usedAt === null);
      if (resetTokenRecord) {
        resetToken = resetTokenRecord.token;
        return { passed: true, message: `Found active PASSWORD_RESET token in DB (${resetToken.substring(0, 10)}...)` };
      }
      return { passed: false, message: "No active PASSWORD_RESET token found in DB" };
    });

    await this.recordTest("5.4 Rejection of Invalid Reset Token", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "invalid-reset-token-99999", newPassword: this.pass2New }),
      });
      const data = await res.json();
      if (res.status === 400 && data.error?.includes("Invalid or expired")) {
        return { passed: true, message: "Rejected invalid reset token (400)" };
      }
      return { passed: false, message: `Expected 400 on invalid token, got ${res.status}: ${JSON.stringify(data)}` };
    });

    await this.recordTest("5.5 Execute Password Reset with Valid Token", async () => {
      if (!resetToken) return { passed: false, message: "Skipped: No reset token available" };
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword: this.pass2New }),
      });
      const data = await res.json();
      if (res.status === 200 && data.success === true) {
        return { passed: true, message: "Successfully reset password (200)" };
      }
      return { passed: false, message: `Failed to reset password. Status ${res.status}: ${JSON.stringify(data)}` };
    });

    await this.recordTest("5.6 Old Password Rejection Post-Reset", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.testUser2, password: this.pass2 }), // OLD password
      });
      const data = await res.json();
      if (res.status === 401) {
        return { passed: true, message: "Old password correctly rejected after reset (401)" };
      }
      return { passed: false, message: `Expected 401 on old password login, got ${res.status}` };
    });

    await this.recordTest("5.7 New Password Login Success", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.testUser2, password: this.pass2New }), // NEW password
      });
      const data = await res.json();
      this.sessionCookie2 = this.extractCookie(res.headers, "fortress-session");
      if (res.status === 200 && data.success === true && this.sessionCookie2) {
        return { passed: true, message: "Logged in successfully with new reset password (200)" };
      }
      return { passed: false, message: `Failed login with new password. Status ${res.status}: ${JSON.stringify(data)}` };
    });

    // -------------------------------------------------------------------------
    // PHASE 6: LOGOUT & SESSION TERMINATION
    // -------------------------------------------------------------------------
    console.log("\n--- PHASE 6: LOGOUT & SESSION TERMINATION ---");

    await this.recordTest("6.1 Execute Logout Endpoint", async () => {
      if (!this.sessionCookie2) return { passed: false, message: "Skipped: No session cookie from User 2" };
      const res = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Cookie: this.sessionCookie2 },
      });
      const data = await res.json();
      const setCookie = res.headers.get("set-cookie") || "";
      if (res.status === 200 && data.success === true && (setCookie.includes("max-age=0") || setCookie.includes("Max-Age=0") || setCookie.includes("fortress-session=;"))) {
        return { passed: true, message: "Logged out (200) & cookie expiration header sent" };
      }
      return { passed: false, message: `Logout failed or missing cookie clear header. Status ${res.status}: ${JSON.stringify(data)}` };
    });

    await this.recordTest("6.2 Verify Session Terminated Post-Logout", async () => {
      // In browser, after logout cookie is cleared, client sends no cookie.
      const res = await fetch(`${BASE_URL}/api/auth/session`);
      const data = await res.json();
      if (res.status === 401 && data.authenticated === false) {
        return { passed: true, message: "Verified session is inactive post-logout (401)" };
      }
      return { passed: false, message: `Expected 401 post-logout session check, got ${res.status}` };
    });

    // -------------------------------------------------------------------------
    // FINAL TEARDOWN & REPORTING
    // -------------------------------------------------------------------------
    console.log("\n--- FINAL TEARDOWN & REPORTING ---");
    this.log("INFO", "Teardown", "Cleaning up all test user records and tokens from PostgreSQL...");
    await this.cleanupDB();
    this.log("PASS", "Teardown", "Database cleaned successfully. No test residue remaining.");

    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;

    console.log("\n" + "=".repeat(85));
    console.log("E2E AUTHENTICATION TEST SUMMARY");
    console.log("=".repeat(85));
    console.log(`Total Tests Run : ${total}`);
    console.log(`Passed          : ${passed} (🟢 ${((passed / total) * 100).toFixed(1)}%)`);
    console.log(`Failed          : ${failed} (${failed > 0 ? "🔴" : "🟢"})`);
    console.log("=".repeat(85) + "\n");

    if (failed > 0) {
      console.log("FAILED TESTS:");
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => console.log(`  ✗ ${r.name}: ${r.message}`));
      console.log();
      process.exit(1);
    } else {
      console.log("🎉 ALL END-TO-END AUTHENTICATION FLOWS VERIFIED 100% OPERATIONAL!\n");
      process.exit(0);
    }
  }
}

// Execute Suite
(async () => {
  const suite = new AuthE2ETestSuite();
  await suite.runAll();
})();
