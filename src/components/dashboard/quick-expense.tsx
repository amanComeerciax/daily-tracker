"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { detectCategory, capitalizeFirst } from "@/utils/parse-quick-entry";
import { createExpense } from "@/actions/expense.actions";
import { getBudgetStatus } from "@/actions/budget.actions";
import { formatDateForInput } from "@/utils/format";
import { toast } from "sonner";

export function QuickExpense() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim() || !description.trim() || !date) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    const descText = description.trim();
    const category = detectCategory(descText);
    const capitalizedDesc = capitalizeFirst(descText);

    const result = await createExpense({
      amount: parsedAmount,
      category: category,
      description: capitalizedDesc,
      date: date,
    });

    setLoading(false);

    if (result.success) {
      toast.success(`Added ₹${parsedAmount} for "${capitalizedDesc}" (${category})`);
      
      setAmount("");
      setDescription("");
      setDate(formatDateForInput(new Date()));

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
      toast.error(result.error || "Failed to add expense");
    }
  };

  return (
    <div className="space-y-4 mt-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Amount (₹)</label>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 120"
            className="h-12 text-lg"
            disabled={loading}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block text-muted-foreground">What was this for?</label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='e.g. "Lunch" or "Petrol"'
            className="h-12 text-lg"
            disabled={loading}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 text-lg"
            disabled={loading}
            required
          />
        </div>
        <Button type="submit" size="lg" className="w-full h-12 text-base mt-2 font-semibold" disabled={loading}>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Add Expense"
          )}
        </Button>
      </form>
    </div>
  );
}
