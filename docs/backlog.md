# Prioritized backlog — Week 6 CRM

## Prioritization rules

1. Vertical slices first: each top item must produce demonstrable user value.
2. Enablers must explicitly unlock a vertical item.
3. No new scope after the security/release phase begins.

## Backlog

| ID | Priority | Phase target | Story | Acceptance criteria (summary) | Owner |
| -- | -------- | ------------ | ----- | ------------------------------ | ----- |
| CAP-12 | P0 | Phase 2 | As an agent, I can record an interaction for `CUS-1001` so history is preserved for the next agent. | `POST /api/v1/interactions` returns 201 for valid payload, persists row, emits `CustomerInteractionRecordedV1`, preserves `lab-request-001`. | Backend lead |
| CAP-13 | P0 | Phase 3 | As an agent, I can search and open customer profile for `CUS-1001` and `CUS-1002`. | UI search finds fixture customers and profile page loads from API data. | Frontend lead |
| CAP-14 | P0 | Phase 3 | As an agent, I can view timeline including the interaction created in CAP-12. | Timeline displays persisted interaction after refresh, with timestamp and type. | Full-stack pair |
| CAP-15 | P1 | Phase 3 | As an agent, I can update customer status from `PROSPECT` to `ACTIVE`. | Valid update persists in DB and reflects in UI; invalid transition blocked with clear error. | Backend lead |
| CAP-16 | P0 | Phase 4 | As a platform operator, I enforce JWT and role-based access for CRM endpoints. | Protected endpoints return 401 without token and 403 for wrong role; AGENT and ADMIN routes documented. | Security owner |
| CAP-17 | P0 | Phase 4 | As a team, we can build/test/scan in CI before deploy. | GitHub Actions gates pass (build, tests, lint/scan) and artifact links are captured in evidence index. | DevOps owner |
| CAP-18 | P0 | Phase 4 | As a team, we can deploy and rollback safely in k3s. | Digest-pinned deployment succeeds, smoke tests pass, rollback rehearsal completes <= 10 minutes. | DevOps owner |
| CAP-19 | P1 | Phase 2-4 | As a developer, I can trace a request by correlation ID across logs and events. | `lab-request-001` appears in API logs and emitted event payload. | Observability owner |
| CAP-20 | P1 | Phase 2 | As a maintainer, I can apply schema changes repeatably. | Versioned migration creates required tables and runs in CI/integration tests. | Backend lead |
| CAP-21 | P2 | Phase 5 | As a stakeholder, I can review a reproducible defense packet. | Evidence index links demo claims to tests, pipeline runs, deploy proof, and known risks. | PM/facilitator |

## Dependency notes

- CAP-12 must complete before CAP-14.
- CAP-13 enables CAP-14 and CAP-15 in the UI.
- CAP-16 gates CAP-18 production-style acceptance.
- CAP-17 gates CAP-18 promotion/deploy flow.
