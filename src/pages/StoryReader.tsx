import { useEffect, useLayoutEffect, useState, useRef, useCallback, forwardRef } from "react";
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
    const { error } = await supabase
      .from("stories")
      .update({ parent_rating: val })
      .eq("id", storyId);
    if (error) {
      setRating(initial ?? 0);
    } else {
      setSaved(true);
    }
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

// ─── Auto-fit text component ────────────────────────────────────────────────

function AutoFitText({
  text,
  pageNumber,
  initialFontSize,
  pageTextFont,
  pageNumColor,
  textAreaBg,
}: {
  text: string;
  pageNumber: number;
  initialFontSize: number;
  pageTextFont: React.CSSProperties;
  pageNumColor: string;
  textAreaBg: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(initialFontSize);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let size = initialFontSize;
    el.style.fontSize = size + "px";
    while (el.scrollHeight > el.clientHeight && size > 12) {
      size -= 1;
      el.style.fontSize = size + "px";
    }
    setFontSize(size);
  }, [text, initialFontSize]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "42%",
        background: textAreaBg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 24px 16px",
        overflow: "hidden",
      }}
    >
      <p style={{ ...pageTextFont, fontSize: fontSize + "px", lineHeight: 1.7, textAlign: "left" }}>
        {text}
      </p>
      <span
        style={{
          display: "block",
          textAlign: "center",
          color: pageNumColor,
          fontFamily: "'Quicksand', sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          marginTop: "8px",
          flexShrink: 0,
        }}
      >
        {pageNumber}
      </span>
    </div>
  );
}

// ─── Book page component (must use forwardRef for react-pageflip) ───────────

interface BookPageProps {
  children: React.ReactNode;
  bgImage?: string | null;
  bedtime: boolean;
  className?: string;
}

