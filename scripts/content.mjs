#!/usr/bin/env node
/**
 * Content Manager for Salaf Library
 * Commands: scan, import, validate, backup, restore
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync, unlinkSync } from 'fs';
import { join, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_DATA = join(ROOT, 'public', 'data');
const IMPORT_INBOX = join(ROOT, 'import', 'books', 'inbox');
const IMPORT_DRAFTS = join(ROOT, 'import', 'books', 'drafts');
const IMPORT_COVERS = join(ROOT, 'import', 'covers');
const BACKUPS = join(ROOT, 'backups');

const DATA_FILES = ['books.json', 'azkar.json', 'articles.json', 'fawaid.json', 'audio.json', 'biographies.json', 'categories.json'];

// ─── Categories ──────────────────────────────────────────────────────────────
const CATEGORIES = {
  'Акыда': ['акыда', 'aqeedah', 'акида', 'вероучение', 'иман', 'таухид', 'единобожие'],
  'Таухид': ['таухид', 'tawhid', 'единобожие', 'ля иляха'],
  'Манхадж': ['манхадж', 'manhaj', 'методология', 'сунна', 'саляф'],
  'Тафсир': ['тафсир', 'tafsir', 'толкование', 'коран', 'сюра'],
  'Хадисы': ['хадис', 'hadith', 'сунан', 'сахих', 'муслим', 'бухари', 'навави'],
  'Фикх': ['фикх', 'fiqh', 'намаз', 'пост', 'закят', 'хадж', 'Ḩаляль', 'халяль'],
  'Сира': ['сира', 'seerah', 'пророк', 'мухаммад', 'мекка', 'медина'],
  'Биографии': ['биография', 'biography', 'учёный', 'имам', 'сахаба', 'сподвижник'],
  'Арабский язык': ['арабский', 'arabic', 'грамматика', 'нахв', 'срф'],
  'Дуа и зикр': ['дуа', 'дуа', 'zikr', 'азкар', 'azkar', 'поминание', 'молитва'],
  'Фаваиды': ['фаваид', 'fawaid', 'полезное', 'мудрость'],
  'Общее': ['общее', 'general', 'другое']
};

const TAG_KEYWORDS = ['таухид', 'акыда', 'хадис', 'фикх', 'сира', 'коран', 'дуа', 'азкар', 'методология', 'биография', 'арабский', 'тафсир', 'сунна', 'саляф'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function readJson(path) {
  try {
    const data = readFileSync(path, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

const CYRILLIC_MAP = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[а-яё]/g, c => CYRILLIC_MAP[c] || c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return 'Общее';
}

function detectTags(text) {
  const lower = text.toLowerCase();
  return TAG_KEYWORDS.filter(kw => lower.includes(kw));
}

function detectLanguage(filename) {
  const lower = filename.toLowerCase();
  if (/таджик|тоҷик|tajik/.test(lower)) return 'Тоҷикӣ';
  if (/араб|arab/.test(lower)) return 'العربية';
  if (/англ|english|eng/.test(lower)) return 'English';
  return 'Русский';
}

function generateId(existingIds) {
  let id;
  do {
    id = 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  } while (existingIds.has(id));
  return id;
}

// ─── Commands ────────────────────────────────────────────────────────────────
function cmdScan() {
  console.log('📂 Scanning import/books/inbox/ for PDF files...\n');

  if (!existsSync(IMPORT_INBOX)) {
    mkdirSync(IMPORT_INBOX, { recursive: true });
    console.log('Created import/books/inbox/ — place PDF files here.');
    return;
  }

  const files = readdirSync(IMPORT_INBOX).filter(f => f.toLowerCase().endsWith('.pdf'));

  if (files.length === 0) {
    console.log('No PDF files found in import/books/inbox/');
    return;
  }

  console.log(`Found ${files.length} PDF file(s):\n`);

  // Load existing books for ID generation and dedup
  const existingBooks = readJson(join(PUBLIC_DATA, 'books.json')) || [];
  const existingIds = new Set(existingBooks.map(b => b.id));

  // Check for covers
  const covers = existsSync(IMPORT_COVERS) ? readdirSync(IMPORT_COVERS) : [];

  const drafts = [];

  for (const file of files) {
    const name = basename(file, '.pdf');
    const size = statSync(join(IMPORT_INBOX, file)).size;
    const sizeMb = (size / 1024 / 1024).toFixed(1) + ' МБ';

    // Try to match cover
    const coverMatch = covers.find(c => {
      const coverName = basename(c, extname(c)).toLowerCase();
      return coverName === name.toLowerCase() || coverName.includes(slugify(name));
    });

    // Try to parse author from filename (common patterns: "Author - Title", "Author_Title")
    let author = 'Автор не указан';
    let title = name.replace(/[_-]+/g, ' ').trim();

    const dashMatch = name.match(/^(.+?)[\s_-]+[-–—][\s_-]+(.+)$/);
    if (dashMatch) {
      // Could be "Author - Title" or "Title - Author"
      const parts = [dashMatch[1].trim(), dashMatch[2].trim()];
      // Heuristic: if first part looks like a name (has cyrillic, is short)
      if (parts[0].length < 40 && /[а-яёА-ЯЁ]/.test(parts[0])) {
        author = parts[0];
        title = parts[1];
      } else {
        title = parts[0];
        author = parts[1];
      }
    }

    const category = detectCategory(title + ' ' + author);
    const tags = detectTags(title + ' ' + author + ' ' + category);
    const language = detectLanguage(name);
    const id = generateId(existingIds);
    existingIds.add(id);

    const draft = {
      id,
      title,
      author,
      category,
      categoryConfidence: category !== 'Общее' ? 70 : 30,
      language,
      size: sizeMb,
      tags,
      description: `Книга «${title}» добавлена в Salaf Library.`,
      slug: slugify(title) || slugify(name),
      fileUrl: `./books/inbox/${file}`,
      downloadUrl: `./books/inbox/${file}`,
      coverImage: coverMatch ? `./covers/${coverMatch}` : undefined,
      year: String(new Date().getFullYear()),
      needsReview: author === 'Автор не указан' || category === 'Общее',
      reviewReason: author === 'Автор не указан' && category === 'Общее'
        ? 'Не удалось определить автора и категорию'
        : author === 'Автор не указан'
        ? 'Не удалось определить автора'
        : category === 'Общее'
        ? 'Не удалось определить категорию'
        : undefined,
      status: 'draft',
      importedAt: new Date().toISOString(),
      sourceFile: file,
    };

    drafts.push(draft);

    const status = draft.needsReview ? '⚠️  Требует проверки' : '✅ Автоопределение';
    console.log(`  ${status}: "${title}" by ${author} [${category}]`);
    if (draft.reviewReason) console.log(`    Причина: ${draft.reviewReason}`);
  }

  // Save drafts
  mkdirSync(IMPORT_DRAFTS, { recursive: true });
  const draftPath = join(IMPORT_DRAFTS, 'books.draft.json');
  writeJson(draftPath, drafts);

  console.log(`\n📝 Drafts saved to: ${draftPath}`);
  console.log(`   Total: ${drafts.length} book(s), ${drafts.filter(d => d.needsReview).length} need review`);
}

function cmdImport() {
  console.log('📦 Importing drafts to public/data/books.json...\n');

  const draftPath = join(IMPORT_DRAFTS, 'books.draft.json');
  if (!existsSync(draftPath)) {
    console.log('No drafts found. Run "npm run content:scan" first.');
    return;
  }

  const drafts = readJson(draftPath);
  if (!drafts || drafts.length === 0) {
    console.log('Drafts file is empty.');
    return;
  }

  // Backup before import
  console.log('Creating backup...');
  cmdBackupSilent();

  // Load existing books
  const existingBooks = readJson(join(PUBLIC_DATA, 'books.json')) || [];

  // Add new books
  const newBooks = drafts.map(d => {
    const { status, importedAt, sourceFile, reviewReason, ...book } = d;
    return book;
  });

  const allBooks = [...existingBooks, ...newBooks];
  writeJson(join(PUBLIC_DATA, 'books.json'), allBooks);

  console.log(`✅ Imported ${newBooks.length} book(s) to public/data/books.json`);
  console.log(`   Total books now: ${allBooks.length}`);

  // Clear drafts
  writeJson(draftPath, []);
  console.log('📝 Drafts cleared.');
}

function cmdValidate() {
  console.log('🔍 Validating content data...\n');

  let errors = 0;
  let warnings = 0;

  for (const file of DATA_FILES) {
    const path = join(PUBLIC_DATA, file);
    if (!existsSync(path)) {
      console.log(`  ⚠️  ${file}: not found`);
      warnings++;
      continue;
    }

    let data;
    try {
      data = JSON.parse(readFileSync(path, 'utf8'));
    } catch (e) {
      console.log(`  ❌ ${file}: invalid JSON — ${e.message}`);
      errors++;
      continue;
    }

    if (!Array.isArray(data)) {
      console.log(`  ❌ ${file}: expected array, got ${typeof data}`);
      errors++;
      continue;
    }

    const ids = new Set();
    const type = file.replace('.json', '');

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const prefix = `${file}[${i}]`;

      // Check ID
      if (!item.id) {
        console.log(`  ❌ ${prefix}: missing id`);
        errors++;
      } else if (ids.has(item.id)) {
        console.log(`  ❌ ${prefix}: duplicate id "${item.id}"`);
        errors++;
      } else {
        ids.add(item.id);
      }

      // Check title/name
      const nameField = type === 'biographies' ? 'name' : type === 'categories' ? 'name' : 'title';
      if (!item[nameField]) {
        console.log(`  ❌ ${prefix}: missing ${nameField}`);
        errors++;
      }

      // Check category (for books)
      if (type === 'books') {
        if (!item.category) {
          console.log(`  ⚠️  ${prefix}: missing category`);
          warnings++;
        }
        if (!Array.isArray(item.tags)) {
          console.log(`  ⚠️  ${prefix}: tags is not an array`);
          warnings++;
        }
      }

      // Check fileUrl (for books)
      if (type === 'books' && item.fileUrl) {
        const localPath = join(PUBLIC_DATA, '..', item.fileUrl.replace('./', ''));
        // Just flag, don't check file existence in validate (files may be on remote)
      }
    }

    const status = errors === 0 ? '✅' : '❌';
    console.log(`  ${status} ${file}: ${data.length} items, ${ids.size} unique IDs`);
  }

  console.log(`\n${errors === 0 ? '✅' : '❌'} Validation: ${errors} error(s), ${warnings} warning(s)`);
  process.exit(errors > 0 ? 1 : 0);
}

function cmdBackupSilent() {
  mkdirSync(BACKUPS, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  for (const file of DATA_FILES) {
    const src = join(PUBLIC_DATA, file);
    if (existsSync(src)) {
      const dst = join(BACKUPS, `${timestamp}_${file}`);
      copyFileSync(src, dst);
    }
  }
}

function cmdBackup() {
  console.log('💾 Creating backup of all data files...\n');
  cmdBackupSilent();

  const files = readdirSync(BACKUPS).filter(f => f.includes('_'));
  console.log(`✅ Backup created. Total backups: ${files.length}`);
  console.log(`   Location: ${BACKUPS}`);
}

function cmdRestore() {
  console.log('♻️  Restoring from latest backup...\n');

  const files = readdirSync(BACKUPS).filter(f => f.endsWith('.json')).sort().reverse();
  if (files.length === 0) {
    console.log('No backups found.');
    return;
  }

  // Get latest timestamp
  const latestTimestamp = files[0].split('_')[0];
  const latestFiles = files.filter(f => f.startsWith(latestTimestamp));

  for (const file of latestFiles) {
    const dataFile = file.replace(`${latestTimestamp}_`, '');
    const src = join(BACKUPS, file);
    const dst = join(PUBLIC_DATA, dataFile);
    copyFileSync(src, dst);
    console.log(`  ✅ Restored ${dataFile}`);
  }

  console.log(`\n✅ Restored from backup: ${latestTimestamp}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────
const command = process.argv[2];

switch (command) {
  case 'scan': cmdScan(); break;
  case 'import': cmdImport(); break;
  case 'validate': cmdValidate(); break;
  case 'backup': cmdBackup(); break;
  case 'restore': cmdRestore(); break;
  default:
    console.log(`
Salaf Library Content Manager

Usage: node scripts/content.mjs <command>

Commands:
  scan      Scan import/books/inbox/ for PDFs, create drafts
  import    Import approved drafts to public/data/books.json
  validate  Validate all content JSON files
  backup    Create backup of all data files
  restore   Restore from latest backup
    `);
}
