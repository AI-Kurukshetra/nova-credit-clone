"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";

const CreditTimeline = dynamic(() => import("@/components/shared/credit-timeline").then((m) => m.CreditTimeline), {
  loading: () => (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="space-y-2">
        <Skeleton className="h-5 w-64 rounded bg-slate-100" />
        <Skeleton className="h-3 w-40 rounded bg-slate-100" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 pl-7">
          <Skeleton className="absolute left-3 top-5 size-2.5 rounded-full bg-indigo-200" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32 rounded bg-slate-100" />
            <Skeleton className="h-5 w-16 rounded-full bg-slate-100" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-1">
                <Skeleton className="h-2.5 w-12 rounded bg-slate-100" />
                <Skeleton className="h-3.5 w-16 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  ssr: false,
});

const ScoreGauge = dynamic(() => import("@/components/shared/score-gauge").then((m) => m.ScoreGauge), {
  loading: () => (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="h-[156px] w-[240px] rounded-[50%_50%_0_0] bg-slate-100" />
      <Skeleton className="h-6 w-20 rounded-full bg-slate-100" />
    </div>
  ),
  ssr: false,
});
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  buildConsumerReportHtml,
  getConsumerReportFilename,
} from "@/lib/consumer-report";
import { APP_SUBTEXT } from "@/lib/constants";
import { DEMO_CONSUMERS } from "@/lib/demo-data";
import { formatDate } from "@/lib/format";

export default function ConsumerReportPage() {
  const consumer = DEMO_CONSUMERS[0];
  const profile = consumer.profile;
  const [downloadingReport, setDownloadingReport] = useState(false);

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

  return (
    <div className="space-y-6">
      <section className="portal-page-intro">
        <div className="portal-page-intro-row">
          <div className="space-y-3">
            <p className="portal-kicker">Credit Report</p>
            <h2 className="portal-subtitle">See the full translated bureau narrative</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
        </div>
      </section>

      <Card className="portal-hero-banner">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-lg font-bold text-slate-900">
                Your International Credit History
              </CardTitle>
              <Badge variant="secondary" className="portal-status-info">
                {profile.homeCountryName} - {profile.bureauName}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              Review translated records from your home credit bureau. This report contains{" "}
              <span className="font-medium text-slate-900">{consumer.timeline.length} accounts</span> translated
              from {profile.bureauName}.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <FileText className="size-3.5" />
                Score: {profile.translatedScore}
              </span>
              <span className="size-1 rounded-full bg-slate-500/50" />
              <span>Risk tier: {profile.riskTier}</span>
              <span className="size-1 rounded-full bg-slate-500/50" />
              <span>Last updated: {formatDate(profile.lastUpdatedAt)}</span>
            </div>
            <Button
              onClick={handleDownloadReport}
              disabled={downloadingReport}
              className="portal-action-btn portal-action-btn-primary"
            >
              <Download data-icon="inline-start" />
              <span className="portal-action-copy">
                <span className="portal-action-label">
                  {downloadingReport ? "Preparing report" : "Download report"}
                </span>
                <span className="portal-action-note">Export the full translated narrative</span>
              </span>
            </Button>
          </div>
          <ScoreGauge score={profile.translatedScore} />
        </CardContent>
      </Card>

      <CreditTimeline entries={consumer.timeline} />
    </div>
  );
}
