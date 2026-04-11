import { useEffect, useState, useCallback, useRef } from "react";
import { useChatStore } from "../../store/chat";

const TIPS = [
  "Click anything \u2014 I'll explain it!",
  "Need help? Just ask!",
  "I'm watching your screen \ud83d\udc40",
  "Try creating something!",
  "Press ESC to exit Guide Mode",
  "Explore the sidebar!",
];

function BooGhost({
  eyeOffsetX,
  eyeOffsetY,
  tilt,
  fast,
}: {
  eyeOffsetX: number;
  eyeOffsetY: number;
  tilt: number;
  fast: boolean;
}) {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0 0 12px rgba(147,112,255,0.6))",
        transform: `rotate(${tilt}deg)`,
        transition: "transform 0.2s ease-out",
      }}
    >
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#guideGhostGrad)"
      />
      <ellipse cx="26" cy="70" rx="10" ry="14" fill="url(#guideGhostGrad)" />
      <ellipse cx="102" cy="70" rx="10" ry="14" fill="url(#guideGhostGrad)" />
      {/* Eyes */}
      <ellipse
        cx="52"
        cy="58"
        rx={fast ? 8 : 7}
        ry={fast ? 10 : 9}
        fill="#3B0764"
      />
      <ellipse
        cx="76"
        cy="58"
        rx={fast ? 8 : 7}
        ry={fast ? 10 : 9}
        fill="#3B0764"
      />
      {/* Pupils follow cursor */}
      <circle cx={50 + eyeOffsetX * 3} cy={54 + eyeOffsetY * 2} r="2.5" fill="white" />
      <circle cx={74 + eyeOffsetX * 3} cy={54 + eyeOffsetY * 2} r="2.5" fill="white" />
      {/* Mouth */}
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#3B0764" />
      {/* Highlight */}
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25" />
      <defs>
        <radialGradient id="guideGhostGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
}

export default function GuideMode() {
  const toggleGuideMode = useChatStore((s) => s.toggleGuideMode);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [idle, setIdle] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [pillVisible, setPillVisible] = useState(true);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [bobPhase, setBobPhase] = useState(0);
  const lastMoveRef = useRef(Date.now());
  const lastPosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef(0);
  const [tilt, setTilt] = useState(0);
  const [fast, setFast] = useState(false);
  const sparkleIdRef = useRef(0);

  // ESC to exit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleGuideMode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleGuideMode]);

  // Track mouse
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      velocityRef.current = dist;

      lastPosRef.current = { x: e.clientX, y: e.clientY };
      lastMoveRef.current = Date.now();
      setPos({ x: e.clientX, y: e.clientY });
      setIdle(false);

      // Tilt based on horizontal movement
      const newTilt = Math.max(-15, Math.min(15, dx * 0.5));
      setTilt(newTilt);
      setFast(dist > 20);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Eye direction (normalized -1 to 1)
  const eyeOffsetX =
    pos.x > 0
      ? Math.max(-1, Math.min(1, (pos.x - lastPosRef.current.x) * 0.1 || 0))
      : 0;
  const eyeOffsetY =
    pos.y > 0
      ? Math.max(-1, Math.min(1, (pos.y - lastPosRef.current.y) * 0.1 || 0))
      : 0;

  // Idle detection
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMoveRef.current > 3000) {
        setIdle(true);
        setTilt(0);
        setFast(false);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Cycle tips when idle
  useEffect(() => {
    if (!idle) return;
    setTipIndex(Math.floor(Math.random() * TIPS.length));
  }, [idle]);

  // Hide pill after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setPillVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Gentle bob animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBobPhase((p) => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Click sparkles
  const handleClick = useCallback((e: MouseEvent) => {
    const id = ++sparkleIdRef.current;
    const sparkle = { id, x: e.clientX, y: e.clientY };
    setSparkles((prev) => [...prev, sparkle]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== id));
    }, 600);
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  const bobY = Math.sin((bobPhase * Math.PI) / 180) * 4;

  return (
    <>
      <style>{`
        @keyframes guideBorderPulse {
          0%, 100% { box-shadow: inset 0 0 30px rgba(147,112,255,0.2), inset 0 0 60px rgba(147,112,255,0.1); }
          50% { box-shadow: inset 0 0 40px rgba(147,112,255,0.35), inset 0 0 80px rgba(147,112,255,0.15); }
        }
        @keyframes guidePillFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes guidePillFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes guideSparkle {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes guideSpeechBubble {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes guideBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {/* Border glow overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          border: "4px solid transparent",
          borderImage: "linear-gradient(135deg, #9370FF, #7C3AED, #C084FC, #9370FF) 1",
          animation: "guideBorderPulse 2s ease-in-out infinite",
          borderRadius: 0,
        }}
      />

      {/* Info pill */}
      {pillVisible && (
        <div
          style={{
            position: "fixed",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10001,
            pointerEvents: "none",
            background: "rgba(147,112,255,0.15)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(147,112,255,0.3)",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 12,
            color: "rgba(255,255,255,0.8)",
            animation: "guidePillFadeIn 0.3s ease-out",
            whiteSpace: "nowrap",
          }}
        >
          Guide Mode Active — Press ESC to exit
        </div>
      )}

      {/* Ghost following cursor */}
      <div
        style={{
          position: "fixed",
          left: pos.x + 15,
          top: pos.y + 15 + bobY,
          transition: "left 0.15s ease-out, top 0.15s ease-out",
          pointerEvents: "none",
          zIndex: 10000,
        }}
      >
        <div style={{ animation: idle ? "guideBounce 1s ease-in-out infinite" : "none" }}>
          <BooGhost
            eyeOffsetX={eyeOffsetX}
            eyeOffsetY={eyeOffsetY}
            tilt={tilt}
            fast={fast}
          />
        </div>

        {/* Speech bubble when idle */}
        {idle && (
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: 8,
              background: "white",
              color: "#1a1a2e",
              fontSize: 11,
              fontWeight: 500,
              padding: "5px 10px",
              borderRadius: 10,
              whiteSpace: "nowrap",
              animation: "guideSpeechBubble 0.3s ease-out",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {TIPS[tipIndex]}
            {/* Little triangle */}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                marginLeft: -4,
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "4px solid white",
              }}
            />
          </div>
        )}
      </div>

      {/* Click sparkles */}
      {sparkles.map((s) => (
        <div key={s.id} style={{ position: "fixed", left: s.x, top: s.y, zIndex: 10002, pointerEvents: "none" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: i % 2 === 0 ? "#C084FC" : "#9370FF",
                left: Math.cos((i * 72 * Math.PI) / 180) * 12 - 3,
                top: Math.sin((i * 72 * Math.PI) / 180) * 12 - 3,
                animation: "guideSparkle 0.6s ease-out forwards",
                animationDelay: `${i * 0.05}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      ))}
    </>
  );
}
