# Blendex Labs Mobile

Blendex Labs Mobile is the mobile platform for Blendex Labs analytical tools. It brings quality, engineering, and data-analysis workflows to phones and tablets as a **local-first** application: data stays on the device, analysis runs on the device, and the app is fully functional with no network connection and no account.

> Status: **Phase 0 — project foundation.** This repository currently contains documentation only. Mobile UI, analysis engines, and backend are explicitly out of scope at this stage.

## Project purpose

Blendex Labs builds analytical tooling for quality and engineering teams (SPC, DOE, APQP, NPI, process capability, and related workflows). Blendex Labs Mobile extends that toolset to mobile devices so that field and shop-floor users can:

- record, inspect, and manage data where it is collected;
- run local analysis without depending on connectivity;
- keep proprietary or sensitive data under their own control.

This is a **new, independent project**. It does not import code from existing Blendex desktop/web tools, and it does not modify or depend on other repositories. Integration with existing tooling is a decision for a later phase.

## Local-first principle

Blendex Labs Mobile is local-first by design:

- **On-device data.** All data created or imported by the app lives on the user's device. There is no server-side copy unless the user explicitly exports or shares it.
- **Offline capable.** The app works from cold start with networking disabled. No feature requires a network round trip.
- **On-device compute.** Analysis engines run locally. Network availability never changes what results the app produces.
- **No account required.** Phase 1 has no accounts, logins, or cloud identity.
- **User control.** Export, backup, and deletion are explicit user actions. The app does not phone home.

Full principle and design implications: [docs/architecture/local-first.md](docs/architecture/local-first.md).

## AI boundary

AI is a bounded, **advisory** capability in Blendex Labs Mobile — never a required or authoritative one:

- **Advisory only.** AI may explain results, summarize data, draft narrative interpretations, or suggest next steps. It never makes decisions on the user's behalf.
- **User initiated and visible.** AI features are invoked explicitly, and their outputs are clearly labeled. Nothing is applied without user review and confirmation.
- **Deterministic core.** Statistical and engineering calculations run in deterministic local engines. AI is never used to compute, alter, or "fix" analytical results.
- **No silent data movement.** AI features may not send user data off-device without explicit, disclosed user action.
- **Auditable.** AI-assisted actions leave a trace the user can inspect.

Complete boundary, allowed/prohibited behaviors, and enforcement guidance: [docs/architecture/ai-boundary.md](docs/architecture/ai-boundary.md).

## Phase 1 scope: no SaaS

Phase 1 is deliberately constrained to a self-contained local app:

- **In scope:** local-first mobile experience, on-device data entry and storage, local analysis engines, user-initiated export, and this documentation.
- **Out of scope:** SaaS backend, cloud sync, accounts, subscriptions, server-side compute, remote AI APIs, telemetry that leaves the device, and multi-device collaboration.

Any future server-side capability will be a separate, explicit phase with its own design and consent model. See [docs/architecture/phase-1-scope.md](docs/architecture/phase-1-scope.md).

## Repository layout

| Path | Purpose |
| --- | --- |
| `README.md` | Project overview, principles, and scope |
| `docs/` | Project documentation (index and architecture) |
| `docs/architecture/` | Architecture documents (overview, principles, scope) |
| `docs/adr/` | Architecture Decision Records |
| `app/` | *(planned)* Mobile application — not created in Phase 0 |
| `engines/` | *(planned)* Local analysis engines — not created in Phase 0 |

## Documentation

- [Documentation index](docs/README.md)
- [Architecture overview](docs/architecture/overview.md)
- [Local-first principle](docs/architecture/local-first.md)
- [AI boundary](docs/architecture/ai-boundary.md)
- [Phase 1 scope](docs/architecture/phase-1-scope.md)

## Getting started

Nothing to build or run yet. This is a documentation-only foundation; the mobile platform, UI framework, and engine strategy are open decisions recorded in [docs/architecture/overview.md](docs/architecture/overview.md).
