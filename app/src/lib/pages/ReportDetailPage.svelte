<script lang="ts">
  import { get } from 'svelte/store';
  import ActionList from '../components/ActionList.svelte';
  import AiContextButton from '../components/AiContextButton.svelte';
  import Button from '../components/Button.svelte';
  import Card from '../components/Card.svelte';
  import DecisionBanner from '../components/DecisionBanner.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import InsightList from '../components/InsightList.svelte';
  import MetricSummaryBar from '../components/MetricSummaryBar.svelte';
  import { getSampleReport } from '../demo/preview-data';
  import { t } from '../i18n';
  import { showToast } from '../toast';
  import type { RouteParams } from '../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();
  let report = $derived(getSampleReport(params.reportId ?? ''));

  function saveReport(): void {
    showToast(get(t)('reports.saved'), 'success');
  }

  function generateReport(): void {
    showToast(get(t)('reports.generated'), 'success');
  }
</script>

{#if report}
  <div class="report-wrap">
    <section class="page">
      <header class="report-header">
        <h2 class="page-title">{$t(report.titleKey)}</h2>
        <p class="page-desc">
          {$t(`workspace.tools.${report.toolKey}`)} · {report.date}
        </p>
      </header>

      <DecisionBanner
        tone={report.decision.tone}
        title={$t(report.decision.titleKey)}
        description={$t(report.decision.descKey)}
      />

      <Card padded={false}>
        <MetricSummaryBar items={report.metrics} />
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
              x={index * (320 / report.chart.length) + 4}
              y={120 - value * 3}
              width={320 / report.chart.length - 8}
              height={value * 3}
              rx="2"
              fill="var(--color-brand)"
            />
          {/each}
          <line x1="70" y1="4" x2="70" y2="116" stroke="var(--color-danger)" stroke-width="2" />
          <line x1="250" y1="4" x2="250" y2="116" stroke="var(--color-danger)" stroke-width="2" />
          <line x1="160" y1="4" x2="160" y2="116" stroke="var(--color-ink)" stroke-width="2" stroke-dasharray="4 3" />
        </svg>
        <div class="legend">
          <span class="lg"><i class="sw sw-danger"></i>LSL / USL</span>
          <span class="lg"><i class="sw sw-ink"></i>Mean</span>
        </div>
        <p class="note">{$t('reports.chartCaption')}</p>
      </Card>

      <Card>
        <h3 class="section-label">{$t('reports.sections.insights')}</h3>
        <InsightList
          items={report.insights.map((insight) => ({
            severity: insight.severity,
            text: $t(insight.textKey),
          }))}
        />
      </Card>

      <Card>
        <h3 class="section-label">{$t('reports.sections.actions')}</h3>
        <ActionList items={report.actionKeys.map((key) => $t(key))} />
      </Card>

      <AiContextButton
        label={$t('home.copilotEntry')}
        chips={report.metrics.map((metric) => `${metric.label} ${metric.value}`)}
      />
    </section>

    <div class="bottom-bar">
      <Button variant="secondary" onclick={saveReport}>{$t('reports.save')}</Button>
      <Button onclick={generateReport}>{$t('reports.generateReport')}</Button>
    </div>
  </div>
{:else}
  <section class="page">
    <EmptyState message={$t('reports.empty')} />
  </section>
{/if}

<style>
  .report-wrap {
    display: flex;
    flex-direction: column;
  }
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
  .legend {
    display: flex;
    gap: 14px;
    margin: 6px 0 10px;
    font-size: 11px;
    color: var(--color-secondary);
  }
  .lg {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .sw {
    display: inline-block;
    width: 14px;
    height: 3px;
    border-radius: 2px;
  }
  .sw-danger {
    background: var(--color-danger);
  }
  .sw-ink {
    background: var(--color-ink);
  }
  .bottom-bar {
    position: sticky;
    bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
    z-index: 6;
    display: flex;
    gap: 10px;
    padding: 12px var(--space-page-padding);
    background: var(--color-surface);
    border-top: 1px solid var(--color-hairline);
  }
  .bottom-bar :global(button) {
    flex: 1;
  }
</style>
