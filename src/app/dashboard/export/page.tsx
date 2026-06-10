"use client";
 
import { useState } from "react";
import {
  exportDailyReport,
  exportMonthlyReport,
  exportFullHistory,
  getDailyReportData,
  getMonthlyReportData,
  getFullReportData,
} from "@/actions/export.actions";
import { downloadExcel, downloadPDF } from "@/utils/export";
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
  FileText,
} from "lucide-react";

export default function ExportPage() {
  const [dailyDate, setDailyDate] = useState(formatDateForInput(new Date()));
  const [monthlyMonth, setMonthlyMonth] = useState(
    formatDateForInput(new Date()).slice(0, 7)
  );
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);

  const [loadingDailyPdf, setLoadingDailyPdf] = useState(false);
  const [loadingMonthlyPdf, setLoadingMonthlyPdf] = useState(false);
  const [loadingFullPdf, setLoadingFullPdf] = useState(false);

  const handleDailyExport = async () => {
    setLoadingDaily(true);
    const result = await exportDailyReport(dailyDate);
    if (result.success && result.data) {
      downloadExcel(result.data, `daily-report-${dailyDate}`);
    }
    setLoadingDaily(false);
  };

  const handleDailyPdfExport = async () => {
    setLoadingDailyPdf(true);
    const result = await getDailyReportData(dailyDate);
    if (result.success && result.data) {
      downloadPDF(`Daily Report - ${dailyDate}`, "daily", result.data);
    }
    setLoadingDailyPdf(false);
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

  const handleMonthlyPdfExport = async () => {
    setLoadingMonthlyPdf(true);
    const [year, month] = monthlyMonth.split("-").map(Number);
    const result = await getMonthlyReportData(month, year);
    if (result.success && result.data) {
      downloadPDF(
        `Monthly Report - ${MONTH_NAMES[month - 1]} ${year}`,
        "monthly",
        result.data
      );
    }
    setLoadingMonthlyPdf(false);
  };

  const handleFullExport = async () => {
    setLoadingFull(true);
    const result = await exportFullHistory();
    if (result.success && result.data) {
      downloadExcel(result.data, `finance-full-history`);
    }
    setLoadingFull(false);
  };

  const handleFullPdfExport = async () => {
    setLoadingFullPdf(true);
    const result = await getFullReportData();
    if (result.success && result.data) {
      downloadPDF("Full Financial History Report", "full", result.data);
    }
    setLoadingFullPdf(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Export"
        description="Download your financial data as Excel or PDF files"
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
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button
                onClick={handleDailyExport}
                className="flex-1 gap-1.5 text-xs"
                disabled={loadingDaily || loadingDailyPdf}
              >
                {loadingDaily ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Excel (.xlsx)
              </Button>
              <Button
                onClick={handleDailyPdfExport}
                variant="outline"
                className="flex-1 gap-1.5 text-xs border-red-200 text-red-600 hover:border-red-500 hover:bg-red-50/50"
                disabled={loadingDaily || loadingDailyPdf}
              >
                {loadingDailyPdf ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                PDF (.pdf)
              </Button>
            </div>
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
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button
                onClick={handleMonthlyExport}
                className="flex-1 gap-1.5 text-xs"
                disabled={loadingMonthly || loadingMonthlyPdf}
              >
                {loadingMonthly ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Excel (.xlsx)
              </Button>
              <Button
                onClick={handleMonthlyPdfExport}
                variant="outline"
                className="flex-1 gap-1.5 text-xs border-red-200 text-red-600 hover:border-red-500 hover:bg-red-50/50"
                disabled={loadingMonthly || loadingMonthlyPdf}
              >
                {loadingMonthlyPdf ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                PDF (.pdf)
              </Button>
            </div>
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
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button
                onClick={handleFullExport}
                className="flex-1 gap-1.5 text-xs"
                disabled={loadingFull || loadingFullPdf}
              >
                {loadingFull ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Excel (.xlsx)
              </Button>
              <Button
                onClick={handleFullPdfExport}
                variant="outline"
                className="flex-1 gap-1.5 text-xs border-red-200 text-red-600 hover:border-red-500 hover:bg-red-50/50"
                disabled={loadingFull || loadingFullPdf}
              >
                {loadingFullPdf ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                PDF (.pdf)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
