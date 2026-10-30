import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does Little Hero Library work?",
    answer:
      "Every Sunday at 5pm, a brand new personalised bedtime story appears in your child's library. Each story features your child as the hero, with beautiful AI-generated illustrations. Simply set up a child profile with their name, age, and interests, and we do the rest.",
  },
  {
    question: "How much does Little Hero Library cost?",
    answer:
      "Little Hero Library starts from £5.99 per month on the annual plan, or £7.99 monthly. You can try it free with a personalised sample story — no credit card needed.",
  },
  {
    question: "What age range are the stories suitable for?",
    answer:
      "Our stories are designed for children aged 3 to 12. Each story is tailored to your child's age to ensure the language, themes, and complexity are age-appropriate.",
  },
  {
    question: "Is my child's data safe?",
    answer:
      "We collect only what is needed to make a story about your child: their first name, age, gender, and the interests and appearance details you choose to give us. We never collect surnames, photographs, school names or addresses. Data is encrypted in transit and at rest, and deleting your account removes everything, including the illustrations.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Absolutely. You can cancel anytime from your account settings — no questions asked. We also offer a 14-day money-back guarantee from the date of your first payment.",
  },
  {
    question: "Can I add more than one child?",
    answer:
      "Yes! You can create multiple child profiles and each child will receive their own personalised stories tailored to their name, age, and interests.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 bg-cream-dark">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-purple-light rounded-full px-4 py-1.5 mb-4">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">FAQ</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Everything you need to know about Little Hero Library.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-display font-semibold text-foreground">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div id={`faq-answer-${index}`} role="region" className="px-6 pb-5 -mt-1">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
