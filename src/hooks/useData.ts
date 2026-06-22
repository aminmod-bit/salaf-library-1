import { useEffect } from 'react';
import { useAppStore } from '../store';
import { fallbackBooks } from '../data/books';
import { fallbackBiographies } from '../data/biographies';
import { fallbackAudio } from '../data/audio';
import { fallbackFawaid } from '../data/fawaid';
import { fallbackCategories } from '../data/categories';

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

export function useLoadData() {
  const { setBooks, setAudio, setBiographies, setFawaid, setCategories, setDataLoaded, dataLoaded } = useAppStore();

  useEffect(() => {
    if (dataLoaded) return;

    async function loadData() {
      const [books, audio, biographies, fawaid, categories] = await Promise.all([
        fetchJson<typeof fallbackBooks>('./data/books.json'),
        fetchJson<typeof fallbackAudio>('./data/audio.json'),
        fetchJson<typeof fallbackBiographies>('./data/biographies.json'),
        fetchJson<typeof fallbackFawaid>('./data/fawaid.json'),
        fetchJson<typeof fallbackCategories>('./data/categories.json'),
      ]);

      setBooks(books && books.length > 0 ? books : fallbackBooks);
      setAudio(audio && audio.length > 0 ? audio : fallbackAudio);
      setBiographies(biographies && biographies.length > 0 ? biographies : fallbackBiographies);
      setFawaid(fawaid && fawaid.length > 0 ? fawaid : fallbackFawaid);
      setCategories(categories && categories.length > 0 ? categories : fallbackCategories);
      setDataLoaded(true);
    }

    loadData();
  }, [dataLoaded, setBooks, setAudio, setBiographies, setFawaid, setCategories, setDataLoaded]);
}
