import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, ChevronLeft, ChevronRight, Headphones, List, Play, Search, Settings, Square } from 'lucide-react';
import {
  defaultTranslationId, getChapterAudio, getChapters, getRecitations, getTafsirs,
  getTranslations, getVersesByChapter, getVersesByJuz,
  type QuranChapter, type QuranRecitation, type QuranResource, type QuranVerse
} from '../utils/quranComApi';

type Mode = 'surah' | 'juz';

export default function QuranPage() {
  const params = useParams<{ surahNumber?: string; ayahNumber?: string; juzNumber?: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || 'ru').split('-')[0];
  const audioRef = useRef<HTMLAudioElement>(null);

  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [translations, setTranslations] = useState<QuranResource[]>([]);
  const [tafsirs, setTafsirs] = useState<QuranResource[]>([]);
  const [recitations, setRecitations] = useState<QuranRecitation[]>([]);
  const [translationId, setTranslationId] = useState(defaultTranslationId(lang));
  const [tafsirId, setTafsirId] = useState<number | ''>('');
  const [recitationId, setRecitationId] = useState(7);
  const [selected, setSelected] = useState(Number(params.surahNumber) || 1);
  const [juz, setJuz] = useState(Number(params.juzNumber) || 1);
  const [mode, setMode] = useState<Mode>(params.juzNumber ? 'juz' : 'surah');
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [audioUrl, setAudioUrl] = useState('');
  const [query, setQuery] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [showTafsir, setShowTafsir] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTranslationId(defaultTranslationId(lang)); }, [lang]);

  useEffect(() => {
    Promise.all([getChapters(lang), getTranslations(), getTafsirs(), getRecitations()])
      .then(([c, tr, tf, rec]) => { setChapters(c); setTranslations(tr); setTafsirs(tf); setRecitations(rec); })
      .catch(() => undefined);
  }, [lang]);

  useEffect(() => {
    if (params.juzNumber) { setMode('juz'); setJuz(Number(params.juzNumber) || 1); }
    else { setMode('surah'); setSelected(Number(params.surahNumber) || 1); }
  }, [params.juzNumber, params.surahNumber]);

  useEffect(() => {
    setLoading(true);
    const load = mode === 'juz'
      ? getVersesByJuz(juz, translationId)
      : getVersesByChapter(selected, translationId, tafsirId || undefined);
    load.then(setVerses).catch(() => setVerses([])).finally(() => setLoading(false));
  }, [mode, selected, juz, translationId, tafsirId]);

  const current = chapters.find(c => c.id === selected);
  const filteredChapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(c => `${c.id} ${c.name_simple} ${c.name_arabic} ${c.translated_name?.name}`.toLowerCase().includes(q));
  }, [chapters, query]);

  const playChapter = async () => {
    if (mode !== 'surah') return;
    try {
      const files = await getChapterAudio(selected, recitationId);
      const first = files[0]?.audio_url || files[0]?.url || '';
      if (first) {
        setAudioUrl(first);
        setTimeout(() => audioRef.current?.play(), 50);
      }
    } catch { /* ignore */ }
  };

  const goSurah = (id: number) => navigate(`/quran/${id}`);
  const goJuz = (id: number) => navigate(`/quran/juz/${id}`);
  const next = () => mode === 'juz' ? goJuz(Math.min(30, juz + 1)) : goSurah(Math.min(114, selected + 1));
  const prev = () => mode === 'juz' ? goJuz(Math.max(1, juz - 1)) : goSurah(Math.max(1, selected - 1));

  return (
    <div className="fade-in quran-com-page" style={{ maxWidth: 1600, margin: '0 auto' }}>
      <style>{css}</style>
      <section className="quran-hero glass-card">
        <div>
          <div className="eyebrow"><BookOpen size={16}/> Quran Navigator</div>
          <h1>{mode === 'juz' ? `Juz ${juz}` : `${current?.name_simple || 'Quran'} ${current?.name_arabic || ''}`}</h1>
          <p>Surah · Verse · Juz navigation with translations, tafsir resources and reciters powered by Quran.com public API.</p>
        </div>
        <div className="quran-calligraphy">القرآن الكريم</div>
      </section>

      <div className="quran-layout">
        <aside className="quran-sidebar glass-card">
          <div className="quran-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Surah" /></div>
          <div className="juz-row"><button onClick={() => setMode('surah')} className={mode==='surah'?'active':''}>Surah</button><button onClick={() => goJuz(juz)} className={mode==='juz'?'active':''}>Juz</button></div>
          {mode === 'juz' && <div className="juz-grid">{Array.from({length:30},(_,i)=>i+1).map(n=><button key={n} className={juz===n?'active':''} onClick={()=>goJuz(n)}>{n}</button>)}</div>}
          <div className="surah-list">
            {filteredChapters.map(c => (
              <button key={c.id} onClick={() => goSurah(c.id)} className={mode==='surah' && selected === c.id ? 'active' : ''}>
                <span className="num">{c.id}</span>
                <span><b>{c.name_simple}</b><small>{c.translated_name?.name || ''} · {c.verses_count}</small></span>
                <strong dir="rtl">{c.name_arabic}</strong>
              </button>
            ))}
          </div>
        </aside>

        <main className="quran-reader glass-card">
          <div className="reader-head">
            <div>
              <h2>{mode === 'juz' ? `Juz ${juz}` : `${current?.name_simple || ''} `}<span dir="rtl">{mode==='surah' ? current?.name_arabic : ''}</span></h2>
              <p>{mode === 'surah' ? `${current?.revelation_place || ''} · ${current?.verses_count || 0} ayahs` : `${verses.length} ayahs`}</p>
            </div>
            <div className="quran-tools">
              <button onClick={prev}><ChevronLeft size={16}/> Prev</button>
              <button onClick={next}>Next <ChevronRight size={16}/></button>
              <button onClick={() => setFontSize(v => Math.max(24, v - 2))}>A-</button>
              <button onClick={() => setFontSize(v => Math.min(50, v + 2))}>A+</button>
              <button onClick={playChapter}><Play size={15}/> Play</button>
            </div>
          </div>

          <div className="resource-bar">
            <label><Settings size={14}/> Translation<select value={translationId} onChange={e=>setTranslationId(Number(e.target.value))}>{translations.map(r=><option key={r.id} value={r.id}>{r.language_name} · {r.name}</option>)}</select></label>
            <label><List size={14}/> Tafsir<select value={tafsirId} onChange={e=>setTafsirId(e.target.value ? Number(e.target.value) : '')}><option value="">No tafsir</option>{tafsirs.map(r=><option key={r.id} value={r.id}>{r.language_name} · {r.name}</option>)}</select></label>
            <label><Headphones size={14}/> Reciter<select value={recitationId} onChange={e=>setRecitationId(Number(e.target.value))}>{recitations.map(r=><option key={r.id} value={r.id}>{r.translated_name?.name || r.name}</option>)}</select></label>
          </div>

          <audio ref={audioRef} src={audioUrl} controls style={{ width: '100%', display: audioUrl ? 'block' : 'none' }} />

          <div className="ayahs">
            {loading ? <div className="loading-box">Loading Quran...</div> : verses.map(v => (
              <article key={v.id} className="ayah-card" id={`ayah-${v.verse_key.replace(':','-')}`}>
                <div className="ayah-actions"><span>{v.verse_key}</span><button onClick={() => navigate(`/quran/${v.verse_key.replace(':','/')}`)}>Open</button><button><Square size={14}/> Bookmark</button></div>
                <p className="arabic-ayah" dir="rtl" style={{ fontSize }}>{v.text_uthmani}</p>
                {v.translations?.map(tr => <div key={tr.id} className="translation" dangerouslySetInnerHTML={{ __html: tr.text }} />)}
                {showTafsir && v.tafsirs?.map(tf => <details key={tf.id} className="tafsir"><summary>Tafsir</summary><div dangerouslySetInnerHTML={{ __html: tf.text }} /></details>)}
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

const css = `
.quran-hero{padding:32px;margin-bottom:20px;display:flex;justify-content:space-between;gap:24px;overflow:hidden;background:linear-gradient(135deg,rgba(13,42,24,.96),rgba(7,19,11,.94))}.quran-hero h1{font-size:clamp(34px,6vw,62px);font-weight:950;color:var(--color-text-primary);line-height:1;margin:8px 0}.quran-hero p{color:var(--color-text-secondary);line-height:1.7;max-width:760px}.eyebrow{display:flex;align-items:center;gap:8px;color:var(--color-gold);font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.quran-calligraphy{font-family:Amiri,serif;font-size:54px;color:rgba(212,175,55,.22);align-self:center}.quran-layout{display:grid;grid-template-columns:350px 1fr;gap:18px}.quran-sidebar{padding:14px;height:calc(100vh - 210px);min-height:620px;overflow:hidden;display:flex;flex-direction:column}.quran-search{display:flex;gap:8px;align-items:center;padding:10px 12px;border-radius:12px;background:var(--color-bg-hover);border:1px solid var(--color-border);margin-bottom:12px}.quran-search input{background:transparent;border:0;outline:0;color:var(--color-text-primary);width:100%}.juz-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}.juz-row button,.juz-grid button{border:1px solid var(--color-border);background:var(--color-bg-hover);color:var(--color-gold);border-radius:10px;padding:8px;cursor:pointer}.juz-row button.active,.juz-grid button.active{background:rgba(212,175,55,.15)}.juz-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:12px}.surah-list{overflow:auto;display:flex;flex-direction:column;gap:8px}.surah-list button{display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;text-align:left;padding:12px;border-radius:14px;border:1px solid var(--color-border);background:var(--color-bg-hover);color:var(--color-text-primary);cursor:pointer}.surah-list button.active,.surah-list button:hover{border-color:var(--color-border-hover);background:rgba(212,175,55,.08)}.num{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(212,175,55,.13);color:var(--color-gold);font-weight:900}.surah-list small{display:block;color:var(--color-text-secondary)}.surah-list strong{font-family:Amiri,serif;color:var(--color-gold);font-size:18px}.quran-reader{min-height:620px;overflow:hidden}.reader-head{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:22px;border-bottom:1px solid rgba(212,175,55,.12)}.reader-head h2{color:var(--color-text-primary);font-size:26px;font-weight:900}.reader-head h2 span{font-family:Amiri,serif;color:var(--color-gold);margin-left:10px}.reader-head p{color:var(--color-text-secondary)}.quran-tools,.resource-bar{display:flex;gap:8px;flex-wrap:wrap}.quran-tools button,.ayah-actions button{border:1px solid rgba(212,175,55,.16);background:var(--color-bg-hover);color:var(--color-gold);border-radius:10px;padding:8px 10px;cursor:pointer;display:inline-flex;gap:5px;align-items:center}.resource-bar{padding:12px 18px;border-bottom:1px solid rgba(212,175,55,.1)}.resource-bar label{display:flex;gap:6px;align-items:center;color:var(--color-text-secondary);font-size:12px}.resource-bar select{max-width:220px;background:#112a1a;color:var(--color-text-primary);border:1px solid rgba(212,175,55,.16);border-radius:8px;padding:7px}.ayahs{padding:22px;display:flex;flex-direction:column;gap:14px;max-height:calc(100vh - 330px);overflow:auto}.ayah-card{padding:22px;border-radius:18px;border:1px solid var(--color-border);background:rgba(255,255,255,.025)}.ayah-actions{display:flex;justify-content:space-between;color:#5a7a63;font-size:12px;margin-bottom:12px;gap:8px}.arabic-ayah{font-family:Amiri,serif;line-height:2.15;color:#f8efd1;text-align:right}.translation{color:var(--color-text-secondary);line-height:1.75;margin-top:12px}.tafsir{margin-top:12px;border-top:1px solid rgba(212,175,55,.12);padding-top:10px}.tafsir summary{cursor:pointer;color:var(--color-gold);font-weight:800;font-size:13px}.tafsir div{color:var(--color-text-secondary);line-height:1.7}.loading-box{padding:40px;text-align:center;color:var(--color-gold)}@media(max-width:980px){.quran-layout{grid-template-columns:1fr}.quran-sidebar{height:auto;min-height:auto;max-height:420px}.quran-calligraphy{display:none}.reader-head{align-items:flex-start;flex-direction:column}.ayahs{max-height:none;padding:12px}.quran-hero{padding:24px}.arabic-ayah{font-size:30px!important}.resource-bar select{max-width:160px}}
`;
