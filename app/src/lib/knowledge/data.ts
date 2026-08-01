import knowledgeJson from '../../content/knowledge.generated.json';
import type { KnowledgeArticle, KnowledgeIndex, Locale } from './types';

export const knowledgeIndex = knowledgeJson as unknown as KnowledgeIndex;
export const articles: KnowledgeArticle[] = knowledgeIndex.articles;

export function getArticle(slug: string): KnowledgeArticle | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesForLocale(locale: Locale): KnowledgeArticle[] {
  return articles.filter((article) => article.locale === locale);
}

export function getAlternate(article: KnowledgeArticle): KnowledgeArticle | null {
  return article.pairSlug ? getArticle(article.pairSlug) ?? null : null;
}

function byUpdatedDesc(a: KnowledgeArticle, b: KnowledgeArticle): number {
  return b.updatedAt.localeCompare(a.updatedAt);
}

export function getArticlesByCategory(
  categoryId: string,
  locale: Locale,
): KnowledgeArticle[] {
  return articles
    .filter((article) => article.categoryId === categoryId && article.locale === locale)
    .sort(byUpdatedDesc);
}

export function getCategoryArticleCount(categoryId: string, locale: Locale): number {
  return getArticlesByCategory(categoryId, locale).length;
}

export function getLatest(locale: Locale, limit = 5): KnowledgeArticle[] {
  return getArticlesForLocale(locale).sort(byUpdatedDesc).slice(0, limit);
}

export function getFeatured(locale: Locale): KnowledgeArticle {
  const featured = articles.find(
    (article) => article.featured && article.locale === locale,
  );
  if (featured) return featured;
  return getLatest(locale, 1)[0];
}

export function getRelated(
  article: KnowledgeArticle,
  locale: Locale,
  limit = 3,
): KnowledgeArticle[] {
  return articles
    .filter(
      (candidate) =>
        candidate.locale === locale &&
        candidate.categoryId === article.categoryId &&
        candidate.slug !== article.slug &&
        candidate.slug !== article.pairSlug,
    )
    .sort(byUpdatedDesc)
    .slice(0, limit);
}

export function getRelatedTools(locale: Locale): string[] {
  return [
    ...new Set(
      getArticlesForLocale(locale)
        .map((article) => article.relatedTool)
        .filter(Boolean),
    ),
  ];
}

const RELATED_TOOL_MAP: Record<string, string> = {
  'Process Capability Analysis Tool': 'cpk',
  'Measurement System Analysis': 'msa',
  'Statistical Process Control Tool': 'spc',
  'DOE Tool': 'doe',
  '8D Tool': 'd8',
  'Reliability Tool': 'reliability',
  'Sampling Plan Tool': 'sampling',
};

/** Maps a knowledge article's related tool name to the workspace tool id, when known. */
export function getToolIdForRelatedTool(relatedTool: string): string | null {
  return RELATED_TOOL_MAP[relatedTool] ?? null;
}
