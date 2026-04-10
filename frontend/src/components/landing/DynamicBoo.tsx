import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   Section config — position, expression, extras
   ═══════════════════════════════════════════════════════ */
type Expression = "excited" | "curious" | "focused" | "happy" | "amazed" | "waving";

interface SectionConfig {
  position: { bottom?: string; top?: string; left?: string; right?: string };
  expression: Expression;
  extraClass?: string;
}

const SECTION_CONFIG: Record<string, SectionConfig> = {
  "section-hero":         { position: { bottom: "80px", right: "32px" },  expression: "excited" },
  "section-usecases":     { position: { bottom: "80px", left: "32px" },   expression: "curious" },
  "section-features":     { position: { top: "100px", right: "32px" },    expression: "focused" },
  "section-how":          { position: { bottom: "80px", right: "32px" },  expression: "focused" },
  "section-testimonials": { position: { bottom: "80px", left: "32px" },   expression: "happy" },
  "section-skills":       { position: { top: "100px", left: "32px" },     expression: "amazed" },
  "section-cta":          { position: { bottom: "140px", right: "60px" }, expression: "waving" },
};

const DEFAULT_CONFIG: SectionConfig = {
  position: { bottom: "80px", right: "32px" },
  expression: "excited",
};

const BUBBLE_MESSAGES = [
  "Boo! \uD83D\uDC7B",
  "Let's create!",
  "I got you!",
  "What do you need?",
  "Try clicking stuff!",
  "I'm your AI boo!",
  "Ask me anything!",
  "Ready when you are!",
];

/* ═══════════════════════════════════════════════════════
   DynamicBoo Component
   ═══════════════════════════════════════════════════════ */
