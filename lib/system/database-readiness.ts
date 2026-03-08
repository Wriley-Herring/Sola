import { createServerComponentSupabaseClient } from "@/lib/supabase/server";

export type DatabaseReadiness = {
  isReady: boolean;
  reason?: string;
};

export async function getDatabaseReadiness(): Promise<DatabaseReadiness> {
  const supabase = createServerComponentSupabaseClient();

  const postgrestUrl = `${supabase.supabaseUrl}/rest/v1/`;
  const response = await fetch(postgrestUrl, {
    method: "GET",
    headers: {
      apikey: supabase.supabaseKey,
      Accept: "application/openapi+json"
    },
    cache: "no-store"
  });

  if (response.ok) {
    return { isReady: true };
  }

  return {
    isReady: false,
    reason: `PostgREST health check failed with status ${response.status}.`
  };
}
