import { describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const updateSession = vi.fn();
vi.mock("@/lib/supabase/middleware", () => ({ updateSession }));

describe("middleware", () => {
  it("redirects unauthenticated users from protected routes", async () => {
    updateSession.mockResolvedValue({
      supabase: { auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } },
      response: NextResponse.next()
    });

    const { middleware } = await import("@/middleware");
    const request = new NextRequest("http://localhost:3000/today");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?next=%2Ftoday");
  });

  it("allows authenticated users to protected routes", async () => {
    const passthrough = NextResponse.next();
    updateSession.mockResolvedValue({
      supabase: { auth: { getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })) } },
      response: passthrough
    });

    const { middleware } = await import("@/middleware");
    const request = new NextRequest("http://localhost:3000/today");
    const response = await middleware(request);

    expect(response).toBe(passthrough);
  });

  it("redirects authenticated users away from /login", async () => {
    updateSession.mockResolvedValue({
      supabase: { auth: { getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })) } },
      response: NextResponse.next()
    });

    const { middleware } = await import("@/middleware");
    const request = new NextRequest("http://localhost:3000/login");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/today");
  });

  it("allows public route when middleware matcher includes login only", async () => {
    updateSession.mockResolvedValue({
      supabase: { auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } },
      response: NextResponse.next()
    });

    const { middleware } = await import("@/middleware");
    const request = new NextRequest("http://localhost:3000/login");
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });
});
