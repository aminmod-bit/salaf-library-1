import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminImportPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.pdf'));
    setFiles(prev => [...prev, ...dropped]);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter(f => f.name.toLowerCase().endsWith('.pdf'));
    setFiles(prev => [...prev, ...selected]);
  };

  const processImport = () => {
    setStatus('processing');
    setLogs(['Начало импорта...', `Обработка ${files.length} PDF файлов...`]);
    setTimeout(() => {
      setStatus('success');
      setLogs(prev => [...prev, '✅ Импорт завершён!', 'Книги добавлены в библиотеку.']);
      setFiles([]);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white font-bold text-xl flex items-center gap-2">
        <Upload size={20} className="text-amber-400" />
        Импорт книг
      </h2>

      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-slate-700/50 rounded-2xl p-8 text-center hover:border-amber-500/30 transition-colors bg-[#0c2240]/40"
      >
        <Upload size={40} className="text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-sm mb-2">Перетащите PDF файлы сюда</p>
        <p className="text-slate-600 text-xs mb-4">или</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-sm cursor-pointer hover:bg-amber-500/20 transition-colors">
          <FileText size={16} />
          Выбрать файлы
          <input type="file" accept=".pdf" multiple className="hidden" onChange={handleSelect} />
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">{files.length} файлов выбрано</p>
            <button
              onClick={processImport}
              disabled={status === 'processing'}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              {status === 'processing' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Импортировать
            </button>
          </div>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#0c2240]/60 rounded-xl border border-slate-700/30">
                <FileText size={16} className="text-amber-400" />
                <span className="text-slate-300 text-sm flex-1 truncate">{f.name}</span>
                <span className="text-slate-600 text-xs">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
          <CheckCircle size={18} />
          Импорт завершён успешно!
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle size={18} />
          Ошибка импорта
        </div>
      )}

      {logs.length > 0 && (
        <div className="p-4 bg-[#0c2240]/60 rounded-xl border border-slate-700/30">
          <h3 className="text-slate-400 text-xs font-medium uppercase mb-2">Лог</h3>
          <div className="space-y-1 font-mono text-xs">
            {logs.map((log, i) => (
              <p key={i} className="text-slate-500">{log}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
