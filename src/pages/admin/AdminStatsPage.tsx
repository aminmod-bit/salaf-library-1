import { BarChart3, BookOpen, Users, Headphones, Sparkles, Grid3X3, Download, Eye } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function AdminStatsPage() {
  const { books, biographies, audioLessons, fawaid, categories } = useStore();

  const totalDownloads = books.reduce((sum, b) => sum + (b.downloads || 0), 0);
  const totalViews = books.reduce((sum, b) => sum + (b.views || 0), 0);
  const totalSize = books.reduce((acc, b) => {
    const num = parseFloat(b.size || '0');
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const stats = [
    { label: 'Книги', value: books.length, icon: BookOpen, color: '#d4af37' },
    { label: 'Биографии', value: biographies.length, icon: Users, color: '#22c55e' },
    { label: 'Аудио', value: audioLessons.length, icon: Headphones, color: '#60a5fa' },
    { label: 'Фаваиды', value: fawaid.length, icon: Sparkles, color: '#a78bfa' },
    { label: 'Категории', value: categories.length, icon: Grid3X3, color: '#fb923c' },
    { label: 'Объём (MB)', value: totalSize.toFixed(1), icon: Download, color: '#f472b6' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-white font-bold text-xl flex items-center gap-2">
        <BarChart3 size={20} className="text-amber-400" />
        Статистика библиотеки
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-2xl bg-[#0c2240]/80 border border-slate-700/40 text-center">
            <Icon size={24} className="mx-auto mb-3" style={{ color }} />
            <div className="text-white font-bold text-2xl">{value}</div>
            <div className="text-slate-500 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-[#0c2240]/80 border border-slate-700/40">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <Eye size={16} className="text-emerald-400" /> Активность
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#07182e]/50 text-center">
            <div className="text-emerald-400 font-bold text-xl">{(totalViews / 1000).toFixed(1)}k</div>
            <div className="text-slate-600 text-xs mt-1">Просмотров</div>
          </div>
          <div className="p-4 rounded-xl bg-[#07182e]/50 text-center">
            <div className="text-amber-400 font-bold text-xl">{(totalDownloads / 1000).toFixed(1)}k</div>
            <div className="text-slate-600 text-xs mt-1">Загрузок</div>
          </div>
        </div>
      </div>
    </div>
  );
}
