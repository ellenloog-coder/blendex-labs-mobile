<script lang="ts">
  let { items }: { items: string[] } = $props();
</script>

<ul class="action-list">
  {#each items.slice(0, 3) as item, i (item)}
    <li class="action">
      <span class="index tabular">{i + 1}</span>
      <span class="text">{item}</span>
    </li>
  {/each}
</ul>

<style>
  .action-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .action {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 40px;
  }
  .index {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--color-brand-soft);
    color: var(--color-brand);
    font-size: 11px;
    font-weight: var(--font-weight-bold);
  }
  .text {
    font-size: 14px;
    color: var(--color-ink);
  }
</style>
