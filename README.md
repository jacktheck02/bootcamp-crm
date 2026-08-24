# Bootcamp CRM

Customer Management Platform capstone project (fork) with:
- **Backend:** Spring Boot + Java 21 (`server/`)
- **Frontend:** React + TypeScript + Vite (`client/`)
- **Local services:** PostgreSQL + Kafka via Docker Compose

## Current project state

This repository is in the **foundation phase**:
- Core stack and local infrastructure are in place
- A basic customer API exists (`POST /customers`, `GET /customers`)
- Frontend is still template-level and not yet a full CRM workflow
- Security and eventing are scaffolded but not fully implemented end-to-end

## Quick start (Windows / PowerShell)

### 1) Start infrastructure

```powershell
cd c:\Users\austi\capstone\bootcamp-crm
docker compose up -d
```

### 2) Start backend

```powershell
cd c:\Users\austi\capstone\bootcamp-crm\server
mvn spring-boot:run
```

### 3) Start frontend

```powershell
cd c:\Users\austi\capstone\bootcamp-crm\client
npm install
npm run dev
```

App endpoints:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## Stop and cleanup

Stop running app processes in their terminals with `Ctrl+C`, then run:

```powershell
cd c:\Users\austi\capstone\bootcamp-crm
docker compose down --volumes --remove-orphans
```

## Tech stack

- Java 21, Spring Boot, Spring Data JPA, Spring Security, Actuator
- React 19, TypeScript, Vite, ESLint
- PostgreSQL 16, Kafka 3.9
- Maven, Testcontainers, GitHub Actions

## Repository layout

```text
bootcamp-crm/
├── client/                 # React app
├── server/                 # Spring Boot API
├── docs/                   # Architecture + planning artifacts
├── .github/workflows/      # CI workflow(s)
├── compose.yaml            # Local Postgres + Kafka
└── temp_docs/              # Rubric and reference docs
```

## Reference

- Capstone rubric: `temp_docs/CAPSTONE_RUBRIC.md`
