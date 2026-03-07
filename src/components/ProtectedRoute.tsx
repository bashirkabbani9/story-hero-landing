import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Moon } from "lucide-react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, hasChildren } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-primary-foreground">
          <div className="w-14 h-14 gradient-amber rounded-full flex items-center justify-center animate-pulse">
            <Moon className="w-7 h-7 text-accent-foreground" />
          </div>
          <p className="font-display text-lg">Loading your stories…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // If user has no child profiles and isn't already on onboarding, redirect there
  if (!hasChildren && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
