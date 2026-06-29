import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LanguageOption {
  code: string;
  label: string;
  name: string;
  dir: 'ltr' | 'rtl';
}

const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: 'ru', label: 'RU', name: 'Русский', dir: 'ltr' },
  { code: 'en', label: 'EN', name: 'English', dir: 'ltr' },
];

async function loadLanguageResource(i18n: ReturnType<typeof useTranslation>['i18n'], code: string) {
  if (i18n.hasResourceBundle(code, 'translation')) return;
  const response = await fetch(`./locales/${code}.json`, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Locale ${code} not found`);
  const data = await response.json();
  i18n.addResourceBundle(code, 'translation', data, true, true);
}

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [languages, setLanguages] = useState<LanguageOption[]>(DEFAULT_LANGUAGES);
  const current = languages.find(lang => lang.code === (i18n.resolvedLanguage || i18n.language)) ||
    languages.find(lang => lang.code === (i18n.language || '').split('-')[0]) ||
    languages[0];

  useEffect(() => {
    fetch('./data/languages.json', { cache: 'no-cache' })
      .then(res => res.ok ? res.json() : DEFAULT_LANGUAGES)
      .then(data => Array.isArray(data) && data.length ? setLanguages(data) : setLanguages(DEFAULT_LANGUAGES))
      .catch(() => setLanguages(DEFAULT_LANGUAGES));
  }, []);

  useEffect(() => {
    const lang = languages.find(item => item.code === (i18n.resolvedLanguage || i18n.language)) ||
      languages.find(item => item.code === (i18n.language || '').split('-')[0]) ||
      languages[0];
    document.documentElement.lang = lang.code;
    document.documentElement.dir = lang.dir;
  }, [i18n.language, i18n.resolvedLanguage, languages]);

  const changeLanguage = async (code: string) => {
    try {
      await loadLanguageResource(i18n, code);
    } catch {
      // If a locale file is not present, i18next will fallback to Russian.
    }
    await i18n.changeLanguage(code);
  };

  return (
    <label
      title="Сменить язык"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '7px 9px',
        borderRadius: 10,
        border: '1px solid rgba(212,175,55,.16)',
        background: 'rgba(255,255,255,.05)',
        color: '#d4af37',
        fontSize: 12,
        fontWeight: 800,
        cursor: 'pointer',
      }}
    >
      <Languages size={15} />
      <select
        value={current.code}
        onChange={event => changeLanguage(event.target.value)}
        style={{
          appearance: 'none',
          border: 0,
          outline: 0,
          background: 'transparent',
          color: '#d4af37',
          font: 'inherit',
          cursor: 'pointer',
          maxWidth: 54,
        }}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code} style={{ background: '#112a1a', color: '#f0f4f1' }}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
