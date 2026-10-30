import { Shield, Moon, Palette, Heart, Clock, Users } from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Your child is the hero",
    description:
      "Every story stars your child by name, building confidence and a love of reading from an early age.",
  },
  {
    icon: Palette,
    title: "Beautiful AI illustrations",
    description:
      "Each story comes with unique, hand-style illustrations that bring the adventure to life.",
  },
  {
    icon: Clock,
    title: "New story every Sunday",
    description:
      "A fresh personalised bedtime story arrives at 5pm every Sunday — perfectly timed for the week ahead.",
  },
  {
    icon: Moon,
    title: "Designed for bedtime",
    description:
      "Dark mode, gentle colours, and a page-turning reader — built so screens don't keep little ones awake.",
  },
  {
    icon: Shield,
    title: "Safe & private",
    description:
      "We ask only for what a story needs, and never a surname, photo, school or address. No ads and no tracking cookies.",
  },
  {
    icon: Users,
    title: "Multiple children",
    description:
      "Add profiles for siblings and each child gets their own personalised stories and library.",
  },
];

export default function WhyParentsLoveIt() {
  return (
    <section className="py-20 px-4 bg-cream-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why Parents Love Little Hero Library
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            More than just stories — it's a bedtime ritual your family will
            treasure.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="flex gap-4 bg-card rounded-2xl p-6 border border-border shadow-sm"
            >
              <div className="w-10 h-10 bg-purple-light rounded-xl flex items-center justify-center flex-shrink-0">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  {b.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
