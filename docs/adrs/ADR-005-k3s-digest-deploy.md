# ADR-005: k3s deployment with digest-pinned images

- **Status:** Accepted
- **Date:** 2026-08-23
- **Deciders:** Capstone team
- **Related backlog:** CAP-17, CAP-18

## Context

Capstone release criteria require reproducible deployment, smoke checks, and rollback evidence.
Tag-only image references can drift and break reproducibility between build, test, and deploy.
The Week 6 target environment is k3s, with CI pipeline evidence expected for the defense packet.

## Decision

We will deploy to **k3s** using **digest-pinned container images** promoted by CI:

1. Build image in CI and capture immutable digest.
2. Deploy manifests referencing image digest (not mutable tags).
3. Run smoke tests post-deploy.
4. Roll back to previous known-good digest on failure.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| Manual local run only | Fast iteration | No deployment reproducibility | Fails release criteria |
| Tag-based deploy (`latest`) | Easy command flow | Non-deterministic artifact identity | Weak rollback guarantees |
| Helm-only with mutable tags | Flexible templates | Same tag drift risk | Must still pin digest |

## Consequences

- **Positive:** Strong release traceability and deterministic rollback target.
- **Negative / follow-ups:** Pipeline must persist digest artifact and release metadata.
- **NFR impact:** Supports recovery objective and operational hygiene scoring.
- **Evidence later labs will need:** CI run link, manifest snippet with digest, smoke result, rollback proof.
