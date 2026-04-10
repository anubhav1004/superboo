import { useEffect, useState, useCallback, useRef } from "react";

type Mood = "idle" | "excited" | "happy" | "amazed" | "waving";

const MESSAGES = [
  "Boo! 👻", "Let's create!", "I got you!", "What do you need?",
  "Try clicking stuff!", "I'm your AI boo!", "Ask me anything!", "Ready when you are!",
];

export default function DynamicBoo() {
  const [mood, setMood] = useState<Mood>("idle");
  const [hovered, setHovered] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const booRef = useRef<HTMLDivElement>(null);
  const bubbleTimer = useRef<number>(0);

  // Detect which section is visible → change mood (no position change)
  useEffect(() => {
    const sections: [string, Mood][] = [
      ["section-hero", "idle"],
      ["section-usecases", "excited"],
      ["section-features", "idle"],
      ["section-how", "idle"],
      ["section-testimonials", "happy"],
      ["section-skills", "amazed"],
      ["section-cta", "waving"],
    ];

    const observers: IntersectionObserver[] = [];
    for (const [id, m] of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setMood(m); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Subtle eye tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const boo = booRef.current;
      if (!boo) return;
      const rect = boo.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      setEyeOffset({ x: dx * 2.5, y: dy * 2 });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const handleClick = useCallback(() => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    clearTimeout(bubbleTimer.current);
    setBubble(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 2500);
  }, []);

  // Dynamic eyes
  const eyeL = { cx: 52 + eyeOffset.x, cy: 58 + eyeOffset.y, rx: mood === "amazed" ? 9 : mood === "happy" ? 7 : (mood === "excited" || hovered) ? 8 : 7, ry: mood === "amazed" ? 11 : mood === "happy" ? 4 : (mood === "excited" || hovered) ? 10 : 9 };
  const eyeR = { cx: 76 + eyeOffset.x, cy: 58 + eyeOffset.y, rx: eyeL.rx, ry: eyeL.ry };

  // Dynamic mouth
  const mouth = mood === "amazed"
    ? <circle cx={64} cy={78} r={4} fill="#3B0764" />
    : (mood === "happy" || mood === "excited" || mood === "waving" || hovered)
    ? <path d="M56 74 Q64 84 72 74" fill="none" stroke="#3B0764" strokeWidth="2.5" strokeLinecap="round" />
    : <ellipse cx={64} cy={76} rx={6} ry={4} fill="#3B0764" />;

  const showBlush = mood === "happy" || (hovered && mood === "excited");

  return (
    <div
      ref={booRef}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 90, cursor: "pointer",
        transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s",
        transform: spinning ? "rotate(360deg) scale(1.1)" : hovered ? "scale(1.15)" : "scale(1)",
        filter: hovered ? "drop-shadow(0 4px 30px rgba(147,112,255,0.5))" : "drop-shadow(0 4px 16px rgba(147,112,255,0.25))",
        animation: "booBreath 3.5s ease-in-out infinite",
      }}
    >
      {/* Speech bubble */}
      {bubble && (
        <div style={{
          position: "absolute", bottom: "100%", right: 0, marginBottom: 10,
          background: "rgba(255,255,255,0.95)", color: "#1a1a2e", fontSize: 13, fontWeight: 600,
          padding: "8px 14px", borderRadius: 14, whiteSpace: "nowrap",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          animation: "bubblePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
          {bubble}
          <div style={{
            position: "absolute", bottom: -5, right: 18, width: 10, height: 10,
            background: "rgba(255,255,255,0.95)", transform: "rotate(45deg)", borderRadius: 2,
          }} />
        </div>
      )}

      {/* Hearts for happy mood */}
      {mood === "happy" && (
        <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              position: "absolute", fontSize: 12,
              animation: `heartUp 2s ease-out infinite ${i * 0.5}s`,
            }}>❤️</span>
          ))}
        </div>
      )}

      {/* Ghost SVG */}
      <svg width={60} height={60} viewBox="0 0 128 128">
        <path d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z" fill="url(#bGr)" />
        <ellipse cx={26} cy={70} rx={10} ry={14} fill="url(#bGr)"
          style={{ transformOrigin: "26px 56px", transform: mood === "waving" ? "rotate(-30deg)" : "rotate(0deg)", transition: "transform 0.5s ease" }} />
        <ellipse cx={102} cy={70} rx={10} ry={14} fill="url(#bGr)" />
        <ellipse cx={eyeL.cx} cy={eyeL.cy} rx={eyeL.rx} ry={eyeL.ry} fill="#3B0764" style={{ transition: "all 0.35s ease" }} />
        <ellipse cx={eyeR.cx} cy={eyeR.cy} rx={eyeR.rx} ry={eyeR.ry} fill="#3B0764" style={{ transition: "all 0.35s ease" }} />
        <circle cx={eyeL.cx - 2} cy={eyeL.cy - 3} r={2.5} fill="white" style={{ transition: "all 0.35s ease" }} />
        <circle cx={eyeR.cx - 2} cy={eyeR.cy - 3} r={2.5} fill="white" style={{ transition: "all 0.35s ease" }} />
        <g style={{ transition: "all 0.35s ease" }}>{mouth}</g>
        {showBlush && <>
          <circle cx={42} cy={70} r={5} fill="#EC4899" opacity={0.3} />
          <circle cx={86} cy={70} r={5} fill="#EC4899" opacity={0.3} />
        </>}
        <ellipse cx={64} cy={40} rx={30} ry={18} fill="white" opacity={0.2} />
        <defs>
          <radialGradient id="bGr" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F5E9FF" /><stop offset="50%" stopColor="#C084FC" /><stop offset="100%" stopColor="#6D28D9" />
          </radialGradient>
        </defs>
      </svg>

      <style>{`
        @keyframes booBreath {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes bubblePop {
          from { opacity: 0; transform: scale(0.7) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes heartUp {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-36px) scale(0.4); }
        }
        @media (max-width: 768px) {
          div[style*="position: fixed"][style*="bottom: 24"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
