# C4 Context — Customer Management Platform

## Product outcome

- **Primary outcome:** Service agents can search customers, view profile/timeline, and record interactions with traceable evidence.
- **In scope for Week 6:** Customer search/profile, interaction recording, customer status update (`PROSPECT` to `ACTIVE`), JWT/RBAC, Kafka event publication, CI/CD and deployment evidence.
- **Explicit exclusions:** Billing, marketing campaign tooling, external CRM integrations, real PII, and production environment operations.
- **Success measure (demo):** Agent records interaction for `CUS-1001` with `lab-request-001` and proves UI -> API -> DB -> event with test/deploy evidence.

## Actors and systems (context-level only)

| Actor / system | Role | Trust boundary notes |
| -------------- | ---- | -------------------- |
| Service agent | Uses CRM UI for customer work | Untrusted client network; all writes require authenticated API calls |
| Team admin | Reviews customer lifecycle and operational status | Admin role must be authorized separately from AGENT role |
| Platform operator | Monitors health, releases, and rollback operations | Privileged operations boundary |
| CRM Platform | Provides customer search/profile/interaction services | Core system boundary; validates auth, persists records, publishes events |
| Identity provider (OIDC/JWT issuer) | Issues signed access tokens with role claims | External identity trust boundary |
| Notification/audit downstream systems | Receive CRM interaction events | External async boundary from CRM Platform |

## Context diagram

```text
External Users/Systems                              CRM Platform Boundary
+----------------------------+                     +------------------------------+
| Service Agent              | -- HTTPS + JWT --> |                              |
| Team Admin                 | -- HTTPS + JWT --> | Customer Management Platform  |
| Platform Operator          | -- Ops access ---->| (search, profile, interactions|
+----------------------------+                     | authz, persistence, events)   |
                                                   +------+-----------------------+
                                                          |            |
                                                          | OIDC/JWT   | Async events
                                                          v            v
                                               +----------------+   +----------------------+
                                               | Identity       |   | Notification/Audit   |
                                               | Provider       |   | Downstream Systems   |
                                               +----------------+   +----------------------+
```

## Protocols and trust boundaries

- Browser/API traffic uses **HTTPS** with bearer JWT.
- CRM validates token issuer, signature, and role claims from the IdP.
- Event consumers are outside the primary request path and receive versioned events asynchronously.
- Internal platform details (React, API, DB, Kafka internals) are documented in `docs/architecture/container.md`.

## Fixture anchors (must appear in demo stories)

| ID | Name | Notes |
| -- | ---- | ----- |
| `CUS-1001` | Amina Khan | `ACTIVE` - primary interaction demo |
| `CUS-1002` | Ravi Singh | `PROSPECT` to `ACTIVE` status change |
| `CUS-9999` | - | not-found and validation/error paths |
| `lab-request-001` | - | correlation ID carried API -> logs -> events |