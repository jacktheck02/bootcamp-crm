# C4 Context — Customer Management Platform

Reflects the system as built. "Planned" marks capability that is designed but
not yet implemented.

## Product outcome

- **Primary outcome:** service agents sign in, search customers, view a
  profile and interaction timeline, edit customers, and record interactions.
- **Built:** login + lab-grade bearer token, customer CRUD + search, interaction
  list/create, admin-only customer status changes, Flyway-managed schema, CI
  (build/test/scan) and deploy to the OpenShift Developer Sandbox.
- **Planned / partial:** deny-by-default auth on all customer routes (today
  they are open); Kafka domain-event publication on write (consumer exists,
  producer not wired); real signed JWT with issuer validation.
- **Explicit exclusions:** billing, marketing/campaign tooling, external CRM
  integrations, real PII, multi-tenant concerns.
- **Fixtures:** `CUS-1001` (Amina Khan, `ACTIVE`) and `CUS-1002` (Ravi Singh,
  `PROSPECT`) are seeded by migration `V4`.

## Actors and systems

| Actor / system | Role | Trust boundary notes |
| -------------- | ---- | -------------------- |
| Service agent (`agent1`) | Day-to-day customer work in the CRM UI | Untrusted client; authenticates via `POST /api/auth/login`, then sends a bearer token |
| Team admin (`admin1`) | Same, plus customer status changes | `ROLE_ADMIN` is required for status changes; enforced in the API |
| Platform operator | Runs deploys, watches health, performs rollbacks | Privileged; uses `oc` against the sandbox, not the app UI |
| CRM Platform | Customer/interaction services, auth, persistence | Core system boundary |
| Kafka + consumer | Transports domain events to downstream handlers | Async boundary, internal to the platform today |

There is **no external identity provider**. Tokens are issued by the CRM API
itself (`JwtService`) and are lab-grade, not standards-compliant JWTs — see
`docs/adrs/ADR-004-jwt-rbac.md`.

## Context diagram

```text
+------------------------+           CRM Platform boundary
|  Service Agent         | --HTTP--> +--------------------------------+
|  Team Admin            |  bearer   |  Customer Management Platform   |
+------------------------+  token    |  (React SPA + Spring Boot API)  |
                                     |  auth · CRUD · interactions     |
+------------------------+           +------+------------------+-------+
|  Platform Operator     | --oc/CLI-------->|                  |
+------------------------+                  v                  v
                                     +-------------+   +------------------+
                                     | PostgreSQL  |   | Kafka + consumer |
                                     | (of record) |   | (events: planned)|
                                     +-------------+   +------------------+
```

## Protocols and trust boundaries

- Browser ↔ API is HTTP with a bearer token (HTTPS in the deployed sandbox via
  an edge-terminated Route).
- The API validates the token's lab signature and maps the role claim to a
  `ROLE_*` authority. It does not validate an external issuer.
- Event consumers are outside the request path and (once producing is wired up)
  receive versioned events asynchronously.
- Internal container detail is in `docs/architecture/container.md`; wire
  contracts are in `docs/architecture/domain-contracts.md`.

## Fixture anchors

| ID | Name | Notes |
| -- | ---- | ----- |
| `CUS-1001` | Amina Khan | `ACTIVE` — primary demo customer |
| `CUS-1002` | Ravi Singh | `PROSPECT` — status-change demo |
| `CUS-9999` | – | unknown id → `404` / error-path demo |
| `lab-request-001` | – | correlation id the frontend sends on every request |
