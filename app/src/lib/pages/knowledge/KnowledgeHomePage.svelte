<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '../../components/Card.svelte';
  import Chip from '../../components/Chip.svelte';
  import EmptyState from '../../components/EmptyState.svelte';
  import Icon from '../../components/Icon.svelte';
  import Input from '../../components/Input.svelte';
  import KnowledgeArticleItem from '../../components/knowledge/KnowledgeArticleItem.svelte';
  import { categories, getCategory } from '../../knowledge/categories';
  import {
    getCategoryArticleCount,
    getFeatured,
    getLatest,
    getRelatedTools,
  } from '../../knowledge/data';
  import { getRecentProgress } from '../../knowledge/progress';
  import type { KnowledgeProgress } from '../../knowledge/progress';
  import { searchArticles } from '../../knowledge/search';
  import { locale, t } from '../../i18n';
  import { navigate } from '../../router';
  import type { RouteParams } from '../../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();

  let query = $state('');
  let recent = $state<KnowledgeProgress[]>([]);

  let featured = $derived(getFeatured($locale));
  let latest = $derived(getLatest($locale, 5));
  let results = $derived(query.trim() ? searchArticles(query, $locale) : []);
  let tools = $derived(getRelatedTools($locale));

  onMount(async () => {
    recent = await getRecentProgress(3);
  });

  function openArticle(slug: string): void {
    navigate(`/knowledge/article/${slug}`);
  }

  function onSearchInput(event: Event): void {
    query = (event.currentTarget as HTMLInputElement).value;
  }

  function featuredCategoryName(): string {
    return getCategory(featured.categoryId)?.name[$locale] ?? '';
  }
</script>

<section class="page knowledge">
  <header class="hero">
    <h2 class="hero-title">{$t('knowledge.hubTitle')}</h2>
    <p class="hero-sub">{$t('knowledge.hubSubtitle')}</p>
  </header>

  <Input
    variant="search"
    placeholder={$t('knowledge.searchPlaceholder')}
    value={query}
    oninput={onSearchInput}
  />

  {#if results.length > 0}
    <div class="list">
      {#each results as result (result.article.slug)}
        <KnowledgeArticleItem
          article={result.article}
          onclick={() => openArticle(result.article.slug)}
        />
      {/each}
    </div>
  {:else if query.trim()}
    <EmptyState message={$t('knowledge.noResults')} />
  {/if}

  <section class="block">
    <span class="section-label">{$t('knowledge.featuredInsight')}</span>
    <Card padded={false}>
      <button class="featured" onclick={() => openArticle(featured.slug)}>
        <span class="featured-tag">{featuredCategoryName()}</span>
        <span class="featured-title">{featured.title}</span>
        <span class="featured-summary">{featured.summary}</span>
        <span class="meta">{featured.readingTime} · {$t('knowledge.open')}</span>
      </button>
    </Card>
  </section>

  <section class="block">
    <h3 class="block-title">{$t('knowledge.exploreTopics')}</h3>
    <div class="chips">
      {#each categories as category (category.id)}
        <Chip
          variant="category"
          onclick={() => navigate(`/knowledge/category/${category.id}`)}
        >
          {category.name[$locale]}
          <span class="count">
            {getCategoryArticleCount(category.id, $locale)}
          </span>
        </Chip>
      {/each}
    </div>
  </section>

  <section class="block">
    <h3 class="block-title">{$t('knowledge.latestArticles')}</h3>
    <div class="list">
      {#each latest as article (article.slug)}
        <KnowledgeArticleItem
          article={article}
          onclick={() => openArticle(article.slug)}
        />
      {/each}
    </div>
  </section>

  {#if recent.length > 0}
    <section class="block">
      <h3 class="block-title">{$t('knowledge.continueReading')}</h3>
      <div class="list">
        {#each recent as item (item.slug)}
          <button class="recent" onclick={() => openArticle(item.slug)}>
            <span class="recent-title">{item.title}</span>
            <span class="meta">{$t('knowledge.savedLocally')}</span>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  {#if tools.length > 0}
    <section class="block">
      <h3 class="block-title">{$t('knowledge.relatedTools')}</h3>
      <Card>
        {#each tools as tool (tool)}
          <div class="tool-row">
            <Icon name="reports" size={16} />
            <span>{tool}</span>
          </div>
        {/each}
      </Card>
    </section>
  {/if}
</section>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .hero-title {
    font-size: var(--font-size-title);
    font-weight: var(--font-weight-extrabold);
    line-height: 1.25;
    color: var(--color-ink);
  }
  .hero-sub {
    font-size: var(--font-size-body);
    color: var(--color-secondary);
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .featured {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
    padding: 20px;
    border: none;
    background: none;
    text-align: left;
  }
  .featured-tag {
    padding: 4px 10px;
    border-radius: var(--radius-chip);
    background: var(--color-brand-soft);
    color: var(--color-brand);
    font-size: 11px;
    font-weight: var(--font-weight-semibold);
  }
  .featured-title {
    font-size: 24px;
    font-weight: var(--font-weight-extrabold);
    line-height: 1.3;
    color: var(--color-ink);
  }
  .featured-summary {
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-secondary);
  }
  .chips {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
  }
  .count {
    margin-left: 6px;
    opacity: 0.75;
  }
  .recent {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 100%;
    min-height: 64px;
    padding: 12px 16px;
    border: none;
    border-radius: var(--radius-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    text-align: left;
  }
  .recent-title {
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
  .tool-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    color: var(--color-ink);
    font-size: 14px;
  }
</style>
