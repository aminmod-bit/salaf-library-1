import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Download, BookOpen, Tag, Globe, Calendar } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { books, toggleFavorite, isFavorite, addToHistory } = useAppStore();

  const book = books.find(b => b.id === id);

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4 text-slate-400">
        <p>Книга не найдена</p>
        <Link to="/books" className="text-amber-400 hover:text-amber-300 text-sm">← {t('books')}</Link>
      </div>
    );
  }

  const favorite = isFavorite(book.id);

  const handleView = () => {
    addToHistory({
      id: Date.now().toString(),
      type: 'book',
      itemId: book.id,
      title: book.title,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="px-4 lg:px-6 py-8 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        {t('back')}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cover */}
        <div className="md:col-span-1">
          <div
            className="relative rounded-xl overflow-hidden flex items-center justify-center h-64 md:h-80 shadow-2xl"
            style={{ backgroundColor: book.coverColor }}
          >
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span className="text-8xl select-none">{book.coverEmoji}</span>
            )}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-4">
            {book.fileUrl && (
              <a
                href={book.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleView}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl text-sm transition-colors"
              >
                <BookOpen size={16} />
                {t('read')}
              </a>
            )}
            {book.downloadUrl && (
              <a
                href={book.downloadUrl}
                download
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium rounded-xl text-sm transition-colors border border-slate-700/50"
              >
                <Download size={16} />
                {t('download')}
              </a>
            )}
            <button
              onClick={() => toggleFavorite(book.id)}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors border',
                favorite
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700/50 hover:bg-slate-700'
              )}
            >
              <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
              {favorite ? t('removeFromFavorites') : t('addToFavorites')}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            {book.titleAr && (
              <p className="text-amber-400/70 text-right text-lg mb-2 font-medium" dir="rtl">{book.titleAr}</p>
            )}
            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">{book.title}</h1>
            <p className="text-slate-400 mt-1">{book.author}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {book.isNew && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">{t('new')}</span>
            )}
            {book.featured && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">{t('featured')}</span>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen, label: t('pages'), value: `${book.pages} стр.` },
              { icon: Globe, label: t('language'), value: book.language },
              { icon: Tag, label: t('category'), value: book.category },
              ...(book.year ? [{ icon: Calendar, label: t('year'), value: book.year }] : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-slate-900 border border-slate-800/50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Icon size={12} />
                  {label}
                </div>
                <p className="text-slate-200 text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="bg-slate-900 border border-slate-800/50 rounded-xl p-4">
            <h3 className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">{t('description')}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{book.description}</p>
          </div>

          {/* Tags */}
          {book.tags.length > 0 && (
            <div>
              <h3 className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">{t('tags')}</h3>
              <div className="flex flex-wrap gap-2">
                {book.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg border border-slate-700/50">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
