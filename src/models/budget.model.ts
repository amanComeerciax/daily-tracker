import mongoose, { Schema, Document } from "mongoose";

export interface IBudgetDocument extends Document {
  clerkId: string;
  monthlyBudget: number;
  month: number;
  year: number;
  createdAt: Date;
}

const BudgetSchema = new Schema<IBudgetDocument>(
  {
    clerkId: {
      type: String,
      required: true,
    },
    monthlyBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique compound index: one budget per user per month
BudgetSchema.index({ clerkId: 1, month: 1, year: 1 }, { unique: true });

const Budget =
  mongoose.models.Budget ||
  mongoose.model<IBudgetDocument>("Budget", BudgetSchema);

export default Budget;
