# NFRs — Customer Management Platform

Targets for the CRM slice, with current status. Endpoints and environments
match the build (`POST /customers/{id}/interactions`, OpenShift Developer
Sandbox).

| Category | Target | How measured | Status |
| -------- | ------ | ------------ | ------ |
| Latency (interaction create) | p95 ≤ 400 ms for `POST /customers/{id}/interactions` over 200 requests | k6/JMeter run against local Docker + backend | Not measured |
| AuthN enforcement | Unauthenticated request to a protected route returns `401`; bad role returns `403` | Spring Security integration tests + curl evidence | **Partial** — only `/api/admin/**` and non-customer routes require auth today; customer routes are `permitAll`. A status change without `ROLE_ADMIN` does return `403`. |
| Data durability | 100% of successful interaction writes are present in PostgreSQL after the API responds | Integration test asserts API response + SQL row | Met — covered by Testcontainers repository/controller tests |
| Event publication | 100% of successful writes publish exactly one `CustomerEvent` with a matching `correlationId` | Integration test comparing DB row and event payload | **Not met** — producer not wired (ADR-002/003) |
| Availability / health | `/actuator/health` is `UP` during a demo; smoke check passes on every deploy | Deploy smoke step in `build.yml` | Met for deploys |
| Recovery | Failed deploy rolls back automatically to the previous revision | `oc rollout undo` in the pipeline's failure path | Met (automated); RTO not timed |
| Traceability | Write requests carry a correlation id that appears in API logs and (later) the event payload | Log assertions + evidence sample | **Partial** — frontend sends `X-Correlation-Id`; backend echoes it into error bodies and the consumer logs it; not yet in success responses or a published event |
| Accessibility | Core workflow is keyboard-operable with visible focus and labeled fields; no critical axe violations | axe/Lighthouse + manual keyboard walkthrough; component tests assert labels/roles | Partial — a11y assertions exist in the Vitest suite; no axe/Lighthouse run |
| Privacy / data handling | No real PII in the repo; synthetic fixtures only | Repo scan + PR review; CI runs CodeQL and OWASP dependency-check | Met — fixtures are synthetic |

## Notes

- "Environment" for latency/durability tests is local Docker Compose
  (`postgres` + `kafka`) with the backend run from `./mvnw spring-boot:run`.
- Security integration tests run in CI via `./mvnw verify` (Testcontainers).
- The deploy target is the OpenShift Developer Sandbox; see `RUNBOOK.md` and
  `docs/adrs/ADR-005-openshift-deploy.md`.
