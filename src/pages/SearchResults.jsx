// src/pages/SearchResults.jsx - صفحة نتائج البحث
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
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
} from "react-icons/fa";

const SearchResults = () => {
  const { t, i18n } = useTranslation(["common", "search"]);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance"); // relevance, price_low, price_high, rating, newest
  const [filterInStock, setFilterInStock] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    // استخراج query parameter من الرابط
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";

    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      setError(t("search:noSearchQuery"));
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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

  // فلترة وترتيب النتائج
  const getFilteredAndSortedResults = () => {
    let results = [...searchResults];

    // فلترة حسب التوفر
    if (filterInStock) {
      results = results.filter((product) => product.status === "instock");
    }

    // ترتيب النتائج
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
        // الترتيب الافتراضي كما أتى من السيرفر
        break;
    }

    return results;
  };

  // دالة إضافة للسلة
  const handleAddToCart = async (productId, productName) => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      alert(
        i18n.language === "sv"
          ? "Vänligen logga in för att lägga till produkter i varukorgen"
          : "Please login to add items to cart",
      );
      navigate("/login");
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

      alert(
        response.data?.message ||
          (i18n.language === "sv"
            ? `${productName} har lagts till i varukorgen`
            : `${productName} added to cart successfully`),
      );
    } catch (err) {
      console.error("❌ Error adding to cart:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerData");
        navigate("/login");
      } else {
        alert(
          err.response?.data?.message ||
            (i18n.language === "sv"
              ? "Kunde inte lägga till produkten i varukorgen"
              : "Could not add product to cart"),
        );
      }
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // دالة لبناء رابط الصورة الكامل
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=No+Image";
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
      return `https://nethy-production.up.railway.app${imageUrl}`;
    }

    return `https://nethy-production.up.railway.app/${imageUrl}`;
  };

  // دالة للحصول على اسم المنتج حسب اللغة
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

  // دالة لتحديد سعر العرض الصحيح
  const getDisplayPrice = (product) => {
    const price = parseFloat(product.price) || 0;
    const discountPrice = parseFloat(product.discount_price) || 0;

    if (discountPrice > 0 && discountPrice < price) {
      return {
        displayPrice: discountPrice,
        originalPrice: price,
        hasDiscount: true,
        discountPercentage: Math.round(((price - discountPrice) / price) * 100),
      };
    }

    return {
      displayPrice: price,
      originalPrice: null,
      hasDiscount: false,
      discountPercentage: 0,
    };
  };

  // دالة لعرض النجوم
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

  // النتائج بعد الفلترة والترتيب
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

            {/* زر بحث جديد */}
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
                  {(filterInStock || sortBy !== "relevance") && (
                    <button
                      onClick={() => {
                        setFilterInStock(false);
                        setSortBy("relevance");
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      <FaTimes className="mr-1" />
                      {t("search:resetAll")}
                    </button>
                  )}
                </div>

                {/* الترتيب */}
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

                {/* ملخص النتائج */}
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
                    {filterInStock && (
                      <p className="text-green-600">
                        {t("search:filteredInStock")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* نتائج البحث */}
            <div className="lg:col-span-3">
              {/* رسالة بحث */}
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

              {/* شبكة المنتجات */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((product) => {
                  const priceInfo = getDisplayPrice(product);
                  const productName = getProductName(product);
                  const isAdding = addingToCart[product.id] || false;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                    >
                      {/* صورة المنتج */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {product.images && product.images[0] ? (
                          <>
                            <img
                              src={getFullImageUrl(product.images[0].url)}
                              alt={productName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=No+Image";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                            <FaTag className="text-4xl opacity-50" />
                          </div>
                        )}

                        {/* علامة الخصم */}
                        {priceInfo.hasDiscount && (
                          <div className="absolute top-3 left-3">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                              -{priceInfo.discountPercentage}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* معلومات المنتج */}
                      <div className="p-4">
                        {/* الاسم */}
                        <h3 className="font-bold text-gray-800 text-lg mb-2 truncate hover:text-blue-600 transition-colors">
                          <Link to={`/product/${product.id}`}>
                            {productName}
                          </Link>
                        </h3>

                        {/* التقييم */}
                        <div className="flex items-center mb-3">
                          <div className="flex">
                            {renderStars(product.product_rate)}
                          </div>
                          <span className="text-gray-500 text-sm ml-2">
                            ({product.product_rate})
                          </span>
                        </div>

                        {/* السعر */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-blue-600">
                              ${priceInfo.displayPrice.toFixed(2)}
                            </span>
                            {priceInfo.hasDiscount && (
                              <span className="text-gray-400 line-through text-sm ml-2">
                                ${priceInfo.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {/* زر السلة */}
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

                        {/* زر التفاصيل */}
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
    </div>
  );
};

export default SearchResults;
