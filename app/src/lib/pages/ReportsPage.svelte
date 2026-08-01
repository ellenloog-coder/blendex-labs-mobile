<script lang="ts">
  import Chip from '../components/Chip.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import ReportCard from '../components/ReportCard.svelte';
  import { sampleReports } from '../demo/preview-data';
  import { t } from '../i18n';
  import { navigate } from '../router';
  import type { RouteParams } from '../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();

  type Filter = 'all' | 'cpk' | 'spc' | 'msa' | 'd8' | 'custom';
  const filters: Filter[] = ['all', 'cpk', 'spc', 'msa', 'd8', 'custom'];

  let active = $state<Filter>('all');
  let list = $derived(
    active === 'all'
      ? sampleReports
      : sampleReports.filter((report) =>
          active === 'custom' ? report.custom === true : report.toolKey === active,
        ),
  );
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
