import { getDashboardSummary, getRecentTransactions, getExpenseGrowth } from "@/actions/dashboard.actions";
import { getExpensesByCategory } from "@/actions/expense.actions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { QuickExpense } from "@/components/dashboard/quick-expense";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { ExpenseLineChart } from "@/components/charts/expense-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsDialog } from "@/components/dashboard/settings-dialog";
import { getUserCycleStartDate } from "@/actions/user.actions";
import { DashboardSummary, IExpense, CategoryChartData, ExpenseGrowthData } from "@/types";
import { PieChartIcon, LineChartIcon, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const [
    summaryResult, 
    transactionsResult,
    categoryResult,
    growthResult,
    cycleStartDate
  ] = await Promise.all([
    getDashboardSummary(),
    getRecentTransactions(),
    getExpensesByCategory(),
    getExpenseGrowth(),
    getUserCycleStartDate(),
  ]);

  const summary: DashboardSummary = summaryResult.data || {
    todayExpenses: 0,
    monthlyExpenses: 0,
    totalIncome: 0,
    totalSavings: 0,
    remainingBudget: 0,
    monthlyBudget: 0,
  };

  const transactions: IExpense[] = transactionsResult.data || [];
  const categoryData: CategoryChartData[] = categoryResult.data || [];
  const growthData: ExpenseGrowthData[] = growthResult.data || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Page Header */}
      <div className="lg:col-span-3 order-1 space-y-4">
        <PageHeader
          title="Dashboard"
          description="Overview of your financial activity"
          action={<SettingsDialog currentCycleStart={cycleStartDate || 1} />}
        />
        
        {summary.isExceeded && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-800 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 animate-fade-in shadow-sm">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <span className="font-semibold">Budget Exceeded:</span> You have spent ₹{summary.monthlyExpenses.toLocaleString('en-IN')} out of your ₹{summary.monthlyBudget.toLocaleString('en-IN')} budget.
            </div>
          </div>
        )}
        
        {summary.isWarning && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-3 animate-fade-in shadow-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-semibold">Budget Alert:</span> You have used 80%+ of your monthly budget (Spent: ₹{summary.monthlyExpenses.toLocaleString('en-IN')} / Limit: ₹{summary.monthlyBudget.toLocaleString('en-IN')}).
            </div>
          </div>
        )}
      </div>

      {/* Quick Expense - Mobile: Top (order-2), Desktop: Middle Right (order-4) */}
      <div className="order-2 lg:order-4 lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base">Quick Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickExpense />
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards - Mobile: Middle (order-3), Desktop: Top (order-2) */}
      <div className="order-3 lg:order-2 lg:col-span-3">
        <SummaryCards summary={summary} />
      </div>

      {/* Expense Growth Chart - Mobile: Middle (order-4), Desktop: Middle Left (order-3) */}
      <div className="order-4 lg:order-3 lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LineChartIcon className="h-4 w-4 text-primary" />
              Expense Growth (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseLineChart data={growthData} />
          </CardContent>
        </Card>
      </div>

      {/* Top Categories - Order 5 */}
      <div className="order-5 lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions - Order 6 */}
      <div className="order-6 lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
