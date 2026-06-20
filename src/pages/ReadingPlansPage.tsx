import { BookOpen, Calendar, Flame, Trophy, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function ReadingPlansPage() {
  const { readingPlan, goals } = useStore();

  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + Math.min((g.current / g.target) * 100, 100), 0) / goals.length)
    : 0;

  const weeklyTotal = readingPlan.weeklyProgress.reduce((s, v) => s + v, 0);
  const weeklyTarget = readingPlan.dailyPages * 7;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2a4a] via-[#0a1e35] to-transparent p-6 border border-amber-500/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
          <h1 className="text-white font-bold text-2xl mb-2">Планы чтения</h1>
          <p className="text-slate-400 text-sm">{readingPlan.name}</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <Flame size={16} className="text-amber-400" />
              <span className="text-amber-400 font-bold">{readingPlan.currentStreak}</span>
              <span className="text-slate-500 text-xs">дней подряд</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-white font-bold">{completedGoals}</span>
              <span className="text-slate-500 text-xs">целей</span>
            </div>
          </div>
        </div>

        {/* Progress overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Прогресс', value: `${totalProgress}%`, icon: TrendingUp, color: 'text-violet-400' },
            { label: 'Прочитано', value: readingPlan.totalPagesRead, icon: BookOpen, color: 'text-emerald-400' },
            { label: 'Уроков', value: readingPlan.totalLessonsCompleted, icon: Calendar, color: 'text-blue-400' },
            { label: 'За неделю', value: `${weeklyTotal}/${weeklyTarget}`, icon: CheckCircle, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-4 rounded-2xl bg-[#0c2240]/80 border border-slate-700/40 text-center">
              <Icon size={20} className={`${color} mx-auto mb-2`} />
              <div className="text-white font-bold text-xl">{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Weekly chart */}
        <div className="p-4 rounded-2xl bg-[#0c2240]/60 border border-slate-700/30">
          <h3 className="text-white font-semibold text-sm mb-4">Недельный прогресс</h3>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day, i) => {
              const val = readingPlan.weeklyProgress[i];
              const pct = Math.min((val / readingPlan.dailyPages) * 100, 100);
              const isToday = i === new Date().getDay();
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-slate-500 text-[10px]">{val}с</span>
                  <div className="w-full bg-white/8 rounded-lg overflow-hidden flex-1 relative">
                    <div
                      className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all ${isToday ? 'bg-gradient-to-t from-amber-600 to-amber-400' : pct >= 100 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-white/20 to-white/10'}`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] ${isToday ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>{day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <span>Цель: {readingPlan.dailyPages} стр/день</span>
            <span className="text-emerald-400">{weeklyTotal} / {weeklyTarget} за неделю</span>
          </div>
        </div>

        {/* Plan details */}
        <div className="p-4 rounded-2xl bg-[#0c2240]/60 border border-slate-700/30">
          <h3 className="text-white font-semibold text-sm mb-4">Детали плана</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Название плана</span>
                <span className="text-white text-sm">{readingPlan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Цель</span>
                <span className="text-white text-sm">{readingPlan.goal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Дата начала</span>
                <span className="text-white text-sm">{readingPlan.startDate}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Страниц в день</span>
                <span className="text-amber-400 font-bold text-sm">{readingPlan.dailyPages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Уроков в неделю</span>
                <span className="text-amber-400 font-bold text-sm">{readingPlan.weeklyLessons}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Текущая серия</span>
                <span className="text-emerald-400 font-bold text-sm">{readingPlan.currentStreak} дней</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goals link */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">Управление целями</h3>
              <p className="text-slate-400 text-xs mt-1">Отслеживайте и обновляйте свои цели обучения</p>
            </div>
            <Link to="/goals" className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-semibold transition-all">
              <span>Цели</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
