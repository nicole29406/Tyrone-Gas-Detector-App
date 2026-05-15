import { useEffect, useRef, useState } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { QUICK_REPLIES, botReply, botReplyAsync } from "../../lib/chatbot";

const INITIAL_MESSAGES = [
  {
    id: "init",
    role: "bot",
    content: {
      lead: "Hello! I'm GasBot 🤖 How can I assist you today?",
      bullets: [],
    },
    ts: Date.now(),
    source: "rule",
  },
];

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [usedAI, setUsedAI] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // Cancel any in-flight Claude request on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = Date.now();
    const userMsg = {
      id: `u-${now}`,
      role: "user",
      content: trimmed,
      ts: now,
    };
    const conv = [...messages, userMsg];
    setMessages(conv);
    setDraft("");
    setTyping(true);

    // Try Claude first
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const claudeResult = await botReplyAsync(conv, abortRef.current.signal);

    if (claudeResult.source === "aborted") {
      setTyping(false);
      return;
    }

    let botMsg;
    if (claudeResult.source === "claude" && claudeResult.text) {
      setUsedAI(true);
      botMsg = {
        id: `b-${Date.now()}`,
        role: "bot",
        content: claudeResult.text,
        ts: Date.now(),
        source: "claude",
      };
    } else {
      // Fallback to rule-based — small artificial delay so the UI looks like
      // it "thought" about it
      await new Promise((r) => setTimeout(r, 300));
      botMsg = {
        id: `b-${Date.now()}`,
        role: "bot",
        content: botReply(trimmed),
        ts: Date.now(),
        source: "rule",
      };
    }
    setMessages((m) => [...m, botMsg]);
    setTyping(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Provenance badge */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-center">
        <div
          className={
            "inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full " +
            (usedAI
              ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
              : "bg-slate-100 text-slate-500 ring-1 ring-slate-200")
          }
        >
          <Sparkles size={10} />
          {usedAI ? "Powered by Claude" : "Demo bot · ask anything"}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar px-4 pt-1 pb-2 space-y-3"
      >
        {messages.map((m) => (
          <Message key={m.id} msg={m} />
        ))}
        {typing && <TypingBubble />}
      </div>

      {/* Quick replies */}
      <div className="px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q.id}
            onClick={() => sendMessage(q.label)}
            disabled={typing}
            className="shrink-0 text-[12px] bg-white ring-1 ring-slate-200 rounded-full px-3 py-1.5 text-slate-700 hover:bg-brand-50 hover:ring-brand-200 hover:text-brand-700 transition-colors disabled:opacity-50"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(draft);
        }}
        className="px-3 pb-4 pt-2 bg-slate-50"
      >
        <div className="flex items-center gap-2 bg-white ring-1 ring-slate-200 rounded-full pl-4 pr-1 py-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your message…"
            disabled={typing}
            className="flex-1 bg-transparent py-2 text-[14px] focus:outline-none placeholder:text-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!draft.trim() || typing}
            className="w-9 h-9 rounded-full bg-brand-700 disabled:bg-slate-300 text-white flex items-center justify-center transition-colors"
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}

function Message({ msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex items-end justify-end gap-2 animate-slide-up">
        <div className="max-w-[75%]">
          <div className="bg-brand-700 text-white rounded-2xl rounded-br-md px-3.5 py-2 text-[13.5px] leading-snug whitespace-pre-wrap">
            {msg.content}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 text-right pr-1">
            {fmtTime(msg.ts)}
          </div>
        </div>
        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mb-5">
          <User size={14} className="text-brand-700" />
        </div>
      </div>
    );
  }
  // Bot
  return (
    <div className="flex items-end gap-2 animate-slide-up">
      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mb-5">
        <Bot size={14} className="text-slate-700" />
      </div>
      <div className="max-w-[82%]">
        <div className="bg-white ring-1 ring-slate-200 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13.5px] leading-snug text-slate-800">
          <BotContent content={msg.content} />
        </div>
        <div className="text-[10px] text-slate-400 mt-1 pl-1 flex items-center gap-1">
          {fmtTime(msg.ts)}
          {msg.source === "claude" && (
            <span className="text-brand-700 font-semibold">· Claude</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Renders either a plain Claude string response or a structured rule-based
// response (lead + bullets + footer).
function BotContent({ content }) {
  if (typeof content === "string") {
    // Light formatting: split by paragraphs, render `- ` or `• ` lines as
    // bullets. Otherwise keep newlines.
    const lines = content.split(/\n+/);
    return (
      <div className="space-y-1.5">
        {lines.map((line, i) => {
          const bullet = /^\s*[-•]\s+/.exec(line);
          if (bullet) {
            return (
              <div key={i} className="flex gap-2">
                <span className="text-brand-700 mt-0.5">•</span>
                <span className="whitespace-pre-wrap">
                  {line.replace(/^\s*[-•]\s+/, "")}
                </span>
              </div>
            );
          }
          return (
            <div key={i} className="whitespace-pre-wrap">
              {line}
            </div>
          );
        })}
      </div>
    );
  }
  // Structured (rule-based)
  return (
    <>
      {content.lead && (
        <div className={content.bullets?.length ? "mb-1.5" : ""}>
          {content.lead}
        </div>
      )}
      {content.bullets && content.bullets.length > 0 && (
        <ul className="space-y-1 mt-1">
          {content.bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-brand-700 mt-0.5">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {content.footer && (
        <div className="mt-2 text-[12px] text-slate-500">{content.footer}</div>
      )}
    </>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mb-2">
        <Bot size={14} className="text-slate-700" />
      </div>
      <div className="bg-white ring-1 ring-slate-200 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        <Dot delay="0s" />
        <Dot delay="0.15s" />
        <Dot delay="0.3s" />
      </div>
    </div>
  );
}

function Dot({ delay }) {
  return (
    <span
      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
      style={{ animationDelay: delay }}
    />
  );
}
