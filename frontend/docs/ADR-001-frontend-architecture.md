# ADR-001: Frontend Architecture — AI Event Registration Platform

| | |
|---|---|
| **Status** | Accepted — Frozen |
| **Date** | 2026-07-08 |
| **Scope** | Frontend (React), all modules: Participant, Organizer, Admin |
| **Deciders** | Frontend team (3 devs) |
| **Supersedes** | None |
| **Amendment policy** | See §11. No unilateral deviation once development starts. |

---

## 1. Context

Three developers build three modules in parallel (Participant, Organizer, Admin) against a shared React shell, later integrating with a Flask + MongoDB backend and AI services. Without frozen contracts, parallel work produces merge conflicts, incompatible data shapes, and duplicated components. This ADR fixes the structural decisions before code is written.

---

## 2. Decision

### 2.1 Folder Structure — FROZEN

```
src/
├── app/
│   ├── App.jsx
│   ├── AppRoutes.jsx
│   └── ProtectedRoute.jsx
├── shared/
│   ├── components/
│   │   ├── common/
│   │   └── layout/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   │   └── apiClient.js
│   ├── utils/
│   └── schema/
├── modules/
│   ├── participant/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── data/
│   │   ├── routes.jsx
│   │   └── navConfig.js
│   ├── organizer/          (same internal pattern)
│   └── admin/              (same internal pattern)
└── main.jsx
```

Rule: a developer only creates/modifies files inside their own `modules/<name>/` directory, plus at most one line in `app/AppRoutes.jsx` and their own `navConfig.js` export. No developer edits another module's folder.

### 2.2 Component Ownership — FROZEN

| Owner | Path | Examples |
|---|---|---|
| Shared (all devs, PR review required) | `shared/components/common/` | Button, Input, Dropdown, Modal, Loader, Toast, Badge, Avatar, StatCard, Table, Pagination |
| Shared (all devs, PR review required) | `shared/components/layout/` | Navbar, Sidebar, Footer |
| Participant dev | `modules/participant/components/` | EventCard, CertificateCard, NotificationCard, FeedbackForm |
| Organizer dev | `modules/organizer/components/` | EventForm, ParticipantTable, ApprovalPanel |
| Admin dev | `modules/admin/components/` | UserTable, RoleEditor, AuditLogView |

**Promotion rule:** a component is only moved into `shared/` once a second module needs it, and only via a PR reviewed by the module owner who authored it plus one other dev. No component is placed in `shared/` speculatively.

### 2.3 Shared vs Module-Specific — FROZEN

| Layer | Shared | Module-Specific |
|---|---|---|
| Layout shell | Navbar/Sidebar/Footer structure + styling | Nav items (via `navConfig.js` per module) |
| Components | Generic, zero business logic | Domain-specific cards/forms/tables |
| Services | `apiClient.js` (HTTP instance, interceptors, error normalization) | Domain services (`eventService.js`, `registrationService.js`, etc.) |
| Routing | `AppRoutes.jsx` (composition only), `ProtectedRoute.jsx` (role guard) | Route definitions + page components |
| State | `AuthContext`, `ToastContext` | Local component state; module-local context only if a module needs cross-page state within itself |
| Utils | `constants.js`, `formatters.js`, `validators.js` | None — utils are shared from day one |
| Data contracts | `schema/` (JSDoc typedefs) | Actual dummy JSON content (must conform to schema) |
| Pages | Login, Unauthorized (403), NotFound (404) | All role-specific pages |

Login is shared because all three roles authenticate through one form; post-login redirect is role-based (§2.4).

### 2.4 Route Structure — FROZEN

Pattern: `/:module/:page` — every module-owned route is prefixed with its module name. This guarantees zero path collisions between independently developed modules.

```
/login                              (shared, public)
/unauthorized                       (shared)

/participant/dashboard
/participant/events
/participant/events/:id
/participant/events/:id/register
/participant/my-registrations
/participant/notifications
/participant/certificates
/participant/feedback/:eventId
/participant/profile

/organizer/dashboard
/organizer/events
/organizer/events/:id/manage
/organizer/participants
/organizer/analytics
...

/admin/dashboard
/admin/users
/admin/roles
/admin/audit-log
...
```

