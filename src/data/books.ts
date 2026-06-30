import { Book } from '../store/useStore';
import { BOOKS } from './content';

export const booksData: Book[] = BOOKS.map(b => ({
  id: b.id,
  title: b.title,
  titleAr: b.titleAr,
  author: b.author,
  category: b.category,
  language: b.language || 'Русский',
  pages: b.pages,
  size: b.size,
  description: b.description || '',
  coverColor: b.coverColor,
  coverEmoji: b.coverEmoji,
  coverImage: b.coverImage,
  tags: b.tags || [],
  year: b.year,
  rating: b.rating,
  featured: b.featured,
  isNew: b.isNew,
}));

export const fallbackBooks = booksData;
