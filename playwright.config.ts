import { defineConfig } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3001);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`,
    trace: "on-first-retry"
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `NODE_ENV=test E2E_AUTH_BYPASS=true PORT=${port} npm run dev`,
        port,
        reuseExistingServer: !process.env.CI
      }
});
