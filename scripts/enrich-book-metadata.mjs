import fs from 'node:fs';

const file = 'public/data/books.json';
const books = JSON.parse(fs.readFileSync(file, 'utf8'));

const authors = [
  [/усаймин|uthaymeen|useymin/i, 'Шейх Мухаммад ибн Салих аль-Усаймин'],
  [/ибн\s*баз|ibn\s*baz/i, 'Шейх Абдуль-Азиз ибн Баз'],
  [/альбани|albani/i, 'Шейх Мухаммад Насируддин аль-Альбани'],
  [/фауза[нн]|fawzan/i, 'Шейх Салих аль-Фаузан'],
  [/мунаджид|munajjid/i, 'Шейх Мухаммад Салих аль-Мунаджид'],
  [/ибн\s*тайм|теймий|taym/i, 'Шейхуль-Ислам Ибн Таймия'],
  [/ибн\s*кай|каййим|qayyim/i, 'Имам Ибн аль-Каййим'],
  [/навави|nawawi/i, 'Имам ан-Навави'],
  [/аджурр|ajur/i, 'Имам аль-Аджурри'],
  [/маджид\s*ибн\s*сулейман/i, 'Маджид ибн Сулейман'],
  [/абдуль.?азиз\s*раджих/i, 'Шейх Абдуль-Азиз ар-Раджихи'],
  [/абу\s*дауд|daud/i, 'Имам Абу Дауд'],
  [/ахмад\s*ибн\s*ханбаль|ханбаль/i, 'Имам Ахмад ибн Ханбаль'],
];

function cleanTitle(title, author) {
  let t = title.replace(/_/g, ' ').replace(/\\-/g, '-').replace(/\\\+/g, '+').replace(/\s+/g, ' ').trim();
  for (const [rx, name] of authors) {
    if (name === author) t = t.replace(rx, '').replace(/[—\-,\s]+$/g, '').trim();
  }
  return t || title;
}
function detectAuthor(book) {
  if (book.author && book.author !== 'Автор не указан') return book.author;
  const source = `${book.title} ${book.fileUrl || ''}`;
  for (const [rx, name] of authors) if (rx.test(source)) return name;
  return book.author || 'Автор не указан';
}
function category(title) {
  const v = title.toLowerCase();
  if (/дуа|зикр|азкар|истигфар/.test(v)) return 'Дуа и зикр';
  if (/хадис|сунн|сорок|40|абу дауд/.test(v)) return 'Хадисы';
  if (/коран|тафсир|сур[аы]|аят|къуран/.test(v)) return 'Коран';
  if (/таухид|акыд|вероубежд|ширк|ислам|мессия|богом|основ|правил/.test(v)) return 'Акыда';
  if (/намаз|молитв|пост|рамадан|закят|хадж|фикх|омовен|тахарат|жертвопринош|финансов|банк/.test(v)) return 'Фикх';
  if (/сира|биограф|пророк|сподвиж|посланник/.test(v)) return 'Сира';
  if (/адаб|этикет|польз|настав|сердц|грех|зухд|хиджи/.test(v)) return 'Фаваиды';
  if (/араб|граммат|нахв|язык/.test(v)) return 'Арабский язык';
  return 'Общее';
}
function tags(title, cat, author) {
  const v = `${title} ${cat} ${author}`.toLowerCase();
  const out = new Set([cat.toLowerCase()]);
  for (const [n,t] of [['таухид','таухид'],['акыд','акыда'],['дуа','дуа'],['зикр','зикр'],['хадис','хадисы'],['рамадан','рамадан'],['пост','пост'],['коран','коран'],['тафсир','тафсир'],['намаз','намаз'],['закят','закят'],['усаймин','усаймин'],['ибн баз','ибн баз'],['альбани','альбани'],['тайм','ибн таймия'],['каййим','ибн аль-каййим']]) if(v.includes(n)) out.add(t);
  return [...out].slice(0,8);
}

let changed = 0;
for (const book of books) {
  const old = JSON.stringify(book);
  const author = detectAuthor(book);
  const title = cleanTitle(book.title, author);
  const cat = book.category === 'Общее' ? category(`${title} ${author}`) : book.category;
  book.author = author;
  book.title = title;
  book.category = cat;
  book.tags = tags(title, cat, author);
  if (!book.description || book.description.includes('доступна для онлайн-чтения')) {
    book.description = `Книга «${title}» доступна для онлайн-чтения в Salaf Library. ${author !== 'Автор не указан' ? `Автор: ${author}. ` : ''}Раздел: ${cat}.`;
  }
  if (JSON.stringify(book) !== old) changed++;
}
fs.writeFileSync(file, JSON.stringify(books, null, 2) + '\n');
console.log(`Metadata enriched: ${changed} books updated`);
