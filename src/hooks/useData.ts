import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { booksData, fallbackBooks } from '../data/books';
import { biographiesData, fallbackBiographies } from '../data/biographies';
import { categoriesData, fallbackCategories } from '../data/categories';
import type { Biography, Book, Category } from '../store/useStore';

async function fetchJson<T>(url: string): Promise<T[] | null> {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? (data as T[]) : null;
  } catch {
    return null;
  }
}

export function useLoadData() {
  const { books, setBooks, setAudioLessons, setBiographies, setFawaid, setCategories, setLoading } = useStore();

  useEffect(() => {
    if (books.length > 0) return;
    let mounted = true;

    async function loadData() {
      const [loadedBooks, loadedBiographies, loadedCategories] = await Promise.all([
        fetchJson<Book>('./data/books.json'),
        fetchJson<Biography>('./data/biographies.json'),
        fetchJson<Category>('./data/categories.json'),
      ]);

      if (!mounted) return;
      setBooks(loadedBooks ?? fallbackBooks ?? booksData);
      setAudioLessons([]);
      setBiographies(loadedBiographies ?? fallbackBiographies ?? biographiesData);
      setFawaid([]);
      setCategories(loadedCategories ?? fallbackCategories ?? categoriesData);
      setLoading(false);
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [books.length, setAudioLessons, setBiographies, setBooks, setCategories, setFawaid, setLoading]);
}

export default useLoadData;
