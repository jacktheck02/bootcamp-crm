# ADR-002: Kafka for interaction events

- **Status:** Accepted
- **Date:** 2026-08-23
- **Deciders:** Capstone team
- **Related backlog:** CAP-12, CAP-19

## Context

The capstone rubric requires event and audit evidence beyond synchronous REST behavior.
Interaction writes must be traceable to asynchronous processing, and the team must demonstrate resilient consumer behavior.
Kafka is already provisioned in local infrastructure and supported by project dependencies.

## Decision

We will publish versioned interaction events to **Kafka** after a successful transactional write (strategy defined in ADR-003).
Primary topic naming for this slice: `crm.interactions.events.v1`.
Consumer group for downstream processing: `crm-notifications`.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| Sync-only REST | Simple | Couples consumers | Misses Week 4 messaging skills |
| DB polling | No broker | Lag / load | Not preferred |
| Outbox later | Strong consistency | Extra tables | Optional stretch |

## Consequences

- **Positive:** Traceable `lab-request-001` across API → topic
- **Negative / follow-ups:** Idempotent consumer, DLT, and retry handling during the interaction implementation phase
- **NFR impact:** Supports traceability and asynchronous processing expectations
- **Evidence later steps will need:** topic message + consumer/DLT notes