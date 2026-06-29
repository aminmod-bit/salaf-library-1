import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ru from './locales/ru.json';
import ar from './locales/ar.json';
import en from './locales/en.json';
import tg from './locales/tg.json';
import uz from './locales/uz.json';
import fa from './locales/fa.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      ar: { translation: ar },
      en: { translation: en },
      tg: { translation: tg },
      uz: { translation: uz },
      fa: { translation: fa },
    },
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'en', 'ar', 'tg', 'uz', 'fa'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
