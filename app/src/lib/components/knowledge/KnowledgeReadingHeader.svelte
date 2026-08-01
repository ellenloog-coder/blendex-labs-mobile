<script lang="ts">
  import Icon from '../Icon.svelte';
  import { locale, t } from '../../i18n';

  interface Props {
    onBack?: () => void;
    onToggleLang?: () => void;
    showLangToggle?: boolean;
  }

  let { onBack, onToggleLang, showLangToggle = false }: Props = $props();
</script>

<header class="reading-header">
  <button class="icon-btn" aria-label={$t('common.back')} onclick={onBack}>
    <Icon name="back" size={24} />
  </button>
  <span class="label">{$t('knowledge.title')}</span>
  {#if showLangToggle}
    <button class="lang-btn" onclick={onToggleLang}>
      {$locale === 'zh-CN' ? 'EN' : '中文'}
    </button>
  {:else}
    <span class="spacer"></span>
  {/if}
</header>

<style>
  .reading-header {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 var(--space-page-padding);
    padding-top: env(safe-area-inset-top);
    background: var(--color-background);
    border-bottom: 1px solid var(--color-hairline);
  }
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    color: var(--color-ink);
  }
  .label {
    font-size: 16px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
  .lang-btn {
    background: none;
    border: none;
    color: var(--color-brand);
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
  }
  .spacer {
    width: 48px;
  }
</style>
