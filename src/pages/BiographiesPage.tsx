import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserRound } from 'lucide-react';
import { useStore } from '../store/useStore';
import FolderCard from '../components/FolderCard';

const BIO_FOLDERS = [
  { id: 'prophet', label: 'Пророки', subtitle: 'Биографии пророков' },
  { id: 'companion', label: 'Сподвижники', subtitle: 'Сахабы, да будет доволен ими Аллах' },
  { id: 'tabiin', label: 'Табиины', subtitle: 'Поколение после сподвижников' },
  { id: 'scholar', label: 'Учёные', subtitle: 'Классические и современные учёные' },
  { id: 'modern', label: 'Современные', subtitle: 'Современные биографии' },
  { id: 'authors', label: 'Авторы книг', subtitle: 'Авторы, связанные с библиотекой' },
];

const TYPE_LABELS: Record<string, string> = {
  prophet: 'Пророк',
  companion: 'Сподвижник',
  tabiin: 'Табиин',
  scholar: 'Учёный',
  modern: 'Современный',
};

export default function BiographiesPage() {
  const navigate = useNavigate();
  const { biographies } = useStore();
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');

  const folderStats = useMemo(() => BIO_FOLDERS.map(item => ({
    ...item,
    count: item.id === 'authors'
      ? biographies.filter(bio => bio.relatedBooks?.length || bio.type === 'scholar').length
      : biographies.filter(bio => bio.type === item.id).length,
  })), [biographies]);

  const filtered = useMemo(() => {
    let result = folder
      ? folder === 'authors'
        ? biographies.filter(bio => bio.relatedBooks?.length || bio.type === 'scholar')
        : biographies.filter(bio => bio.type === folder)
      : [];

    const q = search.trim().toLowerCase();
    if (q) {
      result = biographies.filter(bio =>
        bio.name.toLowerCase().includes(q) ||
        (bio.nameAr || '').includes(q) ||
        bio.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [biographies, search, folder]);

  const showFolders = !folder && !search.trim();

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: 30, marginBottom: 20, background: 'linear-gradient(135deg, rgba(13,42,24,.96), rgba(7,19,11,.94))' }}>
        <div style={{ color: '#d4af37', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <UserRound size={16} /> Биографии
        </div>
        <h1 style={{ color: '#f0f4f1', fontSize: 'clamp(30px, 5vw, 50px)', fontWeight: 950, lineHeight: 1.08 }}>
          {showFolders ? 'Папки биографий' : BIO_FOLDERS.find(item => item.id === folder)?.label || 'Биографии'}
        </h1>
        <p style={{ color: '#9db8a3', lineHeight: 1.7, marginTop: 12, maxWidth: 760 }}>
          {showFolders ? 'Сначала выберите раздел биографий. Такая структура удобна для большого количества авторов и учёных.' : `${filtered.length} записей в выбранном разделе.`}
        </p>
      </section>

      <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(212,175,55,.14)', borderRadius: 12, padding: '9px 12px' }}>
          <Search size={15} color="#5a7a63" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Поиск по биографиям..." style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: '#f0f4f1' }} />
        </div>
        {!showFolders && <button className="btn-ghost" onClick={() => { setFolder(''); setSearch(''); }}>Все папки</button>}
      </div>

      {showFolders ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {folderStats.map(item => (
            <FolderCard
              key={item.id}
              title={item.label}
              subtitle={item.subtitle}
              count={item.count}
              countLabel="записей"
              disabled={item.count === 0}
              onClick={() => setFolder(item.id)}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 50, textAlign: 'center', color: '#9db8a3' }}>
          <UserRound size={42} style={{ margin: '0 auto 14px', color: '#5a7a63' }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f4f1' }}>Ничего не найдено</div>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map(bio => (
            <button
              key={bio.id}
              onClick={() => navigate(`/biographies/${bio.id}`)}
              className="glass-card"
              style={{ display: 'flex', gap: 14, padding: 16, textAlign: 'left', cursor: 'pointer' }}
            >
              <div style={{ width: 54, height: 54, borderRadius: 18, flexShrink: 0, background: `linear-gradient(160deg, ${bio.coverColor || '#1a3a2a'}, ${bio.coverColor || '#1a3a2a'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
                <UserRound size={25} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span className="badge badge-gold" style={{ fontSize: 10 }}>{TYPE_LABELS[bio.type] || bio.type}</span>
                  {bio.featured && <span className="badge badge-green" style={{ fontSize: 10 }}>Избранный</span>}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f0f4f1', marginBottom: 2 }}>{bio.name}</h3>
                {bio.nameAr && <div style={{ fontFamily: 'Amiri, serif', fontSize: 14, color: '#d4af37', direction: 'rtl', marginBottom: 4 }}>{bio.nameAr}</div>}
                <p style={{ fontSize: 12, color: '#9db8a3', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{bio.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
