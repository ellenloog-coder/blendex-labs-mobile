import { afterEach, describe, expect, it, vi } from 'vitest';
import { runCapabilityAnalysis } from '../src/lib/tools/capability/adapter';
import { decisionCardToReport } from '../src/lib/tools/capability/report';
import {
  getCpkReport,
  listCpkReports,
  saveCpkReport,
} from '../src/lib/tools/capability/report-store';
import { askAssistant } from '../src/lib/ai/gateway';

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

function sampleCard() {
  const outcome = runCapabilityAnalysis({
    data: [9.96, 9.98, 10, 10.02, 10.04],
    lsl: 9.9,
    usl: 10.1,
    target: 10,
    benchmark: 1.0,
    language: 'en',
  });
  if (!outcome.ok) throw new Error('expected valid analysis');
  return outcome.card;
}

describe('CPK report model', () => {
  it('converts a decision card into a persistable report', () => {
    const card = sampleCard();
    const report = decisionCardToReport(card, { title: 'Connector Diameter', language: 'en' });

    expect(report.id).toBeTruthy();
    expect(report.toolType).toBe('cpk');
    expect(report.title).toBe('Connector Diameter');
    expect(report.createdAt).toBeTruthy();
    expect(report.decision.tone).toBe('success');
    expect(report.decision.title).toBe('Meets Requirement');
    expect(report.metrics.map((m) => m.label)).toEqual(['Cp', 'Cpk', 'Pp', 'Ppk']);
    expect(report.chart.length).toBe(card.evidence.histogram.bins.length);
    expect(report.metadata.benchmark).toBe(1.0);
    expect(report.metadata.sampleSize).toBe(5);
    expect(report.aiContext.toolType).toBe('process_capability');
    expect(report.aiContext.summaryMetrics.Cp).toBe('1.054');
    expect(report.aiContext.deterministicInterpretation.length).toBeGreaterThan(0);
    expect(report.insights.length).toBeLessThanOrEqual(3);
    expect(report.actions.length).toBeLessThanOrEqual(3);
  });

  it('persists and lists reports with created timestamps', async () => {
    const first = decisionCardToReport(sampleCard(), { title: 'First', language: 'en' });
    await saveCpkReport(first);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = decisionCardToReport(sampleCard(), { title: 'Second', language: 'en' });
    await saveCpkReport(second);

    const stored = await getCpkReport(first.id);
    expect(stored?.title).toBe('First');
    expect(stored?.toolType).toBe('cpk');
    expect(stored?.createdAt).toBeTruthy();

    const list = await listCpkReports(10);
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list[0].id).toBe(second.id); // newest first
  });
});

describe('CPK AI context privacy', () => {
  it('sends only tool type, summary metrics, insights and the question', async () => {
    let captured: { body: Record<string, unknown> } | undefined;
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      captured = { body: JSON.parse(String(init.body)) as Record<string, unknown> };
      return fakeResponse(200, { success: true, answer: 'Advisory explanation.' });
    });

    const card = sampleCard();
    const report = decisionCardToReport(card, { title: 'AI Context', language: 'en' });
    const answer = await askAssistant('Explain this CPK result.', {
      language: 'en',
      aiContext: {
        toolType: report.aiContext.toolType,
        summaryMetrics: report.aiContext.summaryMetrics,
        deterministicInterpretation: report.aiContext.deterministicInterpretation,
      },
    });

    expect(answer).toBe('Advisory explanation.');
    const body = captured?.body as Record<string, unknown>;
    expect(body.task).toBe('chat');
    expect(body.current_tool).toBe('process_capability');
    expect(body.messages).toEqual([{ role: 'user', content: 'Explain this CPK result.' }]);
    expect(body.summary_metrics).toEqual(report.aiContext.summaryMetrics);
    expect(body.deterministic_interpretation).toBe(report.aiContext.deterministicInterpretation);
    expect(body.requires_page_context).toBe(true);

    // Privacy boundary: no raw engineering data keys.
    const keys = Object.keys(body);
    for (const forbidden of ['data', 'lsl', 'usl', 'target', 'item', 'owner', 'raw', 'measurements']) {
      expect(keys).not.toContain(forbidden);
    }
    const payloadString = JSON.stringify(body);
    expect(payloadString).not.toContain('9.96');
    expect(payloadString).not.toContain('connector');
  });
});
