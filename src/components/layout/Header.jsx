// src/components/layout/Header.jsx - النسخة المعدلة مع container-max
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaShoppingCart,
  FaGlobe,
  FaChevronDown,
  FaUser,
  FaSignInAlt,
  FaSearch,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import api from "../../services/api";

const Header = () => {
  const { t, i18n } = useTranslation(["navbar"]);
  const location = useLocation();
  const navigate = useNavigate();

  // ========== حالة إخفاء/إظهار الهيدر عند التمرير ==========
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ========== حالة تسجيل الدخول ==========
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

  // ========== حالة السلة ==========
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartProducts, setCartProducts] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // ========== حالة الفئات ==========
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // ========== حالة البحث ==========
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);

  // ========== حالة القائمة المتنقلة ==========
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ========== جلب بيانات الفئات ==========
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get("/topbarlist", { timeout: 10000 });

      if (response.data && response.data.data) {
        const mainCategories = response.data.data;
        setCategories(mainCategories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // ========== جلب بيانات السلة ==========
  const fetchCartData = async () => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      setCartItemsCount(0);
      setCartTotal(0);
      setCartProducts([]);
      return;
    }

    try {
      setLoadingCart(true);
      const response = await api.get("/mycart", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });

      if (response.data && response.data.order) {
        setCartItemsCount(response.data.order.number_of_items || 0);
        setCartTotal(parseFloat(response.data.order.total_amount) || 0);
        setCartProducts(response.data.related_products?.slice(0, 3) || []);
      } else {
        setCartItemsCount(0);
        setCartTotal(0);
        setCartProducts([]);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCartItemsCount(0);
        setCartTotal(0);
        setCartProducts([]);
      } else {
        console.warn("Cart fetch error:", err.message);
        setCartItemsCount(0);
        setCartTotal(0);
        setCartProducts([]);
      }
    } finally {
      setLoadingCart(false);
    }
  };

  // ========== البحث ==========
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchExpanded(false);
      setSearchQuery("");
    }
  };

  // ========== أحداث ==========
  const handleCartClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/login");
      return;
    }
    navigate("/cart");
  };

  // ========== دالة عرض الفئات بشكل شجرة للـ Mega Menu ==========
  const renderCategoryTreeForMegaMenu = (category, level = 0) => {
    const categoryName =
      i18n.language === "sv" && category.s_name
        ? category.s_name
        : category.name;

    return (
      <div key={category.id} className="mb-3">
        <Link
          to={`/products?category=${category.id}`}
          className={`block transition-colors hover:text-blue-600 ${
            level === 0
              ? "text-gray-800 font-bold text-base mb-2 border-b border-gray-200 pb-1"
              : "text-gray-600 text-sm py-1 hover:pl-1 transition-all"
          }`}
          onClick={() => setOpenDropdown(null)}
        >
          {categoryName}
        </Link>
        {category.children && category.children.length > 0 && (
          <div className={`${level === 0 ? "ml-0" : "ml-4"} space-y-1`}>
            {category.children.map((child) =>
              renderCategoryTreeForMegaMenu(child, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  // ========== مراقبة التمرير لإخفاء/إظهار الهيدر ==========
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // ========== مراقبة تغييرات localStorage ==========
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(getInitialLoginStatus());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ========== جلب البيانات عند التحميل ==========
  useEffect(() => {
    fetchCategories();
    fetchCartData();
    const interval = setInterval(fetchCartData, 30000);
    return () => clearInterval(interval);
  }, []);

  // ========== إغلاق القائمة المنسدلة عند النقر خارجها ==========
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openDropdown]);

  // ========== تحديد الرابط النشط ==========
  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`w-full fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav className="bg-white border-b border-gray-200 w-full shadow-sm overflow-visible">
        {/* ✅ container-max موحد */}
        <div className="container-max py-3.5">
          {/* الصف الرئيسي */}
          <div className="flex items-center justify-between gap-6">
            {/* ========== القسم الأيسر: Logo + Language ========== */}
            <div className="flex items-center gap-4">
              {/* زر القائمة للهواتف */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-gray-700 hover:text-blue-600 focus:outline-none p-1"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <FaTimes size={22} />
                ) : (
                  <FaBars size={22} />
                )}
              </button>

              {/* Logo */}
              <Link
                to="/"
                className="text-xl md:text-2xl font-bold text-blue-700 whitespace-nowrap"
              >
                DSN Dental
              </Link>

              {/* زر تغيير اللغة - مصغر */}
              <div className="relative dropdown-container">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "language" ? null : "language",
                    )
                  }
                  className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors text-xs border border-gray-300 rounded-full px-3 py-1.5 bg-gray-50"
                >
                  <FaGlobe size={12} />
                  <span className="font-medium">
                    {i18n.language === "en" ? "EN" : "SV"}
                  </span>
                  <FaChevronDown
                    size={8}
                    className={`transition-transform ${
                      openDropdown === "language" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "language" && (
                  <div className="absolute left-0 top-full mt-2 w-32 bg-white text-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    <button
                      onClick={() => {
                        i18n.changeLanguage("en");
                        localStorage.setItem("i18nextLng", "en");
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        i18n.language === "en"
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : ""
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        i18n.changeLanguage("sv");
                        localStorage.setItem("i18nextLng", "sv");
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        i18n.language === "sv"
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : ""
                      }`}
                    >
                      Svenska
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ========== القسم الأوسط: الروابط (Desktop فقط) ========== */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                to="/"
                className={`font-medium transition-colors ${
                  isActive("/", true)
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {t("navbar:menu_home")}
              </Link>

              <Link
                to="/products"
                className={`font-medium transition-colors ${
                  isActive("/products", false)
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {t("navbar:menu_shop")}
              </Link>

              {/* Categories Mega Menu */}
              <div className="relative dropdown-container">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "categories" ? null : "categories",
                    )
                  }
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    openDropdown === "categories"
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {t("navbar:menu_categories")}
                  <FaChevronDown
                    size={12}
                    className={`transition-transform ${
                      openDropdown === "categories" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "categories" && (
                  <div className="fixed left-0 right-0 top-[60px] bg-white shadow-2xl border-t border-gray-200 z-40">
                    <div className="container-max py-8">
                      {loadingCategories ? (
                        <div className="text-center py-8 text-gray-500">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mx-auto mb-3"></div>
                          Loading categories...
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No categories found
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                          {categories.map((category) => (
                            <div key={category.id}>
                              {renderCategoryTreeForMegaMenu(category, 0)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/about"
                className={`font-medium transition-colors ${
                  isActive("/about", false)
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {t("navbar:menu_about")}
              </Link>

              <Link
                to="/contact"
                className={`font-medium transition-colors ${
                  isActive("/contact", false)
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {t("navbar:menu_contact")}
              </Link>
            </div>

            {/* ========== القسم الأيمن: Search + Cart + Profile (Desktop) ========== */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Search */}
              {isSearchExpanded ? (
                <form onSubmit={handleSearch} className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("navbar:search_placeholder")}
                    className="w-56 px-3 py-2 pl-9 pr-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                    autoFocus
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery("");
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes size={12} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setIsSearchExpanded(true);
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }}
                  className="text-blue-700 hover:text-blue-500 transition-colors p-1"
                  aria-label="Search"
                >
                  <FaSearch size={20} />
                </button>
              )}

              {/* Cart */}
              <div className="relative group">
                <button
                  onClick={handleCartClick}
                  className="relative text-blue-700 hover:text-blue-500 transition-colors p-1"
                  aria-label="Cart"
                >
                  <FaShoppingCart size={20} />
                  {!loadingCart && cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount > 99 ? "99+" : cartItemsCount}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown on Hover */}
                {cartProducts.length > 0 && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-white text-gray-800 rounded-lg shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100">
                    <h4 className="font-bold text-gray-900 text-sm mb-3 pb-2 border-b border-gray-100">
                      {t("navbar:recent_items")} ({cartItemsCount})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cartProducts.map((product) => {
                        const productName =
                          i18n.language === "sv" && product.s_name
                            ? product.s_name
                            : product.name;
                        const quantity = product.pivot?.quantity || 1;
                        const unitPrice =
                          parseFloat(
                            product.pivot?.unit_price || product.price,
                          ) || 0;
                        return (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img
                                  src={
                                    product.images[0].url.startsWith("/")
                                      ? `https://back.dsndental.com${product.images[0].url}`
                                      : product.images[0].url
                                  }
                                  alt={productName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <FaShoppingCart className="text-gray-400 text-xs" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {productName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {quantity} × ${unitPrice.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-sm font-bold text-blue-600 whitespace-nowrap">
                              ${((quantity || 1) * (unitPrice || 0)).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">
                          {t("navbar:subtotal")}:
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <Link
                        to="/cart"
                        className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        {t("navbar:cart_view")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile / Login */}
              {isLoggedIn ? (
                <Link
                  to="/profile"
                  className="text-blue-700 hover:text-blue-500 transition-colors p-1"
                  title={t("navbar:account")}
                >
                  <FaUser size={20} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-blue-700 hover:text-blue-500 transition-colors p-1"
                  title={t("navbar:login")}
                >
                  <FaSignInAlt size={20} />
                </Link>
              )}
            </div>

            {/* ========== Mobile: Icons ========== */}
            <div className="flex lg:hidden items-center gap-4">
              <button
                onClick={() => {
                  setIsSearchExpanded(!isSearchExpanded);
                  if (!isSearchExpanded) {
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }
                }}
                className="text-blue-700 hover:text-blue-500 p-1"
                aria-label="Search"
              >
                <FaSearch size={18} />
              </button>

              <button
                onClick={handleCartClick}
                className="relative text-blue-700 hover:text-blue-500 p-1"
                aria-label="Cart"
              >
                <FaShoppingCart size={18} />
                {!loadingCart && cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {cartItemsCount > 99 ? "99+" : cartItemsCount}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                <Link
                  to="/profile"
                  className="text-blue-700 hover:text-blue-500 p-1"
                  aria-label="Profile"
                >
                  <FaUser size={18} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-blue-700 hover:text-blue-500 p-1"
                  aria-label="Login"
                >
                  <FaSignInAlt size={18} />
                </Link>
              )}
            </div>
          </div>

          {/* ========== Mobile Search Bar ========== */}
          {isSearchExpanded && (
            <div className="mt-3 lg:hidden animate-fadeIn">
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("navbar:search_placeholder")}
                  className="w-full px-4 py-2.5 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setIsSearchExpanded(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <FaTimes />
                </button>
              </form>
            </div>
          )}

          {/* ========== Mobile Menu ========== */}
          {isMobileMenuOpen && (
            <div className="mt-4 lg:hidden animate-slideDown bg-white border-t border-gray-100 pt-4">
              <div className="flex flex-col space-y-3 pb-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("navbar:menu_home")}
                </Link>
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-blue-600 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("navbar:menu_shop")}
                </Link>

                {/* Mobile Categories - Tree View */}
                <div>
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === "mobile-categories"
                          ? null
                          : "mobile-categories",
                      )
                    }
                    className="flex items-center justify-between w-full text-gray-700 hover:text-blue-600 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <span>{t("navbar:menu_categories")}</span>
                    <FaChevronDown
                      size={12}
                      className={`transition-transform ${
                        openDropdown === "mobile-categories" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === "mobile-categories" && (
                    <div className="pl-4 mt-2 space-y-3 border-l-2 border-gray-200 ml-3">
                      {loadingCategories ? (
                        <div className="text-gray-500 text-sm py-2 text-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600 mx-auto mb-2"></div>
                          Loading...
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="text-gray-500 text-sm py-2 text-center">
                          No categories
                        </div>
                      ) : (
                        categories.map((category) => (
                          <div key={category.id}>
                            <Link
                              to={`/products?category=${category.id}`}
                              className="block font-medium text-gray-800 hover:text-blue-600 py-1.5"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {i18n.language === "sv" && category.s_name
                                ? category.s_name
                                : category.name}
                            </Link>
                            {category.children &&
                              category.children.length > 0 && (
                                <div className="pl-4 mt-1 space-y-1">
                                  {category.children.map((child) => (
                                    <div key={child.id}>
                                      <Link
                                        to={`/products?category=${child.id}`}
                                        className="block text-gray-600 hover:text-blue-600 py-1 text-sm"
                                        onClick={() =>
                                          setIsMobileMenuOpen(false)
                                        }
                                      >
                                        {i18n.language === "sv" && child.s_name
                                          ? child.s_name
                                          : child.name}
                                      </Link>
                                      {child.children &&
                                        child.children.length > 0 && (
                                          <div className="pl-4 mt-1 space-y-1">
                                            {child.children.map(
                                              (grandChild) => (
                                                <Link
                                                  key={grandChild.id}
                                                  to={`/products?category=${grandChild.id}`}
                                                  className="block text-gray-500 hover:text-blue-600 py-1 text-xs"
                                                  onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                  }
                                                >
                                                  {i18n.language === "sv" &&
                                                  grandChild.s_name
                                                    ? grandChild.s_name
                                                    : grandChild.name}
                                                </Link>
                                              ),
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <Link
                  to="/about"
                  className="text-gray-700 hover:text-blue-600 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("navbar:menu_about")}
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-700 hover:text-blue-600 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("navbar:menu_contact")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Header;
