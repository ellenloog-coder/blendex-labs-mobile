import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import App from '../src/App.svelte';
import { route } from '../src/lib/router';

async function openKnowledgeHub() {
  route.set('/');
  render(App);
  fireEvent.click(screen.getByRole('button', { name: 'Workspace' }));
  await tick();
  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
  await tick();
}

describe('knowledge pages', () => {
  it('opens the knowledge hub from the Workspace', async () => {
    await openKnowledgeHub();
    expect(screen.getByText('Quality Engineering Knowledge Hub')).toBeTruthy();
    expect(screen.getByText('Methodology & Standards')).toBeTruthy();
    expect(screen.getByText('Explore Topics')).toBeTruthy();
  });

  it('searches articles locally', async () => {
    await openKnowledgeHub();
    const input = screen.getByPlaceholderText('Search articles, methods, standards...');
    await fireEvent.input(input, { target: { value: 'cpk' } });
    await tick();
    expect(
      screen.getAllByText('What is the difference between Cp, Cpk, Pp and Ppk?').length,
    ).toBeGreaterThan(0);
  });

  it('navigates to a category page', async () => {
    await openKnowledgeHub();
    fireEvent.click(screen.getByRole('button', { name: /Methodology & Standards/ }));
    await tick();
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'Methodology & Standards',
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Methodology & Standards',
    );
  });

  it('opens an article in reading mode and hides the bottom navigation', async () => {
    await openKnowledgeHub();
    fireEvent.click(
      screen.getByText('What is the difference between Cp, Cpk, Pp and Ppk?'),
    );
    await tick();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'What is the difference between Cp, Cpk, Pp and Ppk?',
    );
    expect(
      screen.getByRole('heading', {
        name: 'Within-process variation versus overall variation',
        level: 2,
      }),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reports' })).toBeNull();
  });

  it('switches article language with the EN/中文 toggle', async () => {
    await openKnowledgeHub();
    fireEvent.click(
      screen.getByText('What is the difference between Cp, Cpk, Pp and Ppk?'),
    );
    await tick();
    fireEvent.click(screen.getByRole('button', { name: '中文' }));
    await tick();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Cp、Cpk、Pp、Ppk 有什么区别？',
    );
  });

  it('opens the related tool preview from an article', async () => {
    await openKnowledgeHub();
    fireEvent.click(
      screen.getByText('What is the difference between Cp, Cpk, Pp and Ppk?'),
    );
    await tick();

    expect(screen.getByText('Process Capability Analysis Tool')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open Tool' }));
    await tick();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('CPK Analysis');
  });
});
