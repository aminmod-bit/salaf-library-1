import type { AudioLesson, Biography, Book, Category, Faidah } from '../store/useStore';
import { biographiesData } from '../data/biographies';
import { booksData } from '../data/books';
import { categoriesData } from '../data/categories';
import { audioData } from '../data/audio';
import { fawaidData } from '../data/fawaid';

export interface LibraryDataBundle {
  books: Book[];
  biographies: Biography[];
  audioLessons: AudioLesson[];
  fawaid: Faidah[];
  categories: Category[];
}

const BASE_URL = import.meta.env.BASE_URL || '/';

function publicUrl(path: string) {
  return new URL(path, document.baseURI || window.location.origin + BASE_URL).toString();
}

async function loadJsonArray<T>(path: string, fallback: T[]): Promise<T[]> {
  try {
    const response = await fetch(publicUrl(path), { cache: 'no-cache' });
    if (!response.ok) return fallback;
    const data = await response.json();
    return Array.isArray(data) ? (data as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export async function loadLibraryData(): Promise<LibraryDataBundle> {
  // Check for admin override in localStorage
  let adminBooks: Book[] | null = null;
  try {
    const saved = localStorage.getItem('salaf-admin-books');
    if (saved) adminBooks = JSON.parse(saved);
  } catch {}

  const [jsonBooks, biographies, categories, audioLessons, fawaid] = await Promise.all([
    loadJsonArray<Book>('data/books.json', booksData),
    loadJsonArray<Biography>('data/biographies.json', biographiesData),
    loadJsonArray<Category>('data/categories.json', categoriesData),
    loadJsonArray<AudioLesson>('data/audio.json', audioData),
    loadJsonArray<Faidah>('data/fawaid.json', fawaidData),
  ]);

  // Use admin override if available, otherwise use JSON data
  const books = adminBooks && adminBooks.length > 0 ? adminBooks : jsonBooks;

  return {
    books,
    biographies,
    audioLessons,
    fawaid,
    categories,
  };
}
