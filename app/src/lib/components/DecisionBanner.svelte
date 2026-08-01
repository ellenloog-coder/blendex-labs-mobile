<script lang="ts">
  type Tone = 'success' | 'warning' | 'danger';

  let {
    tone,
    title,
    description,
  }: { tone: Tone; title: string; description?: string } = $props();
</script>

<div class="banner banner-{tone}">
  <span class="icon-dot">
    {#if tone === 'success'}✓{:else if tone === 'warning'}!{:else}✕{/if}
  </span>
  <div class="body">
    <h3 class="banner-title">{title}</h3>
    {#if description}
      <p class="banner-desc">{description}</p>
    {/if}
  </div>
</div>

<style>
  .banner {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 72px;
    padding: 12px 16px;
    border-radius: 14px;
  }
  .banner-success {
    background: var(--color-success-bg);
  }
  .banner-warning {
    background: var(--color-warning-bg);
  }
  .banner-danger {
    background: var(--color-danger-bg);
  }
  .icon-dot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border-radius: 50%;
    font-size: 15px;
    font-weight: var(--font-weight-bold);
  }
  .banner-success .icon-dot {
    background: var(--color-success);
    color: var(--color-surface);
  }
  .banner-warning .icon-dot {
    background: var(--color-warning);
    color: var(--color-surface);
  }
  .banner-danger .icon-dot {
    background: var(--color-danger);
    color: var(--color-surface);
  }
  .banner-title {
    font-size: 18px;
    font-weight: var(--font-weight-bold);
    color: var(--color-ink);
  }
  .banner-desc {
    margin-top: 2px;
    font-size: 14px;
    color: var(--color-secondary);
  }
</style>
