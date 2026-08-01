<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'default' | 'filter' | 'category' | 'suggestion';

  interface Props {
    variant?: Variant;
    active?: boolean;
    disabled?: boolean;
    onclick?: () => void;
    children?: Snippet;
  }

  let {
    variant = 'default',
    active = false,
    disabled = false,
    onclick,
    children,
  }: Props = $props();
</script>

<button class="chip chip-{variant}" class:active {disabled} onclick={onclick}>
  {@render children?.()}
</button>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 14px;
    border: none;
    border-radius: var(--radius-chip);
    background: var(--color-fill);
    color: #374151;
    font-size: var(--font-size-chip);
    font-weight: var(--font-weight-semibold);
  }
  .chip-filter {
    border-radius: 16px;
  }
  .chip-category {
    height: 36px;
    padding: 0 16px;
    border-radius: var(--radius-chip);
  }
  .chip-suggestion {
    border-radius: 16px;
    background: var(--color-surface);
    color: var(--color-ink);
  }
  .chip.active {
    background: var(--color-ink);
    color: var(--color-surface);
  }
  .chip:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
