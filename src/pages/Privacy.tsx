import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Last updated: 8 March 2025
          </p>

          <section className="space-y-4 text-foreground/90 text-[15px] leading-relaxed">
            <p>
              Little Hero Library ("we", "us", "our") is committed to protecting your privacy and the privacy of your children. This policy explains how we collect, use, and safeguard your information.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">1. Information We Collect</h2>
            <p><strong>Account information:</strong> When you sign up, we collect your email address and password (securely hashed).</p>
            <p><strong>Child profile information:</strong> To personalise stories, we collect your child's first name, age, and optional interests or preferences. We never collect surnames, photos, school names, addresses, or any other identifying information about your child.</p>
            <p><strong>Payment information:</strong> Payments are processed by Stripe. We never see or store your full card details. Stripe may collect billing information as described in their privacy policy.</p>
            <p><strong>Usage data:</strong> We collect basic analytics such as pages visited and features used to improve the service.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To create personalised stories tailored to your child.</li>
              <li>To manage your subscription and process payments.</li>
              <li>To send transactional emails (welcome, story delivery, receipts).</li>
              <li>To improve our service and fix issues.</li>
              <li>We will never sell your personal data to third parties.</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">3. AI &amp; Story Generation</h2>
            <p>
              We use artificial intelligence (OpenAI) to generate stories and illustrations. Your child's first name and age are sent to the AI to personalise the story. No other personal data is shared with the AI provider. Generated stories are stored in our database and associated with your account.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">4. Data Storage &amp; Security</h2>
            <p>
              Your data is stored securely using Supabase (hosted on AWS in the EU). We use industry-standard encryption in transit (TLS) and at rest. Access to your data is protected by Row Level Security — you can only access your own account data.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">5. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase</strong> — authentication and database hosting.</li>
              <li><strong>Stripe</strong> — payment processing.</li>
              <li><strong>OpenAI</strong> — AI story and illustration generation.</li>
              <li><strong>Vercel</strong> — website hosting.</li>
            </ul>
            <p>Each of these services has their own privacy policy, and we encourage you to review them.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">6. Children's Privacy</h2>
            <p>
              We take children's privacy seriously. We only collect the minimum information needed to personalise stories (first name, age, interests). We do not knowingly collect data directly from children — all account creation and management is done by parents or guardians.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">7. Cookies</h2>
            <p>
              We use essential cookies to keep you logged in and remember your preferences (such as bedtime mode). We do not use advertising or tracking cookies.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">8. Your Rights</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and all associated data.</li>
              <li>Export your data in a portable format.</li>
              <li>Withdraw consent for data processing at any time.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:hello@littleherolibrary.com" className="text-primary hover:underline">
                hello@littleherolibrary.com
              </a>.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">9. Data Retention</h2>
            <p>
              We retain your account data and stories for as long as your account is active. If you delete your account, all associated data (including child profiles, stories, and illustrations) will be permanently deleted within 30 days.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of significant changes via email. The "Last updated" date at the top of this page reflects the most recent revision.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">11. Contact Us</h2>
            <p>
              If you have any questions or concerns about your privacy, please contact us at{" "}
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
