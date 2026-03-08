import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logEvent } from "@/lib/observability/log";
import { createServerComponentSupabaseClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/lib/supabase/errors";

export type AppUserProfile = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

const USER_PROFILE_SELECT_FIELDS = "id, email, full_name, created_at";

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

  const supabase = createServerComponentSupabaseClient();

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      logEvent("auth_success", { userId: user.id });
    } else {
      logEvent("auth_failure", { reason: "no_session" });
    }

    return user;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("read-only for cookies")) {
      logEvent("auth_failure", { reason: "read_only_cookie_write" });
      return null;
    }

    throw error;
  }
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

export async function getAppUserProfile(userId: string): Promise<AppUserProfile | null> {
  const supabase = createServerComponentSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select(USER_PROFILE_SELECT_FIELDS)
    .eq("id", userId)
    .maybeSingle();

  throwIfSupabaseError(error);

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    name: data.full_name ?? "Sola User",
    createdAt: data.created_at
  } satisfies AppUserProfile;
}

export async function createAppUserProfileIfMissing(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
  const existingProfile = await getAppUserProfile(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  const supabase = createServerComponentSupabaseClient();
  const email = user.email ?? "";
  const fullNameFromMeta = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const nameFromMeta = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;
  const fallbackName = email.split("@")[0] || "Sola User";
  const name = fullNameFromMeta ?? nameFromMeta ?? fallbackName;

  const { data, error } = await supabase
    .from("users")
    .insert({
      id: user.id,
      email,
      full_name: name
    })
    .select(USER_PROFILE_SELECT_FIELDS)
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
  const profile = await getAppUserProfile(user.id);

  if (!profile) {
    throw new Error("Authenticated user is missing a profile row in public.users.");
  }

  return { user, profile };
}
