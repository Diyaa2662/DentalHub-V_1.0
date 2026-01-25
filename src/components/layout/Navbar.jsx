// src/components/layout/Navbar.jsx - النسخة المعدلة مع نظام الترجمة الجديد
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaSearch,
  FaUser,
  FaSignInAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Navbar = () => {
  const { t } = useTranslation(["navbar"]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // احسب حالة تسجيل الدخول مباشرة عند التهيئة
  const getInitialLoginStatus = () => {
    const token = localStorage.getItem("customerToken");
    const customerData = localStorage.getItem("customerData");
    if (token && customerData) {
      try {
        const parsedData = JSON.parse(customerData);
        if (parsedData && parsedData.email) {
          return true;
        }
      } catch (err) {
        console.error("Error parsing customer data:", err);
      }
    }
    return false;
  };

  const [isLoggedIn, setIsLoggedIn] = useState(getInitialLoginStatus);

  // الاستماع لتغييرات localStorage فقط
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(getInitialLoginStatus());
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    // مسح بيانات الزبون فقط
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerData");
    localStorage.removeItem("customerEmail");
    sessionStorage.removeItem("customerToken");
    sessionStorage.removeItem("customerData");

    // تحديث حالة تسجيل الدخول
    setIsLoggedIn(false);

    // إعادة تحميل الصفحة
    window.location.href = "/";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchExpanded(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsSearchExpanded(false);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        {/* الصف الأول: اللوجو وزر القائمة وزر البحث */}
        <div className="flex items-center justify-between">
          {/* زر القائمة للهواتف */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
            aria-label="فتح القائمة"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* اللوجو في المنتصف للهواتف، على اليسار للشاشات الكبيرة */}
          <Link
            to="/"
            className={`text-xl md:text-2xl font-bold text-blue-700 ${
              isSearchExpanded ? "hidden md:block" : ""
            }`}
          >
            DentalHub
          </Link>

          {/* شريط البحث للشاشات الكبيرة */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-4">
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

          {/* زر البحث للهواتف */}
          <button
            onClick={toggleSearch}
            className="lg:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
            aria-label="بحث"
          >
            <FaSearch size={20} />
          </button>

          {/* قسم المستخدم للشاشات الكبيرة */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* زر تسجيل الدخول/تسجيل الخروج */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <FaSignOutAlt className="mr-2" />
                <span>{t("navbar:logout")}</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <FaSignInAlt className="mr-2" />
                <span>{t("navbar:login")}</span>
              </Link>
            )}

            {/* زر الملف الشخصي - يظهر فقط إذا كان المستخدم مسجل دخول */}
            {isLoggedIn && (
              <Link
                to="/profile"
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <FaUser className="mr-2" />
                <span>{t("navbar:account")}</span>
              </Link>
            )}
          </div>
        </div>

        {/* شريط البحث المتنقل للهواتف */}
        {isSearchExpanded && (
          <div className="mt-3 lg:hidden animate-fadeIn">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("navbar:search_placeholder")}
                className="w-full px-4 py-3 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                autoFocus
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setIsSearchExpanded(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </form>
          </div>
        )}

        {/* القائمة المتنقلة للهواتف */}
        {isMobileMenuOpen && (
          <div className="mt-3 lg:hidden animate-slideDown bg-white border border-gray-200 rounded-lg shadow-lg py-3">
            <div className="px-4 space-y-3">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors py-3 border-b border-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaUser className="mr-3" />
                    <span>{t("navbar:account")}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center text-gray-700 hover:text-red-600 transition-colors py-3 w-full text-left"
                  >
                    <FaSignOutAlt className="mr-3" />
                    <span>{t("navbar:logout")}</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors py-3 border-b border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaSignInAlt className="mr-3" />
                  <span>{t("navbar:login")}</span>
                </Link>
              )}

              {/* روابط إضافية يمكن إضافتها لاحقاً */}
              <Link
                to="/"
                className="block py-3 text-gray-700 hover:text-blue-600 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("navbar:home")}
              </Link>
              <Link
                to="/products"
                className="block py-3 text-gray-700 hover:text-blue-600 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("navbar:products")}
              </Link>
              <Link
                to="/cart"
                className="block py-3 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("navbar:cart")}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* أنميشن الـ CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
