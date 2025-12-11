import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'sv'],
    interpolation: {
      escapeValue: false
    },
    resources: {
      en: { translation: {} }, // سيتم تحميلها ديناميكياً
      sv: { translation: {} }  // سيتم تحميلها ديناميكياً
    }
  });

export default i18n;
