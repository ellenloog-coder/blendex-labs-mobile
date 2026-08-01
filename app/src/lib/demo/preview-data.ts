/**
 * Phase 0.2 product-preview mock data. This layer is UI-facing only:
 * it holds sample content so the product experience can be validated
 * without any engine, AI backend, user system, or cloud service.
 */

export type ToolStatus = 'available' | 'beta' | 'coming-soon';
export type ReportStatus = 'completed' | 'needs-review' | 'draft' | 'failed';
export type MetricTone = 'neutral' | 'success' | 'warning' | 'danger';
export type Severity = 'danger' | 'warning' | 'neutral' | 'success';
export type DecisionTone = 'success' | 'warning' | 'danger';

export interface QualityTool {
  id: string;
  colorVar: string;
  status: ToolStatus;
  /** i18n keys under `toolPreview.steps.*` describing the spec flow. */
  flow: string[];
}

export const qualityTools: QualityTool[] = [
  {
    id: 'cpk',
    colorVar: 'var(--color-tool-cpk)',
    status: 'available',
    flow: ['entry', 'analysis', 'decisionCard'],
  },
  {
    id: 'msa',
    colorVar: 'var(--color-tool-msa)',
    status: 'available',
    flow: ['studySetup', 'dataCollection', 'result'],
  },
  {
    id: 'spc',
    colorVar: 'var(--color-tool-spc)',
    status: 'beta',
    flow: ['monitoring', 'decisionCard'],
  },
  {
    id: 'doe',
    colorVar: 'var(--color-tool-doe)',
    status: 'beta',
    flow: ['experimentOverview', 'runTracking', 'result'],
  },
  {
    id: 'd8',
    colorVar: 'var(--color-tool-8d)',
    status: 'beta',
    flow: ['problemOverview', 'decisionCard'],
  },
  {
    id: 'reliability',
    colorVar: 'var(--color-tool-reliability)',
    status: 'coming-soon',
    flow: ['lifeDataInput', 'result'],
  },
  {
    id: 'sampling',
    colorVar: 'var(--color-tool-sampling)',
    status: 'coming-soon',
    flow: ['inspectionSetup', 'inspectionResult', 'decisionCard'],
  },
];

const TOOL_COLORS: Record<string, string> = {
  cpk: 'var(--color-tool-cpk)',
  msa: 'var(--color-tool-msa)',
  spc: 'var(--color-tool-spc)',
  doe: 'var(--color-tool-doe)',
  d8: 'var(--color-tool-8d)',
  reliability: 'var(--color-tool-reliability)',
  sampling: 'var(--color-tool-sampling)',
};

export function getTool(id: string): QualityTool | undefined {
  return qualityTools.find((tool) => tool.id === id);
}

export function getToolColor(toolKey: string): string {
  return TOOL_COLORS[toolKey] ?? 'var(--color-brand)';
}

export interface SampleMetric {
  label: string;
  value: string;
  tone: MetricTone;
}

export interface SampleInsight {
  severity: Severity;
  textKey: string;
}

export interface SampleReport {
  id: string;
  toolKey: string;
  custom?: boolean;
  status: ReportStatus;
  titleKey: string;
  descKey: string;
  date: string;
  decision: { tone: DecisionTone; titleKey: string; descKey: string };
  metrics: SampleMetric[];
  insights: SampleInsight[];
  actionKeys: string[];
  chart: number[];
}

