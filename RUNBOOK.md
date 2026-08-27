# Runbook — bootcamp-crm on OpenShift Developer Sandbox

## What runs where

| Component | Deployment | Image | Notes |
|---|---|---|---|
| Frontend | `frontend` | `quay.io/jacktheck02/pnc-bootcamp-crm-client:<sha>` | Public via Route (edge TLS) |
| Backend  | `backend`  | `quay.io/jacktheck02/pnc-bootcamp-crm-server:<sha>` | Internal; nginx proxies `/api/` + `/customers` to it |
| Postgres | `postgres` | `postgres:16` | PVC `crm-data`, 1Gi |
| Kafka    | `kafka`    | `quay.io/jacktheck02/pnc-bootcamp-crm-kafka:<sha>` | Single-node KRaft, ephemeral |

Secrets: `crm-secrets` (POSTGRES_DB / POSTGRES_USER / POSTGRES_PASSWORD / JWT_SECRET) — upserted by the deploy pipeline from GitHub secrets; never committed. Local `.env` is for compose/dev only.
Schema: managed by Flyway at backend startup (`server/src/main/resources/db/migration/`).

## How deploys work

Push to `main` → CI jobs pass → `deploy` job builds SHA-tagged images →
upserts `crm-secrets` from GitHub secrets → `oc apply` + `oc set image` on
backend/frontend/kafka → rollout status gates → smoke test (backend
`/actuator/health` via port-forward + frontend Route serving the SPA).
On any failure the pipeline rolls all three app deployments back one
revision and fails the run.

Notes:
- `oc apply` momentarily reverts deployments to the baseline tags pinned in
  `deploy/openshift/` before `oc set image` moves them forward — keep those
  baseline tags in quay.io or the transient rollout can `ImagePullBackOff`.
- The smoke test does NOT cover the nginx→backend proxy path
  (`/api/`, `/customers` location blocks). A regression in
  `frontend/default.conf.template` deploys green — verify one UI flow after
  proxy-touching changes.

## Check health

    oc get pods
    oc logs deploy/backend --tail=50
    oc get route frontend

## Roll back manually

    oc rollout undo deployment/backend      # repeat for frontend / kafka if needed
    oc rollout status deployment/backend

**WARNING: code rollback does NOT undo database migrations.** Flyway is
forward-only. Rolling the app back across an *additive* migration (new
nullable column) is safe. Rolling back across a *destructive* migration
(dropped/renamed column) will break the old code — restore data or fix
forward instead.

## Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| Deploy step fails on `oc login` / 401 | ServiceAccount token expired | `oc create token github-actions --duration=720h` → update `OCP_TOKEN` secret in GitHub |
| `ImagePullBackOff` | Quay repo private, tag typo, or robot lost access | Make repo public / fix tag / check robot perms |
| Backend crashloops, logs show Flyway error | Bad migration SQL | `oc logs deploy/backend`; fix migration, merge (pipeline redeploys); never edit an applied migration — add a new one |
| Backend crashloops: `Found non-empty schema(s) ... no schema history table` | First Flyway image hit a pre-Flyway (hand-migrated) database, or `baseline-on-migrate` got misplaced under the dead `crm.flyway` namespace instead of `spring.flyway` | One-time: `oc set env deployment/backend SPRING_FLYWAY_BASELINE_ON_MIGRATE=true`; permanent: keep `spring.flyway.baseline-on-migrate: true` in `application.yaml` |
| Rollout stuck at "old replicas are pending termination" then times out | Usually NOT a stuck old pod — the new pod never became Ready (check `oc get pods` for CrashLoopBackOff) and the rollout correctly keeps the old one serving | `oc logs` the NEW ReplicaSet's pod; fix the crash cause; the rollout completes on its own |
| Backend 500s, `relation/column does not exist` | Schema drift slipped past validate | Check backend logs; confirm Flyway applied latest migration |
| Smoke test fails, pods healthy | Router propagation | Re-run the failed job; curl retries usually cover this |
| Pods pending / quota errors | Sandbox limits (keep `revisionHistoryLimit: 1`) | `oc describe quota`; delete old ReplicaSets |
| Kafka crashloop on fresh namespace | `/opt/kafka` not writable by arbitrary UID | Kafka image must come from `deploy/images/kafka` Dockerfile, never stock `apache/kafka` |

## Rotate a secret

Cluster secrets come from GitHub secrets (source of truth):

1. Update the value: repo → Settings → Secrets and variables → Actions.
2. Re-run the deploy workflow — it upserts `crm-secrets`.
3. Re-running the *same* commit rolls no new pods (image tag unchanged), so
   force pods to re-read the secret:

       oc rollout restart deployment/backend deployment/postgres

Gotchas:

- **Postgres password:** on an existing PVC, postgres only reads
  `POSTGRES_PASSWORD` at first `initdb`. Rotate the database first, *then*
  the secret, in this order — otherwise the backend loses auth:

      oc exec deploy/postgres -- psql -U crm -d crm -c "ALTER ROLE crm WITH PASSWORD '<new>';"
      # then update the GitHub secret and re-run the pipeline

- **JWT_SECRET** rotates freely; existing tokens invalidate and users log in
  again.

Manual fallback (no pipeline): edit `.env`, then

    oc delete secret crm-secrets
    oc create secret generic crm-secrets --from-env-file=.env
    oc rollout restart deployment/postgres deployment/backend

## Rebuild the namespace from scratch

Automated path (preferred):

1. Create the CI ServiceAccount in the NEW namespace and update the
   `OCP_TOKEN` GitHub secret (ServiceAccounts are namespaced — a fresh
   namespace means a fresh token):

       oc create serviceaccount github-actions
       oc policy add-role-to-user edit -z github-actions
       oc create token github-actions --duration=720h

2. Re-run the deploy workflow — it upserts `crm-secrets`, applies
   `deploy/openshift/`, and rolls out the SHA-tagged images.

Manual fallback:

    oc create secret generic crm-secrets --from-env-file=.env
    oc apply -f deploy/openshift/
    oc set image deployment/backend  backend=quay.io/jacktheck02/pnc-bootcamp-crm-server:<sha>
    oc set image deployment/frontend frontend=quay.io/jacktheck02/pnc-bootcamp-crm-client:<sha>
    oc set image deployment/kafka    kafka=quay.io/jacktheck02/pnc-bootcamp-crm-kafka:<sha>
