"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateAppUserProfile } from "@/lib/auth/get-current-user";

function getOrigin() {
  const configuredSiteUrl =
    process.env.SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredSiteUrl) {
    const normalizedSiteUrl = configuredSiteUrl.startsWith("http")
      ? configuredSiteUrl
      : `https://${configuredSiteUrl}`;

    try {
      return new URL(normalizedSiteUrl).origin;
    } catch {
      // Fall back to forwarded headers when configured URL is malformed.
    }
  }

  const headerStore = headers();
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");

  if (!host) {
    return "http://localhost:3000";
  }

  const protocol = forwardedProto ?? "http";
  return `${protocol}://${host}`;
}

export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = String(formData.get("next") ?? "/today");

  if (!email) {
    redirect(`/login?error=${encodeURIComponent("Please enter your email.")}`);
  }

  const supabase = createServerSupabaseClient();
  const origin = getOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

export async function signInWithGoogleAction() {
  const supabase = createServerSupabaseClient();
  const origin = getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/today`
    }
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Google sign-in failed.")}`);
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function ensureProfileAfterAuth() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await getOrCreateAppUserProfile(user);
  }
}
