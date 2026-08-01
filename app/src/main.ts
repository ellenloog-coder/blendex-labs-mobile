import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { bootstrap } from './lib/bootstrap';

void bootstrap().catch((error: unknown) => {
  // Local-first: the UI must still render if IndexedDB is unavailable.
  console.warn('Bootstrap warning (continuing with defaults):', error);
});

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
