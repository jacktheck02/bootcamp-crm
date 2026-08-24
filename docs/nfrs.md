# NFRs — Customer Management Platform (Week 6 targets)

| Category | Target | How measured | Environment |
| -------- | ------ | ------------ | ----------- |
| Latency (p95 interaction create) | p95 <= 400 ms for `POST /api/v1/interactions` over 200 requests | k6 or JMeter run; compute p95 from run report | Local Docker + backend on dev laptop |
| Security authn/authz | Unauthenticated `POST /api/v1/interactions` returns 401; AGENT token on admin route returns 403 | Spring security integration tests + manual curl evidence during security rollout | CI and local |
| Data durability | 100% of successful interaction writes are present in PostgreSQL after API 201 response | Integration test verifies API response + SQL row existence | Testcontainers (Postgres) |
| Event publication correctness | 100% of successful writes publish exactly one `CustomerInteractionRecordedV1` with matching correlation ID | Integration test or consumer probe comparing DB row and event payload | Testcontainers (Kafka + Postgres) |
| Availability / health | `/actuator/health` is UP during demo; smoke endpoint pass rate >= 99% in 50 consecutive checks | Smoke script and pipeline artifact logs | k3s deployment target |
| Recovery time objective | Rollback to prior release within <= 10 minutes after failed smoke test | Timed rollback rehearsal with command transcript/screenshots | k3s + CI pipeline |
| Observability traceability | 100% of write requests include and log correlation ID; ID appears in API log and event payload | Log assertion tests + log sample in evidence pack | Local and k3s |
| Accessibility | Core workflow is keyboard-operable with visible focus and labeled form fields; no critical axe violations | axe/Lighthouse report + manual keyboard walkthrough | Chrome latest |
| Privacy / data handling | No real PII committed; synthetic fixture emails only (`*.example.test`) | Repo scan + PR checklist + reviewer sign-off | GitHub PR and CI |