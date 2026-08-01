<script lang="ts">
  import Button from './Button.svelte';
  import { t } from '../i18n';

  let {
    message,
    onRetry,
  }: { message: string; onRetry?: () => void } = $props();
</script>

<div class="error">
  <p class="message">{message}</p>
  {#if onRetry}
    <Button variant="secondary" onclick={onRetry}>{$t('common.retry')}</Button>
  {/if}
</div>

<style>
  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 24px 16px;
    text-align: center;
  }
  .message {
    font-size: 13px;
    color: var(--color-danger);
  }
</style>
