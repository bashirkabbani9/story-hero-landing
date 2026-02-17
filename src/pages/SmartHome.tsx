import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Index from "./Index";
import { Moon } from "lucide-react";

/**
 * Smart home route:
 * - If loading → show spinner
 * - If logged in → redirect to /dashboard
 * - If logged out → show landing page
 */
export default function SmartHome() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-primary-foreground">
          <div className="w-14 h-14 gradient-amber rounded-full flex items-center justify-center animate-pulse">
            <Moon className="w-7 h-7 text-accent-foreground" />
          </div>
          <p className="font-display text-lg">Loading…</p>
        </div>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return <Index />;
}
