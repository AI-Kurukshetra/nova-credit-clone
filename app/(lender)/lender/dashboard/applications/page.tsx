"use client";

import { useMemo, useState } from "react";

import { CalendarDays, Search } from "lucide-react";
import { toast } from "sonner";

import { CreditTimeline } from "@/components/shared/credit-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { ScoreBreakdownChart } from "@/components/shared/score-breakdown-chart";
import {
  ApplicationStatusBadge,
  RiskTierBadge,
} from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { APP_SUBTEXT } from "@/lib/constants";
import { DEMO_APPLICATIONS, DEMO_CONSUMERS } from "@/lib/demo-data";
import { formatDate } from "@/lib/format";
import type { ApplicationStatus, LenderApplicationRow } from "@/lib/types";

export default function LenderApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedApp, setSelectedApp] = useState<LenderApplicationRow | null>(null);
  const [lenderNotes, setLenderNotes] = useState("");

  const applications = DEMO_APPLICATIONS.filter(
    (application) => application.lenderId === "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
  );

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesStatus = statusFilter === "All" || application.status === statusFilter;
      const matchesCountry = countryFilter === "All" || application.countryCode === countryFilter;
      const matchesRisk = riskFilter === "All" || application.riskTier === riskFilter.toLowerCase();

      const submittedDate = new Date(application.submittedAt);
      const matchesFrom = !dateFrom || submittedDate >= new Date(`${dateFrom}T00:00:00`);
      const matchesTo = !dateTo || submittedDate <= new Date(`${dateTo}T23:59:59`);

      return matchesStatus && matchesCountry && matchesRisk && matchesFrom && matchesTo;
    });
  }, [applications, statusFilter, countryFilter, riskFilter, dateFrom, dateTo]);

  function openDetail(application: LenderApplicationRow) {
    setSelectedApp(application);
    setLenderNotes(application.lenderNotes ?? "");
  }

  function updateDecision(status: ApplicationStatus) {
    if (!selectedApp) {
      return;
    }
    setSelectedApp({
      ...selectedApp,
      status,
      lenderNotes,
      decisionAt: new Date().toISOString(),
    });
    toast.success("Decision recorded and lender notified");
  }

  const selectedConsumer = selectedApp
    ? DEMO_CONSUMERS.find((consumer) => consumer.profile.id === selectedApp.profileId)
    : null;

  if (!applications.length) {
    return (
      <EmptyState
        title="No applications yet"
        description="Consumers will appear here after sharing."
        icon={Search}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="portal-page-intro">
        <div className="portal-page-intro-row">
          <div className="space-y-3">
            <p className="portal-kicker">Application Queue</p>
            <h2 className="portal-subtitle">Review cross-border applicants with context</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "All")}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {["All", "submitted", "under_review", "approved", "denied"].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Country</Label>
            <Select value={countryFilter} onValueChange={(value) => setCountryFilter(value ?? "All")}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {["All", "GB", "CA", "AU", "IN", "MX"].map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Risk Tier</Label>
            <Select value={riskFilter} onValueChange={(value) => setRiskFilter(value ?? "All")}>
              <SelectTrigger>
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {["All", "Excellent", "Good", "Fair", "Poor"].map((risk) => (
                    <SelectItem key={risk} value={risk}>
                      {risk}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date-from">Date from</Label>
            <Input id="date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date-to">Date to</Label>
            <Input id="date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="portal-table-shell">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Consumer</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Risk Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Quick Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((application, index) => (
              <TableRow key={application.id} className={index % 2 === 0 ? "bg-white/3" : undefined}>
                <TableCell>{application.consumerNameMasked}</TableCell>
                <TableCell>{application.countryCode}</TableCell>
                <TableCell>{application.score}</TableCell>
                <TableCell>
                  <RiskTierBadge riskTier={application.riskTier} />
                </TableCell>
                <TableCell>
                  <ApplicationStatusBadge status={application.status} />
                </TableCell>
                <TableCell>{formatDate(application.submittedAt)}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => openDetail(application)}>
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={Boolean(selectedApp)} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>Application detail</SheetTitle>
            <SheetDescription>
              {selectedApp?.consumerNameMasked} | {selectedApp?.countryCode}
            </SheetDescription>
          </SheetHeader>

          {selectedApp && selectedConsumer ? (
            <div className="mt-6 grid gap-6">
              <Card>
                <CardContent className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-300/80">CreditBridge score</p>
                    <p className="text-4xl font-semibold">{selectedConsumer.profile.translatedScore}</p>
                    <RiskTierBadge riskTier={selectedConsumer.profile.riskTier} />
                    <Badge className="portal-status-info w-fit">
                      AI Recommendation: {selectedConsumer.profile.recommendation}
                    </Badge>
                  </div>
                  <ScoreGauge score={selectedConsumer.profile.translatedScore} className="h-36 w-64" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreBreakdownChart data={selectedConsumer.profile.scoreBreakdown} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Flags</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {selectedConsumer.profile.flags.map((flag) => (
                    <Badge key={flag} className="portal-status-warning">
                      {flag}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              <CreditTimeline entries={selectedConsumer.timeline} />

              <Card>
                <CardHeader>
                  <CardTitle>Lender Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={lenderNotes}
                    onChange={(event) => setLenderNotes(event.target.value)}
                    placeholder="Add underwriting notes"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => updateDecision("approved")}>
                      Approve
                    </Button>
                    <Button variant="destructive" onClick={() => updateDecision("denied")}>
                      Deny
                    </Button>
                    <Button variant="outline" onClick={() => updateDecision("more_info_requested")}>
                      Request More Info
                    </Button>
                    <Button variant="ghost" className="ml-auto">
                      <CalendarDays data-icon="inline-start" />
                      Updated {selectedApp.decisionAt ? formatDate(selectedApp.decisionAt) : "-"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}


