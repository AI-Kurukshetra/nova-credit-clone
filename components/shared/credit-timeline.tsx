import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { TimelineEntry } from "@/lib/types";

const statusClass: Record<TimelineEntry["status"], string> = {
  Active: "portal-status-positive",
  Closed: "portal-status-neutral",
  Delinquent: "portal-status-danger",
};

const paymentLabel: Record<string, string> = {
  on_time: "On time",
  late: "Late",
  missed: "Missed",
};

export function CreditTimeline({ entries }: { entries: TimelineEntry[] }): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-white">
            Your International Credit History
          </CardTitle>
          <p className="text-xs text-slate-300/70">
            {entries.length} accounts translated from your home bureau
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="relative rounded-xl border border-white/8 bg-white/[0.02] p-4 pl-7 transition-colors hover:bg-white/[0.04]"
          >
            <span className="absolute left-3 top-5 size-2.5 rounded-full bg-cyan-300/60 shadow-[0_0_12px_rgba(103,232,249,0.35)]" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">{entry.accountType}</p>
                <p className="text-xs text-slate-300/70">{entry.institution}</p>
              </div>
              <Badge className={statusClass[entry.status]}>{entry.status}</Badge>
            </div>
            <div className="mt-3 grid gap-3 text-xs text-slate-300/80 sm:grid-cols-4">
              <div className="space-y-0.5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400/60">Opened</p>
                <p className="font-medium text-slate-50">{formatDate(entry.openedDate)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400/60">Closed</p>
                <p className="font-medium text-slate-50">
                  {entry.closedDate ? formatDate(entry.closedDate) : "Active"}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400/60">Limit</p>
                <p className="font-medium text-slate-50">{formatCurrency(entry.creditLimit)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400/60">Balance</p>
                <p className="font-medium text-slate-50">{formatCurrency(entry.balance)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {entry.paymentHistory.map((payment, index) => (
                <Dot key={`${entry.id}-${index}`} type={payment} />
              ))}
              <span className="ml-2 text-[0.65rem] text-slate-400/60">
                {entry.paymentHistory.filter((p) => p === "on_time").length}/{entry.paymentHistory.length} on-time
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Dot({ type }: { type: string }) {
  const cls =
    type === "on_time"
      ? "size-2.5 rounded-full bg-emerald-400/80"
      : type === "late"
        ? "size-2.5 rounded-full bg-amber-400/80"
        : "size-2.5 rounded-full bg-rose-400/80";

  return (
    <span title={paymentLabel[type] ?? type} className={cls} />
  );
}
