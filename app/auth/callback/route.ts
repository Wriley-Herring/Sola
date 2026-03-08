import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/observability/log";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { createAppUserProfileIfMissing } from "@/lib/auth/get-current-user";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/today";

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Missing auth code.")}`, requestUrl.origin));
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const supabase = createRouteHandlerSupabaseClient(request, response);

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    logEvent("auth_failure", {
      reason: "exchange_code_failed",
      code: exchangeError.code,
      status: exchangeError.status,
      message: exchangeError.message
    });

    throw new Error(
      `Failed to exchange auth code for session${exchangeError.code ? ` (${exchangeError.code})` : ""}: ${exchangeError.message}`
    );
  }

  const {
    data: { user },
    error: getUserError
  } = await supabase.auth.getUser();

  if (getUserError) {
    logEvent("auth_failure", {
      reason: "callback_get_user_failed",
      code: getUserError.code,
      status: getUserError.status,
      message: getUserError.message
    });

    throw new Error(`Failed to load authenticated user${getUserError.code ? ` (${getUserError.code})` : ""}: ${getUserError.message}`);
  }

  if (user) {
    await createAppUserProfileIfMissing(user, supabase);
  }

  return response;
}
