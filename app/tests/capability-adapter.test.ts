import { describe, expect, it } from 'vitest';
import {
  adaptCapabilityResult,
  runCapabilityAnalysis,
} from '../src/lib/tools/capability/adapter';
import type { CapabilityAnalysisInput } from '../src/lib/tools/capability/adapter';
import { calculateCapabilityStats } from '../../engines/capability/src/index.js';
import type { CapabilityStats } from '../../engines/capability/src/index.js';

const VALID_INPUT: CapabilityAnalysisInput = {
  data: [9.96, 9.98, 10, 10.02, 10.04],
  lsl: 9.9,
  usl: 10.1,
  target: 10,
  benchmark: 1.0,
  language: 'en',
};

describe('CPK mobile adapter', () => {
  it('maps a valid engine result into the Decision Card structure', () => {
    const outcome = runCapabilityAnalysis({ ...VALID_INPUT });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    const card = outcome.card;
    expect(card.valid).toBe(true);
    expect(card.errors).toEqual([]);

    // status mapping
    expect(card.status.cp).toBe('meets');
    expect(card.status.cpk).toBe('meets');
    expect(card.status.pp).toBe('meets');
    expect(card.status.ppk).toBe('meets');
    expect(card.status.decision).toBe('meets');
    expect(card.status.label.en).toBe('Meets Requirement');
    expect(card.status.benchmark).toBe(1.0);

    // metrics
    expect(card.metrics.map((m) => m.label)).toEqual(['Cp', 'Cpk', 'Pp', 'Ppk']);
    expect(card.metrics[0].value).toBe('1.054');
    expect(card.metrics[0].tone).toBe('success');

    // evidence
    expect(card.evidence.sampleSize).toBe(5);
    expect(card.evidence.mean).toBe(10);
    expect(card.evidence.withinStdDev).toBeCloseTo(card.evidence.overallStdDev, 12);
    expect(card.evidence.oos).toBe(0);
    expect(card.evidence.estimatedPpm.total).toBeCloseTo(1565.534, 1);
    expect(card.evidence.sameStdDevNote).toContain('Cp = Pp and Cpk = Ppk');
    expect(card.evidence.subgroup.provided).toBe(false);

    // insights / actions (max 3 each)
    expect(card.insights.length).toBeLessThanOrEqual(3);
    expect(card.actions.length).toBeLessThanOrEqual(3);

    // aiContext placeholder
    expect(card.aiContext.surface).toBe('cpk-analysis');
    expect(card.aiContext.summaryMetrics.Cp).toBe('1.054');
    expect(card.aiContext.summaryMetrics.n).toBe(5);
    expect(card.aiContext.ready).toBe(false);
    expect(card.aiContext.deterministicInterpretation.length).toBeGreaterThan(0);
  });

  it('maps status per index and derives the overall decision', () => {
    const outcome = runCapabilityAnalysis({
      ...VALID_INPUT,
      data: [10.05, 10.06, 10.07, 10.08, 10.09],
      benchmark: 1.33,
    });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    const card = outcome.card;
    expect(card.status.cp).toBe('meets');
    expect(card.status.cpk).toBe('below');
    expect(card.status.decision).toBe('below');
    expect(card.status.label.en).toBe('Below Requirement');
    expect(card.metrics[1].label).toBe('Cpk');
    expect(card.metrics[1].status).toBe('below');
    expect(card.metrics[1].tone).toBe('warning');
  });

  it('handles non-finite engine values without crashing', () => {
    const stats = calculateCapabilityStats({
      data: [10, 10],
      lsl: 9,
      usl: 11,
      benchmark: 1.33,
    });
    // Zero standard deviation yields Infinity indices in raw engine output.
    expect(Number.isFinite(stats.cp)).toBe(false);
    const card = adaptCapabilityResult(stats);
    expect(card.valid).toBe(true);
    expect(card.status.cp).toBe('na');
    expect(card.metrics[0].value).toBe('N/A');
    expect(card.status.decision).toBe('na');
  });

  it('handles a missing engine result gracefully', () => {
    const card = adaptCapabilityResult(null);
    expect(card.valid).toBe(false);
    expect(card.errors).toContain('Engine result is missing or invalid.');
    expect(card.metrics).toEqual([]);
  });

  it('returns validation errors for invalid inputs', () => {
    const empty = runCapabilityAnalysis({ ...VALID_INPUT, data: [] });
    expect(empty.ok).toBe(false);
    if (empty.ok) return;
    expect(empty.errors).toContain('Please enter at least two valid numeric values.');

    const badSpecs = runCapabilityAnalysis({ ...VALID_INPUT, lsl: 10, usl: 9 });
    expect(badSpecs.ok).toBe(false);
    if (badSpecs.ok) return;
    expect(badSpecs.errors).toContain('LSL must be lower than USL.');

    const badBenchmark = runCapabilityAnalysis({ ...VALID_INPUT, benchmark: 0 });
    expect(badBenchmark.ok).toBe(false);
    if (badBenchmark.ok) return;
    expect(badBenchmark.errors).toContain('Please enter a capability requirement greater than 0.');

    const badSubgroups = runCapabilityAnalysis({
      ...VALID_INPUT,
      subgroups: [{ id: '1', values: [10.01] }, { id: '2', values: [10.02] }],
    });
    expect(badSubgroups.ok).toBe(false);
    if (badSubgroups.ok) return;
    expect(badSubgroups.errors).toContain('Each subgroup must contain at least two observations.');
  });

  it('produces Chinese labels and insights when language is zh', () => {
    const outcome = runCapabilityAnalysis({ ...VALID_INPUT, language: 'zh' });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const card = outcome.card;
    expect(card.status.label.zh).toBe('达到能力要求');
    expect(card.aiContext.deterministicInterpretation).toMatch(/样本/);
    expect(card.evidence.sameStdDevNote).toContain('Cp = Pp');
  });

  it('keeps the adapter a pure transformation of the engine result', () => {
    const stats: CapabilityStats = calculateCapabilityStats({
      data: [9.96, 9.98, 10, 10.02, 10.04],
      lsl: 9.9,
      usl: 10.1,
      benchmark: 1.33,
      item: 'Part A',
      owner: 'Team',
    });
    const card = adaptCapabilityResult(stats);
    expect(card.evidence.sampleSize).toBe(stats.n);
    expect(card.metrics[0].value).toBe(stats.cp.toFixed(3));
  });
});
