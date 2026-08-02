/**
 * One-shot handoff between a report page and the AI Assistant.
 * Carries only non-sensitive CPK context (tool type, summary metrics,
 * deterministic insights) plus the user-facing question.
 */
import type { AiChatContext } from './gateway';

export interface PendingAiContext extends AiChatContext {
  question: string;
}

let pending: PendingAiContext | null = null;

export function setPendingAiContext(context: PendingAiContext): void {
  pending = context;
}

export function consumePendingAiContext(): PendingAiContext | null {
  const context = pending;
  pending = null;
  return context;
}
