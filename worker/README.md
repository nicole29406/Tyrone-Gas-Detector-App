# TYRONE SMS Worker

A Cloudflare Worker that proxies SMS alerts from the TYRONE DETECTOR frontend
to Twilio's Programmable Messaging API. Twilio credentials live in the
Cloudflare secret store and **never** reach the browser.

```
Frontend (Pages)  →  Worker (CF)  →  Twilio  →  📱 SMS
                     holds keys      sends it
```

## Endpoints

| Method | Path       | Description                                          |
| ------ | ---------- | ---------------------------------------------------- |
| GET    | `/health`  | Returns `{ ok: true, configured: bool }`             |
| POST   | `/api/sms` | `{ to, message, region? }` → forwards via Twilio     |

CORS is locked to:
- `https://nicole29406.github.io` (production)
- `http://localhost:5173` and `:4173` (dev)

## One-time setup

### 1. Twilio account

1. Sign up at https://twilio.com/try-twilio (free, $15 trial credit).
2. From the console dashboard, copy your **Account SID** and **Auth Token**.
3. Buy or claim a Twilio phone number with SMS capability — for trial accounts
   this is free at https://console.twilio.com/us1/develop/phone-numbers/manage/incoming.
   Note the number in E.164 format, e.g. `+15551234567`.
4. **Trial limitation:** trial accounts can only send to verified numbers.
   Verify the recipient phone at
   https://console.twilio.com/us1/develop/phone-numbers/manage/verified.
   Upgrade the account (pay-as-you-go, no minimum) to remove this restriction.

### 2. Cloudflare + Wrangler

1. Sign up at https://dash.cloudflare.com/sign-up (free).
2. Install Wrangler in the `worker/` directory:
   ```powershell
   cd worker
   npm install
   ```
3. Log in:
   ```powershell
   npx wrangler login
   ```
   (Opens a browser; click "Allow".)

### 3. Store Twilio secrets

Run these from the `worker/` directory and paste the values when prompted:

```powershell
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_FROM_NUMBER
```

### 4. Deploy

```powershell
npx wrangler deploy
```

Wrangler prints a URL like `https://tyrone-sms.<your-subdomain>.workers.dev`.
Test it:

```powershell
curl "https://tyrone-sms.<your-subdomain>.workers.dev/health"
# → { "ok": true, "configured": true }
```

### 5. Tell the frontend where the Worker lives

From the project root (so it targets the right repo):

```powershell
gh variable set VITE_SMS_ENDPOINT --body "https://tyrone-sms.<your-subdomain>.workers.dev"
gh workflow run deploy.yml
```

The next Pages build embeds the URL into the bundle. Reload the app — when
the SMS-escalation popup fires you'll see "Live: SMS via …" at the bottom and
real text messages will arrive on the registered phone.

## Local development

```powershell
cd worker
npx wrangler dev          # http://localhost:8787
```

In the frontend, set `VITE_SMS_ENDPOINT=http://localhost:8787` in a project-root
`.env.local` file and run `npm run dev`.

## Costs

- Cloudflare Workers free tier: 100,000 requests / day, 10ms CPU / request.
- Twilio SMS: ~$0.04 per SMS to Ugandan numbers (varies by destination).
- Plenty cheap for personal / demo use; budget accordingly for production.

## Security notes

This is a demo-grade backend. For production you should add:

- A signed token or session cookie from the frontend so anonymous users can't
  abuse the endpoint to spam other people's phones.
- Per-user / per-IP rate limiting (Cloudflare Workers KV or Durable Objects).
- Logging + alerting on Twilio error rates.
- An allowlist of phone numbers your app is permitted to send to.
