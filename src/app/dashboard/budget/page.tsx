"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema, type BudgetInput } from "@/lib/validations";
import { setBudget, getBudgetStatus } from "@/actions/budget.actions";
import { getMonthlyIncome } from "@/actions/income.actions";
import { getMonthlyExpenses } from "@/actions/expense.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BudgetStatus } from "@/types";
import { formatCurrency, formatPercentage } from "@/utils/format";
import { MONTH_NAMES } from "@/utils/constants";
import {
  PiggyBank,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function BudgetPage() {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [statusResult, incomeResult, expenseResult] = await Promise.all([
        getBudgetStatus(),
        getMonthlyIncome(),
        getMonthlyExpenses(),
      ]);

      if (statusResult.success && statusResult.data) {
        setBudgetStatus(statusResult.data);
        if (statusResult.data.budget > 0) {
          setValue("monthlyBudget", statusResult.data.budget);
        }
      }
      if (incomeResult.success) setMonthlyIncome(incomeResult.data ?? 0);
      if (expenseResult.success) setMonthlyExpenses(expenseResult.data ?? 0);

      setLoading(false);
    };
    fetchData();
  }, [setValue]);

  const onSubmit = async (data: BudgetInput) => {
    setSaving(true);
    setSuccessMsg("");
    const result = await setBudget(data);
    setSaving(false);

    if (result.success) {
      setSuccessMsg("Budget updated successfully!");
      // Refresh status
      const statusResult = await getBudgetStatus();
      if (statusResult.success && statusResult.data) {
        setBudgetStatus(statusResult.data);
      }
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const savings = monthlyIncome - monthlyExpenses;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget & Savings"
        description={`${MONTH_NAMES[currentMonth - 1]} ${currentYear}`}
      />

      {/* Budget Status Alert */}
      {budgetStatus?.isExceeded && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-4 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">
              Budget Limit Reached!
            </p>
            <p className="text-sm text-red-600 dark:text-red-400/80">
              You&apos;ve exceeded your monthly budget by{" "}
              {formatCurrency(
                (budgetStatus?.spent ?? 0) - (budgetStatus?.budget ?? 0)
              )}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Set Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              Set Monthly Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyBudget">Budget Amount (₹)</Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  placeholder="Enter your monthly budget"
                  {...register("monthlyBudget", { valueAsNumber: true })}
                />
                {errors.monthlyBudget && (
                  <p className="text-xs text-red-500">
                    {errors.monthlyBudget.message}
                  </p>
                )}
              </div>
              {successMsg && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  {successMsg}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Budget
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {budgetStatus && budgetStatus.budget > 0 ? (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {formatCurrency(budgetStatus.spent)} spent
                    </span>
                    <span className="font-medium">
                      {formatPercentage(budgetStatus.percentage)}
                    </span>
                  </div>
                  <Progress
                    value={budgetStatus.spent}
                    max={budgetStatus.budget}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Budget</p>
                    <p className="font-bold text-sm">
                      {formatCurrency(budgetStatus.budget)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Spent</p>
                    <p className="font-bold text-sm text-rose-500">
                      {formatCurrency(budgetStatus.spent)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Left</p>
                    <p className="font-bold text-sm text-emerald-500">
                      {formatCurrency(budgetStatus.remaining)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Set a budget to see your progress
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Savings Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Savings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(monthlyIncome)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-rose-500/10 p-3">
                <TrendingDown className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(monthlyExpenses)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <PiggyBank className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Savings</p>
                <p
                  className={`text-xl font-bold ${
                    savings >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(savings)}
                </p>
              </div>
            </div>
          </div>
          {savings < 0 && (
            <div className="mt-4">
              <Badge variant="warning">
                You&apos;re spending more than you earn this month
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
