import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { BOTS } from "../../data/bots";
import { useBotStore } from "../../store/bots";
import type { BotMessage } from "../../store/bots";
import { sendChatWithPolling } from "../../lib/api";

export default function BotChat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customBots, chatHistories, addMessage, clearHistory } = useBotStore();

  const allBots = useMemo(() => [...BOTS, ...customBots], [customBots]);
  const bot = useMemo(() => allBots.find((b) => b.id === id), [allBots, id]);

  const messages = (id && chatHistories[id]) || [];
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !bot || !id || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const userMsg: BotMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    addMessage(id, userMsg);

    try {
      const prompt = `[System: ${bot.systemPrompt}]\n\nUser: ${text}`;
      const reply = await sendChatWithPolling(prompt, `bot:${id}`);
      const assistantMsg: BotMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
        createdAt: Date.now(),
      };
      addMessage(id, assistantMsg);
    } catch {
      const errorMsg: BotMessage = {
        id: `e-${Date.now()}`,
        role: "assistant",
        content: "Something went wrong. Please try again.",
        createdAt: Date.now(),
      };
      addMessage(id, errorMsg);
    } finally {
      setSending(false);
    }
  }, [input, bot, id, sending, addMessage]);

  if (!bot) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0c0118" }}
      >
        <div className="text-center">
          <p className="text-white/40 text-[16px] mb-4">Bot not found</p>
          <button
            onClick={() => navigate("/bots")}
            className="text-[13px] px-5 py-2 rounded-full text-white font-semibold border-none cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #9370ff, #EC4899)",
            }}
          >
            Back to Bots
          </button>
        </div>
      </div>
    );
  }

  const showGreeting = messages.length === 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0c0118" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 md:px-8 py-3 flex items-center gap-3"
        style={{
          background: "rgba(12,1,24,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => navigate("/bots")}
          className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-[24px]">{bot.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-white truncate">
              {bot.name}
            </span>
            {bot.online && (
              <span className="flex items-center gap-1 text-[10px] text-[#4ade80] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                Online
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/30 truncate">
            {bot.description}
          </p>
        </div>
        {messages.length > 0 && id && (
          <button
            onClick={() => clearHistory(id)}
            className="p-2 rounded-xl hover:bg-red-400/10 text-white/30 hover:text-red-400 transition-all bg-transparent border-none cursor-pointer"
            title="Clear chat"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-3xl w-full mx-auto">
        {/* Greeting */}
        {showGreeting && (
          <div className="flex gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[16px] flex-shrink-0"
              style={{
                background: `${bot.color}20`,
              }}
            >
              {bot.emoji}
            </div>
            <div
              className="rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-[14px] text-white/80 leading-relaxed">
                {bot.greeting}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 mb-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" ? (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[16px] flex-shrink-0"
                style={{ background: `${bot.color}20` }}
              >
                {bot.emoji}
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #9370ff, #EC4899)",
                }}
              >
                Y
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[80%] ${msg.role === "user" ? "rounded-tr-md" : "rounded-tl-md"}`}
              style={{
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, rgba(147,112,255,0.2), rgba(236,72,153,0.15))"
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${msg.role === "user" ? "rgba(147,112,255,0.2)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <p className="text-[14px] text-white/80 leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[16px] flex-shrink-0"
              style={{ background: `${bot.color}20` }}
            >
              {bot.emoji}
            </div>
            <div
              className="rounded-2xl rounded-tl-md px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex gap-1.5 py-1">
                <span
                  className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="sticky bottom-0 px-4 md:px-8 py-4"
        style={{
          background: "rgba(12,1,24,0.85)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${bot.name}...`}
            disabled={sending}
            className="flex-1 rounded-full px-5 py-3 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 border-none cursor-pointer flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #9370ff, #EC4899)",
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
