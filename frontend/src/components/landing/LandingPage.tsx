import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Presentation, PenTool, FileText, Film, TrendingUp } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   Ghost SVG
   ═══════════════════════════════════════════════════════ */
function Ghost({ size = 120, id = "gG" }: { size?: number; id?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128">
      <path d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z" fill={`url(#${id})`}/>
      <ellipse cx="26" cy="70" rx="10" ry="14" fill={`url(#${id})`}/>
      <ellipse cx="102" cy="70" rx="10" ry="14" fill={`url(#${id})`}/>
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764"/>
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764"/>
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#3B0764"/>
      <circle cx="50" cy="54" r="2.5" fill="white"/>
      <circle cx="74" cy="54" r="2.5" fill="white"/>
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25"/>
      <defs>
        <radialGradient id={id} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF"/>
          <stop offset="50%" stopColor="#C084FC"/>
          <stop offset="100%" stopColor="#6D28D9"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   Scroll-reveal hook (IntersectionObserver)
   ═══════════════════════════════════════════════════════ */
function useReveal<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ═══════════════════════════════════════════════════════
   Animated chat preview (fake demo)
   ═══════════════════════════════════════════════════════ */
function ChatPreview() {
  const lines = [
    { role: "user", text: "Make me a pitch deck for my AI fitness app" },
    { role: "bot", text: "On it! Creating your pitch deck..." },
    { role: "bot", text: "Writing the narrative and key slides..." },
    { role: "bot", text: "Designing visuals and charts..." },
    { role: "bot", text: "Your 10-slide pitch deck is ready! \uD83D\uDCCA" },
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= lines.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 800 : 1400);
    return () => clearTimeout(t);
  }, [shown, lines.length]);

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-[#1e1e26] bg-[#111116] overflow-hidden shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e26]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"/>
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"/>
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]"/>
        </div>
        <span className="text-[11px] text-[#5a5a67] ml-2 font-mono">superboo.me/chat</span>
      </div>
      {/* Messages */}
      <div className="px-4 py-4 space-y-3 min-h-[200px]">
        {lines.slice(0, shown).map((l, i) => (
          <div key={i} className="flex gap-2.5"
            style={{ animation: "chatFadeIn 0.4s ease-out" }}>
            <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-[9px] ${
              l.role === "user" ? "bg-[#1e1e26] text-[#8f8f9c]" : "bg-gradient-to-br from-[#7c5cff] to-[#C084FC] text-white"
            }`}>
              {l.role === "user" ? "Y" : "S"}
            </div>
            <div className={`text-[12px] leading-relaxed ${l.role === "user" ? "text-[#ececef]" : "text-[#8f8f9c]"}`}>
              {l.text}
            </div>
          </div>
        ))}
        {shown < lines.length && (
          <div className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#C084FC] flex-shrink-0 mt-0.5"/>
            <div className="flex gap-1 pt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c5cff] animate-bounce" style={{animationDelay:"0ms"}}/>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c5cff] animate-bounce" style={{animationDelay:"150ms"}}/>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c5cff] animate-bounce" style={{animationDelay:"300ms"}}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════ */
const FEATURES: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; desc: string }[] = [
  { icon: Video, title: "TikTok & Reels", desc: "Scroll-stopping short videos with captions, transitions, and trending hooks." },
  { icon: Presentation, title: "Pitch Decks", desc: "Polished presentations that tell your story. From idea to slides in seconds." },
  { icon: PenTool, title: "Designs & Posters", desc: "Event posters, flyers, social graphics. Describe it, Boo designs it." },
  { icon: FileText, title: "Resumes & Docs", desc: "Professional resumes, essays, emails. Write better, faster." },
  { icon: Film, title: "Video Editing", desc: "Captions, color grading, transitions, voiceovers. Drop your clip, get it polished." },
  { icon: TrendingUp, title: "Research & Trends", desc: "Market analysis, competitor research, trend reports. Know what's happening." },
];

const SKILLS_ROW1 = ["TikTok Videos", "Pitch Decks", "YouTube Thumbnails", "Resumes", "Social Posts", "Posters", "Memes", "Blog Posts", "Email Copy"];
const SKILLS_ROW2 = ["Video Editing", "Voiceovers", "Logo Design", "Image Editing", "Market Research", "Business Plans", "Trend Reports", "Podcast Clips"];

const STATS = [
  { value: "20+", label: "Creation Types" },
  { value: "Instant", label: "Results" },
  { value: "Zero", label: "Design Skills Needed" },
  { value: "Free", label: "To Try" },
];

const USE_CASES = [
  { emoji: "\uD83C\uDFAC", label: "Create a TikTok", color: "#EC4899" },
  { emoji: "\uD83D\uDCCA", label: "Make a deck", color: "#22C55E" },
  { emoji: "\uD83C\uDFA8", label: "Design a poster", color: "#3B82F6" },
  { emoji: "\uD83D\uDCDD", label: "Write a resume", color: "#22C55E" },
  { emoji: "\uD83D\uDE02", label: "Make a meme", color: "#EC4899" },
  { emoji: "\uD83C\uDFB5", label: "Create a beat", color: "#F97316" },
  { emoji: "\uD83D\uDCC8", label: "Research trends", color: "#EAB308" },
  { emoji: "\u2709\uFE0F", label: "Write an email", color: "#22C55E" },
];

/* ═══════════════════════════════════════════════════════
   Mini game (easter egg)
   ═══════════════════════════════════════════════════════ */
interface Obstacle { x: number; width: number; height: number; }

function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const stateRef = useRef({ ghostY:0, ghostVY:0, jumping:false, obstacles:[] as Obstacle[], frame:0, score:0, gameOver:false, started:false, speed:3, squash:1 });
  const rafRef = useRef(0);
  const W=600, H=200, GY=H-30, GW=32, GH=36, GRAV=0.6, JV=-10;

  const drawGhost = useCallback((ctx:CanvasRenderingContext2D, x:number, y:number, sq:number) => {
    ctx.save(); ctx.translate(x+GW/2,y+GH); ctx.scale(1+(1-sq)*0.3,sq);
    const g=ctx.createRadialGradient(0,-GH*0.7,2,0,-GH*0.5,GW);
    g.addColorStop(0,"#F5E9FF"); g.addColorStop(0.5,"#C084FC"); g.addColorStop(1,"#6D28D9");
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(0,-GH*0.55,GW/2,GH*0.55,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-GW/2,-GH*0.2);
    for(let i=0;i<=4;i++){ctx.lineTo(-GW/2+(GW/4)*i,i%2===0?0:-6);}
    ctx.lineTo(GW/2,-GH*0.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle="#3B0764"; ctx.beginPath(); ctx.ellipse(-6,-GH*0.55,3.5,4.5,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6,-GH*0.55,3.5,4.5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="white"; ctx.beginPath(); ctx.arc(-7,-GH*0.6,1.2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5,-GH*0.6,1.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#3B0764"; ctx.beginPath(); ctx.ellipse(0,-GH*0.35,4,2.5,0,0,Math.PI*2); ctx.fill();
    ctx.restore();
  },[]);

  const loop = useCallback(()=>{
    const c=canvasRef.current; if(!c)return; const ctx=c.getContext("2d"); if(!ctx)return; const s=stateRef.current;
    ctx.clearRect(0,0,W,H);
    const gg=ctx.createLinearGradient(0,GY,0,H); gg.addColorStop(0,"#2d1b4e"); gg.addColorStop(1,"#0c0c10");
    ctx.fillStyle=gg; ctx.fillRect(0,GY,W,H-GY);
    ctx.strokeStyle="#7c5cff33"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,GY); ctx.lineTo(W,GY); ctx.stroke();
    if(!s.started){ drawGhost(ctx,60,GY-GH,1); ctx.fillStyle="#9a9aa8"; ctx.font='13px "Inter",sans-serif'; ctx.textAlign="center"; ctx.fillText("SPACE / tap to start",W/2,H/2-10); rafRef.current=requestAnimationFrame(loop); return; }
    if(s.gameOver){ drawGhost(ctx,60,s.ghostY,1); for(const o of s.obstacles){ctx.fillStyle="#7c5cff";ctx.fillRect(o.x,GY-o.height,o.width,o.height);} ctx.fillStyle="#ef4444"; ctx.font='bold 18px "Inter",sans-serif'; ctx.textAlign="center"; ctx.fillText("Game Over",W/2,H/2-20); ctx.fillStyle="#9a9aa8"; ctx.font='13px "Inter",sans-serif'; ctx.fillText(`Score: ${s.score} — SPACE to retry`,W/2,H/2+8); return; }
    s.ghostVY+=GRAV; s.ghostY+=s.ghostVY; if(s.ghostY>=GY-GH){s.ghostY=GY-GH;s.ghostVY=0;s.jumping=false;s.squash=1;}
    if(s.jumping){s.squash=s.ghostVY<0?1.15:0.85;}else{s.squash+=(1-s.squash)*0.3;}
    s.frame++; if(s.frame%Math.max(60,100-Math.floor(s.score/5))===0){s.obstacles.push({x:W,width:16+Math.random()*10,height:20+Math.random()*25});}
    s.speed=3+s.score*0.05;
    for(let i=s.obstacles.length-1;i>=0;i--){s.obstacles[i].x-=s.speed;if(s.obstacles[i].x+s.obstacles[i].width<0){s.obstacles.splice(i,1);s.score++;setScore(s.score);}}
    for(const o of s.obstacles){if(60+GW-6>o.x&&60+6<o.x+o.width&&s.ghostY+GH>GY-o.height){s.gameOver=true;setGameOver(true);}}
    for(const o of s.obstacles){ctx.fillStyle="#7c5cff";ctx.beginPath();ctx.moveTo(o.x+o.width/2,GY-o.height);ctx.lineTo(o.x+o.width,GY-o.height*0.3);ctx.lineTo(o.x+o.width-2,GY);ctx.lineTo(o.x+2,GY);ctx.lineTo(o.x,GY-o.height*0.3);ctx.closePath();ctx.fill();}
    drawGhost(ctx,60,s.ghostY,s.squash); rafRef.current=requestAnimationFrame(loop);
  },[canvasRef,drawGhost]);

  const jump = useCallback(()=>{
    const s=stateRef.current;
    if(!s.started){s.started=true;s.ghostY=GY-GH;s.obstacles=[];s.frame=0;s.score=0;s.gameOver=false;s.speed=3;setStarted(true);setGameOver(false);setScore(0);cancelAnimationFrame(rafRef.current);rafRef.current=requestAnimationFrame(loop);return;}
    if(s.gameOver){s.started=true;s.ghostY=GY-GH;s.ghostVY=0;s.jumping=false;s.obstacles=[];s.frame=0;s.score=0;s.gameOver=false;s.speed=3;setGameOver(false);setScore(0);rafRef.current=requestAnimationFrame(loop);return;}
    if(!s.jumping){s.ghostVY=JV;s.jumping=true;}
  },[loop]);

  useEffect(()=>{stateRef.current.ghostY=GY-GH;rafRef.current=requestAnimationFrame(loop);return()=>cancelAnimationFrame(rafRef.current);},[loop]);
  return { score, gameOver, started, jump };
}

/* ═══════════════════════════════════════════════════════
   Landing Page
   ═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  const nav = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { score, gameOver, started, jump } = useGame(canvasRef);
  const [showGame, setShowGame] = useState(false);
  const [featRef, featVis] = useReveal<HTMLDivElement>();
  const [howRef, howVis] = useReveal<HTMLDivElement>();
  const [demoRef, demoVis] = useReveal<HTMLDivElement>();
  const [ctaRef, ctaVis] = useReveal<HTMLDivElement>();
  const [useCaseRef, useCaseVis] = useReveal<HTMLDivElement>();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.key === "g" || e.key === "G") && !showGame) setShowGame(true);
      if (e.code === "Space" && showGame) { e.preventDefault(); jump(); }
      if (e.key === "Escape" && showGame) setShowGame(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [jump, showGame]);

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-[#ececef] overflow-x-hidden">

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 nav-glass">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ghost size={22} id="navG" />
            <span className="text-[14px] font-semibold tracking-tight">Superboo</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-[13px] text-[#8f8f9c] hover:text-white transition-colors hidden md:block">Features</a>
            <a href="#how" className="text-[13px] text-[#8f8f9c] hover:text-white transition-colors hidden md:block">How it works</a>
            <button onClick={() => nav("/chat")}
              className="text-[13px] px-4 py-1.5 rounded-lg bg-[#7c5cff] hover:bg-[#9379ff] text-white font-medium transition-all">
              Open Chat
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 md:px-8">
        {/* Animated mesh */}
        <div className="hero-mesh" aria-hidden="true"/>
        <div className="hero-mesh-2" aria-hidden="true"/>
        {/* Noise */}
        <div className="noise" aria-hidden="true"/>
        {/* Stars */}
        <div className="stars" aria-hidden="true">
          {Array.from({length: 40}).map((_,i) => (
            <div key={i} className="star" style={{
              left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
              animationDelay: `${Math.random()*4}s`, animationDuration: `${2+Math.random()*3}s`,
              width: `${1+Math.random()*2}px`, height: `${1+Math.random()*2}px`,
            }}/>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
          <div className="ghost-float mb-10">
            <Ghost size={100} id="heroG" />
          </div>
          <h1 className="text-[48px] sm:text-[64px] md:text-[80px] font-[200] leading-[0.95] tracking-[-0.04em] mb-6">
            <span className="grad-text">Super</span>boo
          </h1>
          <p className="text-[18px] md:text-[22px] text-[#ececef] leading-relaxed max-w-md mb-3 font-medium">
            Tell Boo what you need. Get it done.
          </p>
          <p className="text-[14px] md:text-[16px] text-[#8f8f9c] leading-relaxed max-w-md mb-10">
            TikToks, decks, posters, resumes &mdash; just describe it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => nav("/chat")}
              className="group px-8 py-4 rounded-2xl bg-[#7c5cff] hover:bg-[#9379ff] text-white text-[14px] font-medium transition-all cta-glow-btn">
              Start creating
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
            </button>
            <a href="#use-cases"
              className="px-8 py-4 rounded-2xl border border-[#222] hover:border-[#7c5cff]/50 text-[#8f8f9c] hover:text-white text-[14px] font-medium transition-all text-center">
              See what Boo can make
            </a>
          </div>
        </div>

        {/* Scroll pill */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-5 h-8 rounded-full border border-[#333] flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-[#7c5cff] scroll-dot-anim"/>
          </div>
        </div>
      </section>

      {/* ─── Use Case Tiles ─── */}
      <section id="use-cases" className="py-16 md:py-20 px-5 md:px-8">
        <div ref={useCaseRef} className={`max-w-3xl mx-auto reveal ${useCaseVis ? "revealed" : ""}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {USE_CASES.map((uc) => (
              <button
                key={uc.label}
                onClick={() => nav("/chat")}
                className="use-case-tile group flex flex-col items-center justify-center gap-2 py-5 px-3 rounded-2xl border border-[#1a1a22] bg-[#0e0e13] transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                style={{ ["--uc-color" as string]: uc.color }}
              >
                <span className="text-2xl">{uc.emoji}</span>
                <span className="text-[13px] text-[#8f8f9c] group-hover:text-white transition-colors font-medium">{uc.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="border-y border-[#1a1a22] bg-[#0c0c10]">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-[28px] md:text-[32px] font-[200] tracking-tight grad-text">{s.value}</div>
              <div className="text-[12px] text-[#5a5a67] uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-28 md:py-36 px-5 md:px-8">
        <div ref={featRef} className={`max-w-5xl mx-auto reveal ${featVis ? "revealed" : ""}`}>
          <div className="text-center mb-16 md:mb-20">
            <span className="text-[11px] text-[#7c5cff] uppercase tracking-[0.2em] font-medium">Capabilities</span>
            <h2 className="text-[32px] md:text-[44px] font-[200] tracking-[-0.03em] mt-3 mb-4">
              One AI. <span className="grad-text">Endless creations.</span>
            </h2>
            <p className="text-[#5a5a67] text-[15px] max-w-md mx-auto leading-relaxed">
              Describe what you want. Boo picks the right tools and creates it for you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const IconComp = f.icon;
              return (
                <div key={i} className="feat-card group p-6 rounded-2xl border border-[#1a1a22] bg-[#0e0e13] hover:border-[#7c5cff]/40 transition-all duration-500">
                  <div className="w-10 h-10 rounded-xl bg-[#7c5cff]/10 border border-[#7c5cff]/20 flex items-center justify-center mb-4 group-hover:bg-[#7c5cff]/20 transition-colors">
                    <IconComp size={18} className="text-[#7c5cff]" />
                  </div>
                  <h3 className="text-[15px] font-medium mb-2 text-white">{f.title}</h3>
                  <p className="text-[13px] text-[#6a6a78] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Live Demo ─── */}
      <section className="py-28 md:py-36 px-5 md:px-8 relative">
        <div className="demo-glow" aria-hidden="true"/>
        <div ref={demoRef} className={`max-w-5xl mx-auto reveal ${demoVis ? "revealed" : ""}`}>
          <div className="text-center mb-14">
            <span className="text-[11px] text-[#7c5cff] uppercase tracking-[0.2em] font-medium">See it in action</span>
            <h2 className="text-[32px] md:text-[44px] font-[200] tracking-[-0.03em] mt-3 mb-4">
              It works like <span className="grad-text">magic</span>
            </h2>
            <p className="text-[#5a5a67] text-[15px] max-w-md mx-auto">
              One message. A polished creation. No design skills needed.
            </p>
          </div>
          {demoVis && <ChatPreview />}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how" className="py-28 md:py-36 px-5 md:px-8">
        <div ref={howRef} className={`max-w-4xl mx-auto reveal ${howVis ? "revealed" : ""}`}>
          <div className="text-center mb-16 md:mb-20">
            <span className="text-[11px] text-[#7c5cff] uppercase tracking-[0.2em] font-medium">Process</span>
            <h2 className="text-[32px] md:text-[44px] font-[200] tracking-[-0.03em] mt-3">
              Three steps. <span className="grad-text">Zero friction.</span>
            </h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#7c5cff]/30 to-transparent hidden md:block"/>
            {[
              { n:"01", t:"Tell Boo what you need", d:"Describe what you want in plain language. A TikTok, a resume, a poster — anything." },
              { n:"02", t:"Boo creates it for you", d:"Boo picks the right tools and creates exactly what you described." },
              { n:"03", t:"Download & share", d:"Get your creation instantly. Download, share, or post it directly." },
            ].map((s, i) => (
              <div key={i} className={`flex items-start gap-6 md:gap-10 mb-12 last:mb-0 ${i%2===1 ? "md:flex-row-reverse md:text-right" : ""}`}>
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#7c5cff]/10 border border-[#7c5cff]/20 flex items-center justify-center">
                  <span className="text-[#7c5cff] text-sm font-mono font-medium">{s.n}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-medium text-white mb-2">{s.t}</h3>
                  <p className="text-[14px] text-[#6a6a78] leading-relaxed max-w-sm">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Skills Marquee ─── */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="text-center mb-12 px-5">
          <h2 className="text-[28px] md:text-[36px] font-[200] tracking-[-0.03em]">
            <span className="grad-text">20+ creations</span> and growing
          </h2>
        </div>
        <div className="space-y-3">
          <div className="marquee-row">
            <div className="marquee-track-left">
              {[...SKILLS_ROW1,...SKILLS_ROW1,...SKILLS_ROW1].map((s,i) => (
                <span key={i} className="skill-pill">{s}</span>
              ))}
            </div>
          </div>
          <div className="marquee-row">
            <div className="marquee-track-right">
              {[...SKILLS_ROW2,...SKILLS_ROW2,...SKILLS_ROW2].map((s,i) => (
                <span key={i} className="skill-pill">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-28 md:py-40 px-5 md:px-8 relative">
        <div className="cta-mesh" aria-hidden="true"/>
        <div ref={ctaRef} className={`relative z-10 flex flex-col items-center text-center reveal ${ctaVis ? "revealed" : ""}`}>
          <div className="ghost-float mb-8">
            <Ghost size={80} id="ctaG" />
          </div>
          <h2 className="text-[36px] md:text-[52px] font-[200] tracking-[-0.03em] mb-4 leading-tight">
            What will you<br/><span className="grad-text">create today</span>?
          </h2>
          <p className="text-[#5a5a67] text-[15px] max-w-sm mb-10">
            Start a conversation. Boo handles the rest.
          </p>
          <button onClick={() => nav("/chat")}
            className="group px-10 py-4 rounded-2xl bg-[#7c5cff] hover:bg-[#9379ff] text-white text-[15px] font-medium transition-all cta-glow-btn">
            Start creating
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#141418] py-8">
        <div className="max-w-5xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Ghost size={16} id="footG"/>
            <span className="text-[12px] text-[#5a5a67]">Superboo &copy; 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => nav("/chat")} className="text-[12px] text-[#5a5a67] hover:text-[#8f8f9c] transition-colors bg-transparent border-none cursor-pointer">Chat</button>
            <a href="#features" className="text-[12px] text-[#5a5a67] hover:text-[#8f8f9c] transition-colors">Features</a>
            <a href="#how" className="text-[12px] text-[#5a5a67] hover:text-[#8f8f9c] transition-colors">How it works</a>
          </div>
        </div>
      </footer>

      {/* ─── Game Modal ─── */}
      {showGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85" style={{backdropFilter:"blur(12px)"}}>
          <div className="bg-[#111116] border border-[#1e1e26] rounded-2xl p-6 max-w-[640px] w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#5a5a67] uppercase tracking-wider font-mono">Ghost Runner</span>
                {started && <span className="text-xs font-mono text-[#7c5cff]">Score: {score}</span>}
                {gameOver && <span className="text-xs text-red-400">Game Over</span>}
              </div>
              <button onClick={()=>setShowGame(false)} className="text-[#5a5a67] hover:text-white text-sm transition-colors bg-transparent border-none cursor-pointer">ESC</button>
            </div>
            <canvas ref={canvasRef} width={600} height={200} onClick={jump} className="rounded-xl border border-[#1e1e26] cursor-pointer w-full" style={{background:"#0a0a0e"}}/>
            <p className="text-[11px] text-[#5a5a67] mt-3 text-center">SPACE or tap to jump</p>
          </div>
        </div>
      )}

      {/* ─── Styles ─── */}
      <style>{`
        /* Typography */
        .grad-text {
          background: linear-gradient(135deg, #C084FC 0%, #7c5cff 50%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Nav */
        .nav-glass {
          background: rgba(10,10,14,0.6);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        /* Hero backgrounds */
        .hero-mesh {
          position: absolute; top: 20%; left: 50%; width: 800px; height: 800px;
          transform: translate(-50%,-50%);
          background: radial-gradient(ellipse, rgba(124,92,255,0.12) 0%, rgba(192,132,252,0.06) 30%, transparent 65%);
          filter: blur(100px); pointer-events: none;
          animation: meshDrift 12s ease-in-out infinite;
        }
        .hero-mesh-2 {
          position: absolute; top: 60%; left: 30%; width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(109,40,217,0.1) 0%, transparent 60%);
          filter: blur(80px); pointer-events: none;
          animation: meshDrift 15s ease-in-out infinite reverse;
        }
        @keyframes meshDrift {
          0%,100% { transform: translate(-50%,-50%) scale(1) rotate(0deg); }
          33% { transform: translate(-45%,-55%) scale(1.05) rotate(2deg); }
          66% { transform: translate(-55%,-45%) scale(0.95) rotate(-2deg); }
        }

        /* Noise overlay */
        .noise {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 128px;
        }

        /* Stars */
        .stars { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .star {
          position: absolute; border-radius: 50%; background: white;
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%,100% { opacity: 0.1; } 50% { opacity: 0.6; }
        }

        /* Float */
        @keyframes ghost-float {
          0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); }
        }
        .ghost-float { animation: ghost-float 4s ease-in-out infinite; }

        /* Scroll dot */
        @keyframes scrollDot {
          0%,100% { opacity: 0; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(5px); }
        }
        .scroll-dot-anim { animation: scrollDot 2.5s ease-in-out infinite; }

        /* CTA button glow */
        .cta-glow-btn {
          box-shadow: 0 0 30px -5px rgba(124,92,255,0.4), 0 0 80px -20px rgba(124,92,255,0.2);
        }
        .cta-glow-btn:hover {
          box-shadow: 0 0 40px -5px rgba(124,92,255,0.5), 0 0 100px -20px rgba(124,92,255,0.3);
        }

        /* Scroll reveal */
        .reveal {
          opacity: 0; transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .revealed { opacity: 1; transform: translateY(0); }

        /* Feature cards */
        .feat-card { position: relative; overflow: hidden; }
        .feat-card::before {
          content: ''; position: absolute; inset: 0; border-radius: inherit;
          background: radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(124,92,255,0.06), transparent 60%);
          opacity: 0; transition: opacity 0.5s;
        }
        .feat-card:hover::before { opacity: 1; }

        /* Use case tiles */
        .use-case-tile:hover {
          border-color: var(--uc-color, #7c5cff);
          box-shadow: 0 0 20px -8px var(--uc-color, #7c5cff);
        }

        /* Demo glow */
        .demo-glow {
          position: absolute; top: 50%; left: 50%; width: 600px; height: 400px;
          transform: translate(-50%,-50%);
          background: radial-gradient(ellipse, rgba(124,92,255,0.08) 0%, transparent 60%);
          filter: blur(60px); pointer-events: none;
        }

        /* CTA mesh */
        .cta-mesh {
          position: absolute; top: 50%; left: 50%; width: 500px; height: 500px;
          transform: translate(-50%,-50%);
          background: radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 60%);
          filter: blur(80px); pointer-events: none;
        }

        /* Marquee */
        .marquee-row { overflow: hidden; }
        .marquee-track-left, .marquee-track-right {
          display: flex; gap: 12px; width: max-content;
        }
        .marquee-track-left { animation: marqueeL 50s linear infinite; }
        .marquee-track-right { animation: marqueeR 45s linear infinite; }
        .marquee-row:hover .marquee-track-left,
        .marquee-row:hover .marquee-track-right { animation-play-state: paused; }
        @keyframes marqueeL { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        @keyframes marqueeR { 0%{transform:translateX(-33.33%)} 100%{transform:translateX(0)} }
        .skill-pill {
          display: inline-flex; align-items: center; padding: 10px 20px;
          border-radius: 12px; border: 1px solid #1a1a22; background: #0e0e13;
          font-size: 13px; color: #8f8f9c; white-space: nowrap; flex-shrink: 0;
          transition: border-color 0.3s, color 0.3s;
        }
        .skill-pill:hover { border-color: rgba(124,92,255,0.4); color: #ececef; }

        /* Chat preview */
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
