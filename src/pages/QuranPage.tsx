import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Settings, Bookmark, PlayCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Ayah { number: number; arabic: string; translationRu: string; translationEn?: string; translationTg?: string; translationUz?: string; translationFa?: string; tafsirRu?: string; }
interface Surah { number: number; name: string; nameAr: string; meaning: string; revelation: string; ayahCount?: number; ayahs: Ayah[]; }

const ui = {
  ru: { section: 'Раздел Корана', title: 'Коран', lead: 'Современный раздел для чтения Корана: список сур, арабский текст, перевод, тафсир и удобные настройки.', search: 'Поиск суры', translation: 'Перевод', tafsir: 'Тафсир', coming: 'Текст этой суры будет добавлен в следующих обновлениях. Структура раздела уже готова для полного Корана.' },
  en: { section: 'Quran section', title: 'Quran', lead: 'A modern Quran reading section: surah list, Arabic text, translation, tafsir and reading settings.', search: 'Search surah', translation: 'Translation', tafsir: 'Tafsir', coming: 'This surah text will be added in upcoming updates. The section is already prepared for the full Quran.' },
  ar: { section: 'قسم القرآن', title: 'القرآن', lead: 'قسم حديث لقراءة القرآن: السور، النص العربي، الترجمة، التفسير والإعدادات.', search: 'البحث عن سورة', translation: 'الترجمة', tafsir: 'التفسير', coming: 'سيتم إضافة نص هذه السورة في التحديثات القادمة.' },
  tg: { section: 'Бахши Қуръон', title: 'Қуръон', lead: 'Бахши муосир барои хондани Қуръон: сураҳо, матни арабӣ, тарҷума, тафсир ва танзимот.', search: 'Ҷустуҷӯи сура', translation: 'Тарҷума', tafsir: 'Тафсир', coming: 'Матни ин сура дар навсозиҳои оянда илова мешавад.' },
  uz: { section: 'Qur’on bo‘limi', title: 'Qur’on', lead: 'Qur’on o‘qish uchun zamonaviy bo‘lim: suralar, arabcha matn, tarjima, tafsir va sozlamalar.', search: 'Sura qidirish', translation: 'Tarjima', tafsir: 'Tafsir', coming: 'Bu sura matni keyingi yangilanishlarda qo‘shiladi.' },
  fa: { section: 'بخش قرآن', title: 'قرآن', lead: 'بخش مدرن برای خواندن قرآن: فهرست سوره‌ها، متن عربی، ترجمه، تفسیر و تنظیمات.', search: 'جستجوی سوره', translation: 'ترجمه', tafsir: 'تفسیر', coming: 'متن این سوره در به‌روزرسانی‌های بعدی اضافه می‌شود.' }
};

export default function QuranPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || 'ru').split('-')[0] as keyof typeof ui;
  const t = ui[lang] || ui.ru;
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selected, setSelected] = useState(1);
  const [query, setQuery] = useState('');
  const [fontSize, setFontSize] = useState(30);
  const [showTranslation, setShowTranslation] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('./data/quran-surahs.json').then(r => r.json()).catch(() => []),
      fetch('./data/quran.json').then(r => r.json()).catch(() => []),
    ]).then(([meta, ayahData]) => {
      const byNumber = new Map<number, Surah>(ayahData.map((s: Surah) => [s.number, s]));
      setSurahs(meta.map((item: Surah) => ({ ...item, ayahs: byNumber.get(item.number)?.ayahs || [], revelation: byNumber.get(item.number)?.revelation || item.revelation || '', ayahCount: byNumber.get(item.number)?.ayahs.length || item.ayahCount || 0 })));
    }).catch(() => setSurahs([]));
  }, []);

  const current = surahs.find(s => s.number === selected) || surahs[0];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(s => `${s.number} ${s.name} ${s.nameAr} ${s.meaning}`.toLowerCase().includes(q));
  }, [surahs, query]);

  return (
    <div className="fade-in quran-page" style={{ maxWidth: 1500, margin: '0 auto' }}>
      <style>{css}</style>
      <section className="quran-hero glass-card">
        <div>
          <div className="eyebrow"><BookOpen size={16}/> {t.section}</div>
          <h1>{t.title}</h1>
          <p>{t.lead}</p>
        </div>
        <div className="quran-calligraphy">القرآن الكريم</div>
      </section>

      <div className="quran-layout">
        <aside className="quran-sidebar glass-card">
          <div className="quran-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search} /></div>
          <div className="surah-list">
            {filtered.map(surah => (
              <button key={surah.number} onClick={() => setSelected(surah.number)} className={selected === surah.number ? 'active' : ''}>
                <span className="num">{surah.number}</span>
                <span><b>{surah.name}</b><small>{surah.meaning} · {surah.ayahs.length || surah.ayahCount || '—'} аятов</small></span>
                <strong dir="rtl">{surah.nameAr}</strong>
              </button>
            ))}
          </div>
        </aside>

        <main className="quran-reader glass-card">
          {current ? (
            <>
              <div className="reader-head">
                <div>
                  <h2>{current.name} <span dir="rtl">{current.nameAr}</span></h2>
                  <p>{current.meaning} · {current.revelation} · {current.ayahs.length} аятов</p>
                </div>
                <div className="quran-tools">
                  <button onClick={() => setFontSize(v => Math.max(24, v - 2))}>A-</button>
                  <button onClick={() => setFontSize(v => Math.min(46, v + 2))}>A+</button>
                  <button onClick={() => setShowTranslation(v => !v)}><Settings size={14}/> {t.translation}</button>
                </div>
              </div>

              <div className="bismillah" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
              <div className="ayahs">
                {current.ayahs.length ? current.ayahs.map(ayah => (
                  <article key={ayah.number} className="ayah-card">
                    <div className="ayah-actions"><span>{current.number}:{ayah.number}</span><button title="Аудио будет добавлено позже"><PlayCircle size={15}/></button><button title="Закладка"><Bookmark size={15}/></button></div>
                    <p className="arabic-ayah" dir="rtl" style={{ fontSize }}>{ayah.arabic} <span className="ayah-mark">﴿{ayah.number}﴾</span></p>
                    {showTranslation && <p className="translation">{getAyahTranslation(ayah, lang)}</p>}
                    {ayah.tafsirRu && <details className="tafsir"><summary>{t.tafsir}</summary><p>{ayah.tafsirRu}</p></details>}
                  </article>
                )) : <div className="coming-soon">{t.coming}</div>}
              </div>
            </>
          ) : <div style={{ padding: 40, color: '#9db8a3' }}>Загрузка раздела Корана...</div>}
        </main>
      </div>
    </div>
  );
}


