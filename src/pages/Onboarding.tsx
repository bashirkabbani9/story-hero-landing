import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Loader2, Star, Moon, Sparkles } from "lucide-react";
import { MAX_CHILDREN_PER_ACCOUNT } from "@/lib/config";

const TOTAL_STEPS = 5;

const SKIN_TONES = [
  { hex: "#FDEBD0", desc: "fair skin" },
  { hex: "#F5CBA7", desc: "light skin" },
  { hex: "#E0B88A", desc: "light olive skin" },
  { hex: "#C68642", desc: "warm brown skin" },
  { hex: "#8D5524", desc: "medium-brown skin" },
  { hex: "#5C3A1E", desc: "dark brown skin" },
  { hex: "#3B2410", desc: "deep brown skin" },
];

const HAIR_COLOURS = [
  { hex: "#FAE3B4", desc: "blonde" },
  { hex: "#C4873A", desc: "ginger" },
  { hex: "#8B4513", desc: "light brown" },
  { hex: "#4A2912", desc: "dark brown" },
  { hex: "#1C1008", desc: "black" },
  { hex: "#B7410E", desc: "red" },
  { hex: "#D4D4D4", desc: "grey" },
];

const HAIR_STYLES = ["Short", "Long", "Curly", "Straight", "Braids", "Afro"];

const EYE_COLOURS = [
  { hex: "#6B8E23", desc: "green" },
  { hex: "#4682B4", desc: "blue" },
  { hex: "#8B4513", desc: "brown" },
  { hex: "#2F1B0E", desc: "dark brown" },
  { hex: "#BDB76B", desc: "hazel" },
];

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
  { label: "Superheroes", emoji: "🦸" },
  { label: "Ocean", emoji: "🌊" },
];

type Appearance = {
  skinTone: string;
  hairColour: string;
  hairStyle: string;
  eyeColour: string;
};

type OnboardingData = {
  name: string;
  age: number | null;
  gender: string;
  appearance: Appearance;
  // null until the parent has answered, true if they consented, false if they declined.
  // Deliberately tri-state: "has not been asked yet" and "said no" are different things, and
  // only the first should block the step.
  appearanceConsent: boolean | null;
  interests: string[];
  language: string;
};

// Which wording the parent agreed to, stored alongside the consent so a consent given under
// older wording stays distinguishable from one given under the current text.
const APPEARANCE_CONSENT_VERSION = "2026-10-29";