export const sampleReports: SampleReport[] = [
  {
    id: 'cpk-connector',
    toolKey: 'cpk',
    status: 'completed',
    titleKey: 'reports.samples.connector.title',
    descKey: 'reports.samples.connector.desc',
    date: '2026-07-30',
    decision: {
      tone: 'warning',
      titleKey: 'reports.decision.marginal',
      descKey: 'reports.decision.marginalDesc',
    },
    metrics: [
      { label: 'Cp', value: '1.45', tone: 'neutral' },
      { label: 'Cpk', value: '1.12', tone: 'warning' },
      { label: 'Pp', value: '1.60', tone: 'neutral' },
      { label: 'Ppk', value: '1.08', tone: 'warning' },
    ],
    insights: [
      { severity: 'warning', textKey: 'reports.insights.cpkBelow' },
      { severity: 'warning', textKey: 'reports.insights.ppkGap' },
      { severity: 'neutral', textKey: 'reports.insights.stabilityCheck' },
    ],
    actionKeys: ['reports.actions.confirmChart', 'reports.actions.reviewMsa', 'reports.actions.checkRepresentativeness'],
    chart: [6, 12, 20, 30, 18, 9, 5],
  },
  {
    id: 'spc-inlet',
    toolKey: 'spc',
    status: 'needs-review',
    titleKey: 'reports.samples.inlet.title',
    descKey: 'reports.samples.inlet.desc',
    date: '2026-07-29',
    decision: {
      tone: 'danger',
      titleKey: 'reports.decision.outOfControl',
      descKey: 'reports.decision.outOfControlDesc',
    },
    metrics: [
      { label: 'Status', value: 'Alert', tone: 'danger' },
      { label: 'OOC', value: '2', tone: 'danger' },
      { label: 'Trend', value: '7 pts', tone: 'warning' },
      { label: 'Sigma', value: '1.8', tone: 'neutral' },
    ],
    insights: [
      { severity: 'danger', textKey: 'reports.insights.trend7' },
      { severity: 'danger', textKey: 'reports.insights.oocPoints' },
      { severity: 'neutral', textKey: 'reports.insights.assignableCauses' },
    ],
    actionKeys: ['reports.actions.investigateOoc', 'reports.actions.confirmChart', 'reports.actions.planVerification'],
    chart: [10, 14, 18, 22, 16, 12, 8],
  },
  {
    id: 'msa-caliper',
    toolKey: 'msa',
    status: 'completed',
    titleKey: 'reports.samples.caliper.title',
    descKey: 'reports.samples.caliper.desc',
    date: '2026-07-28',
    decision: {
      tone: 'success',
      titleKey: 'reports.decision.acceptable',
      descKey: 'reports.decision.acceptableDesc',
    },
    metrics: [
      { label: '%GRR', value: '18.4%', tone: 'warning' },
      { label: 'ndc', value: '7', tone: 'neutral' },
      { label: 'EV', value: '10%', tone: 'neutral' },
      { label: 'AV', value: '8%', tone: 'neutral' },
    ],
    insights: [
      { severity: 'success', textKey: 'reports.insights.grrAcceptable' },
      { severity: 'warning', textKey: 'reports.insights.grrNearLimit' },
      { severity: 'neutral', textKey: 'reports.insights.stabilityCheck' },
    ],
    actionKeys: ['reports.actions.reviewMsa', 'reports.actions.confirmChart', 'reports.actions.planVerification'],
    chart: [5, 9, 16, 24, 20, 13, 6],
  },
  {
    id: 'doe-torque',
    toolKey: 'doe',
    custom: true,
    status: 'draft',
    titleKey: 'reports.samples.torque.title',
    descKey: 'reports.samples.torque.desc',
    date: '2026-07-27',
    decision: {
      tone: 'warning',
      titleKey: 'reports.decision.needsConfirmation',
      descKey: 'reports.decision.needsConfirmationDesc',
    },
    metrics: [
      { label: 'R²', value: '92%', tone: 'neutral' },
      { label: 'Factors', value: '3', tone: 'neutral' },
      { label: 'Runs', value: '16', tone: 'neutral' },
      { label: 'Significant', value: '2', tone: 'warning' },
    ],
    insights: [
      { severity: 'warning', textKey: 'reports.insights.twoSignificant' },
      { severity: 'neutral', textKey: 'reports.insights.checkResiduals' },
      { severity: 'neutral', textKey: 'reports.insights.factorHierarchy' },
    ],
    actionKeys: ['reports.actions.checkSignificance', 'reports.actions.planVerification', 'reports.actions.confirmChart'],
    chart: [12, 18, 24, 28, 22, 14, 8],
  },
  {
    id: 'd8-4821',
    toolKey: 'd8',
    status: 'needs-review',
    titleKey: 'reports.samples.d8.title',
    descKey: 'reports.samples.d8.desc',
    date: '2026-07-26',
    decision: {
      tone: 'warning',
      titleKey: 'reports.decision.verificationPending',
      descKey: 'reports.decision.verificationPendingDesc',
    },
    metrics: [
      { label: 'D3', value: '✓', tone: 'success' },
      { label: 'D4', value: '✓', tone: 'success' },
      { label: 'D5', value: '✓', tone: 'success' },
      { label: 'D6', value: 'Pending', tone: 'warning' },
    ],
    insights: [
      { severity: 'warning', textKey: 'reports.insights.verificationPending' },
      { severity: 'success', textKey: 'reports.insights.rootCauseConfirmed' },
      { severity: 'neutral', textKey: 'reports.insights.containmentActive' },
    ],
    actionKeys: ['reports.actions.planVerification', 'reports.actions.confirmChart', 'reports.actions.checkSignificance'],
    chart: [7, 11, 15, 19, 24, 17, 10],
  },
];

export function getSampleReport(id: string): SampleReport | undefined {
  return sampleReports.find((report) => report.id === id);
}

export interface DemoConversationItem {
  id: string;
  titleKey: string;
  summaryKey: string;
  timeKey: string;
}

export const demoRecentConversations: DemoConversationItem[] = [
  {
    id: 'c1',
    titleKey: 'assistant.recent.c1',
    summaryKey: 'assistant.recent.c1Summary',
    timeKey: 'assistant.time.h2',
  },
  {
    id: 'c2',
    titleKey: 'assistant.recent.c2',
    summaryKey: 'assistant.recent.c2Summary',
    timeKey: 'assistant.time.d1',
  },
  {
    id: 'c3',
    titleKey: 'assistant.recent.c3',
    summaryKey: 'assistant.recent.c3Summary',
    timeKey: 'assistant.time.d2',
  },
];

export const demoPopularTopics: string[] = [
  'assistant.topics.t1',
  'assistant.topics.t2',
  'assistant.topics.t3',
  'assistant.topics.t4',
  'assistant.topics.t5',
  'assistant.topics.t6',
];

/** Picks a localized demo reply key. No AI backend is involved. */
export function pickDemoReply(message: string): string {
  const text = message.toLowerCase();
  if (/cpk|ppk|capabilit|c[ap]/.test(text)) return 'assistant.demoReply.cpk';
  if (/msa|grr|kappa|gage/.test(text)) return 'assistant.demoReply.msa';
  if (/spc|control chart|trend|sigma/.test(text)) return 'assistant.demoReply.spc';
  if (/doe|factorial|design|factor/.test(text)) return 'assistant.demoReply.doe';
  return 'assistant.demoReply.general';
}
