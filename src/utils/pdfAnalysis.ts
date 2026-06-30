import * as pdfjsLib from 'pdfjs-dist';

export interface PdfMetadata {
  title: string;
  author: string;
  publisher: string;
  subject: string;
  keywords: string[];
}

export interface PdfAnalysis {
  metadata: PdfMetadata;
  textPages: string[];
  suggestedTitle: string;
  suggestedAuthor: string;
  suggestedPublisher: string;
  suggestedCategory: string;
  suggestedLanguage: string;
  suggestedTags: string[];
  confidence: number;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Акыда': ['акыда', 'aqeedah', 'акида', 'таухид', 'tawhid', 'иман', 'вероучение'],
  'Хадисы': ['хадис', 'hadith', 'сахих', 'sahih', 'сунан', 'sunan', 'бухари', 'муслим'],
  'Фикх': ['фикх', 'fiqh', 'намаз', 'salat', 'пост', 'ramadan', 'закят', 'хадж'],
  'Дуа и зикр': ['дуа', 'dua', 'azkar', 'adhkar', 'zikr', 'зикр', 'азкар'],
  'Сира': ['сира', 'seerah', 'пророк', 'prophet', 'мухаммад'],
  'Арабский язык': ['arabic', 'арабский', 'nahw', 'sarf'],
  'Тафсир': ['тафсир', 'tafsir', 'толкование', 'коран', 'quran'],
  'Манхадж': ['манхадж', 'manhaj', 'методология', 'сунна', 'sunnah'],
  'Фаваиды': ['fawaid', 'польза', 'мудрость'],
  'Биографии': ['биография', 'biography', 'учёный', 'имам'],
  'Воспитание': ['воспит', 'адаб', 'нравствен'],
  'История': ['истори', 'история', 'халифат'],
  'Даава': ['даава', 'призыв', 'dawah'],
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return 'Общее';
}

function detectLanguage(text: string): string {
  const lower = text.toLowerCase();
  if (/араб|arab|العربية/.test(lower)) return 'العربية';
  if (/таджик|тоҷик|tajik/.test(lower)) return 'Тоҷикӣ';
  if (/англ|english|eng/.test(lower)) return 'English';
  const cyrillicCount = (text.match(/[а-яёА-ЯЁ]/g) || []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;
  if (cyrillicCount > latinCount) return 'Русский';
  return 'English';
}

function detectTags(text: string, category: string): string[] {
  const tags: string[] = [];
  const lower = text.toLowerCase();
  if (category !== 'Общее') tags.push(category.toLowerCase());
  const keywords = ['таухид', 'акыда', 'хадис', 'фикх', 'сира', 'коран', 'дуа', 'азкар', 'сунна', 'намаз', 'пост', 'рамадан'];
  for (const kw of keywords) {
    if (lower.includes(kw)) tags.push(kw);
  }
  return [...new Set(tags)];
}

function isPageBlank(text: string): boolean {
  const cleaned = text.replace(/\s+/g, '').trim();
  return cleaned.length < 20;
}

export async function analyzePdf(url: string): Promise<PdfAnalysis> {
  const doc = await pdfjsLib.getDocument({ url, withCredentials: false }).promise;

  // Get metadata
  let metadata: PdfMetadata = { title: '', author: '', publisher: '', subject: '', keywords: [] };
  try {
    const meta = await doc.getMetadata();
    const info = meta.info as any;
    metadata = {
      title: info?.Title || '',
      author: info?.Author || '',
      publisher: info?.Producer || info?.Creator || '',
      subject: info?.Subject || '',
      keywords: info?.Keywords || [],
    };
  } catch {}

  // Get text from first 2 pages
  const textPages: string[] = [];
  const pagesToRead = Math.min(2, doc.numPages);
  for (let i = 1; i <= pagesToRead; i++) {
    try {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str || '').join(' ');
      textPages.push(text);
    } catch {
      textPages.push('');
    }
  }

  const combinedText = textPages.join(' ');
  const allText = metadata.title + ' ' + metadata.author + ' ' + combinedText;

  // Determine suggestions
  let suggestedTitle = metadata.title || '';
  let suggestedAuthor = metadata.author || '';
  let suggestedPublisher = metadata.publisher || '';

  // If no title from metadata, try to extract from first page text
  if (!suggestedTitle && textPages[0]) {
    const lines = textPages[0].split('\n').filter(l => l.trim().length > 3);
    if (lines.length > 0) {
      suggestedTitle = lines[0].trim().slice(0, 100);
    }
  }

  // If no author from metadata, try common patterns
  if (!suggestedAuthor && textPages[0]) {
    const authorPatterns = [
      /(?:author|автор|written by|составил|перевёл|переводчик)[:\s]+(.+?)(?:\n|$)/i,
      /(?:sheikh|шейх|имам|imam|доктор|профессор)\s+(.+?)(?:\n|$)/i,
    ];
    for (const pattern of authorPatterns) {
      const match = combinedText.match(pattern);
      if (match) {
        suggestedAuthor = match[1].trim().slice(0, 80);
        break;
      }
    }
  }

  const suggestedCategory = detectCategory(allText);
  const suggestedLanguage = detectLanguage(combinedText);
  const suggestedTags = detectTags(allText, suggestedCategory);

  // Calculate confidence
  let confidence = 0;
  if (metadata.title) confidence += 30;
  if (metadata.author) confidence += 30;
  if (suggestedTitle && suggestedTitle !== metadata.title) confidence += 10;
  if (suggestedCategory !== 'Общее') confidence += 15;
  if (suggestedAuthor !== 'Автор не указан') confidence += 15;

  return {
    metadata,
    textPages,
    suggestedTitle: suggestedTitle || 'Без названия',
    suggestedAuthor: suggestedAuthor || 'Автор не указан',
    suggestedPublisher,
    suggestedCategory,
    suggestedLanguage,
    suggestedTags,
    confidence: Math.min(100, confidence),
  };
}

export async function generateCoverFromPdf(
  url: string,
  pageNum: number = 1,
  maxWidth: number = 400,
  maxHeight: number = 560
): Promise<string | null> {
  try {
    const doc = await pdfjsLib.getDocument({ url, withCredentials: false }).promise;
    let page = await doc.getPage(pageNum);

    // Check if first page is blank, try second
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str || '').join(' ').trim();
    if (isPageBlank(text) && doc.numPages > 1) {
      page = await doc.getPage(2);
    }

    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    await page.render({ canvas, canvasContext: ctx, viewport: scaledViewport }).promise;

    return canvas.toDataURL('image/webp', 0.8);
  } catch {
    return null;
  }
}
