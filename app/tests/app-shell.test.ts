import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import App from '../src/App.svelte';

describe('application shell', () => {
  it('renders the brand header and five navigation tabs', () => {
    render(App);
    expect(screen.getByText('Blendex Labs')).toBeTruthy();
    for (const label of ['Home', 'Workspace', 'AI Assistant', 'Reports', 'More']) {
      expect(screen.getByRole('button', { name: label })).toBeTruthy();
    }
  });

  it('navigates between tabs via the bottom navigation', async () => {
    render(App);
    fireEvent.click(screen.getByRole('button', { name: 'Workspace' }));
    await tick();
    expect(
      screen.getByText('Quality engineering tools, running entirely on your device.'),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Reports' }));
    await tick();
    expect(screen.getByText('Your generated reports, stored on this device.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    await tick();
    expect(screen.getByText(/made smarter and simpler/)).toBeTruthy();
  });

  it('switches language and persists the choice', async () => {
    render(App);
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await tick();
    fireEvent.click(screen.getByRole('button', { name: '中文' }));
    await tick();

    expect(screen.getByRole('button', { name: '首页' })).toBeTruthy();
    expect(screen.getByText('设置与应用信息')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    await tick();
    expect(screen.getByRole('button', { name: 'Home' })).toBeTruthy();
  });
});
