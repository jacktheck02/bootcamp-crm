# Backlog — CRM slice

Prioritized stories with current status against the build.

## Prioritization rules

1. Vertical slices first: each top item must produce demonstrable user value.
2. Enablers must explicitly unlock a vertical item.
3. No new scope after the security/release phase begins.

## Backlog

| ID | Priority | Story | Acceptance (summary) | Status |
| -- | -------- | ----- | -------------------- | ------ |
| CAP-12 | P0 | As an agent, I can record an interaction for a customer so history is preserved. | `POST /customers/{id}/interactions` returns `201`, persists the row, returns it with `createdAt`. | **Done** for the API + UI. Event emission (`CustomerEvent`) still **pending** — see CAP-19. |
| CAP-13 | P0 | As an agent, I can search and open a customer profile. | UI search finds `CUS-1001` / `CUS-1002`; profile loads from API data. | Done |
| CAP-14 | P0 | As an agent, I can view a timeline including a newly created interaction. | Timeline shows persisted interactions newest-first with type and timestamp. | Done |
| CAP-15 | P1 | As an agent/admin, I can update customer status. | Valid update persists and reflects in the UI; status change requires `ROLE_ADMIN` (else `403`). | Done |
| CAP-16 | P0 | As a platform operator, I enforce token auth and role-based access for CRM endpoints. | Protected endpoints return `401` without a token and `403` for the wrong role; route matrix documented. | **Partial** — token auth + admin status-change RBAC done; customer routes still `permitAll`; token is not a signed JWT. ADR-004. |
| CAP-17 | P0 | As a team, we build/test/scan in CI before deploy. | GitHub Actions gates pass: `mvn verify` (Testcontainers), frontend build/test, OWASP dependency-check, CodeQL. | Done (`.github/workflows/build.yml`) |
| CAP-18 | P0 | As a team, we can deploy and roll back safely. | Deploy to the OpenShift sandbox succeeds, smoke test passes, failed deploys auto-roll-back one revision. | Done. Images are SHA-tagged, not digest-pinned (ADR-005). |
| CAP-19 | P1 | As a developer, I can trace a request by correlation id across logs and events. | `lab-request-001` appears in API logs and the emitted event payload. | **Partial** — frontend sends it; backend echoes it into error bodies and the consumer logs it; no published event yet. ADR-003. |
| CAP-20 | P1 | As a maintainer, I can apply schema changes repeatably. | Versioned migration creates the required tables and runs in CI/integration tests. | Done (Flyway `V1`–`V4`, `ddl-auto=validate`) |
| CAP-21 | P2 | As a stakeholder, I can review a reproducible evidence packet. | Evidence index links demo claims to tests, pipeline runs, deploy proof, and known risks. | Open |

## Dependency notes

- CAP-12 completed before CAP-14.
- CAP-13 enabled CAP-14 and CAP-15 in the UI.
- CAP-16 (deny-by-default) and CAP-19 (event + correlation) are the main open
  threads; both are tracked in ADRs 002–004.
- CAP-17 gates CAP-18's deploy flow.