function getAyahTranslation(ayah: Ayah, lang: string) {
  if (lang === 'en') return ayah.translationEn || ayah.translationRu;
  if (lang === 'tg') return ayah.translationTg || ayah.translationRu;
  if (lang === 'uz') return ayah.translationUz || ayah.translationRu;
  if (lang === 'fa') return ayah.translationFa || ayah.translationRu;
  return ayah.translationRu;
}

const css = `
.quran-hero{padding:32px;margin-bottom:20px;display:flex;justify-content:space-between;gap:24px;overflow:hidden;background:linear-gradient(135deg,rgba(13,42,24,.96),rgba(7,19,11,.94))}.quran-hero h1{font-size:clamp(34px,6vw,64px);font-weight:950;color:#f0f4f1;line-height:1;margin:8px 0}.quran-hero p{color:#9db8a3;line-height:1.7;max-width:720px}.eyebrow{display:flex;align-items:center;gap:8px;color:#d4af37;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.quran-calligraphy{font-family:Amiri,serif;font-size:54px;color:rgba(212,175,55,.22);align-self:center;white-space:nowrap}.quran-layout{display:grid;grid-template-columns:340px 1fr;gap:18px}.quran-sidebar{padding:14px;height:calc(100vh - 210px);min-height:560px;overflow:hidden;display:flex;flex-direction:column}.quran-search{display:flex;gap:8px;align-items:center;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(212,175,55,.14);margin-bottom:12px}.quran-search input{background:transparent;border:0;outline:0;color:#f0f4f1;width:100%}.surah-list{overflow:auto;display:flex;flex-direction:column;gap:8px}.surah-list button{display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;text-align:left;padding:12px;border-radius:14px;border:1px solid rgba(212,175,55,.12);background:rgba(255,255,255,.03);color:#f0f4f1;cursor:pointer}.surah-list button.active,.surah-list button:hover{border-color:rgba(212,175,55,.42);background:rgba(212,175,55,.08)}.num{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(212,175,55,.13);color:#d4af37;font-weight:900}.surah-list small{display:block;color:#9db8a3}.surah-list strong{font-family:Amiri,serif;color:#d4af37;font-size:18px}.quran-reader{min-height:560px;overflow:hidden}.reader-head{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:22px;border-bottom:1px solid rgba(212,175,55,.12)}.reader-head h2{color:#f0f4f1;font-size:26px;font-weight:900}.reader-head h2 span{font-family:Amiri,serif;color:#d4af37;margin-left:10px}.reader-head p{color:#9db8a3}.quran-tools{display:flex;gap:8px;flex-wrap:wrap}.quran-tools button,.ayah-actions button{border:1px solid rgba(212,175,55,.16);background:rgba(255,255,255,.04);color:#d4af37;border-radius:10px;padding:8px 10px;cursor:pointer;display:inline-flex;gap:5px;align-items:center}.bismillah{text-align:center;font-family:Amiri,serif;color:#d4af37;font-size:34px;padding:24px 18px}.ayahs{padding:0 22px 24px;display:flex;flex-direction:column;gap:14px}.ayah-card{padding:22px;border-radius:18px;border:1px solid rgba(212,175,55,.12);background:rgba(255,255,255,.025)}.ayah-actions{display:flex;justify-content:space-between;color:#5a7a63;font-size:12px;margin-bottom:12px}.arabic-ayah{font-family:Amiri,serif;line-height:2.15;color:#f8efd1;text-align:right}.ayah-mark{color:#d4af37;font-size:.75em}.translation{color:#9db8a3;line-height:1.75;margin-top:12px}.tafsir{margin-top:12px;border-top:1px solid rgba(212,175,55,.12);padding-top:10px}.tafsir summary{cursor:pointer;color:#d4af37;font-weight:800;font-size:13px}.tafsir p{color:#9db8a3;line-height:1.7}.coming-soon{padding:28px;text-align:center;color:#9db8a3;border:1px dashed rgba(212,175,55,.22);border-radius:16px;background:rgba(255,255,255,.025)}@media(max-width:950px){.quran-layout{grid-template-columns:1fr}.quran-sidebar{height:auto;min-height:auto;max-height:360px}.quran-calligraphy{display:none}.reader-head{align-items:flex-start;flex-direction:column}.ayahs{padding:0 12px 18px}.quran-hero{padding:24px}.bismillah{font-size:28px}.arabic-ayah{font-size:30px!important}}
`;
