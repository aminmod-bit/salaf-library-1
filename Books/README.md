# Как добавлять книги вручную

## Вариант 1 — самый простой: положить PDF в папку раздела

Положите PDF в нужную папку:

```text
Books/Aqeedah/
Books/Tawhid/
Books/Manhaj/
Books/Hadith/
Books/Seerah/
Books/Fiqh/
Books/Tafsir/
Books/Azkar/
Books/Dua/
Books/Arabic/
Books/Dawah/
Books/History/
Books/Biography/
Books/Children/
Books/Other/
```

Пример:

```text
Books/Aqeedah/tri-osnovy.pdf
```

При сборке сайта команда автоматически:

- найдёт PDF;
- скопирует его в `public/books/...`;
- добавит запись в `public/data/books.json`;
- поставит категорию по папке;
- создаст ссылку для онлайн-чтения.

## Обложка

Если рядом с PDF положить обложку с таким же именем, она подключится автоматически:

```text
Books/Aqeedah/tri-osnovy.pdf
Books/Aqeedah/tri-osnovy.webp
```

Поддерживаются:

```text
.webp
.jpg
.jpeg
.png
```

## Вариант 2 — ручной JSON

Если нужна полностью ручная запись, добавьте её в:

```text
public/data/books.manual.json
```

Этот файл не перезаписывается скриптом. При build он объединяется с книгами из папок.

## Команда

Локально можно запустить:

```bash
npm run books:sync
```

При обычном deploy это выполняется автоматически перед build.
