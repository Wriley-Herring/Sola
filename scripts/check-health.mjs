const healthUrl = process.env.HEALTHCHECK_URL;

if (!healthUrl) {
  console.log("[healthcheck] HEALTHCHECK_URL not set; skipping remote health check.");
  process.exit(0);
}

const response = await fetch(healthUrl);
if (!response.ok) {
  console.error(`[healthcheck] Health endpoint returned HTTP ${response.status}`);
  process.exit(1);
}

const payload = await response.json();
if (payload.status !== "ok" || payload.databaseReady !== true) {
  console.error("[healthcheck] Application is not ready:", payload);
  process.exit(1);
}

console.log("[healthcheck] Application health check passed.");
