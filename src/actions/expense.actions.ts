"use server";

import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import Expense from "@/models/expense.model";
import { expenseSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import {
  ActionResponse,
  IExpense,
  PaginatedResponse,
  ExpenseFilters,
  DailyExpenseGroup,
  CategoryChartData,
} from "@/types";
import { CATEGORY_COLORS } from "@/utils/constants";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { getUserCycleStartDate } from "@/actions/user.actions";
import { getSpecificCycleDates, getCycleDates } from "@/utils/date";

/**
 * Create a new expense entry
 */
export async function createExpense(
  data: unknown
): Promise<ActionResponse<IExpense>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const validated = expenseSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await dbConnect();

    const expense = await Expense.create({
      clerkId: userId,
      amount: validated.data.amount,
      category: validated.data.category,
      description: validated.data.description,
      date: new Date(validated.data.date),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/daily");
    revalidatePath("/dashboard/analytics");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(expense)),
    };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "Failed to create expense" };
  }
}

/**
 * Get paginated, filtered, searchable expense list
 */
export async function getExpenses(
  filters: ExpenseFilters = {}
): Promise<ActionResponse<PaginatedResponse<IExpense>>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const {
      search,
      category,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = filters;

    // Build query
    const query: Record<string, unknown> = { clerkId: userId };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.description = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate)
        (query.date as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate)
        (query.date as Record<string, unknown>).$lte = new Date(endDate);
    }

    const total = await Expense.countDocuments(query);
    const totalPages = Math.ceil(total / pageSize);

    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return {
      success: true,
      data: {
        data: JSON.parse(JSON.stringify(expenses)),
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { success: false, error: "Failed to fetch expenses" };
  }
}

/**
 * Get today's total expenses
 */
export async function getTodayExpenses(): Promise<ActionResponse<number>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const today = new Date();
    const result = await Expense.aggregate([
      {
        $match: {
          clerkId: userId,
          date: {
            $gte: startOfDay(today),
            $lte: endOfDay(today),
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return { success: true, data: result[0]?.total ?? 0 };
  } catch (error) {
    console.error("Error fetching today expenses:", error);
    return { success: false, error: "Failed to fetch today's expenses" };
  }
}

/**
 * Get monthly total expenses
 */
export async function getMonthlyExpenses(
  month?: number,
  year?: number
): Promise<ActionResponse<number>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const cycleStartDate = await getUserCycleStartDate();
    const { start, end } = getSpecificCycleDates(m, y, cycleStartDate);

    const result = await Expense.aggregate([
      {
        $match: {
          clerkId: userId,
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return { success: true, data: result[0]?.total ?? 0 };
  } catch (error) {
    console.error("Error fetching monthly expenses:", error);
    return { success: false, error: "Failed to fetch monthly expenses" };
  }
}

/**
 * Get expenses grouped by day for daily view
 */
export async function getExpensesByDate(
  dateStr?: string
): Promise<ActionResponse<DailyExpenseGroup[]>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const cycleStartDate = await getUserCycleStartDate();
    let start: Date;
    let end: Date;

    if (dateStr) {
      // If dateStr is passed, it represents a specific month selection (e.g. "2026-06-01")
      // We should query the specific cycle starting in that month
      const date = new Date(dateStr);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const cycleDates = getSpecificCycleDates(m, y, cycleStartDate);
      start = cycleDates.start;
      end = cycleDates.end;
    } else {
      // If no dateStr is passed, use current date's cycle
      const date = new Date();
      const cycleDates = getCycleDates(date, cycleStartDate);
      start = cycleDates.start;
      end = cycleDates.end;
    }

    const expenses = await Expense.find({
      clerkId: userId,
      date: { $gte: start, $lte: end },
    })
      .sort({ date: -1 })
      .lean();

    // Group by date
    const groups: Record<string, DailyExpenseGroup> = {};
    for (const expense of expenses) {
      const dateKey = new Date(expense.date).toISOString().split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { date: dateKey, expenses: [], total: 0 };
      }
      groups[dateKey].expenses.push(JSON.parse(JSON.stringify(expense)));
      groups[dateKey].total += expense.amount;
    }

    return {
      success: true,
      data: Object.values(groups).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  } catch (error) {
    console.error("Error fetching expenses by date:", error);
    return { success: false, error: "Failed to fetch daily expenses" };
  }
}

/**
 * Get expense breakdown by category for pie chart
 */
export async function getExpensesByCategory(
  month?: number,
  year?: number
): Promise<ActionResponse<CategoryChartData[]>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const cycleStartDate = await getUserCycleStartDate();
    const { start, end } = getSpecificCycleDates(m, y, cycleStartDate);

    const result = await Expense.aggregate([
      {
        $match: {
          clerkId: userId,
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const chartData: CategoryChartData[] = result.map(
      (item: { _id: string; total: number }) => ({
        name: item._id,
        value: item.total,
        color:
          CATEGORY_COLORS[item._id as keyof typeof CATEGORY_COLORS] ||
          "#6b7280",
      })
    );

    return { success: true, data: chartData };
  } catch (error) {
    console.error("Error fetching category expenses:", error);
    return { success: false, error: "Failed to fetch category data" };
  }
}

/**
 * Update an expense
 */
export async function updateExpense(
  id: string,
  data: unknown
): Promise<ActionResponse<IExpense>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const validated = expenseSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await dbConnect();

    const expense = await Expense.findOneAndUpdate(
      { _id: id, clerkId: userId },
      {
        amount: validated.data.amount,
        category: validated.data.category,
        description: validated.data.description,
        date: new Date(validated.data.date),
      },
      { returnDocument: "after" }
    );

    if (!expense) {
      return { success: false, error: "Expense not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/daily");
    revalidatePath("/dashboard/analytics");

    return { success: true, data: JSON.parse(JSON.stringify(expense)) };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { success: false, error: "Failed to update expense" };
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(
  id: string
): Promise<ActionResponse<void>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const expense = await Expense.findOneAndDelete({
      _id: id,
      clerkId: userId,
    });

    if (!expense) {
      return { success: false, error: "Expense not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/daily");
    revalidatePath("/dashboard/analytics");

    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "Failed to delete expense" };
  }
}
