/**
 * CPK report export (Phase 1.4 follow-up).
 *
 * Local-only export: renders the report as a readable Markdown file and
 * shares/downloads it. No backend, no raw measurement data (the report
 * record never contains raw data).
 */
import type { CpkReport } from './report';

export type ExportLanguage = 'en' | 'zh';

const L = {
  en: {
    tool: 'Tool',
    created: 'Created',
    decision: 'Decision',
    metrics: 'Metrics',
    evidence: 'Evidence',
    sampleSize: 'Sample size',
    mean: 'Mean',
    within: 'Within σ',
    overall: 'Overall σ',
    min: 'Min',
    max: 'Max',
    oos: 'Out of spec',
    ppm: 'Estimated total PPM',
    normality: 'Normality (p)',
    insights: 'Insights',
    actions: 'Actions',
  },
  zh: {
    tool: '工具',
    created: '时间',
    decision: '决策',
    metrics: '指标',
    evidence: '证据',
    sampleSize: '样本量',
    mean: '均值',
    within: '组内 σ',
    overall: '整体 σ',
    min: '最小值',
    max: '最大值',
    oos: '超规格数',
    ppm: '估计总 PPM',
    normality: '正态性 (p)',
    insights: '洞察',
    actions: '行动',
  },
};

export function buildReportText(report: CpkReport, language: ExportLanguage = 'en'): string {
  const l = L[language];
  const lines: string[] = [
    `# ${report.title}`,
    '',
    `- ${l.tool}: Process Capability (CPK)`,
    `- ${l.created}: ${report.createdAt}`,
    `- ${l.decision}: ${report.decision.title}`,
    '',
    `## ${l.metrics}`,
    ...report.metrics.map((metric) => `- ${metric.label}: ${metric.value}`),
    '',
    `## ${l.evidence}`,
    `- ${l.sampleSize}: ${report.evidence.sampleSize}`,
    `- ${l.mean}: ${report.evidence.mean}`,
    `- ${l.within}: ${report.evidence.withinStdDev}`,
    `- ${l.overall}: ${report.evidence.overallStdDev}`,
    `- ${l.min}: ${report.evidence.min}`,
    `- ${l.max}: ${report.evidence.max}`,
    `- ${l.oos}: ${report.evidence.oos}`,
    `- ${l.ppm}: ${report.evidence.estimatedPpm.total}`,
    `- ${l.normality}: ${report.evidence.normality.pValue}`,
    '',
    `## ${l.insights}`,
    ...report.insights.map((insight) => `- [${insight.severity}] ${insight.text}`),
    '',
    `## ${l.actions}`,
    ...report.actions.map((action) => `- ${action}`),
  ];
  return lines.join('\n');
}

function safeFileName(title: string): string {
  const cleaned = title
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || 'cpk-report';
}

export async function exportCpkReport(
  report: CpkReport,
  language: ExportLanguage = 'en',
): Promise<'shared' | 'downloaded'> {
  const text = buildReportText(report, language);
  const fileName = `${safeFileName(report.title)}.md`;
  const file = new File([text], fileName, { type: 'text/markdown;charset=utf-8' });

  // Mobile-first: use the Web Share API when the browser can share files
  // (iOS Safari / Android Chrome). Falls back to a direct download.
  if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
    try {
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: report.title });
        return 'shared';
      }
    } catch {
      // User cancelled the share sheet — treat as done.
      return 'shared';
    }
  }

  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Defer revocation so iOS Safari can finish the download.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}
