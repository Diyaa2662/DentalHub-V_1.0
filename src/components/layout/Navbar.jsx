// src/components/layout/Navbar.jsx - النسخة المعدلة مع نظام الترجمة الجديد
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaSearch, FaUser, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const { t } = useTranslation(["navbar"]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
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
            {/* زر تسجيل الدخول/تسجيل الخروج */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
              >
                <FaSignOutAlt className="mr-1" />
                <span className="hidden md:inline">{t("navbar:logout")}</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              >
                <FaSignInAlt className="mr-1" />
                <span className="hidden md:inline">{t("navbar:login")}</span>
              </Link>
            )}

            {/* زر الملف الشخصي - يظهر فقط إذا كان المستخدم مسجل دخول */}
            {isLoggedIn && (
              <Link
                to="/profile"
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              >
                <FaUser className="mr-1" />
                <span className="hidden md:inline">{t("navbar:account")}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
