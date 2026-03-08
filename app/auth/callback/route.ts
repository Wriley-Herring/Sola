import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateAppUserProfile } from "@/lib/auth/get-current-user";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/today";

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Missing auth code.")}`, requestUrl.origin));
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const supabase = createRouteHandlerSupabaseClient(request, response);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw error;
  }

  const {
    data: { user },
    error: getUserError
  } = await supabase.auth.getUser();

  if (getUserError) {
    throw getUserError;
  }

  if (user) {
    // TODO(auth): Move profile bootstrap to a post-login domain service once callback side effects are redesigned.
    await getOrCreateAppUserProfile(user);
  }

  return response;
}
