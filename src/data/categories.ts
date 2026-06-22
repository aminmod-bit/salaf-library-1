import { Category } from '../store/useStore';

export const categoriesData: Category[] = [
  { id: 'cat001', name: 'Акыда', nameAr: 'العقيدة', icon: '🎯', color: '#1a3a2a', description: 'Исламское вероубеждение и основы веры', count: 245, type: 'books' },
  { id: 'cat002', name: 'Хадисы', nameAr: 'الحديث', icon: '📿', color: '#2a1a3a', description: 'Изречения и действия пророка ﷺ', count: 312, type: 'books' },
  { id: 'cat003', name: 'Тафсир', nameAr: 'التفسير', icon: '🌙', color: '#3a2a1a', description: 'Толкование Корана', count: 186, type: 'books' },
  { id: 'cat004', name: 'Фикх', nameAr: 'الفقه', icon: '⚖️', color: '#1a2a3a', description: 'Исламское право', count: 428, type: 'books' },
  { id: 'cat005', name: 'Сира', nameAr: 'السيرة', icon: '🌟', color: '#1a3a3a', description: 'Биография пророка ﷺ', count: 134, type: 'books' },
  { id: 'cat006', name: 'Зухд', nameAr: 'الزهد', icon: '💫', color: '#2a3a2a', description: 'Духовность и аскетизм', count: 167, type: 'books' },
  { id: 'cat007', name: 'История', nameAr: 'التاريخ', icon: '🏛️', color: '#3a1a2a', description: 'Исламская история', count: 213, type: 'books' },
  { id: 'cat008', name: 'Арабский язык', nameAr: 'اللغة العربية', icon: '🔤', color: '#1a1a3a', description: 'Грамматика и язык Корана', count: 156, type: 'books' },
  { id: 'cat009', name: 'Даава', nameAr: 'الدعوة', icon: '📢', color: '#3a3a1a', description: 'Исламский призыв', count: 98, type: 'books' },
  { id: 'cat010', name: 'Воспитание', nameAr: 'التربية', icon: '👨‍👩‍👧', color: '#2a1a2a', description: 'Воспитание детей и семья', count: 142, type: 'books' },
  { id: 'cat011', name: 'Этика', nameAr: 'الأخلاق', icon: '⭐', color: '#1a2a2a', description: 'Нравственность и характер', count: 189, type: 'books' },
  { id: 'cat012', name: 'Коран', nameAr: 'القرآن', icon: '📖', color: '#3a1a1a', description: 'Науки о Коране', count: 201, type: 'books' },
];

export const fallbackCategories = categoriesData;
