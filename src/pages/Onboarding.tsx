import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Loader2, Star, Moon, Sparkles } from "lucide-react";

const TOTAL_STEPS = 5;

const INTERESTS = [
  { label: "Animals", emoji: "🐾" },
  { label: "Space", emoji: "🚀" },
  { label: "Nature", emoji: "🌿" },
  { label: "Cooking", emoji: "🍳" },
  { label: "Sports", emoji: "⚽" },
  { label: "Music", emoji: "🎵" },
  { label: "Art", emoji: "🎨" },
  { label: "Science", emoji: "🔬" },
  { label: "Trains", emoji: "🚂" },
  { label: "Dinosaurs", emoji: "🦕" },
  { label: "Fairies", emoji: "🧚" },
  { label: "Pirates", emoji: "🏴‍☠️" },
];

const LANGUAGES = [
  { label: "English (British)", value: "en-GB" },
  { label: "Arabic (العربية)", value: "ar" },
  { label: "French (Français)", value: "fr" },
  { label: "Spanish (Español)", value: "es" },
  { label: "Urdu (اردو)", value: "ur" },
  { label: "Turkish (Türkçe)", value: "tr" },
  { label: "German (Deutsch)", value: "de" },
];

type OnboardingData = {
  name: string;
  age: number | null;
  gender: string;
  interests: string[];
  language: string;
};

