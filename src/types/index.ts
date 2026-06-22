export interface Book {
  id: string;
  title: string;
  titleAr?: string;
  author: string;
  authorId?: string;
  category: string;
  language: string;
  pages: number;
  size?: string;
  description: string;
  coverColor: string;
  coverEmoji: string;
  coverImage?: string;
  tags: string[];
  fileUrl?: string;
  downloadUrl?: string;
  year?: string;
  featured?: boolean;
  isNew?: boolean;
}

export interface AudioItem {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  category: string;
  description: string;
  duration: string;
  fileUrl?: string;
  downloadUrl?: string;
  tags: string[];
  coverColor: string;
  coverEmoji: string;
  series?: string;
  episode?: number;
  isNew?: boolean;
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
  coverColor: string;
  coverEmoji: string;
  featured?: boolean;
}

export interface Fawaid {
  id: string;
  text: string;
  textAr?: string;
  author: string;
  authorId?: string;
  category: string;
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
  nameEn?: string;
  emoji?: string;
  color?: string;
  count?: number;
}

export interface HistoryItem {
  id: string;
  type: 'book' | 'audio' | 'biography' | 'fawaid';
  itemId: string;
  title: string;
  timestamp: number;
}

export interface ReadingGoal {
  target: number;
  current: number;
  year: number;
}
