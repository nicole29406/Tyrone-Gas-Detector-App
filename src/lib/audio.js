// Single shared AudioContext, lazily created on first user gesture so we don't
// fall foul of browser autoplay restrictions.

let ctx = null;
let beepTimer = null;
let beepInterval = null;
let currentOsc = null;
let currentGain = null;

function ensureContext() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function beep(durationMs = 200, freq = 880) {
  const c = ensureContext();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "square";
  osc.frequency.value = freq;

  const now = c.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.02);

  currentOsc = osc;
  currentGain = gain;
}

export function playTestBeep() {
  beep(180, 880);
  setTimeout(() => beep(180, 1175), 220);
}

export function startAlarm() {
  if (beepInterval) return; // already running
  // Two-tone urgent pattern
  let toggle = false;
  const fire = () => {
    beep(180, toggle ? 1175 : 880);
    toggle = !toggle;
  };
  fire();
  beepInterval = setInterval(fire, 260);
}

export function stopAlarm() {
  if (beepInterval) {
    clearInterval(beepInterval);
    beepInterval = null;
  }
  if (beepTimer) {
    clearTimeout(beepTimer);
    beepTimer = null;
  }
  if (currentOsc) {
    try {
      currentOsc.stop();
    } catch {
      /* already stopped */
    }
    currentOsc = null;
    currentGain = null;
  }
}

export function unlockAudio() {
  // Call from a click handler so the AudioContext is allowed to play later.
  ensureContext();
}
