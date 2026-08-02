import { describe, expect, it } from 'vitest';
import { articles, knowledgeIndex } from '../src/lib/knowledge/data';
import { categories } from '../src/lib/knowledge/categories';

describe('knowledge content index', () => {
  it('imports a complete bilingual article set', () => {
    expect(knowledgeIndex.articleCount).toBeGreaterThan(0);
    expect(articles).toHaveLength(knowledgeIndex.articleCount);
    const en = articles.filter((article) => article.locale === 'en');
    const zh = articles.filter((article) => article.locale === 'zh-CN');
    expect(en.length).toBe(zh.length);
    expect(en.length).toBe(knowledgeIndex.articleCount / 2);
  });

  it('records sync metadata (source, commit, generatedAt)', () => {
    expect(knowledgeIndex.generatedAt).toBeTruthy();
    expect(knowledgeIndex.sourceUrl).toBeTruthy();
    expect('sourceCommit' in knowledgeIndex).toBe(true);
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
