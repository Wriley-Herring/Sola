import { createClient } from "@supabase/supabase-js";
import { getServiceRoleSupabaseEnv } from "@/lib/env";

export function createServiceRoleSupabaseClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getServiceRoleSupabaseEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
