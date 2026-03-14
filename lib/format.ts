import { format, formatDistanceToNow } from "date-fns";

import type { ApplicationStatus, DocumentStatus, RiskTier } from "@/lib/types";

export function formatDate(value: string | Date): string {
  return format(new Date(value), "MMM d, yyyy");
}

export function formatDateTime(value: string | Date): string {
  return format(new Date(value), "MMM d, yyyy HH:mm");
}

export function relativeTime(value: string | Date): string {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function riskTierLabel(riskTier: RiskTier): string {
  return riskTier[0].toUpperCase() + riskTier.slice(1);
}

export function riskTierBadgeClass(riskTier: RiskTier): string {
  if (riskTier === "excellent") {
    return "portal-status-positive";
  }
  if (riskTier === "good") {
    return "portal-status-info";
  }
  if (riskTier === "fair") {
    return "portal-status-warning";
  }
  return "portal-status-danger";
}

export function documentStatusClass(status: DocumentStatus): string {
  if (status === "verified") {
    return "portal-status-positive";
  }
  if (status === "processing") {
    return "portal-status-info";
  }
  if (status === "rejected") {
    return "portal-status-danger";
  }
  return "portal-status-neutral";
}

export function applicationStatusClass(status: ApplicationStatus): string {
  if (status === "approved") {
    return "portal-status-positive";
  }
  if (status === "under_review") {
    return "portal-status-info";
  }
  if (status === "denied") {
    return "portal-status-danger";
  }
  if (status === "more_info_requested") {
    return "portal-status-warning";
  }
  return "portal-status-neutral";
}

export function maskConsumerName(fullName: string | null | undefined): string {
  if (!fullName) {
    return "Unknown";
  }

  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "Unknown";
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const lastInitial = lastName?.slice(0, 1).toUpperCase();

  if (!lastInitial || parts.length === 1) {
    return firstName;
  }

  return `${firstName} ${lastInitial}.`;
}
