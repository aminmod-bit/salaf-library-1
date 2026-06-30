import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal, ReadingPlan } from '../data/goals';
import { goalsData, readingPlanData } from '../data/goals';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ThemeMode = 'medina-night' | 'olive-sand' | 'sky-marble' | 'qibla-gold' | 'tender-rose' | 'lilac-pearl' | 'ivory' | 'cream-mint';

export interface Book {
  id: string;
  title: string;
  titleAr?: string;
  originalTitle?: string;
  slug?: string;
  author: string;
  authorId?: string;
  category: string;
  subcategory?: string;
  language: string;
  pages?: number;
  size?: string;
  description: string;
  coverColor?: string;
  coverEmoji?: string;
  coverImage?: string;
  tags: string[];
  fileUrl?: string;
  downloadUrl?: string;
  year?: string;
  publisher?: string;
  isbn?: string;
  translator?: string;
  editor?: string;
  sourceFolder?: string;
  needsReview?: boolean;
  categoryConfidence?: number;
  rating?: number;
  downloads?: number;
  views?: number;
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
  relatedBooks?: string[];
}

export interface Biography {
  id: string;
  name: string;
  nameAr?: string;
  type: 'prophet' | 'companion' | 'tabiin' | 'scholar' | 'modern';
  birthYear?: string;
  deathYear?: string;
  birthPlace?: string;
  description: string;
  fullBio?: string;
  tags: string[];
  relatedBooks?: string[];
  relatedAudio?: string[];
  coverColor?: string;
  coverEmoji?: string;
  coverImage?: string;
  featured?: boolean;
}

export interface AudioLesson {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  category: string;
  description: string;
  duration?: string;
  fileUrl?: string;
  downloadUrl?: string;
  tags: string[];
  coverColor?: string;
  coverEmoji?: string;
  coverImage?: string;
  series?: string;
  episode?: number;
  year?: string;
  relatedBooks?: string[];
  views?: number;
  isNew?: boolean;
}

export interface Faidah {
  id: string;
  text: string;
  textAr?: string;
  author: string;
  authorId?: string;
  category: string;
  language?: string;
  source?: string;
  tags: string[];
  year?: string;
  isFeatured?: boolean;
  likes?: number;
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  icon: string;
  color: string;
  description?: string;
  count?: number;
  type: 'books' | 'audio' | 'bio' | 'all';
}

export interface ReadingProgress {
  bookId: string;
  page: number;
  totalPages: number;
  lastRead: string;
  title: string;
  author: string;
  coverColor?: string;
  coverEmoji?: string;
  coverImage?: string;
}

export interface AudioProgress {
  audioId: string;
  position: number;
  duration: number;
  lastPlayed: string;
  title: string;
  author: string;
  coverColor?: string;
  coverEmoji?: string;
  coverImage?: string;
}

