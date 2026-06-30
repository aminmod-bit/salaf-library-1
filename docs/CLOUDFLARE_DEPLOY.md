# Деплой Salaf Library на Cloudflare Pages

## Быстрый старт

### 1. Подготовка

```bash
# Убедитесь что проект собирается
npm run build

# Проверьте контент
npm run content:validate
```

### 2. Деплой через Wrangler (CLI)

```bash
# Установите Wrangler
npm install -g wrangler

# Войдите в Cloudflare
wrangler login

# Деплой
npx wrangler pages deploy dist --project-name=salaf-library
```

### 3. Деплой через GitHub (рекомендуется)

1. Зайдите в [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pages → Create a project → Connect to Git
3. Выберите репозиторий `aminmod-bit/salaf-library-1`
4. Настройте сборку:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** 20
5. Нажмите "Save and Deploy"

### 4. Кастомный домен

1. В Cloudflare Dashboard → Pages → salaf-library → Custom domains
2. Добавьте `salaflibrary.org`
3. Если домен уже в Cloudflare — DNS настройки подставятся автоматически
4. Если домен где-то ещё:
   - Добавьте CNAME: `salaflibrary.org` → `salaf-library.pages.dev`
   - Или в Cloudflare DNS: A-записи на `192.0.2.1` с proxied

### 5. SSL/HTTPS

Включается автоматически для кастомных доменов в Cloudflare.

---

## Обновление контента

### Workflow (рекомендуемый)

```bash
# 1. Добавьте PDF в import/books/inbox/
# 2. Сканируйте
npm run content:scan

# 3. Проверьте черновики в админке
#    http://localhost:5173/#/admin/content

# 4. Импортируйте одобренные черновики
npm run content:import

# 5. Проверьте валидность
npm run content:validate

# 6. Соберите
npm run build

# 7. Коммитьте и пушьте
git add .
git commit -m "Добавлены новые книги"
git push
```

Cloudflare Pages автоматически пересоберёт сайт при пуше в `main`.

### Через админку (локально)

1. Откройте `http://localhost:5173/#/admin/content`
2. Редактируйте/удаляйте книги
3. Экспортируйте JSON
4. Замените `public/data/books.json`
5. Соберите и запушьте

---

## Структура проекта для Cloudflare

```
salaf-library-1/
├── dist/                    # Собранный сайт (не коммитить)
├── public/
│   ├── _headers             # HTTP-заголовки
│   ├── _redirects           # SPA-редиректы
│   ├── data/                # JSON-данные
│   ├── books/               # PDF-файлы
│   ├── covers/              # Обложки
│   └── audio/               # Аудиофайлы
├── src/                     # React-компоненты
├── scripts/                 # Скрипты CMS
└── import/                  # Черновики импорта
```

---

## Ограничения static-only режима

1. **Нет серверной логики** — вся админка работает в браузере
2. **Нет записи на диск** — изменения сохраняются в localStorage
3. **Нет аутентификации** — админка доступна всем
4. **Нет实时 обновления** — для изменений нужен rebuild
5. **Нет базы данных** — все данные в JSON-файлах

### Что доступно:

- Редактирование книг через админку (локально)
- Экспорт/импорт JSON
- Скачивание books.json
- Автоматический деплой при пуше

### Что недоступно:

- Онлайн-редактирование на сайте
- Мультипользовательский доступ
- Версионирование данных
- Работа с файлами на сервере

---

## Cloudflare Functions + D1 + R2 (план)

Для полноценной онлайн-админки потребуется:

1. **Cloudflare D1** — SQLite-база данных для контента
2. **Cloudflare R2** — хранилище PDF и обложек
3. **Cloudflare Functions** — API для CRUD операций
4. **Аутентификация** — Cloudflare Access или JWT

Это отдельный проект, который не ломает текущий статический сайт.

---

## Полезные команды

```bash
npm run build              # Собрать сайт
npm run content:validate   # Проверить данные
npm run content:backup     # Бэкап данных
npm run content:scan       # Сканировать PDF
npm run content:import     # Импортировать черновики
```
