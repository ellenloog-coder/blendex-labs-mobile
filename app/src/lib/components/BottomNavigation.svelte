<script lang="ts">
  import Icon from './Icon.svelte';
  import { route, navigate } from '../router';
  import { t } from '../i18n';

  interface NavItem {
    path: string;
    key: string;
    icon: string;
  }

  const items: NavItem[] = [
    { path: '/', key: 'nav.home', icon: 'home' },
    { path: '/workspace', key: 'nav.workspace', icon: 'workspace' },
    { path: '/assistant', key: 'nav.assistant', icon: 'assistant' },
    { path: '/reports', key: 'nav.reports', icon: 'reports' },
    { path: '/more', key: 'nav.more', icon: 'more' },
  ];

  let active = $derived($route);
</script>

<nav class="bottom-nav" aria-label="Primary">
  {#each items as item (item.path)}
    <button class="nav-item" class:active={active === item.path} onclick={() => navigate(item.path)}>
      <Icon name={item.icon} size={24} />
      <span class="label">{$t(item.key)}</span>
    </button>
  {/each}
</nav>

<style>
  .bottom-nav {
    display: flex;
    height: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--color-surface);
    border-top: 1px solid var(--color-hairline);
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background: none;
    border: none;
    color: var(--color-secondary);
  }
  .nav-item.active {
    color: var(--color-brand);
  }
  .nav-item.active .label {
    font-weight: var(--font-weight-semibold);
  }
  .label {
    font-size: var(--font-size-meta);
  }
</style>
