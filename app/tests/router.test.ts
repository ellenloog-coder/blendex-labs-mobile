import { describe, expect, it } from 'vitest';
import { parseHash } from '../src/lib/router';
import { matchRoute, routes } from '../src/lib/router/routes';

describe('hash router foundation', () => {
  it('parses hash strings into paths', () => {
    expect(parseHash('')).toBe('/');
    expect(parseHash('#')).toBe('/');
    expect(parseHash('#/workspace')).toBe('/workspace');
    expect(parseHash('/reports')).toBe('/reports');
  });

  it('matches the shell and knowledge routes', () => {
    expect(routes).toHaveLength(10);
    expect(new Set(routes.map((r) => r.path)).size).toBe(10);
    expect(matchRoute('/workspace').route.name).toBe('workspace');
  });

  it('falls back to home for unknown paths', () => {
    expect(matchRoute('/unknown').route.name).toBe('home');
  });

  it('matches parameterized knowledge routes', () => {
    const article = matchRoute('/knowledge/article/cp-cpk-pp-ppk');
    expect(article.route.name).toBe('knowledge-article');
    expect(article.params.slug).toBe('cp-cpk-pp-ppk');

    const category = matchRoute('/knowledge/category/methodology');
    expect(category.route.name).toBe('knowledge-category');
    expect(category.params.categoryId).toBe('methodology');

    expect(matchRoute('/knowledge/article/cp-cpk-pp-ppk').route.showNav).toBe(false);
    expect(matchRoute('/knowledge/article/cp-cpk-pp-ppk').route.hideAppHeader).toBe(true);
  });
});
