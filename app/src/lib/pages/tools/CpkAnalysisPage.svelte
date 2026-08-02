<script lang="ts">
  import { get } from 'svelte/store';
  import ActionList from '../../components/ActionList.svelte';
  import AiContextButton from '../../components/AiContextButton.svelte';
  import Button from '../../components/Button.svelte';
  import Card from '../../components/Card.svelte';
  import DecisionBanner from '../../components/DecisionBanner.svelte';
  import CpkEvidenceRows from '../../components/tools/CpkEvidenceRows.svelte';
  import InsightList from '../../components/InsightList.svelte';
  import Input from '../../components/Input.svelte';
  import MetricSummaryBar from '../../components/MetricSummaryBar.svelte';
  import { parseMeasurementData } from '../../../../../engines/capability/src/index.js';
  import { runCapabilityAnalysis } from '../../tools/capability/adapter';
  import type { CapabilityOutcome } from '../../tools/capability/adapter';
  import { decisionCardToReport } from '../../tools/capability/report';
  import { saveCpkReport } from '../../tools/capability/report-store';
  import { locale, t } from '../../i18n';
  import { showToast } from '../../toast';
  import type { RouteParams } from '../../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();

  let dataText = $state('');
  let lsl = $state('9.9');
  let usl = $state('10.1');
  let target = $state('10');
  let benchmark = $state('1.33');
  let itemName = $state('');
  let outcome = $state<CapabilityOutcome | null>(null);
  let analyzing = $state(false);
  let saved = $state(false);

  let parsed = $derived(parseMeasurementData(dataText));
  let lang: 'en' | 'zh' = $derived(get(locale) === 'zh-CN' ? 'zh' : 'en');

  function toNumber(value: string): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
  }

  function analyze(): void {
    analyzing = true;
    saved = false;
    try {
      outcome = runCapabilityAnalysis({
        data: parsed.valid,
        lsl: toNumber(lsl),
        usl: toNumber(usl),
        target: target.trim() === '' ? undefined : toNumber(target),
        benchmark: toNumber(benchmark),
        language: lang,
      });
    } finally {
      analyzing = false;
    }
  }

  async function saveReport(): Promise<void> {
    if (!outcome?.ok) return;
    const report = decisionCardToReport(outcome.card, {
      title: itemName.trim() || get(t)('cpk.reportTitle'),
      language: lang,
    });
    await saveCpkReport(report);
    saved = true;
    showToast(get(t)('reports.saved'), 'success');
  }

  function bannerTone(decision: 'meets' | 'below' | 'na'): 'success' | 'warning' | 'danger' {
    if (decision === 'meets') return 'success';
    if (decision === 'below') return 'danger';
    return 'warning';
  }

  function label(entry: { en: string; zh: string }): string {
    return lang === 'zh' ? entry.zh : entry.en;
  }

  function onDataInput(event: Event): void {
    dataText = (event.currentTarget as HTMLTextAreaElement).value;
  }
</script>

<section class="page cpk">
  <header class="hero">
    <span class="tool-icon" style="--tool-color: var(--color-tool-cpk)">CP</span>
    <div>
      <h2 class="page-title">{$t('workspace.tools.cpk')}</h2>
      <p class="page-desc">{$t('workspace.tools.cpkDesc')}</p>
    </div>
  </header>

  <Card>
    <h3 class="section-label">{$t('cpk.dataTitle')}</h3>
    <Input
      type="textarea"
      placeholder={$t('cpk.dataPlaceholder')}
      value={dataText}
      oninput={onDataInput}
    />
    <p class="note">
      {#if parsed.valid.length > 0}
        {$t('cpk.valuesDetected', { n: parsed.valid.length })}
      {/if}
      {#if parsed.ignored > 0}
        · {$t('cpk.valuesIgnored', { n: parsed.ignored })}
      {/if}
      {#if parsed.valid.length === 0}
        {$t('cpk.dataHint')}
      {/if}
    </p>
  </Card>

  <Card>
    <h3 class="section-label">{$t('cpk.specsTitle')}</h3>
    <Input
      label={$t('cpk.itemName')}
      type="text"
      value={itemName}
      oninput={(event) => (itemName = (event.currentTarget as HTMLInputElement).value)}
    />
    <div class="spec-grid">
      <Input
        label={$t('cpk.lsl')}
        type="number"
        value={lsl}
        oninput={(event) => (lsl = (event.currentTarget as HTMLInputElement).value)}
      />
      <Input
        label={$t('cpk.usl')}
        type="number"
        value={usl}
        oninput={(event) => (usl = (event.currentTarget as HTMLInputElement).value)}
      />
    </div>
    <div class="spec-grid">
      <Input
        label={$t('cpk.target')}
        type="number"
        value={target}
        oninput={(event) => (target = (event.currentTarget as HTMLInputElement).value)}
      />
      <Input
        label={$t('cpk.benchmark')}
        type="number"
        value={benchmark}
        oninput={(event) => (benchmark = (event.currentTarget as HTMLInputElement).value)}
      />
    </div>
  </Card>

  <Button onclick={analyze} disabled={analyzing}>
    {analyzing ? $t('cpk.analyzing') : $t('cpk.analyze')}
  </Button>

  {#if outcome}
    {#if outcome.ok}
      {@const card = outcome.card}
      <DecisionBanner
        tone={bannerTone(card.status.decision)}
        title={label(card.status.label)}
      />

      <Card padded={false}>
        <MetricSummaryBar
          items={card.metrics.map((metric) => ({
            label: metric.label,
            value: metric.value,
            tone: metric.tone,
          }))}
        />
      </Card>

      <Card>
        <h3 class="section-label">{$t('cpk.evidenceTitle')}</h3>
        <CpkEvidenceRows evidence={card.evidence} />
      </Card>

      <Card>
        <h3 class="section-label">{$t('reports.sections.insights')}</h3>
        <InsightList
          items={card.insights.map((insight) => ({
            severity: insight.severity,
            text: insight.text,
          }))}
        />
      </Card>

      <Card>
        <h3 class="section-label">{$t('reports.sections.actions')}</h3>
        <ActionList items={card.actions} />
      </Card>

      <AiContextButton
        label={$t('home.copilotEntry')}
        chips={['Cp ' + card.aiContext.summaryMetrics.Cp, 'Cpk ' + card.aiContext.summaryMetrics.Cpk, 'n ' + card.aiContext.summaryMetrics.n]}
      />
      <p class="note note-center">{$t('cpk.aiNote')}</p>

      {#if saved}
        <p class="note note-center">{$t('reports.saved')}</p>
      {:else}
        <Button variant="secondary" onclick={saveReport}>
          {$t('cpk.saveReport')}
        </Button>
      {/if}
    {:else}
      <Card>
        <h3 class="section-label">{$t('cpk.invalid')}</h3>
        <ul class="errors">
          {#each outcome.errors as error (error)}
            <li>{error}</li>
          {/each}
        </ul>
      </Card>
    {/if}
  {/if}
</section>

<style>
  .hero {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .tool-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 14px;
    background: color-mix(in srgb, var(--tool-color) 10%, transparent);
    color: var(--tool-color);
    font-size: 15px;
    font-weight: var(--font-weight-extrabold);
  }
  .hero div {
    flex: 1;
    min-width: 0;
  }
  .spec-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
  }
  .errors {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 10px 0 0;
    padding-left: 18px;
    font-size: 13px;
    color: var(--color-danger);
  }
  .note-center {
    text-align: center;
  }
</style>
