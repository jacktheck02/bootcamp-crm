# ADR-001: PostgreSQL as system of record

- **Status:** Accepted — implemented
- **Date:** 2026-08-23 (original) · reviewed 2026-08-27 against the build
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
- **Implementation status:** Flyway migrations `V1`–`V4` under
  `server/src/main/resources/db/migration/` create the `customers` /
  `interactions` tables and seed `CUS-1001` (Amina Khan, `ACTIVE`) and
  `CUS-1002` (Ravi Singh, `PROSPECT`). Hibernate runs with
  `spring.jpa.hibernate.ddl-auto=validate`, so the schema is owned by Flyway,
  not the entities. `spring.flyway.baseline-on-migrate=true` covers the
  pre-Flyway database in the sandbox.
- **Negative / follow-ups:** Flyway is forward-only — a code rollback across a
  destructive migration breaks the older image (see `RUNBOOK.md`). The
  `customers.version` / `updated_at` columns exist in SQL but are not mapped on
  the `Customer` entity yet.
- **NFR impact:** Enables durable write proof, queryable timeline data, and
  reproducible integration testing (Testcontainers Postgres).
- **Evidence:** `mvn verify` runs repository/controller tests against a real
  Postgres container; migration apply is logged at backend startup.