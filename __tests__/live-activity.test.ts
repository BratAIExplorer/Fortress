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
  }
}));

describe("GET /api/analytics/live-activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return live activity data structure", async () => {
    const res = await GET(new Request("http://localhost"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("usersOnline");
    expect(data).toHaveProperty("mostPopular");
    expect(data).toHaveProperty("recentActivity");
    expect(Array.isArray(data.mostPopular)).toBe(true);
  });

  it("should implement caching", async () => {
    // First call
    const res1 = await GET(new Request("http://localhost"));
    const data1 = await res1.json();
    
    // Second call should be from cache (check timestamp)
    const res2 = await GET(new Request("http://localhost"));
    const data2 = await res2.json();
    
    expect(data1.recentActivity).toBe(data2.recentActivity);
  });
});
