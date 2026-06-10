"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import {
  Receipt,
  CalendarDays,
  TrendingUp,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { DashboardSummary } from "@/types";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

const cards = [
  {
    key: "todayExpenses" as const,
    label: "Today's Expenses",
    icon: Receipt,
    colorClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
  },
  {
    key: "monthlyExpenses" as const,
    label: "Monthly Expenses",
    icon: CalendarDays,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
  },
  {
    key: "totalIncome" as const,
    label: "Total Income",
    icon: TrendingUp,
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
  },
  {
    key: "totalSavings" as const,
    label: "Savings",
    icon: PiggyBank,
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
  },
  {
    key: "remainingBudget" as const,
    label: "Budget Left",
    icon: Wallet,
    colorClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
  },
];

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <Card
          key={card.key}
          className="hover:shadow-md transition-shadow animate-fade-in opacity-0"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationFillMode: "forwards",
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card.label}
              </span>
              <div
                className={`rounded-lg p-2 ${card.bgClass}`}
              >
                <card.icon className={`h-4 w-4 ${card.colorClass}`} />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(summary[card.key])}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
