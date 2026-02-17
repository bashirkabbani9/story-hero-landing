import { User, Sparkles, BookOpen } from "lucide-react";

const steps = [
  {
    icon: User,
    number: "01",
    title: "Tell us about your child",
    description:
      "Share your child's name, age, and favourite interests — from dinosaurs and space to fairies and football. The more you tell us, the more magical the story.",
    colour: "bg-purple-light",
    iconColour: "text-primary",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Stories appear like magic",
    description:
      "Every Sunday at 5pm, a brand new personalised story arrives in your child's library — perfectly timed for a cosy bedtime read together.",
    colour: "bg-amber-light",
    iconColour: "text-amber-700",
  },
  {
    icon: BookOpen,
    number: "03",
    title: "Read together at bedtime",
    description:
      "Enjoy beautiful illustrations, a page-turning reader, and dark mode — designed for snuggling up at bedtime with no harsh screen glare.",
    colour: "bg-purple-light",
    iconColour: "text-primary",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-cream-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-purple-light rounded-full px-4 py-1.5 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">How it works</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Stories Made for Your Child,<br className="hidden sm:block" /> in Three Simple Steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Getting started takes less than two minutes. Your child's first personalised adventure is just around the corner.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-card rounded-3xl p-8 shadow-card border border-border group hover:shadow-purple transition-all duration-300 hover:-translate-y-1"
            >
              {/* Number badge */}
              <div className="absolute -top-4 left-8">
                <div className="gradient-purple text-primary-foreground text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-purple">
                  {index + 1}
                </div>
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 ${step.colour} rounded-2xl flex items-center justify-center mb-6 mt-2 group-hover:scale-110 transition-transform`}>
                <step.icon className={`w-7 h-7 ${step.iconColour}`} />
              </div>

              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Connector line for desktop */}
        <div className="hidden md:flex items-center justify-center mt-8 gap-0">
          <div className="flex-1 max-w-xs h-px bg-border" />
          <div className="mx-4 text-2xl animate-float">🌙</div>
          <div className="flex-1 max-w-xs h-px bg-border" />
          <div className="mx-4 text-2xl animate-twinkle">⭐</div>
          <div className="flex-1 max-w-xs h-px bg-border" />
        </div>
      </div>
    </section>
  );
}
