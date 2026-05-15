// TYRONE DETECTOR — SMS proxy Worker
// Receives signed requests from the frontend, validates them, and forwards to
// Twilio's Programmable Messaging API. Twilio credentials are stored as
// Cloudflare Workers secrets (`wrangler secret put TWILIO_ACCOUNT_SID`, etc.)
// and never reach the browser.

const ALLOWED_ORIGINS = [
  "https://nicole29406.github.io",
  "http://localhost:5173",
  "http://localhost:4173",
];

const E164_REGEX = /^\+\d{8,15}$/;
const MAX_MESSAGE_LEN = 480; // 3 SMS segments

// Claude chatbot config
const CLAUDE_MODEL = "claude-sonnet-4-5";
const CHAT_MAX_TOKENS = 600;
const CHAT_MAX_INPUT_CHARS = 4000; // bounds API cost per request
const CHAT_SYSTEM_PROMPT = `You are GasBot — the safety assistant inside TYRONE DETECTOR, a gas leak detection mobile app.

You help users with:
- Recognising and responding to gas leaks
- Evacuation procedures and emergency steps
- Sensor calibration and troubleshooting (MQ-series modules, ESP32, Bluetooth gas sensors)
- Gas safety prevention tips for homes
- Reading interpretation (PPM, LEL%)
- Emergency contacts (Emergency Services 0771938039, Gas Emergency Line 0788246984, Fire 112)

GUIDELINES:
- Be concise. Use short bullet points for steps and lists.
- Be authoritative about safety — never minimise risk.
- If the question is unrelated to gas safety, briefly mention what you can help with instead.
- Keep responses under 180 words when possible.
- Never claim to physically intervene — you can only inform and guide.

If a user reports an ACTIVE emergency, your first response must be the evacuation + emergency-call protocol.`;

// Country-dial-code map for normalising local-format numbers ("0771...") to
// E.164 ("+256771..."). Keys must match the `region` strings stored in the
// app's account records.
const REGION_DIAL_CODE = {
  Zimbabwe: "+263",
  Uganda: "+256",
  Kenya: "+254",
  Tanzania: "+255",
  Rwanda: "+250",
  Burundi: "+257",
  "South Sudan": "+211",
  "DR Congo": "+243",
  Zambia: "+260",
  Botswana: "+267",
  Mozambique: "+258",
  Malawi: "+265",
  Nigeria: "+234",
  Ghana: "+233",
  Ethiopia: "+251",
  "South Africa": "+27",
  Egypt: "+20",
  "United States": "+1",
  "United Kingdom": "+44",
  Canada: "+1",
  Australia: "+61",
  India: "+91",
};

