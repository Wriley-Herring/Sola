export type LogEvent =
  | "auth_success"
  | "auth_failure"
  | "cache_hit"
  | "cache_miss"
  | "insight_generated"
  | "generation_error"
  | "plan_selected"
  | "progress_completed"
  | "schema_missing";

export function logEvent(event: LogEvent, details: Record<string, unknown> = {}) {
  const payload = { event, ...details };

  if (event === "auth_failure" || event === "generation_error" || event === "schema_missing") {
    console.error(payload);
    return;
  }

  console.info(payload);
}
