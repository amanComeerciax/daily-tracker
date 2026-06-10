"use client";

import { useMounted } from "@/hooks/use-mounted";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { ExpenseGrowthData } from "@/types";
import { formatCurrency } from "@/utils/format";

interface ExpenseLineChartProps {
  data: ExpenseGrowthData[];
}

export function ExpenseLineChart({ data }: ExpenseLineChartProps) {
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
      <AreaChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        <defs>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
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
        <Area
          type="monotone"
          dataKey="amount"
          stroke="var(--color-primary)"
          strokeWidth={3}
          fill="url(#expenseGradient)"
          animationDuration={1200}
          dot={{ r: 4, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
