import { expect, test } from "@playwright/test";

async function loginAsTestUser(page: import("@playwright/test").Page, userId = "e2e-user") {
  const response = await page.request.post("/api/test-auth/login", { data: { userId } });
  expect(response.ok()).toBeTruthy();
}

test("unauthenticated user is redirected from /today to /login", async ({ page }) => {
  await page.goto("/today");
  await expect(page).toHaveURL(/\/login/);
});

test("login page is reachable", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText(/welcome back/i)).toBeVisible();
});

test.describe("authenticated core journey", () => {
  test.skip(process.env.E2E_RUN_FULL !== "true", "Set E2E_RUN_FULL=true with a seeded Supabase dataset.");

  test("user can select plan, read today, complete day, and logout", async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto("/plans");
    await expect(page).toHaveURL(/\/plans/);

    const firstPlan = page.getByRole("button", { name: /start this plan|continue plan|switch to this plan/i }).first();
    await firstPlan.click();

    await page.goto("/today");
    await expect(page.getByRole("button", { name: /mark today complete/i })).toBeVisible();

    await page.getByRole("button", { name: /mark today complete/i }).click();
    await page.goto("/progress");
    await expect(page.getByText(/day|progress/i).first()).toBeVisible();

    await page.request.post("/api/test-auth/logout");
    await page.goto("/today");
    await expect(page).toHaveURL(/\/login/);
  });
});
