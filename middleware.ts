import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { shouldRedirectToLogin, shouldRedirectToToday } from "@/lib/middleware/route-guards";

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (shouldRedirectToLogin(pathname, Boolean(user))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (shouldRedirectToToday(pathname, Boolean(user))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/today";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/login", "/today/:path*", "/plans/:path*", "/progress/:path*", "/profile/:path*"]
};
