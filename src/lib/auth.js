// Account / auth storage. Demo-grade only — passwords are SHA-256 hashed with a
// random per-account salt, stored in localStorage. A real product needs a
// backend, proper KDF (Argon2/bcrypt), TLS, etc.

const ACCOUNTS_KEY = "tyrone.accounts.v1";
const SESSION_KEY = "tyrone.session.v1";

export const REGIONS = [
  "Zimbabwe",
  "Uganda",
  "Kenya",
  "Tanzania",
  "Rwanda",
  "Burundi",
  "South Sudan",
  "DR Congo",
  "Zambia",
  "Botswana",
  "Mozambique",
  "Malawi",
  "Nigeria",
  "Ghana",
  "Ethiopia",
  "South Africa",
  "Egypt",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "Other",
];

export const DEFAULT_ACCOUNT_SETTINGS = {
  soundOn: true,
  vibrationOn: true,
  threshold: 400,
  units: "ppm",
  darkMode: true,
  emergencyContact: "0771938039", // default emergency services
};

// ---------- storage ----------

export function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(accountId) {
  if (accountId) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ accountId }));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

// ---------- validation ----------

export function validatePassword(pw) {
  if (!pw) return "Password is required";
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Include at least one uppercase letter";
  if (!/[a-z]/.test(pw)) return "Include at least one lowercase letter";
  if (!/[0-9]/.test(pw)) return "Include at least one number";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Include at least one special character";
  return null;
}

export function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 5);
}

export function strengthLabel(score) {
  return ["Empty", "Weak", "Fair", "Okay", "Good", "Strong"][score] || "Weak";
}

export function validateEmail(email) {
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Enter a valid email address";
  return null;
}

export function validatePhone(phone) {
  if (!phone) return "Phone number is required";
  const cleaned = phone.replace(/[\s-]/g, "");
  if (!/^\+?\d{7,15}$/.test(cleaned))
    return "Enter a valid phone number (7–15 digits)";
  return null;
}

export function validateDob(dob) {
  if (!dob) return "Date of birth is required";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  const now = new Date();
  if (d > now) return "Date of birth can't be in the future";
  const age = (now - d) / (365.25 * 24 * 3600 * 1000);
  if (age < 13) return "You must be at least 13 to use this app";
  if (age > 120) return "Please enter a realistic date of birth";
  return null;
}

export function validateFullName(name) {
  if (!name) return "Full name is required";
  if (name.trim().length < 2) return "Full name is too short";
  if (!/[A-Za-z]/.test(name)) return "Full name must contain letters";
  return null;
}

// ---------- hashing ----------

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function sha256Hex(input) {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return bytesToHex(new Uint8Array(hash));
}

export async function hashPassword(pw, salt) {
  return sha256Hex(`${salt}:${pw}`);
}

// ---------- account lookup / signup ----------

export function findByIdentifier(accounts, identifier) {
  if (!identifier) return null;
  const trimmed = identifier.trim();
  const lower = trimmed.toLowerCase();
  return (
    accounts.find(
      (a) =>
        a.username?.toLowerCase() === lower ||
        a.email?.toLowerCase() === lower ||
        a.phone === trimmed
    ) || null
  );
}

export async function createAccount({
  fullName,
  email,
  phone,
  dob,
  region,
  password,
}) {
  const accounts = loadAccounts();
  // uniqueness checks
  const lowerEmail = email.toLowerCase();
  if (accounts.some((a) => a.email?.toLowerCase() === lowerEmail))
    throw new Error("An account with this email already exists");
  if (accounts.some((a) => a.phone === phone))
    throw new Error("An account with this phone already exists");

  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const id = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Derive a default username from the email local-part
  const username = lowerEmail.split("@")[0];

  const account = {
    id,
    fullName: fullName.trim(),
    email,
    phone,
    username,
    dob,
    region,
    salt,
    passwordHash,
    createdAt: Date.now(),
    settings: { ...DEFAULT_ACCOUNT_SETTINGS },
    alertLog: [],
  };

  saveAccounts([...accounts, account]);
  saveSession(id);
  return account;
}

export async function loginAccount(identifier, password) {
  const accounts = loadAccounts();
  const account = findByIdentifier(accounts, identifier);
  if (!account) throw new Error("No account found for that identifier");
  const hash = await hashPassword(password, account.salt);
  if (hash !== account.passwordHash) throw new Error("Incorrect password");
  saveSession(account.id);
  return account;
}

export function updateAccount(id, patch) {
  const accounts = loadAccounts();
  const next = accounts.map((a) => (a.id === id ? { ...a, ...patch } : a));
  saveAccounts(next);
  return next.find((a) => a.id === id);
}

export function getAccountById(id) {
  return loadAccounts().find((a) => a.id === id) || null;
}

// ---------- email suggestion ----------

export function suggestEmail(fullName) {
  const base = (fullName || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 24) || "user";
  const rand = Math.floor(1000 + Math.random() * 9000);
  // Demo-only domain — this address is a placeholder, not a real mailbox.
  return `${base}.${rand}@tyrone-detector.app`;
}
