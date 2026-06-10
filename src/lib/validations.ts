import { z } from "zod";

// Expense validation schema
export const expenseSchema = z.object({
  amount: z
    .number({ message: "Amount is required" })
    .positive("Amount must be positive")
    .max(10000000, "Amount is too large"),
  category: z.enum(
    ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"],
    { message: "Category is required" }
  ),
  description: z
    .string({ message: "Description is required" })
    .min(1, "Description is required")
    .max(200, "Description is too long"),
  date: z.string({ message: "Date is required" }).min(1, "Date is required"),
});

// Income validation schema
export const incomeSchema = z.object({
  amount: z
    .number({ message: "Amount is required" })
    .positive("Amount must be positive")
    .max(100000000, "Amount is too large"),
  source: z.enum(["Salary", "Freelancing", "Business", "Bonus", "Other"], {
    message: "Source is required",
  }),
  description: z
    .string({ message: "Description is required" })
    .min(1, "Description is required")
    .max(200, "Description is too long"),
  date: z.string({ message: "Date is required" }).min(1, "Date is required"),
});

// Budget validation schema
export const budgetSchema = z.object({
  monthlyBudget: z
    .number({ message: "Budget amount is required" })
    .positive("Budget must be positive")
    .max(100000000, "Budget is too large"),
});

// Quick entry validation
export const quickEntrySchema = z.object({
  input: z
    .string()
    .min(1, "Please enter an expense")
    .max(200, "Input is too long"),
});

// Export types from schemas
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type QuickEntryInput = z.infer<typeof quickEntrySchema>;
