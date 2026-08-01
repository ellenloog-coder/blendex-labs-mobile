import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import App from '../src/App.svelte';
import { route } from '../src/lib/router';

describe('product preview pages', () => {
  it('workspace lists all quality tools with realistic statuses', async () => {
    route.set('/');
    render(App);
    fireEvent.click(screen.getByRole('button', { name: 'Workspace' }));
    await tick();

    for (const name of [
      'CPK Analysis',
      'MSA Analysis',
      'SPC Analysis',
      'DOE Analysis',
      '8D Problem Solving',
      'Reliability Analysis',
      'Sampling Plan',
    ]) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText('Available').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Beta').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Coming Soon').length).toBeGreaterThan(0);
  });

  it('opens a tool preview page from the workspace', async () => {
    route.set('/');
    render(App);
    fireEvent.click(screen.getByRole('button', { name: 'Workspace' }));
    await tick();
    fireEvent.click(screen.getAllByText('CPK Analysis')[0]);
    await tick();

    expect(screen.getByText('Expected flow')).toBeTruthy();
    expect(
      screen.getByText('Preview build — engine integration arrives in Phase 1.'),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('CPK Analysis');
  });

  it('home shows hero, quick tools, reports, knowledge and copilot entries', async () => {
    route.set('/');
    render(App);
    await tick();

    expect(screen.getByText(/made smarter and simpler/)).toBeTruthy();
    expect(screen.getByText('Ask the AI Copilot')).toBeTruthy();
    expect(screen.getByText('Knowledge Highlights')).toBeTruthy();
    expect(screen.getByText('Continue last analysis')).toBeTruthy();
    expect(screen.getByText('Connector Diameter — Process Capability')).toBeTruthy();
  });

  it('reports shows sample cards and filters by tool', async () => {
    route.set('/');
    render(App);
    fireEvent.click(screen.getByRole('button', { name: 'Reports' }));
    await tick();

    expect(screen.getByText('Connector Diameter — Process Capability')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'SPC' }));
    await tick();

    expect(screen.getByText('Inlet Pressure — SPC Monitoring')).toBeTruthy();
    expect(screen.queryByText('Connector Diameter — Process Capability')).toBeNull();
  });

  it('opens a report detail with the decision card pattern', async () => {
    route.set('/');
    render(App);
    fireEvent.click(screen.getByRole('button', { name: 'Reports' }));
    await tick();
    fireEvent.click(screen.getByText('Connector Diameter — Process Capability'));
    await tick();

    expect(screen.getByText('Marginal')).toBeTruthy();
    expect(screen.getByText('Cp')).toBeTruthy();
    expect(screen.getByText('Generate Report')).toBeTruthy();
    expect(screen.getByText('Ask the AI Copilot')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Connector Diameter — Process Capability',
    );
  });

  it('more page offers the AI privacy Learn More link', async () => {
    route.set('/');
    render(App);
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await tick();

    expect(screen.getByText('Learn More')).toBeTruthy();
    fireEvent.click(screen.getByText('Learn More'));
    await tick();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'How AI is changing the way quality engineering works',
    );
  });

  it('runs a local demo conversation in the AI assistant', async () => {
    route.set('/');
    render(App);
    fireEvent.click(screen.getByRole('button', { name: 'AI Assistant' }));
    await tick();

    const input = screen.getByPlaceholderText(
      'Ask anything about quality, analysis, standards...',
    );
    await fireEvent.input(input, { target: { value: 'explain cpk 1.12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await tick();

    expect(screen.getByText('explain cpk 1.12')).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(screen.getAllByText(/Demo \(Cpk\)/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Demo mode: replies are local samples/)).toBeTruthy();
  });
});
