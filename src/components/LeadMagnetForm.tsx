import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function LeadMagnetForm() {
  const [formData, setFormData] = useState({
    parent_email: "",
    child_name: "",
    child_age: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await fetch("https://bashk1.app.n8n.cloud/webhook/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_email: formData.parent_email,
          child_name: formData.child_name,
          child_age: Number(formData.child_age),
        }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong. Please try again.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Oops! Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div id="get-story" className="py-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-card rounded-3xl p-10 shadow-card border border-border">
            <div className="text-5xl mb-5 animate-float">✨</div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-3">
              Check your email!
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              A personalised story for{" "}
              <span className="font-semibold text-primary">{formData.child_name}</span>{" "}
              is on its way ✨
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              We'll send it to <span className="font-medium">{formData.parent_email}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="get-story" className="py-20 px-4 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-light rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">Free for a limited time</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Get Your Child's First Story — Free
          </h2>
          <p className="text-muted-foreground text-lg">
            Enter a few details and we'll send a personalised story straight to your inbox.
          </p>
        </div>

        <div className="bg-card rounded-3xl p-8 sm:p-10 shadow-card border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="parent_email" className="block text-sm font-medium text-foreground mb-2">
                Your email address
              </label>
              <input
                id="parent_email"
                type="email"
                required
                value={formData.parent_email}
                onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="child_name" className="block text-sm font-medium text-foreground mb-2">
                Your child's first name
              </label>
              <input
                id="child_name"
                type="text"
                required
                maxLength={50}
                value={formData.child_name}
                onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
                placeholder="e.g. Lily or Jack"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="child_age" className="block text-sm font-medium text-foreground mb-2">
                Your child's age
              </label>
              <select
                id="child_age"
                required
                value={formData.child_age}
                onChange={(e) => setFormData({ ...formData, child_age: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Select age</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((age) => (
                  <option key={age} value={age}>
                    {age} {age === 1 ? "year old" : "years old"}
                  </option>
                ))}
              </select>
            </div>

            {status === "error" && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full gradient-amber text-accent-foreground font-semibold py-4 rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating your story…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Get a Free Personalised Story
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              No credit card required. No spam, ever. Unsubscribe at any time.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
