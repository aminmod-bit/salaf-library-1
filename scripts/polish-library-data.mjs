import fs from 'node:fs';
import crypto from 'node:crypto';

const booksFile = 'public/data/books.json';
const categoriesFile = 'public/data/categories.json';
const books = JSON.parse(fs.readFileSync(booksFile, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));

const colors = ['#1a3a2a', '#0f3d2e', '#123f2b', '#2a3a1a', '#1a3a3a', '#3a2a1a', '#1a2a3a', '#2a1a3a'];

function color(value) {
  const h = crypto.createHash('md5').update(String(value)).digest()[0];
  return colors[h % colors.length];
}

function category(title) {
  const value = title.toLowerCase();
  if (/дуа|зикр|мольб|истигфар/.test(value)) return 'Дуа и зикр';
  if (/хадис|сунн|сорок|40/.test(value)) return 'Хадисы';
  if (/коран|къуран|тафсир|сур[аы]|аят/.test(value)) return 'Коран';
  if (/таухид|акыд|акъид|основ|правил|ширк|вероубежд|ислам|вера|мессия|богом/.test(value)) return 'Акыда';
  if (/намаз|молитв|пост|рамадан|закят|хадж|умра|фикх|тахарат|омовен|нужд/.test(value)) return 'Фикх';
  if (/биограф|сира|пророк|сподвиж|сахаб|посланник/.test(value)) return 'Сира';
  if (/зуль|хидж|польз|настав|сердц|грех|нрав|адаб|этикет|зухд/.test(value)) return 'Фаваиды';
  if (/араб|граммат|язык|нахв/.test(value)) return 'Арабский язык';
  return 'Общее';
}

function tags(title, cat) {
  const value = title.toLowerCase();
  const out = new Set([cat.toLowerCase()]);
  for (const [needle, tag] of [
    ['таухид', 'таухид'], ['акыд', 'акыда'], ['дуа', 'дуа'], ['зикр', 'зикр'], ['хадис', 'хадисы'], ['рамадан', 'рамадан'], ['пост', 'пост'], ['коран', 'коран'], ['тафсир', 'тафсир'], ['намаз', 'намаз'], ['зуль', 'зуль-хиджа'], ['усаймин', 'усаймин'], ['ибн баз', 'ибн баз'], ['альбани', 'альбани'], ['фитр', 'закят'], ['женщин', 'женщины'],
  ]) if (value.includes(needle)) out.add(tag);
  return [...out].slice(0, 8);
}

function splitTitleAuthor(rawTitle, currentAuthor) {
  let title = String(rawTitle).replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  let author = currentAuthor && currentAuthor !== 'Автор не указан' ? currentAuthor : 'Автор не указан';

  const dash = title.split(/\s+—\s+|\s+-\s+/).map(x => x.trim()).filter(Boolean);
  if (dash.length >= 2) {
    title = dash.slice(0, -1).join(' — ');
    author = dash.at(-1);
  }

  const patterns = [
    [/\b(Шейх\s+аль\s+Мунаджид)$/i, 'Шейх аль-Мунаджид'],
    [/\b(аль\s+Мунаджид)$/i, 'Шейх аль-Мунаджид'],
    [/\b(Усаймин)$/i, 'Шейх Мухаммад ибн Салих аль-Усаймин'],
    [/\b(Ибн\s+Баз)$/i, 'Шейх Абдуль-Азиз ибн Баз'],
    [/\b(Альбани|аль\s+Альбани)$/i, 'Шейх Мухаммад Насируддин аль-Альбани'],
    [/\b(Фаузан|аль\s+Фаузан)$/i, 'Шейх Салих аль-Фаузан'],
    [/\b(Маджид\s+ибн\s+Сулейман)$/i, 'Маджид ибн Сулейман'],
    [/\b(АбдульАзиз\s+Раджихи|Абдуль-Азиз\s+Раджихи)$/i, 'Шейх Абдуль-Азиз ар-Раджихи'],
    [/\b(аль\s+Аджуррии?й?)$/i, 'Имам аль-Аджурри'],
  ];

  for (const [regex, name] of patterns) {
    if (regex.test(title)) {
      title = title.replace(regex, '').replace(/[,—\-\s]+$/g, '').trim();
      author = name;
      break;
    }
  }

  return { title: title || rawTitle, author };
}

let clean = books
  .filter(book => Boolean(book.fileUrl || book.downloadUrl))
  .map((book, index) => {
    const meta = splitTitleAuthor(book.title, book.author);
    const cat = category(`${meta.title} ${meta.author}`);
    const isFeatured = index < 12;
    const isPopular = index < 24;
    return {
      ...book,
      id: `b${String(index + 1).padStart(3, '0')}`,
      title: meta.title,
      author: meta.author,
      category: book.category && book.category !== 'Общее' ? book.category : cat,
      description: book.description && !book.description.includes('автоматически импортирована')
        ? book.description
        : `Электронная книга «${meta.title}» доступна для онлайн-чтения в Salaf Library. Материал добавлен в официальный каталог библиотеки.`,
      coverColor: book.coverColor || color(meta.title),
      coverEmoji: book.coverEmoji || '📖',
      tags: book.tags?.length ? book.tags : tags(meta.title, cat),
      featured: isFeatured,
      popular: isPopular,
      isNew: index >= Math.max(0, books.length - 20) || book.isNew,
      rating: book.rating || 5,
      views: book.views || 0,
      downloads: book.downloads || 0,
    };
  });

const countByCategory = clean.reduce((acc, book) => {
  acc[book.category] = (acc[book.category] || 0) + 1;
  return acc;
}, {});

const nextCategories = categories.map(cat => ({
  ...cat,
  count: countByCategory[cat.name] || 0,
}));

for (const name of Object.keys(countByCategory)) {
  if (!nextCategories.some(cat => cat.name === name)) {
    nextCategories.push({
      id: name.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-'),
      name,
      icon: name === 'Дуа и зикр' ? '🤲' : name === 'Общее' ? '📘' : '📖',
      color: '#1a3a2a',
      description: `Раздел «${name}»`,
      count: countByCategory[name],
      type: 'books',
    });
  }
}

fs.writeFileSync(booksFile, JSON.stringify(clean, null, 2) + '\n');
fs.writeFileSync(categoriesFile, JSON.stringify(nextCategories, null, 2) + '\n');
console.log(`Production catalog ready: ${clean.length} real books, demo removed.`);
