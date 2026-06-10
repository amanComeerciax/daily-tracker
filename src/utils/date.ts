import { startOfMonth, endOfMonth, startOfDay, endOfDay, addMonths, subMonths } from "date-fns";

/**
 * Calculates the start and end dates of a billing cycle based on a given start date number.
 * @param date - The current date to calculate the cycle for
 * @param cycleStartDay - The day of the month the cycle starts (1-28)
 */
export function getCycleDates(date: Date, cycleStartDay: number = 1) {
  if (!cycleStartDay || cycleStartDay === 1) {
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  }

  const currentDay = date.getDate();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  let start: Date;
  let end: Date;

  if (currentDay >= cycleStartDay) {
    // Current date is in the "current" part of the cycle
    // Example: cycleStart = 10, current = Jun 15. Cycle = Jun 10 to Jul 9
    start = new Date(currentYear, currentMonth, cycleStartDay);
    const nextMonth = addMonths(start, 1);
    end = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), cycleStartDay - 1);
  } else {
    // Current date is in the "tail end" of the previous month's cycle
    // Example: cycleStart = 10, current = Jun 5. Cycle = May 10 to Jun 9
    const prevMonth = subMonths(new Date(currentYear, currentMonth, 1), 1);
    start = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), cycleStartDay);
    end = new Date(currentYear, currentMonth, cycleStartDay - 1);
  }

  return {
    start: startOfDay(start),
    end: endOfDay(end),
  };
}

/**
 * Calculates the start and end dates for a specific named month's cycle.
 * @param month - The month (1-12)
 * @param year - The year
 * @param cycleStartDay - The day of the month the cycle starts (1-28)
 */
export function getSpecificCycleDates(month: number, year: number, cycleStartDay: number = 1) {
  if (!cycleStartDay || cycleStartDay === 1) {
    const d = new Date(year, month - 1, 1);
    return {
      start: startOfMonth(d),
      end: endOfMonth(d),
    };
  }

  const start = new Date(year, month - 1, cycleStartDay);
  const nextMonth = addMonths(start, 1);
  const end = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), cycleStartDay - 1);

  return {
    start: startOfDay(start),
    end: endOfDay(end),
  };
}
