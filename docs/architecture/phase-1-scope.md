# Phase 1 Scope: Local-First, No SaaS

Status: **Adopted** — [ADR-0001](../adr/0001-local-first-foundation.md)

## Goal

Deliver a self-contained mobile application that is genuinely useful entirely on-device: data entry and storage, local analysis, and user-controlled export — with no server, account, or network dependency.

## In scope

- Local-first mobile experience (single user, single device).
- On-device data entry, import, storage, and management.
- Local analysis engines with deterministic, reproducible results.
- User-initiated export (files, share sheet, etc.).
- Project documentation and architecture records (this repository).

## Out of scope (explicitly deferred)

The following are **not** part of Phase 1:

- SaaS backend of any kind, including "serverless" functions or BaaS.
- Cloud sync or any automatic off-device copy of data.
- Accounts, login, identity, or subscriptions.
- Server-side compute or storage.
- Remote AI APIs or any AI processing off-device.
- Telemetry, analytics, or crash reporting that leaves the device.
- Multi-device collaboration or sharing between users.
- Web portals, dashboards, or companion server services.
- Push notifications that require a server.

## Why "no SaaS" in Phase 1

- **User trust and privacy.** Proprietary quality data stays where the user controls it.
- **Works anywhere.** Shop floors, field sites, and regulated environments may have no reliable or permitted connectivity.
- **Simplicity and independence.** A local app has a small, auditable surface; the project remains independent of existing Blendex repositories and of any vendor platform.
- **Clean future option.** A later cloud phase can be designed deliberately, with explicit consent and data-handling models, instead of being an accident of early architecture.

## Guardrails

- Any future server-side capability requires a new ADR plus a dedicated phase plan. It is never added opportunistically.
- Phase 1 code must contain no hidden endpoints, no network calls during ordinary use, and no silently collected data.
- If a platform or library pulls in network functionality, it must be disabled or gated so the local-first acceptance criteria still hold.

## Phase 1 exit criteria

- Core workflows complete fully offline.
- Zero outbound network traffic during ordinary use.
- All user data exportable and deletable through the app.
- Every architecture constraint traceable to a documented ADR.
