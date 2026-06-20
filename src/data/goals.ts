export interface Goal {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  type: 'books' | 'pages' | 'lessons' | 'fawaid';
  target: number;
  current: number;
  deadline: string;
  startDate: string;
  color: string;
  icon: string;
  isCompleted: boolean;
  history: { date: string; value: number }[];
}

export interface ReadingPlan {
  id: string;
  name: string;
  dailyPages: number;
  weeklyLessons: number;
  currentStreak: number;
  longestStreak: number;
  totalPagesRead: number;
  totalLessonsCompleted: number;
  startDate: string;
  goal: string;
  weeklyProgress: number[];
  completionPercent: number;
}

export const goalsData: Goal[] = [
  {
    id: 'g1',
    title: 'Прочитать 12 книг в этом году',
    titleAr: 'قراءة ١٢ كتابًا هذا العام',
    description: 'По одной книге в месяц',
    type: 'books',
    target: 12,
    current: 7,
    deadline: '2026-12-31',
    startDate: '2026-01-01',
    color: 'from-violet-500 to-purple-600',
    icon: '📚',
    isCompleted: false,
    history: [
      { date: '2026-01', value: 1 },
      { date: '2026-02', value: 2 },
      { date: '2026-03', value: 3 },
      { date: '2026-04', value: 4 },
      { date: '2026-05', value: 5 },
      { date: '2026-06', value: 7 },
    ],
  },
  {
    id: 'g2',
    title: 'Прочитать 500 страниц',
    titleAr: 'إتمام ٥٠٠ صفحة',
    description: '500 страниц исламских книг',
    type: 'pages',
    target: 500,
    current: 342,
    deadline: '2026-09-30',
    startDate: '2026-01-01',
    color: 'from-blue-500 to-cyan-600',
    icon: '📄',
    isCompleted: false,
    history: [
      { date: '2026-01', value: 45 },
      { date: '2026-02', value: 90 },
      { date: '2026-03', value: 150 },
      { date: '2026-04', value: 210 },
      { date: '2026-05', value: 270 },
      { date: '2026-06', value: 342 },
    ],
  },
  {
    id: 'g3',
    title: 'Прослушать 50 уроков',
    titleAr: 'الاستماع إلى ٥٠ درسًا',
    description: '50 аудиоуроков от учёных',
    type: 'lessons',
    target: 50,
    current: 50,
    deadline: '2026-06-30',
    startDate: '2026-01-01',
    color: 'from-emerald-500 to-teal-600',
    icon: '🎧',
    isCompleted: true,
    history: [
      { date: '2026-01', value: 8 },
      { date: '2026-02', value: 18 },
      { date: '2026-03', value: 28 },
      { date: '2026-04', value: 38 },
      { date: '2026-05', value: 46 },
      { date: '2026-06', value: 50 },
    ],
  },
  {
    id: 'g4',
    title: 'Собрать 100 фавайдов',
    titleAr: 'جمع ١٠٠ فائدة',
    description: '100 полезных извлечений',
    type: 'fawaid',
    target: 100,
    current: 38,
    deadline: '2026-12-31',
    startDate: '2026-01-01',
    color: 'from-amber-500 to-orange-600',
    icon: '💡',
    isCompleted: false,
    history: [
      { date: '2026-01', value: 5 },
      { date: '2026-02', value: 12 },
      { date: '2026-03', value: 18 },
      { date: '2026-04', value: 25 },
      { date: '2026-05', value: 31 },
      { date: '2026-06', value: 38 },
    ],
  },
];

export const readingPlanData: ReadingPlan = {
  id: 'rp1',
  name: 'Путь Саляф — Годовой план',
  dailyPages: 10,
  weeklyLessons: 3,
  currentStreak: 12,
  longestStreak: 21,
  totalPagesRead: 342,
  totalLessonsCompleted: 50,
  startDate: '2026-01-01',
  goal: 'Освоить основы исламских знаний к концу года',
  weeklyProgress: [7, 10, 6, 10, 9, 10, 8],
  completionPercent: 68,
};
