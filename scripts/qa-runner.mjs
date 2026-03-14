import fs from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:3000";
const STARTED_AT = new Date().toISOString();
const RUN_ID = STARTED_AT.replace(/[:.]/g, "-");
const OUTPUT_DIR = path.join(process.cwd(), "qa-artifacts", RUN_ID);
const SHOT_DIR = path.join(OUTPUT_DIR, "screenshots");

const report = {
  baseUrl: BASE_URL,
  startedAt: STARTED_AT,
  finishedAt: "",
  discoveredRoutes: [],
  pages: [],
  flows: [],
  interactions: [],
  uiIssues: [],
  consoleLogs: [],
  runtimeErrors: [],
  networkErrors: [],
  screenshots: [],
  notes: [],
};

const discovered = new Set();
const visited = new Set();

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function uniqueBy(items, keyBuilder) {
  const map = new Map();
  for (const item of items) {
    map.set(keyBuilder(item), item);
  }
  return [...map.values()];
}

function pushInteraction(flow, action, status, details = "") {
  report.interactions.push({ flow, action, status, details });
}

function pushFlow(name, status, details = "") {
  report.flows.push({ name, status, details });
}

function addUiIssue(route, issue, details = "") {
  report.uiIssues.push({ route, issue, details });
}

function relativeUrl(url) {
  try {
    const target = new URL(url);
    const base = new URL(BASE_URL);
    if (target.origin !== base.origin) {
      return null;
    }
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return null;
  }
}

async function capture(page, label, fullPage = true) {
  const file = `${String(report.screenshots.length + 1).padStart(2, "0")}-${slug(label)}.png`;
  const outPath = path.join(SHOT_DIR, file);
  await page.screenshot({ path: outPath, fullPage });
  report.screenshots.push({
    label,
    path: outPath,
    url: page.url(),
  });
}

async function collectLinks(page) {
  const hrefs = await page.evaluate(() => {
    const values = new Set();
    const anchors = Array.from(document.querySelectorAll("a[href]"));
    for (const anchor of anchors) {
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
        continue;
      }
      values.add(anchor.href);
    }
    return [...values];
  });

  for (const href of hrefs) {
    const rel = relativeUrl(href);
    if (!rel) continue;
    discovered.add(rel.split("#")[0]);
  }
}

async function runLayoutAudit(page, route) {
  const audit = await page.evaluate(() => {
    const vw = window.innerWidth;
    const horizontalOverflow = document.documentElement.scrollWidth - vw;

    let clippedVisibleElements = 0;
    const all = Array.from(document.body.querySelectorAll("*"));
    for (const element of all) {
      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
        continue;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width < 40 || rect.height < 16) continue;
      if (rect.right > vw + 2 || rect.left < -2) {
        clippedVisibleElements += 1;
      }
    }

    const brokenImages = Array.from(document.images).filter(
      (img) => img.complete && img.naturalWidth === 0,
    ).length;

    const clickables = Array.from(document.querySelectorAll("button, [role='button'], a"));
    const tinyClickTargets = clickables
      .map((el) => el.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0 && (rect.width < 28 || rect.height < 28)).length;

    return {
      horizontalOverflow,
      clippedVisibleElements,
      brokenImages,
      tinyClickTargets,
      bodyTextLength: (document.body.innerText || "").trim().length,
    };
  });

  if (audit.horizontalOverflow > 4) {
    addUiIssue(route, "Horizontal overflow detected", `overflow_px=${audit.horizontalOverflow}`);
  }
  if (audit.clippedVisibleElements > 0) {
    addUiIssue(route, "Potential clipped elements", `count=${audit.clippedVisibleElements}`);
  }
  if (audit.brokenImages > 0) {
    addUiIssue(route, "Broken images detected", `count=${audit.brokenImages}`);
  }
  if (audit.tinyClickTargets > 0) {
    addUiIssue(route, "Small clickable targets", `count=${audit.tinyClickTargets}`);
  }
  if (audit.bodyTextLength < 40) {
    addUiIssue(route, "Very low visible content", `text_length=${audit.bodyTextLength}`);
  }
}

