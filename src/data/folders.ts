import type { Folder, Lang } from "@/types";

/* ===================== Books folders ===================== */
export const BOOK_FOLDERS: Folder[] = [
  { id: "b-aqeedah",  key: "aqeedah",   label: "Акыда",       labelAr: "العقيدة",      iconKey: "Shield",      coverColor: "#0f3d2e", accentColor: "#c9a44a", description: "Вероучение и основы убеждений" },
  { id: "b-tawhid",   key: "tawhid",    label: "Таухид",      labelAr: "التوحيد",      iconKey: "Sun",         coverColor: "#0e3a3d", accentColor: "#d8b966", description: "Единобожие — основа ислама" },
  { id: "b-manhaj",   key: "manhaj",    label: "Манхадж",     labelAr: "المنهج",       iconKey: "Compass",     coverColor: "#2a3d1a", accentColor: "#c9a44a", description: "Методология Салифов" },
  { id: "b-tafsir",   key: "tafsir",    label: "Тафсир",      labelAr: "التفسير",      iconKey: "BookOpen",    coverColor: "#3a2a14", accentColor: "#d8b966", description: "Толкование Корана" },
  { id: "b-hadith",   key: "hadith",    label: "Хадисы",      labelAr: "الحديث",       iconKey: "Quote",       coverColor: "#1f2a3a", accentColor: "#c9a44a", description: "Сунна Пророка ﷺ" },
  { id: "b-seerah",   key: "seerah",    label: "Сира",        labelAr: "السيرة",       iconKey: "Sparkles",    coverColor: "#3a1a2a", accentColor: "#d8b966", description: "Жизнеописание Пророка ﷺ" },
  { id: "b-fiqh",     key: "fiqh",      label: "Фикх",        labelAr: "الفقه",        iconKey: "Scale",       coverColor: "#1a3a2a", accentColor: "#c9a44a", description: "Исламское право" },
  { id: "b-arabic",   key: "arabic",    label: "Арабский",    labelAr: "العربية",      iconKey: "Languages",   coverColor: "#1a2a3a", accentColor: "#d8b966", description: "Изучение арабского языка" },
  { id: "b-dawah",    key: "dawah",     label: "Даава",       labelAr: "الدعوة",       iconKey: "Megaphone",   coverColor: "#2a1a3a", accentColor: "#c9a44a", description: "Призыв к Исламу" },
  { id: "b-history",  key: "history",   label: "История",     labelAr: "التاريخ",      iconKey: "Scroll",      coverColor: "#2a2a1a", accentColor: "#d8b966", description: "История Ислама" },
  { id: "b-biography",key: "biography", label: "Биографии",   labelAr: "التراجم",      iconKey: "User",        coverColor: "#3a1a1a", accentColor: "#c9a44a", description: "Биографии учёных и сподвижников" },
  { id: "b-children", key: "children",  label: "Детям",       labelAr: "الأطفال",      iconKey: "Smile",       coverColor: "#1a3a3a", accentColor: "#d8b966", description: "Книги для детей" },
  { id: "b-azkar",    key: "azkar",     label: "Азкары",      labelAr: "الأذكار",      iconKey: "Moon",        coverColor: "#0a2a3a", accentColor: "#c9a44a", description: "Поминания Аллаха" },
  { id: "b-dua",      key: "dua",       label: "Дуа",         labelAr: "الدعاء",       iconKey: "HandHeart",   coverColor: "#2a3a2a", accentColor: "#c9a44a", description: "Мольбы к Аллаху" },
  { id: "b-other",    key: "other",     label: "Другое",      labelAr: "أخرى",         iconKey: "Library",     coverColor: "#2a2a2a", accentColor: "#d8b966", description: "Прочие материалы" },
];

