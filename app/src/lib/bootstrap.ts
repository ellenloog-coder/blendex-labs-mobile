import { initI18n } from './i18n';
import { getSetting, clearAllStores } from './storage/settings';
import { openDb } from './storage/db';
import { registerSW } from 'virtual:pwa-register';

/**
 * Phase 0.1 bootstrap: open the local database, restore persisted settings,
 * and register the service worker. All work is local; nothing leaves the device.
 */
export async function bootstrap(): Promise<void> {
  await openDb();
  await initI18n(getSetting);
  registerSW({ immediate: true });
}

export { clearAllStores, getSetting, setSetting } from './storage/settings';
