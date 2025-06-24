import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the current date in the user's local timezone as YYYY-MM-DD format
 * This ensures entries are saved with the correct local date
 */
export function getLocalDateString(): string {
  const now = new Date();
  return now.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
}

/**
 * Convert a date string (YYYY-MM-DD) to a Date object in local timezone
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

/**
 * Format a date for display in the user's local timezone
 */
export function formatLocalDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
