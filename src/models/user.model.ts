import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document {
  clerkId: string;
  email: string;
  cycleStartDate: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    cycleStartDate: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 28, // Max 28 to avoid February leap year issues
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
