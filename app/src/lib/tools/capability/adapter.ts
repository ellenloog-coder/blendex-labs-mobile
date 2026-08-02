/**
 * CPK Mobile Adapter (Phase 1.2).
 *
 * Transformation-only layer between the framework-agnostic capability engine
 * (engines/capability) and the Mobile data model (Decision Card, UI spec §2.5).
 * No calculation and no business logic live here: the adapter maps engine
 * output into the mobile-compatible result object.
 */
import {
  calculateCapabilityStats,
  calculateMean,
  calculatePooledWithinStandardDeviation,
  calculateSampleStandardDeviation,
  fmt,
  hasCenteringEffect,
  relationshipCpCpkEn,
  relationshipCpCpkZh,
  relationshipCpkPpkEn,
  relationshipCpkPpkZh,
  relationshipPpPpkEn,
  relationshipPpPpkZh,
  validateInputs,
} from '../../../../../engines/capability/src/index.js';
import type { CapabilityStats, Subgroup } from '../../../../../engines/capability/src/index.js';

export type Locale = 'en' | 'zh';
export type IndexStatus = 'meets' | 'below' | 'na';
export type MetricTone = 'neutral' | 'success' | 'warning' | 'danger';
export type Severity = 'danger' | 'warning' | 'neutral' | 'success';

export interface CapabilityMetric {
  label: string;
  value: string;
  tone: MetricTone;
  status: IndexStatus;
}

export interface CapabilityEvidence {
  sampleSize: number;
  mean: number;
  withinStdDev: number;
  overallStdDev: number;
  min: number;
  max: number;
  oos: number;
  estimatedPpm: { below: number; above: number; total: number };
  normality: { pValue: number; status: string; text: string };
  histogram: { bins: { start: number; end: number; count: number }[]; maxCount: number };
  subgroup: { provided: boolean; count: number; averageSize: number };
  sameStdDevNote: string | null;
}

export interface CapabilityInsight {
  severity: Severity;
  text: string;
}

export interface CapabilityAiContext {
  surface: string;
  summaryMetrics: Record<string, string | number>;
  deterministicInterpretation: string;
  /** Placeholder only — AI integration lands in a later phase (ADR-0002). */
  ready: false;
}

export interface CapabilityDecisionCard {
  valid: boolean;
  errors: string[];
  status: {
    cp: IndexStatus;
    cpk: IndexStatus;
    pp: IndexStatus;
    ppk: IndexStatus;
    decision: IndexStatus;
    label: { en: string; zh: string };
    benchmark: number;
  };
  metrics: CapabilityMetric[];
  evidence: CapabilityEvidence;
  insights: CapabilityInsight[];
  actions: string[];
  aiContext: CapabilityAiContext;
}

export interface CapabilityAnalysisInput {
  data: number[];
  lsl: number;
  usl: number;
  target?: number;
  benchmark: number;
  itemName?: string;
  owner?: string;
  subgroups?: Subgroup[];
  language?: Locale;
}

export type CapabilityOutcome =
  | { ok: true; card: CapabilityDecisionCard }
  | { ok: false; errors: string[] };

const DECISION_LABELS: Record<IndexStatus, { en: string; zh: string }> = {
  meets: { en: 'Meets Requirement', zh: '达到能力要求' },
  below: { en: 'Below Requirement', zh: '未满足能力要求' },
  na: { en: 'Not Available', zh: '不可用' },
};

function indexStatus(value: number, benchmark: number): IndexStatus {
  if (!Number.isFinite(value)) return 'na';
  return value >= benchmark ? 'meets' : 'below';
}

function worstStatus(statuses: IndexStatus[]): IndexStatus {
  if (statuses.includes('below')) return 'below';
  if (statuses.includes('na')) return 'na';
  return 'meets';
}

function toneFor(status: IndexStatus): MetricTone {
  if (status === 'meets') return 'success';
  if (status === 'below') return 'warning';
  return 'neutral';
}

