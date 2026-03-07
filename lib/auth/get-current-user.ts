import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logEvent } from "@/lib/observability/log";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/lib/supabase/errors";

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

  if (user) {
    logEvent("auth_success", { userId: user.id });
  } else {
    logEvent("auth_failure", { reason: "no_session" });
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentAuthUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

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

  const selectFields = "id, email, full_name, created_at";

  const { data: existingById, error: existingByIdError } = await supabase
    .from("users")
    .select(selectFields)
    .eq("id", user.id)
    .maybeSingle();

  throwIfSupabaseError(existingByIdError);

  if (existingById) {
    return {
      id: existingById.id,
      email: existingById.email,
      name: existingById.full_name ?? name,
      createdAt: existingById.created_at
    } satisfies AppUserProfile;
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      id: user.id,
      email,
      full_name: name
    })
    .select(selectFields)
    .single();

  throwIfSupabaseError(error);
  if (!data) {
    throw new Error("Failed to create user profile.");
  }

  return {
    id: data.id,
    email: data.email,
    name: data.full_name ?? name,
    createdAt: data.created_at
  } satisfies AppUserProfile;
}

export async function requireAppUserProfile() {
  const user = await requireAuthUser();
  const profile = await getOrCreateAppUserProfile(user);

  return { user, profile };
}
