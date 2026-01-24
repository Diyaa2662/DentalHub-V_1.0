// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ملفات الترجمة الإنجليزية
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enNavbar from './locales/en/navbar.json';
import enFooter from './locales/en/footer.json';
import enProduct from './locales/en/product.json';

// ملفات الترجمة السويدية
import svCommon from './locales/sv/common.json';
import svHome from './locales/sv/home.json';
import svNavbar from './locales/sv/navbar.json';
import svFooter from './locales/sv/footer.json';
import svProduct from './locales/sv/product.json';

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    navbar: enNavbar,
    footer: enFooter,
    product: enProduct
  },
  sv: {
    common: svCommon,
    home: svHome,
    navbar: svNavbar,
    footer: svFooter,
    product: svProduct
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;