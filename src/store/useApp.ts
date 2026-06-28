import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Favorites = {
  books: string[];
  azkar: string[];
  hadith: string[];
  articles: string[];
  biographies: string[];
};

export type Recent = {
  id: string;
  type: "book" | "azkar" | "hadith" | "article" | "biography";
  title: string;
  path: string;
  ts: number;
};

interface AppState {
  favorites: Favorites;
  recents: Recent[];
  installDismissed: boolean;
  toggleFavorite: (kind: keyof Favorites, id: string) => void;
  isFavorite: (kind: keyof Favorites, id: string) => boolean;
  addRecent: (r: Omit<Recent, "ts">) => void;
  clearRecents: () => void;
  dismissInstall: () => void;
}

const initialFav: Favorites = { books: [], azkar: [], hadith: [], articles: [], biographies: [] };

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: initialFav,
      recents: [],
      installDismissed: false,
      toggleFavorite: (kind, id) =>
        set((state) => {
          const list = state.favorites[kind];
          const exists = list.includes(id);
          return {
            favorites: {
              ...state.favorites,
              [kind]: exists ? list.filter((x) => x !== id) : [id, ...list],
            },
          };
        }),
      isFavorite: (kind, id) => get().favorites[kind].includes(id),
      addRecent: (r) =>
        set((state) => {
          const filtered = state.recents.filter((x) => x.id !== r.id);
          return { recents: [{ ...r, ts: Date.now() }, ...filtered].slice(0, 30) };
        }),
      clearRecents: () => set({ recents: [] }),
      dismissInstall: () => set({ installDismissed: true }),
    }),
    {
      name: "salaf-app",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);