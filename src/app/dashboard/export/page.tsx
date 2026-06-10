"use client";

import { useState } from "react";
import {
  exportDailyReport,
  exportMonthlyReport,
  exportFullHistory,
} from "@/actions/export.actions";
import { downloadExcel } from "@/utils/export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateForInput } from "@/utils/format";
import { MONTH_NAMES } from "@/utils/constants";
import {
  Download,
  Calendar,
  CalendarDays,
  History,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";

export default function ExportPage() {
  const [dailyDate, setDailyDate] = useState(formatDateForInput(new Date()));
  const [monthlyMonth, setMonthlyMonth] = useState(
    formatDateForInput(new Date()).slice(0, 7)
  );
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);

  const handleDailyExport = async () => {
    setLoadingDaily(true);
    const result = await exportDailyReport(dailyDate);
    if (result.success && result.data) {
      downloadExcel(result.data, `daily-report-${dailyDate}`);
    }
    setLoadingDaily(false);
  };

  const handleMonthlyExport = async () => {
    setLoadingMonthly(true);
    const [year, month] = monthlyMonth.split("-").map(Number);
    const result = await exportMonthlyReport(month, year);
    if (result.success && result.data) {
      downloadExcel(
        result.data,
        `monthly-report-${MONTH_NAMES[month - 1]}-${year}`
      );
    }
    setLoadingMonthly(false);
  };

  const handleFullExport = async () => {
    setLoadingFull(true);
    const result = await exportFullHistory();
    if (result.success && result.data) {
      downloadExcel(result.data, `finance-full-history`);
    }
    setLoadingFull(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Export"
        description="Download your financial data as Excel files"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Report */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-base">Daily Report</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Expenses for a specific day
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
              />
            </div>
            <Button
              onClick={handleDailyExport}
              className="w-full gap-2"
              disabled={loadingDaily}
            >
              {loadingDaily ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download .xlsx
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Report */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/10 p-3">
                <CalendarDays className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <CardTitle className="text-base">Monthly Report</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Full month with summary
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Month</Label>
              <Input
                type="month"
                value={monthlyMonth}
                onChange={(e) => setMonthlyMonth(e.target.value)}
              />
            </div>
            <Button
              onClick={handleMonthlyExport}
              className="w-full gap-2"
              disabled={loadingMonthly}
            >
              {loadingMonthly ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download .xlsx
            </Button>
          </CardContent>
        </Card>

        {/* Full History */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <History className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-base">Full History</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All data, all time
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <FileSpreadsheet className="h-4 w-4" />
              Includes all expenses & income
            </div>
            <Button
              onClick={handleFullExport}
              className="w-full gap-2"
              disabled={loadingFull}
            >
              {loadingFull ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download .xlsx
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