function emptyCard(errors: string[]): CapabilityDecisionCard {
  const statuses = { cp: 'na' as IndexStatus, cpk: 'na' as IndexStatus, pp: 'na' as IndexStatus, ppk: 'na' as IndexStatus };
  return {
    valid: false,
    errors,
    status: { ...statuses, decision: 'na', label: DECISION_LABELS.na, benchmark: NaN },
    metrics: [],
    evidence: {
      sampleSize: 0,
      mean: NaN,
      withinStdDev: NaN,
      overallStdDev: NaN,
      min: NaN,
      max: NaN,
      oos: 0,
      estimatedPpm: { below: NaN, above: NaN, total: NaN },
      normality: { pValue: NaN, status: '', text: '' },
      histogram: { bins: [], maxCount: 0 },
      subgroup: { provided: false, count: 0, averageSize: 0 },
      sameStdDevNote: null,
    },
    insights: [],
    actions: [],
    aiContext: { surface: 'cpk-analysis', summaryMetrics: {}, deterministicInterpretation: '', ready: false },
  };
}

function buildInsights(stats: CapabilityStats, zh: boolean): CapabilityInsight[] {
  const insights: CapabilityInsight[] = [];

  if (hasCenteringEffect(stats.cp, stats.cpk)) {
    insights.push({ severity: 'warning', text: zh ? relationshipCpCpkZh(stats) : relationshipCpCpkEn(stats) });
  } else if (hasCenteringEffect(stats.pp, stats.ppk)) {
    insights.push({ severity: 'warning', text: zh ? relationshipPpPpkZh(stats) : relationshipPpPpkEn(stats) });
  }

  if (stats.oos > 0) {
    insights.push({
      severity: 'danger',
      text: zh
        ? `当前样本中有 ${stats.oos} 个观测值超出规格限。`
        : `${stats.oos} observation(s) outside specification limits in the current sample.`,
    });
  } else {
    insights.push({
      severity: 'neutral',
      text: zh ? '当前样本中无超规格观测值。' : 'No observations outside specification limits in the current sample.',
    });
  }

  if (!stats.subgroup.provided && Number.isFinite(stats.cpk) && Number.isFinite(stats.ppk)) {
    insights.push({ severity: 'neutral', text: zh ? relationshipCpkPpkZh(stats) : relationshipCpkPpkEn(stats) });
  }

  if (
    insights.length < 3 &&
    Number.isFinite(stats.normality.pValue) &&
    stats.normality.pValue < 0.05
  ) {
    insights.push({ severity: 'warning', text: stats.normality.interpretation.text });
  }

  return insights.slice(0, 3);
}

function buildActions(stats: CapabilityStats, decision: IndexStatus, centering: boolean, zh: boolean): string[] {
  const actions: string[] = [];
  if (decision === 'below') {
    actions.push(
      centering
        ? zh
          ? '评审过程居中性——居中后指数低于对应的离散程度指数。'
          : 'Review process centering — the centered index is below the corresponding spread index.'
        : zh
          ? '评审过程变差与规格宽度的关系。'
          : 'Review process variation relative to the specification width.',
    );
  }
  actions.push(
    zh
      ? '在形成更广泛结论前，使用控制图评审过程稳定性。'
      : 'Review process stability with control charts before drawing broader conclusions.',
  );
  actions.push(
    zh
      ? '在形成更广泛结论前，评审分布（正态性）假设。'
      : 'Review distribution assumptions before drawing broader conclusions.',
  );
  return actions.slice(0, 3);
}

