<script lang="ts">
  import Button from '../components/Button.svelte';
  import Card from '../components/Card.svelte';
  import Icon from '../components/Icon.svelte';
  import { getToolColor } from '../demo/preview-data';
  import { sampleReports } from '../demo/preview-data';
  import { getCategory } from '../knowledge/categories';
  import { getLatest } from '../knowledge/data';
  import { locale, t } from '../i18n';
  import { navigate } from '../router';
  import type { RouteParams } from '../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();

  const quickTools = [
    { id: 'cpk', label: 'CPK' },
    { id: 'msa', label: 'MSA' },
    { id: 'd8', label: '8D' },
    { id: 'reliability', label: 'R' },
  ];

  let highlights = $derived(getLatest($locale, 3));
  let recentReports = $derived(sampleReports.slice(0, 3));

  function reportStatusColor(status: string): string {
    if (status === 'completed') return 'var(--color-success)';
    if (status === 'needs-review') return 'var(--color-warning)';
    return 'var(--color-faint)';
  }
</script>

<section class="page">
  <header class="hero">
    <p class="greeting">{$t('home.greeting')}</p>
    <h2 class="hero-title">
      {$t('home.heroTitle1')}<br />{$t('home.heroTitle2')}
    </h2>
    <p class="desc">{$t('home.description')}</p>
  </header>

  <Card padded={false}>
    <div class="today-row">
      <div class="stat">
        <span class="stat-value tabular">3</span>
        <span class="stat-label">{$t('home.todos')}</span>
      </div>
      <div class="stat">
        <span class="stat-value tabular">2</span>
        <span class="stat-label">{$t('home.review')}</span>
      </div>
      <div class="stat">
        <span class="stat-value tabular">1</span>
        <span class="stat-label">{$t('home.risks')}</span>
      </div>
    </div>
  </Card>

  <Card>
    <div class="resume">
      <div class="resume-body">
        <span class="resume-label">{$t('home.continueLast')}</span>
        <span class="resume-title">{$t('workspace.resumeDesc')}</span>
        <div class="progress">
          <span class="progress-fill" style="width: 75%"></span>
        </div>
      </div>
      <Button onclick={() => navigate('/workspace/tool/cpk')}>
        {$t('home.continue')}
      </Button>
    </div>
  </Card>

  <section class="block">
    <h3 class="block-title">{$t('home.quickStart')}</h3>
    <div class="quick-grid">
      {#each quickTools as tool (tool.id)}
        <button
          class="quick"
          onclick={() => navigate(`/workspace/tool/${tool.id}`)}
          aria-label={$t(`workspace.tools.${tool.id}`)}
          style={`--tool-color: ${getToolColor(tool.id)}`}
        >
          <span class="quick-icon">{tool.label}</span>
          <span class="quick-label">{$t(`workspace.tools.${tool.id}`)}</span>
        </button>
      {/each}
    </div>
  </section>

  <button class="copilot" onclick={() => navigate('/assistant')}>
    <span class="copilot-icon"><Icon name="assistant" size={22} /></span>
    <span class="copilot-body">
      <span class="copilot-title">{$t('home.copilotEntry')}</span>
      <span class="copilot-desc">{$t('home.copilotEntryDesc')}</span>
    </span>
    <Icon name="chevron" size={18} />
  </button>

  <section class="block">
    <h3 class="block-title">{$t('home.recentReports')}</h3>
    <Card padded={false}>
      {#each recentReports as report (report.id)}
        <button
          class="report-row"
          onclick={() => navigate(`/reports/${report.id}`)}
        >
          <span
            class="dot"
            style={`background: ${reportStatusColor(report.status)}`}
          ></span>
          <span class="report-name">{$t(report.titleKey)}</span>
          <span class="report-date">{report.date}</span>
        </button>
      {/each}
    </Card>
  </section>

  <section class="block">
    <div class="block-head">
      <h3 class="block-title">{$t('home.knowledgeHighlights')}</h3>
      <button class="link" onclick={() => navigate('/knowledge')}>
        {$t('home.viewAll')}
      </button>
    </div>
    <div class="k-list">
      {#each highlights as article (article.slug)}
        <button
          class="k-row"
          onclick={() => navigate(`/knowledge/article/${article.slug}`)}
        >
          <span class="k-tag">
            {getCategory(article.categoryId)?.name[$locale] ?? ''}
          </span>
          <span class="k-title">{article.title}</span>
        </button>
      {/each}
    </div>
  </section>
</section>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .greeting {
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-brand);
  }
  .hero-title {
    font-size: var(--font-size-title);
    font-weight: var(--font-weight-extrabold);
    line-height: 1.25;
    color: var(--color-ink);
  }
  .desc {
    font-size: var(--font-size-body);
    color: var(--color-secondary);
  }
  .today-row {
    display: flex;
  }
  .stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 14px 0;
    border-left: 1px solid var(--color-hairline);
  }
  .stat:first-child {
    border-left: none;
  }
  .stat-value {
    font-size: var(--font-size-metric);
    font-weight: var(--font-weight-extrabold);
    color: var(--color-ink);
  }
  .stat-label {
    font-size: var(--font-size-meta);
    color: var(--color-secondary);
  }
  .resume {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .resume-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .resume-label {
    font-size: var(--font-size-meta);
    color: var(--color-faint);
  }
  .resume-title {
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .progress {
    height: 6px;
    border-radius: 999px;
    background: var(--color-fill);
    overflow: hidden;
  }
  .progress-fill {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: var(--color-brand);
  }
  .quick-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(6px, 2vw, 10px);
  }
  .quick {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 4px;
    border: none;
    border-radius: var(--radius-card);
    background: none;
  }
  .quick-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(36px, 10vw, 44px);
    height: clamp(36px, 10vw, 44px);
    border-radius: 12px;
    background: color-mix(in srgb, var(--tool-color) 10%, transparent);
    color: var(--tool-color);
    font-size: 13px;
    font-weight: var(--font-weight-extrabold);
  }
  .quick-label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: clamp(9px, 2.6vw, 11px);
    color: var(--color-secondary);
  }
  .copilot {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 14px 16px;
    border: none;
    border-radius: var(--radius-card);
    background: var(--color-brand-soft);
    text-align: left;
  }
  .copilot-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--color-surface);
    color: var(--color-brand);
  }
  .copilot-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .copilot-title {
    font-size: 14px;
    font-weight: var(--font-weight-bold);
    color: var(--color-ink);
  }
  .copilot-desc {
    font-size: 12px;
    color: var(--color-brand);
  }
  .report-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 52px;
    padding: 10px 16px;
    border: none;
    border-bottom: 1px solid var(--color-hairline);
    background: none;
    text-align: left;
  }
  .report-row:last-child {
    border-bottom: none;
  }
  .dot {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
  }
  .report-name {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: var(--font-weight-bold);
    color: var(--color-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .report-date {
    font-size: var(--font-size-meta);
    color: var(--color-faint);
  }
  .block-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .link {
    border: none;
    background: none;
    color: var(--color-brand);
    font-size: 12px;
    font-weight: var(--font-weight-semibold);
  }
  .k-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .k-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 100%;
    padding: 12px 14px;
    border: none;
    border-radius: var(--radius-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    text-align: left;
  }
  .k-tag {
    padding: 3px 8px;
    border-radius: var(--radius-chip);
    background: var(--color-brand-soft);
    color: var(--color-brand);
    font-size: 10px;
    font-weight: var(--font-weight-semibold);
  }
  .k-title {
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
</style>
