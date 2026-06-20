import { useState } from 'react';
import { Settings, Globe, Database, Save, CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { loadGitHubSettings, saveGitHubSettings, testGitHubConnection } from '../../utils/githubApi';

export default function AdminSettingsPage() {
  const savedSettings = loadGitHubSettings();
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState({
    siteTitle: 'Salaf Library',
    siteTitleAr: 'مكتبة السلف',
    defaultLanguage: 'ru',
    itemsPerPage: 20,
    enableAnalytics: true,
    enableComments: false,
    githubRepo: savedSettings.repo,
    githubBranch: savedSettings.branch,
    githubToken: savedSettings.token,
  });

  const handleSave = () => {
    saveGitHubSettings({
      repo: settings.githubRepo,
      branch: settings.githubBranch || 'main',
      token: settings.githubToken,
    });
    setSaved(true);
    toast('Настройки GitHub сохранены в этом браузере', { icon: '✅' });
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      const repo = await testGitHubConnection({
        repo: settings.githubRepo,
        branch: settings.githubBranch || 'main',
        token: settings.githubToken,
      });
      toast.success(`Подключено: ${repo.full_name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка подключения GitHub');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white font-bold text-xl flex items-center gap-2">
        <Settings size={20} className="text-amber-400" />
        Настройки
      </h2>

      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-[#0c2240]/80 border border-slate-700/40">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Globe size={16} className="text-emerald-400" /> Основные
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs block mb-2">Название (RU)</label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={e => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full bg-[#07182e]/50 border border-slate-700/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs block mb-2">Название (AR)</label>
              <input
                type="text"
                value={settings.siteTitleAr}
                onChange={e => setSettings({ ...settings, siteTitleAr: e.target.value })}
                className="w-full bg-[#07182e]/50 border border-slate-700/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/30 transition-colors text-right"
                dir="rtl"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs block mb-2">Язык по умолчанию</label>
              <select
                value={settings.defaultLanguage}
                onChange={e => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full bg-[#07182e]/50 border border-slate-700/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/30 transition-colors"
              >
                <option value="ru">Русский</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="text-slate-500 text-xs block mb-2">Элементов на странице</label>
              <input
                type="number"
                value={settings.itemsPerPage}
                onChange={e => setSettings({ ...settings, itemsPerPage: parseInt(e.target.value) || 20 })}
                className="w-full bg-[#07182e]/50 border border-slate-700/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/30 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c2240]/80 border border-slate-700/40">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Database size={16} className="text-blue-400" /> 🐙 GitHub API Интеграция
          </h3>

          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-sm text-amber-100">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              Токен не вшивается в код сайта. Он хранится только в текущей вкладке браузера и исчезает после её закрытия.
              Используйте fine-grained token только для репозитория <b>salaf-library-1</b> с правом <b>Contents: Read and write</b>.
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-slate-500 text-xs block mb-2">Репозиторий</label>
              <input
                type="text"
                value={settings.githubRepo}
                onChange={e => setSettings({ ...settings, githubRepo: e.target.value })}
                placeholder="aminmod-bit/salaf-library-1"
                className="w-full bg-[#07182e]/50 border border-slate-700/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs block mb-2">Branch</label>
              <input
                type="text"
                value={settings.githubBranch}
                onChange={e => setSettings({ ...settings, githubBranch: e.target.value })}
                placeholder="main"
                className="w-full bg-[#07182e]/50 border border-slate-700/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs block mb-2">GitHub Token</label>
              <input
                type="password"
                value={settings.githubToken}
                onChange={e => setSettings({ ...settings, githubToken: e.target.value })}
                placeholder="github_pat_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#07182e]/50 border border-slate-700/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/30 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-colors"
            >
              <Save size={16} />
              Сохранить
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !settings.githubToken || !settings.githubRepo}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              {testing ? 'Проверка...' : 'Проверить GitHub'}
            </button>
          </div>
          {saved && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle size={16} />
              Сохранено
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
