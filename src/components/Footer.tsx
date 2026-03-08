import { Moon, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-foreground py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-purple rounded-full flex items-center justify-center">
              <Moon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
            <span className="font-display font-bold text-xl text-primary-foreground block">
                Little Hero Library
              </span>
              <span className="text-primary-foreground/50 text-xs">
                Where every child is the hero
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
            <a href="#how-it-works" className="hover:text-primary-foreground transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hover:text-primary-foreground transition-colors">
              Pricing
            </a>
            <Link to="/privacy" className="hover:text-primary-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary-foreground transition-colors">
              Terms
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-primary-foreground/40 text-sm flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-amber-warm" /> in the UK
          </p>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/30 text-xs">
            © {new Date().getFullYear()} Little Hero Library. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
