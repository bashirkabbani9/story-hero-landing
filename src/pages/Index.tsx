import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <LeadMagnetForm />
        <HowItWorks />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
