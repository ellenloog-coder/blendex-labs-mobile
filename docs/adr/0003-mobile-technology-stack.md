# ADR-0003: Mobile Technology Stack Decision

Status: Accepted

## Decision context

Blendex Labs Mobile needs a mobile-capable application layer that satisfies the constraints already recorded in [ADR-0001](0001-local-first-foundation.md) (local-first, no SaaS, independent project) and [ADR-0002](0002-ai-advisory-boundary.md) (AI is advisory-only). Existing Blendex Labs tools are predominantly vanilla JavaScript web apps: Process Capability is a hand-rolled installable PWA (HTML, ES modules, service worker, no build step), the Web SPC frontend is vanilla JS, Web DOE ships single-file HTML demos, and the NPI Agent engines are TypeScript ES modules.

The stack decision must therefore:

- allow Phase 1 to reuse existing engineering engines as local ES modules;
- run fully offline with no server, account, or SaaS dependency;
- stay low-complexity enough for a small team and an auditable codebase;
- remain maintainable as the analytical workflow suite grows;
- produce a mobile experience that can be installed on a phone or tablet (PWA), with native app-store packaging explicitly deferred.

## Options considered

1. **Pure PWA with native ES Modules** — no build step, hand-rolled service worker and manifest, vanilla JavaScript UI. This is exactly how the existing Process Capability tool is built.
2. **React + Vite PWA** — component framework with standard build tooling; Vite with `vite-plugin-pwa` handles offline packaging.
3. **Other suitable lightweight options**:
   - **Svelte + Vite PWA** — compiled components with a tiny runtime, using the same Vite PWA tooling.
   - **Lit + Vite PWA** — web components that stay closest to the native ES Modules philosophy.
   - **Preact + Vite PWA** — React's component API with a much smaller runtime.
   - **Vue + Vite PWA** — incremental adoption model; a middle-weight option.

Rejected alternatives: native iOS/Android development and cross-platform frameworks (Flutter, React Native, etc.). They would force re-porting or re-implementing every engine, add heavyweight toolchains, and diverge from the existing web-native tooling — violating the engine-reuse and low-complexity criteria.

## Pros and cons

### Option 1: Pure PWA with native ES Modules

Pros:

- Closest to existing Blendex tools; zero toolchain and zero third-party runtime dependencies.
- Maximum engine reuse — engine modules can be taken from existing tools with minimal change.
- Lowest possible complexity and smallest auditable surface.
- Trivially offline with a small service worker; no SaaS anywhere.

Cons:

- No framework for state, rendering, or component reuse; UI code tends to grow into hand-rolled, inconsistent patterns.
- Weaker long-term maintainability as many workflows and screens accumulate.
- Routing, forms, theming, and testing must all be built and policed manually.
- Higher per-feature cost and stronger reliance on individual developer discipline.

### Option 2: React + Vite PWA

Pros:

- Mature ecosystem and the largest talent pool; strong componentization, state management, and testing conventions.
- Fast developer loop with HMR; excellent TypeScript support and a solid PWA plugin.
- Engines can remain framework-agnostic ES modules regardless of the UI framework.

Cons:

- Largest dependency surface and runtime of the web options; bundle size must be actively managed.
- More concepts to learn and more upgrade/churn burden.
- Complexity exceeds what the Phase 1 application actually needs.

### Option 3: Lightweight framework + Vite PWA (Svelte recommended)

**Svelte + Vite** pros:

- The compiler removes most of the framework from the shipped bundle (runtime is a few KB).
- Readable, ergonomic components with standard state management patterns.
- Standard, fast Vite toolchain; `vite-plugin-pwa` gives offline packaging with low effort.
- TypeScript optional; engines stay pure ES modules.
- Long-term maintainability comparable to React at near-vanilla complexity.

**Svelte + Vite** cons:

- Smaller ecosystem than React; fewer off-the-shelf components and answers.
- Still introduces a build step and `node_modules`; developers need a Node toolchain.

Other lightweight candidates: Lit stays closest to web standards but carries more boilerplate at app scale; Preact gives React's API without React's size but has a smaller ecosystem; Vue is a middle ground with a heavier runtime than Svelte and a larger conceptual surface than this project needs.

## Recommended approach

Adopt **Svelte + Vite PWA** for the Phase 1 UI shell, with non-negotiable architectural boundaries:

- The deliverable is a **static, installable PWA** — no server, no SaaS, no runtime network dependency (ADR-0001). The Vite build emits static files, and a service worker (via `vite-plugin-pwa`) precaches the app shell and offline assets.
- **All engineering engines live under `engines/` as framework-agnostic ES modules.** The UI layer imports them; engines never import UI or framework code. This preserves reuse from existing Blendex tools and keeps analytical results deterministic and testable (ADR-0002).
- TypeScript is allowed inside engines when porting existing TS modules; plain ES modules are equally acceptable. No framework DSL is allowed inside engines.
- On-device persistence uses standard PWA storage (IndexedDB/OPFS are candidates); the exact storage choice remains an open decision per the architecture overview.
- Native wrappers (e.g., Capacitor) and app-store distribution are deferred; installing the PWA from the browser covers Phase 1.

Rationale: Svelte + Vite resolves the tension between the two competing criteria — long-term maintainability without React-level complexity. All three options preserve engine reuse and offline capability, because those properties come from the architecture boundary (framework-agnostic engines plus a static PWA), not from the framework. The engine boundary also keeps the UI shell swappable: if the team later prefers React's ecosystem, the engines move unchanged.

## Impact on architecture

- The future `app/` directory becomes a Vite project producing a static PWA: Svelte components, app services and state, and PWA registration. The future `engines/` directory becomes plain ES-module packages that are framework-agnostic, unit-testable, and portable to the existing web tools.
- Offline capability becomes a first-class build artifact (the service worker precache list), and every build is validated against the local-first acceptance criteria: zero outbound traffic during ordinary use.
- No backend, hosting dependency, or SaaS surface is introduced. The PWA may be served statically for distribution only, never for functionality.
- Future AI assist remains an in-app advisory layer (ADR-0002) and is independent of this stack choice.
- The deferred-decisions list in the architecture overview shrinks: platform/framework and engine strategy are now decided; on-device storage technology and import/export formats remain open.
