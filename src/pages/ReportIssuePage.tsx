import { useMemo, useState, type CSSProperties } from 'react';
import { AlertTriangle, CheckCircle, Copy, ExternalLink, MessageSquare } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function ReportIssuePage() {
  const { books } = useStore();
  const [bookId, setBookId] = useState('');
  const [type, setType] = useState('Ошибка в книге');
  const [message, setMessage] = useState('');
  const selected = books.find(b => b.id === bookId);

  const issueText = useMemo(() => {
    return [
      `Тип: ${type}`,
      selected ? `Книга: ${selected.title} (${selected.id})` : 'Книга: не выбрана',
      selected ? `Автор: ${selected.author}` : '',
      '',
      'Описание проблемы:',
      message || 'Опишите проблему здесь...',
      '',
      `Страница сайта: ${typeof window !== 'undefined' ? window.location.origin : 'https://salaflibrary.org'}`,
    ].filter(Boolean).join('\n');
  }, [type, selected, message]);

  const copy = async () => {
    await navigator.clipboard.writeText(issueText);
    toast.success('Текст обращения скопирован');
  };

  return (
    <div className="fade-in" style={{ maxWidth: 980, margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: 30, marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#d4af37', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          <MessageSquare size={16} /> Обратная связь
        </div>
        <h1 style={{ color: '#f0f4f1', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, lineHeight: 1.08, marginBottom: 12 }}>Сообщить об ошибке</h1>
        <p style={{ color: '#9db8a3', lineHeight: 1.75, maxWidth: 720 }}>
          Если PDF не открывается, указан неверный автор, ошибка в названии или есть проблема с содержимым — сформируйте обращение. Пока сайт работает без backend, форма подготавливает текст, который можно отправить владельцу проекта или создать как GitHub Issue.
        </p>
      </section>

      <section className="glass-card" style={{ padding: 24, display: 'grid', gap: 16 }}>
        <div>
          <label style={label}>Тип проблемы</label>
          <select value={type} onChange={e => setType(e.target.value)} className="input-field">
            <option>Ошибка в книге</option>
            <option>PDF не открывается</option>
            <option>Неверный автор</option>
            <option>Неверная категория</option>
            <option>Проблема с переводом</option>
            <option>Предложение по улучшению</option>
          </select>
        </div>
        <div>
          <label style={label}>Книга</label>
          <select value={bookId} onChange={e => setBookId(e.target.value)} className="input-field">
            <option value="">Не выбрана</option>
            {books.map(book => <option key={book.id} value={book.id}>{book.title}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Описание</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} className="input-field" style={{ minHeight: 130, resize: 'vertical' }} placeholder="Например: книга не открывается на телефоне / автор указан неверно / нужна другая категория..." />
        </div>

        <div style={{ padding: 16, border: '1px solid rgba(212,175,55,.16)', borderRadius: 14, background: 'rgba(255,255,255,.03)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#d4af37', fontWeight: 800, marginBottom: 8 }}><AlertTriangle size={16}/> Готовый текст обращения</div>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#9db8a3', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{issueText}</pre>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={copy}><Copy size={16}/> Скопировать</button>
          <a className="btn-secondary" href="https://github.com/aminmod-bit/salaf-library-1/issues" target="_blank" rel="noreferrer"><ExternalLink size={16}/> GitHub Issues</a>
        </div>

        <div style={{ display: 'flex', gap: 10, color: '#22c55e', fontSize: 13, alignItems: 'center' }}>
          <CheckCircle size={16}/> В следующих версиях можно подключить автоматическую отправку без копирования.
        </div>
      </section>
    </div>
  );
}

const label: CSSProperties = { display: 'block', color: '#9db8a3', fontSize: 12, fontWeight: 700, marginBottom: 8 };
