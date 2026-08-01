import { describe, expect, it } from 'vitest';
import { articles, knowledgeIndex } from '../src/lib/knowledge/data';
import { categories } from '../src/lib/knowledge/categories';

describe('knowledge content index', () => {
  it('imports the expected bilingual article set', () => {
    expect(knowledgeIndex.articleCount).toBe(10);
    expect(articles).toHaveLength(10);
    expect(articles.filter((article) => article.locale === 'en')).toHaveLength(5);
    expect(articles.filter((article) => article.locale === 'zh-CN')).toHaveLength(5);
  });

  it('every article has a valid bilingual pair', () => {
    for (const article of articles) {
      expect(article.pairSlug).toBeTruthy();
      const pair = articles.find((item) => item.slug === article.pairSlug);
      expect(pair).toBeTruthy();
      expect(pair?.locale).not.toBe(article.locale);
    }
  });

  it('has unique slugs and valid categories', () => {
    const slugs = articles.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const ids = categories.map((category) => category.id);
    for (const article of articles) {
      expect(ids).toContain(article.categoryId);
    }
  });

  it('has non-empty bodies and metadata', () => {
    for (const article of articles) {
      expect(article.title.length).toBeGreaterThan(0);
      expect(article.summary.length).toBeGreaterThan(0);
      expect(article.body.source.length).toBeGreaterThan(50);
      expect(['markdown', 'html']).toContain(article.body.kind);
    }
  });

  it('marks the featured insight', () => {
    const featured = articles.filter((article) => article.featured).map((article) => article.slug);
    expect(featured).toContain('ai-transforming-quality-engineering');
  });
});
