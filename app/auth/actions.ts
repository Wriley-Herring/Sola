"use server";

import { redirect } from "next/navigation";
import { getOrCreateAppUserProfile } from "@/lib/auth/get-current-user";
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
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
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

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Google sign-in failed.")}`);
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = createServerActionSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function ensureProfileAfterAuth() {
  const supabase = createServerActionSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await getOrCreateAppUserProfile(user);
  }
}
