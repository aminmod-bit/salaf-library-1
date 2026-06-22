import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, AudioItem, Biography, Fawaid, Category, HistoryItem, ReadingGoal } from '../types';

interface AppState {
  // Data
  books: Book[];
  audio: AudioItem[];
  biographies: Biography[];
  fawaid: Fawaid[];
  categories: Category[];
  dataLoaded: boolean;

  // User preferences
  favorites: string[];
  history: HistoryItem[];
  readingGoal: ReadingGoal;
  language: string;
  theme: 'dark' | 'light';

  // UI state
  searchQuery: string;
  selectedCategory: string;
  isLoading: boolean;
  sidebarOpen: boolean;

  // Actions
  setBooks: (books: Book[]) => void;
  setAudio: (audio: AudioItem[]) => void;
  setBiographies: (biographies: Biography[]) => void;
  setFawaid: (fawaid: Fawaid[]) => void;
  setCategories: (categories: Category[]) => void;
  setDataLoaded: (loaded: boolean) => void;

  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setIsLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;

  updateReadingGoal: (goal: Partial<ReadingGoal>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Data
      books: [],
      audio: [],
      biographies: [],
      fawaid: [],
      categories: [],
      dataLoaded: false,

      // User preferences
      favorites: [],
      history: [],
      readingGoal: { target: 12, current: 0, year: new Date().getFullYear() },
      language: 'ru',
      theme: 'dark',

      // UI state
      searchQuery: '',
      selectedCategory: '',
      isLoading: false,
      sidebarOpen: false,

      // Data actions
      setBooks: (books) => set({ books }),
      setAudio: (audio) => set({ audio }),
      setBiographies: (biographies) => set({ biographies }),
      setFawaid: (fawaid) => set({ fawaid }),
      setCategories: (categories) => set({ categories }),
      setDataLoaded: (dataLoaded) => set({ dataLoaded }),

      // User actions
      toggleFavorite: (id) => {
        const favorites = get().favorites;
        if (favorites.includes(id)) {
          set({ favorites: favorites.filter((f) => f !== id) });
        } else {
          set({ favorites: [...favorites, id] });
        }
      },

      isFavorite: (id) => get().favorites.includes(id),

      addToHistory: (item) => {
        const history = get().history.filter((h) => h.itemId !== item.itemId);
        set({ history: [item, ...history].slice(0, 100) });
      },

      clearHistory: () => set({ history: [] }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      updateReadingGoal: (goal) =>
        set({ readingGoal: { ...get().readingGoal, ...goal } }),
    }),
    {
      name: 'maktabah-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        history: state.history,
        readingGoal: state.readingGoal,
        language: state.language,
        theme: state.theme,
      }),
    }
  )
);
