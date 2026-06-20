import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://salaflibrary.org';
const root = process.cwd();
const publicDir = path.join(root, 'public');
const booksFile = path.join(publicDir, 'data', 'books.json');
const catalogDir = path.join(publicDir, 'catalog');
const bookPagesDir = path.join(catalogDir, 'books');
const today = new Date().toISOString().slice(0, 10);

const books = JSON.parse(fs.readFileSync(booksFile, 'utf8'));
fs.mkdirSync(bookPagesDir, { recursive: true });

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function absolute(url = '') {
  if (!url) return '';
  try { return new URL(url, SITE_URL + '/').toString(); } catch { return url; }
}

function pageShell({ title, description, canonical, body, jsonLd }) {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="Salaf Library" />
  <meta name="twitter:card" content="summary" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    :root{color-scheme:dark;--bg:#07130b;--card:#112a1a;--gold:#d4af37;--text:#f0f4f1;--muted:#9db8a3;--border:rgba(212,175,55,.18)}
    *{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;background:radial-gradient(circle at 20% 0%,rgba(34,197,94,.08),transparent 30rem),linear-gradient(180deg,#0a1a0f,#07130b);color:var(--text);line-height:1.6}
    .wrap{max-width:1180px;margin:0 auto;padding:32px 20px 56px}.hero,.card{background:linear-gradient(180deg,rgba(17,42,26,.94),rgba(7,19,11,.92));border:1px solid var(--border);border-radius:20px;box-shadow:0 20px 70px rgba(0,0,0,.35)}
    .hero{padding:34px;margin-bottom:24px}.brand{color:var(--gold);font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px}.h1{font-size:clamp(30px,5vw,54px);line-height:1.08;margin:10px 0}.lead{color:var(--muted);max-width:760px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}.card{padding:18px;text-decoration:none;color:inherit;display:block}.card:hover{border-color:rgba(212,175,55,.45)}.meta{color:var(--muted);font-size:13px}.tag{display:inline-block;margin-top:10px;padding:3px 10px;border:1px solid var(--border);border-radius:999px;color:var(--gold);font-size:12px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:12px;text-decoration:none;font-weight:800}.primary{background:linear-gradient(135deg,#d4af37,#f0c84a);color:#07130b}.ghost{border:1px solid var(--border);color:var(--text)}
  </style>
</head>
<body><main class="wrap">${body}</main></body>
</html>`;
}

const catalogBody = `
<section class="hero">
  <div class="brand">Salaf Library</div>
  <h1 class="h1">Каталог исламских книг</h1>
  <p class="lead">Официальный каталог Salaf Library: ${books.length} электронных книг для онлайн-чтения. Акыда, фикх, хадисы, Коран, дуа, фаваиды и другие разделы.</p>
  <div class="actions"><a class="btn primary" href="${SITE_URL}/#/books">Открыть приложение</a><a class="btn ghost" href="${SITE_URL}/#/search">Поиск по библиотеке</a></div>
</section>
<section class="grid">
${books.map(book => `<a class="card" href="${SITE_URL}/catalog/books/${book.id}.html"><strong>${escapeHtml(book.title)}</strong><div class="meta">${escapeHtml(book.author || 'Автор не указан')} · ${escapeHtml(book.category || 'Общее')}</div><span class="tag">${escapeHtml(book.category || 'Книга')}</span></a>`).join('\n')}
</section>`;

fs.writeFileSync(path.join(catalogDir, 'index.html'), pageShell({
  title: 'Каталог исламских книг — Salaf Library',
  description: `Онлайн-каталог Salaf Library: ${books.length} исламских книг для чтения.`,
  canonical: `${SITE_URL}/catalog/`,
  body: catalogBody,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Каталог исламских книг — Salaf Library',
    url: `${SITE_URL}/catalog/`,
    hasPart: books.slice(0, 50).map(book => ({ '@type': 'Book', name: book.title, author: book.author })),
  },
}));

for (const book of books) {
  const canonical = `${SITE_URL}/catalog/books/${book.id}.html`;
  const readUrl = `${SITE_URL}/#/read/${book.id}`;
  const detailUrl = `${SITE_URL}/#/books/${book.id}`;
  const pdfUrl = absolute(book.fileUrl || book.downloadUrl || '');
  const description = book.description || `Книга «${book.title}» доступна для онлайн-чтения в Salaf Library.`;
  const body = `
<section class="hero">
  <div class="brand">Salaf Library · ${escapeHtml(book.category || 'Книга')}</div>
  <h1 class="h1">${escapeHtml(book.title)}</h1>
  <p class="lead"><strong>${escapeHtml(book.author || 'Автор не указан')}</strong></p>
  <p class="lead">${escapeHtml(description)}</p>
  <div class="actions">
    <a class="btn primary" href="${readUrl}">Читать онлайн</a>
    <a class="btn ghost" href="${detailUrl}">Открыть в приложении</a>
    ${pdfUrl ? `<a class="btn ghost" href="${pdfUrl}">PDF файл</a>` : ''}
    <a class="btn ghost" href="${SITE_URL}/catalog/">Все книги</a>
  </div>
</section>
<section class="card">
  <h2>Описание</h2>
  <p>${escapeHtml(description)}</p>
  <p class="meta">Категория: ${escapeHtml(book.category || 'Общее')} · Язык: ${escapeHtml(book.language || 'Русский')} · Размер: ${escapeHtml(book.size || '—')}</p>
</section>`;

  fs.writeFileSync(path.join(bookPagesDir, `${book.id}.html`), pageShell({
    title: `${book.title} — читать онлайн | Salaf Library`,
    description,
    canonical,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: book.title,
      author: { '@type': 'Person', name: book.author || 'Автор не указан' },
      inLanguage: book.language || 'ru',
      genre: book.category || 'Исламская литература',
      description,
      url: canonical,
      encoding: pdfUrl ? { '@type': 'MediaObject', contentUrl: pdfUrl, encodingFormat: 'application/pdf' } : undefined,
    },
  }));
}

const sitemapUrls = [
  { loc: `${SITE_URL}/`, priority: '1.0' },
  { loc: `${SITE_URL}/catalog/`, priority: '0.95' },
  ...books.map(book => ({ loc: `${SITE_URL}/catalog/books/${book.id}.html`, priority: '0.80' })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(({ loc, priority }) => `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Salaf Library</title><link>${SITE_URL}/</link><description>Новые книги Salaf Library</description>
${books.slice(0, 30).map(book => `<item><title>${escapeHtml(book.title)}</title><link>${SITE_URL}/catalog/books/${book.id}.html</link><guid>${SITE_URL}/catalog/books/${book.id}.html</guid><description>${escapeHtml(book.description || '')}</description></item>`).join('\n')}
</channel></rss>
`;
fs.writeFileSync(path.join(publicDir, 'rss.xml'), rss);

fs.writeFileSync(path.join(publicDir, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);

console.log(`SEO generated: ${books.length} book pages, sitemap.xml, rss.xml`);
