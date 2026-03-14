import { expect, test } from "@playwright/test";

const baseURL = process.env.QA_BASE_URL ?? "http://localhost:3000";

test.describe("CreditBridge critical flows", () => {
  test("landing page navigation and redirect routes", async ({ page }) => {
    await page.goto(`${baseURL}/`);

    await expect(page.getByRole("heading", { name: /Your credit history travels with you/i })).toBeVisible();
    await page.locator('a[href="#how-it-works"]').click();
    await expect(page).toHaveURL(/#how-it-works/);

    await page.goto(`${baseURL}/login`);
    await expect(page).toHaveURL(`${baseURL}/signin`);

    await page.goto(`${baseURL}/signup`);
    await expect(page).toHaveURL(`${baseURL}/onboard`);
  });

  test("consumer onboarding happy path reaches dashboard", async ({ page }) => {
    await page.goto(`${baseURL}/onboard`);

    await page.getByLabel("Email").fill(`qa+${Date.now()}@example.com`);
    await page.locator("#password").fill("Demo@1234");
    await page.locator("#confirmPassword").fill("Demo@1234");
    await page.locator("label[for='consent-data']").click();
    await page.locator("label[for='consent-terms']").click();
    await page.getByRole("button", { name: "Continue" }).first().click();

    await expect(page.getByText("Personal information")).toBeVisible();
    await page.getByLabel("First name").fill("Priya");
    await page.getByLabel("Last name").fill("Sharma");

    await page.getByRole("combobox").nth(0).click();
    await page.getByRole("option", { name: "California" }).click();
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: "Work Visa (H-1B)" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("button", { name: "Continue" }).click();

    const fileInputs = page.locator("input[type='file']");
    await fileInputs.nth(0).setInputFiles({
      name: "credit-report.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    await fileInputs.nth(1).setInputFiles({
      name: "passport.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    });

    await page.getByRole("button", { name: "Start Processing" }).click();
    await page.waitForURL("**/dashboard", { timeout: 25000 });
    await expect(page.getByText("Consumer Overview")).toBeVisible();
  });

  test("lender onboarding reaches lender dashboard", async ({ page }) => {
    await page.goto(`${baseURL}/lender/onboard`);

    await page.getByLabel("Company name").fill("Community First Credit Union");
    await page.getByLabel("License number").fill("CF-2026-0019");
    await page.getByLabel("State of operation").fill("California");

    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Credit Union" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByText("Mortgage loans").click();
    await page.getByRole("button", { name: /Generate API Key/i }).click();
    await page.getByRole("button", { name: /Continue to webhook setup/i }).click();

    await page.getByRole("link", { name: /Go to lender dashboard/i }).click();
    await page.waitForURL("**/lender/dashboard", { timeout: 10000 });
    await expect(page.getByText("Lender Overview")).toBeVisible();
  });

  test("dashboard routes render", async ({ page }) => {
    test.setTimeout(120000);

    const routes = [
      "/dashboard",
      "/dashboard/report",
      "/dashboard/documents",
      "/dashboard/applications",
      "/dashboard/settings",
      "/lender/dashboard",
      "/lender/dashboard/applications",
      "/lender/dashboard/search",
      "/lender/dashboard/api-keys",
      "/lender/dashboard/webhooks",
      "/lender/dashboard/settings",
    ];

    for (const route of routes) {
      await page.goto(`${baseURL}${route}`);
      await expect(page).toHaveURL(`${baseURL}${route}`);
      const hasContent = await page.evaluate(() => document.body.innerText.trim().length > 80);
      expect(hasContent).toBeTruthy();
    }
  });
});
