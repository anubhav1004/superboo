import { useEffect, useState, useCallback, useRef } from "react";
import { useChatStore } from "../../store/chat";
import { sendChatWithPolling } from "../../lib/api";

/* ═══════════════════════════════════════════════════
   Tips & personality
   ═══════════════════════════════════════════════════ */
const IDLE_TIPS = [
  "Hold SPACE to talk to me!",
  "Ask me anything 👻",
  "I can help with what you see",
  "Try saying 'what should I do?'",
  "Press ESC to exit",
];

const GREETINGS = [
  "Hey! I'm right here 👻",
  "Guide Mode on! Hold SPACE to talk",
  "I'm following you — hold SPACE to chat!",
];

/* ═══════════════════════════════════════════════════
   Boo Ghost SVG
   ═══════════════════════════════════════════════════ */
function BooGhost({ eyeX, eyeY, tilt, mood }: {
  eyeX: number; eyeY: number; tilt: number;
  mood: "idle" | "listening" | "thinking" | "speaking";
}) {
  const eyeRx = mood === "listening" ? 9 : mood === "speaking" ? 6 : 7;
  const eyeRy = mood === "listening" ? 11 : mood === "speaking" ? 7 : 9;
  const mouthEl = mood === "listening"
    ? <circle cx={64} cy={78} r={6} fill="#3B0764" />
    : mood === "speaking"
    ? <ellipse cx={64} cy={76} rx={9} ry={6} fill="#3B0764" />
    : <ellipse cx={64} cy={76} rx={7} ry={4} fill="#3B0764" />;

  return (
    <svg width={44} height={44} viewBox="0 0 128 128" style={{
      filter: `drop-shadow(0 0 ${mood === "listening" ? 20 : mood === "speaking" ? 16 : 10}px rgba(147,112,255,${mood === "listening" ? 0.8 : 0.5}))`,
      transform: `rotate(${tilt}deg)`,
      transition: "transform 0.2s ease-out, filter 0.3s",
    }}>
      <path d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z" fill="url(#gGM)" />
      <ellipse cx="26" cy="70" rx="10" ry="14" fill="url(#gGM)" />
      <ellipse cx="102" cy="70" rx="10" ry="14" fill="url(#gGM)" />
      <ellipse cx={52 + eyeX * 3} cy={58 + eyeY * 2} rx={eyeRx} ry={eyeRy} fill="#3B0764" style={{ transition: "all 0.2s" }} />
      <ellipse cx={76 + eyeX * 3} cy={58 + eyeY * 2} rx={eyeRx} ry={eyeRy} fill="#3B0764" style={{ transition: "all 0.2s" }} />
      <circle cx={50 + eyeX * 3} cy={54 + eyeY * 2} r="2.5" fill="white" style={{ transition: "all 0.2s" }} />
      <circle cx={74 + eyeX * 3} cy={54 + eyeY * 2} r="2.5" fill="white" style={{ transition: "all 0.2s" }} />
      {mouthEl}
      {mood === "listening" && <>
        <circle cx={42} cy={70} r={5} fill="#EC4899" opacity={0.4} />
        <circle cx={86} cy={70} r={5} fill="#EC4899" opacity={0.4} />
      </>}
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.2" />
      <defs>
        <radialGradient id="gGM" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" /><stop offset="50%" stopColor="#C084FC" /><stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   Speech Recognition hook
   ═══════════════════════════════════════════════════ */
function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recRef = useRef<any>(null);

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };
    rec.onerror = () => { setIsListening(false); };
    rec.onend = () => { setIsListening(false); };
    rec.start();
    recRef.current = rec;
    setIsListening(true);
    setTranscript("");
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setIsListening(false);
    return transcript;
  }, [transcript]);

  return { transcript, isListening, start, stop };
}

/* ═══════════════════════════════════════════════════
   Text-to-Speech
   ═══════════════════════════════════════════════════ */
function speak(text: string, onEnd: () => void) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.05;
  utt.pitch = 1.1;
  utt.volume = 0.9;
  // Try to find a friendly voice
  const voices = synth.getVoices();
  const preferred = voices.find(v => v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Google"));
  if (preferred) utt.voice = preferred;
  utt.onend = onEnd;
  synth.speak(utt);
}

/* ═══════════════════════════════════════════════════
   Main Guide Mode Component
   ═══════════════════════════════════════════════════ */
