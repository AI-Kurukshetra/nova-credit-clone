export type UserRole = "consumer" | "lender";

export type RiskTier = "excellent" | "good" | "fair" | "poor";

export type ProfileStatus = "pending" | "processing" | "complete";

export type DocumentType =
  | "credit_report"
  | "passport"
  | "bank_statement"
  | "other";

export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "verified"
  | "rejected";

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "denied"
  | "more_info_requested";

export interface ScoreBreakdown {
  paymentHistory: number;
  creditUtilization: number;
  creditAge: number;
  accountMix: number;
  newCredit: number;
}

export interface CreditProfileSummary {
  id: string;
  userId: string;
  userName: string;
  homeCountryCode: string;
  homeCountryName: string;
  bureauName: string;
  foreignScore: number;
  foreignScoreMax: number;
  translatedScore: number;
  riskTier: RiskTier;
  status: ProfileStatus;
  scoreBreakdown: ScoreBreakdown;
  flags: string[];
  recommendation: string;
  creditAgeMonths: number;
  lastUpdatedAt: string;
}

export interface TimelineEntry {
  id: string;
  accountType:
    | "Credit Card"
    | "Personal Loan"
    | "Mortgage"
    | "Auto Loan"
    | "Utility";
  institution: string;
  openedDate: string;
  closedDate: string | null;
  creditLimit: number;
  balance: number;
  status: "Active" | "Closed" | "Delinquent";
  paymentHistory: Array<"on_time" | "late" | "missed">;
}

export interface DemoConsumer {
  id: string;
  email: string;
  fullName: string;
  profile: CreditProfileSummary;
  timeline: TimelineEntry[];
}

export interface LenderApplicationRow {
  id: string;
  lenderId: string;
  lenderName: string;
  profileId: string;
  consumerNameMasked: string;
  countryCode: string;
  score: number;
  riskTier: RiskTier;
  status: ApplicationStatus;
  submittedAt: string;
  decisionAt: string | null;
  lenderNotes: string | null;
}

export interface ApiEnvelope<T> {
  data: T | null;
  error: string | null;
  meta: {
    timestamp: string;
    request_id: string;
  };
}
