export interface BookRuntimeStats {
  views: number;
  downloads: number;
}

const BOOK_STATS_KEY = 'salaf-library-book-runtime-stats';
const SESSION_ID_KEY = 'salaf-library-session-id';
const ONLINE_KEY = 'salaf-library-online-sessions';

function sessionId() {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function readBookStats(): Record<string, BookRuntimeStats> {
  try { return JSON.parse(localStorage.getItem(BOOK_STATS_KEY) || '{}'); } catch { return {}; }
}

function writeBookStats(stats: Record<string, BookRuntimeStats>) {
  localStorage.setItem(BOOK_STATS_KEY, JSON.stringify(stats));
  window.dispatchEvent(new CustomEvent('salaf-library-stats-update'));
}

export function getBookRuntimeStats(bookId: string): BookRuntimeStats {
  const stats = readBookStats();
  return stats[bookId] || { views: 0, downloads: 0 };
}

export function incrementBookView(bookId: string) {
  const stats = readBookStats();
  const current = stats[bookId] || { views: 0, downloads: 0 };
  stats[bookId] = { ...current, views: current.views + 1 };
  writeBookStats(stats);
}

export function incrementBookDownload(bookId: string) {
  const stats = readBookStats();
  const current = stats[bookId] || { views: 0, downloads: 0 };
  stats[bookId] = { ...current, downloads: current.downloads + 1 };
  writeBookStats(stats);
}

export function heartbeatOnline() {
  const id = sessionId();
  const now = Date.now();
  let sessions: Record<string, number> = {};
  try { sessions = JSON.parse(localStorage.getItem(ONLINE_KEY) || '{}'); } catch { sessions = {}; }
  sessions[id] = now;
  for (const [key, ts] of Object.entries(sessions)) {
    if (now - ts > 45000) delete sessions[key];
  }
  localStorage.setItem(ONLINE_KEY, JSON.stringify(sessions));
  window.dispatchEvent(new CustomEvent('salaf-library-online-update'));
  return Object.keys(sessions).length;
}

export function getLocalOnlineCount() {
  let sessions: Record<string, number> = {};
  const now = Date.now();
  try { sessions = JSON.parse(localStorage.getItem(ONLINE_KEY) || '{}'); } catch { sessions = {}; }
  return Object.values(sessions).filter(ts => now - ts <= 45000).length || 1;
}

export function getStatsEndpoint() {
  return localStorage.getItem('salaf-library-stats-endpoint') || '';
}

export function setStatsEndpoint(url: string) {
  if (url.trim()) localStorage.setItem('salaf-library-stats-endpoint', url.trim());
  else localStorage.removeItem('salaf-library-stats-endpoint');
}

export async function sendStatsEvent(type: 'book_view' | 'book_download' | 'heartbeat', payload: Record<string, unknown>) {
  const endpoint = getStatsEndpoint();
  if (!endpoint) return null;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload, sessionId: sessionId(), at: new Date().toISOString() }),
    });
    return res.ok ? res.json().catch(() => null) : null;
  } catch {
    return null;
  }
}
