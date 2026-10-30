import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

export default function Pricing() {
  useSEO({
    title: "Pricing",
    description:
      "Choose your Little Hero Library plan. Personalised bedtime stories at £7.99/month, or £71.88 a year which works out at £5.99/month. Free sample story, no credit card required.",
    canonical: "/pricing",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <PricingSection />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
