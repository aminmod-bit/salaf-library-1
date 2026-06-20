import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Settings, Bookmark, PlayCircle } from 'lucide-react';

interface Ayah { number: number; arabic: string; translationRu: string; }
interface Surah { number: number; name: string; nameAr: string; meaning: string; revelation: string; ayahs: Ayah[]; }

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selected, setSelected] = useState(1);
  const [query, setQuery] = useState('');
  const [fontSize, setFontSize] = useState(30);
  const [showTranslation, setShowTranslation] = useState(true);

  useEffect(() => {
    fetch('./data/quran.json').then(r => r.json()).then(setSurahs).catch(() => setSurahs([]));
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
          <div className="eyebrow"><BookOpen size={16}/> Раздел Корана</div>
          <h1>Коран</h1>
          <p>Современный раздел для чтения Корана: список сур, арабский текст, перевод, удобные настройки и готовая структура для расширения до полного mushaf.</p>
        </div>
        <div className="quran-calligraphy">القرآن الكريم</div>
      </section>

      <div className="quran-layout">
        <aside className="quran-sidebar glass-card">
          <div className="quran-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск суры" /></div>
          <div className="surah-list">
            {filtered.map(surah => (
              <button key={surah.number} onClick={() => setSelected(surah.number)} className={selected === surah.number ? 'active' : ''}>
                <span className="num">{surah.number}</span>
                <span><b>{surah.name}</b><small>{surah.meaning} · {surah.ayahs.length} аятов</small></span>
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
                  <button onClick={() => setShowTranslation(v => !v)}><Settings size={14}/> Перевод</button>
                </div>
              </div>

              <div className="bismillah" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
              <div className="ayahs">
                {current.ayahs.map(ayah => (
                  <article key={ayah.number} className="ayah-card">
                    <div className="ayah-actions"><span>{current.number}:{ayah.number}</span><button title="Аудио будет добавлено позже"><PlayCircle size={15}/></button><button title="Закладка"><Bookmark size={15}/></button></div>
                    <p className="arabic-ayah" dir="rtl" style={{ fontSize }}>{ayah.arabic} <span className="ayah-mark">﴿{ayah.number}﴾</span></p>
                    {showTranslation && <p className="translation">{ayah.translationRu}</p>}
                  </article>
                ))}
              </div>
            </>
          ) : <div style={{ padding: 40, color: '#9db8a3' }}>Загрузка раздела Корана...</div>}
        </main>
      </div>
    </div>
  );
}

const css = `
.quran-hero{padding:32px;margin-bottom:20px;display:flex;justify-content:space-between;gap:24px;overflow:hidden;background:linear-gradient(135deg,rgba(13,42,24,.96),rgba(7,19,11,.94))}.quran-hero h1{font-size:clamp(34px,6vw,64px);font-weight:950;color:#f0f4f1;line-height:1;margin:8px 0}.quran-hero p{color:#9db8a3;line-height:1.7;max-width:720px}.eyebrow{display:flex;align-items:center;gap:8px;color:#d4af37;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.quran-calligraphy{font-family:Amiri,serif;font-size:54px;color:rgba(212,175,55,.22);align-self:center;white-space:nowrap}.quran-layout{display:grid;grid-template-columns:340px 1fr;gap:18px}.quran-sidebar{padding:14px;height:calc(100vh - 210px);min-height:560px;overflow:hidden;display:flex;flex-direction:column}.quran-search{display:flex;gap:8px;align-items:center;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(212,175,55,.14);margin-bottom:12px}.quran-search input{background:transparent;border:0;outline:0;color:#f0f4f1;width:100%}.surah-list{overflow:auto;display:flex;flex-direction:column;gap:8px}.surah-list button{display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;text-align:left;padding:12px;border-radius:14px;border:1px solid rgba(212,175,55,.12);background:rgba(255,255,255,.03);color:#f0f4f1;cursor:pointer}.surah-list button.active,.surah-list button:hover{border-color:rgba(212,175,55,.42);background:rgba(212,175,55,.08)}.num{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(212,175,55,.13);color:#d4af37;font-weight:900}.surah-list small{display:block;color:#9db8a3}.surah-list strong{font-family:Amiri,serif;color:#d4af37;font-size:18px}.quran-reader{min-height:560px;overflow:hidden}.reader-head{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:22px;border-bottom:1px solid rgba(212,175,55,.12)}.reader-head h2{color:#f0f4f1;font-size:26px;font-weight:900}.reader-head h2 span{font-family:Amiri,serif;color:#d4af37;margin-left:10px}.reader-head p{color:#9db8a3}.quran-tools{display:flex;gap:8px;flex-wrap:wrap}.quran-tools button,.ayah-actions button{border:1px solid rgba(212,175,55,.16);background:rgba(255,255,255,.04);color:#d4af37;border-radius:10px;padding:8px 10px;cursor:pointer;display:inline-flex;gap:5px;align-items:center}.bismillah{text-align:center;font-family:Amiri,serif;color:#d4af37;font-size:34px;padding:24px 18px}.ayahs{padding:0 22px 24px;display:flex;flex-direction:column;gap:14px}.ayah-card{padding:22px;border-radius:18px;border:1px solid rgba(212,175,55,.12);background:rgba(255,255,255,.025)}.ayah-actions{display:flex;justify-content:space-between;color:#5a7a63;font-size:12px;margin-bottom:12px}.arabic-ayah{font-family:Amiri,serif;line-height:2.15;color:#f8efd1;text-align:right}.ayah-mark{color:#d4af37;font-size:.75em}.translation{color:#9db8a3;line-height:1.75;margin-top:12px}@media(max-width:950px){.quran-layout{grid-template-columns:1fr}.quran-sidebar{height:auto;min-height:auto;max-height:360px}.quran-calligraphy{display:none}.reader-head{align-items:flex-start;flex-direction:column}.ayahs{padding:0 12px 18px}.quran-hero{padding:24px}.bismillah{font-size:28px}.arabic-ayah{font-size:30px!important}}
`;