/** Transform a capability engine result into the Mobile Decision Card model. */
export function adaptCapabilityResult(
  stats: CapabilityStats | null | undefined,
  language: Locale = 'en',
): CapabilityDecisionCard {
  if (!stats || typeof stats !== 'object' || !Number.isFinite(stats.n)) {
    return emptyCard(['Engine result is missing or invalid.']);
  }

  const zh = language === 'zh';
  const cp = indexStatus(stats.cp, stats.bm);
  const cpk = indexStatus(stats.cpk, stats.bm);
  const pp = indexStatus(stats.pp, stats.bm);
  const ppk = indexStatus(stats.ppk, stats.bm);
  const decision = worstStatus([cp, cpk, pp, ppk]);
  const centering = hasCenteringEffect(stats.cp, stats.cpk) || hasCenteringEffect(stats.pp, stats.ppk);
  const insights = buildInsights(stats, zh);
  const actions = buildActions(stats, decision, centering, zh);
  const sameStdDevNote =
    !stats.subgroup.provided && Number.isFinite(stats.cpk) && Number.isFinite(stats.ppk)
      ? zh
        ? relationshipCpkPpkZh(stats)
        : relationshipCpkPpkEn(stats)
      : null;

  const metrics: CapabilityMetric[] = [
    { label: 'Cp', value: fmt(stats.cp), tone: toneFor(cp), status: cp },
    { label: 'Cpk', value: fmt(stats.cpk), tone: toneFor(cpk), status: cpk },
    { label: 'Pp', value: fmt(stats.pp), tone: toneFor(pp), status: pp },
    { label: 'Ppk', value: fmt(stats.ppk), tone: toneFor(ppk), status: ppk },
  ];

  return {
    valid: true,
    errors: [],
    status: {
      cp,
      cpk,
      pp,
      ppk,
      decision,
      label: DECISION_LABELS[decision],
      benchmark: stats.bm,
    },
    metrics,
    evidence: {
      sampleSize: stats.n,
      mean: stats.avg,
      withinStdDev: stats.within,
      overallStdDev: stats.overall,
      min: stats.min,
      max: stats.max,
      oos: stats.oos,
      estimatedPpm: {
        below: stats.estimatedPpm.below,
        above: stats.estimatedPpm.above,
        total: stats.estimatedPpm.total,
      },
      normality: {
        pValue: stats.normality.pValue,
        status: stats.normality.interpretation.status,
        text: stats.normality.interpretation.text,
      },
      histogram: { bins: stats.histogram.bins, maxCount: stats.histogram.maxCount },
      subgroup: {
        provided: stats.subgroup.provided,
        count: stats.subgroup.count,
        averageSize: stats.subgroup.averageSize,
      },
      sameStdDevNote,
    },
    insights,
    actions,
    aiContext: {
      surface: 'cpk-analysis',
      summaryMetrics: {
        Cp: fmt(stats.cp),
        Cpk: fmt(stats.cpk),
        Pp: fmt(stats.pp),
        Ppk: fmt(stats.ppk),
        n: stats.n,
        OOS: stats.oos,
      },
      deterministicInterpretation: insights.map((insight) => insight.text).join(' '),
      ready: false,
    },
  };
}

/**
 * Validate + calculate + transform in one call. Pure composition of engine
 * functions and the adapter; no business logic in this layer.
 */
export function runCapabilityAnalysis(input: CapabilityAnalysisInput): CapabilityOutcome {
  const data = Array.isArray(input.data) ? input.data.filter(Number.isFinite) : [];
  const subgroups = input.subgroups ?? [];
  const average = data.length ? calculateMean(data) : NaN;
  const overall = data.length >= 2 ? calculateSampleStandardDeviation(data, average) : NaN;
  const within = subgroups.length ? calculatePooledWithinStandardDeviation(subgroups) : overall;

  const validation = validateInputs({
    data,
    lsl: input.lsl,
    usl: input.usl,
    benchmark: input.benchmark,
    standardDeviation: within,
    subgroupMode: subgroups.length > 0,
    subgroups,
  });

  if (validation.errors.length > 0) {
    return { ok: false, errors: validation.errors };
  }

  const stats = calculateCapabilityStats({
    data,
    lsl: input.lsl,
    usl: input.usl,
    target: input.target,
    benchmark: input.benchmark,
    item: input.itemName ?? 'Not specified',
    owner: input.owner ?? 'Not specified',
    ignored: 0,
    subgroups,
  });

  return { ok: true, card: adaptCapabilityResult(stats, input.language ?? 'en') };
}
