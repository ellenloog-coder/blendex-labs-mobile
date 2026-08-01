<script lang="ts">
  import { get } from 'svelte/store';
  import './app.css';
  import AppHeader from './lib/components/AppHeader.svelte';
  import BottomNavigation from './lib/components/BottomNavigation.svelte';
  import Toast from './lib/components/Toast.svelte';
  import { getCategory } from './lib/knowledge/categories';
  import { getSampleReport } from './lib/demo/preview-data';
  import { locale, t } from './lib/i18n';
  import RouterOutlet from './lib/router/Router.svelte';
  import { back, route } from './lib/router';
  import { matchRoute } from './lib/router/routes';
  import type { RouteMatch } from './lib/router/routes';

  let current = $derived(matchRoute($route));
  let title = $derived(resolveTitle(current));
  let showBack = $derived(
    current.route.path !== '/' &&
      ['knowledge', 'knowledge-category', 'tool-preview', 'report-detail'].includes(
        current.route.name,
      ),
  );

  function resolveTitle(match: RouteMatch): string | undefined {
    switch (match.route.name) {
      case 'home':
        return undefined;
      case 'tool-preview': {
        const toolId = match.params.toolId ?? '';
        return get(t)(`workspace.tools.${toolId}`);
      }
      case 'report-detail': {
        const report = getSampleReport(match.params.reportId ?? '');
        return report ? get(t)(report.titleKey) : get(t)('nav.reports');
      }
      case 'knowledge-category': {
        const category = getCategory(match.params.categoryId ?? '');
        return category ? category.name[get(locale)] : get(t)('knowledge.title');
      }
      default:
        return get(t)(match.route.titleKey);
    }
  }
</script>

<div class="app-shell">
  {#if !current.route.hideAppHeader}
    <AppHeader {title} showBack={showBack} onBack={() => back('/')} />
  {/if}
  <main class="app-main">
    <RouterOutlet />
  </main>
  {#if current.route.showNav !== false}
    <BottomNavigation />
  {/if}
  <Toast />
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    background: var(--color-background);
  }
  .app-main {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
</style>
