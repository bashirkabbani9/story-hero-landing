import { useEffect, useState, useRef, useCallback, forwardRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { X, Moon, Sun, Star, ArrowLeft } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import { useIsMobile } from "@/hooks/use-mobile";

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
      try {
        localStorage.setItem("bedtime-mode", String(next));
      } catch {}
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
    await supabase
      .from("stories")
      .update({ parent_rating: val })
      .eq("id", storyId);
    setSaved(true);
  };

  const starColor = bedtime ? "#f5c56c" : "#ffffff";
  const dimColor = bedtime ? "#f5c56c66" : "#ffffff66";

  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className="text-sm font-medium"
        style={{
          fontFamily: "'Bubblegum Sans', cursive",
          color: starColor,
          textShadow: "1px 1px 4px rgba(0,0,0,0.5)",
        }}
      >
        {saved ? "Thanks for rating! ⭐" : "Rate this story"}
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={(e) => {
              e.stopPropagation();
              handleRate(n);
            }}
            className="transition-transform hover:scale-110 active:scale-95 p-1"
            aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`}
          >
            <Star
              className="w-8 h-8"
              fill={(hover || rating) >= n ? "#f5c56c" : "transparent"}
              color={(hover || rating) >= n ? "#f5c56c" : dimColor}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Fallback gradient for pages without illustrations ──────────────────────

const FALLBACK_GRADIENT =
  "radial-gradient(ellipse at 30% 20%, hsl(270, 45%, 35%) 0%, hsl(265, 40%, 25%) 40%, hsl(260, 35%, 18%) 100%)";

const FALLBACK_GRADIENT_BEDTIME =
  "radial-gradient(ellipse at 30% 20%, #1a1a4e 0%, #2d2060 40%, #0d0d2a 100%)";

// ─── Book page component (must use forwardRef for react-pageflip) ───────────

interface BookPageProps {
  children: React.ReactNode;
  bgImage?: string | null;
  bedtime: boolean;
  className?: string;
}

const BookPage = forwardRef<HTMLDivElement, BookPageProps>(
  ({ children, bgImage, bedtime, className = "" }, ref) => {
    const bg = bgImage
      ? `url(${bgImage})`
      : bedtime
      ? FALLBACK_GRADIENT_BEDTIME
      : FALLBACK_GRADIENT;

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden ${className}`}
        style={{
          backgroundImage: bgImage ? bg : undefined,
          background: bgImage ? undefined : bg,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {children}
      </div>
    );
  }
);
BookPage.displayName = "BookPage";

// ─── Text overlay with gradient ─────────────────────────────────────────────