Post-login redirect: `AuthContext` reads `user.role` → routes to `/{role}/dashboard`. `ProtectedRoute` checks `roles` array on each route entry against `user.role`; unauthorized access redirects to `/unauthorized`.

Each module exports its own route array from `routes.jsx`:

```js
// modules/participant/routes.jsx
export const participantRoutes = [
  { path: '/participant/dashboard', element: <Dashboard />, roles: ['participant'] },
  ...
];
```

`app/AppRoutes.jsx` only imports and spreads — never defines routes directly.

### 2.5 Entity Models — FROZEN

Defined as JSDoc typedefs in `shared/schema/`. All dummy JSON and future API payloads must conform exactly. `id` is always a string (MongoDB `_id` maps to `id` at the service layer — no module ever reads `_id` directly).

```js
// shared/schema/Event.js
/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {'online'|'offline'|'hybrid'} mode
 * @property {string} venue
 * @property {string} startDate      ISO 8601
 * @property {string} endDate        ISO 8601
 * @property {string} registrationDeadline  ISO 8601
 * @property {number} capacity
 * @property {number} registeredCount
 * @property {string[]} speakers
 * @property {Object[]} agenda
 * @property {'draft'|'published'|'closed'|'completed'|'cancelled'} status
 * @property {string} organizerId
 * @property {string[]} formFieldIds   references RegistrationFormField[]
 * @property {string} createdAt
 * @property {string} updatedAt
 */
```

```js
// shared/schema/User.js
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'participant'|'organizer'|'admin'} role
 * @property {string} employeeId
 * @property {string} department
 * @property {string} phone
 * @property {string} avatarUrl
 * @property {string} createdAt
 */
```

```js
// shared/schema/Registration.js
/**
 * @typedef {Object} Registration
 * @property {string} id
 * @property {string} eventId
 * @property {string} userId
 * @property {Object} formResponses     key-value, keys = RegistrationFormField.id
 * @property {'registered'|'approved'|'waitlisted'|'rejected'|'completed'} status
 * @property {boolean} attended
 * @property {string} registeredAt
 * @property {string} updatedAt
 */
```

```js
// shared/schema/Certificate.js
/**
 * @typedef {Object} Certificate
 * @property {string} id
 * @property {string} eventId
 * @property {string} userId
 * @property {string} issueDate
 * @property {string} downloadUrl
 * @property {'issued'|'pending'} status
 */
```

```js
// shared/schema/Notification.js
/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} userId
 * @property {'registration'|'reminder'|'certificate'|'event_update'|'ai_recommendation'} type
 * @property {string} title
 * @property {string} message
 * @property {boolean} read
 * @property {string} createdAt
 */
```

```js
// shared/schema/Feedback.js
/**
 * @typedef {Object} Feedback
 * @property {string} id
 * @property {string} eventId
 * @property {string} userId
 * @property {number} rating          1-5
 * @property {string} comments
 * @property {string} suggestions
 * @property {string} submittedAt
 */
```

Any new field requires a PR against `shared/schema/`, reviewed by all three devs before use.

### 2.6 API Contracts — FROZEN

All future Flask endpoints follow this contract. Dummy services replicate response shape and latency (simulated delay) exactly, so swapping `apiClient.js` from mock to live requires no page-level changes.

**Base response envelope:**

```json
{
  "success": true,
  "data": { },
  "message": "",
  "error": null
}
```

**Error envelope:**

```json
{
  "success": false,
  "data": null,
  "message": "Human readable error",
  "error": { "code": "VALIDATION_ERROR", "details": [] }
}
```

**Endpoint table (Participant module subset — Organizer/Admin devs extend the same pattern):**

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT + user | Public |
| GET | `/api/events?category=&date=&status=&search=` | List events | Participant |
| GET | `/api/events/:id` | Event detail | Participant |
| POST | `/api/registrations` | Register for event | Participant |
| GET | `/api/registrations?userId=` | My registrations | Participant |
| GET | `/api/notifications?userId=` | List notifications | Participant |
| PATCH | `/api/notifications/:id/read` | Mark read | Participant |
| GET | `/api/certificates?userId=` | List certificates | Participant |
| POST | `/api/feedback` | Submit feedback | Participant |
| GET | `/api/users/me` | Profile | All roles |
| PATCH | `/api/users/me` | Update profile | All roles |

