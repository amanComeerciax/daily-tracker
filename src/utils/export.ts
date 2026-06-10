/**
 * Download a base64-encoded file as .xlsx
 */
export function downloadExcel(base64: string, filename: string): void {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate and download a beautifully formatted PDF report via browser print
 */
export function downloadPDF(
  title: string,
  type: "daily" | "monthly" | "full",
  data: {
    expenses: any[];
    incomes?: any[];
    dateStr?: string;
    month?: number;
    year?: number;
  }
): void {
  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const expenses = data.expenses || [];
  const incomes = data.incomes || [];

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  // Build rows for expenses
  let expenseRowsHtml = "";
  if (expenses.length > 0) {
    expenses.forEach((item) => {
      expenseRowsHtml += `
        <tr>
          <td>${formatCurrency(item.amount)}</td>
          <td>${item.category}</td>
          <td>${item.description}</td>
          <td>${formatDate(item.date)}</td>
        </tr>
      `;
    });
    expenseRowsHtml += `
      <tr class="total-row">
        <td>${formatCurrency(totalExpenses)}</td>
        <td colspan="2">TOTAL EXPENSES</td>
        <td></td>
      </tr>
    `;
  } else {
    expenseRowsHtml = `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">No expenses recorded.</td></tr>`;
  }

  // Build rows for income
  let incomeRowsHtml = "";
  if (incomes.length > 0) {
    incomes.forEach((item) => {
      incomeRowsHtml += `
        <tr>
          <td>${formatCurrency(item.amount)}</td>
          <td>${item.source || item.category || "General"}</td>
          <td>${item.description}</td>
          <td>${formatDate(item.date)}</td>
        </tr>
      `;
    });
    incomeRowsHtml += `
      <tr class="total-row">
        <td>${formatCurrency(totalIncome)}</td>
        <td colspan="2">TOTAL INCOME</td>
        <td></td>
      </tr>
    `;
  } else {
    incomeRowsHtml = `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">No income recorded.</td></tr>`;
  }

  // Define summary section
  let summaryHtml = "";
  if (type === "monthly" || type === "full") {
    summaryHtml = `
      <div class="summary-grid">
        <div class="summary-card">
          <div class="card-label">Total Income</div>
          <div class="card-value value-income">${formatCurrency(totalIncome)}</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Total Expenses</div>
          <div class="card-value value-expense">${formatCurrency(totalExpenses)}</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Net Savings</div>
          <div class="card-value value-net">${formatCurrency(netSavings)}</div>
        </div>
      </div>
    `;
  } else {
    summaryHtml = `
      <div class="summary-grid" style="grid-template-columns: 1fr;">
        <div class="summary-card" style="text-align: center;">
          <div class="card-label">Total Daily Expenses</div>
          <div class="card-value value-expense">${formatCurrency(totalExpenses)}</div>
        </div>
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 24px;
          line-height: 1.5;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-img {
          height: 36px;
          width: 36px;
          object-fit: contain;
        }
        .brand-name {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .brand-flow {
          color: #7c3aed;
        }
        .report-info {
          text-align: right;
        }
        .report-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1e1b4b;
        }
        .report-date {
          font-size: 11px;
          color: #64748b;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        @media (max-width: 600px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }
        .card-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 6px;
          letter-spacing: 0.05em;
        }
        .card-value {
          font-size: 20px;
          font-weight: 700;
        }
        .value-income { color: #10b981; }
        .value-expense { color: #ef4444; }
        .value-net { color: #7c3aed; }
        
        .section-title {
          font-size: 14px;
          font-weight: 700;
          margin: 24px 0 12px 0;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-left: 3px solid #7c3aed;
          padding-left: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background: #f1f5f9;
          color: #475569;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          padding: 10px 12px;
          border-bottom: 1px solid #cbd5e1;
        }
        td {
          padding: 10px 12px;
          font-size: 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        tr:nth-child(even) td {
          background: #f8fafc;
        }
        .total-row td {
          font-weight: 700;
          background: #f1f5f9 !important;
          border-top: 1px solid #cbd5e1;
          border-bottom: 2px solid #94a3b8;
          color: #0f172a;
        }
        .footer {
          text-align: center;
          margin-top: 64px;
          font-size: 10px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
          padding-top: 16px;
        }
        @media print {
          body {
            padding: 0;
          }
          .summary-card {
            background: #f8fafc !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          th {
            background: #f1f5f9 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .total-row td {
            background: #f1f5f9 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-container">
          <img src="/logo.png" class="logo-img" alt="Logo" />
          <span class="brand-name">Finance<span class="brand-flow">Flow</span></span>
        </div>
        <div class="report-info">
          <div class="report-title">${title}</div>
          <div class="report-date">Generated on: ${new Date().toLocaleString("en-IN")}</div>
        </div>
      </div>

      ${summaryHtml}

      <div class="section-title">Expenses</div>
      <table>
        <thead>
          <tr>
            <th style="width: 20%;">Amount</th>
            <th style="width: 20%;">Category</th>
            <th style="width: 40%;">Description</th>
            <th style="width: 20%;">Date</th>
          </tr>
        </thead>
        <tbody>
          ${expenseRowsHtml}
        </tbody>
      </table>

      ${type !== "daily" ? `
        <div class="section-title">Income</div>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">Amount</th>
              <th style="width: 20%;">Source</th>
              <th style="width: 40%;">Description</th>
              <th style="width: 20%;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${incomeRowsHtml}
          </tbody>
        </table>
      ` : ""}

      <div class="footer">
        © ${new Date().getFullYear()} FinanceFlow. All rights reserved. Generated automatically via FinanceFlow.
      </div>
    </body>
    </html>
  `;

  // Create iframe and inject HTML to trigger printing
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    // Small timeout to allow images/fonts to load
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Remove the iframe after printing is dismissed
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }
}