function TextOverlay({
  text,
  position = "bottom",
  bedtime,
  className = "",
}: {
  text: React.ReactNode;
  position?: "top" | "bottom";
  bedtime: boolean;
  className?: string;
}) {
  const gradientBase = bedtime
    ? "rgba(13, 13, 26, 0.85)"
    : "rgba(0, 0, 0, 0.65)";
  const gradientTransparent = "rgba(0, 0, 0, 0)";

  const gradient =
    position === "bottom"
      ? `linear-gradient(to bottom, ${gradientTransparent} 0%, ${gradientBase} 100%)`
      : `linear-gradient(to top, ${gradientTransparent} 0%, ${gradientBase} 100%)`;

  return (
    <div
      className={`absolute left-0 right-0 ${
        position === "bottom" ? "bottom-0" : "top-0"
      } px-5 sm:px-8 ${
        position === "bottom" ? "pb-10 pt-20" : "pt-10 pb-20"
      } ${className}`}
      style={{ background: gradient }}
    >
      {text}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function StoryReader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { children } = useAuth();
  const isMobile = useIsMobile();

  const { bedtime, toggle: toggleBedtime } = useBedtimeMode();

  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const flipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bookSize, setBookSize] = useState({ width: 0, height: 0 });

  // Touch tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);

  // ── Calculate book size ──
  useEffect(() => {
    function calcSize() {
      if (isMobile) {
        setBookSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      } else {
        // Desktop: two-page spread centred, with margins
        const maxW = Math.min(window.innerWidth - 80, 1200);
        const maxH = window.innerHeight - 80;
        const bookH = Math.min(maxH, maxW * 0.7);
        const bookW = bookH / 0.7;
        setBookSize({
          width: Math.round(Math.min(bookW, maxW) / 2), // per-page width
          height: Math.round(bookH),
        });
      }
    }
    calcSize();
    window.addEventListener("resize", calcSize);
    return () => window.removeEventListener("resize", calcSize);
  }, [isMobile]);

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
      if (storyRes.error) {
        setError("Could not load this story.");
        setLoading(false);
        return;
      }
      if (!storyRes.data) {
        setError("Story not found.");
        setLoading(false);
        return;
      }
      setStory(storyRes.data);
      setPages(pagesRes.data ?? []);
      setLoading(false);
    });
  }, [id]);

  // ── Preload next 2 images ──
  useEffect(() => {
    const allPages = pages;
    for (let i = currentPage + 1; i <= currentPage + 2 && i < allPages.length; i++) {
      const url = allPages[i]?.illustration_url;
      if (url) {
        const img = new Image();
        img.src = url;
      }
    }
  }, [currentPage, pages]);

  // ── Navigation ──
  const totalBookPages = pages.length + 2; // cover + story pages + end

  const goForward = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipNext();
  }, []);

  const goBack = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  }, []);

  // ── Touch / swipe for mobile ──
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) {
      dx < 0 ? goForward() : goBack();
    }
  };

  // ── Tap zones (mobile only) ──
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMobile) return;
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
      if (e.key === "ArrowLeft") goBack();
      if (e.key === "Escape") navigate("/dashboard");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goForward, goBack, navigate]);

  // ── Child name ──
  const childName = children[0]?.name ?? "your child";

  // ── Text styles ──
  const textColor = bedtime ? "#f5c56c" : "#ffffff";
  const textShadow = "2px 2px 8px rgba(0,0,0,0.7)";
  const storyFont: React.CSSProperties = {
    fontFamily: "'Bubblegum Sans', cursive",
    color: textColor,
    textShadow,
  };

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  // ── Render ──

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a]">
        <div className="flex flex-col items-center gap-4">
          <span className="text-6xl animate-float">📖</span>
          <p
            style={{
              ...storyFont,
              fontSize: "1.25rem",
              color: "#f5c56ccc",
            }}
          >
            Opening your story…
          </p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center bg-[#0d0d1a]">
        <span className="text-5xl">😔</span>
        <p style={{ ...storyFont, fontSize: "1.25rem" }}>
          {error ?? "Story not found."}
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm bg-primary text-primary-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
      </div>
    );
  }

  // Build all pages as an array for the flip book
  const bookPages: React.ReactNode[] = [];

  // ── Cover page ──
  bookPages.push(
    <BookPage
      key="cover"
      bgImage={story.cover_image_url}
      bedtime={bedtime}
    >
      <TextOverlay
        bedtime={bedtime}
        position="bottom"
        text={
          <div className="text-center space-y-3">
            <h1
              style={{
                ...storyFont,
                fontSize: isMobile ? "32px" : "42px",
                lineHeight: 1.2,
              }}
            >
              {story.title}
            </h1>
            <p
              style={{
                ...storyFont,
                fontSize: isMobile ? "16px" : "20px",
                opacity: 0.85,
              }}
            >
              A story for {childName} ✨
            </p>
          </div>
        }
      />
    </BookPage>
  );

  // ── Story pages ──
  pages.forEach((page) => {
    const isShortText = page.text.length < 80;
    bookPages.push(
      <BookPage
        key={page.id}
        bgImage={page.illustration_url}
        bedtime={bedtime}
      >
        <TextOverlay
          bedtime={bedtime}
          position={isShortText ? "top" : "bottom"}
          text={
            <>
              <p
                style={{
                  ...storyFont,
                  fontSize: isMobile ? "20px" : "24px",
                  lineHeight: 1.6,
                  textAlign: "center",
                }}
              >
                {page.text}
              </p>
              <p
                className="text-center mt-3"
                style={{
                  ...storyFont,
                  fontSize: "13px",
                  opacity: 0.5,
                }}
              >
                {page.page_number}
              </p>
            </>
          }
        />
      </BookPage>
    );
  });

  // ── End page ──
  const lastPageImg =
    pages[pages.length - 1]?.illustration_url ?? story.cover_image_url;
  bookPages.push(
    <BookPage key="end" bgImage={lastPageImg} bedtime={bedtime}>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-5"
        style={{
          background: bedtime
            ? "rgba(13, 13, 26, 0.75)"
            : "rgba(0, 0, 0, 0.55)",
        }}
      >
        <span className="text-6xl animate-float">🌙</span>
        <h2
          style={{
            ...storyFont,
            fontSize: isMobile ? "32px" : "42px",
          }}
        >
          The End
        </h2>
        <p
          style={{
            ...storyFont,
            fontSize: isMobile ? "16px" : "20px",
            opacity: 0.8,
          }}
        >
          Sweet dreams, {childName} ✨
        </p>

        <StarRating
          storyId={story.id}
          initial={story.parent_rating}
          bedtime={bedtime}
        />

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              flipBookRef.current?.pageFlip()?.flip(0);
            }}
            className="px-5 py-2.5 rounded-full font-semibold text-sm border transition-all hover:opacity-80 active:scale-95"
            style={{
              ...storyFont,
              fontSize: "14px",
              borderColor: bedtime ? "#f5c56c44" : "#ffffff44",
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
              ...storyFont,
              fontSize: "14px",
              background: bedtime ? "#f5c56c" : "hsl(var(--primary))",
              color: bedtime ? "#1a1a2e" : "hsl(var(--primary-foreground))",
              textShadow: "none",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
        </div>
      </div>
    </BookPage>
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center overflow-hidden select-none"
      style={{
        background: isMobile
          ? "#0d0d1a"
          : "radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 100%)",
      }}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      onClick={handleTap}
    >
      {/* ── Minimal top bar overlay ── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 pointer-events-none">
        {/* Bedtime toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBedtime();
          }}
          className="pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all duration-300"
          style={{
            background: bedtime
              ? "rgba(245, 197, 108, 0.15)"
              : "rgba(255, 255, 255, 0.1)",
            border: `1px solid ${
              bedtime ? "rgba(245, 197, 108, 0.3)" : "rgba(255, 255, 255, 0.15)"
            }`,
          }}
          aria-label="Toggle bedtime mode"
        >
          {bedtime ? (
            <Sun className="w-5 h-5" style={{ color: "#f5c56c" }} />
          ) : (
            <Moon className="w-5 h-5" style={{ color: "#ffffffcc" }} />
          )}
        </button>

        {/* Close */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/dashboard");
          }}
          className="pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
          aria-label="Close story"
        >
          <X className="w-5 h-5" style={{ color: "#ffffffcc" }} />
        </button>
      </div>

      {/* ── Book container ── */}
      <div
        className={`relative ${isMobile ? "" : "rounded-lg"}`}
        style={
          isMobile
            ? { width: "100%", height: "100%" }
            : {
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
                overflow: "hidden",
              }
        }
      >
        {/* Spine shadow on desktop */}
        {!isMobile && (
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            style={{
              width: "30px",
              background:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.25) 60%, transparent 100%)",
            }}
          />
        )}

        {bookSize.width > 0 && (
          <HTMLFlipBook
            ref={flipBookRef}
            width={bookSize.width}
            height={bookSize.height}
            size={isMobile ? "stretch" : "fixed"}
            minWidth={300}
            maxWidth={1200}
            minHeight={400}
            maxHeight={1000}
            showCover={true}
            mobileScrollSupport={false}
            onFlip={onFlip}
            className="book-flipper"
            style={{}}
            startPage={0}
            drawShadow={!isMobile}
            flippingTime={600}
            usePortrait={isMobile}
            startZIndex={0}
            autoSize={isMobile}
            maxShadowOpacity={isMobile ? 0 : 0.5}
            showPageCorners={!isMobile}
            disableFlipByClick={isMobile}
            useMouseEvents={!isMobile}
            swipeDistance={50}
            clickEventForward={false}
            renderOnlyPageLengthChange={false}
          >
            {bookPages.map((page, i) => (
              <div key={i} className="w-full h-full">
                {page}
              </div>
            ))}
          </HTMLFlipBook>
        )}
      </div>
    </div>
  );
}
