export const DB_NAME = 'blendex-labs';
export const DB_VERSION = 4;

export const STORES = [
  'settings',
  'drafts',
  'knowledgeProgress',
  'conversations',
  'reports',
] as const;
export type StoreName = (typeof STORES)[number];

const KEY_PATHS: Record<StoreName, string> = {
  settings: 'key',
  drafts: 'id',
  knowledgeProgress: 'slug',
  conversations: 'id',
  reports: 'id',
};

let dbPromise: Promise<IDBDatabase> | null = null;

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

export function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: KEY_PATHS[name] });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
  return dbPromise;
}

export async function getRecord<T>(storeName: StoreName, key: string): Promise<T | undefined> {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readonly');
  const result = await requestToPromise(tx.objectStore(storeName).get(key));
  return result as T | undefined;
}

export async function putRecord(
  storeName: StoreName,
  value: Record<string, unknown>,
): Promise<IDBValidKey> {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  return requestToPromise(tx.objectStore(storeName).put(value));
}

export async function deleteRecord(storeName: StoreName, key: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  await requestToPromise(tx.objectStore(storeName).delete(key));
}

export async function getAllRecords<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readonly');
  const result = await requestToPromise(tx.objectStore(storeName).getAll());
  return result as T[];
}

export async function clearAllStores(): Promise<void> {
  const db = await openDb();
  await Promise.all(
    STORES.map(async (name) => {
      const tx = db.transaction(name, 'readwrite');
      await requestToPromise(tx.objectStore(name).clear());
    }),
  );
}
