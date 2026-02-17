import { BookOpen, Moon, Star } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center">
            <Moon className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg text-foreground">Bedtime Stories</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            How it works
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Pricing
          </a>
          <a
            href="#get-story"
            className="px-4 py-2 gradient-purple text-primary-foreground text-sm font-medium rounded-full shadow-purple hover:opacity-90 transition-opacity"
          >
            Get a Free Story
          </a>
        </div>
      </div>
    </nav>
  );
}
