import { describe, expect, it } from 'vitest';
import {
  openDb,
  putRecord,
  getRecord,
  getAllRecords,
  deleteRecord,
  clearAllStores,
} from '../src/lib/storage/db';
import { getSetting, setSetting } from '../src/lib/storage/settings';
import {
  getProgress,
  getRecentProgress,
  saveProgress,
} from '../src/lib/knowledge/progress';

describe('IndexedDB storage foundation', () => {
  it('creates the expected object stores', async () => {
    const db = await openDb();
    expect(db.objectStoreNames.contains('settings')).toBe(true);
    expect(db.objectStoreNames.contains('drafts')).toBe(true);
    expect(db.objectStoreNames.contains('knowledgeProgress')).toBe(true);
  });

  it('round-trips settings records', async () => {
    await setSetting('locale', 'zh-CN');
    expect(await getSetting('locale')).toBe('zh-CN');
    await setSetting('locale', 'en');
    expect(await getSetting('locale')).toBe('en');
  });

  it('reads, deletes, and clears records', async () => {
    await putRecord('settings', { key: 'theme', value: 'light' });
    const rows = await getAllRecords<{ key: string; value: string }>('settings');
    expect(rows).toContainEqual({ key: 'theme', value: 'light' });

    await deleteRecord('settings', 'theme');
    expect(await getSetting('theme')).toBeUndefined();

    await setSetting('locale', 'en');
    await clearAllStores();
    expect(await getSetting('locale')).toBeUndefined();
    expect(await getAllRecords('settings')).toEqual([]);
  });

  it('round-trips knowledge reading progress', async () => {
    await saveProgress({
      slug: 'cp-cpk-pp-ppk',
      locale: 'zh-CN',
      title: 'Cp、Cpk、Pp、Ppk 有什么区别？',
      scrollRatio: 0.5,
      updatedAt: '2026-07-31',
    });
    const progress = await getProgress('cp-cpk-pp-ppk');
    expect(progress?.scrollRatio).toBe(0.5);
    expect(progress?.title).toContain('Cp、Cpk');

    const recent = await getRecentProgress(5);
    expect(recent.some((item) => item.slug === 'cp-cpk-pp-ppk')).toBe(true);
  });
});
