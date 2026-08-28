# C4 Container — Customer Management Platform

Reflects the system as built. "Planned" marks designed-but-not-implemented
behaviour.

## Containers

| Container | Responsibility | Tech | Data / topics |
| --------- | -------------- | ---- | ------------- |
| `frontend` | Agent UI: login, search, profile, timeline, create/edit, interactions | React 19 + TypeScript + Vite; served by nginx-unprivileged in the sandbox | Calls the API only; can run fully on an in-browser mock (`VITE_USE_MOCK_API`) |
| `backend` | HTTP API, validation, token auth, RBAC on status changes, persistence | Spring Boot 4 + Spring Security + Spring Data JPA + Flyway | JDBC → PostgreSQL; Kafka consumer wired, producer present but unused |
| `postgres` | System of record for customers and interactions | PostgreSQL 16 | `customers`, `interactions`, `flyway_schema_history`; 1Gi PVC in the sandbox |
| `kafka` | Event transport | Kafka 3.9, single-node KRaft (custom image in the sandbox) | topic `customer-events` |
| Kafka consumer | Idempotent handler for customer events (in-process in `backend`) | Spring `@KafkaListener` | group `customer-events-consumer`; in-memory processed-event store |
| Actuator | Health for probes and the deploy smoke test | Spring Boot Actuator | `/actuator/health` |

There is no separate notification worker and no external identity provider in
the current build; the consumer runs inside the backend process, and tokens are
issued by the backend itself.

## Sync and async paths

1. **User journey (sync):** `frontend` → `backend` REST over a bearer token.
   Customer/interaction routes are currently open; `/api/admin/**` requires
   authentication; a customer status change requires `ROLE_ADMIN`.
2. **Write path:** `backend` validates, then writes to `postgres`. `create` on
   the customer service is `@Transactional`; the controller's direct
   `repository.save(...)` calls run in their own transaction.
3. **Async event path (planned):** after a successful commit, `backend` would
   publish a `CustomerEvent` to `customer-events`. Not implemented — the
   producer is never called.
4. **Consumer path:** the `@KafkaListener` validates the message key against
   `customerId`, deduplicates by `eventId`, and logs the correlation id. It has
   a test hook (`eventId == "bad-event-1"` throws) for error-handling tests.

## Data flow — record an interaction (as built)

1. Agent submits the interaction form; `frontend` sends
   `POST /customers/{id}/interactions` with `{type, summary}` and
   `X-Correlation-Id: lab-request-001`.
2. `backend` resolves the customer by public id (`404` if unknown).
3. `backend` saves the interaction with a server-set `createdAt` and returns
   `201` with `{interactionId, customerId, type, summary, createdAt}`.
4. `frontend` prepends the new interaction to the timeline and adds an entry to
   the in-session activity trail.
5. **Planned:** `backend` emits `CustomerEvent` after commit; the consumer
   records a downstream action.

## References

- Wire contracts: `docs/architecture/domain-contracts.md`
- Deployment: `RUNBOOK.md`

## Decisions (ADRs)

- Database choice: `docs/adrs/ADR-001-postgresql.md`
- Messaging choice: `docs/adrs/ADR-002-kafka.md`
- Persist/publish consistency: `docs/adrs/ADR-003-consistency-after-commit.md`
- Authentication/authorization: `docs/adrs/ADR-004-jwt-rbac.md`
- Deployment approach: `docs/adrs/ADR-005-openshift-deploy.md`
