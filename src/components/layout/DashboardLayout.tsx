import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { useWorkshop } from "@/contexts/WorkshopContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

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
    ["--brand-primary" as string]: workshop?.primary_color || "#D97706",
    ["--brand-secondary" as string]: workshop?.secondary_color || "#64748B",
  };

  return (
    <div className="min-h-screen bg-background flex" style={brandStyle}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-heading font-semibold">{title}</h1>
            </div>
          )}
          <div className="animate-fade-in">{children}</div>
        </main>
        <footer className="border-t bg-card/50 px-6 py-4 text-xs text-muted-foreground flex justify-between items-center">
          <span>© {new Date().getFullYear()} {workshop?.name || "Torque Log"}</span>
          <span>{workshop?.powered_by || "Powered by Torque Log"}</span>
        </footer>
      </div>
    </div>
  );
}