import { useState } from 'react';
import { Settings, Globe, Database, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteTitle: 'Salaf Library',
    siteTitleAr: 'مكتبة السلف',
    defaultLanguage: 'ru',
    itemsPerPage: 20,
    enableAnalytics: true,
    enableComments: false,
    githubRepo: 'aminmod-bit/salaf-library',
    githubToken: '',
  });

  const handleSave = () => {
    setSaved(true);
    toast('Настройки сохранены', { icon: '✅' });
    setTimeout(() => setSaved(false), 3000);
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
            <Database size={16} className="text-blue-400" /> GitHub Integration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-slate-500 text-xs block mb-2">Репозиторий</label>
              <input
                type="text"
                value={settings.githubRepo}
                onChange={e => setSettings({ ...settings, githubRepo: e.target.value })}
                className="w-full bg-[#07182e]/50 border border-slate-700/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs block mb-2">GitHub Token</label>
              <input
                type="password"
                value={settings.githubToken}
                onChange={e => setSettings({ ...settings, githubToken: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#07182e]/50 border border-slate-700/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/30 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-colors"
          >
            <Save size={16} />
            Сохранить
          </button>
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