function normalisePhone(raw, region) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.replace(/[\s\-()]/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("00")) return "+" + trimmed.slice(2);
  const dial = REGION_DIAL_CODE[region] || "+263"; // default to ZW (primary user region)
  if (trimmed.startsWith("0")) return dial + trimmed.slice(1);
  return dial + trimmed;
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(body, init = {}, origin = "") {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Health check
    if (request.method === "GET" && url.pathname === "/health") {
      return json(
        {
          ok: true,
          configured: {
            sms: Boolean(
              (env.TWILIO_ACCOUNT_SID || "").trim() &&
                (env.TWILIO_AUTH_TOKEN || "").trim() &&
                (env.TWILIO_FROM_NUMBER || "").trim()
            ),
            chat: Boolean((env.ANTHROPIC_API_KEY || "").trim()),
          },
        },
        {},
        origin
      );
    }

    // Claude chatbot endpoint
    if (request.method === "POST" && url.pathname === "/api/chat") {
      return handleChat(request, env, origin);
    }

    if (request.method !== "POST" || url.pathname !== "/api/sms") {
      return json({ error: "Not found" }, { status: 404 }, origin);
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, { status: 400 }, origin);
    }

    const { to, message, region } = body || {};

    if (!to || !message) {
      return json(
        { error: "Missing 'to' or 'message'" },
        { status: 400 },
        origin
      );
    }
    if (typeof message !== "string" || message.length > MAX_MESSAGE_LEN) {
      return json(
        { error: `Message must be a string under ${MAX_MESSAGE_LEN} chars` },
        { status: 400 },
        origin
      );
    }

    const phone = normalisePhone(to, region);
    if (!phone || !E164_REGEX.test(phone)) {
      return json(
        { error: "Invalid phone number", normalised: phone },
        { status: 400 },
        origin
      );
    }

    // Trim each secret defensively (PowerShell's pipe to wrangler can leave
    // a trailing CR/LF on Windows, which corrupts the header values).
    const twAccountSid = (env.TWILIO_ACCOUNT_SID || "").trim();
    const twAuthToken = (env.TWILIO_AUTH_TOKEN || "").trim();
    const twFromNumber = (env.TWILIO_FROM_NUMBER || "").trim();

    if (!twAccountSid || !twAuthToken || !twFromNumber) {
      return json(
        {
          error: "SMS provider not configured",
          hint:
            "Worker secrets missing. Run from /worker dir:\n" +
            "  wrangler secret put TWILIO_ACCOUNT_SID\n" +
            "  wrangler secret put TWILIO_AUTH_TOKEN\n" +
            "  wrangler secret put TWILIO_FROM_NUMBER",
        },
        { status: 503 },
        origin
      );
    }

    // Call Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twAccountSid}/Messages.json`;
    const auth = btoa(`${twAccountSid}:${twAuthToken}`);
    const formData = new URLSearchParams();
    formData.set("To", phone);
    formData.set("From", twFromNumber);
    formData.set("Body", message);

    let twResponse, twBody;
    try {
      twResponse = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });
      twBody = await twResponse.json();
    } catch (err) {
      return json(
        { error: "Failed to reach Twilio", details: String(err) },
        { status: 502 },
        origin
      );
    }

    if (!twResponse.ok) {
      // Trial accounts get error 21608 when sending to unverified numbers — surface clearly.
      const isTrialUnverified = twBody?.code === 21608;
      return json(
        {
          error: twBody?.message || "Twilio rejected the message",
          code: twBody?.code,
          twilioStatus: twResponse.status,
          ...(isTrialUnverified && {
            hint:
              "Twilio trial accounts can only send to verified phone numbers. " +
              "Verify the recipient at https://console.twilio.com/us1/develop/phone-numbers/manage/verified",
          }),
        },
        { status: twResponse.status },
        origin
      );
    }

    return json(
      {
        ok: true,
        sid: twBody.sid,
        status: twBody.status,
        to: twBody.to,
        sentAt: new Date().toISOString(),
      },
      { status: 200 },
      origin
    );
  },
};

// ---------------------------------------------------------------------------
// Claude chat handler. Accepts:
//   { messages: [{ role: "user" | "assistant", content: "..." }, ...] }
// Forwards to Anthropic's Messages API using ANTHROPIC_API_KEY secret.
// Falls back to 503 if the key isn't configured — the frontend then uses its
// built-in rule-based bot.
async function handleChat(request, env, origin) {
  // Trim defensively — PowerShell's `| wrangler secret put` can leave a
  // trailing CR/LF on Windows. Without this the API key gets rejected as
  // invalid even though the underlying value is correct.
  const apiKey = (env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return json(
      {
        error: "Chatbot not configured",
        hint:
          "Set the secret with: cd worker && wrangler secret put ANTHROPIC_API_KEY",
      },
      { status: 503 },
      origin
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 }, origin);
  }

  const { messages } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return json(
      { error: "'messages' must be a non-empty array" },
      { status: 400 },
      origin
    );
  }

  // Sanitise + bound input size
  const cleaned = [];
  let totalChars = 0;
  for (const m of messages.slice(-12) /* keep last 12 turns max */) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    const content = typeof m.content === "string" ? m.content : "";
    if (!content) continue;
    totalChars += content.length;
    if (totalChars > CHAT_MAX_INPUT_CHARS) break;
    cleaned.push({ role: m.role, content });
  }
  if (cleaned.length === 0) {
    return json({ error: "No valid messages" }, { status: 400 }, origin);
  }
  // Claude requires the first message to be from the user
  if (cleaned[0].role !== "user") cleaned.shift();
  if (cleaned.length === 0) {
    return json(
      { error: "First message must be from user" },
      { status: 400 },
      origin
    );
  }

  let res, data;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: CHAT_MAX_TOKENS,
        system: CHAT_SYSTEM_PROMPT,
        messages: cleaned,
      }),
    });
    data = await res.json();
  } catch (err) {
    return json(
      { error: "Failed to reach Anthropic", details: String(err) },
      { status: 502 },
      origin
    );
  }

  if (!res.ok) {
    return json(
      {
        error: data?.error?.message || "Anthropic rejected the request",
        type: data?.error?.type,
        status: res.status,
      },
      { status: res.status },
      origin
    );
  }

  // Extract text from the response. Claude returns content as an array of
  // typed blocks; we concatenate all text blocks.
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  return json(
    {
      ok: true,
      text,
      model: data.model,
      stopReason: data.stop_reason,
      usage: data.usage,
    },
    {},
    origin
  );
}
