// src/components/layout/LinksBar.jsx - النسخة المعدلة مع نظام الترجمة الجديد
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaShoppingCart,
  FaGlobe,
  FaChevronDown,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../../services/api";

const LinksBar = () => {
  const { t, i18n } = useTranslation(["navbar"]);
  const location = useLocation();
  const navigate = useNavigate();

  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartProducts, setCartProducts] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: t("navbar:menu_home"), exact: true },
    { path: "/products", label: t("navbar:menu_shop"), exact: false },
    { path: "/about", label: t("navbar:menu_about"), exact: false },
    { path: "/contact", label: t("navbar:menu_contact"), exact: false },
  ];

  // دالة لإظهار التنبيه
  const showNotification = (message, type = "error") => {
    setNotification({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        type: "error",
      });
    }, 3000);
  };

  // جلب بيانات السلة
  const fetchCartData = async () => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      // إذا لم يكن مسجل دخول، نعرض عدد 0 فقط
      setCartItemsCount(0);
      setCartTotal(0);
      setCartProducts([]);
      return;
    }

    try {
      setLoadingCart(true);
      const response = await api.get("/mycart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.order) {
        setCartItemsCount(response.data.order.number_of_items || 0);
        setCartTotal(parseFloat(response.data.order.total_amount) || 0);

        // تخزين بعض المنتجات لعرضها في hover
        if (
          response.data.related_products &&
          response.data.related_products.length > 0
        ) {
          setCartProducts(response.data.related_products.slice(0, 3)); // أول 3 منتجات فقط
        } else {
          setCartProducts([]);
        }
      } else {
        setCartItemsCount(0);
        setCartTotal(0);
        setCartProducts([]);
      }
    } catch (err) {
      // إذا كان الخطأ 401 (غير مسجل دخول) أو 404 (السلة فارغة)
      if (err.response?.status === 401) {
        // لا نحتاج لفعل أي شيء، العدد سيكون 0
      } else if (err.response?.status === 404) {
        setCartItemsCount(0);
        setCartTotal(0);
        setCartProducts([]);
      } else {
        console.error("Error fetching cart data:", err);
      }
      setCartItemsCount(0);
      setCartTotal(0);
      setCartProducts([]);
    } finally {
      setLoadingCart(false);
    }
  };

  // دالة للتعامل مع النقر على سلة التسوق
  const handleCartClick = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("customerToken");
    if (!token) {
      showNotification(
        i18n.language === "sv"
          ? "Vänligen logga in för att se varukorgen"
          : "Please login to view your cart",
        "error",
      );
      return;
    }

    // إذا كان مسجل دخول، انتقل للسلة
    navigate("/cart");
  };

  useEffect(() => {
    fetchCartData();

    // تحديث بيانات السلة كل 30 ثانية
    const interval = setInterval(fetchCartData, 30000);

    return () => clearInterval(interval);
  }, []);

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setIsLanguageMenuOpen(false);
  };

  return (
    <nav className="bg-blue-700 text-white">
      {/* تنبيهات */}
      {notification.show && (
        <div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down ${
            notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-green-50 border-green-200 text-green-800"
          } border rounded-lg shadow-lg p-4 max-w-sm`}
          style={{ zIndex: 9999 }}
        >
          <div className="flex items-start">
            <div
              className={`flex-shrink-0 ${
                notification.type === "error"
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              <FaExclamationTriangle className="text-lg" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* المحتوى الرئيسي */}
        <div className="flex items-center justify-between py-2">
          {/* تبديل اللغة على اليسار */}
          <div className="relative">
            <button
              onClick={toggleLanguageMenu}
              className="flex items-center py-2 px-3 hover:bg-blue-800 transition-colors rounded-lg text-sm md:text-base md:py-3 md:px-4"
            >
              <FaGlobe className="mr-2" />
              <span>{i18n.language === "en" ? "English" : "Svenska"}</span>
              <FaChevronDown className="ml-1" size={12} />
            </button>

            {/* قائمة اللغات */}
            {isLanguageMenuOpen && (
              <div className="absolute left-0 top-full mt-1 w-40 bg-white text-gray-800 rounded-lg shadow-xl py-2 z-50 animate-fadeIn">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                    i18n.language === "en" ? "bg-blue-100 text-blue-700" : ""
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage("sv")}
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                    i18n.language === "sv" ? "bg-blue-100 text-blue-700" : ""
                  }`}
                >
                  Svenska
                </button>
              </div>
            )}
          </div>

          {/* الروابط في المنتصف - تظهر فقط على الشاشات المتوسطة فما فوق */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-2 px-1 font-medium transition-colors border-b-2 text-sm lg:text-base lg:py-3 ${
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
            <button
              onClick={handleCartClick}
              className="flex items-center py-2 px-3 hover:bg-blue-800 transition-colors rounded-lg text-sm md:text-base md:py-3 md:px-4"
            >
              <FaShoppingCart size={18} className="md:size-20" />
              <span className="ml-2 hidden sm:inline">
                {t("navbar:cart_cart")}
              </span>

              {/* عداد السلة - مع تحميل إذا لزم */}
              {loadingCart ? (
                <div className="ml-2 w-5 h-5 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                </div>
              ) : cartItemsCount > 0 ? (
                <div className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount > 99 ? "99+" : cartItemsCount}
                </div>
              ) : null}
            </button>

            {/* تفاصيل السلة - تظهر فقط على hover للشاشات الكبيرة */}
            {cartProducts.length > 0 && (
              <div className="hidden lg:block absolute right-0 top-full mt-1 w-80 bg-white text-gray-800 rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="mb-3">
                  <h4 className="font-bold text-gray-900 text-sm mb-2">
                    {t("navbar:recent_items")} ({cartItemsCount})
                  </h4>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
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
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {product.images && product.images[0] ? (
                              <img
                                src={
                                  product.images[0].url.startsWith("/")
                                    ? `https://nethy-production.up.railway.app${product.images[0].url}`
                                    : product.images[0].url
                                }
                                alt={productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/50x50/3B82F6/FFFFFF?text=IMG";
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
                          <div className="text-sm font-bold text-blue-600">
                            ${((quantity || 1) * (unitPrice || 0)).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {t("navbar:subtotal")}:
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to="/cart"
                      className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      {t("navbar:cart_view")}
                    </Link>
                    <Link
                      to="/checkout"
                      className="flex-1 text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      {t("navbar:checkout")}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* الروابط للشاشات الصغيرة - تظهر على شكل أشرطة */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-blue-600 mt-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsLanguageMenuOpen(false)}
              className={`flex-1 text-center py-2 px-1 text-xs font-medium transition-colors ${
                isActive(link.path, link.exact)
                  ? "text-white bg-blue-800 rounded"
                  : "hover:text-white/90"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* CSS للأنيميشن */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default LinksBar;
