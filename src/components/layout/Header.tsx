import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

export function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "AD";

  return (
    <>
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-semibold text-lg hidden sm:block">Workshop Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
}