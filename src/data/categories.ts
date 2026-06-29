import { Category } from '../store/useStore';

export const categoriesData: Category[] = [
  { id: 'aqeedah', name: 'Акыда', nameAr: 'العقيدة', icon: '', color: '#1a3a2a', description: 'Раздел акыды', count: 0, type: 'books' },
  { id: 'tawhid', name: 'Таухид', nameAr: 'التوحيد', icon: '', color: '#0f3d2e', description: 'Раздел таухида', count: 0, type: 'books' },
  { id: 'manhaj', name: 'Манхадж', nameAr: 'المنهج', icon: '', color: '#123f2b', description: 'Раздел манхаджа', count: 0, type: 'books' },
  { id: 'hadith', name: 'Хадисы', nameAr: 'الحديث', icon: '', color: '#2a3a1a', description: 'Раздел хадисов', count: 0, type: 'books' },
  { id: 'seerah', name: 'Сира', nameAr: 'السيرة', icon: '', color: '#1a3a3a', description: 'Сира', count: 0, type: 'books' },
  { id: 'arabic', name: 'Арабский язык', nameAr: 'اللغة العربية', icon: '', color: '#1a2a3a', description: 'Арабский язык', count: 0, type: 'books' },
  { id: 'dawah', name: 'Даава', nameAr: 'الدعوة', icon: '', color: '#3a2a1a', description: 'Призыв', count: 0, type: 'books' },
  { id: 'history', name: 'История', nameAr: 'التاريخ', icon: '', color: '#2a1a3a', description: 'История', count: 0, type: 'books' },
  { id: 'tarbiyah', name: 'Воспитание', nameAr: 'التربية', icon: '', color: '#3a1a1a', description: 'Воспитание', count: 0, type: 'books' },
  { id: 'dua', name: 'Дуа', nameAr: 'الدعاء', icon: '', color: '#1a3a2a', description: 'Дуа', count: 0, type: 'books' },
  { id: 'azkar', name: 'Азкары', nameAr: 'الأذكار', icon: '', color: '#0f3d2e', description: 'Азкары', count: 0, type: 'books' },
  { id: 'other', name: 'Другие разделы', nameAr: 'أقسام أخرى', icon: '', color: '#112a1a', description: 'Прочие материалы', count: 0, type: 'books' },
];

export const fallbackCategories = categoriesData;