export default function Onboarding() {
  const { user, refreshChildren } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<OnboardingData>({
    name: "",
    age: null,
    gender: "",
    interests: [],
    language: "en-GB",
  });
  const [customInput, setCustomInput] = useState("");

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const toggleInterest = (label: string) => {
    setData((d) => ({
      ...d,
      interests: d.interests.includes(label)
        ? d.interests.filter((i) => i !== label)
        : [...d.interests, label],
    }));
  };

  const addCustomInterest = () => {
    const trimmed = customInput.trim();
    if (!trimmed || data.interests.includes(trimmed)) return;
    setData((d) => ({ ...d, interests: [...d.interests, trimmed] }));
    setCustomInput("");
  };

  const removeInterest = (label: string) => {
    setData((d) => ({ ...d, interests: d.interests.filter((i) => i !== label) }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError("");

    // Show completion step first
    setStep(TOTAL_STEPS + 1);

    const { error: insertError } = await supabase.from("children").insert({
      profile_id: user.id,
      name: data.name,
      age: data.age,
      gender: data.gender,
      interests: data.interests,
      language: data.language,
    });

    if (insertError) {
      setError(insertError.message);
      setStep(TOTAL_STEPS);
      setSubmitting(false);
      return;
    }

    await refreshChildren();

    // Wait for the animation to play before redirecting
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 3000);
  };

  const canProceed = () => {
    if (step === 1) return data.name.trim().length > 0;
    if (step === 2) return data.age !== null;
    if (step === 3) return data.gender !== "";
    if (step === 4) return data.interests.length > 0;
    if (step === 5) return data.language !== "";
    return false;
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col px-4 py-8">
      {/* Floating decorations */}
      <div className="fixed top-16 left-8 animate-float pointer-events-none">
        <Star className="w-5 h-5 text-amber-warm opacity-60" />
      </div>
      <div className="fixed top-32 right-12 animate-float-delay pointer-events-none">
        <Moon className="w-6 h-6 text-amber-warm opacity-40" />
      </div>
      <div className="fixed bottom-32 right-8 animate-twinkle pointer-events-none">
        <Sparkles className="w-5 h-5 text-amber-warm opacity-50" />
      </div>

      <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
        {/* Progress bar */}
        {step <= TOTAL_STEPS && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 mx-0.5 rounded-full transition-all duration-500 ${
                    i + 1 <= step ? "bg-amber-warm" : "bg-primary-foreground/20"
                  }`}
                />
              ))}
            </div>
            <p className="text-primary-foreground/60 text-xs text-center">
              Step {step} of {TOTAL_STEPS}
            </p>
          </div>
        )}

        {/* Step content */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Step 1: Child's name */}
          {step === 1 && (
            <StepWrapper key="step1">
              <StepHeading>What's your child's name?</StepHeading>
              <input
                type="text"
                autoFocus
                maxLength={50}
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && canProceed() && goNext()}
                placeholder="e.g. Lily or Jack"
                className="w-full text-center text-2xl font-display font-semibold px-6 py-5 rounded-2xl border-2 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-amber-warm transition-all backdrop-blur-sm"
              />
            </StepWrapper>
          )}

          {/* Step 2: Child's age */}
          {step === 2 && (
            <StepWrapper key="step2">
              <StepHeading>How old is {data.name}?</StepHeading>
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((age) => (
                  <button
                    key={age}
                    onClick={() => setData({ ...data, age })}
                    className={`aspect-square rounded-2xl text-3xl font-display font-bold transition-all hover:scale-105 ${
                      data.age === age
                        ? "gradient-amber text-accent-foreground shadow-lg scale-105"
                        : "bg-primary-foreground/10 text-primary-foreground border-2 border-primary-foreground/20 hover:border-amber-warm"
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step 3: Gender */}
          {step === 3 && (
            <StepWrapper key="step3">
              <StepHeading>Is {data.name} a boy or a girl?</StepHeading>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Boy", emoji: "🧒", value: "boy" },
                  { label: "Girl", emoji: "👧", value: "girl" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setData({ ...data, gender: option.value })}
                    className={`flex flex-col items-center justify-center gap-3 py-10 rounded-3xl border-2 text-primary-foreground transition-all hover:scale-105 ${
                      data.gender === option.value
                        ? "border-amber-warm bg-amber-warm/20 shadow-lg scale-105"
                        : "border-primary-foreground/20 bg-primary-foreground/10 hover:border-amber-warm/50"
                    }`}
                  >
                    <span className="text-6xl">{option.emoji}</span>
                    <span className="font-display font-bold text-xl">{option.label}</span>
                  </button>
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <StepWrapper key="step4">
              <StepHeading>What does {data.name} love?</StepHeading>
              <p className="text-primary-foreground/70 text-center mb-6 -mt-2">Pick as many as you like!</p>
              <div className="grid grid-cols-3 gap-3">
                {INTERESTS.map((interest) => {
                  const selected = data.interests.includes(interest.label);
                  return (
                    <button
                      key={interest.label}
                      onClick={() => toggleInterest(interest.label)}
                      className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                        selected
                          ? "border-amber-warm bg-amber-warm/20 text-primary-foreground shadow-md scale-105"
                          : "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:border-amber-warm/50"
                      }`}
                    >
                      <span className="text-3xl">{interest.emoji}</span>
                      <span className="text-xs font-medium">{interest.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom interest input */}
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
                  placeholder="Add your own..."
                  maxLength={40}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-amber-warm transition-all text-sm"
                />
                <button
                  onClick={addCustomInterest}
                  disabled={!customInput.trim()}
                  className="px-4 py-3 rounded-xl border-2 border-amber-warm bg-amber-warm/20 text-primary-foreground font-semibold text-sm disabled:opacity-40 transition-all"
                >
                  Add
                </button>
              </div>

              {/* Custom tags */}
              {data.interests.filter((i) => !INTERESTS.some((p) => p.label === i)).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.interests
                    .filter((i) => !INTERESTS.some((p) => p.label === i))
                    .map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-warm/20 border border-amber-warm text-primary-foreground text-xs font-medium"
                      >
                        {tag}
                        <button
                          onClick={() => removeInterest(tag)}
                          className="text-primary-foreground/60 hover:text-primary-foreground transition-colors leading-none"
                          aria-label={`Remove ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </StepWrapper>
          )}

          {/* Step 5: Language */}
          {step === 5 && (
            <StepWrapper key="step5">
              <StepHeading>What language should stories be in?</StepHeading>
              <div className="space-y-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setData({ ...data, language: lang.value })}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${
                      data.language === lang.value
                        ? "border-amber-warm bg-amber-warm/20 text-primary-foreground shadow-md"
                        : "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:border-amber-warm/50"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Final: completion animation */}
          {step === TOTAL_STEPS + 1 && (
            <StepWrapper key="final">
              <div className="text-center py-8 flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 gradient-amber rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <span className="text-5xl">📖</span>
                  </div>
                  <div className="absolute -top-2 -right-2 animate-twinkle">
                    <Star className="w-6 h-6 text-amber-warm" />
                  </div>
                  <div className="absolute -bottom-1 -left-3 animate-float">
                    <Sparkles className="w-5 h-5 text-amber-warm" />
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold text-primary-foreground mb-2">
                    All set! ✨
                  </h2>
                  <p className="text-primary-foreground/80 text-lg">
                    We're creating <span className="font-semibold text-amber-warm">{data.name}</span>'s first adventure…
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  {["🌙", "⭐", "🌟", "✨", "💫"].map((star, i) => (
                    <span
                      key={i}
                      className="text-2xl animate-twinkle"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    >
                      {star}
                    </span>
                  ))}
                </div>
                {submitting && (
                  <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up your library…
                  </div>
                )}
              </div>
            </StepWrapper>
          )}
        </div>

        {/* Navigation buttons */}
        {step <= TOTAL_STEPS && (
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-primary-foreground/20 text-primary-foreground font-medium hover:bg-primary-foreground/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {error && (
              <p className="text-sm text-destructive bg-destructive/20 rounded-lg px-3 py-2 flex-1">
                {error}
              </p>
            )}

            <button
              onClick={step === TOTAL_STEPS ? handleSubmit : goNext}
              disabled={!canProceed() || submitting}
              className="flex-1 gradient-amber text-accent-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === TOTAL_STEPS ? (
                submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Let's go!
                  </>
                )
              ) : (
                "Continue →"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepWrapper({ children, key }: { children: React.ReactNode; key?: string }) {
  return (
    <div className="animate-fade-up flex flex-col gap-6">
      {children}
    </div>
  );
}

function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground text-center leading-snug">
      {children}
    </h2>
  );
}
