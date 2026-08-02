<script lang="ts">
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import ActionList from '../../components/ActionList.svelte';
  import AiContextButton from '../../components/AiContextButton.svelte';
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  import CpkEvidenceRows from '../../components/tools/CpkEvidenceRows.svelte';
  import DecisionBanner from '../../components/DecisionBanner.svelte';
  import EmptyState from '../../components/EmptyState.svelte';
  import InsightList from '../../components/InsightList.svelte';
  import MetricSummaryBar from '../../components/MetricSummaryBar.svelte';
  import { setPendingAiContext } from '../../ai/pending-context';
  import { getCpkReport } from '../../tools/capability/report-store';
  import type { CpkReport } from '../../tools/capability/report';
  import { exportCpkReport } from '../../tools/capability/report-export';
  import { locale, t } from '../../i18n';
  import { navigate } from '../../router';
  import { showToast } from '../../toast';
  import type { RouteParams } from '../../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();
  let report = $state<CpkReport | null>(null);
  let loading = $state(true);

  onMount(async () => {
    report = (await getCpkReport(params.reportId ?? '')) ?? null;
    loading = false;
  });

  function formatTime(iso: string): string {
    const date = new Date(iso);
    const tag = get(locale) === 'zh-CN' ? 'zh-CN' : 'en-US';
    return date.toLocaleString(tag, {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function askAi(): void {
    if (!report) return;
    setPendingAiContext({
      toolType: report.aiContext.toolType,
      summaryMetrics: report.aiContext.summaryMetrics,
      deterministicInterpretation: report.aiContext.deterministicInterpretation,
      question: get(t)('cpk.explainPrompt'),
    });
    navigate('/assistant');
  }

  async function onExport(): Promise<void> {
    if (!report) return;
    await exportCpkReport(report, get(locale) === 'zh-CN' ? 'zh' : 'en');
    showToast(get(t)('cpk.exported'), 'success');
  }
</script>

{#if loading}
  <section class="page">
    <EmptyState message={$t('common.loading')} />
  </section>
{:else if report}
  <section class="page">
    <header class="report-header">
      <h2 class="page-title">{report.title}</h2>
      <p class="page-desc">{$t('workspace.tools.cpk')} · {formatTime(report.createdAt)}</p>
    </header>

    <DecisionBanner tone={report.decision.tone} title={report.decision.title} />

    <Card padded={false}>
      <MetricSummaryBar
        items={report.metrics.map((metric) => ({
          label: metric.label,
          value: metric.value,
          tone: metric.tone,
        }))}
      />
    </Card>

    <Card>
      <h3 class="section-label">{$t('reports.chartTitle')}</h3>
      <svg
        viewBox="0 0 320 120"
        preserveAspectRatio="none"
        class="chart"
        role="img"
        aria-label={$t('reports.chartTitle')}
      >
        {#each report.chart as value, index (index)}
          <rect
            x={index * (320 / Math.max(report.chart.length, 1)) + 4}
            y={120 - value * 4}
            width={320 / Math.max(report.chart.length, 1) - 8}
            height={value * 4}
            rx="2"
            fill="var(--color-brand)"
          />
        {/each}
      </svg>
      <p class="note">{$t('reports.chartCaption')}</p>
    </Card>

    <Card>
      <h3 class="section-label">{$t('cpk.evidenceTitle')}</h3>
      <CpkEvidenceRows evidence={report.evidence} />
    </Card>

    <Card>
      <h3 class="section-label">{$t('reports.sections.insights')}</h3>
      <InsightList
        items={report.insights.map((insight) => ({
          severity: insight.severity,
          text: insight.text,
        }))}
      />
    </Card>

    <Card>
      <h3 class="section-label">{$t('reports.sections.actions')}</h3>
      <ActionList items={report.actions} />
    </Card>

    <AiContextButton
      label={$t('home.copilotEntry')}
      chips={['Cp ' + report.aiContext.summaryMetrics.Cp, 'Cpk ' + report.aiContext.summaryMetrics.Cpk, 'n ' + report.aiContext.summaryMetrics.n]}
      onclick={askAi}
    />
    <Button variant="secondary" onclick={onExport}>
      {$t('cpk.exportReport')}
    </Button>
    <p class="note note-center">{$t('cpk.aiNote')}</p>
  </section>
{:else}
  <section class="page">
    <EmptyState message={$t('reports.empty')} />
  </section>
{/if}

<style>
  .report-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .chart {
    width: 100%;
    height: 120px;
    margin: 12px 0 6px;
  }
  .note-center {
    text-align: center;
  }
</style>
