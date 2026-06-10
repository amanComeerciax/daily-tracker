import { QuickEntryData, ExpenseCategory } from "@/types";
import { CATEGORY_KEYWORDS } from "./constants";

/**
 * Parse quick expense entry text like "120 lunch" into structured data.
 *
 * Supports formats:
 *   - "120 lunch"         → { amount: 120, category: "Food", description: "lunch" }
 *   - "300 petrol"        → { amount: 300, category: "Travel", description: "petrol" }
 *   - "50 tea"            → { amount: 50, category: "Food", description: "tea" }
 *   - "1500 electricity"  → { amount: 1500, category: "Bills", description: "electricity" }
 *   - "200 random thing"  → { amount: 200, category: "Other", description: "random thing" }
 */
export function parseQuickEntry(input: string): QuickEntryData | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match: optional currency symbol, number (with optional decimals), then description
  const match = trimmed.match(/^[₹$€£]?\s*(\d+(?:\.\d+)?)\s+(.+)$/);
  if (!match) return null;

  const amount = parseFloat(match[1]);
  const description = match[2].trim();

  if (isNaN(amount) || amount <= 0) return null;

  // Detect category from description keywords
  const category = detectCategory(description);

  return {
    amount,
    category,
    description: capitalizeFirst(description),
  };
}

/**
 * Detect expense category from description text using keyword matching.
 * Checks each word in the description against the keyword map.
 */
export function detectCategory(description: string): ExpenseCategory {
  const words = description.toLowerCase().split(/\s+/);

  for (const word of words) {
    if (CATEGORY_KEYWORDS[word]) {
      return CATEGORY_KEYWORDS[word];
    }
  }

  // Try partial matching for compound words
  const fullText = description.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (fullText.includes(keyword)) {
      return category;
    }
  }

  return "Other";
}

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
