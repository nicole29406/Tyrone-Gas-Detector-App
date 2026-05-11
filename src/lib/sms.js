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

export async function sendEmergencySms({ user, gas, ppm, signal }) {
  if (!ENDPOINT) {
    return {
      ok: false,
      reason: "no-endpoint",
      message: "SMS provider not configured for this build.",
    };
  }
  if (!user?.phone) {
    return {
      ok: false,
      reason: "no-phone",
      message: "Logged-in account has no phone number.",
    };
  }

  const payload = {
    to: user.phone,
    region: user.region,
    message: composeAlertMessage({ user, gas, ppm }),
  };

  try {
    const res = await fetch(`${ENDPOINT}/api/sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    if (err.name === "AbortError") {
      return { ok: false, reason: "aborted" };
    }
    return {
      ok: false,
      reason: "network-error",
      message: err.message || String(err),
    };
  }
}
