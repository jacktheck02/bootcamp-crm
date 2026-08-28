# Bootcamp CRM

Customer Management Platform capstone project (fork). A vertical slice of a CRM:
a service agent signs in, searches customers, opens a profile with its
interaction history, edits customers, and records interactions.

- **Backend:** Spring Boot 4 + Java 21 (`server/`)
- **Frontend:** React 19 + TypeScript + Vite (`frontend/`)
- **Local services:** PostgreSQL 16 + Kafka via Docker Compose (`compose.yaml`)
- **Deploy:** OpenShift Developer Sandbox via GitHub Actions (`deploy/`, `RUNBOOK.md`)

## What works today

**Backend**

- Login (`POST /api/auth/login`) issuing a lab-grade bearer token
  (`lab.<user>.<role>.<sig>`); seeded users `agent1` and `admin1`.
- Customer create / list / search / get-by-id / update, plus a status-filtered
  paginated list.
- Interactions: list and create per customer.
- Flyway-managed schema (`V1`–`V4`) with seeded customers `CUS-1001` /
  `CUS-1002`.
- Spring Security filter chain: stateless, BCrypt, CORS, bearer-token filter.
- Admin-only enforcement on customer **status** changes (returns 403 otherwise).
- Consistent JSON error contract with `X-Correlation-Id` echo.
- Kafka consumer + idempotency scaffolding (`CustomerEventListener`,
  `ProcessedEventStore`).

**Frontend**

- Login gate, customer search, profile + interaction timeline, create/edit
  customer, add interaction, in-session activity trail.
- Loading / empty / error states, client-side validation.
- Mock mode (`VITE_USE_MOCK_API=true`) to run the UI with no backend.
- ~16 Vitest suites (see `frontend/README.md`).

**CI/CD** (`.github/workflows/build.yml`)

- `mvn verify` with Testcontainers (Postgres + Kafka).
- Frontend `npm ci` / lint / test / build.
- OWASP dependency-check (`-Psecurity-scan`) + CodeQL SAST (Java + TS/JS).
- On push to `main`: build & push SHA-tagged images to quay.io, `oc apply` +
  `oc set image` to the OpenShift sandbox, smoke test, auto-rollback on failure.

## Known gaps / not yet implemented

- **Auth is not enforced on customer/interaction endpoints.** `/customers/**`
  and `/api/customers/**` are currently `permitAll`; only the status-change RBAC
  check runs. Deny-by-default is the target — see `docs/adrs/ADR-004-jwt-rbac.md`.
- **No domain event is published on write.** `CustomerEventPublisher` exists but
  is never called — see ADR-002 / ADR-003.
- The bearer token is not a verified JWT (no signature/issuer validation).

`docs/` (ADRs, C4 context/container, domain contracts, NFRs, backlog, risk
register) is kept in sync with the build and flags each planned-but-unbuilt
item inline.

## Quick start

Prerequisites: Docker (Compose v2), JDK 21, Node.js 20.19+ or 22.12+. Run each
step from the repository root. Windows users: use `mvnw.cmd` instead of
`./mvnw`, and `Copy-Item` instead of `cp`.

### 1) Start infrastructure

```sh
cp .env.example .env      # set POSTGRES_USER=crm  POSTGRES_DB=crm  POSTGRES_PASSWORD=secret  JWT_SECRET=<any>
docker compose up -d postgres kafka
```

`POSTGRES_USER` / `POSTGRES_PASSWORD` must match the backend defaults
(`crm` / `secret` in `server/src/main/resources/application.yaml`) unless you
also override `SPRING_DATASOURCE_*`.

### 2) Start the backend

```sh
cd server
./mvnw spring-boot:run
```

Flyway applies migrations and seeds `CUS-1001` / `CUS-1002` on first run.

### 3) Start the frontend

```sh
cd frontend
cp .env.example .env       # keeps VITE_API_BASE_URL=/api so the dev proxy routes correctly
npm install
npm run dev
```

- Frontend: `http://localhost:5173` (Vite proxies `/api` → `http://localhost:8080`)
- Backend: `http://localhost:8080`
- Sign in with `agent1` / `agent1` (AGENT) or `admin1` / `admin1` (ADMIN)

## API reference

`CustomerController` is mapped at **both** `/customers` and `/api/customers`
(the deployed nginx proxies `/api/` through unchanged; the Vite dev proxy
strips the `/api` prefix).

| Method & path | Purpose | Notes |
| ------------- | ------- | ----- |
| `POST /api/auth/login` | Exchange `{username,password}` for `{accessToken,tokenType}` | 401 on bad credentials |
| `GET /customers?q=` | List customers, optional substring search on id/name/email | in-memory filter |
| `GET /customers/paginated?status=&page=&size=` | Page customers by status | `status` defaults to `ACTIVE` |
| `POST /customers` | Create a customer | auto-assigns `public_id` `CUS-1000+n` |
| `GET /customers/{id}` | Get one by public id | 404 if unknown |
| `PUT /customers/{id}` | Update name/email/phone/status | status change requires `ROLE_ADMIN` → 403 |
| `GET /customers/{id}/interactions` | Interaction history, newest first | |
| `POST /customers/{id}/interactions` | Record an interaction `{type,summary}` | 201 Created |
| `GET /api/admin/ping` | Trivial authenticated probe | any authenticated role |
| `GET /actuator/health` | Health check | used by probes + smoke test |

## Tech stack

- Java 21, Spring Boot 4.1, Spring Data JPA, Spring Security, Spring for Apache
  Kafka, Bean Validation, Actuator, Flyway
- React 19, TypeScript, Vite 8, Vitest, Testing Library
- PostgreSQL 16, Kafka 3.9 (KRaft, single node)
- Maven, Testcontainers, GitHub Actions, OWASP dependency-check, CodeQL
- Docker, nginx (unprivileged), OpenShift / `oc`, quay.io

## Repository layout

```text
bootcamp-crm/
├── frontend/            # React app (Vite; nginx image for prod)
├── server/              # Spring Boot API (Flyway migrations, Testcontainers)
├── docs/
│   ├── adrs/            # Architecture decision records
│   └── architecture/    # C4 context/container + domain contracts
├── deploy/
│   ├── openshift/       # Deployment / Service / Route / PVC manifests
│   └── images/kafka/    # Sandbox-friendly Kafka image
├── .github/workflows/   # CI + OpenShift deploy (build.yml)
├── compose.yaml         # Local Postgres + Kafka (+ optional backend/frontend builds)
├── RUNBOOK.md           # OpenShift deploy / rollback / secret-rotation operations
└── temp_docs/           # Course rubric + lab guide (external reference)
```

## Stop and cleanup

Stop the app processes with `Ctrl+C`, then from the repository root:

```sh
docker compose down --volumes --remove-orphans
```

## Reference

- Deploy & operations: `RUNBOOK.md`
- Architecture decisions: `docs/adrs/`
- Capstone rubric: `temp_docs/CAPSTONE_RUBRIC.md`
