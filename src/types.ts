// Core types for Salaf Library

export type Lang = "ru" | "en" | "ar" | "tg" | "uz" | "fa";

export type FolderId =
  | "aqeedah" | "tawhid" | "manhaj" | "tafsir" | "hadith" | "seerah"
  | "fiqh" | "arabic" | "dawah" | "history" | "biography" | "children"
  | "azkar" | "dua" | "other";

export interface Book {
  id: string;
  title: string;
  titleAr?: string;
  author: string;
  authorAr?: string;
  authorId?: string;
  category: FolderId;
  categoryLabel: string; // localized folder label
  language: "Русский" | "العربية" | "Тоҷикӣ" | "Uzbek" | "فارسی" | "English";
  languageCode: Lang;
  pages?: number;
  size?: string;
  description?: string;
  descriptionAr?: string;
  coverColor?: string;
  coverEmoji?: string;
  coverImage?: string;
  tags?: string[];
  fileUrl?: string;
  downloadUrl?: string;
  year?: string;
  featured?: boolean;
  isNew?: boolean;
  rating?: number; // 0-5
  publisher?: string;
  translator?: string;
  editor?: string;
  isbn?: string;
}

export interface HadithCollection {
  id: string; // bukhari | muslim | ...
  name: string;
  nameAr: string;
  author: string;
  description?: string;
  coverColor?: string;
  count?: number;
}

export interface Hadith {
  id: string;
  collectionId: string;
  chapter?: string;
  number: string;
  arabic: string;
  text: string;
  narrator?: string;
  grade?: "sahih" | "hasan" | "daif" | "mursal";
  book?: string;
}

export interface AzkarItem {
  id: string;
  folder: string; // folder key from azkarFolders
  title: string;
  titleAr?: string;
  arabic?: string;
  transliteration?: string;
  translation?: string;
  source?: string;
  count?: number;
  fadl?: string; // virtue / benefit
}

export interface Article {
  id: string;
  folder: string; // article folder key
  title: string;
  excerpt: string;
  body: string; // markdown-lite
  author?: string;
  authorId?: string;
  readingTime?: number; // minutes
  date?: string;
  tags?: string[];
}

export interface Biography {
  id: string;
  name: string;
  nameAr?: string;
  folder: string; // prophets | companions | tabiin | scholars | modern | authors
  birthYear?: string;
  deathYear?: string;
  birthPlace?: string;
  description?: string;
  fullBio?: string;
  coverColor?: string;
  coverEmoji?: string;
  relatedBooks?: string[];
  featured?: boolean;
  tags?: string[];
}

export interface Folder {
  id: string;
  key: string;
  label: string;
  labelAr?: string;
  description?: string;
  iconKey: string; // lucide icon name
  coverColor?: string;
  accentColor?: string;
  count?: number;
}

export interface LanguagePack {
  code: Lang;
  label: string;
  nativeLabel: string;
  flag: string;
  rtl?: boolean;
}

export interface AudioItem {
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

export interface Fawaid {
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

export interface HistoryItem {
  itemId: string;
  type: 'book' | 'audio' | 'bio';
  title: string;
  subtitle?: string;
  timestamp?: number;
}

export interface ReadingGoal {
  target: number;
  current: number;
  year: number;
}