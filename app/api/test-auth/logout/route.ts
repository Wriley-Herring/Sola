import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.NODE_ENV !== "test" || process.env.E2E_AUTH_BYPASS !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("sola-e2e-user", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
