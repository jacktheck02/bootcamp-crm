# ADR-005: Deploy to the OpenShift Developer Sandbox from CI

- **Status:** Accepted (supersedes the original "k3s + digest-pinned images" decision)
- **Date:** 2026-08-23 (original) · revised 2026-08-27 to match the build
- **Deciders:** Capstone team
- **Related backlog:** CAP-17, CAP-18
- **Operations detail:** `RUNBOOK.md`

## Context

The capstone needs reproducible deployment with smoke checks and rollback
evidence. The original ADR targeted a self-managed k3s cluster with
digest-pinned images. The team instead deployed to the **OpenShift Developer
Sandbox** because it is free, managed, and hands back a public HTTPS route with
no cluster to run. This ADR records the approach that is actually in CI.

## Decision

Deploy from GitHub Actions (`.github/workflows/build.yml`) on push to `main`:

1. **Build & push** three images to `quay.io/jacktheck02/…`, tagged with
   `${{ github.sha }}`:
   - `pnc-bootcamp-crm-server` — `server/Dockerfile` (Temurin 21 JRE, non-root)
   - `pnc-bootcamp-crm-client` — `frontend/Dockerfile`
     (`nginxinc/nginx-unprivileged`, SPA + `/api` and `/customers` proxy to the
     `backend` service)
   - `pnc-bootcamp-crm-kafka` — `deploy/images/kafka`
2. **Secrets:** `oc apply` a `crm-secrets` Secret upserted from GitHub Actions
   secrets (`POSTGRES_DB/USER/PASSWORD`, `JWT_SECRET`). Never committed; local
   `.env` is dev-only.
3. **Apply & roll:** `oc apply -f deploy/openshift/` then
   `oc set image deployment/{backend,frontend,kafka} …:<sha>`, gated by
   `oc rollout status`.
4. **Smoke test:** backend `/actuator/health` is `UP` (via `oc port-forward`);
   the frontend Route serves the SPA (`id="root"` in the HTML).
5. **Rollback on failure:** `oc rollout undo` on `backend`, `frontend`, and
   `kafka`, then fail the job red.

### Manifests (`deploy/openshift/`)

- `backend.yml`, `frontend.yml`, `kafka.yml`, `postgres.yml` — Deployment +
  Service each; frontend also has an edge-TLS `Route`; Postgres has a 1Gi PVC.
- `revisionHistoryLimit: 1` on every Deployment to fit the sandbox quota.
- Readiness/liveness probes on `/actuator/health` (backend) and `/` (frontend).
- Manifests carry baseline image tags (`v0.1.x`); CI moves them forward with
  `oc set image`.

### Sandbox constraints that shaped the design

- **Arbitrary UID SCC:** stock images that assume a fixed UID fail →
  nginx-unprivileged, a custom Kafka image, and `PGDATA` in a subdirectory so
  Postgres can `chown` it.
- **Tight quota:** `revisionHistoryLimit: 1`, capped Kafka heap, modest
  resource requests/limits.
- **ServiceAccount token:** the deploy job authenticates with a namespaced
  `github-actions` SA token (`OCP_TOKEN`) that expires and must be rotated.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| Self-managed k3s (original ADR) | Full control, easy digest pinning | Have to run and expose a cluster | No managed HTTPS; more ops than the capstone needs |
| Local `docker compose` only | Fastest iteration | No deployment reproducibility or rollback evidence | Fails the release requirement |
| Tag `latest` | Simple | Non-deterministic artifact identity | SHA tags give traceability without digest tooling |

## Consequences

- **Positive:** every `main` commit is traceable to a SHA-tagged image and a
  rollout; failed deploys auto-roll-back one revision; a public HTTPS URL is
  available for the demo with no cluster to maintain.
- **Deviations from the original plan:** OpenShift, not k3s; images are
  **SHA-tagged, not digest-pinned**; rollback is `oc rollout undo`, not
  "redeploy the previous digest".
- **Operational gotchas (see `RUNBOOK.md`):** the transient `oc apply` can
  `ImagePullBackOff` if a baseline tag disappears from quay.io; the smoke test
  does not cover the nginx→backend proxy path; Flyway is forward-only so a code
  rollback across a destructive migration breaks the old image; the SA token
  expires.
- **Follow-ups:** pin images by digest via `oc set image …@sha256:…`; add a
  proxy-path assertion to the smoke test; manage `crm-secrets` with a sealed or
  external secret store.
