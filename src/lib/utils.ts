import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateQRSlug(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatDate(date: string | Date): string {
  const input = typeof date === "string" ? date : date.toISOString().slice(0, 10);
  const [year, month, day] = input.split("T")[0].split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMileage(mileage: number): string {
  return mileage.toLocaleString("en-US");
}

export function daysUntil(date: string | Date): number {
  const input = typeof date === "string" ? date : date.toISOString().slice(0, 10);
  const [year, month, day] = input.split("T")[0].split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getServiceStatus(nextDate?: string | null, nextMileage?: number | null, currentMileage?: number | null): {
  status: "upcoming" | "due" | "overdue";
  daysRemaining: number | null;
  mileageRemaining: number | null;
  message: string;
  color: string;
  label: string;
} {
  const days = nextDate ? daysUntil(nextDate) : null;
  const mileage = nextMileage && currentMileage ? nextMileage - currentMileage : null;

  if (days !== null && days < 0) {
    return {
      status: "overdue",
      daysRemaining: days,
      mileageRemaining: mileage,
      message: `Overdue by ${Math.abs(days)} days`,
      color: "bg-danger/10 text-danger",
      label: "Overdue",
    };
  }

  if (days !== null && days <= 7) {
    return {
      status: "due",
      daysRemaining: days,
      mileageRemaining: mileage,
      message: days === 0 ? "Due today" : `Due in ${days} days`,
      color: "bg-warning/10 text-warning",
      label: "Due soon",
    };
  }

  return {
    status: "upcoming",
    daysRemaining: days,
    mileageRemaining: mileage,
    message: days !== null ? `${days} days remaining` : "No date set",
    color: "bg-success/10 text-success",
    label: "Upcoming",
  };
}