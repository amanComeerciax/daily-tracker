"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, type ExpenseInput } from "@/lib/validations";
import { createExpense, updateExpense } from "@/actions/expense.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EXPENSE_CATEGORIES } from "@/utils/constants";
import { IExpense } from "@/types";
import { formatDateForInput } from "@/utils/format";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getBudgetStatus } from "@/actions/budget.actions";

interface ExpenseFormProps {
  expense?: IExpense;
  onSuccess: () => void;
}

export function ExpenseForm({ expense, onSuccess }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: formatDateForInput(expense.date),
        }
      : {
          date: formatDateForInput(new Date()),
          category: "Food",
        },
  });

  const onSubmit = async (data: ExpenseInput) => {
    setLoading(true);
    setError("");

    const result = expense
      ? await updateExpense(expense._id!, data)
      : await createExpense(data);

    setLoading(false);

    if (result.success) {
      toast.success(expense ? "Expense updated successfully" : "Expense added successfully");
      onSuccess();

      // Check budget status for alerts
      const budgetStatusResult = await getBudgetStatus();
      if (budgetStatusResult.success && budgetStatusResult.data) {
        const { isExceeded, isWarning, percentage } = budgetStatusResult.data;
        if (isExceeded) {
          toast.error(`Budget Alert: You have exceeded your monthly budget! (${percentage.toFixed(0)}% used)`);
        } else if (isWarning) {
          toast.warning(`Budget Alert: You have used ${percentage.toFixed(0)}% of your monthly budget.`);
        }
      }
    } else {
      setError(result.error || "Something went wrong");
      toast.error(result.error || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="Enter amount"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-xs text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select id="category" {...register("category")}>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </Select>
        {errors.category && (
          <p className="text-xs text-red-500">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What did you spend on?"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date && (
          <p className="text-xs text-red-500">{errors.date.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {expense ? "Update Expense" : "Add Expense"}
      </Button>
    </form>
  );
}