/* ===================== Azkar folders ===================== */
export const AZKAR_FOLDERS: Folder[] = [
  { id: "a-all",     key: "all",        label: "Все азкары",         labelAr: "كل الأذكار",      iconKey: "List",        coverColor: "#0f3d2e" },
  { id: "a-fav",     key: "favorites",  label: "Избранные",          labelAr: "المفضلة",         iconKey: "Star",        coverColor: "#3a2a14" },
  { id: "a-morning", key: "morning",    label: "Утренние",           labelAr: "الصباح",          iconKey: "Sunrise",     coverColor: "#3a2a14" },
  { id: "a-evening", key: "evening",    label: "Вечерние",           labelAr: "المساء",          iconKey: "Sunset",      coverColor: "#1f2a3a" },
  { id: "a-sleep",   key: "sleep",      label: "Перед сном",         labelAr: "النوم",           iconKey: "Moon",        coverColor: "#0a2a3a" },
  { id: "a-prayer",  key: "after_prayer", label: "После намаза",     labelAr: "بعد الصلاة",      iconKey: "Sparkles",    coverColor: "#1a3a2a" },
  { id: "a-food1",   key: "before_food",label: "Перед едой",         labelAr: "قبل الطعام",      iconKey: "Utensils",    coverColor: "#2a3a1a" },
  { id: "a-food2",   key: "after_food", label: "После еды",          labelAr: "بعد الطعام",      iconKey: "UtensilsCrossed", coverColor: "#2a3a1a" },
  { id: "a-home1",   key: "leave_home", label: "Выход из дома",      labelAr: "الخروج من البيت", iconKey: "DoorOpen",    coverColor: "#2a2a1a" },
  { id: "a-home2",   key: "enter_home", label: "Вход в дом",         labelAr: "دخول البيت",      iconKey: "DoorClosed",  coverColor: "#2a2a1a" },
  { id: "a-mosque1", key: "enter_mosque",label: "Вход в мечеть",     labelAr: "دخول المسجد",     iconKey: "Building",    coverColor: "#1a2a3a" },
  { id: "a-mosque2", key: "leave_mosque",label: "Выход из мечети",   labelAr: "الخروج من المسجد",iconKey: "Building2",   coverColor: "#1a2a3a" },
  { id: "a-istikhara",key:"istikhara",  label: "Истихара",           labelAr: "الاستخارة",       iconKey: "Stars",       coverColor: "#3a1a2a" },
  { id: "a-travel",  key: "travel",     label: "Путешествие",        labelAr: "السفر",           iconKey: "Plane",       coverColor: "#0a2a3a" },
  { id: "a-sick",    key: "sick",       label: "Болезнь",            labelAr: "المرض",           iconKey: "HeartPulse",  coverColor: "#3a1a1a" },
  { id: "a-rain",    key: "rain",       label: "Дождь",              labelAr: "المطر",           iconKey: "CloudRain",   coverColor: "#1a2a3a" },
  { id: "a-misc",    key: "misc",       label: "Разные",             labelAr: "متفرقة",          iconKey: "Library",     coverColor: "#2a2a2a" },
];

/* ===================== Hadith collections ===================== */
export const HADITH_COLLECTIONS = [
  { id: "bukhari",        name: "Сахих аль-Бухари",     nameAr: "صحيح البخاري",   author: "Имам аль-Бухари",     coverColor: "#0f3d2e", count: 7563 },
  { id: "muslim",         name: "Сахих Муслим",         nameAr: "صحيح مسلم",      author: "Имам Муслим",         coverColor: "#1b5e3f", count: 5362 },
  { id: "riyad",          name: "Рияд ас-Салихин",     nameAr: "رياض الصالحين",  author: "Имам ан-Навави",      coverColor: "#2a7450", count: 1896 },
  { id: "nawawi40",       name: "40 хадисов ан-Навави", nameAr: "الأربعون النووية", author: "Имам ан-Навави",    coverColor: "#144d3a", count: 42 },
  { id: "abu_dawud",      name: "Сунан Абу Дауд",       nameAr: "سنن أبي داود",   author: "Имам Абу Дауд",       coverColor: "#3a2a14", count: 5274 },
  { id: "tirmidhi",       name: "Сунан ат-Тирмизи",     nameAr: "سنن الترمذي",    author: "Имам ат-Тирмизи",     coverColor: "#1f2a3a", count: 3956 },
  { id: "nasai",          name: "Сунан ан-Насаи",       nameAr: "سنن النسائي",    author: "Имам ан-Насаи",       coverColor: "#2a3a1a", count: 5758 },
  { id: "ibn_majah",      name: "Сунан Ибн Маджа",      nameAr: "سنن ابن ماجه",   author: "Имам Ибн Маджа",      coverColor: "#3a1a2a", count: 4341 },
  { id: "silsila_sahiha", name: "Сильсила ас-сахиха",   nameAr: "السلسلة الصحيحة",author: "Шейх аль-Альбани",    coverColor: "#0a2a3a", count: 2362 },
  { id: "sahih_jami",     name: "Сахих аль-Джами",      nameAr: "صحيح الجامع",    author: "Шейх аль-Альбани",    coverColor: "#1a3a2a", count: 7463 },
];

