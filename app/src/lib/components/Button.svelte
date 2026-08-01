<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'ai' | 'danger' | 'icon';

  interface Props {
    variant?: Variant;
    disabled?: boolean;
    type?: 'button' | 'submit';
    ariaLabel?: string;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    variant = 'primary',
    disabled = false,
    type = 'button',
    ariaLabel,
    onclick,
    children,
  }: Props = $props();
</script>

<button
  {type}
  {disabled}
  class="btn btn-{variant}"
  aria-label={ariaLabel}
  onclick={onclick}
>
  {@render children?.()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 0 20px;
    border: none;
    border-radius: var(--radius-input);
    font-size: var(--font-size-button);
    font-weight: var(--font-weight-semibold);
    transition: opacity 0.15s ease;
  }
  .btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  .btn-primary {
    background: var(--color-ink);
    color: var(--color-surface);
  }
  .btn-secondary {
    background: var(--color-surface);
    color: var(--color-ink);
    border: 1px solid var(--color-hairline);
  }
  .btn-ai {
    background: var(--color-brand);
    color: var(--color-surface);
  }
  .btn-danger {
    background: var(--color-danger);
    color: var(--color-surface);
  }
  .btn-icon {
    background: none;
    color: var(--color-ink);
    min-height: auto;
    padding: 4px;
  }
</style>
