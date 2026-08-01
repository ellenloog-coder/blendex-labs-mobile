import { getAllRecords, getRecord, putRecord } from '../storage/db';
import type { Locale } from '../i18n';

export interface KnowledgeProgress {
  slug: string;
  locale: Locale;
  title: string;
  scrollRatio: number;
  readAt: string;
  updatedAt: string;
}

export async function saveProgress(
  entry: Omit<KnowledgeProgress, 'readAt'>,
): Promise<void> {
  await putRecord('knowledgeProgress', { ...entry, readAt: new Date().toISOString() });
}

export async function getProgress(slug: string): Promise<KnowledgeProgress | undefined> {
  return getRecord<KnowledgeProgress>('knowledgeProgress', slug);
}

export async function getRecentProgress(limit = 3): Promise<KnowledgeProgress[]> {
  const all = await getAllRecords<KnowledgeProgress>('knowledgeProgress');
  return all
    .sort((a, b) => b.readAt.localeCompare(a.readAt))
    .slice(0, limit);
}
