import { COUNTRY_CONFIG } from "./constants";
import type { RiskTier, ScoreBreakdown } from "./types";

interface TranslationResult {
  translatedScore: number;
  riskTier: RiskTier;
  scoreBreakdown: ScoreBreakdown;
  flags: string[];
  recommendation: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function getRiskTier(score: number): RiskTier {
  if (score >= 750) {
    return "excellent";
  }
  if (score >= 670) {
    return "good";
  }
  if (score >= 580) {
    return "fair";
  }
  return "poor";
}

function getRecommendation(riskTier: RiskTier): string {
  if (riskTier === "excellent") {
    return "Approve";
  }
  if (riskTier === "good") {
    return "Approve with review";
  }
  if (riskTier === "fair") {
    return "Manual review required";
  }
  return "Decline or co-signer required";
}

function getScoreRatio(
  foreignScore: number,
  countryCode: keyof typeof COUNTRY_CONFIG,
  bureauMaxScore?: number,
): number {
  const config = COUNTRY_CONFIG[countryCode];
  const min = config.min;
  const max = bureauMaxScore ?? config.max;
  const range = Math.max(max - min, 1);
  return clamp((foreignScore - min) / range, 0, 1);
}

function getCreditAgeMonthsFromRatio(ratio: number): number {
  // Simulated age spread between 10 months and 12 years.
  return Math.round(10 + ratio * 134);
}

function deriveBreakdown(ratio: number): ScoreBreakdown {
  const paymentHistory = clamp(Math.round(45 + ratio * 50), 0, 100);
  const creditUtilization = clamp(Math.round(30 + ratio * 55), 0, 100);
  const creditAge = clamp(Math.round(20 + ratio * 70), 0, 100);
  const accountMix = clamp(Math.round(25 + ratio * 60), 0, 100);
  const newCredit = clamp(Math.round(35 + ratio * 45), 0, 100);

  return {
    paymentHistory,
    creditUtilization,
    creditAge,
    accountMix,
    newCredit,
  };
}

function calculateTranslatedScore(
  foreignScore: number,
  countryCode: keyof typeof COUNTRY_CONFIG,
): number {
  switch (countryCode) {
    case "GB":
      return Math.round((foreignScore / 999) * 550 + 300);
    case "CA":
      return Math.round(((foreignScore - 300) / 600) * 550 + 300);
    case "AU":
      return Math.round((foreignScore / 1200) * 550 + 300);
    case "IN":
      return Math.round(((foreignScore - 300) / 600) * 500 + 300);
    case "MX":
      return Math.round(((foreignScore - 400) / 450) * 500 + 300);
  }
}

export function translateCreditScore(
  foreignScore: number,
  countryCode: string,
  bureauMaxScore?: number,
): TranslationResult {
  const normalizedCode = countryCode.toUpperCase() as keyof typeof COUNTRY_CONFIG;
  const fallbackCode: keyof typeof COUNTRY_CONFIG = COUNTRY_CONFIG[normalizedCode]
    ? normalizedCode
    : "CA";

  const translatedScore = clamp(
    calculateTranslatedScore(foreignScore, fallbackCode),
    300,
    850,
  );

  const ratio = getScoreRatio(foreignScore, fallbackCode, bureauMaxScore);
  const scoreBreakdown = deriveBreakdown(ratio);
  const riskTier = getRiskTier(translatedScore);
  const creditAgeMonths = getCreditAgeMonthsFromRatio(ratio);
  const flags: string[] = [
    "Limited US credit history — no domestic credit file found",
  ];

  if (translatedScore < 580) {
    flags.push("Higher risk profile — manual review recommended");
  }
  if (fallbackCode === "IN" || fallbackCode === "MX") {
    flags.push("Score from emerging market bureau — apply additional context");
  }
  if (creditAgeMonths < 36) {
    flags.push("Short credit history — less than 3 years");
  }

  return {
    translatedScore,
    riskTier,
    scoreBreakdown,
    flags,
    recommendation: getRecommendation(riskTier),
  };
}

export function getRiskTierColor(riskTier: RiskTier): string {
  if (riskTier === "excellent") {
    return "bg-green-600";
  }
  if (riskTier === "good") {
    return "bg-blue-600";
  }
  if (riskTier === "fair") {
    return "bg-amber-600";
  }
  return "bg-red-600";
}
