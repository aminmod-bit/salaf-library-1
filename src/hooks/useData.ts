import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { booksData, fallbackBooks } from '../data/books';
import { biographiesData, fallbackBiographies } from '../data/biographies';
import { audioData, fallbackAudio } from '../data/audio';
import { fawaidData, fallbackFawaid } from '../data/fawaid';
import { categoriesData, fallbackCategories } from '../data/categories';
import type { AudioLesson, Biography, Book, Category, Faidah } from '../store/useStore';

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
  const {
    books,
    setBooks,
    setAudioLessons,
    setBiographies,
    setFawaid,
    setCategories,
    setLoading,
  } = useStore();

  useEffect(() => {
    if (books.length > 0) return;
    let mounted = true;

    async function loadData() {
      const [loadedBooks, loadedAudio, loadedBiographies, loadedFawaid, loadedCategories] = await Promise.all([
        fetchJson<Book>('./data/books.json'),
        fetchJson<AudioLesson>('./data/audio.json'),
        fetchJson<Biography>('./data/biographies.json'),
        fetchJson<Faidah>('./data/fawaid.json'),
        fetchJson<Category>('./data/categories.json'),
      ]);

      if (!mounted) return;
      setBooks(loadedBooks && loadedBooks.length > 0 ? loadedBooks : fallbackBooks || booksData);
      setAudioLessons(loadedAudio && loadedAudio.length > 0 ? loadedAudio : fallbackAudio || audioData);
      setBiographies(loadedBiographies && loadedBiographies.length > 0 ? loadedBiographies : fallbackBiographies || biographiesData);
      setFawaid(loadedFawaid && loadedFawaid.length > 0 ? loadedFawaid : fallbackFawaid || fawaidData);
      setCategories(loadedCategories && loadedCategories.length > 0 ? loadedCategories : fallbackCategories || categoriesData);
      setLoading(false);
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [books.length, setAudioLessons, setBiographies, setBooks, setCategories, setFawaid, setLoading]);
}

export default useLoadData;