Rules:
- All list endpoints accept query params for filtering; server-side filtering is assumed even though dummy layer filters client-side.
- All mutating endpoints (`POST`/`PATCH`/`DELETE`) return the created/updated entity in `data`.
- HTTP status codes: `200` success, `201` created, `400` validation, `401` unauthenticated, `403` unauthorized (role mismatch), `404` not found, `500` server error.
- Pagination (once needed): `?page=&limit=`, response includes `data.items[]` and `data.meta.{page,limit,total}`.

### 2.7 Naming Conventions — FROZEN

| Item | Convention | Example |
|---|---|---|
| Component files | PascalCase, `.jsx` | `EventCard.jsx` |
| Non-component JS files | camelCase | `eventService.js` |
| Hooks | `use` + PascalCase | `useAuth.js` |
| Context files | PascalCase + `Context` | `AuthContext.jsx` |
| Folders | kebab-case | `my-registrations/` (only if multi-word; single-word folders as-is) |
| CSS/Tailwind custom classes | kebab-case, prefixed `app-` if custom (rare — Tailwind utilities preferred) | `app-card-hover` |
| Route paths | kebab-case, module-prefixed | `/participant/my-registrations` |
| Service functions | verbNoun camelCase, matches HTTP intent | `getEvents`, `createRegistration`, `updateProfile` |
| Constants | SCREAMING_SNAKE_CASE, in `shared/utils/constants.js` | `REGISTRATION_STATUS.APPROVED` |
| Git branches | `feature/<module>-<short-desc>` | `feature/participant-event-details` |
| Commit messages | Conventional Commits | `feat(participant): add event registration form` |
| Entity `id` field | always `id` (never `_id`) at the frontend boundary | — |

### 2.8 State Management Strategy — FROZEN

- **No Redux, no Zustand.** Context API + local state only, given team size and scope.
- **Global state (in `shared/context/`):**
  - `AuthContext` — current user, role, token, login/logout methods. Consumed via `useAuth()`.
  - `ToastContext` — app-wide toast/notification queue.
- **Module-local state:** each module may define its own context (e.g. `modules/organizer/context/EventBuilderContext.jsx`) for state that doesn't cross module boundaries (e.g. multi-step form wizard state). This never lives in `shared/`.
- **Page-local state:** `useState`/`useReducer` for filters, form inputs, UI toggles — default choice, prefer this over context unless state is shared across 3+ components.
- **Server-state caching:** none in Phase 1 (dummy JSON is synchronous-fast). When live APIs are integrated, the team will evaluate React Query — this is a Phase 2 decision, not frozen here.

### 2.9 Styling Strategy — FROZEN (Revised 2026-07-11 — see note)

> **Revision note:** the palette below replaces the original Microsoft/Atlassian/Linear-inspired tokens from the initial ADR pass. The client supplied a reference dashboard screenshot after Milestone 3 was already built; this section was updated to match it and the Participant module was reskinned accordingly. Organizer and Admin should build against **this** version, not the original description.

- **Tailwind CSS**, utility-first, no CSS Modules, no styled-components, no inline `style={}` except for dynamic computed values.
- **Reference palette** (extracted from client-provided dashboard mock), defined in `tailwind.config.js`:
  - `sidebar.from/via/to` — navy-to-indigo radial gradient (`#0B1130` → `#121A44` → `#1C1B4B`), used only for the sidebar shell (`bg-sidebar-gradient` utility).
  - `accent` (primary blue, `#4361EE`) — primary buttons, active nav state, links, primary stat/action tone.
  - `purple` (`#8B5CF6`) — secondary stat/action tone.
  - `success` (`#22C55E`), `warning` (`#F59E0B`), `danger` (`#EF4444`), `info` (`#3B82F6`) — status tones, each with a `-50` light-background pill/icon-circle variant.
  - `canvas` (`#F5F6FB`) main background, `surface` (`#FFFFFF`) card background, `border`/`border-strong` for hairlines.
  - `banner-gradient` (blue → violet → purple) — hero/welcome banners only.
