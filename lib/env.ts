function requireEnvVar(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requireUrlEnvVar(name: string, value: string | undefined) {
  const requiredValue = requireEnvVar(name, value);

  try {
    return new URL(requiredValue).toString();
  } catch {
    throw new Error(`Invalid URL in environment variable: ${name}`);
  }
}

export function getPublicSupabaseEnv() {
  return {
    supabaseUrl: requireUrlEnvVar("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: requireEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  };
}

export function getServiceRoleSupabaseEnv() {
  return {
    supabaseUrl: requireUrlEnvVar("SUPABASE_URL", process.env.SUPABASE_URL),
    supabaseServiceRoleKey: requireEnvVar("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY)
  };
}

export function getSiteUrlEnv() {
  return {
    siteUrl: requireUrlEnvVar("SITE_URL", process.env.SITE_URL)
  };
}

export function getBootstrapDatabaseUrl(env: NodeJS.ProcessEnv = process.env) {
  const candidates = ["POSTGRES_URL_NON_POOLING", "POSTGRES_URL", "POSTGRES_PRISMA_URL"] as const;

  for (const name of candidates) {
    const value = env[name];
    if (value) {
      return { name, value, checked: [...candidates] };
    }
  }

  throw new Error(
    `Missing database connection URL. Checked ${candidates.join(", ")}. The Vercel Supabase Marketplace integration should provide these automatically.`
  );
}
