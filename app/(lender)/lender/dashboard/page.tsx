import {
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";

import dynamic from "next/dynamic";

import { ApplicationStatusBadge, RiskTierBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

const ApiUsageChart = dynamic(() => import("@/components/shared/api-usage-chart").then((m) => m.ApiUsageChart), {
  loading: () => (
    <div className="flex h-72 w-full items-end justify-around gap-3 px-6 pb-8 pt-4">
      {[45, 70, 55, 80, 60, 75, 50].map((h, i) => (
        <Skeleton key={i} className="w-10 rounded-t-lg bg-slate-100" style={{ height: `${h}%` }} />
      ))}
    </div>
  ),
});
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_SUBTEXT } from "@/lib/constants";
import { DEMO_APPLICATIONS, DEMO_API_USAGE, DEMO_LENDERS } from "@/lib/demo-data";
import { formatDate } from "@/lib/format";

const METRIC_ICONS = [Activity, TrendingUp, Clock, CheckCircle2];

export default function LenderOverviewPage() {
  const lender = DEMO_LENDERS[0];
  const applications = DEMO_APPLICATIONS.filter(
    (application) => application.lenderId === lender.id,
  ).slice(0, 10);

  const metrics = [
    {
      label: "Total Applications",
      value: String(applications.length),
      copy: "Live queue coverage across imported consumer profiles.",
    },
    {
      label: "Approval Rate",
      value: `${lender.approvalRate}%`,
      copy: "Current acceptance velocity from the demo lender book.",
    },
    {
      label: "Avg Decision Time",
      value: `${lender.avgDecisionHours}h`,
      copy: "Median review cycle from submission to lender outcome.",
    },
    {
      label: "API Calls / Month",
      value: String(lender.apiCallsThisMonth),
      copy: "Usage trend for programmatic credit profile lookups.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="portal-page-intro">
        <div className="portal-page-intro-row">
          <div className="space-y-3">
            <p className="portal-kicker">Lender Overview</p>
            <h2 className="portal-subtitle">Decision intelligence at a glance</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
          <div className="portal-page-actions">
            <div className="portal-pill-note">Portfolio synced across API and manual reviews</div>
          </div>
        </div>
      </section>

      <div className="portal-metric-grid md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = METRIC_ICONS[index];
          return (
            <div key={metric.label} className="portal-metric-card">
              <div className="flex items-center justify-between">
                <p className="portal-metric-label">{metric.label}</p>
                <div className="flex size-8 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50">
                  <Icon className="size-4 text-indigo-500" />
                </div>
              </div>
              <p className="portal-metric-value mt-2">{metric.value}</p>
              <p className="portal-metric-copy mt-1">{metric.copy}</p>
            </div>
          );
        })}
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Recent Applications</TabsTrigger>
          <TabsTrigger value="api-usage">API Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-slate-900">Recent Applications</CardTitle>
                  <p className="text-xs text-slate-500">{applications.length} applications in queue</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consumer</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Risk Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application, index) => (
                    <TableRow key={application.id} className={index % 2 === 0 ? "bg-slate-50" : undefined}>
                      <TableCell className="font-medium">{application.consumerNameMasked}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span className="inline-flex size-5 items-center justify-center rounded bg-slate-50 text-[0.6rem] font-bold uppercase">
                            {application.countryCode}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900">{application.score}</span>
                      </TableCell>
                      <TableCell>
                        <RiskTierBadge riskTier={application.riskTier} />
                      </TableCell>
                      <TableCell>
                        <ApplicationStatusBadge status={application.status} />
                      </TableCell>
                      <TableCell className="text-slate-500">{formatDate(application.submittedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-usage">
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-slate-900">API Usage (Last 30 Days)</CardTitle>
                <p className="text-xs text-slate-500">Programmatic credit profile lookup volume</p>
              </div>
            </CardHeader>
            <CardContent>
              <ApiUsageChart data={DEMO_API_USAGE} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
