import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "test" || process.env.E2E_AUTH_BYPASS !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as { userId?: string };
  const userId = typeof body.userId === "string" && body.userId.trim() ? body.userId.trim() : "e2e-user";

  const response = NextResponse.json({ ok: true, userId });
  response.cookies.set("sola-e2e-user", userId, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}
