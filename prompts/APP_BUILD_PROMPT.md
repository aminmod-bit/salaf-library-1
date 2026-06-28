Создай мобильное приложение на базе существующего проекта Salaf Library.

Цель: подготовить приложение для Android и iOS через Capacitor без переписывания React-приложения.

ВАЖНО:
- Использовать существующий React + TypeScript + Vite проект.
- Не переписывать UI с нуля.
- Не менять структуру данных без необходимости.
- Сохранить совместимость с PWA.
- Приложение должно работать как полноценная исламская цифровая библиотека.

## Требования к приложению

Платформы:
- Android APK;
- Android AAB;
- iOS IPA;
- iPad;
- tablets;
- phones.

## Capacitor

Настроить:
- capacitor.config.json;
- appId: org.salaflibrary.app;
- appName: Salaf Library;
- webDir: dist;
- Android scheme https;
- iOS scheme https;
- splash screen;
- icons;
- permissions;
- safe areas;
- status bar;
- dark theme.

## Функции приложения

Должны работать:
- каталог книг;
- папки книг;
- PDF Reader;
- закладки;
- заметки;
- прогресс чтения;
- избранное;
- история чтения, если включена;
- статьи;
- азкары;
- хадисы;
- биографии;
- мультиязычность;
- localStorage/Zustand persist;
- offline app shell;
- PWA-compatible cache.

## PDF Reader

Проверить:
- Android WebView;
- iOS WKWebView;
- масштабирование;
- вертикальное чтение;
- сохранение страницы;
- поиск по PDF;
- производительность.

Если PDF.js слишком тяжёлый на мобильных:
- lazy-load;
- ограничить рендер;
- не рендерить обложки массово;
- предусмотреть opening PDF externally.

## Хранилище

Подготовить возможность:
- читать PDF из public/books;
- читать PDF из Cloudflare R2 в будущем;
- хранить пользовательские данные локально;
- позже добавить offline download.

## UI/UX

Приложение должно ощущаться как native:
- без адресной строки;
- fullscreen/standalone;
- аккуратные safe-area отступы;
- удобные touch targets;
- нижние панели не должны перекрываться системными жестами;
- плавный скролл;
- минимум нагрузки на телефон.

## Offline

Должно работать:
- открытие приложения без интернета;
- кэш основных JSON;
- кэш shell;
- сохранение избранного;
- сохранение прогресса.

PDF offline download можно сделать позже.

## Сборка

Подготовить инструкции:

```bash
npm install
npm run build
npx cap sync
npx cap open android
npx cap open ios
```

Android:
- APK debug;
- AAB release;
- icons;
- splash;
- versionCode/versionName.

iOS:
- Xcode project;
- Bundle ID;
- icons;
- splash;
- signing.

## Финальный результат

Должно быть возможно собрать Android/iOS приложение без переписывания архитектуры.

После выполнения проверить:
- npm run build;
- npx cap sync;
- Android emulator;
- iOS simulator, если доступен;
- PDF Reader;
- PWA не сломан;
- web build не сломан.
