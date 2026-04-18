import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../app/api/analytics/page-view/route";
import { db } from "@/lib/db/client";

vi.mock("@/lib/db/client", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [{ id: 123 }])
      }))
    }))
  }
}));

describe("POST /api/analytics/page-view", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should insert a page view and return success", async () => {
    const req = new Request("http://localhost/api/analytics/page-view", {
      method: "POST",
      body: JSON.stringify({ pagePath: "/home" }),
      headers: { "x-forwarded-for": "1.2.3.4" }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.id).toBe(123);
    expect(db.insert).toHaveBeenCalled();
  });

  it("should respect rate limits", async () => {
    const ip = "5.6.7.8";
    const promises = [];
    // Resetting for this IP is not possible easily unless we expose the map,
    // but the map is in the module scope.
    // In a clean test environment, it should be fine.
    
    for (let i = 0; i < 110; i++) {
      const req = new Request("http://localhost/api/analytics/page-view", {
        method: "POST",
        body: JSON.stringify({ pagePath: "/home" }),
        headers: { "x-forwarded-for": ip }
      });
      promises.push(POST(req));
    }

    const results = await Promise.all(promises);
    const statuses = results.map(r => r.status);
    
    expect(statuses.filter(s => s === 429).length).toBeGreaterThan(0);
  });
});
