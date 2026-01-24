// src/components/layout/Navbar.jsx - النسخة المعدلة مع نظام الترجمة الجديد
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaSearch, FaUser, FaSignInAlt } from "react-icons/fa";

const Navbar = () => {
  const { t } = useTranslation(["navbar"]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* الاسم على اليسار */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-700">
              DentalHub
            </Link>
          </div>

          {/* شريط البحث في المنتصف */}
          <div className="flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("navbar:search_placeholder")}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </form>
          </div>

          {/* تسجيل الدخول والملف الشخصي على اليمين */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <FaSignInAlt className="mr-1" />
              <span className="hidden md:inline">{t("navbar:login")}</span>
            </Link>

            <Link
              to="/account"
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <FaUser className="mr-1" />
              <span className="hidden md:inline">{t("navbar:account")}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