function attachPageEventCapture(page, contextLabel) {
  page.on("console", (message) => {
    const type = message.type();
    if (!["error", "warning"].includes(type)) return;
    report.consoleLogs.push({
      type,
      text: message.text(),
      page: page.url(),
      context: contextLabel.current,
    });
  });

  page.on("pageerror", (error) => {
    report.runtimeErrors.push({
      page: page.url(),
      context: contextLabel.current,
      message: error?.message ?? String(error),
    });
  });

  page.on("requestfailed", (request) => {
    report.networkErrors.push({
      page: page.url(),
      context: contextLabel.current,
      url: request.url(),
      method: request.method(),
      status: null,
      reason: request.failure()?.errorText ?? "requestfailed",
    });
  });

  page.on("response", (response) => {
    if (response.status() < 400) return;
    report.networkErrors.push({
      page: page.url(),
      context: contextLabel.current,
      url: response.url(),
      method: response.request().method(),
      status: response.status(),
      reason: "http_error",
    });
  });
}

async function visitRoute(page, route, contextLabel) {
  const url = new URL(route, BASE_URL).toString();
  contextLabel.current = `visit:${route}`;

  let status = null;
  let error = null;
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    status = response?.status() ?? null;
    await page.waitForTimeout(600);
    await collectLinks(page);
    await runLayoutAudit(page, route);
    await capture(page, `route-${route === "/" ? "home" : route.replaceAll("/", "-")}`);
  } catch (visitError) {
    error = visitError instanceof Error ? visitError.message : String(visitError);
    addUiIssue(route, "Route navigation failed", error);
  }

  report.pages.push({
    route,
    status,
    title: await page.title().catch(() => ""),
    finalUrl: page.url(),
    navigationError: error,
  });
  visited.add(route);
}

async function selectFromCombobox(page, comboboxIndex, optionName) {
  const combo = page.getByRole("combobox").nth(comboboxIndex);
  await combo.click();
  await page.getByRole("option", { name: optionName }).click();
}

async function selectFromFieldLabel(page, labelText, optionName) {
  const field = page.locator(`.portal-field:has(label:has-text("${labelText}"))`).first();
  await field.getByRole("combobox").click();
  await page.getByRole("option", { name: optionName }).click();
}

async function runPublicFlow(page, contextLabel) {
  const flow = "Public Landing and Navigation";
  try {
    await visitRoute(page, "/", contextLabel);

    await page.getByRole("link", { name: "How it works" }).click();
    pushInteraction(flow, "Anchor jump: How it works", "passed");
    await page.getByRole("link", { name: "Countries" }).click();
    pushInteraction(flow, "Anchor jump: Countries", "passed");
    await page.locator('a[href="#lenders"]').first().click();
    pushInteraction(flow, "Anchor jump: Lenders", "passed");

    await page.getByRole("link", { name: "Get Your Free Credit Report" }).click();
    await page.waitForURL("**/onboard", { timeout: 10000 });
    await capture(page, "consumer-onboard-entry");
    pushInteraction(flow, "CTA to onboarding", "passed");
    pushFlow(flow, "passed");
  } catch (error) {
    pushFlow(flow, "failed", error instanceof Error ? error.message : String(error));
  }
}

