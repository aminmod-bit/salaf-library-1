export interface ExtractedPdfMetadata {
  title?: string;
  originalTitle?: string;
  author?: string;
  authorId?: string;
  category?: string;
  categoryConfidence: number;
  needsReview: boolean;
  tags?: string[];
  language?: string;
  pages?: number;
  size?: string;
  createdAt?: string;
  isbn?: string;
  publisher?: string;
  translator?: string;
  editor?: string;
  outlineTitles?: string[];
  textSample?: string;
}

const AUTHOR_RULES: Array<[RegExp, string]> = [
  [/мухаммад\s+ибн\s+салих\s+(аль[-\s]?)?ус[еа]ймин|ус[еа]ймин|uthaymeen|useymin/i, 'Шейх Мухаммад ибн Салих аль-Усаймин'],
  [/абд[уӯ]ль[-\s]?азиз\s+ибн\s+баз|ибн\s+баз|ibn\s*baz/i, 'Шейх Абдуль-Азиз ибн Баз'],
  [/мухаммад\s+насир(уддин)?\s+(аль[-\s]?)?альбани|альбани|albani/i, 'Шейх Мухаммад Насируддин аль-Альбани'],
  [/салих\s+(аль[-\s]?)?фаузан|фаузан|fawzan/i, 'Шейх Салих аль-Фаузан'],
  [/мухаммад\s+салих\s+(аль[-\s]?)?мунаджид|мунаджид|munajjid/i, 'Шейх Мухаммад Салих аль-Мунаджид'],
  [/ибн\s+тайм(и|е)я|шейхуль[-\s]?ислам|taym/i, 'Шейхуль-Ислам Ибн Таймия'],
  [/ибн\s+(аль[-\s]?)?кайй?им|qayyim/i, 'Имам Ибн аль-Каййим'],
  [/ан[-\s]?навави|навави|nawawi/i, 'Имам ан-Навави'],
  [/аль[-\s]?аджурр|ajur/i, 'Имам аль-Аджурри'],
  [/абу\s+дауд|abu\s*dawud|daud/i, 'Имам Абу Дауд'],
  [/ахмад\s+ибн\s+ханбаль|ибн\s+ханбаль/i, 'Имам Ахмад ибн Ханбаль'],
  [/маджид\s+ибн\s+сулейман/i, 'Маджид ибн Сулейман'],
  [/абдуль[-\s]?азиз\s+(ар[-\s]?)?раджих|раджих/i, 'Шейх Абдуль-Азиз ар-Раджихи'],
];

