<script lang="ts">
  import StatusBadge from './StatusBadge.svelte';
  import { getToolColor } from '../demo/preview-data';
  import type { SampleReport } from '../demo/preview-data';
  import { t } from '../i18n';

  let {
    report,
    onclick,
  }: { report: SampleReport; onclick?: () => void } = $props();

  let initials = $derived(
    report.toolKey === 'd8' ? '8D' : report.toolKey.slice(0, 2).toUpperCase(),
  );
</script>

<button class="report-card" onclick={onclick}>
  <span class="icon" style={`--tool-color: ${getToolColor(report.toolKey)}`}>
    {initials}
  </span>
  <span class="body">
    <span class="name">{$t(report.titleKey)}</span>
    <span class="desc">{$t(report.descKey)}</span>
    <span class="date">{report.date}</span>
  </span>
  <StatusBadge status={report.status}>{$t(`status.${report.status}`)}</StatusBadge>
</button>

<style>
  .report-card {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 78px;
    padding: 12px 14px;
    border: none;
    border-radius: var(--radius-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    text-align: left;
  }
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 10px;
    background: color-mix(in srgb, var(--tool-color) 10%, transparent);
    color: var(--tool-color);
    font-size: 12px;
    font-weight: var(--font-weight-bold);
  }
  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .name {
    font-size: 14px;
    font-weight: var(--font-weight-bold);
    color: var(--color-ink);
  }
  .desc {
    font-size: 12px;
    color: var(--color-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .date {
    font-size: var(--font-size-meta);
    color: var(--color-faint);
  }
</style>
