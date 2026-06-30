import { useMemo, useState, type CSSProperties } from 'react';
import { BadgeCheck, Brush, GitBranch, Loader2, RefreshCw, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGitHubFile, hasGitHubSettings, listGitHubFiles, loadGitHubSettings, slugifyFileName, upsertTextFile } from '../../utils/githubApi';

const TEXT_EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.html', '.xml', '.txt', '.yml', '.yaml', '.svg', '.css'];
const SKIP_PATHS = ['package-lock.json'];
const SKIP_PREFIXES = ['node_modules/', 'dist/', '.git/', 'public/catalog/'];

function isTextPath(path: string) {
  if (SKIP_PATHS.includes(path)) return false;
  if (SKIP_PREFIXES.some(prefix => path.startsWith(prefix))) return false;
  return TEXT_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext));
}

function replaceAll(value: string, replacements: Array<[string, string]>) {
  let next = value;
  for (const [from, to] of replacements) {
    if (!from.trim()) continue;
    next = next.split(from).join(to);
  }
  return next;
}

function brandSlug(value: string) {
  return slugifyFileName(value).replace(/\.[^.]+$/, '').replace(/^-+|-+$/g, '') || 'maktabah';
}

export default function AdminBrandingPage() {
  const [oldNames, setOldNames] = useState('Salaf Library\nMuslim Library');
  const [newName, setNewName] = useState('Maktabah');
  const [updatePackageName, setUpdatePackageName] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const replacements = useMemo<Array<[string, string]>>(() => {
    const names = oldNames.split('\n').map(v => v.trim()).filter(Boolean);
    const base: Array<[string, string]> = names.map(name => [name, newName.trim() || 'Maktabah']);
    if (updatePackageName) {
      const slug = brandSlug(newName.trim() || 'Maktabah');
      base.push(['salaf-library', slug], ['muslim-library', slug]);
    }
    return base;
  }, [oldNames, newName, updatePackageName]);

  const run = async () => {
    if (!hasGitHubSettings()) {
      toast.error('Сначала подключите GitHub API в настройках');
      return;
    }
    if (!newName.trim()) {
      toast.error('Введите новое название');
      return;
    }

    const settings = loadGitHubSettings();
    setProcessing(true);
    setLogs([`Репозиторий: ${settings.repo}`, `Branch: ${settings.branch}`, dryRun ? 'Режим: проверка без записи' : 'Режим: запись в GitHub']);

    try {
      const tree = await listGitHubFiles(settings);
      const candidates = tree.filter(file => isTextPath(file.path));
      setLogs(prev => [...prev, `Файлов для проверки: ${candidates.length}`]);

      let changed = 0;
      for (const file of candidates) {
        const current = await getGitHubFile(settings, file.path);
        if (!current?.content) continue;
        const next = replaceAll(current.content, replacements);
        if (next === current.content) continue;

        changed += 1;
        setLogs(prev => [...prev, `✦ ${dryRun ? 'Будет изменён' : 'Обновляется'}: ${file.path}`]);
        if (!dryRun) {
          await upsertTextFile(settings, file.path, next, `Rebrand to ${newName}: ${file.path}`);
        }
      }

      // Отдельно создаём/обновляем branding.json, чтобы будущие версии могли читать бренд централизованно.
      const branding = {
        siteName: newName.trim(),
        appName: newName.trim(),
        shortName: newName.trim(),
        updatedAt: new Date().toISOString(),
      };
      if (!dryRun) {
        await upsertTextFile(settings, 'public/data/branding.json', JSON.stringify(branding, null, 2) + '\n', `Update branding to ${newName}`);
      }

      setLogs(prev => [...prev, `Готово. Найдено изменений: ${changed}`, dryRun ? 'Проверка завершена. Отключите dry-run, чтобы применить.' : 'Изменения отправлены. Дождитесь GitHub Actions.']);
      toast.success(dryRun ? `Найдено файлов: ${changed}` : 'Ребрендинг отправлен в GitHub');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка ребрендинга';
      setLogs(prev => [...prev, `❌ ${message}`]);
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card" style={{ padding: 28, background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-card))' }}>
        <div style={{ color: '#d4af37', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <Brush size={16}/> Branding Center
        </div>
        <h1 style={{ color: '#f0f4f1', fontSize: 34, fontWeight: 950, marginBottom: 10 }}>Смена имени сайта</h1>
        <p style={{ color: '#9db8a3', lineHeight: 1.7, maxWidth: 820 }}>
          Этот инструмент меняет название бренда во всех текстовых файлах проекта через GitHub API: meta, manifest, README, компоненты, SEO-скрипты, SVG и конфигурацию. Сначала запустите проверку, затем примените изменения.
        </p>
      </div>

      <div className="glass-card" style={{ padding: 22, display: 'grid', gap: 16 }}>
        <label style={label}>Старые названия, каждое с новой строки</label>
        <textarea className="input-field" value={oldNames} onChange={e => setOldNames(e.target.value)} style={{ minHeight: 95 }} />

        <label style={label}>Новое название</label>
        <input className="input-field" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Maktabah" />

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', color: '#9db8a3' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={updatePackageName} onChange={e => setUpdatePackageName(e.target.checked)} />
            Обновить package slug / salaf-library
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)} />
            Проверка без записи
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={run} disabled={processing || !dryRun}>
            {processing && dryRun ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>} Проверить
          </button>
          <button className="btn-primary" onClick={run} disabled={processing || dryRun}>
            {processing && !dryRun ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Применить ребрендинг
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, color: '#d4af37', fontSize: 13, alignItems: 'center' }}>
          <GitBranch size={16}/> После применения GitHub Actions пересоберёт сайт и SEO-страницы.
        </div>
      </div>

      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: 18 }}>
          <h3 style={{ color: '#f0f4f1', fontWeight: 850, marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}><BadgeCheck size={16}/> Лог</h3>
          <div style={{ display: 'grid', gap: 6, fontFamily: 'monospace', fontSize: 12 }}>
            {logs.map((log, i) => <div key={i} style={{ color: log.startsWith('❌') ? '#ef4444' : log.startsWith('✦') ? '#d4af37' : '#9db8a3' }}>{log}</div>)}
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: 18, color: '#9db8a3', lineHeight: 1.65 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#d4af37', fontWeight: 850, marginBottom: 8 }}><Sparkles size={16}/> Рекомендация</div>
        Для смены названия на <b>Maktabah</b>: оставьте старые названия «Salaf Library» и «Muslim Library», введите «Maktabah», сначала нажмите «Проверить», затем снимите галочку «Проверка без записи» и нажмите «Применить ребрендинг».
      </div>
    </div>
  );
}

const label: CSSProperties = { color: '#9db8a3', fontSize: 12, fontWeight: 800, display: 'block' };
