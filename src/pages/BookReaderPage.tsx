import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

function toAbsoluteUrl(url: string) {
  try {
    return new URL(url, document.baseURI).toString();
  } catch {
    return url;
  }
}

export default function BookReaderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, addToHistory } = useStore();
  const book = books.find(b => b.id === id);

  const pdfUrl = useMemo(() => book?.fileUrl ? toAbsoluteUrl(book.fileUrl) : '', [book?.fileUrl]);

  useEffect(() => {
    if (!book?.fileUrl) return;
    addToHistory({
      id: book.id,
      type: 'book',
      title: book.title,
      subtitle: book.author,
      visitedAt: new Date().toISOString(),
      coverColor: book.coverColor,
      coverEmoji: book.coverEmoji,
      coverImage: book.coverImage,
    });
  }, [addToHistory, book?.author, book?.coverColor, book?.coverEmoji, book?.coverImage, book?.fileUrl, book?.id, book?.title]);

  if (!book) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#5a7a63' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📕</div>
        <div style={{ fontSize: '20px', fontWeight: 600, color: '#9db8a3' }}>Книга не найдена</div>
        <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={() => navigate('/books')}>
          <ArrowLeft size={16} /> Назад к книгам
        </button>
      </div>
    );
  }

  const openExternal = () => {
    if (!pdfUrl) {
      toast('PDF файл пока не добавлен', { icon: '📖' });
      return;
    }
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const download = () => {
    const url = book.downloadUrl || book.fileUrl;
    if (!url) {
      toast('PDF файл пока не добавлен', { icon: '📥' });
      return;
    }
    window.open(toAbsoluteUrl(url), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1400px', margin: '0 auto', height: 'calc(100vh - 120px)', minHeight: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <button className="btn-ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Назад
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#f0f4f1', fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</div>
            <div style={{ color: '#9db8a3', fontSize: 12 }}>{book.author}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={openExternal}><ExternalLink size={15} /> Открыть в новой вкладке</button>
          <button className="btn-primary" onClick={download}><Download size={15} /> Скачать PDF</button>
        </div>
      </div>

      <div className="glass-card" style={{ flex: 1, overflow: 'hidden', background: '#07130b' }}>
        {pdfUrl ? (
          <object data={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`} type="application/pdf" width="100%" height="100%">
            <iframe
              title={`Чтение книги ${book.title}`}
              src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
              style={{ width: '100%', height: '100%', border: 0, background: '#111' }}
            />
            <div style={{ padding: 32, textAlign: 'center' }}>
              <FileText size={42} className="text-amber-400" />
              <p style={{ color: '#9db8a3', margin: '16px 0' }}>Ваш браузер не смог показать PDF внутри страницы.</p>
              <button className="btn-primary" onClick={openExternal}>Открыть PDF</button>
            </div>
          </object>
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: '#9db8a3' }}>
            PDF файл для этой книги пока не добавлен.
          </div>
        )}
      </div>
    </div>
  );
}
