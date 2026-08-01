<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    padded = true,
    soft = false,
    children,
  }: { padded?: boolean; soft?: boolean; children?: Snippet } = $props();
</script>

<div class="card" class:unpadded={!padded} class:soft={soft}>
  {@render children?.()}
</div>

<style>
  .card {
    background: var(--color-surface);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: clamp(12px, 4.2vw, 18px);
  }
  .card.unpadded {
    padding: 0;
  }
  .card.soft {
    background: var(--color-brand-soft);
  }
</style>
