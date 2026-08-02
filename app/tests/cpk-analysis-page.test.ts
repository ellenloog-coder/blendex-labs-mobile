import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import CpkAnalysisPage from '../src/lib/pages/tools/CpkAnalysisPage.svelte';
import App from '../src/App.svelte';
import { locale } from '../src/lib/i18n';
import { route } from '../src/lib/router';

const SAMPLE = '9.96\n9.98\n10.00\n10.02\n10.04';
const PLACEHOLDER = 'Paste measurements, one per line or separated by commas...';

beforeEach(() => {
  locale.set('en');
});

describe('CPK analysis page', () => {
  it('renders the input section, specification limits, and analyze action', () => {
    render(CpkAnalysisPage);
    expect(screen.getByText('Measurement Data')).toBeTruthy();
    expect(screen.getByText('Specifications')).toBeTruthy();
    expect(screen.getByLabelText('LSL')).toBeTruthy();
    expect(screen.getByLabelText('USL')).toBeTruthy();
    expect(screen.getByLabelText('Capability Requirement')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Analyze Data' })).toBeTruthy();
  });

  it('shows validation errors for invalid input', async () => {
    render(CpkAnalysisPage);
    const textarea = screen.getByPlaceholderText(PLACEHOLDER);
    await fireEvent.input(textarea, { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze Data' }));

    await waitFor(() =>
      expect(screen.getByText('Please enter at least two valid numeric values.')).toBeTruthy(),
    );
  });

  it('runs a successful analysis flow and renders the decision card result', async () => {
    render(CpkAnalysisPage);
    await fireEvent.input(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: SAMPLE } });
    await fireEvent.input(screen.getByLabelText('Capability Requirement'), {
      target: { value: '1.0' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze Data' }));

    await waitFor(() => expect(screen.getByText('Meets Requirement')).toBeTruthy());

    for (const label of ['Cp', 'Cpk', 'Pp', 'Ppk']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText('1.054').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('Evidence Summary')).toBeTruthy();
    expect(screen.getByText('Sample size')).toBeTruthy();
    expect(screen.getByText('Insights')).toBeTruthy();
    expect(screen.getByText('Actions')).toBeTruthy();
    expect(screen.getByText(/Only summary metrics and deterministic insights/)).toBeTruthy();
  });

  it('renders a below-requirement result when the index is below the benchmark', async () => {
    render(CpkAnalysisPage);
    await fireEvent.input(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: SAMPLE } });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze Data' }));

    await waitFor(() => expect(screen.getByText('Below Requirement')).toBeTruthy());
  });

  it('opens the real CPK page from the tool route', async () => {
    route.set('/workspace/tool/cpk');
    render(App);
    await tick();
    expect(screen.getByRole('button', { name: 'Analyze Data' })).toBeTruthy();
  });
});
