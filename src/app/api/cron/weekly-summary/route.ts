import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user.model";
import Budget from "@/models/budget.model";
import Expense from "@/models/expense.model";
import { getSpecificCycleDates } from "@/utils/date";

export async function GET(request: Request) {
  try {
    // Allow query parameter key=... for easy browser testing in development
    const { searchParams } = new URL(request.url);
    const keyParam = searchParams.get("key");
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    const isAuthorized = !cronSecret || 
                         authHeader === `Bearer ${cronSecret}` || 
                         keyParam === cronSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not configured. Email summaries will be skipped.");
      return NextResponse.json({
        success: false,
        message: "RESEND_API_KEY is missing. Configure it in environment variables to enable weekly email summaries."
      });
    }

    await dbConnect();

    const users = await User.find({});
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const results = [];

    for (const user of users) {
      // 1. Fetch budget for this user
      const budgetDoc = await Budget.findOne({
        clerkId: user.clerkId,
        month: currentMonth,
        year: currentYear,
      });
      const budget = budgetDoc?.monthlyBudget ?? 0;

      // 2. Fetch monthly expenses for current cycle
      const { start: cycleStart, end: cycleEnd } = getSpecificCycleDates(
        currentMonth,
        currentYear,
        user.cycleStartDate
      );
      
      const monthlyExpensesResult = await Expense.aggregate([
        {
          $match: {
            clerkId: user.clerkId,
            date: { $gte: cycleStart, $lte: cycleEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const monthlyExpenses = monthlyExpensesResult[0]?.total ?? 0;

      // 3. Fetch weekly expenses (past 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyExpensesList = await Expense.find({
        clerkId: user.clerkId,
        date: { $gte: oneWeekAgo, $lte: now },
      }).sort({ date: -1 });
      
      const weeklyExpensesTotal = weeklyExpensesList.reduce((sum, exp) => sum + exp.amount, 0);

      // 4. Calculate budget statuses
      const percentage = budget > 0 ? (monthlyExpenses / budget) * 100 : 0;
      const isExceeded = monthlyExpenses > budget && budget > 0;
      const isWarning = monthlyExpenses >= budget * 0.8 && monthlyExpenses <= budget && budget > 0;

      // 5. Build premium HTML template
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #F5F5F5; color: #1E293B; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; background-color: #FFFFFF; border-radius: 24px; padding: 32px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); }
            .header { display: flex; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #F1F5F9; padding-bottom: 20px; }
            .logo { font-size: 20px; font-weight: bold; color: #7c3aed; }
            .title { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 8px 0; color: #0F172A; }
            .subtitle { font-size: 14px; color: #64748B; margin: 0 0 24px 0; }
            .alert { border-radius: 16px; padding: 16px; margin-bottom: 24px; font-size: 14px; font-weight: 500; display: flex; align-items: center; }
            .alert-warning { background-color: #FEF3C7; border: 1px solid #FDE68A; color: #92400E; }
            .alert-danger { background-color: #FEE2E2; border: 1px solid #FCA5A5; color: #991B1B; }
            .stats-grid { display: grid; grid-cols: 2; display: flex; gap: 16px; margin-bottom: 24px; }
            .stat-card { flex: 1; background-color: #F8FAFC; border-radius: 16px; padding: 16px; text-align: center; border: 1px solid #F1F5F9; }
            .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; margin-bottom: 4px; font-weight: 600; }
            .stat-value { font-size: 20px; font-weight: 800; color: #0F172A; }
            .progress-container { background-color: #E2E8F0; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 24px; }
            .progress-bar { height: 100%; border-radius: 4px; }
            .bg-purple { background-color: #7c3aed; }
            .bg-amber { background-color: #d97706; }
            .bg-red { background-color: #dc2626; }
            .table-title { font-size: 16px; font-weight: 700; margin: 0 0 12px 0; color: #0F172A; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { text-align: left; font-size: 11px; text-transform: uppercase; color: #64748B; padding: 8px 12px; border-bottom: 2px solid #F1F5F9; }
            td { padding: 12px; font-size: 13px; border-bottom: 1px solid #F8FAFC; color: #334155; }
            .category-tag { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background-color: #F1F5F9; color: #475569; }
            .footer { border-top: 1px solid #F1F5F9; padding-top: 20px; text-align: center; font-size: 11px; color: #94A3B8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">FinanceFlow</div>
            </div>
            
            <h2 class="title">Your Weekly Spending Summary</h2>
            <p class="subtitle">Here is your financial report from the past 7 days.</p>

            ${
              isExceeded
                ? `<div class="alert alert-danger">
                    <strong>⚠️ Budget Exceeded:</strong> You have spent ₹${monthlyExpenses.toLocaleString('en-IN')} out of your ₹${budget.toLocaleString('en-IN')} monthly budget. Please review your logs.
                   </div>`
                : isWarning
                ? `<div class="alert alert-warning">
                    <strong>⚠️ Budget Warning:</strong> You have used ${percentage.toFixed(0)}% of your monthly budget (₹${monthlyExpenses.toLocaleString('en-IN')} spent out of ₹${budget.toLocaleString('en-IN')}).
                   </div>`
                : ""
            }

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Spent This Week</div>
                <div class="stat-value">₹${weeklyExpensesTotal.toLocaleString('en-IN')}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Month Total Spent</div>
                <div class="stat-value">₹${monthlyExpenses.toLocaleString('en-IN')}</div>
              </div>
            </div>

            ${
              budget > 0
                ? `<div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #64748B; margin-bottom: 4px; font-weight: 600;">
                      <span>Monthly Budget Usage</span>
                      <span>${percentage.toFixed(0)}%</span>
                    </div>
                    <div class="progress-container">
                      <div class="progress-bar ${isExceeded ? 'bg-red' : isWarning ? 'bg-amber' : 'bg-purple'}" style="width: ${percentage}%"></div>
                    </div>
                   </div>`
                : ""
            }

            <h3 class="table-title">Recent Weekly Activity</h3>
            ${
              weeklyExpensesList.length > 0
                ? `<table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${weeklyExpensesList
                        .map(
                          (exp) => `
                          <tr>
                            <td>${new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                            <td><strong>${exp.description}</strong></td>
                            <td><span class="category-tag">${exp.category}</span></td>
                            <td style="font-weight: bold; color: #0F172A;">-₹${exp.amount.toLocaleString('en-IN')}</td>
                          </tr>
                        `
                        )
                        .join("")}
                    </tbody>
                   </table>`
                : `<p style="font-size: 13px; color: #64748B; text-align: center; padding: 20px 0;">No transactions recorded this week.</p>`
            }

            <div class="footer">
              Sent automatically by FinanceFlow. To update your settings, visit your dashboard.
            </div>
          </div>
        </body>
        </html>
      `;

      // 6. Dispatch email via Resend API
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "FinanceFlow <onboarding@resend.dev>",
            to: user.email,
            subject: isExceeded 
              ? "🚨 Budget Exceeded Alert - FinanceFlow"
              : isWarning
              ? "⚠️ Budget Warning Alert - FinanceFlow"
              : "📊 Your Weekly Summary Report - FinanceFlow",
            html: htmlContent,
          }),
        });
        
        const resData = await response.json();
        results.push({ email: user.email, success: response.ok, data: resData });
      } catch (err: any) {
        console.error(`Error sending email to ${user.email}:`, err);
        results.push({ email: user.email, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: users.length,
      details: results,
    });
  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
