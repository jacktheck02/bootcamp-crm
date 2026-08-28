# Domain and contracts

Describes the HTTP and event contracts **as built**. Where the current code
differs from the original capstone plan (`POST /api/v1/interactions`, a
`CustomerInteractionRecordedV1` event), the built behaviour is what is
documented here and the plan is called out as a follow-up.

## Domain model

### Customer

| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | string | Public id `CUS-####`, unique. Server-assigned on create; clients never set it. |
| `fullName` | string | Required, non-null. |
| `email` | string | Required, valid email, unique in the database. |
| `phone` | string | Optional. |
| `status` | enum | One of `PROSPECT`, `ACTIVE`, `SUSPENDED`, `CLOSED`. |

The internal numeric primary key is not exposed on the API.

### Interaction

| Field | Type | Rules |
| ----- | ---- | ----- |
| `interactionId` | string | Server-assigned. |
| `customerId` | string | Owning customer's public id. |
| `type` | string | Free text today (`CALL`, `EMAIL`, `MEETING`, `NOTE` by convention; not enum-validated server side). |
| `summary` | string | Free text; persisted up to 200 chars. |
| `createdAt` | timestamp | Server-assigned (`OffsetDateTime`, UTC). |

## HTTP contract

Base: the API is served at both `/…` and `/api/…` for customer routes
(`CustomerController` is mapped to `/customers` and `/api/customers`). Auth and
admin routes are under `/api` only. The deployed nginx forwards `/api/` and
`/customers` to the backend; the Vite dev proxy forwards `/api` and strips the
prefix.

All requests from the frontend carry `X-Correlation-Id: lab-request-001`
(`frontend/src/api/http.ts`). The backend echoes that header into error
response bodies (see Error shape); it is not currently added to success
responses or validated against the payload.

### Auth

`POST /api/auth/login`

```json
// request
{ "username": "agent1", "password": "agent1" }

// 200
{ "accessToken": "lab.agent1.AGENT.1a2b3c", "tokenType": "Bearer" }

// 401
{ "message": "Invalid credentials" }
```

Send the token as `Authorization: Bearer <accessToken>` on later requests.
Seeded users: `agent1` (role `AGENT`), `admin1` (role `ADMIN`).

### Customers

| Method & path | Body | Success | Errors |
| ------------- | ---- | ------- | ------ |
| `GET /customers?q=<term>` | – | `200` `Customer[]` (substring match on id/name/email; all customers if `q` blank) | – |
| `GET /customers/paginated?status=<S>&page=<n>&size=<n>` | – | `200` Spring `Page<Customer>` (`status` defaults to `ACTIVE`, `page` `0`, `size` `20`) | `400` if `status` is not a valid enum |
| `POST /customers` | `Customer` (`fullName`, `email`, `phone?`, `status`) | `200` the created `Customer` with assigned `id` | `400` on validation failure |
| `GET /customers/{id}` | – | `200` `Customer` | `404` if `id` unknown |
| `PUT /customers/{id}` | `Customer` (`fullName`, `email`, `phone?`, `status`) | `200` the updated `Customer` | `404` unknown id; `403` if `status` changes and caller is not `ROLE_ADMIN`; `400` on validation failure |

### Interactions

| Method & path | Body | Success | Errors |
| ------------- | ---- | ------- | ------ |
| `GET /customers/{id}/interactions` | – | `200` `Interaction[]`, newest first | `404` unknown customer |
| `POST /customers/{id}/interactions` | `{ "type": "...", "summary": "..." }` | `201` the created `Interaction` | `404` unknown customer |

### Admin / ops

| Method & path | Auth | Response |
| ------------- | ---- | -------- |
| `GET /api/admin/ping` | any authenticated user | `200` `{ "role": "ADMIN", "ok": "true" }` (static payload) |
| `GET /actuator/health` | public | `200` `{ "status": "UP" }` |

### Error shape (`GlobalExceptionHandler`)

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "correlationId": "lab-request-001",
  "violations": [
    { "field": "email", "message": "must be a well-formed email address" }
  ]
}
```

`violations` is present only for `400` validation errors. `correlationId` is
present only when the request sent `X-Correlation-Id`. Status mapping:
validation → `400`, `IllegalArgumentException` (e.g. unknown customer) → `404`,
`IllegalStateException` → `409`, `AccessDeniedException` → `403`, anything
else → `500` with a generic message.

## Current auth enforcement

- `permitAll`: `/api/auth/**`, `/actuator/**`, `/health`, `/`, and — for now —
  every `/customers/**` and `/api/customers/**` route.
- `authenticated()` (any role): everything else, including `/api/admin/**`.
- Role enforcement exists in exactly one place: a customer **status** change
  requires `ROLE_ADMIN`.

Moving the customer routes behind `authenticated()` and adding real admin-route
rules is tracked in `docs/adrs/ADR-004-jwt-rbac.md`.

## Event contract (planned — not yet emitted)

The backend has a Kafka **consumer** and an unused **producer**. No event is
published on any write today. When the producer is wired in
(`docs/adrs/ADR-003-consistency-after-commit.md`):

- **Payload:** `com.pnc.crm.event.CustomerEvent` —
  `eventId`, `eventType`, `eventVersion`, `occurredAt`, `customerId`,
  `correlationId`, `source`, `data { fullName, status }`.
- **Topic:** `customer-events` (`crm.kafka.customer-events-topic`).
- **Key:** `customerId`, for per-customer partition ordering.
- **Consumer:** group `customer-events-consumer`; rejects key/`customerId`
  mismatches; idempotent by `eventId` via `ProcessedEventStore`.

## Compatibility and versioning policy

- Additive changes to request/response/event payloads are backward compatible.
- Breaking changes require a versioned path (`/api/v2/...`) and, for events, a
  new `eventVersion` and/or topic suffix.
- Event consumers must be idempotent by `eventId`.

## Ownership

- **Primary owner:** Backend lead
- **Supporting owners:** Frontend lead, Messaging owner
- **Related ADRs:** ADR-002 (Kafka), ADR-003 (persist/publish consistency),
  ADR-004 (token auth / RBAC)
- **Related backlog:** CAP-12, CAP-14, CAP-19
