<script lang="ts">
  import type { KnowledgeArticle } from '../../knowledge/types';

  let {
    article,
    onclick,
  }: { article: KnowledgeArticle; onclick?: () => void } = $props();
</script>

<button class="article-item" onclick={onclick}>
  <span class="title">{article.title}</span>
  <span class="summary">{article.summary}</span>
  <span class="meta">
    {article.readingTime}{#if article.updatedAt} · {article.updatedAt}{/if}
  </span>
</button>

<style>
  .article-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 100%;
    min-height: 96px;
    padding: 14px 16px;
    border: none;
    border-radius: var(--radius-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    text-align: left;
  }
  .title {
    font-size: var(--font-size-card-title);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
  .summary {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 12px;
    color: var(--color-secondary);
  }
  .meta {
    font-size: var(--font-size-meta);
    color: var(--color-faint);
  }
</style>
