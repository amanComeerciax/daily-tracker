"use server";

import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import Income from "@/models/income.model";
import { incomeSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { ActionResponse, IIncome, PaginatedResponse, IncomeFilters } from "@/types";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * Create a new income entry
 */
export async function createIncome(
  data: unknown
): Promise<ActionResponse<IIncome>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const validated = incomeSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await dbConnect();

    const income = await Income.create({
      clerkId: userId,
      amount: validated.data.amount,
      source: validated.data.source,
      description: validated.data.description,
      date: new Date(validated.data.date),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/income");

    return { success: true, data: JSON.parse(JSON.stringify(income)) };
  } catch (error) {
    console.error("Error creating income:", error);
    return { success: false, error: "Failed to create income" };
  }
}

/**
 * Get paginated income list
 */
export async function getIncomes(
  filters: IncomeFilters = {}
): Promise<ActionResponse<PaginatedResponse<IIncome>>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const { search, source, page = 1, pageSize = 10 } = filters;

    const query: Record<string, unknown> = { clerkId: userId };

    if (source) query.source = source;
    if (search) query.description = { $regex: search, $options: "i" };

    const total = await Income.countDocuments(query);
    const totalPages = Math.ceil(total / pageSize);

    const incomes = await Income.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return {
      success: true,
      data: {
        data: JSON.parse(JSON.stringify(incomes)),
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching incomes:", error);
    return { success: false, error: "Failed to fetch incomes" };
  }
}

/**
 * Get monthly total income
 */
export async function getMonthlyIncome(
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
    const start = startOfMonth(new Date(y, m - 1));
    const end = endOfMonth(new Date(y, m - 1));

    const result = await Income.aggregate([
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
    console.error("Error fetching monthly income:", error);
    return { success: false, error: "Failed to fetch monthly income" };
  }
}

/**
 * Update an income entry
 */
export async function updateIncome(
  id: string,
  data: unknown
): Promise<ActionResponse<IIncome>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const validated = incomeSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await dbConnect();

    const income = await Income.findOneAndUpdate(
      { _id: id, clerkId: userId },
      {
        amount: validated.data.amount,
        source: validated.data.source,
        description: validated.data.description,
        date: new Date(validated.data.date),
      },
      { returnDocument: "after" }
    );

    if (!income) {
      return { success: false, error: "Income not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/income");

    return { success: true, data: JSON.parse(JSON.stringify(income)) };
  } catch (error) {
    console.error("Error updating income:", error);
    return { success: false, error: "Failed to update income" };
  }
}

/**
 * Delete an income entry
 */
export async function deleteIncome(id: string): Promise<ActionResponse<void>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const income = await Income.findOneAndDelete({ _id: id, clerkId: userId });

    if (!income) {
      return { success: false, error: "Income not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/income");

    return { success: true };
  } catch (error) {
    console.error("Error deleting income:", error);
    return { success: false, error: "Failed to delete income" };
  }
}