/* ===================== Article folders ===================== */
export const ARTICLE_FOLDERS: Folder[] = [
  { id: "ar-aqeedah",  key: "aqeedah",     label: "Акыда",              iconKey: "Shield",     coverColor: "#0f3d2e" },
  { id: "ar-manhaj",   key: "manhaj",      label: "Манхадж",            iconKey: "Compass",    coverColor: "#2a3d1a" },
  { id: "ar-fiqh",     key: "fiqh",        label: "Фикх",               iconKey: "Scale",      coverColor: "#1a3a2a" },
  { id: "ar-tafsir",   key: "tafsir",      label: "Тафсир",             iconKey: "BookOpen",   coverColor: "#3a2a14" },
  { id: "ar-hadith",   key: "hadith",      label: "Хадис",              iconKey: "Quote",      coverColor: "#1f2a3a" },
  { id: "ar-family",   key: "family",      label: "Семья",              iconKey: "Users",      coverColor: "#3a1a2a" },
  { id: "ar-upbring",  key: "upbringing",  label: "Воспитание",         iconKey: "Baby",       coverColor: "#2a1a3a" },
  { id: "ar-history",  key: "history",     label: "История",            iconKey: "Scroll",     coverColor: "#2a2a1a" },
  { id: "ar-dawah",    key: "dawah",       label: "Даава",              iconKey: "Megaphone",  coverColor: "#2a1a3a" },
  { id: "ar-qa",       key: "qna",         label: "Ответы на вопросы",  iconKey: "HelpCircle", coverColor: "#1a2a3a" },
  { id: "ar-useful",   key: "useful",      label: "Полезные статьи",    iconKey: "BookMarked", coverColor: "#3a2a14" },
];

/* ===================== Biography folders ===================== */
export const BIO_FOLDERS: Folder[] = [
  { id: "bi-prophets",    key: "prophets",    label: "Пророки",         labelAr: "الأنبياء",       iconKey: "Star",          coverColor: "#0f3d2e" },
  { id: "bi-companions",  key: "companions",  label: "Сподвижники",     labelAr: "الصحابة",        iconKey: "Users",         coverColor: "#1b5e3f" },
  { id: "bi-tabiin",      key: "tabiin",      label: "Табиины",         labelAr: "التابعون",       iconKey: "UsersRound",    coverColor: "#144d3a" },
  { id: "bi-scholars",    key: "scholars",    label: "Учёные",          labelAr: "العلماء",        iconKey: "GraduationCap", coverColor: "#3a2a14" },
  { id: "bi-modern",      key: "modern",      label: "Современные",     labelAr: "المعاصرون",      iconKey: "User",          coverColor: "#1f2a3a" },
  { id: "bi-authors",     key: "authors",     label: "Авторы книг",     labelAr: "المؤلفون",       iconKey: "Feather",       coverColor: "#2a3a1a" },
];

/* ===================== Languages for "Library by Language" ===================== */
export const LANGUAGE_PACKS = [
  { code: "ru" as Lang, label: "Russian", nativeLabel: "Русский",     flag: "🇷🇺" },
  { code: "ar" as Lang, label: "Arabic",  nativeLabel: "العربية",     flag: "🇸🇦", rtl: true },
  { code: "tg" as Lang, label: "Tajik",   nativeLabel: "Тоҷикӣ",      flag: "🇹🇯" },
  { code: "uz" as Lang, label: "Uzbek",   nativeLabel: "Oʻzbekcha",   flag: "🇺🇿" },
  { code: "fa" as Lang, label: "Persian", nativeLabel: "فارسی",       flag: "🇮🇷", rtl: true },
  { code: "en" as Lang, label: "English", nativeLabel: "English",     flag: "🇬🇧" },
];