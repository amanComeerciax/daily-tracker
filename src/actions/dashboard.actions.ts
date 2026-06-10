"use server";

import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import Expense from "@/models/expense.model";
import Income from "@/models/income.model";
import Budget from "@/models/budget.model";
import {
  ActionResponse,
  DashboardSummary,
  MonthlyTrendData,
  ExpenseGrowthData,
  IExpense,
} from "@/types";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns";
import { MONTH_NAMES } from "@/utils/constants";
import { getUserCycleStartDate } from "@/actions/user.actions";
import { getCycleDates } from "@/utils/date";

/**
 * Get the full dashboard summary for the current month
 */
export async function getDashboardSummary(): Promise<
  ActionResponse<DashboardSummary>
> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const now = new Date();
    const cycleStartDate = await getUserCycleStartDate();
    const { start: monthStart, end: monthEnd } = getCycleDates(now, cycleStartDate);
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const currentMonth = monthStart.getMonth() + 1;
    const currentYear = monthStart.getFullYear();

    // Run all queries in parallel
    const [todayResult, monthlyResult, incomeResult, budgetDoc] =
      await Promise.all([
        // Today's expenses
        Expense.aggregate([
          {
            $match: {
              clerkId: userId,
              date: { $gte: dayStart, $lte: dayEnd },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        // Monthly expenses
        Expense.aggregate([
          {
            $match: {
              clerkId: userId,
              date: { $gte: monthStart, $lte: monthEnd },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        // Monthly income
        Income.aggregate([
          {
            $match: {
              clerkId: userId,
              date: { $gte: monthStart, $lte: monthEnd },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        // Budget
        Budget.findOne({
          clerkId: userId,
          month: currentMonth,
          year: currentYear,
        }),
      ]);

    const todayExpenses = todayResult[0]?.total ?? 0;
    const monthlyExpenses = monthlyResult[0]?.total ?? 0;
    const totalIncome = incomeResult[0]?.total ?? 0;
    const monthlyBudget = budgetDoc?.monthlyBudget ?? 0;
    const totalSavings = totalIncome - monthlyExpenses;
    const remainingBudget = monthlyBudget > 0 ? Math.max(monthlyBudget - monthlyExpenses, 0) : 0;
    const isExceeded = monthlyExpenses > monthlyBudget && monthlyBudget > 0;
    const isWarning = monthlyExpenses >= monthlyBudget * 0.8 && monthlyExpenses <= monthlyBudget && monthlyBudget > 0;

    return {
      success: true,
      data: {
        todayExpenses,
        monthlyExpenses,
        totalIncome,
        totalSavings,
        remainingBudget,
        monthlyBudget,
        isWarning,
        isExceeded,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return { success: false, error: "Failed to fetch dashboard summary" };
  }
}

/**
 * Get monthly spending trend (last 12 months) for bar chart
 */
export async function getMonthlyTrend(
  year?: number
): Promise<ActionResponse<MonthlyTrendData[]>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const now = new Date();
    const startDate = subMonths(startOfMonth(now), 11);
    const endDate = endOfMonth(now);

    const result = await Expense.aggregate([
      {
        $match: {
          clerkId: userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Fill in missing months with 0
    const trendData: MonthlyTrendData[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(now, i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const found = result.find(
        (r: { _id: { year: number; month: number }; total: number }) =>
          r._id.year === y && r._id.month === m
      );
      trendData.push({
        month: MONTH_NAMES[m - 1].slice(0, 3),
        amount: found?.total ?? 0,
      });
    }

    return { success: true, data: trendData };
  } catch (error) {
    console.error("Error fetching monthly trend:", error);
    return { success: false, error: "Failed to fetch monthly trend" };
  }
}

/**
 * Get expense growth over time (daily totals for current month) for line chart
 */
export async function getExpenseGrowth(): Promise<
  ActionResponse<ExpenseGrowthData[]>
> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const now = new Date();
    const cycleStartDate = await getUserCycleStartDate();
    const { start, end } = getCycleDates(now, cycleStartDate);

    const result = await Expense.aggregate([
      {
        $match: {
          clerkId: userId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Create a map for quick lookup
    const resultMap = new Map(
      result.map((item: { _id: string; total: number }) => [item._id, item.total])
    );

    const growthData: ExpenseGrowthData[] = [];
    let cumulative = 0;

    // Loop from start of month up to today
    for (let d = start; d <= now; d = new Date(d.getTime() + 86400000)) {
      const dateStr = format(d, "yyyy-MM-dd");
      const dailyTotal = resultMap.get(dateStr) || 0;
      cumulative += dailyTotal;
      growthData.push({
        date: format(d, "d MMM"),
        amount: cumulative,
      });
    }

    // Ensure at least two points so Recharts can draw an area/line (e.g., if today is the 1st)
    if (growthData.length === 1) {
      growthData.unshift({
        date: "Start",
        amount: 0,
      });
    }

    return { success: true, data: growthData };
  } catch (error) {
    console.error("Error fetching expense growth:", error);
    return { success: false, error: "Failed to fetch expense growth" };
  }
}

/**
 * Get recent transactions (last 5 expenses)
 */
export async function getRecentTransactions(): Promise<
  ActionResponse<IExpense[]>
> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const expenses = await Expense.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(expenses)) };
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return { success: false, error: "Failed to fetch recent transactions" };
  }
}
