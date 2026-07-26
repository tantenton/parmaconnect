import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "IDR",
  locale = "id-ID",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function maskSensitive(value: string, visibleStart = 4, visibleEnd = 4): string {
  if (!value || value.length <= visibleStart + visibleEnd) {
    return "••••••••";
  }
  const start = value.slice(0, visibleStart);
  const end = value.slice(-visibleEnd);
  const middle = "•".repeat(Math.max(4, value.length - visibleStart - visibleEnd));
  return `${start}${middle}${end}`;
}

export function normalizeLicensePlate(plate: string): string {
  return plate.replace(/\s+/g, "").toUpperCase();
}