const BookPage = forwardRef<HTMLDivElement, BookPageProps>(
  ({ children, bgImage, bedtime, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative overflow-hidden w-full h-full ${className}`}
        style={{
          background: bedtime ? "#1a1a2e" : "#F5F0E8",
        }}
      >
        {bgImage && (
          <img
            src={bgImage}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
        )}
        {children}
      </div>
    );
  }
);
BookPage.displayName = "BookPage";

// ─── Age-adaptive font sizing ───────────────────────────────────────────────

function getAgeFontSize(age: number | null, isMobile: boolean): { base: number; min: number } {
  if (age !== null && age >= 3 && age <= 4) return { base: isMobile ? 20 : 24, min: 12 };
  if (age !== null && age >= 5 && age <= 6) return { base: isMobile ? 18 : 22, min: 12 };
  if (age !== null && age >= 7 && age <= 8) return { base: isMobile ? 16 : 20, min: 12 };
  if (age !== null && age >= 9 && age <= 12) return { base: isMobile ? 14 : 18, min: 12 };
  return { base: isMobile ? 18 : 22, min: 12 };
}

function getTextFontSize(text: string, age: number | null, isMobile: boolean): string {
  const { base, min } = getAgeFontSize(age, isMobile);
  const len = text.length;
  let size = base;
  if (len > 200) size = Math.max(base - 4, min);
  if (len > 350) size = Math.max(base - 8, min);
  if (len > 500) size = Math.max(base - 12, min);
  return `${size}px`;
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
  const [bookOpened, setBookOpened] = useState(false);
  const [childAge, setChildAge] = useState<number | null>(null);

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
        const maxW = Math.min(window.innerWidth - 80, 1200);
        const maxH = window.innerHeight - 80;
        const bookH = Math.min(maxH, maxW * 0.7);
        const bookW = bookH / 0.7;
        setBookSize({
          width: Math.round(Math.min(bookW, maxW) / 2),
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
    ]).then(async ([storyRes, pagesRes]) => {
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
      const fetchedPages = pagesRes.data ?? [];
      setPages(fetchedPages);

      // Fetch child age for adaptive font sizing
      if (storyRes.data.child_id) {
        const { data: childData } = await supabase
          .from("children")
          .select("age")
          .eq("id", storyRes.data.child_id)
          .maybeSingle();
        if (childData?.age) setChildAge(childData.age);
      }

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
  // Age-adaptive font family for story text
  const storyFontFamily =
    childAge !== null && childAge >= 8 && childAge <= 12
      ? "'Georgia', 'Baskerville Old Face', 'Garamond', serif"
      : "'Andika', 'Century Gothic', 'Avenir', sans-serif";
  // Story page text (separate zone, not overlay)
  const pageTextFont: React.CSSProperties = {
    fontFamily: storyFontFamily,
    fontWeight: 500,
    color: bedtime ? "#e8dcc8" : "#3D2E1F",
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

  // ── Gradient for cover only ──
  const coverGradient = "linear-gradient(to top, rgba(0,0,0,0.7), transparent)";
  const textAreaBg = bedtime ? "#1a1a2e" : "#FEFCF7";
  const pageNumColor = bedtime ? "rgba(232,220,200,0.4)" : "rgba(61,46,31,0.35)";

  const coverImageUrl = pages[0]?.illustration_url ?? story.cover_image_url;

  // ── CLOSED BOOK COVER ──
  if (!bookOpened) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 flex items-center justify-center overflow-hidden select-none"
        style={{
          background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 100%)",
        }}
      >
        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 pointer-events-none">
          <button
            onClick={(e) => { e.stopPropagation(); toggleBedtime(); }}
            className="pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all duration-300"
            style={{
              background: bedtime ? "rgba(245, 197, 108, 0.15)" : "rgba(255, 255, 255, 0.1)",
              border: `1px solid ${bedtime ? "rgba(245, 197, 108, 0.3)" : "rgba(255, 255, 255, 0.15)"}`,
            }}
            aria-label="Toggle bedtime mode"
          >
            {bedtime ? <Sun className="w-5 h-5" style={{ color: "#f5c56c" }} /> : <Moon className="w-5 h-5" style={{ color: "#ffffffcc" }} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate("/dashboard"); }}
            className="pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all"
            style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.15)" }}
            aria-label="Close story"
          >
            <X className="w-5 h-5" style={{ color: "#ffffffcc" }} />
          </button>
        </div>

        {/* Closed book */}
        <button
          onClick={() => setBookOpened(true)}
          className="relative cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            aspectRatio: "3/4",
            maxHeight: "80vh",
            maxWidth: "45vw",
            width: isMobile ? "75vw" : "35vw",
            borderRadius: "4px 12px 12px 4px",
            boxShadow: "8px 8px 30px rgba(0,0,0,0.6), -2px 0 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Cover illustration — edge to edge */}
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt=""
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: FALLBACK_GRADIENT,
              }}
            />
          )}

          {/* Subtle dark overlay for text readability */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />

          {/* Spine effect on left edge */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "12px",
              background: "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.15), transparent)",
              pointerEvents: "none",
            }}
          />

          {/* Title content */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              zIndex: 10,
              textAlign: "center",
            }}
          >
            <h1
              style={{
                ...storyFont,
                fontSize: isMobile ? "26px" : "36px",
                lineHeight: 1.2,
              }}
            >
              {story.title}
            </h1>
            <p
              style={{
                ...storyFont,
                fontSize: isMobile ? "14px" : "18px",
                opacity: 0.85,
                marginTop: "12px",
              }}
            >
              A story for {childName} ✨
            </p>
          </div>

          {/* Tap to open */}
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 10,
            }}
          >
            <span
              style={{
                ...storyFont,
                fontSize: "13px",
                opacity: 0.6,
                animation: "pulse-opacity 2s ease-in-out infinite",
              }}
            >
              Tap to open
            </span>
          </div>
        </button>

        <style>{`
          @keyframes pulse-opacity {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }

  // ── OPENED BOOK (flip book without cover page) ──
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
        <button
          onClick={(e) => { e.stopPropagation(); toggleBedtime(); }}
          className="pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all duration-300"
          style={{
            background: bedtime ? "rgba(245, 197, 108, 0.15)" : "rgba(255, 255, 255, 0.1)",
            border: `1px solid ${bedtime ? "rgba(245, 197, 108, 0.3)" : "rgba(255, 255, 255, 0.15)"}`,
          }}
          aria-label="Toggle bedtime mode"
        >
          {bedtime ? <Sun className="w-5 h-5" style={{ color: "#f5c56c" }} /> : <Moon className="w-5 h-5" style={{ color: "#ffffffcc" }} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate("/dashboard"); }}
          className="pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all"
          style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.15)" }}
          aria-label="Close story"
        >
          <X className="w-5 h-5" style={{ color: "#ffffffcc" }} />
        </button>
      </div>

      {/* ── Mobile nav arrows ── */}
      {isMobile && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goBack(); }}
            className="fixed left-3 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-opacity active:scale-90"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
            aria-label="Previous page"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "#ffffffcc" }} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goForward(); }}
            className="fixed right-3 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-opacity active:scale-90"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
            aria-label="Next page"
          >
            <ArrowLeft className="w-5 h-5 rotate-180" style={{ color: "#ffffffcc" }} />
          </button>
        </>
      )}

      {/* ── Book container ── */}
      <div
        className={`relative ${isMobile ? "" : "rounded-lg"}`}
        style={
          isMobile
            ? { width: "100%", height: "100%" }
            : {
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
                overflow: "hidden",
              }
        }
      >
        {!isMobile && (
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            style={{ width: "30px", background: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.25) 60%, transparent 100%)" }}
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
            showCover={false}
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
            {/* ── STORY PAGES ── */}
            {pages.filter(p => p.page_number > 0).map((page) => {
              const fontSize = getTextFontSize(page.text, childAge, isMobile);
              // All flip book pages use split layout
              return (
                <BookPage key={page.id} bgImage={null} bedtime={bedtime}>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "58%",
                      overflow: "hidden",
                      background: bedtime ? "#1a1a2e" : "#F5F0E8",
                    }}
                  >
                    {page.illustration_url && (
                      <img
                        src={page.illustration_url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center top",
                        }}
                      />
                    )}
                  </div>
                  <AutoFitText
                    text={page.text}
                    pageNumber={page.page_number}
                    initialFontSize={parseInt(fontSize)}
                    pageTextFont={pageTextFont}
                    pageNumColor={pageNumColor}
                    textAreaBg={textAreaBg}
                  />
                </BookPage>
              );
            })}

            {/* ── END PAGE ── */}
            <BookPage bgImage={pages[pages.length - 1]?.illustration_url ?? story.cover_image_url} bedtime={bedtime}>
              <div style={{ position: "absolute", inset: 0, background: bedtime ? "rgba(13,13,26,0.75)" : "rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "24px" }}>
                <span className="text-6xl animate-float">🌙</span>
                <h2 style={{ ...storyFont, fontSize: isMobile ? "32px" : "42px" }}>The End</h2>
                <p style={{ ...storyFont, fontSize: isMobile ? "16px" : "20px", opacity: 0.8 }}>Sweet dreams, {childName} ✨</p>
                <StarRating storyId={story.id} initial={story.parent_rating} bedtime={bedtime} />
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setBookOpened(false); }}
                    className="px-5 py-2.5 rounded-full font-semibold text-sm border transition-all hover:opacity-80 active:scale-95"
                    style={{ ...storyFont, fontSize: "14px", borderColor: bedtime ? "#f5c56c44" : "#ffffff44", background: "transparent" }}
                  >
                    Read again
                  </button>
                  <Link
                    to="/dashboard"
                    onClick={(e) => e.stopPropagation()}
                    className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95 inline-flex items-center gap-2"
                    style={{ ...storyFont, fontSize: "14px", background: bedtime ? "#f5c56c" : "hsl(var(--primary))", color: bedtime ? "#1a1a2e" : "hsl(var(--primary-foreground))", textShadow: "none" }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Library
                  </Link>
                </div>
              </div>
            </BookPage>
          </HTMLFlipBook>
        )}
      </div>
    </div>
  );
}
