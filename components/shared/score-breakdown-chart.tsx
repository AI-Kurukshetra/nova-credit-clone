"use client";

import { useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";

import type { ScoreBreakdown } from "@/lib/types";

const COLOR_BY_KEY: Record<string, string> = {
  paymentHistory: "#34d399",
  creditUtilization: "#6366f1",
  creditAge: "#fde68a",
  accountMix: "#818cf8",
  newCredit: "#94a3b8",
};

interface ScoreBreakdownChartProps {
  data: ScoreBreakdown;
}

export function ScoreBreakdownChart({ data }: ScoreBreakdownChartProps): React.JSX.Element {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = [
    { key: "paymentHistory", label: "Payment History", value: data.paymentHistory },
    {
      key: "creditUtilization",
      label: "Credit Utilization",
      value: data.creditUtilization,
    },
    { key: "creditAge", label: "Credit Age", value: data.creditAge },
    { key: "accountMix", label: "Account Mix", value: data.accountMix },
    { key: "newCredit", label: "New Credit", value: data.newCredit },
  ];

  if (!mounted) {
    return <Skeleton className="h-64 w-full bg-slate-100" />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" margin={{ left: 6, right: 32 }}>
          <CartesianGrid
            horizontal={false}
            stroke="rgba(226,232,240,0.6)"
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickCount={6}
            stroke="rgba(148,163,184,0.5)"
            tick={{ fill: "rgb(71,85,105)", fontSize: 11 }}
            axisLine={false}
          />
          <YAxis
            dataKey="label"
            type="category"
            width={120}
            stroke="transparent"
            tick={{ fill: "rgb(30,41,59)", fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(99,102,241,0.06)", radius: 8 }}
            formatter={(value) => [`${value}%`, "Score"]}
            contentStyle={{
              background: "rgba(255,255,255,0.98)",
              border: "1px solid rgba(226,232,240,0.8)",
              borderRadius: "12px",
              color: "#1e293b",
              fontSize: "13px",
              boxShadow: "0 16px 40px -20px rgba(0,0,0,0.1)",
            }}
            labelStyle={{ color: "rgb(71,85,105)", fontWeight: 600 }}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={20}>
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value) => `${String(value ?? 0)}%`}
              fill="rgb(30,41,59)"
              style={{ fontSize: 12, fontWeight: 600 }}
            />
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={COLOR_BY_KEY[entry.key]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
