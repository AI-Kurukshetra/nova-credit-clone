import { formatDate, formatCurrency, riskTierLabel } from "@/lib/format";
import type { DemoConsumer, TimelineEntry } from "@/lib/types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTimelineEntry(entry: TimelineEntry): string {
  const creditLimit =
    entry.creditLimit > 0 ? formatCurrency(entry.creditLimit) : "Not reported";
  const balance = formatCurrency(entry.balance);
  const paymentHistory = entry.paymentHistory
    .map((item) => item.replaceAll("_", " "))
    .join(" | ");

  return `<article class="timeline-card">
    <div class="timeline-header">
      <div>
        <p class="timeline-label">${escapeHtml(entry.accountType)}</p>
        <h3>${escapeHtml(entry.institution)}</h3>
      </div>
      <span class="timeline-status">${escapeHtml(entry.status)}</span>
    </div>
    <dl class="timeline-grid">
      <div>
        <dt>Opened</dt>
        <dd>${escapeHtml(formatDate(entry.openedDate))}</dd>
      </div>
      <div>
        <dt>Closed</dt>
        <dd>${escapeHtml(entry.closedDate ? formatDate(entry.closedDate) : "Active")}</dd>
      </div>
      <div>
        <dt>Credit Limit</dt>
        <dd>${escapeHtml(creditLimit)}</dd>
      </div>
      <div>
        <dt>Balance</dt>
        <dd>${escapeHtml(balance)}</dd>
      </div>
    </dl>
    <p class="timeline-footnote">Recent payment pattern: ${escapeHtml(paymentHistory)}</p>
  </article>`;
}

export function getConsumerReportFilename(consumer: DemoConsumer): string {
  const safeName = consumer.fullName
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");

  return `${safeName || "creditbridge"}-credit-report.html`;
}

export function getConsumerReportSharePath(profileId: string): string {
  return `/dashboard/report?profile=${profileId}`;
}

