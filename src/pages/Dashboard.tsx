import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Moon,
  Settings,
  Flame,
  Clock,
  Users,
  ExternalLink,
  Copy,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { label: "English", value: "en-GB" },
  { label: "Arabic", value: "ar" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
  { label: "Urdu", value: "ur" },
  { label: "Turkish", value: "tr" },
  { label: "German", value: "de" },
];


type Story = {
  id: string;
  child_id: string;
  title: string;
  cover_image_url: string | null;
  status: string;
  created_at: string;
  delivered_at: string | null;
};


function getNextSundayUK(): Date {
  const now = new Date();

  // Get current day-of-week and hour in Europe/London
  const londonDay = parseInt(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short" })
      .format(now) === "Sun" ? "0" :
    ["Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short" }).format(now)
    ) + 1 + ""
  );
  const londonHour = parseInt(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false }).format(now)
  );

  // Days until next Sunday at 17:00 UK time
  const isSunday = londonDay === 0;
  const passedThisSunday = isSunday && londonHour >= 17;
  const daysUntilSunday = isSunday ? (passedThisSunday ? 7 : 0) : (7 - londonDay);

  // Build the ISO string for that Sunday at 17:00 Europe/London
  // by converting "Europe/London" date parts to a proper UTC instant
  const candidate = new Date(now);
  candidate.setDate(candidate.getDate() + daysUntilSunday);

  // Format candidate date in London TZ to get Y/M/D
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(candidate);
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));

  // Parse as UTC midnight, then shift by London offset to get 17:00 London = UTC
  const sundayMidnightUTC = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day));
  // Find the UTC offset for London on that day by comparing clocks
  const probe = new Date(sundayMidnightUTC);
  const londonMidnightStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(probe);
  const [lh, lm] = londonMidnightStr.split(":").map(Number);
  const londonOffsetMs = -(lh * 60 + lm) * 60 * 1000; // offset from UTC to London midnight

  // Sunday 17:00 London = UTC midnight + offset + 17h
  return new Date(sundayMidnightUTC + londonOffsetMs + 17 * 60 * 60 * 1000);
}

function useCountdown(target: Date) {
  const calc = useCallback(() => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes };
  }, [target]);

  const [countdown, setCountdown] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setCountdown(calc()), 60_000);
    return () => clearInterval(id);
  }, [calc]);

  return countdown;
}

