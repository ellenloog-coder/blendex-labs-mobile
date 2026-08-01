import { describe, expect, it } from 'vitest';
import { searchArticles } from '../src/lib/knowledge/search';

describe('local search index', () => {
  it('finds Chinese articles by phrase', () => {
    const results = searchArticles('过程能力', 'zh-CN');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((result) => result.article.slug === 'cp-cpk-pp-ppk')).toBe(true);
  });

  it('finds English articles by keyword', () => {
    const results = searchArticles('gage r&r', 'en');
    expect(
      results.some((result) => result.article.slug === 'msa-method-selection-en'),
    ).toBe(true);
  });

  it('returns nothing for an empty query', () => {
    expect(searchArticles('', 'en')).toEqual([]);
    expect(searchArticles('   ', 'zh-CN')).toEqual([]);
  });

  it('returns nothing when nothing matches', () => {
    expect(searchArticles('zzzqqq', 'en')).toEqual([]);
  });

  it('scores matches and orders by relevance', () => {
    const results = searchArticles('cpk', 'en');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0);
  });
});