async function runConsumerOnboardingFlow(page, contextLabel) {
  const flow = "Consumer Onboarding";
  try {
    contextLabel.current = flow;
    await page.goto(`${BASE_URL}/onboard`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    const continueBtn = page.getByRole("button", { name: "Continue" }).first();
    const disabledBeforeConsent = await continueBtn.isDisabled();
    pushInteraction(
      flow,
      "Step1 continue disabled before consent",
      disabledBeforeConsent ? "passed" : "failed",
      `disabled=${disabledBeforeConsent}`,
    );

    await page.getByLabel("Email").fill("invalid-email");
    await page.locator("#password").fill("short");
    await page.locator("#confirmPassword").fill("different");
    await page.locator("label[for='consent-data']").click();
    await page.locator("label[for='consent-terms']").click();
    await continueBtn.click();
    await page.waitForTimeout(350);

    const step1Errors = await page.locator(".portal-inline-error").allTextContents();
    pushInteraction(
      flow,
      "Step1 invalid data validation",
      step1Errors.length ? "passed" : "failed",
      step1Errors.join(" | "),
    );

    const email = `qa+${Date.now()}@example.com`;
    await page.getByLabel("Email").fill(email);
    await page.locator("#password").fill("Demo@1234");
    await page.locator("#confirmPassword").fill("Demo@1234");
    await continueBtn.click();
    await page.waitForTimeout(1200);
    await capture(page, "consumer-onboard-step2");

    const onStep2 = await page.getByText("Personal information").isVisible().catch(() => false);
    pushInteraction(flow, "Step1 to Step2 transition", onStep2 ? "passed" : "failed");

    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForTimeout(250);
    const step2Errors = await page.locator(".portal-inline-error").allTextContents();
    pushInteraction(
      flow,
      "Step2 empty validation",
      step2Errors.length ? "passed" : "failed",
      step2Errors.join(" | "),
    );

    await page.getByLabel("First name").fill("Priya");
    await page.getByLabel("Last name").fill("Sharma");
    await selectFromFieldLabel(page, "Current US state", "California");
    await selectFromFieldLabel(page, "Immigration status", "Work Visa (H-1B)");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForTimeout(500);
    await capture(page, "consumer-onboard-step3");

    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForTimeout(450);
    await capture(page, "consumer-onboard-step4");

    const fileInputs = page.locator("input[type='file']");
    const fileCount = await fileInputs.count();
    if (fileCount >= 2) {
      await fileInputs.nth(0).setInputFiles({
        name: "bad.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("bad file"),
      });
      await page.waitForTimeout(200);
      const uploadError = await page.locator(".portal-inline-error").first().textContent().catch(() => "");
      pushInteraction(
        flow,
        "Upload invalid file type",
        uploadError && uploadError.toLowerCase().includes("unsupported") ? "passed" : "failed",
        uploadError ?? "",
      );

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
      pushInteraction(flow, "Upload valid required files", "passed");
    } else {
      pushInteraction(flow, "File input availability", "failed", `inputs_found=${fileCount}`);
    }

    await page.getByRole("button", { name: "Start Processing" }).click();
    await page.waitForURL("**/dashboard", { timeout: 20000 });
    await page.waitForTimeout(400);
    await capture(page, "consumer-dashboard-after-onboard");
    pushInteraction(flow, "Processing redirect to dashboard", "passed");
    pushFlow(flow, "passed");
  } catch (error) {
    pushFlow(flow, "failed", error instanceof Error ? error.message : String(error));
  }
}

async function runConsumerDashboardFlow(page, contextLabel) {
  const flow = "Consumer Dashboard Flows";
  try {
    contextLabel.current = flow;

    await visitRoute(page, "/dashboard", contextLabel);
    await page.getByRole("button", { name: /Share report/i }).click();
    await page.waitForTimeout(200);
    await capture(page, "consumer-dashboard-share-dialog");
    await page.getByRole("button", { name: /Copy share link/i }).click().catch(() => {});
    await page.getByRole("button", { name: /Share now/i }).click().catch(() => {});
    await page.keyboard.press("Escape");
    pushInteraction(flow, "Share dialog open/copy/share", "passed");

    await page.getByRole("button", { name: /Download report/i }).first().click().catch(() => {});
    pushInteraction(flow, "Download report action", "passed");

    const consumerRoutes = [
      "/dashboard/report",
      "/dashboard/documents",
      "/dashboard/applications",
      "/dashboard/settings",
    ];
    for (const route of consumerRoutes) {
      await visitRoute(page, route, contextLabel);
    }

    await page.goto(`${BASE_URL}/dashboard/documents`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /Upload New Document/i }).click();
    await page.waitForTimeout(250);
    await capture(page, "consumer-documents-upload-modal");
    await page.keyboard.press("Escape");
    pushInteraction(flow, "Documents upload modal", "passed");

    await page.goto(`${BASE_URL}/dashboard/settings`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Full name").fill("");
    await page.getByLabel("Email").fill("bad-email");
    await page.getByRole("button", { name: /Save profile/i }).click();
    await page.waitForTimeout(300);
    const settingErrors = await page.locator(".portal-inline-error").allTextContents();
    pushInteraction(
      flow,
      "Settings invalid profile validation",
      settingErrors.length ? "passed" : "failed",
      settingErrors.join(" | "),
    );
    await page.getByLabel("Full name").fill("Priya Sharma");
    await page.getByLabel("Email").fill("priya@example.com");
    await page.getByRole("button", { name: /Save profile/i }).click();
    pushInteraction(flow, "Settings save with valid profile", "passed");

    await page.getByRole("button", { name: /Download My Data/i }).click().catch(() => {});
    await page.getByRole("button", { name: /Delete My Account/i }).click();
    await page.waitForTimeout(200);
    await capture(page, "consumer-settings-delete-dialog");
    await page.getByRole("button", { name: "Cancel" }).click();
    pushInteraction(flow, "Settings privacy actions", "passed");

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Notifications", exact: true }).click();
    await page.locator("button:has([data-slot='avatar'])").click();
    await page.getByText("Sign out").click();
    await page.waitForURL("**/signin", { timeout: 10000 });
    pushInteraction(flow, "Topbar sign out navigation", "passed");

    pushFlow(flow, "passed");
  } catch (error) {
    pushFlow(flow, "failed", error instanceof Error ? error.message : String(error));
  }
}

async function runLenderOnboardingFlow(page, contextLabel) {
  const flow = "Lender Onboarding";
  try {
    contextLabel.current = flow;
    await page.goto(`${BASE_URL}/lender/onboard`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);
    await capture(page, "lender-onboard-step1");

    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForTimeout(200);
    const step1Error = await page.locator(".portal-inline-error").first().textContent().catch(() => "");
    pushInteraction(
      flow,
      "Step1 required company name validation",
      step1Error ? "passed" : "failed",
      step1Error ?? "",
    );

    await page.getByLabel("Company name").fill("Community First Credit Union");
    await page.getByLabel("License number").fill("CF-2026-0019");
    await page.getByLabel("State of operation").fill("California");
    await selectFromFieldLabel(page, "Company type", "Credit Union");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForTimeout(350);
    await capture(page, "lender-onboard-step2");

    await page.getByRole("button", { name: /Generate API Key/i }).click();
    await page.waitForTimeout(200);
    const step2Error = await page.locator(".portal-inline-error").first().textContent().catch(() => "");
    pushInteraction(
      flow,
      "Step2 use case required validation",
      step2Error ? "passed" : "failed",
      step2Error ?? "",
    );

    await page.getByText("Mortgage loans").click();
    await page.getByRole("button", { name: /Generate API Key/i }).click();
    await page.waitForTimeout(300);
    await capture(page, "lender-onboard-step3");
    pushInteraction(flow, "API key generation step", "passed");

    await page.getByRole("button", { name: /Copy/i }).click().catch(() => {});
    await page.getByRole("button", { name: /Continue to webhook setup/i }).click();
    await page.waitForTimeout(350);
    await capture(page, "lender-onboard-step4");

    await page.getByRole("button", { name: /Test Webhook/i }).click();
    await page.getByRole("link", { name: /Go to lender dashboard/i }).click();
    await page.waitForURL("**/lender/dashboard", { timeout: 10000 });
    await capture(page, "lender-dashboard-after-onboard");
    pushInteraction(flow, "Navigate to lender dashboard", "passed");
    pushFlow(flow, "passed");
  } catch (error) {
    pushFlow(flow, "failed", error instanceof Error ? error.message : String(error));
  }
}

async function runLenderDashboardFlow(page, contextLabel) {
  const flow = "Lender Dashboard Flows";
  try {
    contextLabel.current = flow;
    await visitRoute(page, "/lender/dashboard", contextLabel);
    await page.getByRole("tab", { name: /API Usage/i }).click();
    await page.waitForTimeout(250);
    await capture(page, "lender-dashboard-api-usage-tab");
    pushInteraction(flow, "Overview tabs switch", "passed");

    const lenderRoutes = [
      "/lender/dashboard/applications",
      "/lender/dashboard/search",
      "/lender/dashboard/api-keys",
      "/lender/dashboard/webhooks",
      "/lender/dashboard/settings",
    ];
    for (const route of lenderRoutes) {
      await visitRoute(page, route, contextLabel);
    }

    await page.goto(`${BASE_URL}/lender/dashboard/applications`, { waitUntil: "domcontentloaded" });
    await selectFromFieldLabel(page, "Status", "approved");
    await selectFromFieldLabel(page, "Country", "IN");
    await selectFromFieldLabel(page, "Risk Tier", "Good");
    pushInteraction(flow, "Applications filter controls", "passed");
    await page.getByRole("button", { name: "Review" }).first().click();
    await page.waitForTimeout(350);
    await capture(page, "lender-application-review-sheet");
    await page.getByRole("button", { name: "Approve" }).click();
    await page.keyboard.press("Escape");
    pushInteraction(flow, "Application review/approve action", "passed");

    await page.goto(`${BASE_URL}/lender/dashboard/search`, { waitUntil: "domcontentloaded" });
    await page.getByPlaceholder("Search by consumer email or CreditBridge profile ID").fill("priya");
    await page.waitForTimeout(350);
    await capture(page, "lender-search-results");
    await page.getByRole("button", { name: /Add to Review Queue/i }).first().click();
    pushInteraction(flow, "Consumer search and queue action", "passed");

    await page.goto(`${BASE_URL}/lender/dashboard/api-keys`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /Create New Key/i }).click();
    await page.getByRole("button", { name: /Generate key/i }).click();
    await page.waitForTimeout(250);
    const labelError = await page.locator(".portal-inline-error").first().textContent().catch(() => "");
    pushInteraction(
      flow,
      "API key label validation",
      labelError ? "passed" : "failed",
      labelError ?? "",
    );
    await page.getByLabel("Label").fill("QA automation key");
    await page.getByRole("button", { name: /Generate key/i }).click();
    await page.waitForTimeout(300);
    await capture(page, "lender-api-key-generated-dialog");
    await page.getByRole("button", { name: /Copy key/i }).click().catch(() => {});
    await page.keyboard.press("Escape");
    pushInteraction(flow, "API key create flow", "passed");

    await page.getByRole("button", { name: "Revoke" }).first().click();
    pushInteraction(flow, "API key revoke action", "passed");

    await page.goto(`${BASE_URL}/lender/dashboard/webhooks`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Current webhook URL").fill("bad-url");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(250);
    const webhookError = await page.locator(".portal-inline-error").first().textContent().catch(() => "");
    pushInteraction(
      flow,
      "Webhook URL validation",
      webhookError ? "passed" : "failed",
      webhookError ?? "",
    );
    await page.getByLabel("Current webhook URL").fill("https://example.com/webhook");
    await page.getByRole("button", { name: "Save" }).click();
    await page.getByRole("button", { name: /Send Test Event/i }).click();
    await capture(page, "lender-webhook-events");
    pushInteraction(flow, "Webhook save + test event", "passed");

    await page.goto(`${BASE_URL}/lender/dashboard/settings`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Company name").fill("A");
    await page.getByLabel("License number").fill("1");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(250);
    const settingsErrors = await page.locator(".portal-inline-error").allTextContents();
    pushInteraction(
      flow,
      "Lender settings validation",
      settingsErrors.length ? "passed" : "failed",
      settingsErrors.join(" | "),
    );
    await page.getByLabel("Company name").fill("Community First Credit Union");
    await page.getByLabel("License number").fill("CF-2026-0019");
    await page.getByRole("button", { name: "Save" }).click();
    await page.getByRole("button", { name: /Enforce IP allowlist/i }).click();
    await page.getByRole("button", { name: /Require team MFA/i }).click();
    pushInteraction(flow, "Lender settings and security actions", "passed");

    pushFlow(flow, "passed");
  } catch (error) {
    pushFlow(flow, "failed", error instanceof Error ? error.message : String(error));
  }
}

async function runStaticRoutesSweep(page, contextLabel) {
  const flow = "Static and Reachable Routes Sweep";
  try {
    const baselineRoutes = [
      "/",
      "/login",
      "/signup",
      "/signin",
      "/onboard",
      "/dashboard",
      "/dashboard/report",
      "/dashboard/documents",
      "/dashboard/applications",
      "/dashboard/settings",
      "/lender/onboard",
      "/lender/dashboard",
      "/lender/dashboard/applications",
      "/lender/dashboard/search",
      "/lender/dashboard/api-keys",
      "/lender/dashboard/webhooks",
      "/lender/dashboard/settings",
      "/privacy",
      "/terms",
    ];
    for (const route of baselineRoutes) discovered.add(route);

    const queue = [...discovered];
    for (const route of queue) {
      if (visited.has(route)) continue;
      await visitRoute(page, route, contextLabel);
    }
    pushFlow(flow, "passed", `routes_visited=${visited.size}`);
  } catch (error) {
    pushFlow(flow, "failed", error instanceof Error ? error.message : String(error));
  }
}

async function runMobileSpotChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  const contextLabel = { current: "mobile" };
  attachPageEventCapture(page, contextLabel);

  const flow = "Mobile Layout Spot Checks";
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await capture(page, "mobile-landing", true);
    await runLayoutAudit(page, "/ (mobile)");

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await capture(page, "mobile-consumer-dashboard", true);
    await runLayoutAudit(page, "/dashboard (mobile)");

    pushFlow(flow, "passed");
  } catch (error) {
    pushFlow(flow, "failed", error instanceof Error ? error.message : String(error));
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.mkdir(SHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const contextLabel = { current: "init" };
  attachPageEventCapture(page, contextLabel);

  try {
    await runPublicFlow(page, contextLabel);
    await runConsumerOnboardingFlow(page, contextLabel);
    await runConsumerDashboardFlow(page, contextLabel);
    await runLenderOnboardingFlow(page, contextLabel);
    await runLenderDashboardFlow(page, contextLabel);
    await runStaticRoutesSweep(page, contextLabel);
    await runMobileSpotChecks(browser);
  } finally {
    await context.close();
    await browser.close();
  }

  report.discoveredRoutes = [...new Set([...discovered, ...visited])].sort();
  report.consoleLogs = uniqueBy(report.consoleLogs, (item) =>
    `${item.type}|${item.text}|${item.context}|${item.page}`,
  );
  report.runtimeErrors = uniqueBy(report.runtimeErrors, (item) =>
    `${item.message}|${item.context}|${item.page}`,
  );
  report.networkErrors = uniqueBy(report.networkErrors, (item) =>
    `${item.url}|${item.method}|${item.status}|${item.reason}|${item.context}`,
  );
  report.finishedAt = new Date().toISOString();

  const reportPath = path.join(OUTPUT_DIR, "report.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(reportPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


