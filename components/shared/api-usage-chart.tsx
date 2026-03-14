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
    return <Skeleton className="h-72 w-full bg-white/10" />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(191,219,254,0.1)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" stroke="rgba(191,219,254,0.5)" tick={{ fill: "rgba(224,242,254,0.8)", fontSize: 11 }} />
          <YAxis stroke="rgba(191,219,254,0.5)" tick={{ fill: "rgba(224,242,254,0.8)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "rgba(3,11,27,0.96)",
              border: "1px solid rgba(186,230,253,0.16)",
              borderRadius: "14px",
              color: "#f8fafc",
            }}
            labelStyle={{ color: "rgba(186,230,253,0.8)" }}
          />
          <Bar dataKey="calls" fill="#67e8f9" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
