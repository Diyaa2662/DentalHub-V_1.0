// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// ملفات الترجمة الإنجليزية
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enNavbar from "./locales/en/navbar.json";
import enFooter from "./locales/en/footer.json";
import enProduct from "./locales/en/product.json";
import enAbout from "./locales/en/about.json";
import enContact from "./locales/en/contact.json";
import enAuth from "./locales/en/auth.json";
import enProfile from "./locales/en/profile.json";
import enCart from "./locales/en/cart.json";
import enOrders from "./locales/en/orders.json";
import enSearch from "./locales/en/search.json";

// ملفات الترجمة السويدية
import svCommon from "./locales/sv/common.json";
import svHome from "./locales/sv/home.json";
import svNavbar from "./locales/sv/navbar.json";
import svFooter from "./locales/sv/footer.json";
import svProduct from "./locales/sv/product.json";
import svAbout from "./locales/sv/about.json";
import svContact from "./locales/sv/contact.json";
import svAuth from "./locales/sv/auth.json";
import svProfile from "./locales/sv/profile.json";
import svCart from "./locales/sv/cart.json";
import svOrders from "./locales/sv/orders.json";
import svSearch from "./locales/sv/search.json";

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    navbar: enNavbar,
    footer: enFooter,
    product: enProduct,
    about: enAbout,
    contact: enContact,
    auth: enAuth,
    profile: enProfile,
    cart: enCart,
    orders: enOrders,
    search: enSearch,
  },
  sv: {
    common: svCommon,
    home: svHome,
    navbar: svNavbar,
    footer: svFooter,
    product: svProduct,
    about: svAbout,
    contact: svContact,
    auth: svAuth,
    profile: svProfile,
    cart: svCart,
    orders: svOrders,
    search: svSearch,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
