import { getRecord, putRecord, clearAllStores } from './db';

export interface AppSettings {
  locale?: 'en' | 'zh-CN';
  theme?: 'light';
}

export async function getSetting<T = string>(key: string): Promise<T | undefined> {
  const row = await getRecord<{ key: string; value: T }>('settings', key);
  return row?.value;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await putRecord('settings', { key, value });
}

export { clearAllStores };
