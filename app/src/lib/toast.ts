import { writable } from 'svelte/store';

export interface ToastMessage {
  id: number;
  message: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger';
}

export const toasts = writable<ToastMessage[]>([]);

let nextId = 1;

export function showToast(
  message: string,
  tone: ToastMessage['tone'] = 'neutral',
): void {
  const id = nextId++;
  toasts.update((list) => [...list, { id, message, tone }]);
  setTimeout(() => {
    toasts.update((list) => list.filter((item) => item.id !== id));
  }, 3000);
}
