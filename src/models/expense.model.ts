import mongoose, { Schema, Document } from "mongoose";
import { ExpenseCategory } from "@/types";

export interface IExpenseDocument extends Document {
  clerkId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Food",
        "Travel",
        "Shopping",
        "Bills",
        "Entertainment",
        "Health",
        "Education",
        "Other",
      ],
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
    },
    date: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
ExpenseSchema.index({ clerkId: 1, date: -1 });
ExpenseSchema.index({ clerkId: 1, category: 1 });

const Expense =
  mongoose.models.Expense ||
  mongoose.model<IExpenseDocument>("Expense", ExpenseSchema);

export default Expense;
