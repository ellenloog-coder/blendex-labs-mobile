import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { tick } from 'svelte';
import CpkReportDetailPage from '../src/lib/pages/reports/CpkReportDetailPage.svelte';
import ReportsPage from '../src/lib/pages/ReportsPage.svelte';
import App from '../src/App.svelte';
import { runCapabilityAnalysis } from '../src/lib/tools/capability/adapter';
import { decisionCardToReport } from '../src/lib/tools/capability/report';
import { saveCpkReport } from '../src/lib/tools/capability/report-store';
import { locale } from '../src/lib/i18n';
import { route } from '../src/lib/router';

beforeEach(() => {
  locale.set('en');
});

async function saveSampleReport(title: string) {
  const outcome = runCapabilityAnalysis({
    data: [9.96, 9.98, 10, 10.02, 10.04],
    lsl: 9.9,
    usl: 10.1,
    target: 10,
    benchmark: 1.0,
    language: 'en',
  });
  if (!outcome.ok) throw new Error('expected valid analysis');
  const report = decisionCardToReport(outcome.card, { title, language: 'en' });
  await saveCpkReport(report);
  return report;
}

describe('CPK report detail page', () => {
  it('renders the full decision card report and AI button navigates to the assistant', async () => {
    const report = await saveSampleReport('Connector Diameter');
    render(CpkReportDetailPage, { params: { reportId: report.id } });
    await waitFor(() => expect(screen.getByText('Connector Diameter')).toBeTruthy());

    expect(screen.getByText('Meets Requirement')).toBeTruthy();
    for (const label of ['Cp', 'Cpk', 'Pp', 'Ppk']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.getByText('Evidence Summary')).toBeTruthy();
    expect(screen.getByText('Sample size')).toBeTruthy();
    expect(screen.getByText('Insights')).toBeTruthy();
    expect(screen.getByText('Actions')).toBeTruthy();
    expect(screen.getByText(/Only summary metrics and deterministic insights/)).toBeTruthy();

    const aiButton = screen.getByRole('button', { name: 'Ask the AI Copilot' });
    expect(aiButton.hasAttribute('disabled')).toBe(false);
    fireEvent.click(aiButton);
    await tick();
    expect(get(route)).toBe('/assistant');
  });

  it('shows an empty state for a missing report', async () => {
    render(CpkReportDetailPage, { params: { reportId: 'missing-id' } });
    await waitFor(() => expect(screen.getByText('No reports found')).toBeTruthy());
  });
});

describe('reports list integration', () => {
  it('lists saved CPK reports and navigates to their detail page', async () => {
    const report = await saveSampleReport('Torque Study');
    render(ReportsPage);
    await waitFor(() => expect(screen.getByText('CPK Reports')).toBeTruthy());
    expect(screen.getByText('Torque Study')).toBeTruthy();

    fireEvent.click(screen.getByText('Torque Study'));
    await tick();
    expect(get(route)).toBe(`/reports/cpk/${report.id}`);
  });

  it('opens a saved CPK report through the app route', async () => {
    const report = await saveSampleReport('App Route Report');
    route.set(`/reports/cpk/${report.id}`);
    render(App);
    await waitFor(() => expect(screen.getByText('App Route Report')).toBeTruthy());
  });
});
