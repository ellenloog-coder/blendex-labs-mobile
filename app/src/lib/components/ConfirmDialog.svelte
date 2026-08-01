<script lang="ts">
  import Button from './Button.svelte';
  import { t } from '../i18n';

  interface Props {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

  let { open, title, message, confirmLabel, onConfirm, onCancel }: Props = $props();
</script>

{#if open}
  <div class="overlay" role="dialog" aria-modal="true" aria-label={title}>
    <div class="dialog">
      <h2 class="dialog-title">{title}</h2>
      <p class="dialog-message">{message}</p>
      <div class="actions">
        <Button variant="secondary" onclick={onCancel}>
          {$t('common.cancel')}
        </Button>
        <Button variant="danger" onclick={onConfirm}>
          {confirmLabel ?? $t('common.delete')}
        </Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(17, 24, 39, 0.45);
  }
  .dialog {
    width: 100%;
    max-width: 320px;
    padding: 20px;
    border-radius: var(--radius-card);
    background: var(--color-surface);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
  }
  .dialog-title {
    font-size: 16px;
    font-weight: var(--font-weight-bold);
    color: var(--color-ink);
  }
  .dialog-message {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--color-secondary);
  }
  .actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
</style>
