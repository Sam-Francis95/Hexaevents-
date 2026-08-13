# SmartEvent AI — Participant Module (Frontend)

React + Vite frontend for the Participant module. Runs against real dummy
JSON out of the box, or against the real Flask backend once it's running.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## Connecting to the real backend

By default (`VITE_USE_MOCK_DATA` unset or `false`), this app expects the
Flask backend running at `VITE_API_BASE_URL` (defaults to
`http://localhost:5000/api`). Start the backend first — see
`event-platform-backend/README.md` for setup, then:

```bash
npm run dev
```

Sign up directly on the Login screen, or use the backend's seeded demo
login: `demo.participant@example.com` / `password123`.

### Running without a backend (offline / demo mode)

Set in `.env`:
```
VITE_USE_MOCK_DATA=true
```
Every page falls back to the original dummy JSON data — useful for a quick
demo, but Google login and direct signup aren't available in this mode
(the mock auth layer only supports the seeded demo accounts). Demo login in
mock mode: `priya.sharma@company.com` / `password123`.

## Enabling Google Sign-In

1. In [Google Cloud Console](https://console.cloud.google.com/), create an
   OAuth 2.0 Client ID (Application type: **Web application**).
2. Add `http://localhost:5173` (and your real deployed URL, once you have
   one) to **Authorized JavaScript origins**.
3. Put the Client ID in `.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
4. Put the **same** Client ID in the backend's `.env` as `GOOGLE_CLIENT_ID`
   — both sides need it (frontend renders the button, backend verifies the
   token it produces).

Until this is set, the Login page shows a plain notice and email/password
still works — nothing breaks.

## What changed in this pass

- **Re-themed to Coursera blue** (`#0056D2`) — supersedes the earlier
  navy-sidebar exploration for now, per direction from the mentor.
- **Google Sign-In + direct signup** added to the Login page (toggle between
  Log in / Create account).
- **Eligibility card** on Event Details — shows restriction rules and why
  you are/aren't eligible; Register button is disabled with a clear reason
  when you're not (the real gate is server-side; this is UI, not the
  enforcement).
- **Chatbot widget** — floating assistant available on every participant
  page. Returns a friendly "not configured yet" message until the backend's
  `LLM_PROVIDER` is set to `openai` or `azure`.
- **Every service file** (`auth`, `events`, `registrations`, `notifications`,
  `certificates`, `feedback`, `users`) now branches on `VITE_USE_MOCK_DATA`
  at build time — same function signatures either way, so no page component
  needed to change.

## Verified before shipping

Full live integration test (real backend + real frontend + Playwright
clicking through the actual UI, not just isolated unit checks): signup →
dashboard → an ineligible event (correctly blocked, with the reason shown)
→ an eligible event → register → confirmed in My Registrations → chatbot
fallback reply. All checks pass, including a regression check for a real
bug caught mid-build ("NaN seats open" — the backend wasn't computing
registered-count; fixed in `events/serializers.py` on the backend).

## Other commands

```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```
