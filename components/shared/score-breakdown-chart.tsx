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
  creditUtilization: "#67e8f9",
  creditAge: "#fde68a",
  accountMix: "#7dd3fc",
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
    return <Skeleton className="h-64 w-full bg-white/10" />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" margin={{ left: 6, right: 32 }}>
          <CartesianGrid
            horizontal={false}
            stroke="rgba(191,219,254,0.08)"
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickCount={6}
            stroke="rgba(191,219,254,0.5)"
            tick={{ fill: "rgba(224,242,254,0.7)", fontSize: 11 }}
            axisLine={false}
          />
          <YAxis
            dataKey="label"
            type="category"
            width={120}
            stroke="transparent"
            tick={{ fill: "rgba(240,249,255,0.88)", fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(34,211,238,0.06)", radius: 8 }}
            formatter={(value) => [`${value}%`, "Score"]}
            contentStyle={{
              background: "rgba(3,11,27,0.96)",
              border: "1px solid rgba(186,230,253,0.2)",
              borderRadius: "12px",
              color: "#f8fafc",
              fontSize: "13px",
              boxShadow: "0 16px 40px -20px rgba(0,0,0,0.5)",
            }}
            labelStyle={{ color: "rgba(186,230,253,0.8)", fontWeight: 600 }}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={20}>
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value) => `${String(value ?? 0)}%`}
              fill="rgba(248,250,252,0.9)"
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
