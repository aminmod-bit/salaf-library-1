import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store/useStore';

describe('useStore', () => {
  beforeEach(() => {
    const { setBooks, setBiographies, setAudioLessons, setFawaid, setCategories, setLoading, clearHistory } = useStore.getState();
    setBooks([]);
    setBiographies([]);
    setAudioLessons([]);
    setFawaid([]);
    setCategories([]);
    setLoading(true);
    clearHistory();
    useStore.setState({ favorites: [], readingProgress: [], audioProgress: [] });
  });

  it('has correct initial state', () => {
    const state = useStore.getState();
    expect(state.books).toEqual([]);
    expect(state.isLoading).toBe(true);
    expect(state.theme).toBe('dark');
    expect(state.favorites).toEqual([]);
  });

  it('toggles favorites', () => {
    const { toggleFavorite, isFavorite } = useStore.getState();
    toggleFavorite('b1');
    expect(isFavorite('b1')).toBe(true);
    toggleFavorite('b1');
    expect(isFavorite('b1')).toBe(false);
  });

  it('adds and retrieves reading progress', () => {
    const { saveReadingProgress, getReadingProgress } = useStore.getState();
    const progress = { bookId: 'b1', page: 10, totalPages: 100, lastRead: '2026-01-01', title: 'Test', author: 'Author' };
    saveReadingProgress(progress);
    expect(getReadingProgress('b1')).toEqual(progress);
  });

  it('adds and retrieves audio progress', () => {
    const { saveAudioProgress, getAudioProgress } = useStore.getState();
    const progress = { audioId: 'a1', position: 30, duration: 120, lastPlayed: '2026-01-01', title: 'Lesson', author: 'Lecturer' };
    saveAudioProgress(progress);
    expect(getAudioProgress('a1')).toEqual(progress);
  });

  it('updates theme', () => {
    const { setTheme } = useStore.getState();
    setTheme('light');
    expect(useStore.getState().theme).toBe('light');
  });
});
