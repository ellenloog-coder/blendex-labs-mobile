/**
 * CPK Report Model (Phase 1.4).
 *
 * Pure presentation model: converts a Capability Decision Card into a
 * persistable report record. No calculation and no UI logic here.
 */
import type { AiChatContext } from '../../ai/gateway';
import type {
  CapabilityDecisionCard,
  CapabilityEvidence,
  CapabilityInsight,
  CapabilityMetric,
} from './adapter';

export interface CpkReport {
  id: string;
  toolType: 'cpk';
  title: string;
  createdAt: string;
  decision: { tone: 'success' | 'warning' | 'danger'; title: string };
  metrics: CapabilityMetric[];
  evidence: CapabilityEvidence;
  insights: CapabilityInsight[];
  actions: string[];
  /** Histogram bin counts for the chart preview. */
  chart: number[];
  metadata: { benchmark: number; language: 'en' | 'zh'; sampleSize: number };
  aiContext: AiChatContext;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `report-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function decisionCardToReport(
  card: CapabilityDecisionCard,
  options: { title: string; language: 'en' | 'zh' },
): CpkReport {
  const tone =
    card.status.decision === 'meets'
      ? 'success'
      : card.status.decision === 'below'
        ? 'danger'
        : 'warning';
  return {
    id: newId(),
    toolType: 'cpk',
    title: options.title,
    createdAt: new Date().toISOString(),
    decision: {
      tone,
      title: options.language === 'zh' ? card.status.label.zh : card.status.label.en,
    },
    metrics: card.metrics.map((metric) => ({ ...metric })),
    // Deep-copy into plain objects: $state-proxied values are not
    // structured-cloneable (IndexedDB throws DataCloneError).
    evidence: {
      sampleSize: card.evidence.sampleSize,
      mean: card.evidence.mean,
      withinStdDev: card.evidence.withinStdDev,
      overallStdDev: card.evidence.overallStdDev,
      min: card.evidence.min,
      max: card.evidence.max,
      oos: card.evidence.oos,
      estimatedPpm: {
        below: card.evidence.estimatedPpm.below,
        above: card.evidence.estimatedPpm.above,
        total: card.evidence.estimatedPpm.total,
      },
      normality: {
        pValue: card.evidence.normality.pValue,
        status: card.evidence.normality.status,
        text: card.evidence.normality.text,
      },
      histogram: {
        bins: card.evidence.histogram.bins.map((bin) => ({
          start: bin.start,
          end: bin.end,
          count: bin.count,
        })),
        maxCount: card.evidence.histogram.maxCount,
      },
      subgroup: {
        provided: card.evidence.subgroup.provided,
        count: card.evidence.subgroup.count,
        averageSize: card.evidence.subgroup.averageSize,
      },
      sameStdDevNote: card.evidence.sameStdDevNote,
    },
    insights: card.insights.map((insight) => ({ ...insight })),
    actions: [...card.actions],
    chart: card.evidence.histogram.bins.map((bin) => bin.count),
    metadata: {
      benchmark: card.status.benchmark,
      language: options.language,
      sampleSize: card.evidence.sampleSize,
    },
    aiContext: {
      toolType: 'process_capability',
      summaryMetrics: { ...card.aiContext.summaryMetrics },
      deterministicInterpretation: card.aiContext.deterministicInterpretation,
    },
  };
}
