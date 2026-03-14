"use client";

import { useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";

interface ApiUsageChartProps {
  data: Array<{ day: string; calls: number }>;
}

export function ApiUsageChart({ data }: ApiUsageChartProps): React.JSX.Element {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="h-72 w-full bg-slate-100" />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(226,232,240,0.6)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" stroke="rgba(148,163,184,0.5)" tick={{ fill: "rgb(71,85,105)", fontSize: 11 }} />
          <YAxis stroke="rgba(148,163,184,0.5)" tick={{ fill: "rgb(71,85,105)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "rgba(255,255,255,0.98)",
              border: "1px solid rgba(226,232,240,0.8)",
              borderRadius: "14px",
              color: "#1e293b",
            }}
            labelStyle={{ color: "rgb(71,85,105)" }}
          />
          <Bar dataKey="calls" fill="#6366f1" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
