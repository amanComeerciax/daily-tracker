// TypeScript interfaces for the Personal Finance Tracker

export interface IUser {
  _id?: string;
  clerkId: string;
  email: string;
  cycleStartDate?: number;
  createdAt: Date;
}

export interface IExpense {
  _id?: string;
  clerkId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface IIncome {
  _id?: string;
  clerkId: string;
  amount: number;
  source: IncomeSource;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface IBudget {
  _id?: string;
  clerkId: string;
  monthlyBudget: number;
  month: number;
  year: number;
  createdAt: Date;
}

// Enum types
export type ExpenseCategory =
  | "Food"
  | "Travel"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Health"
  | "Education"
  | "Other";

export type IncomeSource =
  | "Salary"
  | "Freelancing"
  | "Business"
  | "Bonus"
  | "Other";

// Form data types
export interface ExpenseFormData {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

export interface IncomeFormData {
  amount: number;
  source: IncomeSource;
  description: string;
  date: string;
}

export interface BudgetFormData {
  monthlyBudget: number;
}

export interface QuickEntryData {
  amount: number;
  category: ExpenseCategory;
  description: string;
}

// Dashboard types
export interface DashboardSummary {
  todayExpenses: number;
  monthlyExpenses: number;
  totalIncome: number;
  totalSavings: number;
  remainingBudget: number;
  monthlyBudget: number;
  isWarning?: boolean;
  isExceeded?: boolean;
}

export interface BudgetStatus {
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  isExceeded: boolean;
  isWarning: boolean;
}

// Chart data types
export interface CategoryChartData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyTrendData {
  month: string;
  amount: number;
}

export interface ExpenseGrowthData {
  date: string;
  amount: number;
}

// API response types
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter types
export interface ExpenseFilters {
  search?: string;
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface IncomeFilters {
  search?: string;
  source?: IncomeSource;
  page?: number;
  pageSize?: number;
}

// Daily expense group
export interface DailyExpenseGroup {
  date: string;
  expenses: IExpense[];
  total: number;
}
