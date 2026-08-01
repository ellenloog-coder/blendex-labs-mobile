import { articles } from './data';
import type { KnowledgeArticle, Locale } from './types';

export interface SearchResult {
  article: KnowledgeArticle;
  score: number;
}

function plainText(source: string, kind: 'markdown' | 'html'): string {
  if (kind === 'html') {
    return source
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');
  }
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, ' $1 ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, ' $1 ')
    .replace(/[#*_>|\-]/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ');
}

function buildHaystack(article: KnowledgeArticle): string {
  return [
    article.title,
    article.summary,
    article.tags.join(' '),
    plainText(article.body.source, article.body.kind),
  ]
    .join(' \n ')
    .toLowerCase()
    .normalize('NFKC');
}

export interface SearchIndex {
  haystacks: Map<string, string>;
  fields: Map<string, { title: string; summary: string; tags: string }>;
}

export function buildSearchIndex(locale: Locale): SearchIndex {
  const haystacks = new Map<string, string>();
  const fields = new Map<string, { title: string; summary: string; tags: string }>();
  for (const article of articles) {
    if (article.locale !== locale) continue;
    haystacks.set(article.slug, buildHaystack(article));
    fields.set(article.slug, {
      title: article.title.toLowerCase().normalize('NFKC'),
      summary: article.summary.toLowerCase().normalize('NFKC'),
      tags: article.tags.join(' ').toLowerCase().normalize('NFKC'),
    });
  }
  return { haystacks, fields };
}

const indexCache = new Map<Locale, SearchIndex>();

function getIndex(locale: Locale): SearchIndex {
  const cached = indexCache.get(locale);
  if (cached) return cached;
  const index = buildSearchIndex(locale);
  indexCache.set(locale, index);
  return index;
}

/** Local search: every query term must appear; title/tag/summary hits score higher. */
export function searchArticles(query: string, locale: Locale): SearchResult[] {
  const normalized = query.trim().toLowerCase().normalize('NFKC');
  if (!normalized) return [];

  const terms = normalized
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
  if (terms.length === 0) return [];

  const index = getIndex(locale);
  const results: SearchResult[] = [];

  for (const [slug, haystack] of index.haystacks) {
    let score = 0;
    for (const term of terms) {
      if (!haystack.includes(term)) {
        score = 0;
        break;
      }
      const fields = index.fields.get(slug);
      if (!fields) continue;
      if (fields.title.includes(term)) score += 5;
      if (fields.tags.includes(term)) score += 3;
      if (fields.summary.includes(term)) score += 2;
      score += 1;
    }
    if (score > 0) {
      const article = articles.find((item) => item.slug === slug);
      if (article) results.push({ article, score });
    }
  }

  return results.sort(
    (a, b) => b.score - a.score || b.article.updatedAt.localeCompare(a.article.updatedAt),
  );
}
