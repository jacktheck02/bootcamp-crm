# ADR-004: JWT authentication and role-based authorization

- **Status:** Accepted
- **Date:** 2026-08-23
- **Deciders:** Capstone team
- **Related backlog:** CAP-16

## Context

The rubric requires explicit authentication and authorization behavior, including negative-path evidence (401/403).
Current starter security permits all requests and cannot satisfy security pass criteria.
The frontend and backend both need a stable, token-based contract suitable for local and CI environments.

## Decision

We will implement JWT-based authn/authz with deny-by-default route policy:

1. Validate JWT signature and claims from approved issuer metadata.
2. Map role claims to `AGENT` and `ADMIN` authorities.
3. Protect write endpoints and admin-only operations via RBAC rules.
4. Return 401 for missing/invalid token and 403 for insufficient role.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| Session auth with server state | Familiar pattern | Harder scaling and API-client compatibility | Misaligned with capstone target |
| API keys only | Simple | No user identity/role context | Cannot demonstrate RBAC properly |
| Keep permit-all for demo | Fastest short term | Fails security rubric hard gate | Rejected |

## Consequences

- **Positive:** Meets security rubric expectations and production-like API behavior.
- **Negative / follow-ups:** Need token issuance setup for local development and CI tests.
- **NFR impact:** Enables measurable 401/403 targets and least-privilege enforcement.
- **Evidence later labs will need:** test and curl proof for authorized and unauthorized paths.
