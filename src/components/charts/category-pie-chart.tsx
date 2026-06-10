"use client";

import { useMounted } from "@/hooks/use-mounted";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CategoryChartData } from "@/types";
import { formatCurrency } from "@/utils/format";

interface CategoryPieChartProps {
  data: CategoryChartData[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-full h-48 w-48" />
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
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0];
              return (
                <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.value as number)}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string) => (
            <span className="text-xs text-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
