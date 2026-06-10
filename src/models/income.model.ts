import mongoose, { Schema, Document } from "mongoose";
import { IncomeSource } from "@/types";

export interface IIncomeDocument extends Document {
  clerkId: string;
  amount: number;
  source: IncomeSource;
  description: string;
  date: Date;
  createdAt: Date;
}

const IncomeSchema = new Schema<IIncomeDocument>(
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
    source: {
      type: String,
      required: true,
      enum: ["Salary", "Freelancing", "Business", "Bonus", "Other"],
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

IncomeSchema.index({ clerkId: 1, date: -1 });

const Income =
  mongoose.models.Income ||
  mongoose.model<IIncomeDocument>("Income", IncomeSchema);

export default Income;
