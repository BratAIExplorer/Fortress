interface RateLimitRecord {
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// ponytail: in-memory rate limiter; upgrade to Redis if throughput demands
const loginAttempts = new Map<string, RateLimitRecord>();
const resetAttempts = new Map<string, RateLimitRecord>();
const apiRequests = new Map<string, number[]>();

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minute lockout
const RESET_MAX_ATTEMPTS = 3;
const RESET_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RESET_LOCKOUT_MS = 60 * 60 * 1000; // 1 hour lockout
const API_WINDOW_MS = 1000; // 1 second window
const API_MAX_REQUESTS = 10; // 10 requests per second

export function checkLoginRateLimit(email: string): {
  allowed: boolean;
  lockedUntil?: number;
  attemptsRemaining?: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(email);

  // Check if currently locked
  if (record?.lockedUntil && now < record.lockedUntil) {
    return {
      allowed: false,
      lockedUntil: record.lockedUntil,
    };
  }

  // Clean up expired records
  if (record && now - record.lastAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(email);
    return { allowed: true, attemptsRemaining: LOGIN_MAX_ATTEMPTS };
  }

  // Check if exceeded max attempts
  if (record && record.attempts >= LOGIN_MAX_ATTEMPTS) {
    return {
      allowed: false,
      lockedUntil: record.lastAttempt + LOGIN_LOCKOUT_MS,
    };
  }

  return {
    allowed: true,
    attemptsRemaining: LOGIN_MAX_ATTEMPTS - (record?.attempts || 0),
  };
}

export function recordLoginFailure(email: string): void {
  const now = Date.now();
  const record = loginAttempts.get(email);

  if (record && now - record.lastAttempt < LOGIN_WINDOW_MS) {
    record.attempts += 1;
    record.lastAttempt = now;

    if (record.attempts >= LOGIN_MAX_ATTEMPTS) {
      record.lockedUntil = now + LOGIN_LOCKOUT_MS;
    }
  } else {
    loginAttempts.set(email, {
      attempts: 1,
      lastAttempt: now,
    });
  }
}

export function recordLoginSuccess(email: string): void {
  loginAttempts.delete(email);
}

export function checkAPIRateLimit(clientId: string): { allowed: boolean } {
  const now = Date.now();
  const requests = apiRequests.get(clientId) || [];

  // Remove requests outside current window
  const recentRequests = requests.filter((t) => now - t < API_WINDOW_MS);

  if (recentRequests.length >= API_MAX_REQUESTS) {
    return { allowed: false };
  }

  // Record this request
  recentRequests.push(now);
  apiRequests.set(clientId, recentRequests);

  return { allowed: true };
}

export function getClientId(req: Request): string {
  // Use IP from x-forwarded-for (proxy) or socket address
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  // Fallback: use host or generic identifier
  return req.headers.get("host") || "unknown";
}

export function checkResetRateLimit(email: string): { allowed: boolean } {
  const now = Date.now();
  const record = resetAttempts.get(email);

  // Check if currently locked
  if (record?.lockedUntil && now < record.lockedUntil) {
    return { allowed: false };
  }

  // Clean up expired records
  if (record && now - record.lastAttempt > RESET_WINDOW_MS) {
    resetAttempts.delete(email);
    return { allowed: true };
  }

  // Check if exceeded max attempts
  if (record && record.attempts >= RESET_MAX_ATTEMPTS) {
    return { allowed: false };
  }

  return { allowed: true };
}

export function recordResetAttempt(email: string): void {
  const now = Date.now();
  const record = resetAttempts.get(email);

  if (record && now - record.lastAttempt < RESET_WINDOW_MS) {
    record.attempts += 1;
    record.lastAttempt = now;

    if (record.attempts >= RESET_MAX_ATTEMPTS) {
      record.lockedUntil = now + RESET_LOCKOUT_MS;
    }
  } else {
    resetAttempts.set(email, {
      attempts: 1,
      lastAttempt: now,
    });
  }
}

// Cleanup expired records periodically
setInterval(() => {
  const now = Date.now();

  // Clean up login attempts
  for (const [email, record] of loginAttempts.entries()) {
    if (now - record.lastAttempt > LOGIN_WINDOW_MS) {
      loginAttempts.delete(email);
    }
  }

  // Clean up reset attempts
  for (const [email, record] of resetAttempts.entries()) {
    if (now - record.lastAttempt > RESET_WINDOW_MS) {
      resetAttempts.delete(email);
    }
  }

  // Clean up API requests (already filtered by time window)
  for (const [clientId, requests] of apiRequests.entries()) {
    const recentRequests = requests.filter((t) => now - t < API_WINDOW_MS);
    if (recentRequests.length === 0) {
      apiRequests.delete(clientId);
    } else {
      apiRequests.set(clientId, recentRequests);
    }
  }
}, 60 * 1000); // Run every minute
