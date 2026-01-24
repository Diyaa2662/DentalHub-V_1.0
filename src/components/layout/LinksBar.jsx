// src/components/layout/LinksBar.jsx - النسخة المعدلة مع نظام الترجمة الجديد
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaShoppingCart, FaGlobe, FaChevronDown } from "react-icons/fa";

const LinksBar = () => {
  const { t, i18n } = useTranslation(["navbar"]);
  const location = useLocation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const navLinks = [
    { path: "/", label: t("navbar:menu_home"), exact: true },
    { path: "/products", label: t("navbar:menu_shop"), exact: false },
    { path: "/about", label: t("navbar:menu_about"), exact: false },
    { path: "/contact", label: t("navbar:menu_contact"), exact: false },
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-blue-700 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* تبديل اللغة على اليسار */}
          <div className="relative group">
            <button className="flex items-center py-3 px-2 hover:bg-blue-800 transition-colors">
              <FaGlobe className="mr-2" />
              <span>{i18n.language === "en" ? "English" : "Svenska"}</span>
              <FaChevronDown className="ml-1" size={12} />
            </button>

            {/* قائمة اللغات */}
            <div className="absolute left-0 top-full mt-1 w-40 bg-white text-gray-800 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <button
                onClick={() => changeLanguage("en")}
                className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${i18n.language === "en" ? "bg-blue-100 text-blue-700" : ""}`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage("sv")}
                className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${i18n.language === "sv" ? "bg-blue-100 text-blue-700" : ""}`}
              >
                Svenska
              </button>
            </div>
          </div>

          {/* الروابط في المنتصف */}
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-3 px-1 font-medium transition-colors border-b-2 ${
                  isActive(link.path, link.exact)
                    ? "border-white text-white"
                    : "border-transparent hover:border-white/50 hover:text-white/90"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* سلة التسوق على اليمين */}
          <div className="relative">
            <Link
              to="/cart"
              className="flex items-center py-3 px-2 hover:bg-blue-800 transition-colors"
            >
              <FaShoppingCart size={20} />
              <span className="ml-2 hidden md:inline">
                {t("navbar:cart_cart")}
              </span>

              {/* عداد السلة */}
              <div className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                0
              </div>
            </Link>

            {/* تفاصيل السلة على hover */}
            <div className="absolute right-0 top-full mt-1 w-64 bg-white text-gray-800 rounded-lg shadow-xl p-4 opacity-0 invisible hover:opacity-100 hover:visible transition-all duration-300 z-50">
              <div className="text-center py-2 text-gray-500">
                {t("navbar:cart_empty")}
              </div>
              <Link
                to="/cart"
                className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-2"
              >
                {t("navbar:cart_view")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LinksBar;
