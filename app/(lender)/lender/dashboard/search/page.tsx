"use client";

import { useMemo, useState } from "react";

import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { RiskTierBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_SUBTEXT } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_CONSUMERS } from "@/lib/demo-data";
import { maskConsumerName } from "@/lib/format";

export default function LenderSearchPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return DEMO_CONSUMERS.filter(
      (consumer) =>
        consumer.email.toLowerCase().includes(query.toLowerCase()) ||
        consumer.profile.id.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <section className="portal-page-intro">
        <div className="portal-page-intro-row">
          <div className="space-y-3">
            <p className="portal-kicker">Consumer Search</p>
            <h2 className="portal-subtitle">Find lender-shareable profiles instantly</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Search Consumers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by consumer email or CreditBridge profile ID"
              className="pl-10"
            />
          </div>

          <div className="portal-table-shell">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risk Tier</TableHead>
                  <TableHead>Profile Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length ? (
                  results.map((consumer, index) => (
                    <TableRow
                      key={consumer.id}
                      className={index % 2 === 0 ? "bg-slate-50" : undefined}
                    >
                      <TableCell>{maskConsumerName(consumer.fullName)}</TableCell>
                      <TableCell>{consumer.profile.homeCountryCode}</TableCell>
                      <TableCell>{consumer.profile.translatedScore}</TableCell>
                      <TableCell>
                        <RiskTierBadge riskTier={consumer.profile.riskTier} />
                      </TableCell>
                      <TableCell>{consumer.profile.status}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() =>
                            toast.success(
                              `Application submitted to review queue for profile ${consumer.profile.id}`,
                            )
                          }
                        >
                          <Plus data-icon="inline-start" />
                          Add to Review Queue
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-slate-500">
                      Search for a consumer to view results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
