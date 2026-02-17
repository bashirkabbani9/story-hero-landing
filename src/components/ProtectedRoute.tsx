import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Moon } from "lucide-react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

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
  return <>{children}</>;
}
