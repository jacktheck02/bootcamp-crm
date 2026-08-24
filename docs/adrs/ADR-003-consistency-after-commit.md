# ADR-003: Consistency strategy for persist + publish

- **Status:** Accepted
- **Date:** 2026-08-23
- **Deciders:** Capstone team
- **Related backlog:** CAP-12, CAP-19

## Context

The interaction workflow requires both a durable database write and an emitted Kafka event.
If the event is published before commit, consumers may observe data that is later rolled back.
If publication is omitted after commit, downstream systems lose audit/notification signals.

## Decision

For Week 6, we will use an **after-commit publish** strategy:

1. Validate and persist interaction data in a database transaction.
2. Publish `CustomerInteractionRecordedV1` only after successful commit.
3. Include `correlationId` and unique event ID for idempotent consumer handling.

Outbox pattern is documented as a post-capstone improvement, not required for this delivery.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| Publish before commit | Simple wiring | Can emit invalid events on rollback | Violates data correctness |
| Dual write without transaction coordination | Fast initial build | Inconsistent state risk | Too risky for evidence requirements |
| Transactional outbox now | Strong reliability model | Additional schema and worker complexity | Deferred due to Week 6 timebox |

## Consequences

- **Positive:** Keeps event stream aligned with committed source-of-truth data.
- **Negative / follow-ups:** Producer failures after commit require retry strategy and monitoring.
- **NFR impact:** Improves traceability and consistency evidence across implementation, integration, and release phases.
- **Evidence later steps will need:** test proving 201 response implies DB row + one emitted event.
