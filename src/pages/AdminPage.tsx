import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, BookOpen, Users, Headphones, Sparkles,
  Plus, Edit, Trash2, Eye, Download, Upload,
  Settings, Database, Globe, RefreshCw
} from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

type AdminTab = 'dashboard' | 'books' | 'authors' | 'bios';

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [showAddBook, setShowAddBook] = useState(false);
  const { books, biographies, categories } = useStore();

  const tabs = [
    { id: 'dashboard' as AdminTab, icon: BarChart3, label: 'Dashboard' },
    { id: 'books' as AdminTab, icon: BookOpen, label: 'Книги' },
    { id: 'authors' as AdminTab, icon: Users, label: 'Авторы' },
    { id: 'bios' as AdminTab, icon: Users, label: 'Биографии' },
  ];

  const totalSize = books.reduce((acc, b) => {
    const num = parseFloat(b.size || '0');
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <div className="fade-in" style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d2a18, #1a3a22)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '16px', padding: '24px 28px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f0f4f1' }}>⚙️ Админ-панель</h1>
          <p style={{ color: '#9db8a3', fontSize: '13px', marginTop: '4px' }}>Salaf Library — Управление контентом</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => navigate('/admin/import')}>
            <Upload size={14} /> Импортировать
          </button>
          <button className="btn-ghost" onClick={() => navigate('/admin/settings')}>
            <Settings size={14} /> GitHub API
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }} className="admin-layout">
        <style>{`
          @media (max-width: 768px) {
            .admin-layout { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Sidebar */}
        <div style={{
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          borderRadius: '14px', padding: '12px', height: 'fit-content',
        }}>
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`nav-link ${tab === id ? 'active' : ''}`}
              style={{ marginBottom: '2px' }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {/* Dashboard */}
          {tab === 'dashboard' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f4f1', marginBottom: '20px' }}>
                📊 Статистика библиотеки
              </h2>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                {[
                  { icon: '📚', label: 'Книг', value: books.length, sub: 'в каталоге', color: '#d4af37' },
                  { icon: '👤', label: 'Биографий', value: biographies.length, sub: 'учёных', color: '#22c55e' },
                  { icon: '📂', label: 'Категорий', value: categories.length, sub: 'разделов', color: '#fb923c' },
                  { icon: '💾', label: 'Объём', value: `${totalSize.toFixed(1)} МБ`, sub: 'данных', color: '#f472b6' },
                ].map(({ icon, label, value, sub, color }) => (
                  <div key={label} style={{
                    padding: '20px',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '14px',
                  }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4f1', marginBottom: '2px' }}>{label}</div>
                    <div style={{ fontSize: '11px', color: '#5a7a63' }}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f0f4f1', marginBottom: '14px' }}>
                ⚡ Быстрые действия
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginBottom: '28px' }}>
                {[
                  { icon: '📋', title: 'Управление контентом', desc: 'Редактирование, удаление, публикация книг', action: () => navigate('/admin/content') },
                  { icon: '📚', title: 'Добавить книги', desc: 'Массовая публикация PDF через GitHub API', action: () => navigate('/admin/import') },
                  { icon: '🐙', title: 'GitHub API', desc: 'Токен, репозиторий и проверка подключения', action: () => navigate('/admin/settings') },
                  { icon: '🎨', title: 'Брендинг', desc: 'Сменить название сайта во всём проекте', action: () => navigate('/admin/branding') },
                  { icon: '🔎', title: 'Проверить каталог', desc: 'Открыть публичный каталог книг', action: () => navigate('/books') },
                  { icon: '📖', title: 'Онлайн-читалка', desc: 'Проверить чтение первой книги с PDF', action: () => { const first = books.find(b => b.fileUrl); first ? navigate(`/read/${first.id}`) : toast('Сначала добавьте PDF книгу', { icon: '📖' }); } },
                ].map(({ icon, title, desc, action }) => (
                  <div
                    key={title}
                    onClick={action}
                    style={{
                      padding: '16px', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--color-border)', borderRadius: '12px',
                      cursor: 'pointer', transition: 'all 0.3s ease',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  >
                    <span style={{ fontSize: '24px' }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4f1', marginBottom: '3px' }}>{title}</div>
                      <div style={{ fontSize: '12px', color: '#5a7a63' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* GitHub API */}
              <div style={{
                padding: '20px',
                background: 'rgba(212,175,55,0.05)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '14px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#d4af37', marginBottom: '12px' }}>
                  🐙 GitHub API Интеграция
                </h3>
                <p style={{ fontSize: '13px', color: '#9db8a3', marginBottom: '16px', lineHeight: 1.6 }}>
                  Настройте интеграцию с GitHub для публикации контента прямо с этой панели. 
                  Введите токен доступа и репозиторий для автоматической синхронизации.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '11px', color: '#5a7a63', display: 'block', marginBottom: '6px' }}>
                      GitHub Token
                    </label>
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="input-field"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '11px', color: '#5a7a63', display: 'block', marginBottom: '6px' }}>
                      Репозиторий
                    </label>
                    <input
                      type="text"
                      placeholder="username/salaf-library"
                      className="input-field"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button className="btn-primary" onClick={() => navigate('/admin/settings')}>
                      <Globe size={14} /> Открыть настройки
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Books Tab */}
          {tab === 'books' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f4f1' }}>📚 Управление книгами</h2>
                <button className="btn-primary" onClick={() => navigate('/admin/import')}>
                  <Plus size={14} /> Импорт PDF
                </button>
              </div>

              {/* Add book form */}
              {showAddBook && (
                <div style={{
                  background: 'var(--color-bg-card)', border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '14px', padding: '24px', marginBottom: '20px',
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#d4af37', marginBottom: '16px' }}>
                    ➕ Новая книга
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[
                      { label: 'Название (RU)', placeholder: 'Название книги' },
                      { label: 'Название (AR)', placeholder: 'اسم الكتاب' },
                      { label: 'Автор', placeholder: 'Имя автора' },
                      { label: 'Категория', placeholder: 'Акыда, Хадисы...' },
                      { label: 'Язык', placeholder: 'Русский, Арабский' },
                      { label: 'Количество страниц', placeholder: '100' },
                    ].map(({ label, placeholder }) => (
                      <div key={label}>
                        <label style={{ fontSize: '11px', color: '#5a7a63', display: 'block', marginBottom: '6px' }}>
                          {label}
                        </label>
                        <input type="text" placeholder={placeholder} className="input-field" style={{ fontSize: '13px' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '14px' }}>
                    <label style={{ fontSize: '11px', color: '#5a7a63', display: 'block', marginBottom: '6px' }}>Описание</label>
                    <textarea
                      placeholder="Описание книги..."
                      rows={4}
                      style={{
                        width: '100%', padding: '12px 16px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px', color: '#f0f4f1', fontSize: '13px',
                        fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button className="btn-primary" onClick={() => navigate('/admin/import')}>
                      Перейти к импорту
                    </button>
                    <button className="btn-ghost" onClick={() => setShowAddBook(false)}>Отмена</button>
                  </div>
                </div>
              )}

              {/* Books list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {books.map(book => (
                  <div key={book.id} style={{
                    display: 'flex', gap: '14px', padding: '14px 16px',
                    background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                    borderRadius: '12px', alignItems: 'center',
                  }}>
                    <div style={{
                      width: '40px', height: '54px', borderRadius: '6px',
                      background: book.coverColor || '#1a3a2a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                    }}>
                      {book.coverEmoji || '📖'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4f1' }}>{book.title}</div>
                      <div style={{ fontSize: '12px', color: '#9db8a3' }}>{book.author} · {book.category}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {book.isNew && <span className="badge badge-green" style={{ fontSize: '9px' }}>NEW</span>}
                      {book.featured && <span className="badge badge-gold" style={{ fontSize: '9px' }}>⭐</span>}
                      <button
                        onClick={() => navigate(`/books/${book.id}`)}
                        style={{ background: 'none', border: 'none', color: '#9db8a3', cursor: 'pointer', padding: '4px' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => toast('Удаление требует подтверждения', { icon: '⚠️' })}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other tabs */}
          {(tab === 'authors' || tab === 'bios') && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f4f1', marginBottom: '20px' }}>
                {tab === 'authors' ? 'Авторы' : 'Биографии'}
              </h2>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px',
                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                borderRadius: '14px', marginBottom: '16px',
              }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#d4af37' }}>
                    {tab === 'bios' ? biographies.length : '—'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9db8a3' }}>записей в базе</div>
                </div>
                <button className="btn-primary" onClick={() => navigate('/admin/settings')}>
                  <Plus size={14} /> Управлять
                </button>
              </div>

              <div style={{
                padding: '24px', background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(212,175,55,0.2)', borderRadius: '14px',
                textAlign: 'center', color: '#5a7a63',
              }}>
                <Database size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px' }}>
                  Полный редактор будет доступен после подключения GitHub API
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
