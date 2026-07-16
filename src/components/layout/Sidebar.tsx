import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { useWorkshop } from "@/contexts/WorkshopContext";
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  Settings,
  LogOut,
  QrCode,
} from "lucide-react";
import { signOut } from "@/services/authService";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/vehicles", label: "Vehicles", icon: Car },
  { href: "/dashboard/qr-codes", label: "QR Codes", icon: QrCode },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const router = useRouter();
  const { workshop } = useWorkshop();

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  const primaryColor = workshop?.primary_color || "#D97706";

  return (
    <aside className="w-full md:w-56 lg:w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-4 md:p-6 border-b border-sidebar-border hidden md:flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          {workshop?.logo_url ? (
            <img src={workshop.logo_url} alt={workshop.name} className="w-8 h-8 object-contain rounded shrink-0" />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Wrench className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-heading font-semibold text-base lg:text-lg tracking-tight truncate">
            {workshop?.name || "Torque Log"}
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-3 md:py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 md:p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 md:py-2.5 min-h-[44px] rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}