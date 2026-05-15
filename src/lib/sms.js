// Frontend SMS client. Posts to the TYRONE SMS Worker which proxies to Twilio.
// The Worker URL is injected at build time as VITE_SMS_ENDPOINT. If unset
// (e.g. local dev or before the Worker is deployed), all calls return a clean
// "no-endpoint" result so the UI can fall back to simulation-only mode.

const ENDPOINT = (import.meta.env.VITE_SMS_ENDPOINT || "").replace(/\/$/, "");
const GAS_EMERGENCY_LINE = "0788246984";

export function isSmsConfigured() {
  return Boolean(ENDPOINT);
}

export function endpointHost() {
  if (!ENDPOINT) return null;
  try {
    return new URL(ENDPOINT).host;
  } catch {
    return null;
  }
}

function composeAlertMessage({ user, gas, ppm }) {
  const firstName = user?.fullName?.split(" ")[0] || "User";
  const reading = gas && ppm ? ` ${gas} ${ppm} PPM.` : "";
  return (
    `TYRONE DETECTOR ALERT: Gas leak detected at your registered address.` +
    `${reading} Evacuate immediately, ${firstName}. ` +
    `Gas Emergency Line: ${GAS_EMERGENCY_LINE}.`
  );
}

async function sendOne({ to, region, message, signal }) {
  try {
    const res = await fetch(`${ENDPOINT}/api/sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, region, message }),
      signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        reason: data.error || `HTTP ${res.status}`,
        code: data.code,
        hint: data.hint,
      };
    }
    return {
      ok: true,
      sid: data.sid,
      status: data.status,
      to: data.to,
      sentAt: data.sentAt,
    };
  } catch (err) {
    if (err.name === "AbortError") return { ok: false, reason: "aborted" };
    return {
      ok: false,
      reason: "network-error",
      message: err.message || String(err),
    };
  }
}

// Build the recipient list: the logged-in user plus every additional contact.
// Deduplicates by phone number.
export function buildRecipients(user, additionalContacts = []) {
  const recipients = [];
  const seen = new Set();
  if (user?.phone) {
    seen.add(user.phone);
    recipients.push({
      id: "self",
      name: user.fullName?.split(" ")[0] || "You",
      phone: user.phone,
      region: user.region,
      isSelf: true,
    });
  }
  for (const c of additionalContacts) {
    if (!c?.phone || seen.has(c.phone)) continue;
    seen.add(c.phone);
    recipients.push({
      id: c.id,
      name: c.name,
      phone: c.phone,
      region: c.region || user?.region,
    });
  }
  return recipients;
}

// Fan-out: send the alert SMS to every recipient in parallel. The returned
// object holds per-recipient results plus an aggregate summary so the UI can
// show "3/4 sent" style status.
export async function sendEmergencySmsAll({
  user,
  additionalContacts,
  gas,
  ppm,
  signal,
}) {
  if (!ENDPOINT) {
    return {
      ok: false,
      reason: "no-endpoint",
      message: "SMS provider not configured for this build.",
      results: [],
      sent: 0,
      total: 0,
    };
  }
  const recipients = buildRecipients(user, additionalContacts);
  if (recipients.length === 0) {
    return {
      ok: false,
      reason: "no-recipients",
      message: "No phone numbers to send to.",
      results: [],
      sent: 0,
      total: 0,
    };
  }
  const message = composeAlertMessage({ user, gas, ppm });

  const results = await Promise.all(
    recipients.map(async (r) => {
      const result = await sendOne({
        to: r.phone,
        region: r.region,
        message,
        signal,
      });
      return { recipient: r, ...result };
    })
  );
  const sent = results.filter((r) => r.ok).length;
  return {
    ok: sent > 0,
    results,
    sent,
    total: recipients.length,
  };
}

// Legacy single-recipient wrapper, kept so existing callers keep working.
export async function sendEmergencySms({ user, gas, ppm, signal }) {
  const out = await sendEmergencySmsAll({
    user,
    additionalContacts: [],
    gas,
    ppm,
    signal,
  });
  const me = out.results.find((r) => r.recipient.isSelf);
  return me || { ok: out.ok, reason: out.reason, message: out.message };
}
