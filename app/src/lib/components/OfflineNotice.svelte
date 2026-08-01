<!-- Presentational only: shows when a page needs to communicate offline/local state. -->
<script lang="ts">
  import { t } from '../i18n';

  let { detail }: { detail?: string } = $props();
</script>

<div class="offline">
  <span>{$t('common.offline')}</span>
  {#if detail}
    <span class="detail">{detail}</span>
  {/if}
</div>

<style>
  .offline {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--radius-input);
    background: var(--color-fill);
    color: var(--color-secondary);
    font-size: 12px;
  }
  .detail {
    color: var(--color-faint);
  }
</style>
