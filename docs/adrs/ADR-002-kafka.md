# ADR-002: Kafka for CRM domain events

- **Status:** Accepted — consumer implemented, producer not yet wired
- **Date:** 2026-08-23 (original) · revised 2026-08-27 to match the build
- **Deciders:** Capstone team
- **Related backlog:** CAP-12, CAP-19
- **Related ADRs:** ADR-003 (persist/publish consistency)

## Context

The capstone requires event and audit evidence beyond synchronous REST. Kafka
is already provisioned locally and the Spring for Apache Kafka starter is on the
backend classpath. This ADR records what the current build actually does, which
differs from the original plan (topic naming, event name, consumer group).

## Decision

Use **Kafka (KRaft, single node)** for CRM domain events.

### Broker

- Local: `apache/kafka:3.9.1` from `compose.yaml`, KRaft mode, listener on
  `kafka:9092` (in-network) and `localhost:9094` (host debugging).
- Sandbox: a project-built image from `deploy/images/kafka` (stock
  `apache/kafka` is not writable under OpenShift's arbitrary UID). Single node,
  ephemeral storage, heap capped for quota.

### Topic and event contract

- Topic: **`customer-events`**, configurable via
  `crm.kafka.customer-events-topic` (`application.yaml`).
- Consumer group: **`customer-events-consumer`** (`spring.kafka.consumer.group-id`).
- Event payload: `com.pnc.crm.event.CustomerEvent` (Java record) —
  `eventId`, `eventType`, `eventVersion`, `occurredAt`, `customerId`,
  `correlationId`, `source`, and `data { fullName, status }`.
- Producer key: `customerId`, so all events for a customer land on one
  partition and stay ordered (`CustomerEventPublisher`).

### Consumer behaviour (`CustomerEventListener`)

1. Reject messages whose Kafka key does not equal `event.customerId()`.
2. Idempotency: `ProcessedEventStore.markIfNew(eventId)` — duplicates are
   logged and skipped. The store is in-memory today.
3. Log `eventId` / `customerId` / `correlationId` without PII.
4. Test hook: `eventId == "bad-event-1"` throws, to exercise error handling in
   integration tests.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| Sync-only REST | Simple | Couples consumers to the API | Misses the messaging requirement |
| DB polling / outbox reader now | No broker coupling | Extra tables and a worker | Deferred (see ADR-003) |
| Managed Kafka (MSK/Confluent) | No broker ops | Cost, external dependency | Out of scope for a sandbox capstone |

## Consequences

- **Positive:** Consumer contract, keying, and idempotency are implemented and
  testable with Testcontainers (`testcontainers-kafka`).
- **Deviations from the original plan:** topic is `customer-events` (not
  `crm.interactions.events.v1`); group is `customer-events-consumer` (not
  `crm-notifications`); the event is a general customer event, not
  `CustomerInteractionRecordedV1`; there is no dead-letter topic yet.
- **Gap:** `CustomerEventPublisher` is never called. No event is emitted on any
  create/update/interaction write, so the async path is not yet demonstrable
  end to end.
- **Follow-ups:** wire the producer into the write path (ADR-003); add a DLT and
  consumer retry/backoff; create the topic explicitly instead of relying on
  broker auto-create; persist `ProcessedEventStore` so idempotency survives a
  restart.
