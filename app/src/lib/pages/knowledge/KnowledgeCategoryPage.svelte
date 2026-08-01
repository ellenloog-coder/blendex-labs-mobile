<script lang="ts">
  import EmptyState from '../../components/EmptyState.svelte';
  import KnowledgeArticleItem from '../../components/knowledge/KnowledgeArticleItem.svelte';
  import { getCategory } from '../../knowledge/categories';
  import { getArticlesByCategory } from '../../knowledge/data';
  import { locale, t } from '../../i18n';
  import { navigate } from '../../router';
  import type { RouteParams } from '../../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();
  let categoryId = $derived(params.categoryId ?? '');
  let category = $derived(getCategory(categoryId));
  let list = $derived(getArticlesByCategory(categoryId, $locale));
</script>

<section class="page">
  <header>
    <h2 class="page-title">{category?.name[$locale] ?? categoryId}</h2>
    <p class="page-desc">{category?.description[$locale] ?? ''}</p>
  </header>

  {#if list.length > 0}
    <div class="list">
      {#each list as article (article.slug)}
        <KnowledgeArticleItem
          article={article}
          onclick={() => navigate(`/knowledge/article/${article.slug}`)}
        />
      {/each}
    </div>
  {:else}
    <EmptyState message={$t('knowledge.emptyCategory')} />
  {/if}
</section>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
