import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { useWorkshop } from "@/contexts/WorkshopContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

function hexToHsl(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const { workshop, loading: workshopLoading } = useWorkshop();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || workshopLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-mono text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const brandStyle: React.CSSProperties = {
    ["--primary" as string]: hexToHsl(workshop?.primary_color || "#D97706"),
    ["--primary-foreground" as string]: "0 0% 100%",
    ["--secondary" as string]: hexToHsl(workshop?.secondary_color || "#64748B"),
    ["--secondary-foreground" as string]: "0 0% 100%",
    ["--accent" as string]: hexToHsl(workshop?.primary_color || "#D97706"),
    ["--accent-foreground" as string]: "0 0% 100%",
    ["--ring" as string]: hexToHsl(workshop?.primary_color || "#D97706"),
    ["--sidebar-primary" as string]: hexToHsl(workshop?.primary_color || "#D97706"),
    ["--sidebar-primary-foreground" as string]: "0 0% 100%",
    ["--sidebar-ring" as string]: hexToHsl(workshop?.primary_color || "#D97706"),
  };

  return (
    <div className="min-h-screen bg-background flex" style={brandStyle}>
      <div className="hidden md:block print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden overflow-y-auto print:p-0 print:bg-white">
          {title && (
            <div className="mb-4 md:mb-6 print:hidden">
              <h1 className="text-xl md:text-2xl font-heading font-semibold">{title}</h1>
            </div>
          )}
          <div className="animate-fade-in max-w-7xl mx-auto print:max-w-none print:m-0">{children}</div>
        </main>
        <footer className="border-t bg-card/50 px-4 md:px-6 py-4 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-2 print:hidden">
          <span>© {new Date().getFullYear()} {workshop?.name || "Torque Log"}</span>
          <span>{workshop?.powered_by || "Powered by Torque Log"}</span>
        </footer>
      </div>
    </div>
  );
}