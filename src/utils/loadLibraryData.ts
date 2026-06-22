import type { Biography, Book, Category } from '../store/useStore';
import { biographiesData } from '../data/biographies';
import { booksData } from '../data/books';
import { categoriesData } from '../data/categories';

export interface LibraryDataBundle {
  books: Book[];
  biographies: Biography[];
  audioLessons: [];
  fawaid: [];
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
  const [books, biographies, categories] = await Promise.all([
    loadJsonArray<Book>('data/books.json', booksData),
    loadJsonArray<Biography>('data/biographies.json', biographiesData),
    loadJsonArray<Category>('data/categories.json', categoriesData),
  ]);

  return {
    books,
    biographies,
    audioLessons: [],
    fawaid: [],
    categories,
  };
}
