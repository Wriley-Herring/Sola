import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "@/lib/env";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

function createBaseServerSupabaseClient(setAll: (cookieStore: ReturnType<typeof cookies>, cookiesToSet: CookieToSet[]) => void) {
  const cookieStore = cookies();
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        setAll(cookieStore, cookiesToSet);
      }
    }
  });
}

export function createServerComponentSupabaseClient() {
  return createBaseServerSupabaseClient(() => {
    throw new Error(
      "createServerComponentSupabaseClient is read-only for cookies. Use createServerActionSupabaseClient in Route Handlers or Server Actions."
    );
  });
}

export function createServerActionSupabaseClient() {
  return createBaseServerSupabaseClient((cookieStore, cookiesToSet) => {
    cookiesToSet.forEach(({ name, value, options }) => {
      cookieStore.set(name, value, options);
    });
  });
}

// Temporary compatibility alias for non-auth call sites that have not been migrated yet.
export const createServerSupabaseClient = createServerComponentSupabaseClient;
