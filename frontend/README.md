# Northstar CRM Frontend

React 19 + TypeScript + Vite single-page app for the Bootcamp CRM. It talks to
the Spring Boot API in `../server` (or to an in-browser mock).

## Agent journey

1. Sign in (`agent1` / `agent1`, or `admin1` / `admin1`).
2. Search customers by name, email, or customer ID.
3. Select a customer and view the profile.
4. View the customer's interaction history.
5. Add an interaction.
6. Add a customer, then select the newly-created customer.
7. Edit a customer's full name, email, phone, or status.
8. Save or cancel customer edits.
9. Get field-level validation feedback for invalid customer data.
10. See loading, empty, and error states.
11. Keep working with the backend down by enabling mock mode.

Status changes are accepted by the UI for any user; the backend rejects them
with 403 unless the signed-in user is `admin1`.

## Requirements

Node.js 20.19+ or 22.12+ (Vite 8). CI uses Node 22.

```bash
node --version
npm --version
```

## Install

```bash
npm install
```

## Environment

Copy `.env.example` to `.env` and adjust as needed. Restart Vite after any change.

| Variable | Default | Meaning |
| -------- | ------- | ------- |
| `VITE_USE_MOCK_API` | `false` | `true` serves all data from `src/api/mockApi.ts` — no backend needed. |
| `VITE_API_BASE_URL` | `/api` | Prefix for API calls. Left as `/api` so the Vite dev proxy (and prod nginx) can route to the backend. |

## Run (dev)

```bash
npm run dev
```

Open the URL Vite prints (`http://localhost:5173`). With `VITE_USE_MOCK_API=false`
the dev server proxies `/api` to `http://localhost:8080`.

## Test

```bash
npm run test -- --run   # or: npm run test:run
```

## Build

```bash
npm run build            # tsc -b && vite build
```

## Example payloads

Create customer (`POST /customers`):

```json
{
  "fullName": "Amina Khan",
  "email": "amina.khan@example.com",
  "phone": "555-1001",
  "status": "ACTIVE"
}
```

`fullName`, `email`, and `status` are required. The server assigns the public
`id` (`CUS-1001`, …). Update uses the same shape.

Create interaction (`POST /customers/{id}/interactions`):

```json
{
  "type": "CALL",
  "summary": "Followed up with customer"
}
```

## Auth / token handling

- `src/security/auth.ts` is the live auth module. On login it stores the bearer
  token in `localStorage` under `crm:accessToken`; `src/api/http.ts` attaches it
  as `Authorization: Bearer …` and always sends `X-Correlation-Id: lab-request-001`.
- `getUser()` derives `{username, role}` by splitting the
  `lab.<username>.<role>.<sig>` token — it is not independently verified client
  side.
- `src/security/tokenStore.ts` is a deliberately memory-only token holder kept
  as a reference implementation (and covered by `tokenStore.test.ts`); the app
  does **not** currently use it. Moving auth onto it would remove the token from
  browser storage.

## Security boundary

Do not put backend secrets in Vite env vars — anything `VITE_*` is compiled into
client code. No database, Kafka, or JWT signing secrets belong here.

## Project structure

```text
src/
├── api/
│   ├── ApiError.ts
│   ├── crmApi.ts        # real vs mock dispatch + endpoint paths
│   ├── http.ts          # fetch wrapper: base URL, auth header, error mapping
│   └── mockApi.ts       # in-browser fake backend
├── components/
│   ├── CustomerEditForm.tsx
│   ├── CustomerForm.tsx
│   ├── CustomerList.tsx
│   ├── CustomerProfile.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   ├── InteractionForm.tsx
│   ├── LoadingState.tsx
│   ├── LoginState.tsx
│   └── StatusBadge.tsx
├── security/
│   ├── auth.ts          # login/logout, token in localStorage (in use)
│   └── tokenStore.ts    # memory-only holder (reference, not wired up)
├── types/
│   └── crm.ts
├── utils/
│   └── validateCustomerDraft.ts
├── test/                # Vitest + Testing Library suites + setup.ts
├── App.tsx
├── main.tsx
└── styles.css
```

## What the tests cover

`src/test/` runs under Vitest + Testing Library (jsdom):

- **Customer journey:** seeded customers render, profiles load, interactions
  load, a customer can be selected (`App.test.tsx`, `CustomerList.test.tsx`,
  `CustomerProfile.test.tsx`).
- **Creation:** form opens, fields render, full name required, email required
  and valid, valid customer created, cancel works (`CustomerForm.test.tsx`).
- **Editing:** existing values load, each field editable, validation, cancel
  (`CustomerEditForm.test.tsx`).
- **Interactions:** form submits and the timeline updates
  (`InteractionForm.test.tsx`, `CustomerProfile.test.tsx`).
- **Login:** success routes to the app; a 401 shows "invalid credentials", logs
  the error, and stays on the login screen (`Login.test.tsx`).
- **States & a11y:** loading / empty / error components, labeled form fields,
  semantic buttons, selected-row state (`LoadingState`, `EmptyState`,
  `ErrorState`, `StatusBadge` tests).
- **Token holder:** `tokenStore.test.ts` verifies the memory-only helper never
  writes to `localStorage` / `sessionStorage`.
- **Mock API:** `mockApi.test.ts` exercises the fake backend.
