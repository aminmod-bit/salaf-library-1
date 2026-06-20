# Автоматический импорт материалов

Эта папка нужна только для подготовки новых материалов перед добавлением на сайт.

## Быстрый порядок

1. Положите PDF в `import/books/`.
2. Положите обложку с таким же именем в `import/covers/` — необязательно.
3. Заполните `import/books/books.json`.
4. Запустите:

```bash
npm run import:all
npm run build
```

5. Сделайте commit и push в GitHub.

## Поддерживаемые команды

```bash
npm run import:books
npm run import:audio
npm run import:biographies
npm run import:fawaid
npm run import:all
```

## Куда скрипт переносит файлы

- PDF → `public/books/`
- MP3/audio → `public/audio/`
- обложки → `public/covers/`
- записи → `public/data/*.json`

Файлы в `import/` можно удалить после успешного импорта.
