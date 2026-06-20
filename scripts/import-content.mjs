#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const mode = process.argv[2] || 'all';

const paths = {
  import: path.join(root, 'import'),
  public: path.join(root, 'public'),
  data: path.join(root, 'public', 'data'),
  books: path.join(root, 'public', 'books'),
  audio: path.join(root, 'public', 'audio'),
  covers: path.join(root, 'public', 'covers'),
  images: path.join(root, 'public', 'images'),
};

for (const dir of Object.values(paths)) ensureDir(dir);
ensureDir(path.join(paths.import, 'books'));
ensureDir(path.join(paths.import, 'audio'));
ensureDir(path.join(paths.import, 'covers'));
ensureDir(path.join(paths.import, 'biographies'));
ensureDir(path.join(paths.import, 'fawaid'));

const colors = ['#1a3a2a', '#0f3d2e', '#123f2b', '#2a3a1a', '#1a3a3a', '#3a2a1a', '#1a2a3a', '#2a1a3a'];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = []) {
  if (!fs.existsSync(file)) return fallback;
  const raw = fs.readFileSync(file, 'utf8').trim();
  if (!raw) return fallback;
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('JSON root must be an array');
    return data;
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function slugify(value) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return String(value || 'item')
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => map[ch] || ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'item';
}

function uniqueFileName(dir, base, ext) {
  let name = `${base}${ext}`;
  let i = 2;
  while (fs.existsSync(path.join(dir, name))) {
    name = `${base}-${i}${ext}`;
    i += 1;
  }
  return name;
}

function copyMedia(sourceFile, targetDir, preferredBase) {
  if (!sourceFile || !fs.existsSync(sourceFile)) return undefined;
  ensureDir(targetDir);
  const ext = path.extname(sourceFile).toLowerCase();
  const base = slugify(preferredBase || path.basename(sourceFile, ext));
  const fileName = uniqueFileName(targetDir, base, ext);
  fs.copyFileSync(sourceFile, path.join(targetDir, fileName));
  return fileName;
}

function publicPath(folder, fileName) {
  return `./${folder}/${fileName}`;
}

function fileSizeMb(file) {
  const bytes = fs.statSync(file).size;
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} МБ`;
}

function nextId(items, prefix) {
  const max = items.reduce((acc, item) => {
    const id = String(item.id || '');
    if (!id.startsWith(prefix)) return acc;
    const num = Number(id.slice(prefix.length).replace(/^0+/, '') || '0');
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

function upsert(items, item) {
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index >= 0) {
    items[index] = { ...items[index], ...item };
    return 'updated';
  }
  items.push(item);
  return 'added';
}

function findCover(baseName, explicit) {
  const coverDir = path.join(paths.import, 'covers');
  if (explicit) {
    const full = path.isAbsolute(explicit) ? explicit : path.join(coverDir, explicit);
    if (fs.existsSync(full)) return full;
    const fullFromImport = path.join(paths.import, explicit);
    if (fs.existsSync(fullFromImport)) return fullFromImport;
  }
  const base = path.basename(baseName, path.extname(baseName));
  for (const ext of ['.webp', '.jpg', '.jpeg', '.png']) {
    const candidate = path.join(coverDir, `${base}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

function hashColor(value) {
  const h = crypto.createHash('md5').update(String(value)).digest()[0];
  return colors[h % colors.length];
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean);
  if (typeof tags === 'string') return tags.split(',').map((t) => t.trim()).filter(Boolean);
  return [];
}

