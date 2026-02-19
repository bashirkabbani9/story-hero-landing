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
  const [customInput, setCustomInput] = useState("");

  const toggleInterest = (label: string) =>
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );

  const addCustomInterest = () => {
    const trimmed = customInput.trim();
    if (!trimmed || interests.includes(trimmed)) return;
    setInterests((prev) => [...prev, trimmed]);
    setCustomInput("");
  };

  const removeCustomInterest = (label: string) => {
    if (INTERESTS.some((i) => i.label === label)) return; // don't remove preset via this
    setInterests((prev) => prev.filter((i) => i !== label));
  };

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

        {/* Custom interest input */}
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
            placeholder="Add your own..."
            maxLength={40}
            className="flex-1 px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <button
            onClick={addCustomInterest}
            disabled={!customInput.trim()}
            className="px-4 py-2.5 rounded-xl border border-primary bg-purple-light text-primary text-sm font-semibold disabled:opacity-40 transition-all hover:bg-primary/10"
          >
            Add
          </button>
        </div>

        {/* Custom tags */}
        {interests.filter((i) => !INTERESTS.some((p) => p.label === i)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {interests
              .filter((i) => !INTERESTS.some((p) => p.label === i))
              .map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-light border border-primary/30 text-primary text-xs font-medium"
                >
                  {tag}
                  <button
                    onClick={() => removeCustomInterest(tag)}
                    className="text-primary/60 hover:text-primary transition-colors leading-none"
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}
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

// ─── Child card in the My Children section ───────────────────────────────────

function ChildCard({
  child,
  onSaved,
  onDeleted,
}: {
  child: Child;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deletingChild, setDeletingChild] = useState(false);

  const customInterests = child.interests?.filter(
    (i) => !INTERESTS.some((p) => p.label === i)
  );

  const handleDelete = async () => {
    setDeletingChild(true);
    const { error } = await supabase.from("children").delete().eq("id", child.id);
    setDeletingChild(false);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${child.name} removed`, description: "All their stories have been deleted too." });
      onDeleted();
    }
  };

  return (
    <div className="border-b border-border last:border-0">
      {/* Summary row */}
      <div className="flex items-center gap-4 px-5 py-4 min-h-[64px]">
        <span className="text-2xl flex-shrink-0">{child.gender === "girl" ? "👧" : "👦"}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{child.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Age {child.age} · {LANGUAGES.find((l) => l.value === child.language)?.label ?? child.language}
          </p>
          {child.interests?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {child.interests.slice(0, 4).join(", ")}
              {child.interests.length > 4 ? ` +${child.interests.length - 4} more` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors"
          >
            {expanded ? "Close" : "Edit"}
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                aria-label={`Delete ${child.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {child.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove <strong>{child.name}</strong>? This will also delete all their stories.
                  This action <strong>cannot be undone</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deletingChild}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deletingChild ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Deleting…</>
                  ) : (
                    "Yes, remove"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Inline editor */}
      {expanded && (
        <div className="bg-muted/30 border-t border-border">
          <ChildEditor
            child={child}
            onSaved={() => { setExpanded(false); onSaved(); }}
          />
        </div>
      )}
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
  const [deleting, setDeleting] = useState(false);

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
            onClick={() =>
              toast({
                title: "Subscription management coming soon",
                description:
                  "Email bashir@alkabbanisolutions.co.uk for any billing questions.",
              })
            }
          />
        </Section>

        {/* My Children */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground text-base">My Children</h2>
          </div>

          {childProfiles.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">No children added yet.</p>
          ) : (
            childProfiles.map((c) => (
              <ChildCard
                key={c.id}
                child={c}
                onSaved={refreshChildren}
                onDeleted={refreshChildren}
              />
            ))
          )}

          {/* Add Another Child */}
          <div className="border-t border-border">
            <Link
              to="/onboarding?addChild=true"
              className="flex items-center gap-4 px-5 py-4 min-h-[56px] hover:bg-muted/50 transition-colors group"
            >
              <span className="text-muted-foreground group-hover:text-primary transition-colors">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-foreground">Add Another Child</span>
                <span className="block text-xs text-muted-foreground mt-0.5">Set up a new story profile</span>
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Link>
          </div>
        </section>

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
          Little Hero Library · Made with ✨ and love
        </p>
      </main>
    </div>
  );
}
