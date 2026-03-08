import { Check, Star, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { redirectToStripeCheckout, PENDING_PRICE_KEY } from "@/lib/stripeCheckout";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Monthly",
    priceId: "price_1T1rzaBf7Ygg5uvwXAKt9iHz",
    price: "£7.99",
    period: "/month",
    description: "Perfect for trying it out",
    features: [
      "4 personalised stories per month",
      "Beautiful illustrations",
      "Page-turning reader",
      "Dark mode for bedtime",
      "Cancel anytime",
    ],
    cta: "Start Monthly",
    popular: false,
    gradient: "bg-card",
    ctaClass: "border-2 border-primary text-primary hover:gradient-purple hover:text-primary-foreground",
  },
  {
    name: "Annual",
    priceId: "price_1T1s0lBf7Ygg5uvwRoXojJwk",
    price: "£5.99",
    period: "/month",
    billed: "Billed £71.88/year",
    description: "Best value for committed readers",
    features: [
      "4 personalised stories per month",
      "Beautiful illustrations",
      "Page-turning reader",
      "Dark mode for bedtime",
      "Save 25% vs monthly",
      "Priority story queue",
    ],
    cta: "Start Annual Plan",
    popular: true,
    gradient: "gradient-hero",
    ctaClass: "gradient-amber text-accent-foreground",
  },
];

export default function PricingSection() {
  const { user, children: childProfiles } = useAuth();
  const navigate = useNavigate();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      // Store intended price so we can redirect after signup
      localStorage.setItem(PENDING_PRICE_KEY, priceId);
      navigate("/signup");
      return;
    }

    setLoadingPriceId(priceId);
    try {
      await redirectToStripeCheckout(priceId, user.email ?? undefined, user.id, childProfiles[0]?.id);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again." });
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <section id="pricing" className="py-20 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-purple-light rounded-full px-4 py-1.5 mb-4">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">Pricing</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, Honest Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Less than your morning coffee. More magical than you can imagine.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 border ${
                plan.popular
                  ? "border-purple-mid/30 shadow-purple"
                  : "border-border shadow-card"
              } ${plan.popular ? plan.gradient : plan.gradient} overflow-hidden`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-6 right-6">
                  <div className="gradient-amber text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`font-display text-xl font-bold mb-1 ${
                    plan.popular ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-display text-5xl font-bold ${
                      plan.popular ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-lg ${
                      plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                {plan.billed && (
                  <p className={`text-sm mt-1 ${plan.popular ? "text-amber-warm font-medium" : "text-muted-foreground"}`}>
                    {plan.billed} · Save 25%
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.popular ? "bg-amber-warm/30" : "bg-purple-light"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.popular ? "text-amber-warm" : "text-primary"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm ${
                        plan.popular ? "text-primary-foreground/90" : "text-foreground"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loadingPriceId === plan.priceId}
                className={`flex items-center justify-center gap-2 w-full text-center py-3.5 rounded-xl font-semibold transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 ${plan.ctaClass}`}
              >
                {loadingPriceId === plan.priceId && <Loader2 className="w-4 h-4 animate-spin" />}
                {plan.cta}
              </button>

              {!plan.popular && (
                <p className="text-center text-xs text-muted-foreground mt-3">
                  No commitment. Cancel anytime.
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8">
          🔒 Secure payments. Cancel anytime. 14-day money-back guarantee.
        </p>
      </div>
    </section>
  );
}
