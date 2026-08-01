# AI Boundary

Status: **Adopted** — [ADR-0002](../adr/0002-ai-advisory-boundary.md)

## Position

In Blendex Labs Mobile, AI is **advisory, optional, user-initiated, clearly labeled, and auditable** — and it is never authoritative for analytical results.

The purpose of the boundary is to protect the trustworthiness of analytical work: results must always be reproducible, deterministic, and explainable, regardless of what AI assistance is available.

## What AI may do

- Explain what a local engine computed and why, in user-friendly language.
- Summarize data, records, or results in the user's language.
- Draft narrative interpretations for the user to review and edit.
- Suggest next steps or guided workflows.
- Help convert user notes into structured entries, with user confirmation before anything is persisted.

## What AI must not do

- Produce, alter, or "fix" analytical results. Calculations belong to deterministic local engines only.
- Modify, delete, or overwrite source data or records without explicit user confirmation.
- Make decisions, approve actions, or act on the user's behalf.
- Send user data off-device (including to third-party AI APIs) without explicit, disclosed user action.
- Gate or replace core functionality behind AI.
- Introduce a hidden dependency on any service — the app must remain fully functional with AI disabled.

## Requirements on implementation

When AI features are built:

- **Explicit invocation.** AI never runs automatically; the user starts every AI action.
- **Labeled output.** AI-generated content is visibly marked as AI-generated.
- **Transparency.** The user is told what data an AI action uses and where it is processed.
- **Local-first default.** On-device AI is preferred. Any remote AI requires a new ADR and explicit user consent, and is out of Phase 1 scope.
- **Auditability.** AI-assisted actions leave a trace (what was invoked, what was shown, what was confirmed).
- **No result coupling.** Disabling AI must not change any analytical result.

## Enforcement guidance

- Architecture/code review checklist items covering every AI entry point against the prohibited list above.
- UI components for AI output that enforce labeling and confirmation consistently.
- Tests that verify core analysis paths contain no AI calls.
- A single, documented AI access layer rather than scattered ad-hoc integrations.
