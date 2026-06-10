"use client";

import { useMounted } from "@/hooks/use-mounted";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MonthlyTrendData } from "@/types";
import { formatCurrency } from "@/utils/format";

interface MonthlyBarChartProps {
  data: MonthlyTrendData[];
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded h-full w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-sm text-primary">
                    {formatCurrency(payload[0].value as number)}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar
          dataKey="amount"
          fill="var(--color-primary)"
          radius={[6, 6, 0, 0]}
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
