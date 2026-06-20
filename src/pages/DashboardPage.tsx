import { BookOpen, Users, Headphones, Lightbulb, TrendingUp, Flame, Trophy, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function DashboardPage() {
  const { books, biographies, audioLessons, fawaid, goals, readingPlan, favorites, history } = useStore();

  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + Math.min((g.current / g.target) * 100, 100), 0) / goals.length)
    : 0;

  const totalDownloads = books.reduce((sum, b) => sum + (b.downloads || 0), 0);

  const recentHistory = history.slice(0, 5);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Hero stats */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2a4a] via-[#0a1e35] to-transparent p-6 border border-amber-500/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
          <div className="relative flex items-center gap-5">
            <div className="w-20 h-20 rounded-full border-4 border-amber-500/30 flex items-center justify-center">
              <span className="text-amber-300 font-bold text-lg">{overallProgress}%</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Панель управления</h2>
              <p className="text-slate-400 text-sm mt-0.5">Общий прогресс обучения</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  <span className="text-amber-400 font-bold">{readingPlan.currentStreak}</span>
                  <span className="text-slate-500 text-xs">дней подряд</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className="text-yellow-400" />
                  <span className="text-white font-bold">{completedGoals}</span>
                  <span className="text-slate-500 text-xs">целей выполнено</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Книги', labelAr: 'الكتب', value: books.length, icon: BookOpen, color: 'text-violet-400', path: '/books' },
            { label: 'Учёные', labelAr: 'العلماء', value: biographies.length, icon: Users, color: 'text-emerald-400', path: '/biographies' },
            { label: 'Уроки', labelAr: 'الدروس', value: audioLessons.length, icon: Headphones, color: 'text-blue-400', path: '/audio' },
            { label: 'Фавайды', labelAr: 'الفوائد', value: fawaid.length, icon: Lightbulb, color: 'text-amber-400', path: '/fawaid' },
          ].map(({ label, labelAr, value, icon: Icon, color, path }) => (
            <Link
              key={label}
              to={path}
              className="p-4 rounded-2xl bg-[#0c2240]/80 border border-slate-700/40 hover:border-amber-500/40 transition-all hover:-translate-y-0.5"
            >
              <Icon size={20} className={`${color} mb-2`} />
              <div className="text-white font-bold text-2xl">{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
              <div className="text-slate-600 text-[9px] mt-0.5" dir="rtl">{labelAr}</div>
            </Link>
          ))}
        </div>

        {/* Extended stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Избранное', value: favorites.length, icon: '❤️' },
            { label: 'Страниц прочитано', value: readingPlan.totalPagesRead, icon: '📄' },
            { label: 'Загрузок', value: `${(totalDownloads / 1000).toFixed(0)}k`, icon: '⬇️' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="p-3 rounded-2xl bg-[#0c2240]/60 border border-slate-700/30 text-center">
              <div className="text-lg mb-1">{icon}</div>
              <div className="text-white font-bold text-sm">{value}</div>
              <div className="text-slate-500 text-[10px]">{label}</div>
            </div>
          ))}
        </div>

        {/* Goals progress */}
        <div className="p-4 rounded-2xl bg-[#0c2240]/60 border border-slate-700/30">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-violet-400" /> Прогресс целей
          </h3>
          <div className="space-y-3">
            {goals.slice(0, 4).map((goal) => {
              const pct = Math.round((goal.current / goal.target) * 100);
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{goal.title}</span>
                    <span className="text-slate-300">{goal.current} / {goal.target}</span>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/goals" className="mt-4 flex items-center gap-1 text-amber-400 text-xs hover:text-amber-300 transition-colors">
            <span>Все цели</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Weekly reading */}
        <div className="p-4 rounded-2xl bg-[#0c2240]/60 border border-slate-700/30">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" /> Чтение по дням
          </h3>
          <div className="flex items-end gap-2" style={{ height: 80 }}>
            {readingPlan.weeklyProgress.map((val, i) => {
              const pct = Math.min((val / readingPlan.dailyPages) * 100, 100);
              const isToday = i === new Date().getDay();
              const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex-1 w-full bg-white/8 rounded-lg overflow-hidden relative">
                    <div
                      className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all ${isToday ? 'bg-gradient-to-t from-amber-600 to-amber-400' : pct >= 100 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-white/25 to-white/10'}`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[9px] ${isToday ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                    {days[i]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
            <span>Цель: {readingPlan.dailyPages} стр/день</span>
            <span className="text-emerald-400">
              {readingPlan.weeklyProgress.reduce((s, v) => s + v, 0)} за неделю
            </span>
          </div>
        </div>

        {/* Recent activity */}
        {recentHistory.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#0c2240]/60 border border-slate-700/30">
            <h3 className="text-white font-semibold text-sm mb-3">Недавняя активность</h3>
            <div className="space-y-3">
              {recentHistory.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-base flex-shrink-0">
                    {item.type === 'book' ? '📖' : item.type === 'audio' ? '🎧' : item.type === 'bio' ? '👤' : '💡'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-sm truncate">{item.title}</p>
                    <p className="text-slate-600 text-[10px] mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
