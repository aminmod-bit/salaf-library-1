#!/usr/bin/env node
/**
 * Download PDFs from GitHub into public/books/
 * Usage: node scripts/download-github-books.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_BOOKS = join(ROOT, 'public', 'books');
const BOOKS_JSON = join(ROOT, 'public', 'data', 'books.json');

async function downloadFile(url, dest) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(dest, buffer);
  return buffer.length;
}

function slugify(text) {
  const CYRILLIC_MAP = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
  return text.toLowerCase().replace(/[а-яё]/g, c => CYRILLIC_MAP[c] || c).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  if (!existsSync(BOOKS_JSON)) {
    console.error('❌ books.json not found');
    process.exit(1);
  }

  const books = JSON.parse(readFileSync(BOOKS_JSON, 'utf8'));
  const githubBooks = books.filter(b => b.fileUrl && b.fileUrl.includes('raw.githubusercontent.com'));

  console.log(`📚 Found ${githubBooks.length} books with GitHub URLs\n`);
  mkdirSync(PUBLIC_BOOKS, { recursive: true });

  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  for (const book of githubBooks) {
    const filename = `${slugify(book.title)}.pdf`;
    const dest = join(PUBLIC_BOOKS, filename);

    if (existsSync(dest)) {
      skipped++;
      continue;
    }

    process.stdout.write(`  ⬇️  ${book.title}...`);
    try {
      const size = await downloadFile(book.fileUrl, dest);
      book.fileUrl = `./books/${filename}`;
      book.downloadUrl = `./books/${filename}`;
      downloaded++;
      console.log(` ${(size / 1024 / 1024).toFixed(1)} MB`);
    } catch (e) {
      failed++;
      console.log(` ❌ ${e.message}`);
    }
  }

  // Update books.json with local paths
  if (downloaded > 0) {
    writeFileSync(BOOKS_JSON, JSON.stringify(books, null, 2) + '\n');
    console.log(`\n✅ Updated books.json with local paths`);
  }

  console.log(`\n📊 Results:`);
  console.log(`   Downloaded: ${downloaded}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Skipped (already exist): ${skipped}`);
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
