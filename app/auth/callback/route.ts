import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateAppUserProfile } from "@/lib/auth/get-current-user";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/today";

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Missing auth code.")}`, requestUrl.origin));
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await getOrCreateAppUserProfile(user);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
