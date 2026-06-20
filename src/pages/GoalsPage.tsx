import { useState } from 'react';
import { Target, Flame, BookOpen, FileText, Headphones, Lightbulb, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function GoalsPage() {
  const { goals, readingPlan } = useStore();
  const [activeTab, setActiveTab] = useState<'goals' | 'plan' | 'stats'>('goals');

  const completedGoals = goals.filter((g) => g.isCompleted);
  const activeGoals = goals.filter((g) => !g.isCompleted);
  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + Math.min((g.current / g.target) * 100, 100), 0) / goals.length)
    : 0;

  const goalTypeIcons: Record<string, typeof BookOpen> = {
    books: BookOpen,
    pages: FileText,
    lessons: Headphones,
    fawaid: Lightbulb,
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Overview banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2a4a] via-[#0a1e35] to-transparent p-6 border border-amber-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full border-4 border-amber-500/30 flex items-center justify-center">
              <span className="text-amber-300 font-bold text-lg">{overallProgress}%</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Общий прогресс</h2>
              <p className="text-slate-400 text-sm mt-0.5">{completedGoals.length} из {goals.length} целей выполнено</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  <span className="text-white font-semibold">{readingPlan.currentStreak}</span>
                  <span className="text-slate-500 text-xs">дней подряд</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className="text-yellow-400" />
                  <span className="text-white font-semibold">{readingPlan.longestStreak}</span>
                  <span className="text-slate-500 text-xs">рекорд</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['goals', 'plan', 'stats'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-[#0c2240]/60 text-slate-500 hover:bg-[#0c2240]/80 border border-slate-700/30'
              }`}
            >
              {tab === 'goals' ? 'Цели' : tab === 'plan' ? 'План' : 'Статистика'}
            </button>
          ))}
        </div>

        {/* GOALS TAB */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            {/* Active Goals */}
            <div>
              <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Активные цели</h3>
              <div className="space-y-3">
                {activeGoals.map((goal) => {
                  const Icon = goalTypeIcons[goal.type] ?? Target;
                  const pct = Math.round((goal.current / goal.target) * 100);
                  const daysLeft = Math.ceil(
                    (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div key={goal.id} className="p-4 rounded-2xl bg-[#0c2240]/60 border border-slate-700/30 hover:border-amber-500/30 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full border-2 border-amber-500/30 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{pct}%</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-white font-medium text-sm">{goal.title}</h4>
                            <span className="text-lg flex-shrink-0">{goal.icon}</span>
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5">{goal.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                              <Icon size={10} />
                              <span>{goal.current} / {goal.target}</span>
                            </div>
                            {daysLeft > 0 && (
                              <div className="flex items-center gap-1 text-slate-600 text-xs">
                                <Calendar size={10} />
                                <span>{daysLeft}д осталось</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div>
                <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Выполнено 🏆</h3>
                <div className="space-y-2">
                  {completedGoals.map((goal) => {
                    const Icon = goalTypeIcons[goal.type] ?? Target;
                    return (
                      <div key={goal.id} className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                        <span className="text-xl">{goal.icon}</span>
                        <div className="flex-1">
                          <p className="text-white/80 text-sm font-medium">{goal.title}</p>
                          <div className="flex items-center gap-1 text-emerald-400 text-xs mt-0.5">
                            <Icon size={10} />
                            <span>{goal.target} / {goal.target}</span>
                          </div>
                        </div>
                        <Trophy size={16} className="text-yellow-400" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* READING PLAN TAB */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0c2240]/60 border border-slate-700/30">
              <h3 className="text-white font-semibold text-sm mb-3">{readingPlan.name}</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">{readingPlan.goal}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Страниц в день', value: readingPlan.dailyPages, unit: 'стр', color: 'text-violet-400' },
                  { label: 'Уроков в неделю', value: readingPlan.weeklyLessons, unit: 'уроков', color: 'text-emerald-400' },
                  { label: 'Прочитано', value: readingPlan.totalPagesRead, unit: 'всего', color: 'text-blue-400' },
                  { label: 'Уроков', value: readingPlan.totalLessonsCompleted, unit: 'всего', color: 'text-amber-400' },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} className="p-3 rounded-xl bg-[#07182e]/50 text-center">
                    <div className={`${color} font-bold text-xl`}>{value}</div>
                    <div className="text-slate-600 text-[10px]">{unit}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-600/10 to-orange-600/5 border border-amber-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Flame size={24} className="text-amber-400" />
                <div>
                  <h3 className="text-white font-bold text-2xl">{readingPlan.currentStreak} дней</h3>
                  <p className="text-slate-400 text-xs">Текущая серия</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-slate-500 text-xs">Рекорд: </span>
                  <span className="text-amber-400 font-semibold">{readingPlan.longestStreak} дней</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Начало: </span>
                  <span className="text-slate-300 text-xs">{readingPlan.startDate}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c2240]/60 border border-slate-700/30">
              <h3 className="text-white font-medium text-sm mb-3">Эта неделя</h3>
              <div className="flex items-end gap-2">
                {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day, i) => {
                  const val = readingPlan.weeklyProgress[i];
                  const pct = Math.min((val / readingPlan.dailyPages) * 100, 100);
                  const isToday = i === new Date().getDay();
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-slate-500 text-[9px]">{val}с</span>
                      <div className="w-full bg-white/8 rounded-lg overflow-hidden" style={{ height: 60 }}>
                        <div
                          className={`w-full rounded-lg transition-all ${isToday ? 'bg-gradient-to-t from-amber-600 to-amber-400' : pct >= 100 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-white/20 to-white/10'}`}
                          style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                        />
                      </div>
                      <span className={`text-[9px] ${isToday ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>{day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                <span>Цель: {readingPlan.dailyPages} стр/день</span>
                <span className="text-amber-400">
                  {readingPlan.weeklyProgress.reduce((s, v) => s + v, 0)}/{readingPlan.dailyPages * 7} за неделю
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0c2240]/60 border border-slate-700/30">
              <h3 className="text-white font-medium text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-violet-400" /> Статистика
              </h3>
              <div className="space-y-4">
                {goals.map((goal) => {
                  const pct = Math.round((goal.current / goal.target) * 100);
                  const Icon = goalTypeIcons[goal.type] ?? Target;
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon size={12} className="text-slate-500" />
                          <span className="text-slate-400 text-xs">{goal.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-xs font-medium">{goal.current}</span>
                          <span className="text-slate-600 text-xs">/ {goal.target}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
