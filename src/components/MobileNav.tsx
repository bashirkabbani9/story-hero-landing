import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, BookOpen, Settings } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/stories",   label: "Stories",   icon: BookOpen },
  { to: "/settings",  label: "Settings",  icon: Settings },
];

export default function MobileNav() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading || !user) return null;

  // Don't show inside story reader (full-screen immersive)
  if (pathname.startsWith("/story/") || pathname === "/onboarding") return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 sm:hidden border-t border-border bg-card/90 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to === "/dashboard" && pathname === "/");
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
