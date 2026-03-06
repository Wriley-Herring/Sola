import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AppUserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  onboarding_completed: boolean;
  created_at: string;
};

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

function getE2EBypassUser(): AuthUser | null {
  if (process.env.NODE_ENV !== "test" || process.env.E2E_AUTH_BYPASS !== "true") {
    return null;
  }

  const cookieValue = cookies().get("sola-e2e-user")?.value;
  if (!cookieValue) return null;

  return {
    id: cookieValue,
    email: `${cookieValue}@e2e.local`,
    user_metadata: { full_name: "E2E User" }
  };
}

export async function getCurrentAuthUser() {
  const bypassUser = getE2EBypassUser();
  if (bypassUser) return bypassUser;

  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAuthUser() {
  const user = await getCurrentAuthUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getOrCreateAppUserProfile(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
  const supabase = createServerSupabaseClient();

  const email = user.email ?? "";
  const fullNameFromMeta = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        email,
        full_name: fullNameFromMeta
      },
      { onConflict: "id" }
    )
    .select("id, email, full_name, onboarding_completed, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as AppUserProfile;
}

export async function requireAppUserProfile() {
  const user = await requireAuthUser();
  const profile = await getOrCreateAppUserProfile(user);

  return { user, profile };
}
