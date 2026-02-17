import { Link, useParams } from "react-router-dom";
import { Moon, ArrowLeft } from "lucide-react";

export default function StoryReader() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 gradient-purple rounded-full flex items-center justify-center">
              <Moon className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">Bedtime Stories</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="text-6xl mb-6 animate-float">📖</div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">Story Reader</h1>
        <p className="text-muted-foreground max-w-sm">
          The story reader is coming soon. Story ID: <code className="text-primary font-mono text-sm">{id}</code>
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 gradient-purple text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
      </main>
    </div>
  );
}
