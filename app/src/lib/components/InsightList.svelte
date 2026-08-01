<script lang="ts">
  type Severity = 'danger' | 'warning' | 'neutral' | 'success';

  interface Insight {
    severity: Severity;
    text: string;
  }

  let { items }: { items: Insight[] } = $props();
</script>

<ul class="insight-list">
  {#each items.slice(0, 3) as item (item.text)}
    <li class="insight">
      <span class="dot dot-{item.severity}"></span>
      <span class="text">{item.text}</span>
    </li>
  {/each}
</ul>

<style>
  .insight-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .insight {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 40px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .dot-danger {
    background: var(--color-danger);
  }
  .dot-warning {
    background: var(--color-warning);
  }
  .dot-neutral {
    background: var(--color-faint);
  }
  .dot-success {
    background: var(--color-success);
  }
  .text {
    font-size: 14px;
    color: var(--color-ink);
  }
</style>
