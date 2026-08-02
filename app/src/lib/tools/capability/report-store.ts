import { getAllRecords, getRecord, putRecord } from '../../storage/db';
import type { CpkReport } from './report';

export async function saveCpkReport(report: CpkReport): Promise<void> {
  await putRecord('reports', report as unknown as Record<string, unknown>);
}

export async function getCpkReport(id: string): Promise<CpkReport | undefined> {
  return getRecord<CpkReport>('reports', id);
}

export async function listCpkReports(limit = 20): Promise<CpkReport[]> {
  const all = await getAllRecords<CpkReport>('reports');
  return all
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
