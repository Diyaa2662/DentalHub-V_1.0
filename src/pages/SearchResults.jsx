// src/pages/SearchResults.jsx - صفحة نتائج البحث (معدلة لدعم external_url وقص الاسم إلى 75 محرف وعملة kr)
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { CURRENCY_SYMBOL } from "../constants/currency";
import {
  FaSearch,
  FaStar,
  FaShoppingCart,
  FaFilter,
  FaTag,
  FaExclamationTriangle,
  FaArrowLeft,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

const SearchResults = () => {
  const { t, i18n } = useTranslation(["common", "search"]);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [addingToCart, setAddingToCart] = useState({});

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";

    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      setError(t("search:noSearchQuery"));
      setLoading(false);
    }
    // ✅ التمرير إلى أعلى الصفحة عند تحميل الصفحة
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // ✅ دالة لقص النص إلى عدد محدد من المحارف
  const truncateText = (text, maxLength = 75) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // ✅ دالة لإنشاء رابط الصورة الكامل (مع دعم external_url)
  const getImageUrl = (image) => {
    if (!image) return null;

    if (
      image.url &&
      typeof image.url === "string" &&
      image.url.trim() &&
      image.url !== "there is no saved image"
    ) {
      if (image.url.startsWith("http://") || image.url.startsWith("https://")) {
        return image.url;
      }
      if (image.url.startsWith("/")) {
        return `https://back.dsndental.com${image.url}`;
      }
      if (image.url.startsWith("storage/")) {
        return `https://back.dsndental.com/${image.url}`;
      }
      return `https://back.dsndental.com/${image.url}`;
    }

    if (
      image.external_url &&
      typeof image.external_url === "string" &&
      image.external_url.trim() &&
      image.external_url !== "there is no external url"
    ) {
      return image.external_url;
    }

    return null;
  };

  const showNotification = (message, type = "success") => {
    setNotification({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        type: "success",
      });
    }, 3000);
  };

  const performSearch = async (query) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.post("/search", {
        value: query,
      });

      if (response.data && response.data.data) {
        setSearchResults(response.data.data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("❌ Error searching:", err);
      setError(err.response?.data?.message || t("common:error"));
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedResults = () => {
    let results = [...searchResults];

    switch (sortBy) {
      case "price_low":
        results.sort((a, b) => {
          const priceA =
            parseFloat(a.discount_price) || parseFloat(a.price) || 0;
          const priceB =
            parseFloat(b.discount_price) || parseFloat(b.price) || 0;
          return priceA - priceB;
        });
        break;

      case "price_high":
        results.sort((a, b) => {
          const priceA =
            parseFloat(a.discount_price) || parseFloat(a.price) || 0;
          const priceB =
            parseFloat(b.discount_price) || parseFloat(b.price) || 0;
          return priceB - priceA;
        });
        break;

      case "rating":
        results.sort((a, b) => {
          const ratingA = parseFloat(a.product_rate) || 0;
          const ratingB = parseFloat(b.product_rate) || 0;
          return ratingB - ratingA;
        });
        break;

      case "newest":
        results.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        break;

      case "relevance":
      default:
        break;
    }

    return results;
  };

  const handleAddToCart = async (productId, productName) => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      showNotification(
        i18n.language === "sv"
          ? "Vänligen logga in för att lägga till produkter i varukorgen"
          : "Please login to add items to cart",
        "error",
      );
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [productId]: true }));

    try {
      const response = await api.post(
        "/additemtoorder",
        {
          product_id: productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      showNotification(
        response.data?.message ||
          (i18n.language === "sv"
            ? `${productName} har lagts till i varukorgen`
            : `${productName} added to cart successfully`),
        "success",
      );
    } catch (err) {
      console.error("❌ Error adding to cart:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerData");
        showNotification(
          i18n.language === "sv"
            ? "Din session har gått ut. Var vänlig logga in igen"
            : "Your session has expired. Please login again",
          "error",
        );
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        showNotification(
          err.response?.data?.message ||
            (i18n.language === "sv"
              ? "Kunde inte lägga till produkten i varukorgen"
              : "Could not add product to cart"),
          "error",
        );
      }
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const getProductName = (product) => {
    if (
      i18n.language === "sv" &&
      product.s_name &&
      product.s_name.trim() !== ""
    ) {
      return product.s_name;
    }
    return product.name || t("common:noName");
  };

  const getDisplayPrice = (product) => {
    const price = parseFloat(product.price) || 0;
    const discountPrice = parseFloat(product.discount_price) || 0;

    if (discountPrice === 0 && price > 0) {
      return {
        displayPrice: 0,
        originalPrice: price,
        hasDiscount: true,
        discountPercentage: 100,
        isFree: true,
      };
    }

    if (discountPrice > 0 && discountPrice < price) {
      return {
        displayPrice: discountPrice,
        originalPrice: price,
        hasDiscount: true,
        discountPercentage: Math.round(((price - discountPrice) / price) * 100),
        isFree: false,
      };
    }

    return {
      displayPrice: price,
      originalPrice: null,
      hasDiscount: false,
      discountPercentage: 0,
      isFree: false,
    };
  };

  const renderStars = (rating) => {
    const stars = [];
    const ratingNum = parseFloat(rating) || 0;
    const fullStars = Math.floor(ratingNum);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const filteredResults = getFilteredAndSortedResults();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common:loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* تنبيهات */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 animate-fade-in-down ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          } border rounded-lg shadow-lg p-4 max-w-sm`}
        >
          <div className="flex items-start">
            <div
              className={`flex-shrink-0 ${
                notification.type === "success"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {notification.type === "success" ? (
                <FaCheckCircle className="text-lg" />
              ) : (
                <FaExclamationTriangle className="text-lg" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* الهيدر */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                {t("common:backToHome")}
              </Link>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t("search:searchResults")}
                </h1>
                <p className="text-gray-600 mt-1">
                  {searchQuery && (
                    <>
                      {t("search:searchFor")}: "
                      <span className="font-bold text-blue-600">
                        {searchQuery}
                      </span>
                      "
                    </>
                  )}
                  {filteredResults.length > 0 && (
                    <>
                      {" "}
                      • {filteredResults.length} {t("search:resultsFound")}
                    </>
                  )}
                </p>
              </div>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaSearch className="mr-2" />
              {t("search:browseAllProducts")}
            </Link>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FaExclamationTriangle className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">{error}</h3>
            <p className="text-gray-500 mb-8">
              {t("search:searchErrorDescription")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                {t("search:browseAllProducts")}
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {t("common:goBack")}
              </button>
            </div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FaSearch className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              {t("search:noResults")}
            </h3>
            <p className="text-gray-500 mb-8">
              {t("search:noResultsDescription")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                {t("search:browseAllProducts")}
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {t("search:tryDifferentSearch")}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* الشريط الجانبي للفلترة */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 sticky top-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t("search:filterResults")}
                  </h2>
                  {sortBy !== "relevance" && (
                    <button
                      onClick={() => setSortBy("relevance")}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center"
                    >
                      <FaTimes className="mr-1" />
                      {t("search:resetAll")}
                    </button>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">
                    {t("search:sortBy")}
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        value: "relevance",
                        label: t("search:relevance"),
                        icon: <FaSortAmountDown />,
                      },
                      {
                        value: "price_low",
                        label: t("search:priceLowHigh"),
                        icon: <FaSortAmountDown />,
                      },
                      {
                        value: "price_high",
                        label: t("search:priceHighLow"),
                        icon: <FaSortAmountUp />,
                      },
                      {
                        value: "rating",
                        label: t("search:highestRated"),
                        icon: <FaStar />,
                      },
                      {
                        value: "newest",
                        label: t("search:newestFirst"),
                        icon: <FaFilter />,
                      },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          id={`sort-${option.value}`}
                          name="sort"
                          value={option.value}
                          checked={sortBy === option.value}
                          onChange={() => setSortBy(option.value)}
                          className="h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label
                          htmlFor={`sort-${option.value}`}
                          className="ml-3 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors flex items-center"
                        >
                          <span className="mr-2 text-gray-500">
                            {option.icon}
                          </span>
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">
                      {t("search:searchSummary")}
                    </p>
                    <p>
                      {t("search:totalResults")}: {searchResults.length}
                    </p>
                    <p>
                      {t("search:showing")}: {filteredResults.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* نتائج البحث */}
            <div className="lg:col-span-3">
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center">
                  <FaSearch className="text-blue-600 mr-3" />
                  <div>
                    <p className="text-blue-800">
                      {t("search:searchingFor")}:{" "}
                      <span className="font-bold">"{searchQuery}"</span>
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                      {t("search:foundInTitlesDescriptions")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((product) => {
                  const priceInfo = getDisplayPrice(product);
                  const productName = getProductName(product);
                  const truncatedName = truncateText(productName, 75);
                  const isAdding = addingToCart[product.id] || false;

                  const productImageUrl =
                    product.images && product.images[0]
                      ? getImageUrl(product.images[0])
                      : null;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                    >
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {productImageUrl ? (
                          <>
                            <img
                              src={productImageUrl}
                              alt={productName}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-1"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                const parent = e.target.parentElement;
                                const fallback = document.createElement("div");
                                fallback.className =
                                  "w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200";
                                fallback.innerHTML =
                                  '<svg class="w-16 h-16 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
                                parent.appendChild(fallback);
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                            <FaTag className="text-4xl opacity-50" />
                          </div>
                        )}

                        {priceInfo.hasDiscount && (
                          <div className="absolute top-3 left-3">
                            <div className="relative">
                              <div
                                className={`text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg ${
                                  priceInfo.isFree
                                    ? "bg-gradient-to-r from-green-500 to-green-600"
                                    : "bg-gradient-to-r from-red-500 to-red-600"
                                }`}
                              >
                                {priceInfo.isFree
                                  ? i18n.language === "sv"
                                    ? "GRATIS"
                                    : "FREE"
                                  : `-${priceInfo.discountPercentage}%`}
                              </div>
                              <div
                                className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 ${
                                  priceInfo.isFree
                                    ? "bg-green-600"
                                    : "bg-red-600"
                                } rotate-45`}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        {/* ✅ اسم المنتج مقصوص إلى 75 محرف مع إضافة title للـ hover */}
                        <h3 className="font-bold text-gray-800 text-lg mb-2 hover:text-blue-600 transition-colors">
                          <Link
                            to={`/product/${product.id}`}
                            title={productName}
                          >
                            {truncatedName}
                          </Link>
                        </h3>

                        <div className="flex items-center mb-3">
                          <div className="flex">
                            {renderStars(product.product_rate)}
                          </div>
                          <span className="text-gray-500 text-sm ml-2">
                            ({product.product_rate})
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            {priceInfo.isFree ? (
                              <div className="flex flex-col">
                                <span className="text-2xl font-bold text-green-600">
                                  {i18n.language === "sv" ? "GRATIS" : "FREE"}
                                </span>
                                <span className="text-gray-400 line-through text-sm">
                                  {priceInfo.originalPrice.toFixed(2)}{" "}
                                  <span className="text-xs">
                                    {CURRENCY_SYMBOL}
                                  </span>
                                </span>
                              </div>
                            ) : (
                              <>
                                <span className="text-xl font-bold text-blue-600">
                                  {priceInfo.displayPrice.toFixed(2)}{" "}
                                  <span className="text-sm font-normal">
                                    {CURRENCY_SYMBOL}
                                  </span>
                                </span>
                                {priceInfo.hasDiscount &&
                                  priceInfo.displayPrice > 0 && (
                                    <span className="text-gray-400 line-through text-sm ml-2">
                                      {priceInfo.originalPrice.toFixed(2)}{" "}
                                      <span className="text-xs">
                                        {CURRENCY_SYMBOL}
                                      </span>
                                    </span>
                                  )}
                              </>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              handleAddToCart(product.id, productName)
                            }
                            disabled={isAdding}
                            className={`transition-colors ${
                              isAdding
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-400 hover:text-blue-600"
                            }`}
                            title={
                              isAdding
                                ? t("common:addingToCart")
                                : t("common:addToCart")
                            }
                          >
                            {isAdding ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600"></div>
                            ) : (
                              <FaShoppingCart size={22} />
                            )}
                          </button>
                        </div>

                        <Link
                          to={`/product/${product.id}`}
                          className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-lg font-medium text-center transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          {t("common:viewDetails")}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

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

        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SearchResults;
