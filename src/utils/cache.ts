// Cache keys
export const CACHE_KEYS = {
  GENERATED_COVERS: 'salaf-library-generated-covers',
  BOOK_METADATA: 'salaf-library-book-metadata',
  DATA_CACHE: 'salaf-library-cache',
} as const;

// Event name for data updates
export const DATA_UPDATED_EVENT = 'salaf-library-data-updated';

// Dispatch data updated event
export function dispatchDataUpdated(detail?: Record<string, any>) {
  window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT, { detail }));
}

// Listen for data updates
export function onDataUpdated(callback: () => void) {
  window.addEventListener(DATA_UPDATED_EVENT, callback);
  return () => window.removeEventListener(DATA_UPDATED_EVENT, callback);
}

// Save generated cover to cache
export function saveGeneratedCover(bookId: string, dataUrl: string) {
  try {
    const covers = JSON.parse(localStorage.getItem(CACHE_KEYS.GENERATED_COVERS) || '{}');
    covers[bookId] = dataUrl;
    localStorage.setItem(CACHE_KEYS.GENERATED_COVERS, JSON.stringify(covers));
    dispatchDataUpdated({ type: 'cover', bookId });
  } catch {}
}

// Get generated cover from cache
export function getGeneratedCover(bookId: string): string | null {
  try {
    const covers = JSON.parse(localStorage.getItem(CACHE_KEYS.GENERATED_COVERS) || '{}');
    return covers[bookId] || null;
  } catch { return null; }
}

// Save book metadata to cache
export function saveBookMetadata(bookId: string, metadata: Record<string, any>) {
  try {
    const data = JSON.parse(localStorage.getItem(CACHE_KEYS.BOOK_METADATA) || '{}');
    data[bookId] = { ...data[bookId], ...metadata, updatedAt: new Date().toISOString() };
    localStorage.setItem(CACHE_KEYS.BOOK_METADATA, JSON.stringify(data));
    dispatchDataUpdated({ type: 'metadata', bookId });
  } catch {}
}

// Get book metadata from cache
export function getBookMetadata(bookId: string): Record<string, any> | null {
  try {
    const data = JSON.parse(localStorage.getItem(CACHE_KEYS.BOOK_METADATA) || '{}');
    return data[bookId] || null;
  } catch { return null; }
}

// Clear all caches (except favorites and admin data)
export async function clearAllCaches() {
  // Clear Cache API
  if ('caches' in window) {
    const names = await caches.keys();
    for (const name of names) {
      await caches.delete(name);
    }
  }

  // Clear localStorage caches
  localStorage.removeItem(CACHE_KEYS.GENERATED_COVERS);
  localStorage.removeItem(CACHE_KEYS.BOOK_METADATA);
  localStorage.removeItem(CACHE_KEYS.DATA_CACHE);

  dispatchDataUpdated({ type: 'clear' });
}

// Clear only generated covers
export function clearGeneratedCovers() {
  localStorage.removeItem(CACHE_KEYS.GENERATED_COVERS);
  dispatchDataUpdated({ type: 'covers-cleared' });
}

// Clear only book metadata
export function clearBookMetadata() {
  localStorage.removeItem(CACHE_KEYS.BOOK_METADATA);
  dispatchDataUpdated({ type: 'metadata-cleared' });
}