export function buildConsumerReportHtml(consumer: DemoConsumer): string {
  const { profile, timeline } = consumer;
  const timelineMarkup = timeline.map(renderTimelineEntry).join("");
  const scoreBreakdown = [
    ["Payment history", `${profile.scoreBreakdown.paymentHistory}%`],
    ["Credit utilization", `${profile.scoreBreakdown.creditUtilization}%`],
    ["Credit age", `${profile.scoreBreakdown.creditAge}%`],
    ["Account mix", `${profile.scoreBreakdown.accountMix}%`],
    ["New credit", `${profile.scoreBreakdown.newCredit}%`],
  ]
    .map(
      ([label, value]) => `<div class="stat-card">
        <p class="stat-label">${escapeHtml(label)}</p>
        <p class="stat-value">${escapeHtml(value)}</p>
      </div>`,
    )
    .join("");
  const flagsMarkup = profile.flags.length
    ? profile.flags
        .map((flag) => `<span class="chip">${escapeHtml(flag)}</span>`)
        .join("")
    : `<span class="chip chip-muted">No active flags</span>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CreditBridge Report</title>
    <style>
      :root {
        color-scheme: dark;
        --canvas: #04142f;
        --canvas-deep: #030b1b;
        --surface: rgba(8, 19, 45, 0.94);
        --surface-strong: rgba(6, 18, 44, 0.98);
        --border: rgba(191, 219, 254, 0.18);
        --text: #f8fafc;
        --muted: rgba(207, 225, 243, 0.84);
        --accent: #67e8f9;
        --accent-2: #34d399;
        --accent-3: #fde68a;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(circle at top right, rgba(52, 211, 153, 0.18), transparent 26%),
          radial-gradient(circle at top left, rgba(103, 232, 249, 0.2), transparent 24%),
          linear-gradient(180deg, var(--canvas) 0%, var(--canvas-deep) 100%);
        color: var(--text);
        font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        padding: 32px;
      }
      .frame {
        max-width: 1120px;
        margin: 0 auto;
        display: grid;
        gap: 24px;
      }
      .hero,
      .section {
        border: 1px solid var(--border);
        border-radius: 24px;
        background:
          linear-gradient(160deg, rgba(8, 19, 45, 0.96), rgba(5, 14, 35, 0.92)),
          linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent);
        box-shadow:
          0 28px 72px -38px rgba(15, 23, 42, 0.96),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }
      .hero { padding: 28px; }
      .eyebrow {
        margin: 0 0 12px;
        color: #bae6fd;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.24em;
        text-transform: uppercase;
      }
      h1, h2, h3, p { margin: 0; }
      h1 {
        font-size: clamp(36px, 5vw, 58px);
        line-height: 0.96;
        letter-spacing: -0.04em;
      }
      .hero-copy {
        margin-top: 14px;
        max-width: 760px;
        color: var(--muted);
        font-size: 16px;
        line-height: 1.72;
      }
      .hero-grid,
      .stats-grid,
      .timeline-grid-wrap {
        display: grid;
        gap: 16px;
      }
      .hero-grid {
        margin-top: 26px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
      .section {
        padding: 24px;
      }
      .section-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: end;
        margin-bottom: 18px;
      }
      .section-head p {
        color: var(--muted);
        font-size: 14px;
        line-height: 1.65;
        max-width: 720px;
      }
      .headline {
        font-size: 30px;
        letter-spacing: -0.03em;
      }
      .stat-card,
      .score-card,
      .timeline-card {
        border: 1px solid var(--border);
        border-radius: 20px;
        background: rgba(6, 14, 34, 0.78);
      }
      .score-card {
        padding: 20px;
      }
      .stat-card {
        padding: 16px;
      }
      .stat-label {
        color: #bae6fd;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }
      .stat-value {
        margin-top: 12px;
        font-size: 34px;
        font-weight: 700;
        letter-spacing: -0.04em;
      }
      .muted {
        margin-top: 10px;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.7;
      }
      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(125, 211, 252, 0.22);
        background: rgba(8, 17, 39, 0.7);
        color: #e0f2fe;
        font-size: 13px;
        font-weight: 600;
      }
      .chip-muted {
        border-color: rgba(148, 163, 184, 0.24);
        color: #cbd5e1;
      }
      .timeline-grid-wrap {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
      .timeline-card {
        padding: 18px;
      }
      .timeline-header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: start;
      }
      .timeline-label {
        color: #bae6fd;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      .timeline-header h3 {
        margin-top: 8px;
        font-size: 20px;
        letter-spacing: -0.02em;
      }
      .timeline-status {
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(52, 211, 153, 0.14);
        color: #d1fae5;
        font-size: 12px;
        font-weight: 700;
      }
      .timeline-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        margin-top: 18px;
      }
      .timeline-grid dt {
        color: #94a3b8;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .timeline-grid dd {
        margin: 8px 0 0;
        color: var(--text);
        font-size: 15px;
        font-weight: 600;
      }
      .timeline-footnote {
        margin-top: 16px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.7;
      }
      .footer-note {
        color: #94a3b8;
        font-size: 12px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      @media (max-width: 720px) {
        body { padding: 18px; }
        .hero, .section { padding: 18px; border-radius: 18px; }
        .timeline-grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main class="frame">
      <section class="hero">
        <p class="eyebrow">CreditBridge consumer report</p>
        <h1>${escapeHtml(consumer.fullName)}</h1>
        <p class="hero-copy">
          Your translated profile packages your foreign bureau history into a lender-ready US credit narrative without forcing you to start from zero.
        </p>
        <div class="hero-grid">
          <div class="score-card">
            <p class="stat-label">Translated score</p>
            <p class="stat-value">${escapeHtml(String(profile.translatedScore))}</p>
            <p class="muted">Risk tier: ${escapeHtml(riskTierLabel(profile.riskTier))}</p>
          </div>
          <div class="score-card">
            <p class="stat-label">Source bureau</p>
            <p class="stat-value">${escapeHtml(profile.bureauName)}</p>
            <p class="muted">${escapeHtml(profile.homeCountryName)} • Updated ${escapeHtml(formatDate(profile.lastUpdatedAt))}</p>
          </div>
          <div class="score-card">
            <p class="stat-label">Original score</p>
            <p class="stat-value">${escapeHtml(`${profile.foreignScore}/${profile.foreignScoreMax}`)}</p>
            <p class="muted">${escapeHtml(profile.recommendation)}</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div>
            <p class="eyebrow">Score breakdown</p>
            <h2 class="headline">What drives the translated score</h2>
          </div>
        </div>
        <div class="stats-grid">${scoreBreakdown}</div>
        <div class="chip-row">${flagsMarkup}</div>
      </section>

      <section class="section">
        <div class="section-head">
          <div>
            <p class="eyebrow">Account timeline</p>
            <h2 class="headline">Lender-ready bureau history</h2>
            <p>
              These records summarize the payment behavior and account mix that support your CreditBridge profile.
            </p>
          </div>
          <p class="footer-note">Generated ${escapeHtml(formatDate(new Date().toISOString()))}</p>
        </div>
        <div class="timeline-grid-wrap">${timelineMarkup}</div>
      </section>
    </main>
  </body>
</html>`;
}
