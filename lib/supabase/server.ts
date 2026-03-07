import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "@/lib/env";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookies can only be set in Route Handlers/Server Actions.
        }
      }
    }
  });
}
