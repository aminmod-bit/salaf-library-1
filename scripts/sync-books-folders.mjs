import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BOOKS_ROOT = path.join(ROOT, 'Books');
const PUBLIC_BOOKS_ROOT = path.join(ROOT, 'public', 'books');
const PUBLIC_COVERS_ROOT = path.join(ROOT, 'public', 'covers');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const OUTPUT_JSON = path.join(DATA_DIR, 'books.json');
const MANUAL_JSON = path.join(DATA_DIR, 'books.manual.json');

const PDF_EXTENSIONS = new Set(['.pdf']);
const COVER_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];

const CATEGORY_NAMES = {
  Aqeedah: 'Акыда',
  Tawhid: 'Таухид',
  Manhaj: 'Манхадж',
  Tafsir: 'Тафсир',
  Hadith: 'Хадисы',
  Seerah: 'Сира',
  Fiqh: 'Фикх',
  Arabic: 'Арабский язык',
  Dawah: 'Даава',
  History: 'История',
  Biography: 'Биографии',
  Tarbiyah: 'Воспитание',
  Children: 'Детские книги',
  Azkar: 'Азкары',
  Dua: 'Дуа',
  Other: 'Другие разделы',
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJsonArray(file) {
  if (!fs.existsSync(file)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
}

function slugify(value) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return String(value || 'book')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[а-яё]/g, ch => map[ch] || ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'book';
}

function titleFromFile(fileName) {
  return path.basename(fileName, path.extname(fileName))
    .normalize('NFC')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashId(input) {
  return `b${crypto.createHash('sha1').update(input).digest('hex').slice(0, 10)}`;
}

function fileSizeMb(file) {
  const bytes = fs.statSync(file).size;
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} МБ`;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else result.push(full);
  }
  return result;
}

function findCoverForPdf(pdfPath) {
  const dir = path.dirname(pdfPath);
  const base = path.basename(pdfPath, path.extname(pdfPath));
  for (const ext of COVER_EXTENSIONS) {
    const candidate = path.join(dir, `${base}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function copyIfChanged(source, target) {
  ensureDir(path.dirname(target));
  if (fs.existsSync(target)) {
    const a = fs.statSync(source);
    const b = fs.statSync(target);
    if (a.size === b.size && Math.floor(a.mtimeMs) <= Math.floor(b.mtimeMs)) return;
  }
  fs.copyFileSync(source, target);
}

function categoryFromRelative(relativePath) {
  const first = relativePath.split(path.sep)[0] || 'Other';
  return CATEGORY_NAMES[first] || first;
}

function languageFromPath(relativePath) {
  const parts = relativePath.split(path.sep).map(p => p.toLowerCase());
  if (parts.includes('arabic-books') || parts.includes('ar')) return 'Арабский';
  if (parts.includes('tajik') || parts.includes('tj') || parts.includes('tg')) return 'Таджикский';
  if (parts.includes('uzbek') || parts.includes('uz')) return 'Узбекский';
  if (parts.includes('persian') || parts.includes('fa')) return 'Персидский';
  if (parts.includes('english') || parts.includes('en')) return 'Английский';
  return 'Русский';
}

function makeBook(pdfPath) {
  const relative = path.relative(BOOKS_ROOT, pdfPath);
  const category = categoryFromRelative(relative);
  const language = languageFromPath(relative);
  const folderSlug = slugify(path.dirname(relative).replaceAll(path.sep, '-')) || 'books';
  const title = titleFromFile(path.basename(pdfPath));
  const pdfSlug = slugify(title);
  const ext = path.extname(pdfPath).toLowerCase();
  const outputName = `${pdfSlug}${ext}`;
  const publicPdf = path.join(PUBLIC_BOOKS_ROOT, folderSlug, outputName);
  copyIfChanged(pdfPath, publicPdf);

  const cover = findCoverForPdf(pdfPath);
  let coverImage;
  if (cover) {
    const coverExt = path.extname(cover).toLowerCase();
    const publicCover = path.join(PUBLIC_COVERS_ROOT, folderSlug, `${pdfSlug}${coverExt}`);
    copyIfChanged(cover, publicCover);
    coverImage = `./covers/${folderSlug}/${pdfSlug}${coverExt}`;
  }

  return {
    id: hashId(relative),
    title,
    author: 'Автор не указан',
    category,
    language,
    size: fileSizeMb(pdfPath),
    description: `Книга «${title}» добавлена в раздел «${category}» и доступна для онлайн-чтения.`,
    coverColor: '#1a3a2a',
    coverEmoji: '📖',
    ...(coverImage ? { coverImage } : {}),
    tags: [category.toLowerCase()],
    fileUrl: `./books/${folderSlug}/${outputName}`,
    downloadUrl: `./books/${folderSlug}/${outputName}`,
    year: String(new Date().getFullYear()),
    rating: 5,
    downloads: 0,
    views: 0,
    featured: false,
    popular: false,
    isNew: true,
    sourceFolder: `Books/${relative.replaceAll(path.sep, '/')}`,
  };
}

function main() {
  ensureDir(DATA_DIR);
  ensureDir(PUBLIC_BOOKS_ROOT);
  ensureDir(PUBLIC_COVERS_ROOT);
  if (!fs.existsSync(MANUAL_JSON)) fs.writeFileSync(MANUAL_JSON, '[]\n');

  const manualBooks = readJsonArray(MANUAL_JSON);
  const folderBooks = walk(BOOKS_ROOT)
    .filter(file => PDF_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map(makeBook);

  const byId = new Map();
  for (const book of [...folderBooks, ...manualBooks]) byId.set(book.id, book);
  const books = [...byId.values()].sort((a, b) => String(a.category).localeCompare(String(b.category)) || String(a.title).localeCompare(String(b.title)));

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(books, null, 2) + '\n');
  console.log(`Books sync complete: ${folderBooks.length} from folders, ${manualBooks.length} manual, ${books.length} total.`);
}

main();
