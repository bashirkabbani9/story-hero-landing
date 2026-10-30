import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import HowItWorks from "@/components/HowItWorks";
import WhyParentsLoveIt from "@/components/WhyParentsLoveIt";
import PricingSection from "@/components/PricingSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "Little Hero Library",
    description:
      "Every Sunday, a brand new personalised bedtime story arrives in your child's library — where they are the hero. Beautiful AI illustrations. From £5.99/month.",
    canonical: "/",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <LeadMagnetForm />
        <HowItWorks />
        <WhyParentsLoveIt />
        <PricingSection />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
