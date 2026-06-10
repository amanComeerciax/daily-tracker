"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/user.model";
import { ActionResponse, IUser } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Sync user data from Clerk to MongoDB.
 * Called after sign-in to ensure user exists in our database.
 */
export async function syncUser(): Promise<ActionResponse<IUser>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await currentUser();
    if (!user) return { success: false, error: "User not found" };

    await dbConnect();

    const email =
      user.emailAddresses?.[0]?.emailAddress ?? "";

    const dbUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { clerkId: userId, email } },
      { returnDocument: "after", upsert: true }
    );

    return { success: true, data: JSON.parse(JSON.stringify(dbUser)) };
  } catch (error) {
    console.error("Error syncing user:", error);
    return { success: false, error: "Failed to sync user" };
  }
}

/**
 * Get the current user's profile from MongoDB
 */
export async function getUser(): Promise<ActionResponse<IUser>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) return { success: false, error: "User not found in database" };

    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error("Error getting user:", error);
    return { success: false, error: "Failed to get user" };
  }
}



/**
 * Update the user's custom cycle start date preference
 */
export async function updateCycleStartDate(
  cycleStartDate: number
): Promise<ActionResponse<void>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (cycleStartDate < 1 || cycleStartDate > 28) {
      return { success: false, error: "Invalid start date. Must be between 1 and 28." };
    }

    await dbConnect();

    await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { cycleStartDate } },
      { returnDocument: "after", upsert: true }
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating cycle start date:", error);
    return { success: false, error: "Failed to update cycle start date" };
  }
}

/**
 * Get the user's cycle start date
 */
export async function getUserCycleStartDate(): Promise<number> {
  try {
    const { userId } = await auth();
    if (!userId) return 1;

    await dbConnect();

    const user = await User.findOne({ clerkId: userId }).lean();
    return user?.cycleStartDate || 1;
  } catch (error) {
    console.error("Error fetching cycle start date:", error);
    return 1;
  }
}
