"use server";

import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import Budget from "@/models/budget.model";
import Expense from "@/models/expense.model";
import { budgetSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { ActionResponse, BudgetStatus } from "@/types";
import { startOfMonth, endOfMonth } from "date-fns";
import { getUserCycleStartDate } from "@/actions/user.actions";
import { getSpecificCycleDates } from "@/utils/date";

/**
 * Set or update the monthly budget
 */
export async function setBudget(
  data: unknown,
  month?: number,
  year?: number
): Promise<ActionResponse<{ monthlyBudget: number }>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const validated = budgetSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await dbConnect();

    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();

    const budget = await Budget.findOneAndUpdate(
      { clerkId: userId, month: m, year: y },
      { monthlyBudget: validated.data.monthlyBudget },
      { returnDocument: "after", upsert: true }
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/budget");

    return {
      success: true,
      data: { monthlyBudget: budget.monthlyBudget },
    };
  } catch (error) {
    console.error("Error setting budget:", error);
    return { success: false, error: "Failed to set budget" };
  }
}

/**
 * Get the current month's budget
 */
export async function getBudget(
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

    const budget = await Budget.findOne({
      clerkId: userId,
      month: m,
      year: y,
    });

    return { success: true, data: budget?.monthlyBudget ?? 0 };
  } catch (error) {
    console.error("Error fetching budget:", error);
    return { success: false, error: "Failed to fetch budget" };
  }
}

/**
 * Get budget status: budget, spent, remaining, percentage, isExceeded
 */
export async function getBudgetStatus(
  month?: number,
  year?: number
): Promise<ActionResponse<BudgetStatus>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();

    // Get budget
    const budgetDoc = await Budget.findOne({
      clerkId: userId,
      month: m,
      year: y,
    });
    const budget = budgetDoc?.monthlyBudget ?? 0;

    // Get total spent
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

    const spent = result[0]?.total ?? 0;
    const remaining = Math.max(budget - spent, 0);
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const isExceeded = spent > budget && budget > 0;
    const isWarning = spent >= budget * 0.8 && spent <= budget && budget > 0;

    return {
      success: true,
      data: {
        budget,
        spent,
        remaining,
        percentage,
        isExceeded,
        isWarning,
      },
    };
  } catch (error) {
    console.error("Error fetching budget status:", error);
    return { success: false, error: "Failed to fetch budget status" };
  }
}
