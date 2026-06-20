# Salaf Library — Final Release 1.0

Профессиональная исламская цифровая библиотека на **React + TypeScript + Vite**. Версия 1.0 подготовлена к публичному запуску, GitHub Pages, PWA-режиму, подключению собственного домена и дальнейшему наполнению материалами без изменения кода приложения.

## Возможности

- Книги, категории, биографии, аудио, фаваиды, избранное, история, Dashboard, цели чтения и админ-раздел.
- Мультиязычная основа: RU / EN / AR через `i18next`.
- HashRouter для стабильной работы на GitHub Pages без серверной настройки rewrite.
- PWA: `manifest.json`, иконки, service worker, offline-cache основных данных.
- SEO-файлы: `robots.txt`, `sitemap.xml`, Open Graph / Twitter meta tags.
- Импорт и масштабирование через JSON-файлы в `public/data` и медиа в `public/`.

## Технологии

- React 19
- TypeScript 5
- Vite 7
- React Router 7
- Zustand
- i18next
- Tailwind CSS 4
- Lucide React

## Установка

```bash
npm ci
```

Если `package-lock.json` отсутствует или зависимости нужно обновить:

```bash
npm install
```

## Запуск для разработки

```bash
npm run dev
```

Откройте адрес, который покажет Vite, обычно:

```text
http://localhost:5173/
```

## Проверка проекта

```bash
npm run check
```

Команда выполняет:

- TypeScript-проверку без генерации файлов;
- аудит npm-зависимостей на уровне `moderate` и выше.

## Production Build

```bash
npm run build
```

Результат будет создан в папке `dist/`.

Локальная проверка production-сборки:

```bash
npm run preview
```

## GitHub Pages

Проект уже содержит workflow:

```text
.github/workflows/deploy.yml
```

Порядок публикации:

1. Загрузите проект в GitHub-репозиторий.
2. Включите GitHub Pages: **Settings → Pages → Source → GitHub Actions**.
3. Сделайте push в ветку `main` или `master`.
4. Workflow выполнит `npm ci`, `npm run build` и опубликует папку `dist/`.

Маршрутизация работает через `HashRouter`, поэтому страницы вида `/#/books`, `/#/audio`, `/#/fawaid` корректно открываются на GitHub Pages без дополнительной серверной настройки.

## Подключение собственного домена

Проект подготовлен к домену вида:

```text
salaflibrary.org
```

Файл:

```text
public/CNAME
```

содержит домен для GitHub Pages. Если домен будет другим, достаточно заменить значение в этом файле и обновить DNS у регистратора.

Типовая настройка DNS:

- для apex-домена (`salaflibrary.org`) — A-записи GitHub Pages;
- для `www.salaflibrary.org` — CNAME на `<username>.github.io`;
- в GitHub Pages включить **Enforce HTTPS**.

Код приложения менять не нужно: Vite использует относительный `base: "./"`, а роутер работает через hash-маршруты.

После смены домена также рекомендуется обновить:

- `public/robots.txt`;
- `public/sitemap.xml`;
- canonical/OG URL в `index.html`.

## Структура данных

Основные данные можно менять без изменения React-кода:

```text
public/data/books.json
public/data/biographies.json
public/data/audio.json
public/data/fawaid.json
public/data/categories.json
```

При запуске приложение сначала пытается загрузить эти JSON-файлы. Если файл отсутствует или повреждён, используется встроенный fallback из `src/data/*`.

## Автоматический импорт материалов

В версии 1.0 добавлена безопасная система автоматического импорта для GitHub Pages без backend.

Рабочая схема:

1. Кладёте исходные файлы в папку `import/`.
2. Заполняете маленький JSON-манифест.
3. Запускаете одну команду.
4. Скрипт сам переносит файлы в `public/` и обновляет `public/data/*.json`.
5. Делаете commit/push — GitHub Actions публикует обновление.

Команды:

```bash
npm run import:books
npm run import:audio
npm run import:biographies
npm run import:fawaid
npm run import:all
```

Папки импорта:

```text
import/books/
import/audio/
import/covers/
import/biographies/
import/fawaid/
```

Примеры манифестов лежат здесь:

```text
import/books/books.example.json
import/audio/audio.example.json
import/biographies/biographies.example.json
import/fawaid/fawaid.example.json
```

Для реального импорта создайте рядом файлы без `.example`, например:

```text
import/books/books.json
import/audio/audio.json
```

После импорта проверьте проект:

```bash
npm run build
```

## Импорт книг вручную

1. Поместите PDF-файлы в публичную папку, например:

```text
public/books/tri-osnovy.pdf
```

2. Добавьте запись в `public/data/books.json`:

