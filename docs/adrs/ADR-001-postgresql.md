# ADR-001: PostgreSQL as system of record

- **Status:** Accepted
- **Date:** 2026-08-23
- **Deciders:** Capstone team
- **Related backlog:** CAP-12, CAP-14, CAP-15, CAP-20

## Context

Week 6 requires durable evidence of customer and interaction persistence, plus repeatable verification from API to database.
The core workflow needs relational integrity between customer and interaction records, queryable timeline views, and transaction safety for writes.
The project already includes PostgreSQL in local compose infrastructure and Spring Data JPA dependencies.

## Decision

We will use **PostgreSQL** as the system of record for customer and interaction data in the Week 6 CRM.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| H2 only | Fast local | Not production-like | Fail for end-to-end durability proof |
| Document DB | Flexible docs | Weak relational joins | Overkill for this slice |
| Files / JSON | Simple | No concurrency / query | Not enterprise CRM |

## Consequences

- **Positive:** Aligns with the production-style relational data model and supports re-usable migrations
- **Negative / follow-ups:** Need migrations and secure connection handling during the release phase
- **NFR impact:** Enables durable write proof, queryable timeline data, and reproducible integration testing
- **Evidence later steps will need:** migration apply proof, SQL row for `CUS-1001`