# ADR-004: Token authentication and role-based authorization

- **Status:** Accepted — partially implemented
- **Date:** 2026-08-23 (original) · revised 2026-08-27 to match the build
- **Deciders:** Capstone team
- **Related backlog:** CAP-16

## Context

The capstone requires explicit authn/authz behaviour with negative-path
evidence (401/403). The starter permitted every request. The frontend and
backend need a stable token contract that works locally and in CI without an
external identity provider.

## Decision

Ship a **lab-grade bearer token** with Spring Security, and grow the route
policy toward deny-by-default.

### Token

- Format: opaque string `lab.<subject>.<role>.<sig>` where
  `sig = Integer.toHexString(secret.hashCode())`. Issued by `JwtService` on
  `POST /api/auth/login`; secret from `PNC_SECURITY_JWT_SECRET` /
  `pnc.security.jwt-secret`.
- This is **not** a signed JWT and does not validate an issuer. It is
  deliberately minimal for the capstone; a real JWT (HS256 or JWKS) is a
  prerequisite for any non-lab use.
- `JwtAuthenticationFilter` reads `Authorization: Bearer …`, parses subject and
  role, and sets a `ROLE_<role>` authority. An invalid token clears the
  security context (the filter does not itself return 401).

### Users

- `CrmUserDetailsService` is in-memory: `agent1` → `ROLE_AGENT`,
  `admin1` → `ROLE_ADMIN`, passwords BCrypt-encoded (username == password in the
  seed data).

### Filter chain (`SecurityConfig`)

- Stateless sessions; `formLogin` and `httpBasic` disabled.
- CSRF enabled but ignored for `/api/**`, `/customers`, `/customers/**`.
- CORS allows `http://localhost:5173` and `http://localhost:8080`.

### Route policy (current)

| Matcher | Rule |
| ------- | ---- |
| `/api/auth/**`, `/actuator/**`, `/health`, `/` | `permitAll` |
| `/customers`, `/customers/**`, `/api/customers`, `/api/customers/**` | `permitAll` *(temporary — target is `authenticated()`)* |
| everything else (e.g. `/api/admin/**`) | `authenticated()` (any role) |

### RBAC actually enforced

- `CustomerController.updateCustomer` throws `AccessDeniedException` (→ 403 via
  `GlobalExceptionHandler`) if the request changes `status` and the caller does
  not hold `ROLE_ADMIN`. This is the only role check in the codebase.

### Error contract (`GlobalExceptionHandler`)

Validation → 400 with field violations · `IllegalArgumentException` → 404 ·
`IllegalStateException` → 409 · `AccessDeniedException` → 403 · other → 500.
Every response echoes `X-Correlation-Id` when present.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| Real signed JWT + JWKS now | Production-like | Needs an issuer or key management | Overhead for a sandbox capstone; planned as a follow-up |
| Session auth with server state | Familiar | Stateful, weaker for API clients | Misaligned with the target |
| Keep permit-all | Fastest | Fails the security requirement | Rejected |

## Consequences

- **Positive:** login works end to end; the frontend stores and sends the
  token; admin-gated status changes return a real 403; the error contract is
  consistent and correlation-aware.
- **Deviations from the original plan:** token is not a verified JWT; write
  endpoints are still `permitAll`; `/api/admin/**` requires authentication but
  no specific role; there is no custom 401 entry point.
- **Follow-ups:** move `/customers/**` and `/api/customers/**` to
  `authenticated()`; add a role rule (or `@PreAuthorize`) for admin routes;
  add an `AuthenticationEntryPoint` returning 401 JSON; replace the lab token
  with a signed JWT before the token is trusted anywhere real.
