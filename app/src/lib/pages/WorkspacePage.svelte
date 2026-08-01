<script lang="ts">
  import Button from '../components/Button.svelte';
  import Card from '../components/Card.svelte';
  import Icon from '../components/Icon.svelte';
  import StatusBadge from '../components/StatusBadge.svelte';
  import { qualityTools } from '../demo/preview-data';
  import { t } from '../i18n';
  import { navigate } from '../router';
  import type { RouteParams } from '../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();

  function toolInitials(id: string): string {
    return id === 'd8' ? '8D' : id.slice(0, 2).toUpperCase();
  }

  const statusKey = {
    available: 'available',
    beta: 'beta',
    'coming-soon': 'comingSoon',
  } as const;
</script>

<section class="page">
  <header>
    <h2 class="page-title">{$t('workspace.title')}</h2>
    <p class="page-desc">{$t('workspace.subtitle')}</p>
  </header>

  <Card>
    <div class="resume">
      <div class="resume-body">
        <span class="resume-label">{$t('workspace.resume')}</span>
        <span class="resume-title">{$t('workspace.resumeDesc')}</span>
        <div class="progress">
          <span class="progress-fill" style="width: 75%"></span>
        </div>
      </div>
      <Button onclick={() => navigate('/workspace/tool/cpk')}>
        {$t('home.continue')}
      </Button>
    </div>
  </Card>

  <section class="block">
    <h3 class="block-title">{$t('workspace.quickAnalysis')}</h3>
    <div class="quick-scroll">
      {#each qualityTools as tool (tool.id)}
        <button
          class="quick-card"
          style={`--tool-color: ${tool.colorVar}`}
          onclick={() => navigate(`/workspace/tool/${tool.id}`)}
        >
          <span class="quick-icon">{toolInitials(tool.id)}</span>
          <span class="quick-name">{$t(`workspace.tools.${tool.id}`)}</span>
        </button>
      {/each}
    </div>
  </section>

  <section class="block">
    <h3 class="block-title">{$t('workspace.allMethods')}</h3>
    <div class="method-list">
      {#each qualityTools as tool (tool.id)}
        <button
          class="method"
          onclick={() => navigate(`/workspace/tool/${tool.id}`)}
        >
          <span class="method-icon" style={`--tool-color: ${tool.colorVar}`}>
            {toolInitials(tool.id)}
          </span>
          <span class="method-body">
            <span class="method-name">{$t(`workspace.tools.${tool.id}`)}</span>
            <span class="method-desc">{$t(`workspace.tools.${tool.id}Desc`)}</span>
          </span>
          <StatusBadge status={tool.status}>
            {$t(`workspace.${statusKey[tool.status]}`)}
          </StatusBadge>
        </button>
      {/each}
    </div>
  </section>

  <button class="ai-guide" onclick={() => navigate('/assistant')}>
    <span class="ai-guide-icon"><Icon name="assistant" size={20} /></span>
    <span class="ai-guide-body">
      <span class="ai-guide-title">{$t('workspace.aiGuide')}</span>
      <span class="ai-guide-desc">{$t('workspace.aiGuideDesc')}</span>
    </span>
    <Icon name="chevron" size={18} />
  </button>

  <Card>
    <div class="knowledge-card">
      <div>
        <h3 class="knowledge-title">{$t('workspace.knowledge')}</h3>
        <p class="muted">{$t('workspace.knowledgeDesc')}</p>
      </div>
      <Button onclick={() => navigate('/knowledge')}>{$t('knowledge.open')}</Button>
    </div>
  </Card>

  <p class="note note-center">{$t('workspace.previewNote')}</p>
</section>

<style>
  .resume {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .resume-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .resume-label {
    font-size: var(--font-size-meta);
    color: var(--color-faint);
  }
  .resume-title {
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .progress {
    height: 6px;
    border-radius: 999px;
    background: var(--color-fill);
    overflow: hidden;
  }
  .progress-fill {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: var(--color-brand);
  }
  .quick-scroll {
    display: flex;
    gap: clamp(8px, 2.4vw, 12px);
    overflow-x: auto;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
  }
  .quick-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 112px;
    height: 112px;
    flex-shrink: 0;
    border: none;
    border-radius: var(--radius-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
  }
  .quick-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--tool-color) 10%, transparent);
    color: var(--tool-color);
    font-size: 13px;
    font-weight: var(--font-weight-extrabold);
  }
  .quick-name {
    font-size: 12px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
  .knowledge-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .knowledge-title {
    font-size: var(--font-size-card-title);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
  .ai-guide {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 14px 16px;
    border: none;
    border-radius: var(--radius-card);
    background: var(--color-brand-soft);
    text-align: left;
  }
  .ai-guide-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--color-surface);
    color: var(--color-brand);
  }
  .ai-guide-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .ai-guide-title {
    font-size: 14px;
    font-weight: var(--font-weight-bold);
    color: var(--color-ink);
  }
  .ai-guide-desc {
    font-size: 12px;
    color: var(--color-brand);
  }
  .method-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
  }
  .method {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 72px;
    padding: 12px 14px;
    border: none;
    border-radius: var(--radius-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    text-align: left;
  }
  .method-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border-radius: 10px;
    background: color-mix(in srgb, var(--tool-color) 10%, transparent);
    color: var(--tool-color);
    font-size: 11px;
    font-weight: var(--font-weight-bold);
  }
  .method-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .method-name {
    font-size: var(--font-size-card-title);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
  .method-desc {
    font-size: var(--font-size-meta);
    color: var(--color-faint);
  }
  .note-center {
    text-align: center;
  }
</style>