const CATEGORY_RULES: Array<{ category: string; weight: number; patterns: RegExp[] }> = [
  { category: 'Таухид', weight: 26, patterns: [/таухид|единобож|kitab\s*at[-\s]?tawhid|tawhid/i] },
  { category: 'Акыда', weight: 24, patterns: [/акыд|акъид|вероубежд|убежден|ширк|иман|исламская вера|три основы|усул|wasit/i] },
  { category: 'Манхадж', weight: 22, patterns: [/манхадж|методолог|саляф|ахлю[-\s]?сунна|нововвед|бид'?а/i] },
  { category: 'Тафсир', weight: 22, patterns: [/тафсир|толкован|сура|аят|коран|қуръан|quran|tafsir/i] },
  { category: 'Хадисы', weight: 22, patterns: [/хадис|сунн|бухари|муслим|тирмизи|нас[ао]и|ибн\s+мадж|абу\s+дауд|riyad|nawawi|hadith/i] },
  { category: 'Фикх', weight: 20, patterns: [/фикх|намаз|молитв|пост|рамадан|закят|хадж|умра|омовен|тахарат|хукм|фетв|поклонен|fiqh/i] },
  { category: 'Сира', weight: 18, patterns: [/сира|пророк|мухаммад ﷺ|биография пророка|посланник|мекка|медина|seerah/i] },
  { category: 'Азкары', weight: 18, patterns: [/азкар|зикр|поминан|утренн|вечерн|adhkar|azkar/i] },
  { category: 'Дуа', weight: 18, patterns: [/дуа|мольб|истигфар|dua|du'a/i] },
  { category: 'Биографии', weight: 16, patterns: [/биограф|тарджума|жизнь ученого|ученого|имам|шейх|biography/i] },
  { category: 'История', weight: 15, patterns: [/истор|халиф|династ|завоев|history/i] },
  { category: 'Арабский язык', weight: 15, patterns: [/арабск|нахв|сарф|граммат|луғат|arabic/i] },
  { category: 'Воспитание', weight: 14, patterns: [/воспитан|дет|семь|нрав|адаб|этикет|tarbiyah/i] },
  { category: 'Даава', weight: 14, patterns: [/даав|дауа|призыв|dawah|da'wah/i] },
];

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').replace(/[«»]/g, '').trim();
}

function cleanFileTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function fileSizeMb(file: File) {
  return `${(file.size / 1024 / 1024).toFixed(file.size < 10 * 1024 * 1024 ? 1 : 0)} МБ`;
}

export function inferBookCategoryDetailed(value: string) {
  const text = value.toLowerCase();
  const scores = new Map<string, number>();
  for (const rule of CATEGORY_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) scores.set(rule.category, (scores.get(rule.category) || 0) + rule.weight);
    }
  }
  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const [category = 'Другое', score = 0] = sorted[0] || [];
  const confidence = Math.min(99, Math.round(score));
  return { category, confidence, needsReview: confidence < 28 };
}

export function inferBookCategory(value: string) {
  return inferBookCategoryDetailed(value).category;
}

export function inferBookTags(value: string, category: string, author?: string) {
  const text = `${value} ${category} ${author || ''}`.toLowerCase();
  const tags = new Set<string>([category.toLowerCase()]);
  for (const [needle, tag] of [
    ['таухид', 'таухид'], ['акыд', 'акыда'], ['манхадж', 'манхадж'], ['дуа', 'дуа'], ['зикр', 'зикр'], ['хадис', 'хадисы'],
    ['рамадан', 'рамадан'], ['пост', 'пост'], ['коран', 'коран'], ['тафсир', 'тафсир'], ['намаз', 'намаз'], ['закят', 'закят'],
    ['усаймин', 'усаймин'], ['ибн баз', 'ибн баз'], ['альбани', 'альбани'], ['тайм', 'ибн таймия'], ['каййим', 'ибн аль-каййим'],
    ['женщ', 'женщины'], ['мессия', 'ислам и христианство'], ['араб', 'арабский язык'], ['сира', 'сира']
  ] as const) {
    if (text.includes(needle)) tags.add(tag);
  }
  return [...tags].slice(0, 10);
}

export function inferAuthorFromText(value: string, knownAuthors: string[] = []) {
  const text = normalizeText(value);
  for (const author of knownAuthors) {
    if (author && text.toLowerCase().includes(author.toLowerCase())) return author;
  }
  for (const [regex, author] of AUTHOR_RULES) {
    if (regex.test(text)) return author;
  }
  const authorLine = text.match(/(?:автор|шейх|имам|подготовил|составил)\s*[:\-–—]?\s*([А-ЯЁA-Z][^\n\.]{4,80})/i);
  return authorLine?.[1]?.trim();
}

export function inferLanguageFromText(text: string, fileName = '') {
  const sample = `${fileName} ${text.slice(0, 1500)}`;
  const cyr = (sample.match(/[а-яё]/gi) || []).length;
  const arab = (sample.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (sample.match(/[a-z]/gi) || []).length;
  if (/tojik|tajik|тоҷик/i.test(sample)) return 'Таджикский';
  if (/o‘zbek|uzbek|узбек/i.test(sample)) return 'Узбекский';
  if (/فارسی|farsi|persian/i.test(sample)) return 'Персидский';
  if (arab > cyr * 2 && arab > latin) return 'Арабский';
  if (latin > cyr * 2 && latin > arab) return 'Английский';
  return 'Русский';
}

export function inferTitleFromText(value: string, fallback: string) {
  const lines = value
    .split(/\n|\r| {3,}/)
    .map(line => normalizeText(line))
    .filter(line => line.length >= 4 && line.length <= 100)
    .filter(line => !/^(перевод|собрал|издательство|www\.|https?:|да простит|глава|страница|page|copyright)$/i.test(line));
  const preferred = lines.find(line => /[а-яё]/i.test(line) && !/шейх|уважаемый|перевод|собрал|подготовил/i.test(line));
  return preferred || fallback;
}

function extractOriginalTitle(text: string) {
  const arabicLines = text
    .split(/\n|\r| {3,}/)
    .map(line => normalizeText(line))
    .filter(line => /[\u0600-\u06FF]/.test(line) && line.length >= 3 && line.length <= 90);
  return arabicLines[0];
}

function matchField(text: string, regex: RegExp) {
  return text.match(regex)?.[1]?.trim();
}

export function inferMetadataFromText(text: string, fallbackTitle: string, knownAuthors: string[] = []): ExtractedPdfMetadata {
  const normalized = normalizeText(text);
  const author = inferAuthorFromText(normalized, knownAuthors);
  const title = inferTitleFromText(normalized, fallbackTitle);
  const originalTitle = extractOriginalTitle(text);
  const categoryResult = inferBookCategoryDetailed(`${title} ${originalTitle || ''} ${author || ''} ${normalized.slice(0, 2500)}`);
  const language = inferLanguageFromText(normalized, fallbackTitle);
  const isbn = matchField(normalized, /ISBN(?:-1[03])?\s*[:：]?\s*([0-9Xx\-\s]{10,20})/i);
  const publisher = matchField(normalized, /(?:издательство|издатель|publisher)\s*[:：]?\s*([^\.\n]{3,80})/i);
  const translator = matchField(normalized, /(?:перевод|переводчик|translated by)\s*[:：]?\s*([^\.\n]{3,80})/i);
  const editor = matchField(normalized, /(?:редактор|под редакцией|editor)\s*[:：]?\s*([^\.\n]{3,80})/i);
  return {
    title,
    originalTitle,
    author,
    category: categoryResult.category,
    categoryConfidence: categoryResult.confidence,
    needsReview: categoryResult.needsReview || !author,
    tags: inferBookTags(`${title} ${normalized.slice(0, 500)}`, categoryResult.category, author),
    language,
    isbn,
    publisher,
    translator,
    editor,
    textSample: normalized.slice(0, 1200),
  };
}

export async function extractPdfTextAndInfoFromFile(file: File, pages = 4) {
  const [{ GlobalWorkerOptions, getDocument }, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.mjs?url'),
  ]);
  GlobalWorkerOptions.workerSrc = worker.default;
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await getDocument({ data }).promise;
  const chunks: string[] = [];
  for (let pageNumber = 1; pageNumber <= Math.min(pages, doc.numPages); pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    chunks.push(content.items.map((item: any) => item.str || '').join(' '));
  }
  let info: any = {};
  try {
    const metadata = await doc.getMetadata();
    info = metadata.info || {};
  } catch { /* ignore */ }
  let outlineTitles: string[] = [];
  try {
    const outline = await doc.getOutline();
    outlineTitles = (outline || []).map((item: any) => String(item.title || '')).filter(Boolean).slice(0, 30);
  } catch { /* ignore */ }
  return { text: chunks.join('\n'), pages: doc.numPages, info, outlineTitles };
}

export async function renderPdfFirstPageImages(file: File) {
  const [{ GlobalWorkerOptions, getDocument }, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.mjs?url'),
  ]);
  GlobalWorkerOptions.workerSrc = worker.default;
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await getDocument({ data }).promise;
  const page = await doc.getPage(1);

  async function render(width: number, quality: number) {
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: width / base.width });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('cover blob failed')), 'image/webp', quality));
    return blob;
  }

  return {
    cover: await render(640, 0.86),
    thumb: await render(220, 0.78),
  };
}

export async function extractMetadataFromPdfFile(file: File, fallbackTitle: string, knownAuthors: string[] = []): Promise<ExtractedPdfMetadata> {
  const { text, pages, info, outlineTitles } = await extractPdfTextAndInfoFromFile(file, 4);
  const meta = inferMetadataFromText(`${info?.Title || ''}\n${info?.Author || ''}\n${outlineTitles.join('\n')}\n${text}`, fallbackTitle, knownAuthors);
  return {
    ...meta,
    title: info?.Title && String(info.Title).length > 3 ? String(info.Title) : meta.title,
    author: meta.author || (info?.Author ? String(info.Author) : undefined),
    pages,
    size: fileSizeMb(file),
    createdAt: info?.CreationDate ? String(info.CreationDate) : undefined,
    outlineTitles,
  };
}
