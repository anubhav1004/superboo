import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video, PenTool, FileText, Film,
  Play, BookOpen, Dumbbell, Sparkles, Music, MessageCircle,
} from "lucide-react";
import DynamicBoo from "./DynamicBoo";

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
   Chat Preview (floating glass card)
   ═══════════════════════════════════════════════════════ */
function ChatPreview() {
  const lines = [
    { role: "user", text: "Make me a pitch deck for my AI fitness app" },
    { role: "bot", text: "On it! Creating your pitch deck..." },
    { role: "bot", text: "Designing visuals and charts..." },
    { role: "bot", text: "Your 10-slide pitch deck is ready!" },
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= lines.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 800 : 1200);
    return () => clearTimeout(t);
  }, [shown, lines.length]);

  return (
    <div className="chat-preview-card">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"/>
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"/>
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]"/>
        </div>
        <span className="text-[11px] text-white/40 ml-2 font-mono">superboo.me/chat</span>
      </div>
      <div className="px-4 py-4 space-y-3 min-h-[160px]">
        {lines.slice(0, shown).map((l, i) => (
          <div key={i} className="flex gap-2.5" style={{ animation: "chatFadeIn 0.4s ease-out" }}>
            <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-[9px] ${
              l.role === "user" ? "bg-white/10 text-white/60" : "bg-gradient-to-br from-[#9370ff] to-[#EC4899] text-white"
            }`}>
              {l.role === "user" ? "Y" : "S"}
            </div>
            <div className={`text-[12px] leading-relaxed ${l.role === "user" ? "text-white/90" : "text-white/60"}`}>
              {l.text}
            </div>
          </div>
        ))}
        {shown < lines.length && (
          <div className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#9370ff] to-[#EC4899] flex-shrink-0 mt-0.5"/>
            <div className="flex gap-1 pt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] animate-bounce" style={{animationDelay:"0ms"}}/>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] animate-bounce" style={{animationDelay:"150ms"}}/>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] animate-bounce" style={{animationDelay:"300ms"}}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   How It Works — animated step carousel
   ═══════════════════════════════════════════════════════ */
function HowItWorks() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "You type", desc: "Tell Boo what you need in plain words", icon: MessageCircle },
    { label: "Boo works", desc: "The ghost picks tools and creates it", icon: Sparkles },
    { label: "You get it", desc: "Download your polished creation instantly", icon: Film },
  ];

  useEffect(() => {
    const timer = setInterval(() => setStep(s => (s + 1) % 3), 3000);
    return () => clearInterval(timer);
  }, []);

  const StepIcon = steps[step].icon;

  return (
    <div className="flex flex-col items-center">
      <div className="how-step-visual">
        {step === 1 && <div className="ghost-float"><Ghost size={80} id="howGhost" /></div>}
        {step === 0 && (
          <div className="how-typing-mock">
            <div className="how-typing-cursor"/>
            <span className="text-white/70 text-sm">Make me a TikTok about...</span>
          </div>
        )}
        {step === 2 && (
          <div className="how-result-mock">
            <Play size={32} className="text-white/80" />
            <span className="text-white/60 text-xs mt-2">pitch_deck.pdf</span>
          </div>
        )}
        {step !== 0 && step !== 1 && step !== 2 && <StepIcon size={48} className="text-white/60" />}
      </div>

      <h3 className="text-2xl font-bold text-white mt-8 mb-2">{steps[step].label}</h3>
      <p className="text-white/50 text-sm">{steps[step].desc}</p>

      {/* Progress bar */}
      <div className="flex gap-2 mt-8">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} className="how-progress-segment" style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
            <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${i === step ? "how-progress-fill" : i < step ? "bg-white/30 w-full" : ""}`}
                style={{ width: i === step ? "100%" : i < step ? "100%" : "0%" }}/>
            </div>
            <span className={`text-[10px] mt-1 block text-center transition-colors ${i === step ? "text-white/80" : "text-white/30"}`}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════ */
const USE_CASES = [
  { emoji: "\uD83C\uDFAC", label: "Create a TikTok", bg: "linear-gradient(135deg, #EC4899, #F472B6)" },
  { emoji: "\uD83D\uDCCA", label: "Make a pitch deck", bg: "linear-gradient(135deg, #8B5CF6, #A78BFA)" },
  { emoji: "\uD83D\uDCDD", label: "Write my resume", bg: "linear-gradient(135deg, #22C55E, #4ADE80)" },
  { emoji: "\uD83D\uDCAA", label: "Workout plan", bg: "linear-gradient(135deg, #F43F5E, #FB7185)" },
  { emoji: "\uD83D\uDCDA", label: "Study guide", bg: "linear-gradient(135deg, #06B6D4, #22D3EE)" },
  { emoji: "\uD83C\uDFB5", label: "Write a song", bg: "linear-gradient(135deg, #F97316, #FB923C)" },
  { emoji: "\uD83D\uDCC8", label: "Interview prep", bg: "linear-gradient(135deg, #EAB308, #FACC15)" },
  { emoji: "\u2709\uFE0F", label: "Draft an email", bg: "linear-gradient(135deg, #3B82F6, #60A5FA)" },
  { emoji: "\uD83C\uDFA8", label: "Design a poster", bg: "linear-gradient(135deg, #F43F5E, #EC4899)" },
  { emoji: "\uD83D\uDE02", label: "Generate memes", bg: "linear-gradient(135deg, #22C55E, #06B6D4)" },
  { emoji: "\uD83D\uDC98", label: "Dating profile", bg: "linear-gradient(135deg, #EC4899, #8B5CF6)" },
  { emoji: "\uD83C\uDF73", label: "Meal planner", bg: "linear-gradient(135deg, #F97316, #EAB308)" },
];

const BENTO_ITEMS = [
  { title: "Content Creation", desc: "TikToks, thumbnails, captions, scripts", span: "col-span-2", color: "#EC4899", icon: Video, accent: "from-[#EC4899]/20 to-[#F472B6]/10", mockType: "tiktok" as const },
  { title: "Writing & Docs", desc: "Resumes, decks, cover letters", span: "col-span-1", color: "#3B82F6", icon: FileText, accent: "from-[#3B82F6]/20 to-[#60A5FA]/10", mockType: "resume" as const },
  { title: "Design", desc: "Posters, logos, memes", span: "col-span-1", color: "#8B5CF6", icon: PenTool, accent: "from-[#8B5CF6]/20 to-[#A78BFA]/10", mockType: "design" as const },
  { title: "Learning", desc: "Study guides, homework help", span: "col-span-1", color: "#06B6D4", icon: BookOpen, accent: "from-[#06B6D4]/20 to-[#22D3EE]/10", mockType: "learning" as const },
  { title: "Lifestyle", desc: "Meal plans, workouts, travel", span: "col-span-1", color: "#22C55E", icon: Dumbbell, accent: "from-[#22C55E]/20 to-[#4ADE80]/10", mockType: "lifestyle" as const },
  { title: "Fun & Creative", desc: "Music, stories, trivia, jokes", span: "col-span-2", color: "#F97316", icon: Music, accent: "from-[#F97316]/20 to-[#FB923C]/10", mockType: "fun" as const },
];

const TESTIMONIALS = [
  { quote: "Made my entire pitch deck in 2 minutes", handle: "@startup_kid", color: "#EC4899" },
  { quote: "My dating profile finally gets matches", handle: "@lonely_coder", color: "#8B5CF6" },
  { quote: "Study guides saved my GPA", handle: "@college_life", color: "#06B6D4" },
  { quote: "Best meal planner I've ever used", handle: "@fitfoodie", color: "#22C55E" },
  { quote: "TikTok thumbnails in 30 seconds flat", handle: "@creator_vibes", color: "#F97316" },
  { quote: "Wrote my resignation letter beautifully", handle: "@corporate_escape", color: "#F43F5E" },
];

const SKILL_BUBBLES = [
  { name: "TikTok Videos", size: "lg", color: "#EC4899", desc: "Create scroll-stopping short videos" },
  { name: "Pitch Decks", size: "lg", color: "#8B5CF6", desc: "Investor-ready presentations" },
  { name: "Resumes", size: "lg", color: "#3B82F6", desc: "Land your dream job" },
  { name: "Study Guides", size: "md", color: "#06B6D4", desc: "Ace every exam" },
  { name: "Meal Plans", size: "md", color: "#22C55E", desc: "Eat better, feel better" },
  { name: "Posters", size: "md", color: "#F97316", desc: "Eye-catching designs" },
  { name: "Cover Letters", size: "sm", color: "#EAB308", desc: "Stand out from the pile" },
  { name: "Memes", size: "lg", color: "#F43F5E", desc: "Peak internet humor" },
  { name: "Dating Profiles", size: "md", color: "#EC4899", desc: "Swipe right material" },
  { name: "Workout Plans", size: "md", color: "#22C55E", desc: "Get fit your way" },
  { name: "Social Posts", size: "sm", color: "#3B82F6", desc: "Content that pops" },
  { name: "Logos", size: "sm", color: "#8B5CF6", desc: "Brand identity in seconds" },
  { name: "Voiceovers", size: "md", color: "#F97316", desc: "Professional audio" },
  { name: "Travel Plans", size: "sm", color: "#06B6D4", desc: "Plan the perfect trip" },
  { name: "Interview Prep", size: "lg", color: "#EAB308", desc: "Nail every question" },
  { name: "Budget Plans", size: "sm", color: "#22C55E", desc: "Money management" },
  { name: "Song Lyrics", size: "md", color: "#EC4899", desc: "Write your next hit" },
  { name: "Market Research", size: "sm", color: "#3B82F6", desc: "Know your market" },
  { name: "LinkedIn Bio", size: "sm", color: "#8B5CF6", desc: "Professional presence" },
  { name: "Trivia Games", size: "md", color: "#F43F5E", desc: "Fun for everyone" },
  { name: "Video Editing", size: "lg", color: "#F97316", desc: "Clips that captivate" },
  { name: "Email Drafts", size: "sm", color: "#06B6D4", desc: "Perfect every send" },
  { name: "Book Summaries", size: "sm", color: "#EAB308", desc: "Key insights fast" },
  { name: "Business Plans", size: "md", color: "#22C55E", desc: "Launch with confidence" },
  { name: "Thumbnails", size: "md", color: "#EC4899", desc: "Click-worthy images" },
  { name: "Gift Ideas", size: "sm", color: "#F43F5E", desc: "Thoughtful surprises" },
  { name: "Captions", size: "sm", color: "#3B82F6", desc: "Words that hook" },
  { name: "Stories", size: "md", color: "#8B5CF6", desc: "Creative narratives" },
  { name: "Jokes", size: "sm", color: "#F97316", desc: "Guaranteed laughs" },
  { name: "Recipes", size: "sm", color: "#22C55E", desc: "Cook something new" },
  { name: "Flashcards", size: "md", color: "#06B6D4", desc: "Study smarter" },
  { name: "Presentations", size: "md", color: "#EAB308", desc: "Wow any audience" },
  { name: "Image Editing", size: "sm", color: "#EC4899", desc: "Polish every photo" },
  { name: "Scripts", size: "sm", color: "#F43F5E", desc: "Words for any scene" },
  { name: "Newsletters", size: "sm", color: "#3B82F6", desc: "Engage your audience" },
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
  const [bentoRef, bentoVis] = useReveal<HTMLDivElement>();
  const [howRef, howVis] = useReveal<HTMLDivElement>();
  const [testRef, testVis] = useReveal<HTMLDivElement>();
  const [skillsRef, skillsVis] = useReveal<HTMLDivElement>();
  const [ctaRef, ctaVis] = useReveal<HTMLDivElement>();
  const [ctaHover, setCtaHover] = useState(false);

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
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "#0c0118" }}>

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 nav-glass">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ghost size={22} id="navG" />
            <span className="text-[14px] font-bold tracking-tight">Superboo</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#section-features" className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">Features</a>
            <a href="/agent" className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">24x7 Agent</a>
            <a href="/pricing" className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">Pricing</a>
            <a href="/download" className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">Download</a>

            <button onClick={() => nav("/login")}
              className="text-[13px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#9370ff] to-[#EC4899] hover:opacity-90 text-white font-semibold transition-all shadow-lg shadow-purple-500/25">
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
         1. HERO
         ═══════════════════════════════════════════════════════ */}
      <section id="section-hero" className="relative min-h-screen flex flex-col items-center justify-center px-5 md:px-8">
        {/* Animated mesh gradient */}
        <div className="hero-mesh-1" aria-hidden="true"/>
        <div className="hero-mesh-2" aria-hidden="true"/>
        <div className="hero-mesh-3" aria-hidden="true"/>

        {/* Sparkle particles */}
        <div className="sparkles" aria-hidden="true">
          {Array.from({length: 30}).map((_,i) => (
            <div key={i} className="sparkle" style={{
              left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
              animationDelay: `${Math.random()*5}s`,
              animationDuration: `${3+Math.random()*4}s`,
              width: `${1.5+Math.random()*2.5}px`, height: `${1.5+Math.random()*2.5}px`,
              opacity: 0.2 + Math.random() * 0.5,
            }}/>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl">
          {/* Ghost with glow halo */}
          <div className="ghost-float mb-8 relative">
            <div className="ghost-halo" aria-hidden="true"/>
            <Ghost size={140} id="heroG" />
          </div>

          <h1 className="text-[48px] sm:text-[64px] md:text-[80px] font-extrabold leading-[0.95] tracking-[-0.04em] mb-6">
            <span className="hero-gradient-text">Superboo</span>
          </h1>
          <p className="text-[20px] md:text-[26px] text-white/90 leading-relaxed max-w-lg mb-3 font-semibold">
            Your AI that actually does stuff.
          </p>
          <p className="text-[15px] md:text-[17px] text-white/50 leading-relaxed max-w-md mb-10">
            TikToks, pitch decks, resumes, posters, meal plans &mdash; just tell Boo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <button onClick={() => nav("/login")}
              className="group hero-cta-primary px-8 py-3.5 rounded-xl text-white text-[15px] font-bold transition-all">
              Try it free
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
            </button>
            <a href="#section-features"
              className="hero-cta-secondary px-8 py-3.5 rounded-xl text-white/70 hover:text-white text-[15px] font-semibold transition-all text-center flex items-center justify-center">
              Watch it work
            </a>
          </div>
          <p className="text-[12px] text-white/30 mt-3">No credit card required</p>
        </div>

        {/* Floating chat preview card */}
        <div className="hidden lg:block absolute right-[5%] top-[55%] -translate-y-1/2 z-10 chat-float-card">
          <ChatPreview />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-[#EC4899] scroll-dot-anim"/>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         2. USE CASE STRIP (marquee)
         ═══════════════════════════════════════════════════════ */}
      <section id="section-usecases" className="py-4 overflow-hidden relative">
        <div className="use-case-marquee">
          <div className="use-case-track">
            {[...USE_CASES, ...USE_CASES, ...USE_CASES].map((uc, i) => (
              <button key={i} onClick={() => nav("/login")} className="use-case-card group"
                style={{ background: uc.bg }}>
                <span className="text-3xl">{uc.emoji}</span>
                <span className="text-[14px] font-bold text-white drop-shadow-sm">{uc.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         3. BENTO GRID
         ═══════════════════════════════════════════════════════ */}
      <section id="section-features" className="py-24 md:py-36 px-5 md:px-8">
        <div ref={bentoRef} className={`max-w-5xl mx-auto reveal ${bentoVis ? "revealed" : ""}`}>
          <div className="text-center mb-16">
            <h2 className="text-[36px] md:text-[52px] font-extrabold tracking-[-0.03em] mb-4">
              One Boo. <span className="hero-gradient-text">Infinite possibilities.</span>
            </h2>
            <p className="text-white/40 text-[16px] max-w-md mx-auto">
              Describe what you want. Boo picks the right tools and creates it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[180px] md:auto-rows-[200px]">
            {BENTO_ITEMS.map((item, i) => {
              const IconComp = item.icon;
              return (
                <div key={i} className={`bento-card group ${item.span} relative rounded-3xl overflow-hidden cursor-pointer`}
                  style={{ ["--bento-color" as string]: item.color }}>
                  {/* Glass overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} backdrop-blur-sm`}/>
                  <div className="absolute inset-0 bento-glass"/>
                  {/* Content */}
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: `${item.color}30`, border: `1px solid ${item.color}40` }}>
                        <IconComp size={22} style={{ color: item.color }}/>
                      </div>
                      <h3 className="text-[18px] font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-[13px] text-white/50">{item.desc}</p>
                    </div>
                    {/* Mock visuals for big cards */}
                    {item.mockType === "tiktok" && (
                      <div className="absolute right-6 bottom-6 w-16 h-28 rounded-xl border-2 border-white/20 flex items-center justify-center bg-black/30">
                        <Play size={20} className="text-white/60"/>
                      </div>
                    )}
                    {item.mockType === "fun" && (
                      <div className="absolute right-6 bottom-6 flex gap-2">
                        {["\uD83C\uDFB5", "\uD83C\uDFAD", "\uD83D\uDE02", "\u2728"].map((e, j) => (
                          <span key={j} className="text-2xl opacity-40">{e}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         4. HOW IT WORKS
         ═══════════════════════════════════════════════════════ */}
      <section id="section-how" className="py-24 md:py-36 px-5 md:px-8 relative">
        <div className="how-bg" aria-hidden="true"/>
        <div ref={howRef} className={`max-w-3xl mx-auto reveal ${howVis ? "revealed" : ""} relative z-10`}>
          <div className="text-center mb-16">
            <h2 className="text-[36px] md:text-[52px] font-extrabold tracking-[-0.03em] mb-4">
              It&apos;s <span className="hero-gradient-text">stupidly</span> simple.
            </h2>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         5. TESTIMONIALS
         ═══════════════════════════════════════════════════════ */}
      <section id="section-testimonials" className="py-20 md:py-28 overflow-hidden">
        <div ref={testRef} className={`reveal ${testVis ? "revealed" : ""}`}>
          <div className="text-center mb-12 px-5">
            <h2 className="text-[28px] md:text-[40px] font-extrabold tracking-[-0.03em]">
              Loved by <span className="hero-gradient-text">creators, students, and hustlers</span>
            </h2>
          </div>
          <div className="testimonial-marquee">
            <div className="testimonial-track">
              {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <div key={i} className="testimonial-card" style={{ ["--t-color" as string]: t.color }}>
                  <div className="w-10 h-10 rounded-full mb-3" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}/>
                  <p className="text-[14px] text-white/80 font-medium mb-2">&ldquo;{t.quote}&rdquo;</p>
                  <span className="text-[12px] font-mono" style={{ color: t.color }}>{t.handle}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         6. SKILLS EXPLOSION
         ═══════════════════════════════════════════════════════ */}
      <section id="section-skills" className="py-24 md:py-36 px-5 md:px-8 relative overflow-hidden">
        <div className="skills-bg" aria-hidden="true"/>
        <div ref={skillsRef} className={`max-w-5xl mx-auto reveal ${skillsVis ? "revealed" : ""} relative z-10`}>
          <div className="text-center mb-16">
            <h2 className="text-[36px] md:text-[52px] font-extrabold tracking-[-0.03em] mb-4">
              35+ skills. <span className="hero-gradient-text">One ghost.</span>
            </h2>
          </div>
          <div className="skills-cloud">
            {SKILL_BUBBLES.map((skill, i) => (
              <div key={i}
                className={`skill-bubble skill-bubble-${skill.size}`}
                style={{
                  ["--bubble-color" as string]: skill.color,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${8 + (i % 5) * 2}s`,
                }}
                title={skill.desc}
              >
                {skill.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         DOWNLOAD MAC APP
         ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl overflow-hidden relative" style={{background: "linear-gradient(135deg, rgba(147,112,255,0.15), rgba(236,72,153,0.1))", border: "1px solid rgba(147,112,255,0.2)"}}>
            <div className="absolute inset-0 opacity-20" style={{background: "radial-gradient(circle at 30% 50%, rgba(147,112,255,0.3), transparent 60%)", filter: "blur(40px)"}} />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💻</span>
                  <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">macOS App</span>
                </div>
                <h3 className="text-[28px] md:text-[36px] font-extrabold text-white tracking-tight mb-3">
                  Superboo on your <span className="hero-gradient-text">Mac</span>
                </h3>
                <p className="text-[15px] text-white/50 leading-relaxed mb-2">
                  Native desktop app with Guide Mode — Boo follows your cursor across every app, answers questions about your screen, and creates things while you work.
                </p>
                <p className="text-[13px] text-white/30 mb-6">
                  Requires macOS 14+ · Apple Silicon (M1-M4)
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://github.com/anubhav1004/superboo/releases/download/v0.1.1/Superboo-0.0.0-arm64.dmg"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-[15px] font-bold transition-all hover:scale-105 active:scale-95"
                    style={{background: "linear-gradient(135deg, #9370ff, #EC4899)", boxShadow: "0 0 30px -5px rgba(147,112,255,0.4)"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download for Mac
                  </a>
                  <a href="https://github.com/anubhav1004/superboo/releases/tag/v0.1.1"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white/60 text-[14px] font-semibold border border-white/10 hover:border-white/20 transition-all hover:text-white">
                    Release notes
                  </a>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="ghost-float">
                  <Ghost size={100} id="dlG" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         7. FINAL CTA
         ═══════════════════════════════════════════════════════ */}
      <section id="section-cta" className="py-28 md:py-40 px-5 md:px-8 relative min-h-[80vh] flex items-center justify-center">
        <div className="cta-mesh-1" aria-hidden="true"/>
        <div className="cta-mesh-2" aria-hidden="true"/>
        {ctaHover && (
          <div className="cta-confetti" aria-hidden="true">
            {Array.from({length: 20}).map((_,i) => (
              <div key={i} className="confetti-piece" style={{
                left: `${30+Math.random()*40}%`,
                animationDelay: `${Math.random()*0.5}s`,
                animationDuration: `${1+Math.random()*1}s`,
                background: ["#EC4899","#9370ff","#22C55E","#F97316","#06B6D4","#EAB308"][i%6],
              }}/>
            ))}
          </div>
        )}
        <div ref={ctaRef} className={`relative z-10 flex flex-col items-center text-center reveal ${ctaVis ? "revealed" : ""}`}>
          <div className="ghost-float mb-8 relative">
            <div className="ghost-rainbow-halo" aria-hidden="true"/>
            <Ghost size={120} id="ctaG" />
          </div>
          <h2 className="text-[40px] md:text-[64px] font-extrabold tracking-[-0.03em] mb-4 leading-tight">
            What will <span className="hero-gradient-text">YOU</span> create?
          </h2>
          <p className="text-white/40 text-[16px] max-w-sm mb-10">
            No signup required. No credit card. Just vibes.
          </p>
          <button onClick={() => nav("/login")}
            onMouseEnter={() => setCtaHover(true)}
            onMouseLeave={() => setCtaHover(false)}
            className="group hero-cta-primary px-12 py-5 rounded-xl text-white text-[18px] font-bold transition-all">
            Start creating &mdash; it&apos;s free
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         8. FOOTER
         ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Ghost size={16} id="footG"/>
            <span className="text-[12px] text-white/30">Superboo &copy; 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="/" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Home</a>
            <a href="/agent" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Agent</a>
            <a href="/pricing" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Pricing</a>
            <a href="/download" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Download</a>
            <button onClick={() => nav("/chat")} className="text-[12px] text-white/30 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer">Chat</button>
            <span className="text-[10px] text-white/15 hidden md:inline">Press G for a surprise</span>
          </div>
        </div>
      </footer>

      {/* ─── Game Modal ─── */}
      {showGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85" style={{backdropFilter:"blur(12px)"}}>
          <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 max-w-[640px] w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-white/40 uppercase tracking-wider font-mono">Ghost Runner</span>
                {started && <span className="text-xs font-mono text-[#9370ff]">Score: {score}</span>}
                {gameOver && <span className="text-xs text-red-400">Game Over</span>}
              </div>
              <button onClick={()=>setShowGame(false)} className="text-white/40 hover:text-white text-sm transition-colors bg-transparent border-none cursor-pointer">ESC</button>
            </div>
            <canvas ref={canvasRef} width={600} height={200} onClick={jump} className="rounded-xl border border-white/10 cursor-pointer w-full" style={{background:"#0a0a0e"}}/>
            <p className="text-[11px] text-white/30 mt-3 text-center">SPACE or tap to jump</p>
          </div>
        </div>
      )}

      {/* ─── Dynamic Boo ghost character ─── */}
      <DynamicBoo />

      {/* ═══════════════════════════════════════════════════════
         STYLES
         ═══════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Nav ── */
        .nav-glass {
          background: rgba(12,1,24,0.7);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        /* ── Hero gradient text ── */
        .hero-gradient-text {
          background: linear-gradient(135deg, #C084FC 0%, #EC4899 40%, #9370ff 70%, #60A5FA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Hero mesh backgrounds ── */
        .hero-mesh-1 {
          position: absolute; top: 10%; left: 30%; width: 900px; height: 900px;
          background: radial-gradient(ellipse, rgba(147,112,255,0.25) 0%, rgba(236,72,153,0.15) 30%, transparent 60%);
          filter: blur(120px); pointer-events: none;
          animation: meshFloat1 12s ease-in-out infinite;
        }
        .hero-mesh-2 {
          position: absolute; top: 50%; left: 60%; width: 700px; height: 700px;
          background: radial-gradient(ellipse, rgba(236,72,153,0.2) 0%, rgba(139,92,246,0.1) 40%, transparent 65%);
          filter: blur(100px); pointer-events: none;
          animation: meshFloat2 15s ease-in-out infinite;
        }
        .hero-mesh-3 {
          position: absolute; top: 70%; left: 20%; width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%);
          filter: blur(80px); pointer-events: none;
          animation: meshFloat3 18s ease-in-out infinite;
        }
        @keyframes meshFloat1 {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          33% { transform: translate(-45%,-55%) scale(1.08); }
          66% { transform: translate(-55%,-45%) scale(0.95); }
        }
        @keyframes meshFloat2 {
          0%,100% { transform: translate(-50%,-50%) scale(1) rotate(0deg); }
          50% { transform: translate(-55%,-48%) scale(1.1) rotate(3deg); }
        }
        @keyframes meshFloat3 {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          50% { transform: translate(-48%,-55%) scale(1.12); }
        }

        /* ── Sparkle particles ── */
        .sparkles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .sparkle {
          position: absolute; border-radius: 50%;
          background: white;
          animation: sparkleFloat linear infinite;
        }
        @keyframes sparkleFloat {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          25% { opacity: 1; transform: translateY(-20px) scale(1); }
          50% { opacity: 0.6; transform: translateY(-40px) scale(0.8); }
          75% { opacity: 1; transform: translateY(-60px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-80px) scale(0.5); }
        }

        /* ── Ghost glow halo ── */
        .ghost-halo {
          position: absolute; top: 50%; left: 50%;
          width: 220px; height: 220px;
          transform: translate(-50%,-50%);
          background: radial-gradient(circle, rgba(147,112,255,0.4) 0%, rgba(236,72,153,0.2) 40%, transparent 70%);
          filter: blur(40px);
          animation: haloPulse 3s ease-in-out infinite;
        }
        @keyframes haloPulse {
          0%,100% { opacity: 0.6; transform: translate(-50%,-50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%,-50%) scale(1.15); }
        }

        /* ── Ghost rainbow halo (CTA) ── */
        .ghost-rainbow-halo {
          position: absolute; top: 50%; left: 50%;
          width: 280px; height: 280px;
          transform: translate(-50%,-50%);
          background: conic-gradient(from 0deg, #EC4899, #9370ff, #3B82F6, #22C55E, #F97316, #EC4899);
          filter: blur(60px);
          opacity: 0.4;
          animation: rainbowSpin 8s linear infinite;
        }
        @keyframes rainbowSpin {
          to { transform: translate(-50%,-50%) rotate(360deg); }
        }

        /* ── Ghost float ── */
        @keyframes ghost-float {
          0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); }
        }
        .ghost-float { animation: ghost-float 4s ease-in-out infinite; }

        /* ── Scroll dot ── */
        @keyframes scrollDot {
          0%,100% { opacity: 0; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(5px); }
        }
        .scroll-dot-anim { animation: scrollDot 2.5s ease-in-out infinite; }

        /* ── Hero CTAs ── */
        .hero-cta-primary {
          background: linear-gradient(135deg, #9370ff, #EC4899);
          box-shadow: 0 0 40px -5px rgba(147,112,255,0.5), 0 0 80px -20px rgba(236,72,153,0.3);
        }
        .hero-cta-primary:hover {
          box-shadow: 0 0 60px -5px rgba(147,112,255,0.6), 0 0 120px -20px rgba(236,72,153,0.4);
          transform: translateY(-2px);
        }
        .hero-cta-secondary {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
        }
        .hero-cta-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
        }

        /* ── Chat preview floating card ── */
        .chat-preview-card {
          width: 320px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          overflow: hidden;
          box-shadow: 0 25px 60px -12px rgba(0,0,0,0.5);
        }
        .chat-float-card {
          transform: rotate(3deg);
          animation: chatCardFloat 6s ease-in-out infinite;
        }
        @keyframes chatCardFloat {
          0%,100% { transform: rotate(3deg) translateY(0); }
          50% { transform: rotate(2deg) translateY(-12px); }
        }
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Use Case Strip (marquee) ── */
        .use-case-marquee { overflow: hidden; padding: 8px 0; }
        .use-case-track {
          display: flex; gap: 16px; width: max-content;
          animation: useCaseScroll 60s linear infinite;
        }
        .use-case-marquee:hover .use-case-track { animation-play-state: paused; }
        @keyframes useCaseScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .use-case-card {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 28px; border-radius: 14px;
          border: none; cursor: pointer;
          white-space: nowrap; flex-shrink: 0;
          transition: transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 4px 20px -4px rgba(0,0,0,0.3);
        }
        .use-case-card:hover {
          transform: rotate(-2deg) scale(1.05);
          box-shadow: 0 8px 30px -4px rgba(0,0,0,0.4);
        }

        /* ── Bento Grid ── */
        .bento-card {
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s;
        }
        .bento-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px -12px var(--bento-color, rgba(147,112,255,0.3));
        }
        .bento-glass {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .bento-card:hover .bento-glass {
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
        }

        /* ── How It Works ── */
        .how-bg {
          position: absolute; top: 50%; left: 50%; width: 800px; height: 600px;
          transform: translate(-50%,-50%);
          background: radial-gradient(ellipse, rgba(12,1,24,0.9) 0%, rgba(12,1,24,1) 60%);
          pointer-events: none;
        }
        .how-step-visual {
          width: 200px; height: 200px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 32px;
          backdrop-filter: blur(12px);
        }
        .how-typing-mock {
          display: flex; align-items: center; gap: 4px;
          padding: 12px 16px; border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .how-typing-cursor {
          width: 2px; height: 16px; background: #EC4899;
          animation: cursorBlink 1s step-end infinite;
        }
        @keyframes cursorBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .how-result-mock {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .how-progress-fill {
          background: linear-gradient(90deg, #9370ff, #EC4899);
          animation: progressFill 3s linear;
        }
        @keyframes progressFill { from { width: 0; } to { width: 100%; } }

        /* ── Testimonials ── */
        .testimonial-marquee { overflow: hidden; padding: 8px 0; }
        .testimonial-track {
          display: flex; gap: 16px; width: max-content;
          animation: testScroll 45s linear infinite;
        }
        .testimonial-marquee:hover .testimonial-track { animation-play-state: paused; }
        @keyframes testScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .testimonial-card {
          padding: 24px; border-radius: 20px; min-width: 260px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          flex-shrink: 0;
          transition: border-color 0.3s, transform 0.3s;
        }
        .testimonial-card:hover {
          border-color: var(--t-color, rgba(255,255,255,0.2));
          transform: translateY(-4px);
        }

        /* ── Skills Cloud ── */
        .skills-bg {
          position: absolute; top: 50%; left: 50%; width: 900px; height: 600px;
          transform: translate(-50%,-50%);
          background: radial-gradient(ellipse, rgba(147,112,255,0.08) 0%, transparent 60%);
          filter: blur(80px); pointer-events: none;
        }
        .skills-cloud {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;
          max-width: 900px; margin: 0 auto;
        }
        .skill-bubble {
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 50px;
          font-weight: 600; white-space: nowrap;
          background: color-mix(in srgb, var(--bubble-color) 15%, transparent);
          border: 1px solid color-mix(in srgb, var(--bubble-color) 25%, transparent);
          color: var(--bubble-color);
          cursor: default;
          animation: bubbleDrift ease-in-out infinite;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .skill-bubble:hover {
          transform: scale(1.12);
          box-shadow: 0 0 20px -4px var(--bubble-color);
        }
        .skill-bubble-sm { padding: 8px 16px; font-size: 12px; }
        .skill-bubble-md { padding: 10px 22px; font-size: 13px; }
        .skill-bubble-lg { padding: 12px 28px; font-size: 15px; }
        @keyframes bubbleDrift {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* ── CTA Section ── */
        .cta-mesh-1 {
          position: absolute; top: 30%; left: 40%; width: 700px; height: 700px;
          background: radial-gradient(ellipse, rgba(147,112,255,0.2) 0%, transparent 60%);
          filter: blur(100px); pointer-events: none;
          animation: meshFloat1 10s ease-in-out infinite;
        }
        .cta-mesh-2 {
          position: absolute; top: 60%; left: 60%; width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 60%);
          filter: blur(80px); pointer-events: none;
          animation: meshFloat2 12s ease-in-out infinite;
        }

        /* ── Confetti ── */
        .cta-confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 5; }
        .confetti-piece {
          position: absolute; top: 40%;
          width: 8px; height: 8px; border-radius: 2px;
          animation: confettiFall 1.5s ease-out forwards;
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(-150px) rotate(720deg) scale(0); opacity: 0; }
        }

        /* ── Scroll reveal ── */
        .reveal {
          opacity: 0; transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .revealed { opacity: 1; transform: translateY(0); }

        html { scroll-behavior: smooth; }

        /* ── Mobile responsive ── */
        @media (max-width: 768px) {
          .skills-cloud { gap: 8px; }
          .skill-bubble-lg { padding: 8px 18px; font-size: 13px; }
          .skill-bubble-md { padding: 7px 14px; font-size: 12px; }
          .skill-bubble-sm { padding: 6px 12px; font-size: 11px; }
          .how-step-visual { width: 160px; height: 160px; }
          .dynamic-boo { display: none !important; }
        }

        /* ── Dynamic Boo ── */
        .dynamic-boo {
          animation: booBreathe 3s ease-in-out infinite;
          user-select: none;
          -webkit-user-select: none;
        }
        .dynamic-boo-hover {
          animation: booExcited 0.4s ease-in-out infinite;
        }
        .dynamic-boo-spin {
          animation: booSpin 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        @keyframes booBreathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes booExcited {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.08); }
        }
        @keyframes booSpin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }

        /* ── Speech bubble ── */
        .boo-speech-bubble {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(20, 10, 40, 0.92);
          border: 1px solid rgba(192, 132, 252, 0.3);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: white;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 14px;
          white-space: nowrap;
          pointer-events: none;
          animation: bubbleFadeIn 0.3s ease-out;
          box-shadow: 0 4px 20px -4px rgba(147, 112, 255, 0.3);
        }
        .boo-speech-pointer {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(20, 10, 40, 0.92);
        }
        @keyframes bubbleFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* ── Floating hearts ── */
        .boo-float-heart {
          position: absolute;
          bottom: 100%;
          font-size: 14px;
          pointer-events: none;
          animation: heartFloat 1.8s ease-out forwards;
        }
        @keyframes heartFloat {
          0% { opacity: 1; transform: translateY(0) scale(0.5); }
          100% { opacity: 0; transform: translateY(-50px) scale(1.2); }
        }

        /* ── Sparkle particles ── */
        .boo-sparkle-particle {
          position: absolute;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: white;
          pointer-events: none;
          animation: sparklePopBoo 0.6s ease-out forwards;
        }
        @keyframes sparklePopBoo {
          0% { opacity: 1; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
          100% { opacity: 0; transform: scale(0.5); }
        }
      `}</style>
    </div>
  );
}
