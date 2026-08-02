<!--
  UI shell only. No AI integration (ADR-0002).
  This component is intentionally disabled until an AI phase begins.
-->
<script lang="ts">
  import Icon from './Icon.svelte';

  let {
    label,
    chips = [],
    onclick,
  }: { label: string; chips?: string[]; onclick?: () => void } = $props();
</script>

<div class="ai-cta">
  <button class="ai-btn" disabled={!onclick} onclick={onclick}>
    <Icon name="assistant" size={18} />
    <span>{label}</span>
  </button>
  {#if chips.length > 0}
    <div class="chips">
      {#each chips as chip (chip)}
        <span class="chip">{chip}</span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .ai-cta {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ai-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 56px;
    border: none;
    border-radius: var(--radius-input);
    background: var(--color-brand);
    color: var(--color-surface);
    font-size: 15px;
    font-weight: var(--font-weight-semibold);
  }
  .ai-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    padding: 4px 10px;
    border-radius: var(--radius-chip);
    background: var(--color-brand-soft);
    color: var(--color-brand);
    font-size: 12px;
  }
</style>
