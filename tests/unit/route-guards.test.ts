import { describe, expect, it } from "vitest";
import { isProtectedPath, shouldRedirectToLogin, shouldRedirectToToday } from "@/lib/middleware/route-guards";

describe("route guards", () => {
  it("classifies protected paths", () => {
    expect(isProtectedPath("/today")).toBe(true);
    expect(isProtectedPath("/today/extra")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
  });

  it("redirects anonymous users away from protected pages", () => {
    expect(shouldRedirectToLogin("/today", false)).toBe(true);
    expect(shouldRedirectToLogin("/today", true)).toBe(false);
  });

  it("redirects authenticated users away from login", () => {
    expect(shouldRedirectToToday("/login", true)).toBe(true);
    expect(shouldRedirectToToday("/login", false)).toBe(false);
  });
});
