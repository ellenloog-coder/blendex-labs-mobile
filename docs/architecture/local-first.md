# Local-First Principle

Status: **Adopted** — [ADR-0001](../adr/0001-local-first-foundation.md)

## What "local-first" means here

1. **Data residency.** All data created, imported, or derived by the app is stored on the user's device. The device is the system of record; there is no server-side copy by default.
2. **Offline-first operation.** The app is fully functional from cold start with networking disabled. No workflow depends on a network round trip, and no feature degrades when offline.
3. **On-device compute.** All analysis runs in local engines. Results are identical regardless of network availability.
4. **No implicit sharing.** The app performs no outbound traffic during ordinary use — no telemetry, no analytics, no "phone home" behavior.
5. **User-controlled portability.** Export, backup, and sharing are explicit user actions (e.g., file export, system share sheet). Deleting app data removes it from the device.

## Design implications

- The app requires a durable on-device persistence layer; remote endpoints are not part of the Phase 1 design.
- Storage failures are local failures: the app must handle them gracefully and never silently fall back to a cloud path.
- All automated tests run offline and without network mocking.
- UI must make data ownership visible: clear indicators for local storage, and explicit confirmation before any export or share.
- Import is allowed, but only as a user-initiated, one-way local action in Phase 1.

## What local-first does not mean

- It is not "anti-cloud" forever. A future sync or cloud phase is possible, but only as an explicit, separately designed phase with its own consent model.
- It is not "no backup." Backup happens through user-initiated export, not through automatic server copies.
- It is not "no networking" in general. User-initiated network actions (importing a file, exporting to a chosen destination) are permitted.

## Phase 1 acceptance criteria

- The app starts and completes core workflows with networking disabled.
- Ordinary use generates zero outbound network traffic.
- All user data can be removed from the device via the app (delete and/or export actions).
