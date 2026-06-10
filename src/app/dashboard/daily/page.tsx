"use client";

import { useState, useEffect } from "react";
import { getExpensesByDate } from "@/actions/expense.actions";
import { DailyExpenseGroup } from "@/types";
import { EXPENSE_CATEGORIES } from "@/utils/constants";
import { formatCurrency, formatDate, formatDateForInput } from "@/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Calendar, Receipt } from "lucide-react";

export default function DailyPage() {
  const [groups, setGroups] = useState<DailyExpenseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    formatDateForInput(new Date()).slice(0, 7)
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getExpensesByDate(`${selectedMonth}-01`);
      if (result.success && result.data) {
        setGroups(result.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedMonth]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily View"
        description="Expenses grouped by day"
        action={
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-48"
          />
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No expenses this month"
          description="Start tracking your daily expenses"
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.date} className="animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {formatDate(group.date)}
                  </CardTitle>
                  <span className="text-sm font-bold text-rose-500">
                    Total: {formatCurrency(group.total)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {group.expenses.map((expense) => {
                    const cat = EXPENSE_CATEGORIES.find(
                      (c) => c.value === expense.category
                    );
                    return (
                      <div
                        key={expense._id}
                        className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{cat?.icon || "📦"}</span>
                          <div>
                            <p className="text-sm font-medium">
                              {expense.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {expense.category}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