export default function GuideMode() {
  const toggleGuideMode = useChatStore((s) => s.toggleGuideMode);

  // Cursor tracking
  const [pos, setPos] = useState({ x: 200, y: 200 });
  const [tilt, setTilt] = useState(0);
  const [eyeX, setEyeX] = useState(0);
  const [eyeY, setEyeY] = useState(0);
  const lastMoveRef = useRef(Date.now());
  const lastPosRef = useRef({ x: 200, y: 200 });

  // State
  const [mood, setMood] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [bubble, setBubble] = useState<string>(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  const [idleTick, setIdleTick] = useState(0);
  const [showPill, setShowPill] = useState(true);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const sparkleId = useRef(0);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [bobPhase, setBobPhase] = useState(0);

  // Voice
  const { transcript, isListening, start: startListening, stop: stopListening } = useSpeechRecognition();

  // ESC to exit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleGuideMode();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleGuideMode]);

  // SPACE hold = push-to-talk
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !spaceHeld) {
        // Don't capture if typing in an input
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setSpaceHeld(true);
        setMood("listening");
        setBubble("I'm listening...");
        startListening();
      }
    };
    const up = async (e: KeyboardEvent) => {
      if (e.code === "Space" && spaceHeld) {
        e.preventDefault();
        setSpaceHeld(false);
        const text = stopListening();
        if (text && text.trim().length > 2) {
          setMood("thinking");
          setBubble("Hmm, let me think...");
          try {
            const reply = await sendChatWithPolling(
              `[system: You are Superboo Guide Mode. You are a friendly ghost companion following the user's cursor. Keep responses SHORT (1-2 sentences max). Be helpful, casual, fun. No markdown. No file paths. Just conversational.]\n${text}`,
              "agent:main:main"
            );
            if (reply && reply.trim()) {
              const shortReply = reply.length > 150 ? reply.slice(0, 147) + "..." : reply;
              setMood("speaking");
              setBubble(shortReply);
              speak(shortReply, () => {
                setMood("idle");
                setTimeout(() => setBubble("Hold SPACE to talk again!"), 3000);
              });
            } else {
              setMood("idle");
              setBubble("Hmm, I didn't catch that. Try again?");
            }
          } catch {
            setMood("idle");
            setBubble("Oops, couldn't connect. Try again!");
          }
        } else {
          setMood("idle");
          setBubble("Hold SPACE longer and speak!");
        }
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [spaceHeld, startListening, stopListening]);

  // Mouse tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      lastMoveRef.current = Date.now();
      setPos({ x: e.clientX, y: e.clientY });
      setTilt(Math.max(-12, Math.min(12, dx * 0.4)));
      setEyeX(Math.max(-1, Math.min(1, dx * 0.05)));
      setEyeY(Math.max(-1, Math.min(1, dy * 0.05)));
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Idle tip cycling
  useEffect(() => {
    const iv = setInterval(() => {
      if (Date.now() - lastMoveRef.current > 5000 && mood === "idle") {
        setIdleTick(t => t + 1);
        setBubble(IDLE_TIPS[idleTick % IDLE_TIPS.length]);
      }
    }, 5000);
    return () => clearInterval(iv);
  }, [mood, idleTick]);

  // Hide pill after 4s
  useEffect(() => { const t = setTimeout(() => setShowPill(false), 4000); return () => clearTimeout(t); }, []);

  // Bob
  useEffect(() => { const iv = setInterval(() => setBobPhase(p => (p + 1) % 360), 50); return () => clearInterval(iv); }, []);
  const bobY = Math.sin((bobPhase * Math.PI) / 180) * 3;

  // Click sparkles
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const id = ++sparkleId.current;
      setSparkles(p => [...p, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setSparkles(p => p.filter(s => s.id !== id)), 600);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  // Live transcript display
  const displayBubble = isListening && transcript ? `"${transcript}"` : bubble;

  // Border glow color based on mood
  const glowColor = mood === "listening" ? "rgba(236,72,153,0.4)" : mood === "thinking" ? "rgba(234,179,8,0.3)" : mood === "speaking" ? "rgba(74,222,128,0.3)" : "rgba(147,112,255,0.2)";
  const glowColor2 = mood === "listening" ? "rgba(236,72,153,0.2)" : mood === "thinking" ? "rgba(234,179,8,0.15)" : mood === "speaking" ? "rgba(74,222,128,0.15)" : "rgba(147,112,255,0.1)";

  return (
    <>
      <style>{`
        @keyframes gmBorder { 0%,100% { box-shadow: inset 0 0 30px ${glowColor}, inset 0 0 60px ${glowColor2}; } 50% { box-shadow: inset 0 0 50px ${glowColor}, inset 0 0 100px ${glowColor2}; } }
        @keyframes gmPillIn { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes gmSparkle { 0% { transform:scale(0); opacity:1; } 100% { transform:scale(2); opacity:0; } }
        @keyframes gmBubbleIn { from { opacity:0; transform:translateY(4px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes gmPulseRing { 0% { transform:scale(1); opacity:0.6; } 100% { transform:scale(2.5); opacity:0; } }
      `}</style>

      {/* Border glow */}
      <div style={{ position:"fixed", inset:0, zIndex:9998, pointerEvents:"none", animation:"gmBorder 2s ease-in-out infinite", transition:"box-shadow 0.5s" }} />

      {/* Pill */}
      {showPill && (
        <div style={{ position:"fixed", top:56, left:"50%", transform:"translateX(-50%)", zIndex:10001, pointerEvents:"none",
          background:"rgba(12,1,24,0.8)", backdropFilter:"blur(12px)", border:"1px solid rgba(147,112,255,0.3)",
          borderRadius:20, padding:"6px 16px", fontSize:12, color:"rgba(255,255,255,0.7)", whiteSpace:"nowrap", animation:"gmPillIn 0.3s ease-out" }}>
          👻 Guide Mode — hold <kbd style={{ background:"rgba(255,255,255,0.1)", padding:"1px 6px", borderRadius:4, fontSize:11, margin:"0 2px" }}>SPACE</kbd> to talk · <kbd style={{ background:"rgba(255,255,255,0.1)", padding:"1px 6px", borderRadius:4, fontSize:11 }}>ESC</kbd> to exit
        </div>
      )}

      {/* Ghost + bubble */}
      <div style={{ position:"fixed", left:pos.x + 16, top:pos.y + 16 + bobY, transition:"left 0.12s ease-out, top 0.12s ease-out", pointerEvents:"none", zIndex:10000 }}>
        {/* Pulse ring when listening */}
        {mood === "listening" && (
          <div style={{ position:"absolute", top:"50%", left:"50%", width:44, height:44, marginTop:-22, marginLeft:-22, borderRadius:"50%", border:"2px solid rgba(236,72,153,0.5)", animation:"gmPulseRing 1.2s ease-out infinite" }} />
        )}

        <div style={{ animation: mood === "idle" && !isListening ? "none" : "none" }}>
          <BooGhost eyeX={eyeX} eyeY={eyeY} tilt={tilt} mood={mood} />
        </div>

        {/* Speech bubble */}
        {displayBubble && (
          <div style={{
            position:"absolute", bottom:"100%", left:"50%", transform:"translateX(-50%)", marginBottom:10,
            background: mood === "listening" ? "rgba(236,72,153,0.15)" : mood === "speaking" ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.95)",
            color: mood === "listening" || mood === "speaking" ? "white" : "#1a1a2e",
            backdropFilter: mood !== "idle" ? "blur(12px)" : "none",
            border: mood === "listening" ? "1px solid rgba(236,72,153,0.3)" : mood === "speaking" ? "1px solid rgba(74,222,128,0.2)" : "none",
            fontSize:12, fontWeight:500, padding:"6px 12px", borderRadius:12, maxWidth:260, lineHeight:1.4,
            animation:"gmBubbleIn 0.25s ease-out", boxShadow: mood === "idle" ? "0 2px 12px rgba(0,0,0,0.15)" : "none",
            whiteSpace: displayBubble.length > 50 ? "normal" : "nowrap",
          }}>
            {displayBubble}
            <div style={{ position:"absolute", top:"100%", left:"50%", marginLeft:-4, width:0, height:0,
              borderLeft:"5px solid transparent", borderRight:"5px solid transparent",
              borderTop: `5px solid ${mood === "listening" ? "rgba(236,72,153,0.15)" : mood === "speaking" ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.95)"}` }} />
          </div>
        )}
      </div>

      {/* Click sparkles */}
      {sparkles.map(s => (
        <div key={s.id} style={{ position:"fixed", left:s.x, top:s.y, zIndex:10002, pointerEvents:"none" }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              position:"absolute", width:5, height:5, borderRadius:"50%",
              background: i%2===0 ? "#C084FC" : "#EC4899",
              left: Math.cos((i*72*Math.PI)/180)*14-2.5, top: Math.sin((i*72*Math.PI)/180)*14-2.5,
              animation:`gmSparkle 0.5s ease-out ${i*0.04}s forwards`, opacity:0,
            }} />
          ))}
        </div>
      ))}
    </>
  );
}
