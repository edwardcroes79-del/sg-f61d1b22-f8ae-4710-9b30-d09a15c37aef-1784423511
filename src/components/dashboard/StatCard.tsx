import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, className }: StatCardProps) {
  return (
    <div className={cn("card-premium p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && trendValue && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend === "up" && "bg-success/10 text-success",
            trend === "down" && "bg-danger/10 text-danger",
            trend === "neutral" && "bg-muted text-muted-foreground"
          )}>
            {trendValue}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="label-mono">{title}</p>
        <p className="stat-value text-foreground">{value}</p>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}