function importBooks() {
  const manifest = path.join(paths.import, 'books', 'books.json');
  const rows = readJson(manifest, []);
  const booksFile = path.join(paths.data, 'books.json');
  const books = readJson(booksFile, []);
  let added = 0;
  let updated = 0;

  for (const row of rows) {
    if (!row.file) throw new Error('import/books/books.json: every book needs "file"');
    const source = path.join(paths.import, 'books', row.file);
    if (!fs.existsSync(source)) throw new Error(`Book PDF not found: import/books/${row.file}`);

    const title = row.title || path.basename(row.file, path.extname(row.file));
    const id = row.id || nextId(books, 'b');
    const copiedPdf = copyMedia(source, paths.books, row.slug || title);

    let coverImage = row.coverImage;
    const coverSource = findCover(row.file, row.cover || row.coverImage);
    if (coverSource) {
      const coverFile = copyMedia(coverSource, paths.covers, row.slug || title);
      coverImage = publicPath('covers', coverFile);
    }

    const book = {
      id,
      title,
      ...(row.titleAr ? { titleAr: row.titleAr } : {}),
      author: row.author || 'Автор не указан',
      ...(row.authorId ? { authorId: row.authorId } : {}),
      category: row.category || 'Общее',
      ...(row.subcategory ? { subcategory: row.subcategory } : {}),
      language: row.language || 'Русский',
      ...(row.pages ? { pages: Number(row.pages) } : {}),
      size: row.size || fileSizeMb(source),
      description: row.description || `Книга «${title}» добавлена в Salaf Library.`,
      coverColor: row.coverColor || hashColor(title),
      coverEmoji: row.coverEmoji || '📖',
      ...(coverImage ? { coverImage } : {}),
      tags: normalizeTags(row.tags),
      fileUrl: publicPath('books', copiedPdf),
      downloadUrl: publicPath('books', copiedPdf),
      ...(row.year ? { year: String(row.year) } : {}),
      ...(row.publisher ? { publisher: row.publisher } : {}),
      rating: row.rating ? Number(row.rating) : 5,
      downloads: row.downloads ? Number(row.downloads) : 0,
      views: row.views ? Number(row.views) : 0,
      featured: Boolean(row.featured),
      popular: Boolean(row.popular),
      isNew: row.isNew ?? true,
      ...(row.relatedBooks ? { relatedBooks: row.relatedBooks } : {}),
    };

    const result = upsert(books, book);
    result === 'added' ? added++ : updated++;
  }

  writeJson(booksFile, books);
  console.log(`Books: ${added} added, ${updated} updated`);
}

function importAudio() {
  const manifest = path.join(paths.import, 'audio', 'audio.json');
  const rows = readJson(manifest, []);
  const audioFile = path.join(paths.data, 'audio.json');
  const audio = readJson(audioFile, []);
  let added = 0;
  let updated = 0;

  for (const row of rows) {
    if (!row.file) throw new Error('import/audio/audio.json: every audio item needs "file"');
    const source = path.join(paths.import, 'audio', row.file);
    if (!fs.existsSync(source)) throw new Error(`Audio file not found: import/audio/${row.file}`);

    const title = row.title || path.basename(row.file, path.extname(row.file));
    const id = row.id || nextId(audio, 'au');
    const copiedAudio = copyMedia(source, paths.audio, row.slug || title);

    let coverImage = row.coverImage;
    const coverSource = findCover(row.file, row.cover || row.coverImage);
    if (coverSource) {
      const coverFile = copyMedia(coverSource, paths.covers, row.slug || title);
      coverImage = publicPath('covers', coverFile);
    }

    const lesson = {
      id,
      title,
      author: row.author || 'Лектор не указан',
      ...(row.authorId ? { authorId: row.authorId } : {}),
      category: row.category || 'Общее',
      description: row.description || `Аудиоурок «${title}» добавлен в Salaf Library.`,
      ...(row.duration ? { duration: row.duration } : {}),
      fileUrl: publicPath('audio', copiedAudio),
      downloadUrl: publicPath('audio', copiedAudio),
      tags: normalizeTags(row.tags),
      coverColor: row.coverColor || hashColor(title),
      coverEmoji: row.coverEmoji || '🎧',
      ...(coverImage ? { coverImage } : {}),
      ...(row.series ? { series: row.series } : {}),
      ...(row.episode ? { episode: Number(row.episode) } : {}),
      ...(row.year ? { year: String(row.year) } : {}),
      ...(row.relatedBooks ? { relatedBooks: row.relatedBooks } : {}),
      views: row.views ? Number(row.views) : 0,
      isNew: row.isNew ?? true,
    };

    const result = upsert(audio, lesson);
    result === 'added' ? added++ : updated++;
  }

  writeJson(audioFile, audio);
  console.log(`Audio: ${added} added, ${updated} updated`);
}

