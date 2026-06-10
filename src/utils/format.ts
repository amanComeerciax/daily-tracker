import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { CURRENCY_SYMBOL, CURRENCY_LOCALE } from "./constants";

/**
 * Format a number as currency (₹1,200.00)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with the currency symbol (₹1,200)
 */
export function formatAmount(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString(CURRENCY_LOCALE)}`;
}

/**
 * Format a date string for display (10 June 2026)
 */
export function formatDate(date: Date | string): string {
  return format(new Date(date), "d MMMM yyyy");
}

/**
 * Format a date string as short format (10 Jun)
 */
export function formatDateShort(date: Date | string): string {
  return format(new Date(date), "d MMM");
}

/**
 * Format a date for input fields (yyyy-MM-dd)
 */
export function formatDateForInput(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd");
}

/**
 * Format a date as relative time (2 hours ago, yesterday, etc.)
 */
export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  if (isToday(d)) {
    return formatDistanceToNow(d, { addSuffix: true });
  }
  if (isYesterday(d)) {
    return "Yesterday";
  }
  return format(d, "d MMM yyyy");
}

/**
 * Get month and year from a date
 */
export function getMonthYear(date: Date = new Date()): {
  month: number;
  year: number;
} {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
