/**
 * Mobile AI Gateway (Phase 0.4).
 *
 * Dedicated service layer between the UI and the existing Blendex Labs
 * Cloudflare Worker (quality-tools-ai-assistant). No UI component talks to
 * the worker directly.
 *
 * Privacy boundary: only the user question, the caller-approved context
 * summary, and conversation history are serialized. This layer never sends
 * engineering data, customer, supplier, or confidential content.
 */

export type AiErrorCode =
  | 'not-configured'
  | 'empty-question'
  | 'network'
  | 'timeout'
  | 'http'
  | 'origin'
  | 'empty';

export class AiError extends Error {
  readonly code: AiErrorCode;
  readonly retryable: boolean;

  constructor(code: AiErrorCode, message: string, retryable = false) {
    super(message);
    this.name = 'AiError';
    this.code = code;
    this.retryable = retryable;
  }
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskAssistantOptions {
  history?: ChatHistoryItem[];
  language: 'en' | 'zh';
  /** Optional, caller-approved context summary (e.g. current page name). */
  contextSummary?: string;
}

export const DEFAULT_AI_WORKER_URL =
  'https://quality-tools-ai-assistant.quality-tools-ai-assistant.workers.dev';

export function aiWorkerUrl(): string {
  return import.meta.env.VITE_AI_WORKER_URL?.trim() || DEFAULT_AI_WORKER_URL;
}

const QUESTION_MAX = 1600;
const HISTORY_LIMIT = 8;
const MESSAGE_MAX = 1400;
const CONTEXT_MAX = 80;
const TIMEOUT_MS = 30000;

export async function askAssistant(
  question: string,
  options: AskAssistantOptions,
): Promise<string> {
  const trimmed = question.trim().slice(0, QUESTION_MAX);
  if (!trimmed) {
    throw new AiError('empty-question', 'A question is required.');
  }

  const history: ChatHistoryItem[] = (options.history ?? [])
    .slice(-HISTORY_LIMIT)
    .map((item): ChatHistoryItem => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: item.content.slice(0, MESSAGE_MAX),
    }))
    .filter((item) => item.content.length > 0);

  const contextSummary = (options.contextSummary ?? '').trim().slice(0, CONTEXT_MAX);

  // Privacy boundary: the payload contains only these fields.
  const payload: Record<string, unknown> = {
    task: 'quality_engineering_chat',
    current_tool: 'mobile-assistant',
    language: options.language,
    user_question: trimmed,
  };
  if (history.length > 0) payload.conversation_history = history;
  if (contextSummary) payload.available_context = [contextSummary];

  const url = aiWorkerUrl();
  if (!url.startsWith('https://')) {
    throw new AiError('not-configured', 'AI worker URL is not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new AiError('timeout', 'AI request timed out.', true);
    }
    throw new AiError('network', 'AI service is unreachable.', true);
  } finally {
    clearTimeout(timeout);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new AiError('http', 'AI service returned an invalid response.', true);
  }

  const record = (data ?? {}) as {
    success?: boolean;
    error_code?: string;
    answer?: string;
  };
  if (!response.ok || record.success === false) {
    const originBlocked = record.error_code === 'origin_not_allowed' || response.status === 403;
    throw new AiError(
      originBlocked ? 'origin' : 'http',
      record.error_code ?? `HTTP ${response.status}`,
      !originBlocked,
    );
  }

  const answer = typeof record.answer === 'string' ? record.answer.trim() : '';
  if (!answer) {
    throw new AiError('empty', 'AI service returned an empty answer.', true);
  }
  return answer;
}
