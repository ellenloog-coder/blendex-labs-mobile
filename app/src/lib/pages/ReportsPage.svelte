<script lang="ts">
  import { onMount } from 'svelte';
  import Chip from '../components/Chip.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import ReportCard from '../components/ReportCard.svelte';
  import { listCpkReports } from '../tools/capability/report-store';
  import type { CpkReport } from '../tools/capability/report';
  import { sampleReports } from '../demo/preview-data';
  import { t } from '../i18n';
  import { navigate } from '../router';
  import type { RouteParams } from '../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();

  type Filter = 'all' | 'cpk' | 'spc' | 'msa' | 'd8' | 'custom';
  const filters: Filter[] = ['all', 'cpk', 'spc', 'msa', 'd8', 'custom'];

  let active = $state<Filter>('all');
  let savedReports = $state<CpkReport[]>([]);
  let list = $derived(
    active === 'all'
      ? sampleReports
      : sampleReports.filter((report) =>
          active === 'custom' ? report.custom === true : report.toolKey === active,
        ),
  );

  onMount(async () => {
    savedReports = await listCpkReports(10);
  });

  function formatDate(iso: string): string {
    const date = new Date(iso);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
</script>

<section class="page">
  <header>
    <h2 class="page-title">{$t('reports.title')}</h2>
    <p class="page-desc">{$t('reports.description')}</p>
  </header>

  <div class="filters">
    {#each filters as filter (filter)}
      <Chip
        variant="filter"
        active={active === filter}
        onclick={() => (active = filter)}
      >
        {$t(`reports.filters.${filter}`)}
      </Chip>
    {/each}
  </div>

  {#if savedReports.length > 0}
    <section class="block">
      <h3 class="block-title">{$t('cpk.reportsTitle')}</h3>
      <div class="list">
        {#each savedReports as report (report.id)}
          <button
            class="saved-report"
            onclick={() => navigate(`/reports/cpk/${report.id}`)}
          >
            <span class="saved-body">
              <span class="saved-title">{report.title}</span>
              <span class="saved-date">{formatDate(report.createdAt)}</span>
            </span>
            <span
              class="saved-dot"
              class:ok={report.decision.tone === 'success'}
              class:bad={report.decision.tone === 'danger'}
            ></span>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  {#if list.length > 0}
    <div class="list">
      {#each list as report (report.id)}
        <ReportCard
          report={report}
          onclick={() => navigate(`/reports/${report.id}`)}
        />
      {/each}
    </div>
  {:else}
    <EmptyState message={$t('reports.empty')} />
  {/if}
</section>

<style>
  .saved-report {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 64px;
    padding: 12px 14px;
    border: none;
    border-radius: var(--radius-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    text-align: left;
  }
  .saved-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .saved-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    font-weight: var(--font-weight-bold);
    color: var(--color-ink);
  }
  .saved-date {
    font-size: var(--font-size-meta);
    color: var(--color-faint);
  }
  .saved-dot {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--color-faint);
  }
  .saved-dot.ok {
    background: var(--color-success);
  }
  .saved-dot.bad {
    background: var(--color-danger);
  }
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
