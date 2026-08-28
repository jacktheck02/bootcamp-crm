# ADR-003: Consistency strategy for persist + publish

- **Status:** Accepted (target) — **not yet implemented**
- **Date:** 2026-08-23 (original) · revised 2026-08-27 to match the build
- **Deciders:** Capstone team
- **Related backlog:** CAP-12, CAP-19
- **Related ADRs:** ADR-002 (Kafka)

## Context

A write workflow needs both a durable database write and an emitted Kafka
event. Publishing before commit risks emitting events for rows that later roll
back; skipping publication after commit loses downstream signal.

**Current build:** writes commit to PostgreSQL through the `@Transactional`
service / repository layer and **no event is published** — the producer
(`CustomerEventPublisher`) is not called from any code path. This ADR records
the strategy to adopt when the producer is wired in.

## Decision

Use an **after-commit publish** strategy:

1. Validate and persist the write inside a database transaction.
2. Publish the `CustomerEvent` only after that transaction commits, via a
   `@TransactionalEventListener(phase = AFTER_COMMIT)` (or an explicit publish
   call placed after `save(...)` returns within the service method).
3. Populate the event with a fresh `eventId` (UUID) and the request
   `correlationId`, taken from the `X-Correlation-Id` header that the frontend
   (`api/http.ts`) already sends and `GlobalExceptionHandler` already echoes.
4. Rely on consumer-side idempotency by `eventId` — already implemented in
   `CustomerEventListener` / `ProcessedEventStore`.

A transactional outbox is the post-capstone upgrade if producer failures after
commit prove to be a real problem; it is not required for this delivery.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| Publish before commit | Simple wiring | Emits events for rolled-back rows | Violates correctness |
| Dual write, no ordering | Fast to build | Inconsistent state on partial failure | Too risky for evidence |
| Transactional outbox now | Strong reliability | Extra table + relay worker | Deferred to keep the slice small |

## Consequences

- **Positive (once implemented):** the event stream never contains writes that
  did not commit; correlation id flows API → log → event.
- **Known risk:** a producer failure *after* commit leaves a committed row with
  no event. Mitigation: `KafkaTemplate` retries + error logging now; outbox
  later.
- **Gap:** until the producer is wired in (ADR-002 follow-up), this decision is
  documentation only.
- **Evidence target:** an integration test proving a `201`/`200` write implies
  exactly one `CustomerEvent` on `customer-events` with a matching
  `correlationId`.
