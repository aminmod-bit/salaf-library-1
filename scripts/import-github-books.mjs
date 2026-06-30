#!/usr/bin/env node
/**
 * Import books from GitHub repository
 * Usage: node scripts/import-github-books.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_DATA = join(ROOT, 'public', 'data');
const BACKUPS = join(ROOT, 'backups');

const GITHUB_REPO = 'aminmod-bit/salaf-library';
const GITHUB_BRANCH = 'main';
const BOOKS_PATH = 'books';

const CATEGORY_KEYWORDS = {
  'Акыда': ['акыда', 'aqeedah', 'акида', 'таухид', 'tawhid', 'иман', 'вероучение', 'усуль', 'ашиар', 'матуриди'],
  'Хадисы': ['хадис', 'hadith', 'сахих', 'sahih', 'сунан', 'sunan', 'бухари', 'bukhari', 'муслим', 'муснад', 'навави', 'nawawi', 'аджурри'],
  'Фикх': ['фикх', 'fiqh', 'намаз', 'salat', 'пост', 'ramadan', 'рамадан', 'закят', 'zakat', 'хадж', 'hajj', 'умра', 'умры', ' Cleanliness', 'очищ', 'валу'],
  'Дуа и зикр': ['дуа', 'dua', 'azkar', 'adhkar', 'zikr', 'зикр', 'азкар', 'дуа'],
  'Сира': ['сира', 'seerah', 'пророк', 'prophet', 'мухаммад', 'muhammad', 'мекка', 'медина'],
  'Арабский язык': ['arabic', 'арабский', 'nahw', 'sarf', 'арабск'],
  'Тафсир': ['тафсир', 'tafsir', 'толкование', 'коран', 'quran'],
  'Манхадж': ['манхадж', 'manhaj', 'методология', 'сунна', 'sunnah', ' Kitab as-Sunnah', 'ас-Сунна'],
  'Фаваиды': ['fawaid', 'فوائد', 'польза', 'мудрость', 'урок'],
  'Биографии': ['биография', 'biography', 'учёный', 'имам', 'имама', 'имам ахмад', 'ибн'],
  'Воспитание': ['воспит', 'адаб', 'нравствен', 'характер', 'blеск'],
  'История': ['истори', 'история', 'халифат', 'государств'],
  'Даава': ['даава', 'призыв', 'dawah'],
  'Общее': ['общее', 'general', 'другое'],
};

const TAG_KEYWORDS = ['таухид', 'акыда', 'хадис', 'фикх', 'сира', 'коран', 'дуа', 'азкар', 'методология', 'биография', 'арабский', 'тафсир', 'сунна', 'саляф', 'намаз', 'пост', 'рамадан'];

function detectCategory(filename) {
  const lower = filename.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return 'Общее';
}

function detectTags(filename, category) {
  const tags = [];
  const lower = filename.toLowerCase();
  if (category !== 'Общее') tags.push(category.toLowerCase());
  for (const kw of TAG_KEYWORDS) {
    if (lower.includes(kw)) tags.push(kw);
  }
  return [...new Set(tags)];
}

function parseAuthorTitle(filename) {
  const name = filename.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').replace(/\s*\(\d+\)\s*/g, ' ').trim();

  // Pattern: "Title - Author" or "Title — Author" or "Title_Автор"
  const patterns = [
    /^(.+?)\s*[-–—]\s*(.+)$/,
    /^(.+?),\s*(.+)$/,
    /^(.+?)\s+имама?\s+(.+)$/i,
    /^(.+?)\s+шейх[а-я]?\s+(.+)$/i,
    /^(.+?)\s+ибн\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) {
      const part1 = match[1].trim();
      const part2 = match[2].trim();
      if (part1.length < 60 && part2.length < 60) {
        return { title: part1, author: part2 };
      }
    }
  }

  return { title: name, author: 'Автор не указан' };
}

function generateId() {
  return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function fileSizeStr(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

async function main() {
  console.log('📚 Fetching books from GitHub...');
  console.log(`   Repository: ${GITHUB_REPO}`);
  console.log(`   Path: ${BOOKS_PATH}/`);
  console.log('');

  // Fetch directory listing
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${BOOKS_PATH}?ref=${GITHUB_BRANCH}`;
  let files;
  try {
    files = await fetchJson(url);
  } catch (e) {
    console.error('❌ Failed to fetch GitHub API:', e.message);
    process.exit(1);
  }

  // Filter PDF files only
  const pdfs = files.filter(f => f.type === 'file' && f.name.toLowerCase().endsWith('.pdf'));
  console.log(`📄 Found ${pdfs.length} PDF files\n`);

  if (pdfs.length === 0) {
    console.log('No PDF files found. Exiting.');
    process.exit(0);
  }

  // Backup existing books.json
  const booksPath = join(PUBLIC_DATA, 'books.json');
  if (existsSync(booksPath)) {
    mkdirSync(BACKUPS, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = join(BACKUPS, `${timestamp}_books.json`);
    const existing = readFileSync(booksPath, 'utf8');
    writeFileSync(backupPath, existing);
    console.log(`💾 Backup: ${backupPath}`);
  }

  // Load existing books
  let existingBooks = [];
  if (existsSync(booksPath)) {
    try {
      existingBooks = JSON.parse(readFileSync(booksPath, 'utf8'));
      if (!Array.isArray(existingBooks)) existingBooks = [];
    } catch { existingBooks = []; }
  }
  const existingUrls = new Set(existingBooks.map(b => b.fileUrl || b.downloadUrl));
  console.log(`📖 Existing books: ${existingBooks.length}\n`);

  // Process each PDF
  const newBooks = [];
  let skipped = 0;

  for (const file of pdfs) {
    const rawUrl = file.download_url;
    const githubUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${file.path}`;

    // Skip if already imported
    if (existingUrls.has(githubUrl) || existingUrls.has(rawUrl)) {
      skipped++;
      continue;
    }

    const { title, author } = parseAuthorTitle(file.name);
    const category = detectCategory(file.name);
    const tags = detectTags(file.name, category);
    const needsReview = author === 'Автор не указан' || category === 'Общее';

    const book = {
      id: generateId(),
      title,
      author,
      category,
      language: 'Русский',
      size: fileSizeStr(file.size),
      description: `Книга «${title}» из библиотеки Salaf Library.`,
      tags,
      fileUrl: githubUrl,
      downloadUrl: githubUrl,
      year: '2026',
      featured: false,
      isNew: true,
      popular: false,
      needsReview,
      rating: 5,
      downloads: 0,
      views: 0,
    };

    newBooks.push(book);
    const status = needsReview ? '⚠️' : '✅';
    console.log(`  ${status} ${title} — ${author} [${category}]`);
  }

  // Combine
  const allBooks = [...existingBooks, ...newBooks];

  // Save
  writeFileSync(booksPath, JSON.stringify(allBooks, null, 2) + '\n');

  console.log(`\n📊 Results:`);
  console.log(`   New books: ${newBooks.length}`);
  console.log(`   Skipped (already imported): ${skipped}`);
  console.log(`   Total books: ${allBooks.length}`);
  console.log(`   Need review: ${newBooks.filter(b => b.needsReview).length}`);
  console.log(`\n✅ Saved to: ${booksPath}`);
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
