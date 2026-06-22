import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Headphones, Users, Star, ArrowRight, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store';
import BookCard from '../components/BookCard';
import FawaidCard from '../components/FawaidCard';

export default function Home() {
  const { t } = useTranslation();
  const { books, audio, biographies, fawaid } = useAppStore();

  const featuredBooks = books.filter(b => b.featured).slice(0, 4);
  const newBooks = books.filter(b => b.isNew).slice(0, 4);
  const featuredFawaid = fawaid.filter(f => f.isFeatured).slice(0, 3);

  const stats = [
    { label: t('totalBooks'), value: books.length, icon: BookOpen, color: 'from-blue-600 to-blue-800', bg: 'bg-blue-950/50' },
    { label: t('totalAudio'), value: audio.length, icon: Headphones, color: 'from-purple-600 to-purple-800', bg: 'bg-purple-950/50' },
    { label: t('totalBiographies'), value: biographies.length, icon: Users, color: 'from-emerald-600 to-emerald-800', bg: 'bg-emerald-950/50' },
    { label: t('totalFawaid'), value: fawaid.length, icon: Star, color: 'from-amber-600 to-amber-800', bg: 'bg-amber-950/50' },
  ];

  return (
    <div className="px-4 lg:px-6 py-8 space-y-12 max-w-7xl mx-auto">
      {/* Hero */}
      <section>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800/50 p-8 lg:p-12">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            {/* Arabic text */}
            <p className="text-amber-500/70 text-sm font-medium mb-3 tracking-widest">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/40">
                <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
                  <rect x="4" y="4" width="10" height="28" rx="2" fill="rgba(255,255,255,0.9)"/>
                  <rect x="16" y="4" width="10" height="28" rx="2" fill="rgba(255,255,255,0.7)"/>
                  <rect x="28" y="6" width="4" height="24" rx="1" fill="rgba(255,255,255,0.5)"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Maktabah</h1>
                <p className="text-slate-400 text-sm mt-0.5">{t('appTagline')}</p>
              </div>
            </div>

            <p className="text-slate-300 text-base lg:text-lg max-w-2xl leading-relaxed mb-8">
              Профессиональная исламская цифровая библиотека — книги, биографии учёных, аудиолекции и фаваиды на русском, арабском и английском языках.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/books"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-amber-900/30"
              >
                <BookOpen size={16} />
                {t('books')}
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium rounded-xl text-sm transition-colors border border-slate-700/50"
              >
                {t('search')}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 border border-slate-800/50 flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-400 font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Books */}
      {featuredBooks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-400" />
                {t('featured')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('books')}</p>
            </div>
            <Link to="/books" className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
              {t('books')} <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* New Books */}
      {newBooks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white">{t('new')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('books')}</p>
            </div>
            <Link to="/books" className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
              {t('books')} <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {newBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Fawaid */}
      {featuredFawaid.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white">{t('fawaidTitle')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('fawaidDescription')}</p>
            </div>
            <Link to="/fawaid" className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
              {t('fawaid')} <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {featuredFawaid.map(f => (
              <FawaidCard key={f.id} item={f} />
            ))}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/audio', icon: Headphones, label: t('audio'), desc: `${audio.length} лекций`, color: 'from-purple-600/20 to-purple-800/10 border-purple-800/30' },
            { to: '/biographies', icon: Users, label: t('biographies'), desc: `${biographies.length} биографий`, color: 'from-emerald-600/20 to-emerald-800/10 border-emerald-800/30' },
            { to: '/fawaid', icon: Star, label: t('fawaid'), desc: `${fawaid.length} изречений`, color: 'from-amber-600/20 to-amber-800/10 border-amber-800/30' },
            { to: '/dashboard', icon: TrendingUp, label: t('dashboard'), desc: 'Статистика', color: 'from-blue-600/20 to-blue-800/10 border-blue-800/30' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className={`group bg-gradient-to-br ${color} border rounded-xl p-5 flex flex-col gap-3 hover:scale-[1.02] transition-all duration-200`}
            >
              <Icon size={22} className="text-slate-300 group-hover:text-white transition-colors" />
              <div>
                <div className="font-semibold text-slate-200 text-sm">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
