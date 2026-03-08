"use server";

import { redirect } from "next/navigation";
import { logEvent } from "@/lib/observability/log";
import { getCanonicalSiteOriginEnv } from "@/lib/env";
import { createServerActionSupabaseClient } from "@/lib/supabase/server";

function getOrigin() {
  return getCanonicalSiteOriginEnv().origin;
}

export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = String(formData.get("next") ?? "/today");

  if (!email) {
    redirect(`/login?error=${encodeURIComponent("Please enter your email.")}`);
  }

  const supabase = createServerActionSupabaseClient();
  const origin = getOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error) {
    logEvent("auth_failure", {
      reason: "magic_link_send_failed",
      code: error.code,
      status: error.status,
      message: error.message
    });

    redirect(`/login?error=${encodeURIComponent("We couldn't send a sign-in link. Please try again.")}`);
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

export async function signInWithGoogleAction() {
  const supabase = createServerActionSupabaseClient();
  const origin = getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/today`
    }
  });

  if (error) {
    logEvent("auth_failure", {
      reason: "google_oauth_start_failed",
      code: error.code,
      status: error.status,
      message: error.message
    });

    redirect(`/login?error=${encodeURIComponent("Google sign-in is currently unavailable. Please try again.")}`);
  }

  if (!data.url) {
    logEvent("auth_failure", { reason: "google_oauth_missing_redirect_url" });
    redirect(`/login?error=${encodeURIComponent("Google sign-in is currently unavailable. Please try again.")}`);
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = createServerActionSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    logEvent("auth_failure", {
      reason: "sign_out_failed",
      code: error.code,
      status: error.status,
      message: error.message
    });

    throw new Error(`Failed to sign out${error.code ? ` (${error.code})` : ""}: ${error.message}`);
  }

  redirect("/");
}
