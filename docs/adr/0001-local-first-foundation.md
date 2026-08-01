# ADR-0001: Local-First Foundation, No SaaS

Status: Accepted

## Context

Blendex Labs Mobile is a new, independent mobile project for Blendex Labs analytical workflows. Users are often in field or shop-floor environments where connectivity is unreliable, unavailable, or disallowed, and the data involved is proprietary and sensitive. A server-dependent architecture would block core use, raise privacy and compliance burden, and couple the project to infrastructure it does not need yet.

## Decision

- Blendex Labs Mobile is **local-first**: data lives on the device, analysis runs on the device, and the app is fully functional offline.
- Phase 1 has **no SaaS**: no backend, no accounts, no cloud sync, no telemetry, and no remote AI APIs.
- The project is **independent**: it imports no code from other Blendex repositories and modifies no other repository.

## Consequences

Positive:

- Works anywhere, including fully offline and network-restricted environments.
- User data remains under user control; no implicit data movement.
- Small, auditable architecture with no external runtime dependencies.

Negative / to manage:

- Backup and portability must be handled through explicit user-initiated export.
- Multi-device and collaboration features are impossible in Phase 1; they require a future ADR and phase.
- Future cloud capabilities must be designed deliberately as a separate phase, not retrofitted.
