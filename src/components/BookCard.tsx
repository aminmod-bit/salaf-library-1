import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, BookOpen } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  compact?: boolean;
}

export default function BookCard({ book, compact = false }: BookCardProps) {
  const { t } = useTranslation();
  const { toggleFavorite, isFavorite } = useAppStore();
  const favorite = isFavorite(book.id);

  return (
    <Link
      to={`/books/${book.id}`}
      className="group relative bg-slate-900 border border-slate-800/50 rounded-xl overflow-hidden hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-900/10 transition-all duration-200 flex flex-col"
    >
      {/* Cover */}
      <div
        className="relative flex items-center justify-center h-40 flex-shrink-0"
        style={{ backgroundColor: book.coverColor }}
      >
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl select-none opacity-80 group-hover:scale-110 transition-transform duration-300">
            {book.coverEmoji}
          </span>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {book.isNew && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-500 text-white rounded-md">
              {t('new')}
            </span>
          )}
          {book.featured && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-500 text-slate-900 rounded-md">
              ★
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          className={cn(
            'absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150',
            favorite
              ? 'bg-red-500/20 text-red-400'
              : 'bg-black/30 text-white/50 opacity-0 group-hover:opacity-100'
          )}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(book.id);
          }}
        >
          <Heart size={13} fill={favorite ? 'currentColor' : 'none'} />
        </button>

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-3.5 flex-1 flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-amber-100 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-slate-400 truncate">{book.author}</p>

        {!compact && (
          <div className="flex items-center gap-2 mt-auto pt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <BookOpen size={11} />
              {book.pages} {t('pages')}
            </span>
            <span className="ml-auto">{book.category}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
