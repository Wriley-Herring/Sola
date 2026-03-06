import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const createServerClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient
}));

describe("updateSession", () => {
  it("applies cookies from Supabase setAll callback", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk";

    createServerClient.mockImplementation((_url, _key, options) => {
      options.cookies.setAll([{ name: "sb", value: "token", options: { path: "/" } }]);
      return {
        auth: {
          getUser: vi.fn(async () => ({ data: { user: null } }))
        }
      };
    });

    const { updateSession } = await import("@/lib/supabase/middleware");
    const request = new NextRequest("http://localhost:3000/today");
    const { response } = await updateSession(request);

    expect(response.cookies.get("sb")?.value).toBe("token");
  });
});
