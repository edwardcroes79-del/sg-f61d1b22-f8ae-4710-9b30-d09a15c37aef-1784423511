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
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMileage(mileage: number): string {
  return mileage.toLocaleString("en-US");
}

export function daysUntil(date: string | Date): number {
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
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