"use client";

import Link from "next/link";
import { useState } from "react";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Download,
  FileUp,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { ScoreBreakdownChart } from "@/components/shared/score-breakdown-chart";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { RiskTierBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  buildConsumerReportHtml,
  getConsumerReportFilename,
  getConsumerReportSharePath,
} from "@/lib/consumer-report";
import { APP_SUBTEXT } from "@/lib/constants";
import { DEMO_CONSUMERS } from "@/lib/demo-data";
import { formatDate } from "@/lib/format";

const FLAG_DETAILS: Record<string, { description: string; severity: "warning" | "info" }> = {
  "Limited US credit history — no domestic credit file found": {
    description:
      "No existing US credit bureau record was detected. Lenders will rely entirely on the translated foreign profile for decisioning.",
    severity: "warning",
  },
  "Score from emerging market bureau — apply additional context": {
    description:
      "The source bureau operates in an emerging market where scoring models may differ significantly from US norms. Additional context is recommended.",
    severity: "info",
  },
  "Single bureau source — cross-reference recommended": {
    description:
      "Only one foreign bureau provided data. Cross-referencing with additional sources would strengthen the profile.",
    severity: "info",
  },
};

export default function ConsumerDashboardPage() {
  const consumer = DEMO_CONSUMERS[0];
  const profile = consumer?.profile;
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [sharingReport, setSharingReport] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  if (!profile) {
    return (
      <EmptyState
        title="Complete your profile to see your score"
        description="Finish onboarding and document upload to generate your CreditBridge score."
        icon={Send}
      />
    );
  }

  const sharePath = getConsumerReportSharePath(profile.id);

  function getShareUrl(): string {
    if (typeof window === "undefined") {
      return sharePath;
    }

    return new URL(sharePath, window.location.origin).toString();
  }

  function openReportPreview(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.open(sharePath, "_blank", "noopener,noreferrer");
  }

  async function handleDownloadReport(): Promise<void> {
    setDownloadingReport(true);
    try {
      const blob = new Blob([buildConsumerReportHtml(consumer)], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = getConsumerReportFilename(consumer);
      document.body.append(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast.success("Report downloaded.");
    } catch {
      toast.error("Unable to download report.");
    } finally {
      setDownloadingReport(false);
    }
  }

  async function handleCopyShareLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast.success("Share link copied.");
    } catch {
      toast.error("Unable to copy the share link.");
    }
  }

  async function handleShareReport(): Promise<void> {
    setSharingReport(true);
    try {
      const shareUrl = getShareUrl();
      if ("share" in navigator && typeof navigator.share === "function") {
        await navigator.share({
          title: "CreditBridge translated credit report",
          text: `${consumer.fullName}'s lender-ready CreditBridge report`,
          url: shareUrl,
        });
        toast.success("Share sheet opened.");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      toast.error("Unable to share report.");
    } finally {
      setSharingReport(false);
    }
  }

  const breakdownItems = [
    { key: "paymentHistory", label: "Payment History", value: profile.scoreBreakdown.paymentHistory },
    { key: "creditUtilization", label: "Credit Utilization", value: profile.scoreBreakdown.creditUtilization },
    { key: "creditAge", label: "Credit Age", value: profile.scoreBreakdown.creditAge },
    { key: "accountMix", label: "Account Mix", value: profile.scoreBreakdown.accountMix },
    { key: "newCredit", label: "New Credit", value: profile.scoreBreakdown.newCredit },
  ];

  return (
    <>
      <div className="grid gap-6">
        <section className="portal-page-intro">
          <div className="space-y-3">
            <p className="portal-kicker">Consumer Overview</p>
            <h2 className="portal-subtitle">Your translated credit identity</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
        </section>

        {/* Signature Score Hero */}
        <Card className="portal-hero-banner">
          <CardContent className="grid gap-8 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="portal-kicker">Signature Score</p>
              <h2 className="portal-subtitle">{profile.translatedScore}</h2>
              <p className="portal-copy text-sm">
                Equivalent to a <span className="font-semibold text-white">{profile.riskTier}</span> credit score in the US
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="portal-muted">
                  Originally: {profile.foreignScore}/{profile.foreignScoreMax} {profile.bureauName}
                </span>
                <span className="size-1 rounded-full bg-slate-500/50" />
                <span className="portal-muted">
                  Updated {formatDate(profile.lastUpdatedAt)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="portal-pill-note">
                  <ShieldCheck className="size-4 text-emerald-300" />
                  Verified cross-border profile
                </div>
                <div className="portal-pill-note">
                  <Send className="size-4 text-cyan-200" />
                  Share-ready for lenders
                </div>
              </div>
            </div>
            <ScoreGauge score={profile.translatedScore} />
          </CardContent>
        </Card>

        {/* Metric Cards */}
        <div className="portal-metric-grid xl:grid-cols-3">
          <div className="portal-metric-card">
            <p className="portal-metric-label">Mapped Bureau</p>
            <p className="portal-metric-value">{profile.bureauName}</p>
            <p className="portal-metric-copy">
              Source country: {profile.homeCountryName}. Last synced{" "}
              {formatDate(profile.lastUpdatedAt)}.
            </p>
          </div>
          <div className="portal-metric-card">
            <p className="portal-metric-label">Foreign Score</p>
            <p className="portal-metric-value">
              {profile.foreignScore}/{profile.foreignScoreMax}
            </p>
            <p className="portal-metric-copy">
              Original bureau score normalized into a US-readable view.
            </p>
          </div>
          <div className="portal-metric-card">
            <p className="portal-metric-label">Risk Tier</p>
            <div className="mt-3">
              <RiskTierBadge riskTier={profile.riskTier} />
            </div>
            <p className="portal-metric-copy mt-4">
              Equivalent to a {profile.riskTier} US credit positioning signal for lenders.
            </p>
          </div>
        </div>

        {/* Score Breakdown and Risk Flags */}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-white">Score Breakdown</CardTitle>
                  <p className="text-xs text-slate-300/70">How each factor contributes to your translated score</p>
                </div>
                <div className="portal-pill-note">
                  <TrendingUp className="size-3.5 text-cyan-200" />
                  5 factors
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScoreBreakdownChart data={profile.scoreBreakdown} />
              <div className="mt-4 grid grid-cols-5 gap-2">
                {breakdownItems.map((item) => (
                  <div key={item.key} className="text-center">
                    <p className="text-lg font-bold text-white">{item.value}%</p>
                    <p className="text-[0.65rem] leading-tight text-slate-400/80">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-white">Risk Flags</CardTitle>
                <p className="text-xs text-slate-300/70">Items lenders may consider during review</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.flags.map((flag) => {
                const detail = FLAG_DETAILS[flag];
                const isWarning = detail?.severity === "warning";

                return (
                  <div
                    key={flag}
                    className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${
                        isWarning
                          ? "border border-amber-400/30 bg-amber-500/15"
                          : "border border-cyan-300/25 bg-cyan-400/10"
                      }`}>
                        {isWarning ? (
                          <AlertTriangle className="size-3.5 text-amber-300" />
                        ) : (
                          <ShieldCheck className="size-3.5 text-cyan-300" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="secondary"
                              className={isWarning ? "portal-status-warning" : "portal-status-info"}
                            >
                              {flag}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-72">
                            <p className="text-xs">
                              {detail?.description ?? "This flag helps lenders add context while making decisions."}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <p className="text-xs leading-relaxed text-slate-400/80">
                          {detail?.description ?? "This flag helps lenders add context while making decisions."}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {profile.flags.length === 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/8 p-4">
                  <CheckCircle2 className="size-5 text-emerald-300" />
                  <div>
                    <p className="text-sm font-medium text-white">No risk flags detected</p>
                    <p className="text-xs text-slate-400/80">Your profile is clear of any flagged items.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendation */}
        {profile.recommendation && (
          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/10">
                <Sparkles className="size-5 text-cyan-200" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">CreditBridge Recommendation</p>
                <p className="text-sm leading-relaxed text-slate-300/85">{profile.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="portal-action-grid sm:grid-cols-3">
          <Button
            variant="outline"
            className="portal-action-btn portal-action-btn-tertiary"
            onClick={() => setShareDialogOpen(true)}
          >
            <Send data-icon="inline-start" />
            <span className="portal-action-copy">
              <span className="portal-action-label">Share report</span>
              <span className="portal-action-note">Open lender-share controls</span>
            </span>
          </Button>
          <Button
            variant="outline"
            className="portal-action-btn portal-action-btn-tertiary"
            onClick={handleDownloadReport}
            disabled={downloadingReport}
          >
            <Download data-icon="inline-start" />
            <span className="portal-action-copy">
              <span className="portal-action-label">
                {downloadingReport ? "Preparing report" : "Download report"}
              </span>
              <span className="portal-action-note">Export this summary as HTML</span>
            </span>
          </Button>
          <Button
            asChild
            variant="outline"
            className="portal-action-btn portal-action-btn-tertiary"
          >
            <Link href="/dashboard/documents">
              <FileUp data-icon="inline-start" />
              <span className="portal-action-copy">
                <span className="portal-action-label">Upload document</span>
                <span className="portal-action-note">Add another bureau file</span>
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="portal-share-dialog sm:max-w-xl">
          <DialogHeader>
            <div className="portal-share-badge">
              <Sparkles className="size-4" />
              Lender-ready share flow
            </div>
            <DialogTitle className="portal-share-title">Share your translated report</DialogTitle>
            <DialogDescription className="portal-copy">
              Use the secure link below to send your lender directly to the same translated
              summary you see here, or open your device share sheet for faster delivery.
            </DialogDescription>
          </DialogHeader>

          <div className="portal-share-shell">
            <p className="portal-kicker">Secure report link</p>
            <Input readOnly value={getShareUrl()} className="portal-share-input mt-3" />
            <div className="portal-share-meta">
              <span>Covers your translated score, report summary, and bureau context.</span>
              <span>Last synced {formatDate(profile.lastUpdatedAt)}</span>
            </div>
          </div>

          <div className="portal-action-grid sm:grid-cols-2">
            <Button
              className="portal-action-btn portal-action-btn-primary"
              onClick={handleCopyShareLink}
            >
              <Copy data-icon="inline-start" />
              <span className="portal-action-copy">
                <span className="portal-action-label">Copy share link</span>
                <span className="portal-action-note">Paste it into email or chat</span>
              </span>
            </Button>
            <Button
              variant="outline"
              className="portal-action-btn portal-action-btn-secondary"
              onClick={handleShareReport}
              disabled={sharingReport}
            >
              <ArrowUpRight data-icon="inline-start" />
              <span className="portal-action-copy">
                <span className="portal-action-label">
                  {sharingReport ? "Opening share sheet" : "Share now"}
                </span>
                <span className="portal-action-note">Use native share when supported</span>
              </span>
            </Button>
          </div>

          <DialogFooter className="portal-share-footer">
            <Button
              variant="outline"
              className="portal-action-btn portal-action-btn-secondary"
              onClick={openReportPreview}
            >
              <ArrowUpRight data-icon="inline-start" />
              <span className="portal-action-copy">
                <span className="portal-action-label">Preview shared report</span>
                <span className="portal-action-note">Open the report in a new tab</span>
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
