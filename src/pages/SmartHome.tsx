import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Index from "./Index";
import { Moon } from "lucide-react";

export default function SmartHome() {
  const { user, loading, hasChildren } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-primary-foreground">
          <div className="w-14 h-14 gradient-amber rounded-full flex items-center justify-center animate-pulse">
            <Moon className="w-7 h-7 text-accent-foreground" />
          </div>
          <p className="font-display text-lg">Little Hero Library…</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={hasChildren ? "/dashboard" : "/onboarding"} replace />;
  }

  return <Index />;
}
