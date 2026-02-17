import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { X, Moon, Sun, Star, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type Story = {
  id: string;
  child_id: string;
  title: string;
  cover_image_url: string | null;
  status: string;
  parent_rating: number | null;
  created_at: string;
};

type StoryPage = {
  id: string;
  story_id: string;
  page_number: number;
  text: string;
  illustration_url: string | null;
};

// ─── Bedtime mode hook ──────────────────────────────────────────────────────

function useBedtimeMode() {
  const [bedtime, setBedtime] = useState<boolean>(() => {
    try {
      return localStorage.getItem("bedtime-mode") === "true";
    } catch {
      return false;
    }
  });

  const toggle = useCallback(() => {
    setBedtime((prev) => {
      const next = !prev;
      try { localStorage.setItem("bedtime-mode", String(next)); } catch {}
      return next;
    });
  }, []);

  return { bedtime, toggle };
}

// ─── Star rating ────────────────────────────────────────────────────────────

function StarRating({
  storyId,
  initial,
  bedtime,
}: {
  storyId: string;
  initial: number | null;
  bedtime: boolean;
}) {
  const [rating, setRating] = useState<number>(initial ?? 0);
  const [hover, setHover] = useState<number>(0);
  const [saved, setSaved] = useState(false);

  const handleRate = async (val: number) => {
    setRating(val);
    setSaved(false);
    await supabase.from("stories").update({ parent_rating: val }).eq("id", storyId);
    setSaved(true);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p
        className="text-sm font-medium"
        style={{ color: bedtime ? "#f5c56c" : "hsl(var(--muted-foreground))" }}
      >
        {saved ? "Thanks for rating! ⭐" : "Rate this story"}
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleRate(n)}
            className="transition-transform hover:scale-110 active:scale-95 p-1"
            aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`}
          >
            <Star
              className="w-7 h-7"
              fill={(hover || rating) >= n ? "#f5c56c" : "transparent"}
              color={(hover || rating) >= n ? "#f5c56c" : bedtime ? "#f5c56c88" : "hsl(var(--muted-foreground))"}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Illustration placeholder ───────────────────────────────────────────────

function Illustration({
  url,
  alt,
  bedtime,
}: {
  url: string | null;
  alt: string;
  bedtime: boolean;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        className="w-full h-full object-cover"
        draggable={false}
      />
    );
  }
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{
        background: bedtime
          ? "linear-gradient(135deg, #1a1a4e 0%, #2d2060 100%)"
          : "var(--gradient-hero)",
      }}
    >
      <span className="text-6xl animate-float select-none">✨</span>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function StoryReader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { children } = useAuth();

  const { bedtime, toggle: toggleBedtime } = useBedtimeMode();

  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // currentPage: 0 = cover, 1..N = story pages, N+1 = end page
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [animKey, setAnimKey] = useState(0); // force remount to replay animation

  // Touch tracking
  const touchStartX = useRef<number | null>(null);

  // ── Fetch story + pages ──
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      supabase.from("stories").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("story_pages")
        .select("*")
        .eq("story_id", id)
        .order("page_number", { ascending: true }),
    ]).then(([storyRes, pagesRes]) => {
      if (storyRes.error) { setError("Could not load this story."); setLoading(false); return; }
      if (!storyRes.data)  { setError("Story not found."); setLoading(false); return; }
      setStory(storyRes.data);
      setPages(pagesRes.data ?? []);
      setLoading(false);
    });
  }, [id]);

  // ── Page navigation ──
  const totalPages = pages.length;
  const lastPageIndex = totalPages + 1; // end page

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > currentPage ? "forward" : "backward");
      setAnimKey((k) => k + 1);
      setCurrentPage(next);
    },
    [currentPage]
  );

  const goForward = useCallback(() => {
    if (currentPage < lastPageIndex) goTo(currentPage + 1);
  }, [currentPage, lastPageIndex, goTo]);

  const goBack = useCallback(() => {
    if (currentPage > 0) goTo(currentPage - 1);
  }, [currentPage, goTo]);

  // ── Touch / swipe ──
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) {
      dx < 0 ? goForward() : goBack();
    }
  };

  // ── Tap zones (left 30% = back, right 70% = forward) ──
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignore if clicking interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("button, a")) return;
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const ratio = (clientX - left) / width;
    ratio < 0.3 ? goBack() : goForward();
  };

  // ── Keyboard ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goForward();
      if (e.key === "ArrowLeft")  goBack();
      if (e.key === "Escape")     navigate("/dashboard");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goForward, goBack, navigate]);

  // ── Child name ──
  const childName = children[0]?.name ?? "your child";

  // ── Derived page content ──
  const isCover  = currentPage === 0;
  const isEnd    = currentPage === lastPageIndex;
  const pageData = !isCover && !isEnd ? pages[currentPage - 1] : null;

  // ── Theme ──
  const bg       = bedtime ? "#0d0d1a" : "hsl(var(--background))";
  const textColor = bedtime ? "#f5c56c" : "hsl(var(--foreground))";
  const subColor  = bedtime ? "#f5c56c99" : "hsl(var(--muted-foreground))";
  const uiBg      = bedtime ? "#1a1a2e" : "hsl(var(--card) / 0.85)";
  const uiBorder  = bedtime ? "#ffffff18" : "hsl(var(--border))";

  // ── Animation class ──
  const animClass =
    direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left";

  // ── Render ──

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: bg }}
      >
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl animate-float">📖</span>
          <p style={{ color: subColor }} className="font-display text-lg">
            Opening your story…
          </p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center"
        style={{ background: bg }}
      >
        <span className="text-5xl">😔</span>
        <p className="font-display text-xl" style={{ color: textColor }}>
          {error ?? "Story not found."}
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden select-none transition-colors duration-700"
      style={{ background: bg, color: textColor }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
    >
      {/* ── Top bar ── */}
      <div
        className="relative z-20 flex items-center justify-between px-4 py-3 flex-shrink-0 transition-colors duration-700"
        style={{
          background: uiBg,
          borderBottom: `1px solid ${uiBorder}`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Bedtime toggle */}
        <button
          onClick={toggleBedtime}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 text-sm font-medium"
          style={{
            background: bedtime ? "#f5c56c22" : "hsl(var(--secondary))",
            color: bedtime ? "#f5c56c" : "hsl(var(--foreground))",
            border: `1px solid ${bedtime ? "#f5c56c44" : "transparent"}`,
          }}
          aria-label="Toggle bedtime mode"
        >
          {bedtime ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="hidden sm:inline">{bedtime ? "Bright" : "Bedtime"}</span>
        </button>

        {/* Story title */}
        <h1
          className="font-display text-sm sm:text-base font-semibold text-center max-w-[50%] truncate"
          style={{ color: textColor }}
        >
          {story.title}
        </h1>

        {/* Close */}
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-full transition-colors"
          style={{
            background: bedtime ? "#f5c56c18" : "hsl(var(--secondary))",
            color: bedtime ? "#f5c56c" : "hsl(var(--foreground))",
          }}
          aria-label="Close story"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Page content ── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Page turn tap indicators (subtle) */}
        <div className="absolute inset-y-0 left-0 w-[30%] z-10 flex items-center justify-start pl-2 pointer-events-none">
          {currentPage > 0 && (
            <ChevronLeft
              className="w-8 h-8 opacity-20 transition-opacity"
              style={{ color: textColor }}
            />
          )}
        </div>
        <div className="absolute inset-y-0 right-0 w-[30%] z-10 flex items-center justify-end pr-2 pointer-events-none">
          {currentPage < lastPageIndex && (
            <ChevronRight
              className="w-8 h-8 opacity-20 transition-opacity"
              style={{ color: textColor }}
            />
          )}
        </div>

        {/* Animated page */}
        <div key={animKey} className={`${animClass} h-full flex flex-col`}>
          {/* ── COVER PAGE ── */}
          {isCover && (
            <div className="flex-1 flex flex-col">
              {/* Illustration */}
              <div className="flex-[6] relative overflow-hidden">
                <Illustration
                  url={story.cover_image_url}
                  alt={story.title}
                  bedtime={bedtime}
                />
              </div>
              {/* Text area */}
              <div
                className="flex-[4] flex flex-col items-center justify-center px-6 py-6 text-center gap-3 transition-colors duration-700"
                style={{ background: bg }}
              >
                <h2
                  className="font-display text-2xl sm:text-3xl font-bold leading-tight"
                  style={{ color: textColor }}
                >
                  {story.title}
                </h2>
                <p className="font-display italic text-lg" style={{ color: subColor }}>
                  A story for {childName} ✨
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); goForward(); }}
                  className="mt-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background: bedtime ? "#f5c56c" : "hsl(var(--primary))",
                    color: bedtime ? "#1a1a2e" : "hsl(var(--primary-foreground))",
                  }}
                >
                  Begin the story →
                </button>
              </div>
            </div>
          )}

          {/* ── STORY PAGES ── */}
          {pageData && (
            <div className="flex-1 flex flex-col">
              {/* Illustration */}
              <div className="flex-[6] relative overflow-hidden">
                <Illustration
                  url={pageData.illustration_url}
                  alt={`Page ${pageData.page_number}`}
                  bedtime={bedtime}
                />
              </div>
              {/* Text area */}
              <div
                className="flex-[4] flex flex-col justify-between px-6 py-5 transition-colors duration-700"
                style={{ background: bg }}
              >
                <p
                  className="font-display text-base sm:text-lg leading-relaxed text-center"
                  style={{ color: textColor }}
                >
                  {pageData.text}
                </p>
                <p
                  className="text-xs text-center mt-3"
                  style={{ color: subColor }}
                >
                  Page {pageData.page_number} of {totalPages}
                </p>
              </div>
            </div>
          )}

          {/* ── END PAGE ── */}
          {isEnd && (
            <div
              className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center gap-6 transition-colors duration-700"
              style={{ background: bg }}
            >
              <span className="text-7xl animate-float">🌙</span>
              <div className="space-y-2">
                <h2
                  className="font-display text-3xl font-bold"
                  style={{ color: textColor }}
                >
                  The End ✨
                </h2>
                <p className="font-display italic text-lg" style={{ color: subColor }}>
                  Sweet dreams, {childName}.
                </p>
              </div>

              <StarRating
                storyId={story.id}
                initial={story.parent_rating}
                bedtime={bedtime}
              />

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); goTo(0); }}
                  className="px-5 py-2.5 rounded-full font-semibold text-sm border transition-all hover:opacity-80 active:scale-95"
                  style={{
                    borderColor: bedtime ? "#f5c56c44" : "hsl(var(--border))",
                    color: bedtime ? "#f5c56c" : "hsl(var(--foreground))",
                    background: "transparent",
                  }}
                >
                  Read again
                </button>
                <Link
                  to="/dashboard"
                  onClick={(e) => e.stopPropagation()}
                  className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95 inline-flex items-center gap-2"
                  style={{
                    background: bedtime ? "#f5c56c" : "hsl(var(--primary))",
                    color: bedtime ? "#1a1a2e" : "hsl(var(--primary-foreground))",
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Library
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Progress dots ── */}
      {totalPages > 0 && (
        <div
          className="flex-shrink-0 flex items-center justify-center gap-1.5 py-3 transition-colors duration-700"
          style={{
            background: uiBg,
            borderTop: `1px solid ${uiBorder}`,
          }}
        >
          {/* Cover dot */}
          <button
            onClick={(e) => { e.stopPropagation(); goTo(0); }}
            className="rounded-full transition-all duration-300"
            style={{
              width: currentPage === 0 ? 20 : 6,
              height: 6,
              background:
                currentPage === 0
                  ? bedtime ? "#f5c56c" : "hsl(var(--primary))"
                  : bedtime ? "#f5c56c44" : "hsl(var(--muted-foreground) / 0.3)",
            }}
            aria-label="Go to cover"
          />
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={(e) => { e.stopPropagation(); goTo(p.page_number); }}
              className="rounded-full transition-all duration-300"
              style={{
                width: currentPage === p.page_number ? 20 : 6,
                height: 6,
                background:
                  currentPage === p.page_number
                    ? bedtime ? "#f5c56c" : "hsl(var(--primary))"
                    : bedtime ? "#f5c56c44" : "hsl(var(--muted-foreground) / 0.3)",
              }}
              aria-label={`Go to page ${p.page_number}`}
            />
          ))}
          {/* End dot */}
          <button
            onClick={(e) => { e.stopPropagation(); goTo(lastPageIndex); }}
            className="rounded-full transition-all duration-300"
            style={{
              width: currentPage === lastPageIndex ? 20 : 6,
              height: 6,
              background:
                currentPage === lastPageIndex
                  ? bedtime ? "#f5c56c" : "hsl(var(--primary))"
                  : bedtime ? "#f5c56c44" : "hsl(var(--muted-foreground) / 0.3)",
            }}
            aria-label="Go to end page"
          />
        </div>
      )}
    </div>
  );
}
