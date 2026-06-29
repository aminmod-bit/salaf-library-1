export interface ExtractedPdfMetadata {
  title?: string;
  author?: string;
  category?: string;
  tags?: string[];
}

const AUTHOR_RULES: Array<[RegExp, string]> = [
  [/мухаммад\s+ибн\s+салих\s+(аль[-\s]?)?ус[еа]ймин|ус[еа]ймин/i, 'Шейх Мухаммад ибн Салих аль-Усаймин'],
  [/абд[уӯ]ль[-\s]?азиз\s+ибн\s+баз|ибн\s+баз/i, 'Шейх Абдуль-Азиз ибн Баз'],
  [/мухаммад\s+насир(уддин)?\s+(аль[-\s]?)?альбани|альбани/i, 'Шейх Мухаммад Насируддин аль-Альбани'],
  [/салих\s+(аль[-\s]?)?фаузан|фаузан/i, 'Шейх Салих аль-Фаузан'],
  [/мухаммад\s+салих\s+(аль[-\s]?)?мунаджид|мунаджид/i, 'Шейх Мухаммад Салих аль-Мунаджид'],
  [/ибн\s+тайм(и|е)я|шейхуль[-\s]?ислам/i, 'Шейхуль-Ислам Ибн Таймия'],
  [/ибн\s+(аль[-\s]?)?кайй?им/i, 'Имам Ибн аль-Каййим'],
  [/ан[-\s]?навави|навави/i, 'Имам ан-Навави'],
  [/аль[-\s]?аджурр/i, 'Имам аль-Аджурри'],
  [/абу\s+дауд/i, 'Имам Абу Дауд'],
  [/ахмад\s+ибн\s+ханбаль|ибн\s+ханбаль/i, 'Имам Ахмад ибн Ханбаль'],
  [/маджид\s+ибн\s+сулейман/i, 'Маджид ибн Сулейман'],
  [/абдуль[-\s]?азиз\s+(ар[-\s]?)?раджих/i, 'Шейх Абдуль-Азиз ар-Раджихи'],
];

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').replace(/[«»]/g, '').trim();
}

export function inferBookCategory(value: string) {
  const text = value.toLowerCase();
  if (/дуа|зикр|азкар|истигфар|мольб/.test(text)) return 'Дуа и зикр';
  if (/хадис|сунн|сорок|40|абу\s+дауд/.test(text)) return 'Хадисы';
  if (/коран|къуран|тафсир|сур[аы]|аят/.test(text)) return 'Коран';
  if (/таухид|акыд|акъид|вероубежд|ширк|ислам|мессия|богом|основ|правил/.test(text)) return 'Акыда';
  if (/намаз|молитв|пост|рамадан|закят|хадж|умра|фикх|омовен|тахарат|жертвопринош|банк|финансов/.test(text)) return 'Фикх';
  if (/сира|биограф|пророк|сподвиж|посланник/.test(text)) return 'Сира';
  if (/адаб|этикет|польз|настав|сердц|грех|зухд|хиджи/.test(text)) return 'Фаваиды';
  if (/араб|граммат|нахв|язык/.test(text)) return 'Арабский язык';
  return 'Общее';
}

export function inferBookTags(value: string, category: string, author?: string) {
  const text = `${value} ${category} ${author || ''}`.toLowerCase();
  const tags = new Set<string>([category.toLowerCase()]);
  for (const [needle, tag] of [
    ['таухид', 'таухид'], ['акыд', 'акыда'], ['дуа', 'дуа'], ['зикр', 'зикр'], ['хадис', 'хадисы'],
    ['рамадан', 'рамадан'], ['пост', 'пост'], ['коран', 'коран'], ['тафсир', 'тафсир'], ['намаз', 'намаз'],
    ['закят', 'закят'], ['усаймин', 'усаймин'], ['ибн баз', 'ибн баз'], ['альбани', 'альбани'],
    ['тайм', 'ибн таймия'], ['каййим', 'ибн аль-каййим'], ['женщ', 'женщины'], ['мессия', 'ислам и христианство'],
  ] as const) {
    if (text.includes(needle)) tags.add(tag);
  }
  return [...tags].slice(0, 8);
}

export function inferAuthorFromText(value: string) {
  const text = normalizeText(value);
  for (const [regex, author] of AUTHOR_RULES) {
    if (regex.test(text)) return author;
  }
  return undefined;
}

export function inferTitleFromText(value: string, fallback: string) {
  const lines = value
    .split(/\n|\r| {3,}/)
    .map(line => normalizeText(line))
    .filter(line => line.length >= 4 && line.length <= 90)
    .filter(line => !/^(перевод|собрал|издательство|www\.|https?:|да простит|глава|страница)$/i.test(line));

  const preferred = lines.find(line => /[а-яё]/i.test(line) && !/шейх|уважаемый|перевод|собрал/i.test(line));
  return preferred || fallback;
}

export function inferMetadataFromText(text: string, fallbackTitle: string): ExtractedPdfMetadata {
  const author = inferAuthorFromText(text);
  const title = inferTitleFromText(text, fallbackTitle);
  const category = inferBookCategory(`${title} ${author || ''} ${text.slice(0, 600)}`);
  return {
    title,
    author,
    category,
    tags: inferBookTags(title, category, author),
  };
}

export async function extractPdfTextFromFile(file: File, pages = 2) {
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

  return normalizeText(chunks.join('\n'));
}

export async function extractMetadataFromPdfFile(file: File, fallbackTitle: string): Promise<ExtractedPdfMetadata> {
  const text = await extractPdfTextFromFile(file, 2);
  return inferMetadataFromText(text, fallbackTitle);
}
