# C4 Container — Customer Management Platform

## Containers

| Container | Responsibility | Tech | Data store / topics |
| --------- | -------------- | ---- | ------------------- |
| `crm-web` | Service-agent UI for search, profile, timeline, and interaction capture | React + TypeScript + Vite | Calls API only |
| `crm-api` | API contract, validation, authorization, transactions, publish events after commit | Spring Boot + Spring Security + Spring Data JPA | JDBC -> PostgreSQL, Kafka producer |
| `crm-db` | Source of truth for customers and interactions | PostgreSQL 16 | `customers`, `interactions`, migration history |
| `crm-events` | Transport versioned domain/audit events to subscribers | Kafka 3.9 | `crm.interactions.events.v1`, `crm.audit.events.v1` |
| `crm-notify-worker` | Consumes interaction events for downstream notifications/audit processing | Spring Kafka consumer | group: `crm-notifications`, DLT topics |
| `idp` | Issues JWT tokens and role claims (`AGENT`, `ADMIN`) | OIDC-compatible IdP | signing keys/metadata |
| `obs` | Health, logs, metrics, request correlation evidence | Actuator + structured logs + pipeline artifacts | log stream, metrics time series |

## Sync and async paths

1. **Sync path (user journey):** Agent -> `crm-web` -> `crm-api` REST endpoints (JWT protected).
2. **Transactional write path:** `crm-api` validates request, writes to `crm-db` in a transaction.
3. **Async event path:** After successful commit, `crm-api` publishes `CustomerInteractionRecordedV1` to `crm.interactions.events.v1`.
4. **Consumer path:** `crm-notify-worker` consumes events idempotently; poison messages route to DLT.

## Data flow (CAP-12 interaction create)

1. Agent submits `POST /api/v1/interactions` with `X-Correlation-ID: lab-request-001`.
2. API authenticates token, authorizes role, validates payload.
3. API persists interaction for `CUS-1001` in PostgreSQL.
4. API emits `CustomerInteractionRecordedV1` with customer ID and correlation ID.
5. Consumer receives event and records notification/audit action; failures go to DLT.

## Contract reference

- HTTP and event payload definitions: `docs/architecture/domain-contracts.md`

## Open decisions tracked in ADRs

- Database choice: `docs/adrs/ADR-001-postgresql.md`
- Messaging choice: `docs/adrs/ADR-002-kafka.md`
- Persist/publish consistency: `docs/adrs/ADR-003-consistency-after-commit.md`
- Authentication/authorization: `docs/adrs/ADR-004-jwt-rbac.md`
- Deployment approach: `docs/adrs/ADR-005-k3s-digest-deploy.md`