```json
{
  "id": "b101",
  "title": "Название книги",
  "titleAr": "العنوان",
  "author": "Автор",
  "authorId": "a001",
  "category": "Акыда",
  "language": "Русский",
  "pages": 120,
  "size": "2.1 МБ",
  "description": "Описание книги.",
  "coverColor": "#1a3a2a",
  "coverEmoji": "📖",
  "tags": ["акыда", "таухид"],
  "fileUrl": "./books/tri-osnovy.pdf",
  "downloadUrl": "./books/tri-osnovy.pdf",
  "year": "2026",
  "featured": true,
  "isNew": true
}
```

После деплоя книга автоматически появится на сайте.

## Импорт изображений обложек

Сайт поддерживает настоящие обложки через поле:

```json
"coverImage": "./covers/tri-osnovy.webp"
```

Если `coverImage` указан, карточка книги показывает картинку. Если картинки нет, автоматически используется прежняя премиальная цветовая обложка через `coverColor` и `coverEmoji`.

При автоматическом импорте положите обложку в `import/covers/` и укажите её в `import/books/books.json`:

```json
"cover": "tri-osnovy.webp"
```

Скрипт сам скопирует файл в `public/covers/` и добавит `coverImage` в запись книги.

Рекомендации:

- формат: WebP;
- ширина: 400–800 px;
- сжатие: 75–85%;
- понятные имена файлов латиницей.

## Импорт аудио

1. Поместите аудио в:

```text
public/audio/lesson-001.mp3
```

2. Добавьте запись в `public/data/audio.json`:

```json
{
  "id": "au101",
  "title": "Название урока",
  "author": "Лектор",
  "authorId": "a001",
  "category": "Акыда",
  "description": "Описание урока.",
  "duration": "42:10",
  "fileUrl": "./audio/lesson-001.mp3",
  "downloadUrl": "./audio/lesson-001.mp3",
  "tags": ["урок", "акыда"],
  "coverColor": "#1a3a2a",
  "coverEmoji": "🎧",
  "series": "Серия уроков",
  "episode": 1,
  "isNew": true
}
```

## Импорт биографий

Добавьте объект в `public/data/biographies.json`:

```json
{
  "id": "a101",
  "name": "Имя",
  "nameAr": "الاسم",
  "type": "scholar",
  "birthYear": "",
  "deathYear": "",
  "birthPlace": "",
  "description": "Краткое описание.",
  "fullBio": "Полная биография.",
  "tags": ["учёный"],
  "relatedBooks": ["b101"],
  "relatedAudio": ["au101"],
  "coverColor": "#1a3a2a",
  "coverEmoji": "🎓",
  "featured": true
}
```

Допустимые типы:

- `prophet`
- `companion`
- `tabiin`
- `scholar`
- `modern`

## Импорт фаваидов

Добавьте объект в `public/data/fawaid.json`:

```json
{
  "id": "f101",
  "text": "Текст пользы.",
  "textAr": "النص العربي",
  "author": "Автор",
  "authorId": "a101",
  "category": "Знание",
  "source": "Источник",
  "tags": ["знание"],
  "year": "2026",
  "isFeatured": true,
  "likes": 0
}
```

## Админка

Админ-раздел доступен по маршрутам:

```text
/#/admin
/#/admin/import
/#/admin/stats
/#/admin/settings
```

В версии 1.0 админка предназначена для управления и контроля контента в рамках статического приложения. Для публичного GitHub Pages без backend безопасный рабочий процесс такой:

1. Подготовить PDF/аудио/изображения локально.
2. Добавить медиа в `public/`.
3. Обновить соответствующий JSON в `public/data/`.
4. Проверить локально через `npm run build` и `npm run preview`.
5. Сделать commit и push — GitHub Actions опубликует обновление.

## PWA

Файлы PWA:

```text
public/manifest.json
public/sw.js
public/icon-192.png
public/icon-512.png
```

Service Worker кэширует оболочку приложения и основные JSON-данные. При обновлениях меняйте `CACHE_NAME` в `public/sw.js`, если нужно принудительно сбросить старый кэш у пользователей.

## SEO

Файлы SEO:

```text
index.html
public/robots.txt
public/sitemap.xml
```

Перед финальным запуском на реальном домене проверьте URL в этих файлах.

## Производительность

В production-сборке включены:

- разделение vendor chunks;
- TypeScript-проверка перед build;
- оптимизированные WebP-изображения;
- относительный base path для GitHub Pages и домена;
- PWA-кэш основных файлов;
- загрузка контента из статических JSON без backend.

## Финальная проверка перед запуском

```bash
npm ci
npm run check
npm run build
npm run preview
```

Проверьте вручную:

- главную страницу;
- книги и детальную страницу книги;
- биографии и детальную страницу биографии;
- аудио и плеер;
- фаваиды;
- поиск;
- избранное;
- историю;
- Dashboard;
- админку;
- мобильную, планшетную и desktop-версию;
- PWA-установку;
- GitHub Pages deployment.

## Статус версии

**Salaf Library 1.0** — финальный production-ready релиз для публичного запуска и дальнейшего наполнения библиотеки.
