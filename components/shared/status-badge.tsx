import { Badge } from "@/components/ui/badge";
import {
  applicationStatusClass,
  documentStatusClass,
  riskTierBadgeClass,
  riskTierLabel,
} from "@/lib/format";
import type {
  ApplicationStatus,
  DocumentStatus,
  RiskTier,
} from "@/lib/types";

export function RiskTierBadge({ riskTier }: { riskTier: RiskTier }) {
  return <Badge className={riskTierBadgeClass(riskTier)}>{riskTierLabel(riskTier)}</Badge>;
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return <Badge className={documentStatusClass(status)}>{status.replaceAll("_", " ")}</Badge>;
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge className={applicationStatusClass(status)}>{status.replaceAll("_", " ")}</Badge>
  );
}
