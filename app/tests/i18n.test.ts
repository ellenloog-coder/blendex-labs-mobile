import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { locale, t, detectLocale, setLocale } from '../src/lib/i18n';

describe('i18n foundation', () => {
  it('resolves nested English keys', () => {
    setLocale('en');
    expect(get(t)('nav.home')).toBe('Home');
    expect(get(t)('app.name')).toBe('Blendex Labs');
  });

  it('resolves Chinese translations', () => {
    setLocale('zh-CN');
    expect(get(t)('nav.home')).toBe('首页');
    expect(get(t)('workspace.tools.cpk')).toBe('CPK 分析');
  });

  it('falls back to the key when missing', () => {
    expect(get(t)('missing.deep.key')).toBe('missing.deep.key');
  });

  it('detects a default locale in non-browser environments', () => {
    expect(detectLocale()).toBe('en');
  });

  it('stores the selected locale', () => {
    setLocale('zh-CN');
    expect(get(locale)).toBe('zh-CN');
    setLocale('en');
    expect(get(locale)).toBe('en');
  });
});
