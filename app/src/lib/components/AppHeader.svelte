<script lang="ts">
  import Icon from './Icon.svelte';
  import { t } from '../i18n';
  import { navigate } from '../router';

  interface Props {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
  }

  let { title, showBack = false, onBack }: Props = $props();

  function goHome(): void {
    navigate('/');
  }
</script>

<header class="app-header">
  {#if title !== undefined}
    <div class="left">
      {#if showBack}
        <button class="icon-btn" aria-label={$t('common.back')} onclick={onBack}>
          <Icon name="back" size={24} />
        </button>
      {/if}
      <h1 class="header-title">{title}</h1>
    </div>
  {:else}
    <button class="brand" onclick={goHome}>
      <span class="logo">B</span>
      <span class="brand-name">{$t('app.name')}</span>
    </button>
    <button class="icon-btn" aria-label={$t('common.menu')}>
      <Icon name="menu" size={24} />
    </button>
  {/if}
</header>

<style>
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--header-height);
    padding: 0 var(--space-page-padding);
    padding-top: env(safe-area-inset-top);
    background: var(--color-background);
  }
  .left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    padding: 0;
  }
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: var(--color-brand);
    color: var(--color-surface);
    font-size: 16px;
    font-weight: var(--font-weight-bold);
  }
  .brand-name {
    font-size: var(--font-size-brand);
    font-weight: var(--font-weight-bold);
    color: var(--color-ink);
  }
  .header-title {
    font-size: 18px;
    font-weight: var(--font-weight-bold);
    color: var(--color-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
</style>
