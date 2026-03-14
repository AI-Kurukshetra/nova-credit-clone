"use client";

import Link from "next/link";

import { Briefcase, Eye } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_SUBTEXT } from "@/lib/constants";
import { DEMO_APPLICATIONS, DEMO_IDS } from "@/lib/demo-data";
import { formatDate } from "@/lib/format";

export default function ConsumerApplicationsPage() {
  const applications = DEMO_APPLICATIONS.filter(
    (application) => application.profileId === DEMO_IDS.profiles.priya,
  );

  if (!applications.length) {
    return (
      <EmptyState
        title="No applications yet"
        description="Share your score with a lender to get started."
        icon={Briefcase}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="portal-page-intro">
        <div className="portal-page-intro-row">
          <div className="space-y-3">
            <p className="portal-kicker">Application Tracker</p>
            <h2 className="portal-subtitle">Where your profile is under review</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
          <div className="portal-page-actions">
            <div className="portal-pill-note">
              <Briefcase className="size-4 text-indigo-500" />
              {applications.length} active application{applications.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </section>

      <div className="portal-table-shell">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application, index) => (
              <TableRow
                key={application.id}
                className={index % 2 === 0 ? "bg-slate-50" : undefined}
              >
                <TableCell className="font-medium">{application.lenderName}</TableCell>
                <TableCell>
                  <ApplicationStatusBadge status={application.status} />
                </TableCell>
                <TableCell className="text-slate-600">{formatDate(application.submittedAt)}</TableCell>
                <TableCell className="text-slate-600">
                  {application.decisionAt ? formatDate(application.decisionAt) : (
                    <span className="text-xs italic text-slate-500">Pending</span>
                  )}
                </TableCell>
                <TableCell>
                  {application.lenderNotes ? (
                    <span className="text-xs text-slate-500">{application.lenderNotes}</span>
                  ) : (
                    <span className="text-xs italic text-slate-500">No notes</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/lender/dashboard/applications?applicationId=${application.id}`}>
                      <Eye className="size-3.5" />
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
