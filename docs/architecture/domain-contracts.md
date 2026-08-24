# Domain and contracts — CAP-12 interaction slice

## Scope

This contract covers the core customer interaction workflow for the CRM slice.

## HTTP contract

### Endpoint

`POST /api/v1/interactions`

### Headers

- `Authorization: Bearer <jwt>`
- `X-Correlation-ID: lab-request-001` (required for traceability)

### Request body (JSON)

```json
{
  "customerId": "CUS-1001",
  "interactionType": "CALL",
  "summary": "Customer called to confirm onboarding status.",
  "correlationId": "lab-request-001"
}
```

### Field rules

| Field | Type | Required | Rule |
| ----- | ---- | -------- | ---- |
| `customerId` | string | Yes | Must reference an existing customer |
| `interactionType` | enum/string | Yes | Allowed values are team-defined and versioned |
| `summary` | string | Yes | Non-empty; sanitized and length-limited |
| `correlationId` | string | Yes | Must match `X-Correlation-ID` |

### Response rules

- `201 Created` for valid writes with persisted interaction ID and timestamps.
- `400 Bad Request` for validation failures (field-level messages).
- `401 Unauthorized` when token is missing/invalid (security enforcement phase).
- `403 Forbidden` when role is insufficient (security enforcement phase).
- `404 Not Found` when `customerId` does not exist (for example `CUS-9999`).

## Event contract

### Event type

`CustomerInteractionRecordedV1`

### Topic

`crm.interactions.events.v1`

### Minimum payload

```json
{
  "eventId": "uuid",
  "eventType": "CustomerInteractionRecordedV1",
  "occurredAt": "2026-08-23T21:00:00Z",
  "customerId": "CUS-1001",
  "interactionId": "uuid",
  "interactionType": "CALL",
  "correlationId": "lab-request-001"
}
```

## Compatibility and versioning policy

- Additive changes to request/response/event payloads are backward compatible.
- Breaking changes require a **version bump** (`/api/v2/...`, `...V2`, and new topic/version suffix as needed).
- Consumer behavior must be idempotent by `eventId`.

## Ownership and traceability

- **Primary owner:** Backend lead
- **Supporting owners:** Frontend lead, Messaging owner
- **Related ADRs:** ADR-002 (Kafka), ADR-003 (after-commit consistency), ADR-004 (JWT/RBAC)
- **Related backlog:** CAP-12, CAP-14, CAP-19