function importBiographies() {
  const manifest = path.join(paths.import, 'biographies', 'biographies.json');
  const rows = readJson(manifest, []);
  const biosFile = path.join(paths.data, 'biographies.json');
  const bios = readJson(biosFile, []);
  let added = 0;
  let updated = 0;

  for (const row of rows) {
    const name = row.name;
    if (!name) throw new Error('import/biographies/biographies.json: every biography needs "name"');
    const id = row.id || nextId(bios, 'a');

    let coverImage = row.coverImage;
    const coverSource = findCover(row.slug || name, row.cover || row.coverImage);
    if (coverSource) {
      const coverFile = copyMedia(coverSource, paths.covers, row.slug || name);
      coverImage = publicPath('covers', coverFile);
    }

    const bio = {
      id,
      name,
      ...(row.nameAr ? { nameAr: row.nameAr } : {}),
      type: row.type || 'scholar',
      ...(row.birthYear ? { birthYear: String(row.birthYear) } : {}),
      ...(row.deathYear ? { deathYear: String(row.deathYear) } : {}),
      ...(row.birthPlace ? { birthPlace: row.birthPlace } : {}),
      description: row.description || `Биография: ${name}.`,
      ...(row.fullBio ? { fullBio: row.fullBio } : {}),
      tags: normalizeTags(row.tags),
      ...(row.relatedBooks ? { relatedBooks: row.relatedBooks } : {}),
      ...(row.relatedAudio ? { relatedAudio: row.relatedAudio } : {}),
      coverColor: row.coverColor || hashColor(name),
      coverEmoji: row.coverEmoji || '🎓',
      ...(coverImage ? { coverImage } : {}),
      featured: Boolean(row.featured),
    };

    const result = upsert(bios, bio);
    result === 'added' ? added++ : updated++;
  }

  writeJson(biosFile, bios);
  console.log(`Biographies: ${added} added, ${updated} updated`);
}

function importFawaid() {
  const manifest = path.join(paths.import, 'fawaid', 'fawaid.json');
  const rows = readJson(manifest, []);
  const fawaidFile = path.join(paths.data, 'fawaid.json');
  const fawaid = readJson(fawaidFile, []);
  let added = 0;
  let updated = 0;

  for (const row of rows) {
    if (!row.text) throw new Error('import/fawaid/fawaid.json: every faidah needs "text"');
    const id = row.id || nextId(fawaid, 'f');
    const faidah = {
      id,
      text: row.text,
      ...(row.textAr ? { textAr: row.textAr } : {}),
      author: row.author || 'Автор не указан',
      ...(row.authorId ? { authorId: row.authorId } : {}),
      category: row.category || 'Общее',
      ...(row.source ? { source: row.source } : {}),
      tags: normalizeTags(row.tags),
      ...(row.year ? { year: String(row.year) } : {}),
      isFeatured: Boolean(row.isFeatured),
      likes: row.likes ? Number(row.likes) : 0,
    };

    const result = upsert(fawaid, faidah);
    result === 'added' ? added++ : updated++;
  }

  writeJson(fawaidFile, fawaid);
  console.log(`Fawaid: ${added} added, ${updated} updated`);
}

const tasks = {
  books: importBooks,
  audio: importAudio,
  biographies: importBiographies,
  fawaid: importFawaid,
};

if (mode === 'all') {
  importBooks();
  importAudio();
  importBiographies();
  importFawaid();
} else if (tasks[mode]) {
  tasks[mode]();
} else {
  console.error(`Unknown import mode: ${mode}`);
  console.error('Use: books | audio | biographies | fawaid | all');
  process.exit(1);
}

console.log('Import finished. Run: npm run build');