export default function DynamicBoo() {
  const [currentSection, setCurrentSection] = useState("section-hero");
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);
  const [sparkles, setSparkles] = useState<number[]>([]);
  const booRef = useRef<HTMLDivElement>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = SECTION_CONFIG[currentSection] || DEFAULT_CONFIG;

  /* ── IntersectionObserver for section detection ── */
  useEffect(() => {
    const sectionIds = Object.keys(SECTION_CONFIG);
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setCurrentSection(id);
          }
        },
        { threshold: [0.3, 0.5, 0.7] }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* ── Mouse tracking for eye follow ── */
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!booRef.current) return;
      const rect = booRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      setMouseOffset({ x: Math.max(-2, Math.min(2, dx * 4)), y: Math.max(-2, Math.min(2, dy * 4)) });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  /* ── Hearts floating effect for testimonials ── */
  useEffect(() => {
    if (config.expression !== "happy") {
      setHearts([]);
      return;
    }
    const interval = setInterval(() => {
      setHearts((prev) => [...prev.slice(-4), Date.now()]);
    }, 1200);
    return () => clearInterval(interval);
  }, [config.expression]);

  /* ── Sparkles for hero ── */
  useEffect(() => {
    if (currentSection !== "section-hero" || !isHovered) {
      setSparkles([]);
      return;
    }
    const interval = setInterval(() => {
      setSparkles((prev) => [...prev.slice(-5), Date.now()]);
    }, 300);
    return () => clearInterval(interval);
  }, [currentSection, isHovered]);

  /* ── Click handler ── */
  const handleClick = useCallback(() => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setBubbleText(BUBBLE_MESSAGES[Math.floor(Math.random() * BUBBLE_MESSAGES.length)]);
    setShowBubble(true);
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 600);
    bubbleTimer.current = setTimeout(() => setShowBubble(false), 2500);
  }, []);

  /* ── Build position style ── */
  const posStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 90,
    transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
    cursor: "pointer",
    ...config.position,
  };

  // Clear opposite sides when switching
  if (config.position.left) { posStyle.right = "auto"; }
  if (config.position.right) { posStyle.left = "auto"; }
  if (config.position.top) { posStyle.bottom = "auto"; }
  if (config.position.bottom) { posStyle.top = "auto"; }

  return (
    <div
      ref={booRef}
      style={posStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`dynamic-boo ${isHovered ? "dynamic-boo-hover" : ""} ${isSpinning ? "dynamic-boo-spin" : ""}`}
    >
      {/* Speech bubble */}
      {showBubble && (
        <div className="boo-speech-bubble">
          {bubbleText}
          <div className="boo-speech-pointer" />
        </div>
      )}

      {/* Floating hearts (testimonials) */}
      {hearts.map((id) => (
        <div key={id} className="boo-float-heart" style={{ left: `${10 + Math.random() * 40}px` }}>
          &#x2764;&#xFE0F;
        </div>
      ))}

      {/* Sparkles on hover in hero */}
      {sparkles.map((id) => (
        <div
          key={id}
          className="boo-sparkle-particle"
          style={{
            left: `${Math.random() * 60}px`,
            top: `${Math.random() * 60}px`,
          }}
        />
      ))}

      {/* The ghost SVG */}
      <BooSVG
        expression={config.expression}
        mouseOffset={mouseOffset}
        isHovered={isHovered}
        tiltDirection={config.position.left ? "right" : "left"}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   The dynamic SVG ghost
   ═══════════════════════════════════════════════════════ */
function BooSVG({
  expression,
  mouseOffset,
  isHovered,
  tiltDirection,
}: {
  expression: Expression;
  mouseOffset: { x: number; y: number };
  isHovered: boolean;
  tiltDirection: "left" | "right";
}) {
  const SIZE = 60;

  /* Eye properties based on expression */
  const getEyes = () => {
    const baseLeftCx = 48 + mouseOffset.x;
    const baseRightCx = 72 + mouseOffset.x;
    const baseCy = 55 + mouseOffset.y;

    switch (expression) {
      case "excited":
        return {
          type: "ellipse" as const,
          left: { cx: baseLeftCx, cy: baseCy, rx: isHovered ? 9 : 8, ry: isHovered ? 11 : 10 },
          right: { cx: baseRightCx, cy: baseCy, rx: isHovered ? 9 : 8, ry: isHovered ? 11 : 10 },
          wink: !isHovered,
        };
      case "curious":
        return {
          type: "ellipse" as const,
          left: { cx: baseLeftCx - 1, cy: baseCy, rx: 7, ry: 9 },
          right: { cx: baseRightCx - 1, cy: baseCy, rx: 7, ry: 9 },
          wink: false,
        };
      case "focused":
        return {
          type: "ellipse" as const,
          left: { cx: baseLeftCx, cy: baseCy + 1, rx: 6, ry: 7 },
          right: { cx: baseRightCx, cy: baseCy + 1, rx: 6, ry: 7 },
          wink: false,
        };
      case "happy":
        return {
          type: "happy" as const,
          left: { cx: baseLeftCx, cy: baseCy, rx: 7, ry: 4 },
          right: { cx: baseRightCx, cy: baseCy, rx: 7, ry: 4 },
          wink: false,
        };
      case "amazed":
        return {
          type: "ellipse" as const,
          left: { cx: baseLeftCx, cy: baseCy, rx: 9, ry: 11 },
          right: { cx: baseRightCx, cy: baseCy, rx: 9, ry: 11 },
          wink: false,
        };
      case "waving":
        return {
          type: "ellipse" as const,
          left: { cx: baseLeftCx, cy: baseCy, rx: 7, ry: 9 },
          right: { cx: baseRightCx, cy: baseCy, rx: 7, ry: 9 },
          wink: false,
        };
    }
  };

  const getMouth = () => {
    switch (expression) {
      case "excited":
        return <ellipse cx="60" cy="74" rx="9" ry="6" fill="#3B0764" />;
      case "curious":
        return <ellipse cx="60" cy="74" rx="5" ry="4" fill="#3B0764" />;
      case "focused":
        return (
          <path d="M54 73 Q60 77 66 73" stroke="#3B0764" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        );
      case "happy":
        return (
          <path d="M50 71 Q60 80 70 71" stroke="#3B0764" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        );
      case "amazed":
        return <circle cx="60" cy="75" r="5" fill="#3B0764" />;
      case "waving":
        return (
          <path d="M52 72 Q60 78 68 72" stroke="#3B0764" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        );
    }
  };

  const eyes = getEyes();
  const showBlush = expression === "happy";
  const tilt = expression === "curious" ? (tiltDirection === "left" ? -8 : 8) : expression === "focused" ? (tiltDirection === "left" ? -4 : 4) : 0;

  /* Arm positions */
  const leftArmCy = expression === "waving" ? 58 : 68;
  const rightArmCy = 68;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox="0 0 120 120"
      style={{
        transform: `rotate(${tilt}deg)`,
        transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        filter: isHovered ? "drop-shadow(0 0 12px rgba(192,132,252,0.6))" : "drop-shadow(0 0 6px rgba(192,132,252,0.3))",
      }}
    >
      <defs>
        <radialGradient id="dynBooGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>

      {/* Body */}
      <path
        d="M60 8 C86 8 104 28 104 52 C104 78 86 98 60 98 C53 98 49 89 44 98 C38 89 33 98 27 89 C21 80 18 68 18 52 C18 28 38 8 60 8 Z"
        fill="url(#dynBooGrad)"
      />

      {/* Left arm */}
      <ellipse cx="24" cy={leftArmCy} rx="9" ry="12" fill="url(#dynBooGrad)">
        {expression === "waving" && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-15 24 68;15 24 68;-15 24 68"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </ellipse>

      {/* Right arm */}
      <ellipse cx="96" cy={rightArmCy} rx="9" ry="12" fill="url(#dynBooGrad)" />

      {/* Highlight */}
      <ellipse cx="60" cy="38" rx="28" ry="16" fill="white" opacity="0.2" />

      {/* Eyes */}
      {eyes.type === "happy" ? (
        <>
          {/* Happy closed eyes — curved arcs */}
          <path
            d={`M${eyes.left.cx - 6} ${eyes.left.cy} Q${eyes.left.cx} ${eyes.left.cy - 6} ${eyes.left.cx + 6} ${eyes.left.cy}`}
            stroke="#3B0764"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M${eyes.right.cx - 6} ${eyes.right.cy} Q${eyes.right.cx} ${eyes.right.cy - 6} ${eyes.right.cx + 6} ${eyes.right.cy}`}
            stroke="#3B0764"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          {/* Left eye */}
          <ellipse
            cx={eyes.left.cx}
            cy={eyes.left.cy}
            rx={eyes.left.rx}
            ry={eyes.wink ? 1.5 : eyes.left.ry}
            fill="#3B0764"
            style={{ transition: "all 0.4s ease" }}
          />
          {/* Right eye */}
          <ellipse
            cx={eyes.right.cx}
            cy={eyes.right.cy}
            rx={eyes.right.rx}
            ry={eyes.right.ry}
            fill="#3B0764"
            style={{ transition: "all 0.4s ease" }}
          />
          {/* Pupils / highlights */}
          {!eyes.wink && (
            <circle
              cx={eyes.left.cx - 2 + mouseOffset.x * 0.3}
              cy={eyes.left.cy - 3 + mouseOffset.y * 0.3}
              r="2"
              fill="white"
              style={{ transition: "all 0.15s ease" }}
            />
          )}
          <circle
            cx={eyes.right.cx - 2 + mouseOffset.x * 0.3}
            cy={eyes.right.cy - 3 + mouseOffset.y * 0.3}
            r="2"
            fill="white"
            style={{ transition: "all 0.15s ease" }}
          />
        </>
      )}

      {/* Blush */}
      {showBlush && (
        <>
          <circle cx="40" cy="64" r="5" fill="#F472B6" opacity="0.4" />
          <circle cx="80" cy="64" r="5" fill="#F472B6" opacity="0.4" />
        </>
      )}

      {/* Mouth */}
      {getMouth()}
    </svg>
  );
}