function calculateStreak(stories: Story[]): number {
  if (stories.length === 0) return 0;
  // Group by ISO week number
  const weeks = new Set(
    stories.map((s) => {
      const d = new Date(s.created_at);
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
      return `${d.getFullYear()}-W${week}`;
    })
  );
  const sorted = Array.from(weeks).sort().reverse();
  let streak = 0;
  const now = new Date();
  const thisWeek = (() => {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const w = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${w}`;
  })();
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0 && sorted[i] !== thisWeek && sorted[i] !== getPrevWeek(thisWeek)) break;
    if (i > 0) {
      const expected = getPrevWeek(sorted[i - 1]);
      if (sorted[i] !== expected) break;
    }
    streak++;
  }
  return streak;
}

function getPrevWeek(yearWeek: string): string {
  const [year, wStr] = yearWeek.split("-W");
  let w = parseInt(wStr) - 1;
  let y = parseInt(year);
  if (w < 1) { w = 52; y--; }
  return `${y}-W${w}`;
}

function isNew(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 7 * 24 * 60 * 60 * 1000;
}

function StoryCard({ story }: { story: Story }) {
  const navigate = useNavigate();
  const deliveryDate = story.delivered_at ?? story.created_at;

  return (
    <button
      onClick={() => navigate(`/story/${story.id}`)}
      className="group bg-card border border-border rounded-2xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-purple focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {/* Cover */}
      <div className="relative aspect-[4/3] gradient-hero flex items-center justify-center">
        {story.cover_image_url ? (
          <img
            src={story.cover_image_url}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-70">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
            <span className="text-primary-foreground text-xs font-medium">Illustration coming soon</span>
          </div>
        )}
        {isNew(deliveryDate) && (
          <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow">
            New! ✨
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-display font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {story.title}
        </p>
        <p className="text-muted-foreground text-xs mt-1.5">
          {new Date(deliveryDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </button>
  );
}

function EmptyStories() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 gradient-hero rounded-full flex items-center justify-center mb-4 animate-float">
        <BookOpen className="w-10 h-10 text-primary-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
        Your first story is being created...
      </h3>
      <p className="text-muted-foreground max-w-xs">
        Check back soon! A personalised adventure is being woven just for your little one. ✨
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user, signOut, children } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const child = children.find((c) => c.id === selectedChildId) ?? children[0] ?? null;
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [parentName, setParentName] = useState<string>("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const nextSunday = getNextSundayUK();
  const countdown = useCountdown(nextSunday);
  const streak = calculateStreak(stories);

  // Show success toast after Stripe checkout
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast({
        title: "Welcome to Little Hero Library! 🎉",
        description: "Your first story is being created — check back soon! ✨",
      });
      // Remove the query param without a page reload
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);


  // Fetch parent name from profiles
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) {
          setParentName(data.full_name.split(" ")[0]);
        } else {
          // Fall back to email prefix
          setParentName(user.email?.split("@")[0] ?? "");
        }
      });
  }, [user]);

  // Fetch stories
  useEffect(() => {
    if (!child) return;
    setLoadingStories(true);
    supabase
      .from("stories")
      .select("*")
      .eq("child_id", child.id)
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setStories(data ?? []);
        setLoadingStories(false);
      });
  }, [child]);

  const handleReferral = () => {
    const referralUrl = `${window.location.origin}/?ref=${user?.id?.slice(0, 8)}`;
    navigator.clipboard.writeText(referralUrl).then(() => {
      toast({ title: "Link copied! 🎉", description: "Share it with friends and family." });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center">
              <Moon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground">
              Little Hero Library <span className="text-accent">✨</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button
              onClick={signOut}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Greeting */}
        <div className="animate-fade-up">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back,{" "}
            <span className="text-gradient-purple">
              {parentName || user?.email?.split("@")[0] || "there"}
            </span>
            ! 👋
          </h1>
        </div>

        {/* Child selector tabs — shown only when there are multiple children */}
        {children.length > 1 && (
          <div className="animate-fade-up flex gap-2 flex-wrap" style={{ animationDelay: "0.03s" }}>
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChildId(c.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium text-sm transition-all ${
                  child?.id === c.id
                    ? "border-primary bg-primary text-primary-foreground shadow-purple"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                <span>{c.gender === "girl" ? "👧" : "👦"}</span>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* SECTION 1 — CHILD CARD */}
        {child && (
          <section className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <div className="bg-card border border-border rounded-3xl p-6 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Avatar + child info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 gradient-purple rounded-full flex items-center justify-center shadow-purple flex-shrink-0">
                    <span className="text-2xl">
                      {child.gender === "girl" ? "👧" : "👦"}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {child.name}
                    </h2>
                  <p className="text-muted-foreground text-sm">
                      Age {child.age} · {LANGUAGES.find((l) => l.value === child.language)?.label?.split(" ")[0] ?? child.language}
                    </p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Countdown */}
                  <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 gradient-purple rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Next story arrives in
                      </p>
                      <p className="font-display font-semibold text-foreground text-sm">
                        {countdown.days}d {countdown.hours}h {countdown.minutes}m
                      </p>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="bg-amber-light rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-warm rounded-full flex items-center justify-center flex-shrink-0">
                      <Flame className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Reading streak
                      </p>
                      <p className="font-display font-semibold text-foreground text-sm">
                        🔥 {streak} week{streak !== 1 ? "s" : ""} in a row
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2 — STORY LIBRARY */}
        <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              {child ? `${child.name}'s Library` : "Story Library"} 📚
            </h2>
            {stories.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {stories.length} {stories.length === 1 ? "story" : "stories"}
              </Badge>
            )}
          </div>

          {loadingStories ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-muted rounded-full w-3/4" />
                    <div className="h-3 bg-muted rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stories.length === 0 ? (
                <EmptyStories />
              ) : (
                stories.map((story) => <StoryCard key={story.id} story={story} />)
              )}
            </div>
          )}
        </section>

        {/* SECTION 3 — QUICK ACTIONS */}
        <section className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Refer a friend */}
            <button
              onClick={handleReferral}
              className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-4 hover:border-primary hover:shadow-soft transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:gradient-purple transition-all duration-200">
                <Copy className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Refer a Friend</p>
                <p className="text-muted-foreground text-xs">Copy your referral link</p>
              </div>
            </button>

            {/* Manage Subscription */}
            <button
              onClick={() =>
                toast({
                  title: "Subscription management coming soon",
                  description:
                    "Email bashir@alkabbanisolutions.co.uk for any billing questions.",
                })
              }
              className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-4 hover:border-primary hover:shadow-soft transition-all duration-200 group text-left w-full"
            >
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:gradient-purple transition-all duration-200">
                <ExternalLink className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Manage Subscription</p>
                <p className="text-muted-foreground text-xs">Billing & plan details</p>
              </div>
            </button>

            {/* Add Another Child */}
            <Link
              to="/onboarding?addChild=true"
              className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-4 hover:border-primary hover:shadow-soft transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:gradient-purple transition-all duration-200">
                <Users className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Add Another Child</p>
                <p className="text-muted-foreground text-xs">Set up a new profile</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
