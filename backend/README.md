# SmartEvent AI — Participant Module Backend

Flask + MongoDB backend for the Participant module, matching the API contract
already frozen in ADR-001 (`{success, data, message, error}` envelope, same
endpoint naming) — so wiring the existing React app to this is a service-layer
swap, not a rewrite.

**Verified end-to-end before shipping:** 40 assertions covering every route —
both auth methods, the eligibility gate on the actual write path (not just
the read-only check), registration/waitlist/duplicate logic, notifications,
certificates, feedback, and the chatbot fallback — run against `mongomock`
(no real MongoDB needed to verify the logic), plus a second full pass against
a completely clean `pip install -r requirements.txt` to catch any missing
dependencies. All 40 pass both times.

## What's built

- **Auth:** Google OAuth (server-side token verification, never trust the
  client) + direct User ID/password signup — both issue the same JWT.
- **Eligibility:** rules embedded per-event (`department` / `batch` / `role` /
  `college`), evaluated server-side, enforced again inside the registration
  endpoint itself (the UI disabling the Register button is a courtesy, this
  is the actual gate).
- **Events, Registrations** (with waitlisting), **Notifications**,
  **Certificates**, **Feedback** — straight ports of the existing dummy-data
  service shapes. `registeredCount` is computed live (via `events/serializers.py`,
  shared by both the events routes and the events embedded inside
  registrations) rather than stored on the event document — caught during
  integration testing as a real "NaN seats open" bug on the frontend before
  this existed, so it's the same computation everywhere an event is returned,
  not two separate implementations that could drift.
- **SMTP:** registration confirmation email, sent on successful registration.
  Gracefully logs instead of sending if `SMTP_HOST` isn't configured, so dev
  works without real credentials.
- **Chatbot:** provider-agnostic (`LLM_PROVIDER=openai|azure|none`). Defaults
  to `none` and returns a friendly fallback message — ships today, lights up
  the moment API credentials are added, no code changes needed either way.

## Setup

```bash
cd event-platform-backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:
- **`JWT_SECRET_KEY`** — generate a real one: `python -c "import secrets; print(secrets.token_hex(32))"`
- **`MONGO_URI`** — defaults to `mongodb://localhost:27017/smartevent`. Point
  this at a local MongoDB (see below) or an Atlas free-tier cluster.
- **`GOOGLE_CLIENT_ID`** — from Google Cloud Console → APIs & Services →
  Credentials → OAuth Client ID (Web application). Add
  `http://localhost:5173` to Authorized JavaScript origins for local dev.
- Leave `SMTP_HOST` and `LLM_PROVIDER=none` empty/default until real
  credentials are ready — both degrade gracefully.

### Get MongoDB running locally (pick one)

- **Docker:** `docker run -d -p 27017:27017 --name smartevent-mongo mongo:7`
- **MongoDB Atlas (free tier):** create a cluster, put its connection string
  in `MONGO_URI`.

### Seed dummy data

**Per the 13 Jul MoM: this is 100% synthetic (Faker-generated) data — no real
Hexaware employee data goes in here.**

```bash
python scripts/seed_dummy_data.py
```

Prints a demo login when done: `demo.participant@example.com` / `password123`.

### Run it

```bash
python run.py
```

Serves on `http://localhost:5000`. Check `http://localhost:5000/api/health`.

## API surface

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | — | Direct signup |
| POST | `/api/auth/login` | — | User ID + password |
| POST | `/api/auth/google` | — | Body: `{ credential }` (Google ID token) |
| GET/PATCH | `/api/users/me` | ✓ | Profile |
| GET | `/api/events` | — | `?category=&mode=&status=&search=` |
| GET | `/api/events/categories` | — | |
| GET | `/api/events/:id` | — | |
| GET | `/api/events/:id/eligibility` | ✓ | `{ eligible, reasons, rules }` |
| GET/POST | `/api/registrations` | ✓ | POST enforces eligibility server-side |
| DELETE | `/api/registrations/:id` | ✓ | |
| GET | `/api/notifications` | ✓ | |
| GET | `/api/notifications/unread-count` | ✓ | |
| PATCH | `/api/notifications/:id/read` | ✓ | |
| PATCH | `/api/notifications/mark-all-read` | ✓ | |
| GET | `/api/certificates` | ✓ | |
| POST | `/api/feedback` | ✓ | |
| GET | `/api/feedback/:eventId` | ✓ | |
| POST | `/api/chatbot/message` | ✓ | `{ message, context? }` |
| GET | `/api/health` | — | |

Protected routes: send `Authorization: Bearer <token>`.

## Turning on the chatbot for real

Set in `.env`:
```
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```
or
```
LLM_PROVIDER=azure
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```
Then `pip install openai` (commented out in `requirements.txt` until needed).
No route or frontend changes required either way.

## Turning on real emails

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`
in `.env` — works with Gmail SMTP, SendGrid, or a real corporate relay.
Only the registration-confirmation trigger is wired up (the one email fully
inside this module's control). Reminders, approval/rejection, and post-event
thank-you emails depend on Organizer/Admin actions that aren't built yet —
`app/email/mailer.py` is ready for whoever wires those up.

## Known scope boundaries (not bugs)

- **Organizer/Admin endpoints are not in this backend.** Per the ADR, this
  team owns the Participant module only.
- **`organizerId` on seeded events is a placeholder string**, not a real
  user reference — there's no Organizer account system here yet.
- **Dot-pattern-free, straightforward REST** — no GraphQL, no real-time
  websockets. Nothing in the current frontend needs them.
