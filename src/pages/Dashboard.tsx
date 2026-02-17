import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Child } from "@/lib/supabase";
import { Moon, BookOpen, Star, LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, signOut, children } = useAuth();
  const [child, setChild] = useState<Child | null>(null);

  useEffect(() => {
    if (children.length > 0) {
      setChild(children[0]);
    }
  }, [children]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center">
              <Moon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground">Bedtime Stories</span>
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="container max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-fade-up">
          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="w-24 h-24 gradient-hero rounded-full flex items-center justify-center shadow-purple">
              <BookOpen className="w-12 h-12 text-primary-foreground" />
            </div>
            <div className="absolute -top-2 -right-2 animate-twinkle">
              <Star className="w-6 h-6 text-amber-warm" />
            </div>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            {child ? (
              <>Welcome to <span className="text-gradient-purple">{child.name}</span>'s Library! 🌟</>
            ) : (
              "Welcome to your library!"
            )}
          </h1>

          <p className="text-muted-foreground text-xl max-w-xl mx-auto leading-relaxed mb-10">
            Your stories are being prepared with love and magic. Check back on Sunday at 5pm for{" "}
            {child ? <span className="font-semibold text-primary">{child.name}</span> : "your child"}'s first personalised adventure.
          </p>

          {/* Placeholder story card */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-card max-w-sm mx-auto">
            <div className="text-5xl mb-4 animate-float">📖</div>
            <div className="h-3 bg-purple-light rounded-full mb-3 w-3/4 mx-auto" />
            <div className="h-3 bg-muted rounded-full mb-2 w-full" />
            <div className="h-3 bg-muted rounded-full w-2/3 mx-auto" />
            <div className="mt-6 px-4 py-2 gradient-purple rounded-full text-primary-foreground text-sm font-medium inline-block opacity-50">
              Coming Sunday ✨
            </div>
          </div>

          {child && (
            <div className="mt-8 inline-flex items-center gap-3 bg-purple-light rounded-full px-5 py-2.5">
              <span className="text-sm text-primary font-medium">
                Language: {child.language} · Age: {child.age} · {child.interests.length} interests selected
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
