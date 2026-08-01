<script lang="ts">
  type Tone = 'neutral' | 'success' | 'warning' | 'danger';

  interface Metric {
    label: string;
    value: string;
    tone?: Tone;
  }

  let { items }: { items: Metric[] } = $props();
</script>

<div class="metric-bar">
  {#each items as item (item.label)}
    <div class="metric">
      <span class="m-label">{item.label}</span>
      <span class="m-value tabular tone-{item.tone ?? 'neutral'}">{item.value}</span>
    </div>
  {/each}
</div>

<style>
  .metric-bar {
    display: flex;
    height: 64px;
    background: var(--color-surface);
    border-radius: 14px;
  }
  .metric {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border-left: 1px solid var(--color-hairline);
  }
  .metric:first-child {
    border-left: none;
  }
  .m-label {
    font-size: 10px;
    text-transform: uppercase;
    color: var(--color-secondary);
  }
  .m-value {
    font-size: var(--font-size-metric);
    font-weight: var(--font-weight-extrabold);
    color: var(--color-ink);
  }
  .tone-success {
    color: var(--color-success);
  }
  .tone-warning {
    color: var(--color-warning);
  }
  .tone-danger {
    color: var(--color-danger);
  }
</style>
