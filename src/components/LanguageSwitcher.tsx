import { useEffect } from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'ru', label: 'RU', name: 'Русский', dir: 'ltr' },
  { code: 'en', label: 'EN', name: 'English', dir: 'ltr' },
  { code: 'ar', label: 'AR', name: 'العربية', dir: 'rtl' },
  { code: 'tg', label: 'TG', name: 'Тоҷикӣ', dir: 'ltr' },
  { code: 'uz', label: 'UZ', name: 'O‘zbek', dir: 'ltr' },
  { code: 'fa', label: 'FA', name: 'فارسی', dir: 'rtl' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const lang = LANGUAGES.find(item => item.code === i18n.language) || LANGUAGES[0];
    document.documentElement.lang = lang.code;
    document.documentElement.dir = lang.dir;
  }, [i18n.language]);

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
        onChange={event => i18n.changeLanguage(event.target.value)}
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
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code} style={{ background: '#112a1a', color: '#f0f4f1' }}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
