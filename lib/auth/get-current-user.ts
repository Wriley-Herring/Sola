import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AppUserProfile = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
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
  const nameFromMeta = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;
  const fallbackName = email.split("@")[0] || "Sola User";
  const name = fullNameFromMeta ?? nameFromMeta ?? fallbackName;
  const nowIso = new Date().toISOString();

  const selectFields = "id, email, name, createdAt";

  const { data: existingById, error: existingByIdError } = await supabase
    .from("User")
    .select(selectFields)
    .eq("id", user.id)
    .maybeSingle();

  if (existingByIdError) {
    throw existingByIdError;
  }

  if (existingById) {
    return existingById as AppUserProfile;
  }

  const { data: existingByEmail, error: existingByEmailError } = await supabase
    .from("User")
    .select(selectFields)
    .eq("email", email)
    .maybeSingle();

  if (existingByEmailError) {
    throw existingByEmailError;
  }

  if (existingByEmail) {
    return existingByEmail as AppUserProfile;
  }

  const { data, error } = await supabase
    .from("User")
    .insert(
      {
        id: user.id,
        email,
        name,
        updatedAt: nowIso
      }
    )
    .select(selectFields)
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
