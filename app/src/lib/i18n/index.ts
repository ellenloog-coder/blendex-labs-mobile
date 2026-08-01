import { derived, writable } from 'svelte/store';
import { en } from './messages/en';
import { zhCN } from './messages/zh-CN';

export type Locale = 'en' | 'zh-CN';
export const DEFAULT_LOCALE: Locale = 'en';

export const messages: Record<Locale, Record<string, unknown>> = { en, 'zh-CN': zhCN };
export const locale = writable<Locale>(DEFAULT_LOCALE);

function lookup(table: Record<string, unknown>, key: string): string | undefined {
  let node: unknown = table;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

export const t = derived(locale, ($locale) => {
  return (key: string, vars?: Record<string, string | number>): string => {
    const table = messages[$locale] ?? messages[DEFAULT_LOCALE];
    const raw = lookup(table, key) ?? lookup(messages[DEFAULT_LOCALE], key) ?? key;
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in vars ? String(vars[name]) : match,
    );
  };
});

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  return /^zh/i.test(navigator.language) ? 'zh-CN' : DEFAULT_LOCALE;
}

export function setLocale(next: Locale): void {
  locale.set(next);
}

export async function initI18n(
  getSetting: (key: string) => Promise<string | null | undefined>,
): Promise<void> {
  try {
    const saved = await getSetting('locale');
    if (saved === 'en' || saved === 'zh-CN') {
      locale.set(saved);
      return;
    }
  } catch {
    // Fall through to environment detection if storage is unavailable.
  }
  locale.set(detectLocale());
}
