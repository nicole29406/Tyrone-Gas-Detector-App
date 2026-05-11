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

// Country-dial-code map for normalising local-format numbers ("0771...") to
// E.164 ("+256771..."). Keys must match the `region` strings stored in the
// app's account records.
const REGION_DIAL_CODE = {
  Uganda: "+256",
  Kenya: "+254",
  Tanzania: "+255",
  Rwanda: "+250",
  Burundi: "+257",
  "South Sudan": "+211",
  "DR Congo": "+243",
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
  const dial = REGION_DIAL_CODE[region] || "+256"; // default UG since this app's target users
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
          configured: Boolean(
            env.TWILIO_ACCOUNT_SID &&
              env.TWILIO_AUTH_TOKEN &&
              env.TWILIO_FROM_NUMBER
          ),
        },
        {},
        origin
      );
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

    // Check provider config
    if (
      !env.TWILIO_ACCOUNT_SID ||
      !env.TWILIO_AUTH_TOKEN ||
      !env.TWILIO_FROM_NUMBER
    ) {
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
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
    const formData = new URLSearchParams();
    formData.set("To", phone);
    formData.set("From", env.TWILIO_FROM_NUMBER);
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
