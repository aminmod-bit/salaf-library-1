import { useNavigate } from 'react-router-dom';
import { BookOpen, Send, Radio, Video, FolderOpen, Library, Users } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function HomePage() {
  const navigate = useNavigate();
  const { books, biographies, isLoading } = useStore();
  const showcase = books.slice(0, 3);

  if (isLoading) {
    return (
      <div className="app-loader">
        <div className="app-loader-mark">SL</div>
      </div>
    );
  }

  return (
    <main className="heritage-page fade-in">
      <section className="heritage-hero">
        <div className="heritage-hero-inner">
          <img className="heritage-hero-mark" src="./logo-mark.svg" alt="Salaf Library" />
          <h1>Salaf Library</h1>
          <div className="heritage-divider" />
          <p>Достоверные исламские книги, переводы и исследования в соответствии с пониманием праведных предшественников.</p>
        </div>
      </section>

      <div className="heritage-content">
        <section className="heritage-section">
          <div className="heritage-section-head">
            <h2>Книги</h2>
            <button className="heritage-count" onClick={() => navigate('/books')}>{books.length} книг</button>
          </div>

          {showcase.length > 0 ? (
            <div className="heritage-grid">
              {showcase.map(book => (
                <article key={book.id} className="heritage-book-card">
                  <div className="heritage-book-cover">
                    {book.coverImage ? <img src={book.coverImage} alt={book.title} /> : <BookCover title={book.title} category={book.category} />}
                  </div>
                  <div className="heritage-book-info">
                    <h3>{book.title}</h3>
                    <p className="author">{book.author}</p>
                    <p>{book.description}</p>
                    <button onClick={() => navigate(`/read/${book.id}`)}><BookOpen size={17}/> Читать PDF</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="heritage-empty">
              <Library size={34} style={{ margin: '0 auto 12px', color: '#8ea66a' }} />
              <strong>Библиотека готова к наполнению</strong>
              <p style={{ marginTop: 8 }}>Добавьте PDF в папки <code>Books/...</code> или используйте импорт в админке.</p>
              <button className="btn-primary" style={{ marginTop: 18 }} onClick={() => navigate('/books')}>
                <FolderOpen size={16}/> Открыть разделы
              </button>
            </div>
          )}
        </section>

        <section className="resources-panel heritage-section">
          <h2>Наши ресурсы</h2>
          <div className="resources-grid">
            <a className="resource-link" href="#" onClick={(e) => e.preventDefault()}><Send size={28} color="#2aabee"/> Telegram</a>
            <a className="resource-link" href="#" onClick={(e) => e.preventDefault()}><Radio size={28} color="#d9468f"/> Instagram</a>
            <a className="resource-link" href="#" onClick={(e) => e.preventDefault()}><Video size={32} color="#ff2b2b"/> YouTube</a>
          </div>
        </section>

        <section className="heritage-section">
          <div className="heritage-grid">
            <button className="heritage-mini-card" onClick={() => navigate('/books')}>
              <FolderOpen size={24}/>
              <span>Разделы книг</span>
              <small>Папочная структура для большой библиотеки</small>
            </button>
            <button className="heritage-mini-card" onClick={() => navigate('/azkar')}>
              <BookOpen size={24}/>
              <span>Азкары и дуа</span>
              <small>Готово для наполнения утренними и вечерними азкарами</small>
            </button>
            <button className="heritage-mini-card" onClick={() => navigate('/biographies')}>
              <Users size={24}/>
              <span>Биографии</span>
              <small>{biographies.length} записей в базе</small>
            </button>
          </div>
        </section>

        <footer className="heritage-footer">© 2026 Salaf Library. Все права защищены.</footer>
      </div>

      <style>{`
        .heritage-book-card{display:grid;grid-template-columns:150px 1fr;gap:22px;padding:18px;border-radius:8px;background:#eee9dd;color:#181711;box-shadow:0 12px 35px rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.5)}
        .heritage-book-cover{height:210px;border-radius:4px;overflow:hidden;box-shadow:0 10px 24px rgba(0,0,0,.35)}
        .heritage-book-cover img{width:100%;height:100%;object-fit:cover;display:block}.heritage-book-info{display:flex;flex-direction:column;align-items:flex-start;justify-content:center}.heritage-book-info h3{font-family:Georgia,'Times New Roman',serif;font-size:25px;line-height:1.15;margin-bottom:12px;color:#111}.heritage-book-info .author{color:#383830;font-size:15px;margin-bottom:18px}.heritage-book-info p{color:#272721;line-height:1.55;margin-bottom:18px}.heritage-book-info button{display:inline-flex;align-items:center;gap:9px;border:0;border-radius:4px;background:#4c6a3b;color:#fff;padding:11px 18px;font-family:Georgia,'Times New Roman',serif;font-size:18px;cursor:pointer}.heritage-book-info button:hover{background:#3f5d31}.heritage-mini-card{padding:22px;text-align:left;border-radius:10px;border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.03);color:#f3ead8;display:flex;flex-direction:column;gap:10px;cursor:pointer}.heritage-mini-card svg{color:#8ea66a}.heritage-mini-card span{font-family:Georgia,'Times New Roman',serif;font-size:23px}.heritage-mini-card small{color:#bdb4a1;line-height:1.55}.heritage-footer{text-align:center;color:#cfc4ad;border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:18px;background:rgba(255,255,255,.025);font-family:Georgia,'Times New Roman',serif}@media(max-width:720px){.heritage-book-card{grid-template-columns:1fr}.heritage-book-cover{width:150px;margin:auto}.heritage-hero{margin-left:-16px;margin-right:-16px}.heritage-section h2{font-size:26px}}
      `}</style>
    </main>
  );
}

function BookCover({ title, category }: { title: string; category: string }) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#173524,#07130b)', border: '1px solid rgba(201,164,74,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 14, textAlign: 'center' }}>
      <div style={{ color: '#c9a44a', fontSize: 11, fontWeight: 800, letterSpacing: '.12em' }}>{category}</div>
      <div style={{ color: '#f3ead8', fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>{title}</div>
      <div style={{ color: '#c9a44a', fontSize: 24 }}>◇</div>
    </div>
  );
}
