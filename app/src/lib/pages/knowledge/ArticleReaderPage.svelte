<script lang="ts">
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import Button from '../../components/Button.svelte';
  import Card from '../../components/Card.svelte';
  import EmptyState from '../../components/EmptyState.svelte';
  import KnowledgeArticleItem from '../../components/knowledge/KnowledgeArticleItem.svelte';
  import KnowledgeReadingHeader from '../../components/knowledge/KnowledgeReadingHeader.svelte';
  import { getCategory } from '../../knowledge/categories';
  import {
    getAlternate,
    getArticle,
    getRelated,
    getToolIdForRelatedTool,
  } from '../../knowledge/data';
  import {
    extractHtmlHeadings,
    extractMarkdownHeadings,
    renderMarkdown,
  } from '../../knowledge/markdown';
  import type { Heading } from '../../knowledge/markdown';
  import { saveProgress } from '../../knowledge/progress';
  import { locale, t } from '../../i18n';
  import { back, navigate, route } from '../../router';
  import { matchRoute } from '../../router/routes';
  import type { RouteParams } from '../../router/routes';
  import type { KnowledgeArticle } from '../../knowledge/types';

  let { params = {} }: { params?: RouteParams } = $props();

  let article = $derived(getArticle(params.slug ?? ''));
  let alternate = $derived(article ? getAlternate(article) : null);
  let related = $derived(article ? getRelated(article, $locale, 3) : []);
  let categoryName = $derived(
    article ? (getCategory(article.categoryId)?.name[$locale] ?? '') : '',
  );
  let rendered = $derived(article ? renderBody(article) : '');
  let headings = $derived(article ? extractHeadings(article) : []);
  let relatedToolId = $derived(
    article ? getToolIdForRelatedTool(article.relatedTool) : null,
  );

  function renderBody(target: KnowledgeArticle): string {
    return target.body.kind === 'markdown'
      ? renderMarkdown(target.body.source)
      : target.body.source;
  }

  function extractHeadings(target: KnowledgeArticle): Heading[] {
    return target.body.kind === 'markdown'
      ? extractMarkdownHeadings(target.body.source)
      : extractHtmlHeadings(target.body.source);
  }

  function goBack(): void {
    back('/knowledge');
  }

  function toggleLanguage(): void {
    if (alternate) navigate(`/knowledge/article/${alternate.slug}`);
  }

  function scrollToHeading(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  function recordProgress(): void {
    const current = matchRoute(get(route));
    const target = getArticle(current.params.slug ?? '');
    if (!target) return;
    const main = document.querySelector('.app-main');
    const ratio =
      main && main.scrollHeight > main.clientHeight
        ? main.scrollTop / (main.scrollHeight - main.clientHeight)
        : 1;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      void saveProgress({
        slug: target.slug,
        locale: target.locale,
        title: target.title,
        scrollRatio: ratio,
        updatedAt: target.updatedAt,
      });
    }, 800);
  }

  onMount(() => {
    const main = document.querySelector('.app-main');
    main?.addEventListener('scroll', recordProgress, { passive: true });
    return () => {
      main?.removeEventListener('scroll', recordProgress);
      if (saveTimer) clearTimeout(saveTimer);
    };
  });
</script>

