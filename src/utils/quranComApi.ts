const API = 'https://api.quran.com/api/v4';

export interface QuranChapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: string;
  translated_name?: { name: string; language_name: string };
}

export interface QuranVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translations?: Array<{ id: number; text: string; resource_id: number }>;
  tafsirs?: Array<{ id: number; text: string; resource_id: number }>;
}

export interface QuranResource { id: number; name: string; author_name?: string; language_name?: string; }
export interface QuranRecitation extends QuranResource { style?: string; translated_name?: { name: string }; }

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`Quran.com API error ${res.status}`);
  return res.json();
}

const languageMap: Record<string, string> = { ru: 'ru', en: 'en', ar: 'ar', tg: 'tg', uz: 'uz', fa: 'fa' };
const defaultTranslation: Record<string, number> = { ru: 79, en: 20, tg: 139, uz: 55, fa: 135, ar: 20 };

export function quranApiLanguage(lang: string) {
  return languageMap[lang] || 'ru';
}

export function defaultTranslationId(lang: string) {
  return defaultTranslation[lang] || 79;
}

export async function getChapters(lang = 'ru') {
  const data = await api<{ chapters: QuranChapter[] }>(`/chapters?language=${quranApiLanguage(lang)}`);
  return data.chapters;
}

export async function getTranslations() {
  const data = await api<{ translations: QuranResource[] }>('/resources/translations');
  return data.translations;
}

export async function getTafsirs() {
  const data = await api<{ tafsirs: QuranResource[] }>('/resources/tafsirs');
  return data.tafsirs;
}

export async function getRecitations() {
  const data = await api<{ recitations: QuranRecitation[] }>('/resources/recitations');
  return data.recitations;
}

export async function getVersesByChapter(chapter: number, translationId?: number, tafsirId?: number) {
  const params = new URLSearchParams({
    words: 'false',
    per_page: '300',
    fields: 'text_uthmani,verse_key',
  });
  if (translationId) params.set('translations', String(translationId));
  if (tafsirId) params.set('tafsirs', String(tafsirId));
  const data = await api<{ verses: QuranVerse[] }>(`/verses/by_chapter/${chapter}?${params.toString()}`);
  return data.verses;
}

export async function getVersesByJuz(juz: number, translationId?: number) {
  const params = new URLSearchParams({ words: 'false', per_page: '300', fields: 'text_uthmani,verse_key' });
  if (translationId) params.set('translations', String(translationId));
  const data = await api<{ verses: QuranVerse[] }>(`/verses/by_juz/${juz}?${params.toString()}`);
  return data.verses;
}

export async function getChapterAudio(chapter: number, recitationId: number) {
  const data = await api<{ audio_files: Array<{ audio_url: string; verse_key?: string; url?: string }> }>(`/recitations/${recitationId}/by_chapter/${chapter}`);
  return data.audio_files;
}
