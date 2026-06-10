"use client";

import { IExpense } from "@/types";
import { formatCurrency, formatRelativeDate } from "@/utils/format";
import { EXPENSE_CATEGORIES } from "@/utils/constants";
import { Receipt } from "lucide-react";

interface RecentTransactionsProps {
  transactions: IExpense[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Receipt className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No recent transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const cat = EXPENSE_CATEGORIES.find((c) => c.value === tx.category);
        return (
          <div
            key={tx._id}
            className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
              {cat?.icon || "📦"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.description}</p>
              <p className="text-xs text-muted-foreground">
                {tx.category} · {formatRelativeDate(tx.date)}
              </p>
            </div>
            <span className="text-sm font-semibold text-rose-500">
              -{formatCurrency(tx.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
