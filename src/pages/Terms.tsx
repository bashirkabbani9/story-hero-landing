import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Last updated: 8 March 2025
          </p>

          <section className="space-y-4 text-foreground/90 text-[15px] leading-relaxed">
            <h2 className="font-display text-xl font-semibold text-foreground mt-8">1. About Little Hero Library</h2>
            <p>
              Little Hero Library ("we", "us", "our") is a subscription service that creates AI-personalised bedtime stories for children. By using our website and services, you agree to these terms.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">2. Eligibility</h2>
            <p>
              You must be at least 18 years old to create an account. Our stories are designed for children aged 3–12 and should be enjoyed under parental supervision.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">3. Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information when creating your account and to update it as needed. We reserve the right to suspend or terminate accounts that violate these terms.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">4. Subscriptions &amp; Payments</h2>
            <p>
              We offer monthly and annual subscription plans. All payments are processed securely through Stripe. Prices are displayed in GBP and include VAT where applicable.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Subscriptions renew automatically at the end of each billing period.</li>
              <li>You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period.</li>
              <li>We offer a 14-day money-back guarantee from the date of your first subscription payment.</li>
              <li>On-demand story purchases are one-time charges and are non-refundable once the story has been generated.</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">5. Story Content</h2>
            <p>
              Stories and illustrations are generated using artificial intelligence and are personalised based on the child profile information you provide. While we strive to produce age-appropriate, high-quality content, AI-generated content may occasionally contain imperfections.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Stories are generated for personal, non-commercial use only.</li>
              <li>You may not reproduce, distribute, or sell generated stories without our written permission.</li>
              <li>We retain ownership of the generated content but grant you a personal licence to view and enjoy your stories.</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the service for any unlawful purpose.</li>
              <li>Attempt to bypass, disable, or interfere with any security features.</li>
              <li>Share your account with others or create multiple accounts to circumvent usage limits.</li>
              <li>Submit inappropriate, offensive, or harmful content in child profiles or story preferences.</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Little Hero Library shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the amount you have paid us in the 12 months preceding the claim.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">8. Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. We will notify you of significant changes via email or a notice on our website. Continued use of the service after changes constitutes acceptance of the updated terms.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">9. Governing Law</h2>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">10. Contact Us</h2>
            <p>
              If you have any questions about these terms, please contact us at{" "}
              <a href="mailto:hello@littleherolibrary.com" className="text-primary hover:underline">
                hello@littleherolibrary.com
              </a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