export default function Onboarding() {
  const { user, children: existingChildren, refreshChildren } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<OnboardingData>({
    name: "",
    age: null,
    gender: "",
    appearance: { skinTone: "", hairColour: "", hairStyle: "", eyeColour: "" },
    appearanceConsent: null,
    interests: [],
    // V1 generates English only. The column and the per child data model stay, so
    // multilingual is deferred rather than discarded, but nothing asks the parent to
    // choose a language the pipeline would ignore. See rewrite-requirements.md.
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

  const buildCharacterDescription = () => {
    // Declined is a real, supported path, not a degraded one.
    //
    // The child still gets a character reference image, generated from their age and gender
    // alone, and every page of every story is then drawn from that picture. So they still look
    // identical throughout. What changes is only that the likeness is not matched to their own
    // skin, hair and eyes.
    //
    // This path existing is what makes the consent valid. Consent is not freely given if the
    // service is conditional on it, so a product that refused to work without appearance data
    // would have collected invalid consent, which is worse than collecting none.
    if (data.appearanceConsent !== true) {
      return `A ${data.age}-year-old ${data.gender}`;
    }

    const skin = SKIN_TONES.find((s) => s.hex === data.appearance.skinTone)?.desc ?? "";
    const hairCol = HAIR_COLOURS.find((h) => h.hex === data.appearance.hairColour)?.desc ?? "";
    const hairSty = data.appearance.hairStyle ? data.appearance.hairStyle.toLowerCase() : "";
    const eye = EYE_COLOURS.find((e) => e.hex === data.appearance.eyeColour)?.desc ?? "";
    const parts: string[] = [];
    parts.push(`A ${data.age}-year-old ${data.gender}`);
    if (skin) parts[0] += ` with ${skin}`;
    if (hairSty && hairCol) parts.push(`${hairSty} ${hairCol} hair`);
    else if (hairCol) parts.push(`${hairCol} hair`);
    else if (hairSty) parts.push(`${hairSty} hair`);
    if (eye) parts.push(`${eye} eyes`);
    return parts.join(", ");
  };

  const handleSubmit = async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    setError("");

    // Show completion step first
    setStep(TOTAL_STEPS + 1);

    const characterDescription = buildCharacterDescription();
    const consented = data.appearanceConsent === true;

    const { error: insertError } = await supabase.from("children").insert({
      profile_id: user.id,
      name: data.name,
      age: data.age,
      gender: data.gender,
      interests: data.interests,
      language: data.language,
      character_description: characterDescription,
      // The record of consent, written in the same statement as the data it covers so the two
      // cannot drift apart. When the parent declines, character_description holds only age and
      // gender, so there is no appearance data sitting behind a false flag.
      appearance_consent: consented,
      appearance_consent_at: consented ? new Date().toISOString() : null,
      appearance_consent_version: consented ? APPEARANCE_CONSENT_VERSION : null,
    });

    if (insertError) {
      // The only thing the children insert policy checks beyond ownership is the count,
      // and profile_id always comes from the signed in user, so a 42501 here means the
      // account is at its limit rather than anything the parent can fix by retrying.
      const atLimit =
        insertError.code === "42501" ||
        insertError.message.includes("row-level security");
      setError(
        atLimit
          ? `You can have up to ${MAX_CHILDREN_PER_ACCOUNT} children on one account. Remove one in Settings to add another.`
          : insertError.message
      );
      setStep(TOTAL_STEPS);
      setSubmitting(false);
      return;
    }

    await refreshChildren();

    // Wait for the animation to play before redirecting
    setTimeout(() => {
      navigate("/pricing", { replace: true });
    }, 2000);
  };

  const canProceed = () => {
    if (step === 1) return data.name.trim().length > 0;
    if (step === 2) return data.age !== null;
    if (step === 3) return data.gender !== "";
    if (step === 4) {
      // Declining is a complete answer and moves the parent on immediately.
      if (data.appearanceConsent === false) return true;
      // Not answered yet, so there is nothing to continue with.
      if (data.appearanceConsent !== true) return false;
      // Consented, so the details actually have to be filled in. All four are required because
      // a half-filled description describes a different child than the one intended.
      const a = data.appearance;
      return (
        a.skinTone !== "" && a.hairColour !== "" && a.hairStyle !== "" && a.eyeColour !== ""
      );
    }
    if (step === 5) return data.interests.length > 0;
    return false;
  };

  // Already at the limit, so do not walk them through six steps to a refusal at the end.
  // The database policy is the real enforcement, this just stops the wasted journey.
  if (existingChildren.length >= MAX_CHILDREN_PER_ACCOUNT) {
    return (
      <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center space-y-5">
          <Sparkles className="w-8 h-8 text-amber-warm mx-auto" />
          <h1 className="font-display text-2xl font-bold text-primary-foreground">
            You already have {existingChildren.length} children on this account
          </h1>
          <p className="text-primary-foreground/80">
            One account covers up to {MAX_CHILDREN_PER_ACCOUNT}. Remove a child in Settings if you
            want to add a different one.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/dashboard"
              className="flex-1 gradient-amber text-accent-foreground font-semibold py-3 rounded-xl"
            >
              Go to dashboard
            </Link>
            <Link
              to="/settings"
              className="flex-1 py-3 rounded-xl border-2 border-primary-foreground/20 text-primary-foreground font-medium"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        {/* A parent adding a second child can leave. A brand new account cannot, because
            ProtectedRoute sends them straight back here until they have one. */}
        {existingChildren.length > 0 && (
          <Link
            to="/dashboard"
            className="self-start mb-4 flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        )}

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

          {/* Step 4: Appearance */}
          {step === 4 && (
            <StepWrapper key="step4">
              <StepHeading>What does {data.name} look like?</StepHeading>
              <p className="text-primary-foreground/70 text-center mb-4 -mt-2 text-sm">
                This is the one thing we ask permission for separately
              </p>

              {/*
                Asked separately and on purpose.
                Skin tone and hair texture can say something about a child's ethnicity, which UK
                law protects more strictly than the rest of a profile. So this is its own
                question with its own answer, the box starts unticked, and declining is a real
                option that still gets you a book rather than a dead end.
              */}
              <div className="rounded-xl bg-primary-foreground/10 p-4 mb-5 text-left">
                <p className="text-primary-foreground/90 text-sm leading-relaxed mb-3">
                  To draw {data.name} as themselves we would like to use their skin tone, hair and
                  eye colour. Because those details can say something about a child's background,
                  we ask separately rather than treating it as part of signing up.
                </p>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.appearanceConsent === true}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        appearanceConsent: e.target.checked ? true : null,
                        // Unticking clears the details as well, so nothing is left behind that
                        // the parent has not agreed to.
                        appearance: e.target.checked
                          ? d.appearance
                          : { skinTone: "", hairColour: "", hairStyle: "", eyeColour: "" },
                      }))
                    }
                    className="mt-1 w-5 h-5 flex-shrink-0 rounded accent-accent"
                  />
                  <span className="text-primary-foreground text-sm font-medium">
                    Yes, use these details to draw {data.name}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      appearanceConsent: false,
                      appearance: { skinTone: "", hairColour: "", hairStyle: "", eyeColour: "" },
                    }))
                  }
                  className={`mt-3 w-full text-left text-sm rounded-lg px-3 py-2 transition-colors ${
                    data.appearanceConsent === false
                      ? "bg-primary-foreground/25 text-primary-foreground font-medium"
                      : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                  }`}
                >
                  No thanks, draw {data.name} from their name and age instead
                </button>

                <p className="text-primary-foreground/60 text-xs mt-3 leading-relaxed">
                  {data.appearanceConsent === false
                    ? `${data.name} will still be the hero and will still look the same in every picture of every story. Their character just will not be matched to their own colouring.`
                    : "You can change your mind at any time in Settings, and we will delete these details and the character picture built from them."}
                </p>
              </div>

              <div
                className={`space-y-5 transition-opacity ${
                  data.appearanceConsent === true ? "" : "opacity-40 pointer-events-none"
                }`}
                aria-hidden={data.appearanceConsent !== true}
              >
                <div>
                  <p className="text-primary-foreground/80 text-xs font-medium mb-2">Skin tone</p>
                  <div className="flex gap-2 justify-center">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone.hex}
                        onClick={() => setData((d) => ({ ...d, appearance: { ...d.appearance, skinTone: tone.hex } }))}
                        className="w-10 h-10 rounded-full border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: tone.hex,
                          borderColor: data.appearance.skinTone === tone.hex ? "#F6C255" : "rgba(255,255,255,0.2)",
                          boxShadow: data.appearance.skinTone === tone.hex ? "0 0 0 3px rgba(246,194,85,0.4)" : "none",
                          transform: data.appearance.skinTone === tone.hex ? "scale(1.15)" : undefined,
                        }}
                        aria-label={tone.desc}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-primary-foreground/80 text-xs font-medium mb-2">Hair colour</p>
                  <div className="flex gap-2 justify-center">
                    {HAIR_COLOURS.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setData((d) => ({ ...d, appearance: { ...d.appearance, hairColour: col.hex } }))}
                        className="w-10 h-10 rounded-full border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: col.hex,
                          borderColor: data.appearance.hairColour === col.hex ? "#F6C255" : "rgba(255,255,255,0.2)",
                          boxShadow: data.appearance.hairColour === col.hex ? "0 0 0 3px rgba(246,194,85,0.4)" : "none",
                          transform: data.appearance.hairColour === col.hex ? "scale(1.15)" : undefined,
                        }}
                        aria-label={col.desc}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-primary-foreground/80 text-xs font-medium mb-2">Hair style</p>
                  <div className="grid grid-cols-3 gap-2">
                    {HAIR_STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => setData((d) => ({ ...d, appearance: { ...d.appearance, hairStyle: style } }))}
                        className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                          data.appearance.hairStyle === style
                            ? "border-amber-warm bg-amber-warm/20 text-primary-foreground shadow-sm"
                            : "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:border-amber-warm/50"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-primary-foreground/80 text-xs font-medium mb-2">Eye colour</p>
                  <div className="flex gap-2 justify-center">
                    {EYE_COLOURS.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setData((d) => ({ ...d, appearance: { ...d.appearance, eyeColour: col.hex } }))}
                        className="w-10 h-10 rounded-full border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: col.hex,
                          borderColor: data.appearance.eyeColour === col.hex ? "#F6C255" : "rgba(255,255,255,0.2)",
                          boxShadow: data.appearance.eyeColour === col.hex ? "0 0 0 3px rgba(246,194,85,0.4)" : "none",
                          transform: data.appearance.eyeColour === col.hex ? "scale(1.15)" : undefined,
                        }}
                        aria-label={col.desc}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* Step 5: Interests */}
          {step === 5 && (
            <StepWrapper key="step5">
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
