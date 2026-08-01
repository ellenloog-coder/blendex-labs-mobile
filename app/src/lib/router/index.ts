import { get, writable } from 'svelte/store';

export function parseHash(hash: string): string {
  const raw = hash.replace(/^#/, '') || '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function currentHash(): string {
  return typeof window === 'undefined' ? '/' : parseHash(window.location.hash);
}

export const route = writable<string>(currentHash());

export function navigate(path: string): void {
  const next = parseHash(path);
  if (get(route) === next) return;
  route.set(next);
  if (typeof window !== 'undefined' && window.location.hash !== `#${next}`) {
    window.location.hash = next;
  }
}

export function back(defaultPath = '/'): void {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back();
  } else {
    navigate(defaultPath);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    route.set(parseHash(window.location.hash));
  });
}
