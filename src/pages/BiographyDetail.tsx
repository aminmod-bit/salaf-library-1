import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, MapPin, Calendar, BookOpen } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';

const typeLabels: Record<string, string> = {
  prophet: 'Пророки',
  companion: 'Сподвижники',
  tabiin: 'Табиины',
  scholar: 'Учёные',
  modern: 'Современные',
};

export default function BiographyDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { biographies, books, toggleFavorite, isFavorite } = useAppStore();

  const bio = biographies.find(b => b.id === id);

  if (!bio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4 text-slate-400">
        <p>Биография не найдена</p>
        <Link to="/biographies" className="text-amber-400 hover:text-amber-300 text-sm">← {t('biographies')}</Link>
      </div>
    );
  }

  const favorite = isFavorite(bio.id);
  const relBooks = books.filter(b => bio.relatedBooks?.includes(b.id));

  return (
    <div className="px-4 lg:px-6 py-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        {t('back')}
      </button>

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800/50 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-lg"
            style={{ backgroundColor: bio.coverColor }}
          >
            {bio.coverEmoji}
          </div>
          <div className="flex-1 min-w-0">
            {bio.nameAr && (
              <p className="text-amber-400/70 text-lg mb-1 text-right font-medium" dir="rtl">{bio.nameAr}</p>
            )}
            <h1 className="text-xl font-bold text-white leading-tight">{bio.name}</h1>
            <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50">
              {typeLabels[bio.type] || bio.type}
            </span>
          </div>
          <button
            onClick={() => toggleFavorite(bio.id)}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-xl transition-colors border',
              favorite
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700/50 hover:text-red-400'
            )}
          >
            <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-slate-800/50">
          {bio.birthYear && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar size={14} className="text-slate-500" />
              <span>{bio.birthYear}{bio.deathYear ? ` — ${bio.deathYear}` : ''}</span>
            </div>
          )}
          {bio.birthPlace && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MapPin size={14} className="text-slate-500" />
              <span>{bio.birthPlace}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-slate-900 border border-slate-800/50 rounded-xl p-5 mb-4">
        <h2 className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">Описание</h2>
        <p className="text-slate-300 text-sm leading-relaxed">{bio.description}</p>
      </div>

      {/* Full bio */}
      {bio.fullBio && (
        <div className="bg-slate-900 border border-slate-800/50 rounded-xl p-5 mb-4">
          <h2 className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">{t('fullBio')}</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{bio.fullBio}</p>
        </div>
      )}

      {/* Tags */}
      {bio.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {bio.tags.map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg border border-slate-700/50">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related books */}
      {relBooks.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <BookOpen size={15} className="text-amber-400" />
            {t('relatedBooks')}
          </h2>
          <div className="space-y-2">
            {relBooks.map(book => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800/50 rounded-xl hover:border-amber-500/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: book.coverColor }}>
                  {book.coverEmoji}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{book.title}</p>
                  <p className="text-xs text-slate-500 truncate">{book.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
