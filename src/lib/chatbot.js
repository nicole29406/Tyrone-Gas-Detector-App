// GasBot — two layers:
//   1. Async Claude-powered replies via the Worker /api/chat endpoint.
//   2. Built-in rule-based fallback when Claude isn't configured / fails.
// Frontends should call `botReplyAsync(messages)` first; if it returns
// `{ source: "fallback" }` they should also call `botReply(message)`.

const ENDPOINT = (import.meta.env.VITE_SMS_ENDPOINT || "").replace(/\/$/, "");

// -------------------- QUICK REPLIES --------------------

export const QUICK_REPLIES = [
  { id: "smell", label: "What if I smell gas?" },
  { id: "evac", label: "How do I evacuate?" },
  { id: "prevent", label: "Prevention tips" },
  { id: "emergency", label: "Emergency contacts" },
  { id: "calibrate", label: "How do I calibrate the sensor?" },
  { id: "ppm", label: "What does PPM mean?" },
];

// -------------------- CLAUDE (async) --------------------

// Convert UI messages → Anthropic messages format.
// Bot messages stored in UI state can be either:
//   - { role: "bot", content: "string..." }   (Claude responses)
//   - { role: "bot", content: { lead, bullets, footer } }  (rule-based)
// We collapse both to plain strings for Claude.
function toApiMessage(m) {
  const role = m.role === "bot" ? "assistant" : "user";
  let content = "";
  if (typeof m.content === "string") {
    content = m.content;
  } else if (m.content) {
    const { lead = "", bullets = [], footer = "" } = m.content;
    content =
      lead +
      (bullets.length ? "\n" + bullets.map((b) => `• ${b}`).join("\n") : "") +
      (footer ? "\n" + footer : "");
  }
  return { role, content };
}

export async function botReplyAsync(messages, signal) {
  if (!ENDPOINT) return { source: "fallback", reason: "no-endpoint" };

  // Drop the initial bot greeting; Anthropic expects the first message from
  // the user.
  const apiMessages = messages
    .filter((m) => m.id !== "init")
    .map(toApiMessage)
    .filter((m) => m.content && m.content.trim());

  if (apiMessages.length === 0) {
    return { source: "fallback", reason: "no-messages" };
  }

  try {
    const res = await fetch(`${ENDPOINT}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages }),
      signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        source: "fallback",
        reason: data?.error || `HTTP ${res.status}`,
      };
    }
    return {
      source: "claude",
      text: data.text,
      model: data.model,
      usage: data.usage,
    };
  } catch (err) {
    if (err?.name === "AbortError") return { source: "aborted" };
    return { source: "fallback", reason: err?.message || "network-error" };
  }
}

// -------------------- RULE-BASED FALLBACK --------------------

const INTENTS = [
  {
    id: "smell",
    triggers: ["smell", "leak", "leaking", "smelling"],
    answer: {
      lead: "If you smell gas:",
      bullets: [
        "Do not panic.",
        "Open windows and doors.",
        "Do not use electrical switches.",
        "Leave the area and call emergency services.",
      ],
    },
  },
  {
    id: "evac",
    triggers: ["evacuate", "evacuation", "leave", "get out", "exit"],
    answer: {
      lead: "Evacuation steps:",
      bullets: [
        "Alert everyone calmly — do not shout.",
        "Take the nearest exit; do not collect belongings.",
        "Move at least 100 metres / 300 ft away.",
        "Account for everyone before calling emergency services.",
        "Do not re-enter until a qualified technician certifies it safe.",
      ],
    },
  },
  {
    id: "prevent",
    triggers: ["prevent", "prevention", "tips", "advice"],
    answer: {
      lead: "Prevention tips:",
      bullets: [
        "Service gas appliances annually with a certified technician.",
        "Install gas detectors in kitchens, near boilers, and bedrooms.",
        "Check rubber hoses and clamps for cracks every few months.",
        "Always close the cylinder valve when not in use.",
      ],
    },
  },
  {
    id: "emergency",
    triggers: ["emergency", "contact", "number", "call", "phone"],
    answer: {
      lead: "Emergency contacts:",
      bullets: [
        "Emergency Services — 0771938039",
        "Gas Emergency Line — 0788246984",
        "Local Fire Department — 112",
      ],
      footer: "Tap the phone icon on the Emergency Contacts screen to dial.",
    },
  },
  {
    id: "calibrate",
    triggers: ["calibrate", "calibration", "accuracy", "setup"],
    answer: {
      lead: "Sensor calibration:",
      bullets: [
        "Run the sensor in clean air for 24 hours after first install.",
        "Avoid placing the sensor near cleaning chemicals or aerosols.",
        "Re-zero monthly: with no gas present, reading should sit near 0 PPM.",
        "Replace MQ-series sensors every 2–3 years of continuous use.",
      ],
    },
  },
  {
    id: "ppm",
    triggers: ["ppm", "parts per million", "lel", "unit"],
    answer: {
      lead: "About the units:",
      bullets: [
        "PPM = parts per million. 1000 PPM means 0.1% of the air volume is the gas.",
        "LEL% = lower explosive limit. 100% LEL is the minimum concentration that can ignite.",
        "For methane, 1% air concentration is roughly 20% LEL.",
        "TYRONE alerts at the threshold you set in Notification Preferences.",
      ],
    },
  },
  {
    id: "help",
    triggers: ["help", "how", "what can you", "topics"],
    answer: {
      lead: "I can help with:",
      bullets: [
        "What to do if you smell gas",
        "Evacuation steps",
        "Prevention tips",
        "Emergency contacts",
        "Sensor calibration",
        "Reading units (PPM / LEL%)",
      ],
      footer: "Tap one of the suggestions below or type a question.",
    },
  },
  {
    id: "greeting",
    triggers: ["hi", "hello", "hey", "morning", "evening"],
    answer: {
      lead: "Hello! I'm GasBot 🤖 How can I assist you today?",
      bullets: [],
    },
  },
  {
    id: "thanks",
    triggers: ["thanks", "thank you", "appreciate", "cheers"],
    answer: {
      lead: "You're welcome! Stay safe out there.",
      bullets: [],
    },
  },
];

const FALLBACK_REPLY = {
  lead:
    "I'm not sure I caught that. I can help with gas-safety basics, evacuation, prevention, sensor calibration and emergency contacts.",
  bullets: ["Try one of the suggested questions below, or rephrase."],
};

function scoreIntent(message, intent) {
  const lower = message.toLowerCase();
  let score = 0;
  for (const t of intent.triggers) {
    if (lower.includes(t)) score += t.length;
  }
  return score;
}

export function botReply(message) {
  if (!message?.trim()) return FALLBACK_REPLY;
  let best = { score: 0, intent: null };
  for (const intent of INTENTS) {
    const s = scoreIntent(message, intent);
    if (s > best.score) best = { score: s, intent };
  }
  return best.intent ? best.intent.answer : FALLBACK_REPLY;
}

export function isAiConfigured() {
  return Boolean(ENDPOINT);
}