export interface HistoryItem {
  id: string;
  type: 'book' | 'audio' | 'bio' | 'faidah';
  title: string;
  subtitle: string;
  visitedAt: string;
  coverColor?: string;
  coverEmoji?: string;
  coverImage?: string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface LibraryStore {
  // Data
  books: Book[];
  biographies: Biography[];
  audioLessons: AudioLesson[];
  fawaid: Faidah[];
  categories: Category[];

  // UI State
  sidebarOpen: boolean;
  currentPage: string;
  searchQuery: string;
  isLoading: boolean;
  theme: ThemeMode;

  // Audio Player
  currentAudio: AudioLesson | null;
  isPlaying: boolean;
  audioVolume: number;
  audioSpeed: number;

  // Goals & Reading Plan
  goals: Goal[];
  readingPlan: ReadingPlan;

  // User Data (persisted)
  favorites: string[];
  history: HistoryItem[];
  readingProgress: ReadingProgress[];
  audioProgress: AudioProgress[];

  // Actions - Data
  setBooks: (books: Book[]) => void;
  setBiographies: (bios: Biography[]) => void;
  setAudioLessons: (lessons: AudioLesson[]) => void;
  setFawaid: (fawaid: Faidah[]) => void;
  setCategories: (cats: Category[]) => void;
  setLoading: (v: boolean) => void;

  // Actions - UI
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
  setSearchQuery: (q: string) => void;
  setTheme: (theme: ThemeMode) => void;

  // Actions - Audio
  setCurrentAudio: (audio: AudioLesson | null) => void;
  setIsPlaying: (v: boolean) => void;
  setAudioVolume: (v: number) => void;
  setAudioSpeed: (v: number) => void;

  // Actions - User
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  addToHistory: (item: HistoryItem) => void;
  saveReadingProgress: (progress: ReadingProgress) => void;
  saveAudioProgress: (progress: AudioProgress) => void;
  getReadingProgress: (bookId: string) => ReadingProgress | undefined;
  getAudioProgress: (audioId: string) => AudioProgress | undefined;
  clearHistory: () => void;

  // Actions - Goals
  updateGoalProgress: (id: string, value: number) => void;
  setGoals: (goals: Goal[]) => void;
  setReadingPlan: (plan: ReadingPlan) => void;
}

export const useStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      // Initial state
      books: [],
      biographies: [],
      audioLessons: [],
      fawaid: [],
      categories: [],
      sidebarOpen: false,
      currentPage: 'home',
      searchQuery: '',
      isLoading: true,
      theme: 'medina-night',
      currentAudio: null,
      isPlaying: false,
      audioVolume: 0.8,
      audioSpeed: 1,
      goals: goalsData,
      readingPlan: readingPlanData,
      favorites: [],
      history: [],
      readingProgress: [],
      audioProgress: [],

      // Data setters
      setBooks: (books) => set({ books }),
      setBiographies: (biographies) => set({ biographies }),
      setAudioLessons: (audioLessons) => set({ audioLessons }),
      setFawaid: (fawaid) => set({ fawaid }),
      setCategories: (categories) => set({ categories }),
      setLoading: (isLoading) => set({ isLoading }),

      // UI setters
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setTheme: (theme) => set({ theme }),

      // Audio
      setCurrentAudio: (currentAudio) => set({ currentAudio }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setAudioVolume: (audioVolume) => set({ audioVolume }),
      setAudioSpeed: (audioSpeed) => set({ audioSpeed }),

      // User actions
      toggleFavorite: (id) => {
        const { favorites } = get();
        const exists = favorites.includes(id);
        set({ favorites: exists ? favorites.filter((f) => f !== id) : [...favorites, id] });
      },

      isFavorite: (id) => get().favorites.includes(id),

      addToHistory: (item) => {
        const { history } = get();
        const filtered = history.filter((h) => h.id !== item.id);
        set({ history: [item, ...filtered].slice(0, 100) });
      },

      saveReadingProgress: (progress) => {
        const { readingProgress } = get();
        const filtered = readingProgress.filter((p) => p.bookId !== progress.bookId);
        set({ readingProgress: [progress, ...filtered] });
      },

      saveAudioProgress: (progress) => {
        const { audioProgress } = get();
        const filtered = audioProgress.filter((p) => p.audioId !== progress.audioId);
        set({ audioProgress: [progress, ...filtered] });
      },

      getReadingProgress: (bookId) => {
        return get().readingProgress.find((p) => p.bookId === bookId);
      },

      getAudioProgress: (audioId) => {
        return get().audioProgress.find((p) => p.audioId === audioId);
      },

      clearHistory: () => set({ history: [] }),

      updateGoalProgress: (id, value) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? { ...g, current: Math.min(g.current + value, g.target), isCompleted: g.current + value >= g.target }
              : g
          ),
        })),

      setGoals: (goals) => set({ goals }),
      setReadingPlan: (readingPlan) => set({ readingPlan }),
    }),
    {
      name: 'salaf-library-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        history: state.history,
        readingProgress: state.readingProgress,
        audioProgress: state.audioProgress,
        audioVolume: state.audioVolume,
        theme: state.theme,
        goals: state.goals,
        readingPlan: state.readingPlan,
      }),
    }
  )
);
