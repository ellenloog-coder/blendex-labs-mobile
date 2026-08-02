import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiError, askAssistant } from '../src/lib/ai/gateway';

function fakeResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AI gateway', () => {
  it('sends only question, history, and language (privacy boundary)', async () => {
    let captured: { url: string; body: Record<string, unknown> } | undefined;
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      captured = { url, body: JSON.parse(String(init.body)) as Record<string, unknown> };
      return fakeResponse(200, { success: true, answer: 'Advisory answer.' });
    });

    const answer = await askAssistant('What is Cpk?', {
      language: 'en',
      history: [{ role: 'user', content: 'Prior turn' }],
    });

    expect(answer).toBe('Advisory answer.');
    expect(captured?.url).toContain('workers.dev');
    const body = captured?.body as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual([
      'conversation_history',
      'current_tool',
      'language',
      'task',
      'user_question',
    ]);
    expect(body.task).toBe('quality_engineering_chat');
    expect(body.user_question).toBe('What is Cpk?');
    expect(body.language).toBe('en');
    expect(body.conversation_history).toEqual([{ role: 'user', content: 'Prior turn' }]);
  });

  it('rejects an empty question without calling the worker', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(askAssistant('   ', { language: 'zh' })).rejects.toMatchObject({
      code: 'empty-question',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps origin_not_allowed to a non-retryable origin error', async () => {
    vi.stubGlobal('fetch', async () =>
      fakeResponse(403, { success: false, error_code: 'origin_not_allowed' }),
    );
    await expect(askAssistant('question', { language: 'en' })).rejects.toMatchObject({
      code: 'origin',
      retryable: false,
    });
    await expect(askAssistant('question', { language: 'en' })).rejects.toBeInstanceOf(AiError);
  });

  it('maps worker errors to retryable http errors', async () => {
    vi.stubGlobal('fetch', async () =>
      fakeResponse(200, { success: false, error_code: 'workers_ai_error' }),
    );
    await expect(askAssistant('question', { language: 'en' })).rejects.toMatchObject({
      code: 'http',
      retryable: true,
    });
  });

  it('maps network failures to retryable network errors', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('Network down');
    });
    await expect(askAssistant('question', { language: 'en' })).rejects.toMatchObject({
      code: 'network',
      retryable: true,
    });
  });

  it('rejects empty answers', async () => {
    vi.stubGlobal('fetch', async () => fakeResponse(200, { success: true, answer: '  ' }));
    await expect(askAssistant('question', { language: 'en' })).rejects.toMatchObject({
      code: 'empty',
    });
  });
});
