import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/analytics/live-activity/route";

// Mock @/auth
vi.mock("@/auth", () => ({
  auth: vi.fn(() => Promise.resolve({ user: { isAdmin: true } }))
}));

// Simple mock for Drizzle
vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockImplementation((n) => {
        if (n === 5) return Promise.resolve([{ pagePath: "/home", count: 5 }]);
        return Promise.resolve([{ count: 10 }]);
    })
  },
  schema: {
    pageViews: {
      timestamp: { name: 'timestamp' },
      pagePath: { name: 'pagePath' }
    }
  }
}));

describe("GET /api/analytics/live-activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return live activity data structure", async () => {
    const res = await (GET as any)(); // Mocking route doesn't need request
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("liveUsers");
    expect(data).toHaveProperty("trendingPages");
    expect(data).toHaveProperty("timestamp");
  });

  it("should return 200 even without cache", async () => {
    const res = await (GET as any)();
    expect(res.status).toBe(200);
  });
});