{#if article}
  <KnowledgeReadingHeader
    onBack={goBack}
    onToggleLang={toggleLanguage}
    showLangToggle={alternate !== null}
  />
  <article class="page reader">
    <span class="category">{categoryName}</span>
    <h1 class="title">{article.title}</h1>
    <p class="meta">
      {article.readingTime}
      {#if article.updatedAt}· {$t('knowledge.updated')} {article.updatedAt}{/if}
    </p>

    {#if article.quickTakeaways.length > 0}
      <Card>
        <h2 class="section-label">{$t('knowledge.keyTakeaway')}</h2>
        <ul class="takeaways">
          {#each article.quickTakeaways as item (item)}
            <li>{item}</li>
          {/each}
        </ul>
      </Card>
    {/if}

    {#if headings.length > 0}
      <details class="toc">
        <summary>{$t('knowledge.contents')}</summary>
        <ol>
          {#each headings as heading (heading.id)}
            <li class:sub={heading.level === 3}>
              <button class="toc-link" onclick={() => scrollToHeading(heading.id)}>
                {heading.text}
              </button>
            </li>
          {/each}
        </ol>
      </details>
    {/if}

    <div class="article-body">{@html rendered}</div>

    {#if article.relatedTool}
      <Card soft>
        <div class="related-tool">
          <div>
            <h2 class="section-label">{$t('knowledge.relatedTools')}</h2>
            <p class="tool">{article.relatedTool}</p>
          </div>
          {#if relatedToolId}
            <Button onclick={() => navigate(`/workspace/tool/${relatedToolId}`)}>
              {$t('knowledge.openTool')}
            </Button>
          {/if}
        </div>
      </Card>
    {/if}

    {#if related.length > 0}
      <section class="block">
        <h3 class="block-title">{$t('knowledge.latestArticles')}</h3>
        <div class="list">
          {#each related as item (item.slug)}
            <KnowledgeArticleItem
              article={item}
              onclick={() => navigate(`/knowledge/article/${item.slug}`)}
            />
          {/each}
        </div>
      </section>
    {/if}

    <p class="note note-center">{$t('knowledge.savedLocally')}</p>
  </article>
{:else}
  <section class="page">
    <EmptyState message={$t('knowledge.noResults')} />
  </section>
{/if}

<style>
  .reader {
    gap: 14px;
  }
  .category {
    align-self: flex-start;
    padding: 4px 10px;
    border-radius: var(--radius-chip);
    background: var(--color-brand-soft);
    color: var(--color-brand);
    font-size: 11px;
    font-weight: var(--font-weight-semibold);
  }
  .title {
    font-size: var(--font-size-title);
    font-weight: var(--font-weight-extrabold);
    line-height: 1.25;
    color: var(--color-ink);
  }
  .meta {
    font-size: var(--font-size-meta);
    color: var(--color-faint);
  }
  .takeaways {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 10px 0 0;
    padding-left: 18px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--color-body);
  }
  .toc {
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-input);
    background: var(--color-surface);
    padding: 10px 14px;
  }
  .toc summary {
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
    cursor: pointer;
  }
  .toc ol {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 10px 0 0;
    padding-left: 18px;
  }
  .toc li.sub {
    padding-left: 12px;
  }
  .toc-link {
    border: none;
    background: none;
    padding: 0;
    text-align: left;
    font-size: 13px;
    color: var(--color-secondary);
  }
  .article-body :global(h2) {
    font-size: 24px;
    font-weight: var(--font-weight-bold);
    color: var(--color-ink);
    margin: 24px 0 10px;
  }
  .article-body :global(h3) {
    font-size: 20px;
    font-weight: var(--font-weight-bold);
    color: var(--color-ink);
    margin: 20px 0 8px;
  }
  .article-body :global(p) {
    font-size: 16px;
    line-height: 1.75;
    color: var(--color-body);
    margin: 10px 0;
  }
  .article-body :global(ul),
  .article-body :global(ol) {
    font-size: 16px;
    line-height: 1.75;
    color: var(--color-body);
    padding-left: 22px;
  }
  .article-body :global(code) {
    padding: 2px 5px;
    border-radius: 6px;
    background: var(--color-fill);
    font-size: 0.9em;
  }
  .article-body :global(a) {
    color: var(--color-brand);
  }
  .article-body :global(.table-wrap) {
    overflow-x: auto;
    margin: 14px 0;
  }
  .article-body :global(table) {
    border-collapse: collapse;
    min-width: 100%;
    font-size: 13px;
  }
  .article-body :global(th),
  .article-body :global(td) {
    border: 1px solid var(--color-hairline);
    padding: 8px 10px;
    text-align: left;
  }
  .article-body :global(th) {
    background: var(--color-fill);
    color: var(--color-ink);
    font-weight: var(--font-weight-semibold);
  }
  .article-body :global(.callout) {
    margin: 14px 0;
    padding: 12px 14px;
    border-radius: var(--radius-input);
    border-left: 3px solid var(--color-brand);
    background: var(--color-brand-soft);
  }
  .article-body :global(.callout h3) {
    font-size: 14px;
    font-weight: var(--font-weight-bold);
    color: var(--color-brand);
    margin: 0 0 4px;
  }
  .article-body :global(.callout.caution) {
    border-left-color: var(--color-warning);
    background: var(--color-warning-bg);
  }
  .article-body :global(.callout.caution h3) {
    color: var(--color-warning);
  }
  .article-body :global(.callout.misconception) {
    border-left-color: var(--color-danger);
    background: var(--color-danger-bg);
  }
  .article-body :global(.callout.misconception h3) {
    color: var(--color-danger);
  }
  .article-body :global(.callout p) {
    font-size: 14px;
    line-height: 1.6;
    margin: 4px 0;
  }
  .article-body :global(.formula) {
    margin: 14px 0;
    padding: 12px 14px;
    border-radius: var(--radius-input);
    background: var(--color-fill);
    font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
    font-size: 13px;
    color: var(--color-ink);
    overflow-x: auto;
    white-space: pre-wrap;
  }
  .article-body :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-card);
    margin: 12px 0;
  }
  .article-body :global(figure) {
    margin: 14px 0;
  }
  .article-body :global(figcaption) {
    font-size: 12px;
    color: var(--color-faint);
    margin-top: 6px;
  }
  .tool {
    margin-top: 4px;
    font-size: 14px;
    color: var(--color-ink);
  }
  .related-tool {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .note-center {
    text-align: center;
  }
</style>
