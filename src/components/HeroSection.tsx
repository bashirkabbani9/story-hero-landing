import { Star, Moon, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen gradient-hero flex items-center overflow-hidden pt-20">
      {/* Floating decorative elements */}
      <div className="absolute top-24 left-8 animate-float">
        <Star className="w-6 h-6 text-amber-warm opacity-70" />
      </div>
      <div className="absolute top-40 right-12 animate-float-delay">
        <Moon className="w-8 h-8 text-amber-warm opacity-50" />
      </div>
      <div className="absolute bottom-32 left-16 animate-float-delay">
        <Star className="w-4 h-4 text-amber-warm opacity-60" />
      </div>
      <div className="absolute top-32 left-1/3 animate-twinkle">
        <Sparkles className="w-5 h-5 text-amber-warm opacity-40" />
      </div>
      <div className="absolute bottom-40 right-24 animate-twinkle-delay">
        <Star className="w-5 h-5 text-amber-warm opacity-50" />
      </div>
      <div className="absolute top-1/2 right-8 animate-twinkle">
        <Sparkles className="w-4 h-4 text-amber-warm opacity-30" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-warm/20 border border-amber-warm/30 rounded-full px-4 py-1.5 mb-6">
              <Star className="w-3.5 h-3.5 text-amber-warm" />
              <span className="text-amber-warm text-sm font-medium">Personalised just for your child</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Your Child, The Hero of Every Bedtime Story
            </h1>

            <p className="text-lg sm:text-xl text-primary-foreground/80 leading-relaxed mb-8">
              Every Sunday, a brand new personalised story appears in your child's library — with beautiful illustrations where they are the hero. From <span className="font-semibold text-amber-warm">£5.99/month.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#get-story"
                className="inline-flex items-center justify-center gap-2 gradient-amber text-accent-foreground font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:opacity-90 transition-all hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                Get a Free Personalised Story
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-primary-foreground/60 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-amber-warm/20 flex items-center justify-center">
                  <span className="text-amber-warm text-xs">✓</span>
                </div>
                No credit card needed
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-amber-warm/20 flex items-center justify-center">
                  <span className="text-amber-warm text-xs">✓</span>
                </div>
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-full">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-amber-warm/20 rounded-3xl blur-3xl scale-110" />
              <img
                src={heroImage}
                alt="Child reading a magical glowing storybook in bed"
                className="relative rounded-3xl shadow-2xl w-full object-cover"
                style={{ maxHeight: "480px" }}
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl px-4 py-3 shadow-card flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <div>
                  <p className="text-xs text-muted-foreground">New story ready!</p>
                  <p className="text-sm font-semibold text-foreground font-display">Every Sunday at 5pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80H1440V20C1200 60 900 0 600 40C300 80 100 20 0 40V80Z" fill="hsl(30, 100%, 97%)" />
        </svg>
      </div>
    </section>
  );
}
