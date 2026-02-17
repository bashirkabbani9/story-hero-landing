import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Child } from "@/lib/supabase";
import {
  ArrowLeft, LogOut, Trash2, ExternalLink, Bell, ChevronRight,
  Loader2, Check, Moon, Sparkles, ChevronLeft,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

// ─── Shared constants (duplicated from Onboarding for independence) ──────────

const INTERESTS = [
  { label: "Animals",   emoji: "🐾" },
  { label: "Space",     emoji: "🚀" },
  { label: "Nature",    emoji: "🌿" },
  { label: "Cooking",   emoji: "🍳" },
  { label: "Sports",    emoji: "⚽" },
  { label: "Music",     emoji: "🎵" },
  { label: "Art",       emoji: "🎨" },
  { label: "Science",   emoji: "🔬" },
  { label: "Trains",    emoji: "🚂" },
  { label: "Dinosaurs", emoji: "🦕" },
  { label: "Fairies",   emoji: "🧚" },
  { label: "Pirates",   emoji: "🏴‍☠️" },
];

const LANGUAGES = [
  { label: "English (British)", value: "en-GB" },
  { label: "Arabic (العربية)", value: "ar" },
  { label: "French (Français)", value: "fr" },
  { label: "Spanish (Español)", value: "es" },
  { label: "Urdu (اردو)",       value: "ur" },
  { label: "Turkish (Türkçe)", value: "tr" },
  { label: "German (Deutsch)", value: "de" },
];

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-display font-semibold text-foreground text-base">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({
  icon,
  label,
  sublabel,
  onClick,
  href,
  danger,
  right,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  const cls = `w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50 min-h-[56px] ${
    danger ? "text-destructive" : "text-foreground"
  }`;

  const inner = (
    <>
      <span className={`flex-shrink-0 ${danger ? "text-destructive" : "text-muted-foreground"}`}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {sublabel && <span className="block text-xs text-muted-foreground mt-0.5">{sublabel}</span>}
      </span>
      {right ?? <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

// ─── Child profile editor ─────────────────────────────────────────────────────

function ChildEditor({ child, onSaved }: { child: Child; onSaved: () => void }) {
  const [name, setName]         = useState(child.name);
  const [age, setAge]           = useState(child.age);
  const [interests, setInterests] = useState<string[]>(child.interests ?? []);
  const [language, setLanguage] = useState(child.language ?? "en-GB");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const toggleInterest = (label: string) =>
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("children")
      .update({ name, age, interests, language })
      .eq("id", child.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
      toast({ title: "Profile updated ✨", description: `${name}'s profile has been saved.` });
    }
  };

  return (
    <div className="px-5 py-5 space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Child's name</label>
        <input
          type="text"
          value={name}
          maxLength={50}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Age</label>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setAge(n)}
              className={`aspect-square rounded-xl text-lg font-display font-bold transition-all ${
                age === n
                  ? "gradient-amber text-accent-foreground shadow"
                  : "bg-muted text-foreground hover:bg-secondary"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Interests</label>
        <div className="grid grid-cols-3 gap-2">
          {INTERESTS.map((interest) => {
            const selected = interests.includes(interest.label);
            return (
              <button
                key={interest.label}
                onClick={() => toggleInterest(interest.label)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-all ${
                  selected
                    ? "border-primary bg-purple-light text-primary shadow-sm"
                    : "border-border bg-background text-foreground hover:border-primary/40"
                }`}
              >
                <span className="text-2xl">{interest.emoji}</span>
                {interest.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Story language</label>
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                language === lang.value
                  ? "border-primary bg-purple-light text-primary"
                  : "border-border bg-background text-foreground hover:border-primary/40"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !name.trim()}
        className="w-full gradient-purple text-primary-foreground font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
        ) : saved ? (
          <><Check className="w-4 h-4" /> Saved!</>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}

// ─── Main Settings page ───────────────────────────────────────────────────────

export default function Settings() {
  const { user, signOut, children: childProfiles, refreshChildren } = useAuth();
  const navigate = useNavigate();

  const [emailNotifs, setEmailNotifs] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [editingChild, setEditingChild] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const child = childProfiles[0] ?? null;

  // Fetch notification preference
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("email_notifications")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setEmailNotifs(data?.email_notifications ?? true);
        setLoadingNotifs(false);
      });
  }, [user]);

  const handleToggleNotifs = async () => {
    const next = !emailNotifs;
    setEmailNotifs(next);
    setSavingNotifs(true);
    await supabase
      .from("profiles")
      .update({ email_notifications: next })
      .eq("id", user!.id);
    setSavingNotifs(false);
    toast({ title: next ? "Notifications enabled 🔔" : "Notifications disabled" });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Delete child profiles first (RLS should cascade, but explicit is safer)
    if (user) {
      await supabase.from("children").delete().eq("profile_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);
    }
    await signOut();
    navigate("/", { replace: true });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top bar */}
      <nav className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 gradient-purple rounded-full flex items-center justify-center">
              <Moon className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <h1 className="font-display font-semibold text-foreground text-lg">Settings</h1>
          </div>
        </div>
      </nav>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Account info */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-11 h-11 gradient-purple rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-display font-bold text-lg">
              {(user?.email ?? "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Your account</p>
          </div>
        </div>

        {/* Subscription */}
        <Section title="Subscription">
          <Row
            icon={<ExternalLink className="w-5 h-5" />}
            label="Manage Subscription"
            sublabel="Billing, plan changes & invoices"
            href="https://billing.stripe.com/p/login/placeholder"
          />
        </Section>

        {/* Child profile */}
        {child && (
          <Section title={`${child.name}'s Profile`}>
            <Row
              icon={<span className="text-xl">{child.gender === "girl" ? "👧" : "👦"}</span>}
              label={`Edit ${child.name}'s Profile`}
              sublabel={`Age ${child.age} · ${LANGUAGES.find((l) => l.value === child.language)?.label ?? child.language}`}
              onClick={() => setEditingChild((v) => !v)}
              right={
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground transition-transform ${editingChild ? "rotate-90" : ""}`}
                />
              }
            />
            {editingChild && (
              <ChildEditor child={child} onSaved={() => { refreshChildren(); }} />
            )}
          </Section>
        )}

        {/* Notifications */}
        <Section title="Notifications">
          <div className="flex items-center gap-4 px-5 py-4 min-h-[56px]">
            <span className="text-muted-foreground flex-shrink-0">
              <Bell className="w-5 h-5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-foreground">Email notifications</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Story delivery alerts and updates
              </span>
            </span>
            <button
              onClick={handleToggleNotifs}
              disabled={loadingNotifs || savingNotifs}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 disabled:opacity-50 ${
                emailNotifs ? "bg-primary" : "bg-muted"
              }`}
              aria-label="Toggle email notifications"
              role="switch"
              aria-checked={emailNotifs}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                  emailNotifs ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </Section>

        {/* Add another child */}
        <Section title="Family">
          <Row
            icon={<Sparkles className="w-5 h-5" />}
            label="Add Another Child"
            sublabel="Set up a new story profile"
            onClick={() => navigate("/onboarding")}
          />
        </Section>

        {/* Account actions */}
        <Section title="Account">
          <Row
            icon={<LogOut className="w-5 h-5" />}
            label="Log Out"
            sublabel="Sign out of this device"
            onClick={handleSignOut}
          />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-destructive/5 text-destructive min-h-[56px]">
                <Trash2 className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">
                  <span className="block text-sm font-medium">Delete Account</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    This is permanent and cannot be undone
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, all child profiles, and your entire story library.
                  This action <strong>cannot be undone</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Deleting…</>
                  ) : (
                    "Yes, delete my account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Section>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Bedtime Stories · Made with ✨ and love
        </p>
      </main>
    </div>
  );
}
