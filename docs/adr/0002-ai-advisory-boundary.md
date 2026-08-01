# ADR-0002: AI Is Advisory-Only

Status: Accepted

## Context

Analytical results in Blendex Labs tools must be reproducible, deterministic, and explainable. Generative AI is nondeterministic and can hallucinate, so it cannot be trusted with calculations or record mutation. At the same time, AI assistance (explanations, summaries, drafting) can meaningfully help users. Without an explicit boundary, AI features risk silently becoming authoritative or creating hidden service dependencies.

## Decision

AI in Blendex Labs Mobile is **advisory-only**:

- AI is user-initiated, optional, clearly labeled, and auditable.
- Analytical results come exclusively from deterministic local engines; AI never computes, alters, or "fixes" them.
- AI never modifies data or records without explicit user confirmation, never acts on the user's behalf, and never sends data off-device without explicit, disclosed user action.
- The app must remain fully functional with all AI disabled.

## Consequences

Positive:

- Core analytical trustworthiness is preserved regardless of AI behavior.
- Users retain control and visibility over every AI-assisted action.
- AI can be added incrementally without weakening the deterministic core.

Negative / to manage:

- AI features must meet labeling, consent, and auditability requirements, adding implementation overhead.
- On-device AI may be constrained by device resources; remote AI is explicitly out of Phase 1 and would require a new ADR.
