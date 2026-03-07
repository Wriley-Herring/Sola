"use client";

import { DATABASE_NOT_READY_PREFIX } from "@/lib/system/ensure-database-ready";

const DEFAULT_MESSAGE = "Please try again. If this persists, refresh the page.";
const DATABASE_MESSAGE =
  "Database setup is incomplete. Apply supabase/schema.sql, then supabase/seed.sql to the Supabase project configured in NEXT_PUBLIC_SUPABASE_URL.";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const isDatabaseError = error.message.startsWith(DATABASE_NOT_READY_PREFIX);

  return (
    <div className="rounded-xl2 border border-red-200 bg-red-50 p-6">
      <h2 className="font-serif text-2xl">{isDatabaseError ? "Database initialization required" : "Something went wrong"}</h2>
      <p className="mt-2 text-sm text-charcoal/70">{isDatabaseError ? DATABASE_MESSAGE : DEFAULT_MESSAGE}</p>
      {isDatabaseError ? <p className="mt-2 text-xs text-charcoal/70">Details: {error.message}</p> : null}
      <button className="mt-4 rounded-full bg-charcoal px-4 py-2 text-sm text-white" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