- **Border radius scale:** `sm` 8px, `DEFAULT` 10px, `md` 12px, `lg` 16px (form controls), `xl` 20px (buttons), `2xl` 24px (cards, panels, modals). Every card-level container uses `rounded-2xl`; every button/tile uses `rounded-xl`; every form input/dropdown uses `rounded-lg`. No module introduces an off-scale radius.
- **Shadows:** `shadow-card` (resting state) / `shadow-card-hover` (hover) for all elevated white surfaces; `shadow-popover` for modals/menus/toasts; `shadow-sidebar-active` for the active sidebar nav pill. No module hand-rolls a box-shadow value.
- **Typography:** Inter for UI/body text, JetBrains Mono for tabular/status/code contexts (dates, badges' dot labels). Headings bold (`font-bold`/`font-semibold`), no serif anywhere — this is a data-dense enterprise dashboard, not editorial content.
- **Shared layout shell:** the navy `Sidebar` and light `Navbar` (both in `shared/components/layout/`) are the single visual anchor tying every module together — organizer/admin must render inside the same `AppShell`, not build their own chrome.
- **Shared stat/action patterns:** `StatCard` (icon-circle + value + optional trend), `GradientBanner` (hero welcome/callout), `ActionTile` (solid-color quick-action square) are shared, tone-driven components (`accent`/`purple`/`success`/`warning`) — reuse these rather than one-off styling per module.
- **Component variants:** conditional class composition via a shared `cn()` utility (`shared/utils/cn.js`, thin wrapper over `clsx`/`tailwind-merge`). No module introduces a second variant-composition pattern.
- **Icons:** single icon library (`lucide-react`) — no mixing icon sets across modules.

### 2.10 Integration Strategy — FROZEN

**Phase 1 (now):** dummy JSON in `modules/<name>/data/`, consumed through service functions that return Promises with a simulated network delay:

```js
// modules/participant/services/eventService.js
import { events } from '../data/events.json';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const getEvents = async (filters = {}) => {
  await delay(300);
  let result = events;
  if (filters.category) result = result.filter(e => e.category === filters.category);
  return { success: true, data: result, message: '', error: null };
};
```

This exact call signature and response envelope is what `apiClient.js` will return once wired to Flask — **no page or component code changes when swapping.**

**Phase 2 (backend integration):**
- `shared/services/apiClient.js` becomes a configured `axios` instance: base URL from `import.meta.env.VITE_API_BASE_URL`, request interceptor attaches JWT from `AuthContext`, response interceptor unwraps the envelope and normalizes errors.
- Each module's service files switch their internal implementation from reading local JSON to calling `apiClient.get/post/patch(...)` — function signatures and return shapes stay identical, per §2.6.
- Auth: JWT stored in memory (`AuthContext`) + `httpOnly` cookie refresh (backend-dependent, finalized when Flask auth is built) — never `localStorage` for tokens.
- Environment config: `.env.development`, `.env.production` — `VITE_API_BASE_URL`, `VITE_USE_MOCK_DATA` (boolean flag allowing instant fallback to dummy data per environment).
- AI endpoints (OpenAI/Azure OpenAI) are proxied through Flask only — frontend never calls AI providers directly.

---

## 3. Consequences

**Positive:**
- Module-prefixed routes and folder isolation make merge conflicts structurally rare — three devs touch disjoint file trees.
- Frozen entity schema + API envelope means backend integration is a service-layer swap, not a rewrite.
- Shared component promotion rule prevents premature/duplicated shared code.

**Negative / accepted tradeoffs:**
- Some short-term duplication is likely before components are promoted to `shared/` — accepted as the cost of avoiding contested early edits to shared files.
- Context API (not Redux) may need revisiting if cross-module shared state grows significantly in Phase 2 — explicitly deferred, not frozen.

---

## 4. Amendment Process

Any change to sections 2.1–2.7 (structural/contract decisions) requires:
1. A written proposal referencing this ADR.
2. Sign-off from all three developers.
3. A new ADR (`ADR-002-...`) documenting the change — this document is not edited in place.

Sections 2.8–2.10 (state/styling/integration specifics not marked FROZEN at the sub-decision level) may be revisited at Phase 2 kickoff without a full ADR, via team agreement.
