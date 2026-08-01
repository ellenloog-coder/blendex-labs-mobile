# Documentation Index

This directory is the documentation home for Blendex Labs Mobile. It is maintained alongside the code and is the source of truth for project principles, scope, and architectural decisions.

## Guides

| Document | Purpose |
| --- | --- |
| [Architecture overview](architecture/overview.md) | Phase 1 target architecture, layers, and deferred platform decisions |
| [Local-first principle](architecture/local-first.md) | What local-first means and the design implications |
| [AI boundary](architecture/ai-boundary.md) | What AI may and may not do, and how to enforce it |
| [Phase 1 scope](architecture/phase-1-scope.md) | Explicit in/out-of-scope list; the "no SaaS" constraint |

## Decision records

Architecture Decision Records (ADRs) capture decisions and their rationale in chronological order. Each ADR is immutable once accepted; follow-up decisions are recorded as new ADRs.

| ADR | Decision |
| --- | --- |
| [0001 — Local-first foundation](adr/0001-local-first-foundation.md) | Local-first, no SaaS, independent project |
| [0002 — AI is advisory-only](adr/0002-ai-advisory-boundary.md) | AI outputs are advisory, labeled, and never authoritative |

## Conventions

- Every Phase 1 design constraint is anchored to an ADR.
- New architectural decisions get a new ADR; superseding a decision requires a new ADR referencing the old one.
- Documents use plain Markdown with relative links so the tree can be read locally or on GitHub.
