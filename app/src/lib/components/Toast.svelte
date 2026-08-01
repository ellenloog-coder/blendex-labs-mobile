<script lang="ts">
  import { toasts } from '../toast';
</script>

<div class="toast-container" role="status" aria-live="polite">
  {#each $toasts as item (item.id)}
    <div class="toast toast-{item.tone}">{item.message}</div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    left: 50%;
    bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom) + 20px);
    transform: translateX(-50%);
    z-index: 60;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    pointer-events: none;
  }
  .toast {
    padding: 10px 16px;
    border-radius: var(--radius-chip);
    background: var(--color-ink);
    color: var(--color-surface);
    font-size: 13px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  }
  .toast-success {
    background: var(--color-success);
  }
  .toast-warning {
    background: var(--color-warning);
  }
  .toast-danger {
    background: var(--color-danger);
  }
</style>
