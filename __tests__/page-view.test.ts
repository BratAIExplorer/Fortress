import { NextRequest } from "next/server";
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
  },
  schema: {
    pageViews: {
      id: { name: 'id' }
    }
  }
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Map([["x-forwarded-for", "1.2.3.4"], ["user-agent", "vitest"]])))
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

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.id).toBe(123);
    expect(db.insert).toHaveBeenCalled();
  });

  it("should respect rate limits", async () => {
    const ip = "5.6.7.8";
    const promises = [];
    
    for (let i = 0; i < 40; i++) {
      const req = new Request("http://localhost/api/analytics/page-view", {
        method: "POST",
        body: JSON.stringify({ pagePath: "/home" }),
        headers: { "x-forwarded-for": ip }
      });
      promises.push(POST(req as NextRequest));
    }

    const results = await Promise.all(promises);
    const statuses = results.map(r => r.status);
    
    expect(statuses.filter(s => s === 429).length).toBeGreaterThan(0);
  });
});
