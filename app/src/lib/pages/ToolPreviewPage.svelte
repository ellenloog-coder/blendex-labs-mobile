<script lang="ts">
  import Button from '../components/Button.svelte';
  import Card from '../components/Card.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import StatusBadge from '../components/StatusBadge.svelte';
  import { getTool } from '../demo/preview-data';
  import { t } from '../i18n';
  import type { RouteParams } from '../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();
  let toolId = $derived(params.toolId ?? '');
  let tool = $derived(getTool(toolId));
  const statusKey = {
    available: 'available',
    beta: 'beta',
    'coming-soon': 'comingSoon',
  } as const;
  let initials = $derived(
    tool ? (tool.id === 'd8' ? '8D' : tool.id.slice(0, 2).toUpperCase()) : '',
  );
</script>

{#if tool}
  <section class="page">
    <header class="tool-hero">
      <span class="tool-icon" style={`--tool-color: ${tool.colorVar}`}>{initials}</span>
      <div>
        <h2 class="page-title">{$t(`workspace.tools.${tool.id}`)}</h2>
        <p class="page-desc">{$t(`workspace.tools.${tool.id}Desc`)}</p>
      </div>
      <StatusBadge status={tool.status}>
        {$t(`workspace.${statusKey[tool.status]}`)}
      </StatusBadge>
    </header>

    <Card>
      <h3 class="section-label">{$t('toolPreview.flow')}</h3>
      <ol class="flow">
        {#each tool.flow as step (step)}
          <li>{$t(`toolPreview.steps.${step}`)}</li>
        {/each}
      </ol>
    </Card>

    <Button disabled>{$t('toolPreview.analyze')}</Button>
    <p class="note note-center">{$t('toolPreview.note')}</p>
  </section>
{:else}
  <section class="page">
    <EmptyState message={$t('toolPreview.notImplemented')} />
  </section>
{/if}

<style>
  .tool-hero {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .tool-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 14px;
    background: color-mix(in srgb, var(--tool-color) 10%, transparent);
    color: var(--tool-color);
    font-size: 15px;
    font-weight: var(--font-weight-extrabold);
  }
  .tool-hero div {
    flex: 1;
    min-width: 0;
  }
  .flow {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 12px 0 0;
    padding-left: 20px;
    font-size: 14px;
    color: var(--color-body);
  }
  .note-center {
    text-align: center;
  }
</style>
