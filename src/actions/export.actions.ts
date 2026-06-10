"use server";

import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import Expense from "@/models/expense.model";
import Income from "@/models/income.model";
import { ActionResponse } from "@/types";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";
import ExcelJS from "exceljs";

/**
 * Export daily report as .xlsx buffer (base64 encoded)
 */
export async function exportDailyReport(
  dateStr: string
): Promise<ActionResponse<string>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const date = new Date(dateStr);
    const expenses = await Expense.find({
      clerkId: userId,
      date: { $gte: startOfDay(date), $lte: endOfDay(date) },
    })
      .sort({ date: -1 })
      .lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Daily Report");

    // Header styling
    sheet.columns = [
      { header: "Amount (₹)", key: "amount", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Date", key: "date", width: 15 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6366F1" },
    };

    // Add data
    let total = 0;
    for (const expense of expenses) {
      total += expense.amount;
      sheet.addRow({
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: format(new Date(expense.date), "dd/MM/yyyy"),
      });
    }

    // Add total row
    const totalRow = sheet.addRow({
      amount: total,
      category: "",
      description: "TOTAL",
      date: "",
    });
    totalRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return { success: true, data: base64 };
  } catch (error) {
    console.error("Error exporting daily report:", error);
    return { success: false, error: "Failed to export daily report" };
  }
}

/**
 * Export monthly report as .xlsx buffer (base64 encoded)
 */
export async function exportMonthlyReport(
  month: number,
  year: number
): Promise<ActionResponse<string>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));

    const [expenses, incomes] = await Promise.all([
      Expense.find({
        clerkId: userId,
        date: { $gte: start, $lte: end },
      })
        .sort({ date: -1 })
        .lean(),
      Income.find({
        clerkId: userId,
        date: { $gte: start, $lte: end },
      })
        .sort({ date: -1 })
        .lean(),
    ]);

    const workbook = new ExcelJS.Workbook();

    // Expenses sheet
    const expSheet = workbook.addWorksheet("Expenses");
    expSheet.columns = [
      { header: "Amount (₹)", key: "amount", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Date", key: "date", width: 15 },
    ];

    const expHeader = expSheet.getRow(1);
    expHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
    expHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF43F5E" },
    };

    let expTotal = 0;
    for (const expense of expenses) {
      expTotal += expense.amount;
      expSheet.addRow({
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: format(new Date(expense.date), "dd/MM/yyyy"),
      });
    }
    const expTotalRow = expSheet.addRow({
      amount: expTotal,
      description: "TOTAL",
    });
    expTotalRow.font = { bold: true };

    // Income sheet
    const incSheet = workbook.addWorksheet("Income");
    incSheet.columns = [
      { header: "Amount (₹)", key: "amount", width: 15 },
      { header: "Source", key: "source", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Date", key: "date", width: 15 },
    ];

    const incHeader = incSheet.getRow(1);
    incHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
    incHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF10B981" },
    };

    let incTotal = 0;
    for (const income of incomes) {
      incTotal += income.amount;
      incSheet.addRow({
        amount: income.amount,
        source: income.source,
        description: income.description,
        date: format(new Date(income.date), "dd/MM/yyyy"),
      });
    }
    const incTotalRow = incSheet.addRow({
      amount: incTotal,
      description: "TOTAL",
    });
    incTotalRow.font = { bold: true };

    // Summary sheet
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 25 },
      { header: "Amount (₹)", key: "amount", width: 20 },
    ];

    const sumHeader = summarySheet.getRow(1);
    sumHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
    sumHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6366F1" },
    };

    summarySheet.addRow({ metric: "Total Income", amount: incTotal });
    summarySheet.addRow({ metric: "Total Expenses", amount: expTotal });
    summarySheet.addRow({
      metric: "Net Savings",
      amount: incTotal - expTotal,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return { success: true, data: base64 };
  } catch (error) {
    console.error("Error exporting monthly report:", error);
    return { success: false, error: "Failed to export monthly report" };
  }
}

/**
 * Export full history as .xlsx buffer (base64 encoded)
 */
export async function exportFullHistory(): Promise<ActionResponse<string>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await dbConnect();

    const [expenses, incomes] = await Promise.all([
      Expense.find({ clerkId: userId }).sort({ date: -1 }).lean(),
      Income.find({ clerkId: userId }).sort({ date: -1 }).lean(),
    ]);

    const workbook = new ExcelJS.Workbook();

    // Expenses sheet
    const expSheet = workbook.addWorksheet("All Expenses");
    expSheet.columns = [
      { header: "Amount (₹)", key: "amount", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Date", key: "date", width: 15 },
    ];

    const expHeader = expSheet.getRow(1);
    expHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
    expHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF43F5E" },
    };

    for (const expense of expenses) {
      expSheet.addRow({
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: format(new Date(expense.date), "dd/MM/yyyy"),
      });
    }

    // Income sheet
    const incSheet = workbook.addWorksheet("All Income");
    incSheet.columns = [
      { header: "Amount (₹)", key: "amount", width: 15 },
      { header: "Source", key: "source", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Date", key: "date", width: 15 },
    ];

    const incHeader = incSheet.getRow(1);
    incHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
    incHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF10B981" },
    };

    for (const income of incomes) {
      incSheet.addRow({
        amount: income.amount,
        source: income.source,
        description: income.description,
        date: format(new Date(income.date), "dd/MM/yyyy"),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return { success: true, data: base64 };
  } catch (error) {
    console.error("Error exporting full history:", error);
    return { success: false, error: "Failed to export full history" };
  }
}
