#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const root = process.cwd();
const args = process.argv.slice(2);
const sourceUrl = args.find((arg) => !arg.startsWith('--')) || 'https://github.com/aminmod-bit/salaf-library/tree/main/books';
const modeArg = args.find((arg) => arg.startsWith('--mode='));
const mode = modeArg ? modeArg.split('=')[1] : 'link';

const dataFile = path.join(root, 'public', 'data', 'books.json');
const publicBooksDir = path.join(root, 'public', 'books');

fs.mkdirSync(path.dirname(dataFile), { recursive: true });
fs.mkdirSync(publicBooksDir, { recursive: true });

function parseGithubUrl(url) {
  const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/);
  if (!match) {
    throw new Error('Use GitHub folder URL like: https://github.com/owner/repo/tree/branch/books');
  }
  const [, owner, repo, branch, folder] = match;
  return { owner, repo, branch, folder };
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'salaf-library-importer' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        requestJson(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`GitHub API error ${res.statusCode}: ${url}`));
        res.resume();
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, target) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(target);
    https.get(encodeURI(url), { headers: { 'User-Agent': 'salaf-library-importer' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.rmSync(target, { force: true });
        downloadFile(res.headers.location, target).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.rmSync(target, { force: true });
        reject(new Error(`Download failed ${res.statusCode}: ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (error) => {
      file.close();
      fs.rmSync(target, { force: true });
      reject(error);
    });
  });
}

function readJson(file, fallback = []) {
  if (!fs.existsSync(file)) return fallback;
  const raw = fs.readFileSync(file, 'utf8').trim();
  return raw ? JSON.parse(raw) : fallback;
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function slugify(value) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return String(value || 'book')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => map[ch] || ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'book';
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

function nextId(items, prefix = 'b') {
  const max = items.reduce((acc, item) => {
    const id = String(item.id || '');
    if (!id.startsWith(prefix)) return acc;
    const num = Number(id.slice(prefix.length).replace(/^0+/, '') || '0');
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

function cleanTitle(filename) {
  return path.basename(filename, path.extname(filename))
    .normalize('NFC')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+—\s+/g, ' — ')
    .trim();
}

function splitTitleAuthor(title) {
  const parts = title.split(/\s+—\s+|\s+-\s+/).map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { title: parts.slice(0, -1).join(' — '), author: parts.at(-1) };
  }
  const authorMatch = title.match(/(.+?)[,\s]+(Усаймин|Ибн Баз|аль[-\s]Альбани|аль[-\s]Фаузан|аль[-\s]Мунаджид|Маджид ибн Сулейман|ан[-\s]Навави|аль[-\s]Аджуррии?й?)$/i);
  if (authorMatch) return { title: authorMatch[1].trim(), author: authorMatch[2].trim() };
  return { title, author: 'Автор не указан' };
}

function detectCategory(title) {
  const value = title.toLowerCase();
  if (/дуа|зикр|мольб/.test(value)) return 'Дуа и зикр';
  if (/хадис|сунн/.test(value)) return 'Хадисы';
  if (/коран|къуран|тафсир|сур[аы]/.test(value)) return 'Коран';
  if (/таухид|акыд|акъид|основ|правил|ширк|ислам/.test(value)) return 'Акыда';
  if (/намаз|пост|рамадан|закят|хадж|умра|фикх|тахарат|омовен/.test(value)) return 'Фикх';
  if (/биограф|сира|пророк|сподвиж|сахаб/.test(value)) return 'Сира';
  if (/зуль|хидж|польз|настав|сердц|грех|нрав|адаб/.test(value)) return 'Фаваиды';
  if (/араб|граммат|язык/.test(value)) return 'Арабский язык';
  return 'Общее';
}

function detectTags(title, category) {
  const tags = new Set([category.toLowerCase()]);
  const value = title.toLowerCase();
  for (const [word, tag] of [
    ['таухид', 'таухид'], ['акыд', 'акыда'], ['дуа', 'дуа'], ['хадис', 'хадисы'],
    ['рамадан', 'рамадан'], ['пост', 'пост'], ['коран', 'коран'], ['намаз', 'намаз'],
    ['зуль', 'зуль-хиджа'], ['усаймин', 'усаймин'], ['ибн баз', 'ибн баз'], ['альбани', 'альбани'],
  ]) {
    if (value.includes(word)) tags.add(tag);
  }
  return [...tags].slice(0, 8);
}

function fileSizeMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} МБ`;
}

async function main() {
  if (!['link', 'download'].includes(mode)) {
    throw new Error('Mode must be --mode=link or --mode=download');
  }

  const { owner, repo, branch, folder } = parseGithubUrl(sourceUrl);
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(folder)}?ref=${encodeURIComponent(branch)}`;
  const contents = await requestJson(apiUrl);
  if (!Array.isArray(contents)) throw new Error('GitHub folder response is not an array');

  const pdfs = contents.filter((item) => item.type === 'file' && item.name.toLowerCase().endsWith('.pdf'));
  const books = readJson(dataFile, []);
  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of pdfs) {
    const rawUrl = encodeURI(file.download_url);
    const existsIndex = books.findIndex((book) => book.fileUrl === rawUrl || book.downloadUrl === rawUrl || book.externalSource === file.html_url);

    const clean = cleanTitle(file.name);
    const { title, author } = splitTitleAuthor(clean);
    const category = detectCategory(clean);
    const id = existsIndex >= 0 ? books[existsIndex].id : nextId(books, 'b');

    let fileUrl = rawUrl;
    let downloadUrl = rawUrl;

    if (mode === 'download') {
      const targetName = uniqueFileName(publicBooksDir, slugify(title), '.pdf');
      const target = path.join(publicBooksDir, targetName);
      await downloadFile(file.download_url, target);
      fileUrl = `./books/${targetName}`;
      downloadUrl = fileUrl;
    }

    const item = {
      id,
      title,
      author,
      category,
      language: 'Русский',
      size: fileSizeMb(file.size),
      description: `Книга «${title}» автоматически импортирована из репозитория ${owner}/${repo}.`,
      coverColor: '#1a3a2a',
      coverEmoji: '📖',
      tags: detectTags(clean, category),
      fileUrl,
      downloadUrl,
      year: '2026',
      rating: 5,
      downloads: 0,
      views: 0,
      featured: false,
      popular: false,
      isNew: true,
      externalSource: file.html_url,
    };

    if (existsIndex >= 0) {
      books[existsIndex] = { ...books[existsIndex], ...item };
      updated += 1;
    } else {
      books.push(item);
      added += 1;
    }
  }

  writeJson(dataFile, books);
  console.log(`GitHub books import finished from ${owner}/${repo}/${folder}`);
  console.log(`Mode: ${mode}`);
  console.log(`PDF found: ${pdfs.length}`);
  console.log(`Added: ${added}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log('Next: npm run build');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
