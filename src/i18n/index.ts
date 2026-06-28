import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ru, en, ar, tg, uz, fa } from "./locales";

const STORAGE_KEY = "salaf.lang";

const supportedLngs = ["ru", "en", "ar", "tg", "uz", "fa"] as const;

function detectInitial(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (supportedLngs as readonly string[]).includes(saved)) return saved;
    const navLang = (navigator.language || "ru").toLowerCase();
    if (navLang.startsWith("ru")) return "ru";
    if (navLang.startsWith("ar")) return "ar";
    if (navLang.startsWith("tg")) return "tg";
    if (navLang.startsWith("uz")) return "uz";
    if (navLang.startsWith("fa")) return "fa";
    if (navLang.startsWith("en")) return "en";
  } catch {}
  return "ru";
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      ar: { translation: ar },
      tg: { translation: tg },
      uz: { translation: uz },
      fa: { translation: fa },
    },
    lng: detectInitial(),
    fallbackLng: "ru",
    supportedLngs: supportedLngs as unknown as string[],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export const setLanguage = (lng: string) => {
  if (!(supportedLngs as readonly string[]).includes(lng)) return;
  i18n.changeLanguage(lng);
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = (lng === "ar" || lng === "fa") ? "rtl" : "ltr";
  } catch {}
};

export const SUPPORTED_LANGS = supportedLngs;
export default i18n;