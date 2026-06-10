"use client";

import { useState, useEffect } from "react";
import { getExpensesByCategory } from "@/actions/expense.actions";
import { getMonthlyTrend, getExpenseGrowth } from "@/actions/dashboard.actions";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart";
import { ExpenseLineChart } from "@/components/charts/expense-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CategoryChartData, MonthlyTrendData, ExpenseGrowthData } from "@/types";
import { PieChartIcon, BarChart3, LineChartIcon } from "lucide-react";

export default function AnalyticsPage() {
  const [categoryData, setCategoryData] = useState<CategoryChartData[]>([]);
  const [trendData, setTrendData] = useState<MonthlyTrendData[]>([]);
  const [growthData, setGrowthData] = useState<ExpenseGrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [catResult, trendResult, growthResult] = await Promise.all([
        getExpensesByCategory(),
        getMonthlyTrend(),
        getExpenseGrowth(),
      ]);

      if (catResult.success && catResult.data) setCategoryData(catResult.data);
      if (trendResult.success && trendResult.data)
        setTrendData(trendResult.data);
      if (growthResult.success && growthResult.data)
        setGrowthData(growthResult.data);

      setLoading(false);
    };
    fetchData();
  }, []);

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
        title="Analytics"
        description="Visual insights into your spending"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryData} />
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
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

      {/* Bar Chart - Full width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Monthly Spending Trend (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyBarChart data={trendData} />
        </CardContent>
      </Card>
    </div>
  );
}
