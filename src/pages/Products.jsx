// src/pages/Products.jsx - النسخة المعدلة مع container-max
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { CURRENCY_SYMBOL } from "../constants/currency";
import {
  FaStar,
  FaShoppingCart,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaTag,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChevronDown,
} from "react-icons/fa";

const Products = () => {
  const { t, i18n } = useTranslation(["common", "product"]);
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالة للتنبيهات
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // حالة للتصفية
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);

  // ✅ حالة لعرض المزيد من الفئات
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(15);
  const [loadingMoreCategories, setLoadingMoreCategories] = useState(false);
  const CATEGORIES_INCREMENT = 15;

  // حالة للصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // حالة لإضافة المنتجات للسلة
  const [addingToCart, setAddingToCart] = useState({});

  // ✅ الفئات المعروضة حالياً
  const visibleCategories = categories.slice(0, visibleCategoriesCount);
  const hasMoreCategories = categories.length > visibleCategoriesCount;

  // ✅ دالة لقص النص
  const truncateText = (text, maxLength = 75) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // ✅ دالة لتحميل المزيد من الفئات
  const loadMoreCategories = () => {
    setLoadingMoreCategories(true);
    setTimeout(() => {
      setVisibleCategoriesCount((prev) => prev + CATEGORIES_INCREMENT);
      setLoadingMoreCategories(false);
    }, 300);
  };

  // ✅ دالة لإعادة ضبط عدد الفئات المعروضة
  const resetCategoriesVisibility = () => {
    setVisibleCategoriesCount(CATEGORIES_INCREMENT);
  };

  // ✅ دالة لإنشاء رابط الصورة الكامل
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

  // ✅ دالة للحصول على أول صورة صالحة للمنتج
  const getProductImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      const image = product.images[0];
      return getImageUrl(image);
    }
    return null;
  };

  // ✅ جلب المنتجات حسب الفئة
  const fetchProductsByCategory = async (categoryId, isInitial = true) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.post("/categoryfilter", {
        categories: [categoryId],
      });

      if (response.data && response.data.date) {
        const allProducts = [];
        response.data.date.forEach((categoryGroup) => {
          if (categoryGroup.products && Array.isArray(categoryGroup.products)) {
            allProducts.push(...categoryGroup.products);
          }
        });
        setProducts(allProducts);
        setHasMorePages(false);
        setCurrentPage(1);
      } else {
        setProducts([]);
        setHasMorePages(false);
      }
    } catch (err) {
      setError(t("common:error"));
      console.error("❌ Error fetching products by category:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ========== جلب المنتجات العادية ==========
  const fetchProducts = async () => {
    try {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.get(`/shop?page=${currentPage}`);

      if (
        response.data &&
        response.data.date &&
        response.data.date.length > 0
      ) {
        setProducts(response.data.date);
        setHasMorePages(response.data.date.length === 28);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        if (currentPage === 1) {
          setProducts([]);
        }
        setHasMorePages(false);
      }
    } catch (err) {
      setError(t("common:error"));
      console.error("❌ Error fetching products:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ========== قراءة الفئة من الرابط ==========
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get("category");

    if (categoryId) {
      const categoryIdNum = parseInt(categoryId);
      if (!isNaN(categoryIdNum)) {
        setSelectedCategories([categoryIdNum]);
        setShowFilter(true);
        fetchProductsByCategory(categoryIdNum, true);
      }
    } else {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // ========== جلب الفئات ==========
  const fetchCategoriesList = async () => {
    try {
      const response = await api.get("/categories?from=shop");
      if (response.data && response.data.data) {
        const activeCategories = response.data.data.filter(
          (cat) => cat.enabled === true,
        );
        setCategories(activeCategories);
      }
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
      setCategories([]);
    }
  };

  // ========== جلب الفئات عند التحميل ==========
  useEffect(() => {
    fetchCategoriesList();
  }, []);

  // ========== إعادة ضبط عدد الفئات عند إغلاق الفلتر ==========
  useEffect(() => {
    if (!showFilter) {
      resetCategoriesVisibility();
    }
  }, [showFilter]);

  // ========== مراقبة تغيير الصفحة ==========
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasCategoryParam = params.has("category");

    if (
      !hasCategoryParam &&
      selectedCategories.length === 0 &&
      currentPage > 1
    ) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // ========== مراقبة تغيير الفئات ==========
  useEffect(() => {
    if (selectedCategories.length > 0) {
      filterProducts();
    } else if (selectedCategories.length === 0 && !loading) {
      setCurrentPage(1);
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories]);

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
              ? `Kunde inte lägga till ${productName} i varukorgen`
              : `Could not add ${productName} to cart`),
          "error",
        );
      }
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // ========== فلتر المنتجات ==========
  const filterProducts = async () => {
    try {
      setFilterLoading(true);
      const response = await api.post("/categoryfilter", {
        categories: selectedCategories,
      });

      if (response.data && response.data.date) {
        const allProducts = [];
        response.data.date.forEach((categoryGroup) => {
          if (categoryGroup.products && Array.isArray(categoryGroup.products)) {
            allProducts.push(...categoryGroup.products);
          }
        });
        setProducts(allProducts);
        setHasMorePages(false);
        setCurrentPage(1);
      } else {
        setProducts([]);
        setHasMorePages(false);
        setCurrentPage(1);
      }
    } catch (err) {
      setError(t("common:error"));
      console.error("❌ Error filtering products:", err);
    } finally {
      setFilterLoading(false);
    }
  };

  const getCategoryName = (category) => {
    if (
      i18n.language === "sv" &&
      category.s_name &&
      category.s_name.trim() !== ""
    ) {
      return category.s_name;
    }
    return category.name || "Uncategorized";
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

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // ========== حذف فئة واحدة ==========
  const removeCategory = (categoryId) => {
    if (selectedCategories.length === 1) {
      setSelectedCategories([]);
      setShowFilter(false);
      setCurrentPage(1);
      navigate("/products", { replace: true });
      fetchProducts();
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    }
  };

  // ========== مسح جميع الفلاتر ==========
  const clearFilters = () => {
    setSelectedCategories([]);
    setShowFilter(false);
    setCurrentPage(1);
    navigate("/products", { replace: true });
    fetchProducts();
  };

  const loadNextPage = () => {
    if (hasMorePages && !loadingMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const loadPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
                <FaShoppingCart className="text-lg" />
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
        <div className="container-max py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {t("common:shop")}
              </h1>
              <p className="text-gray-600 mt-2">
                {products.length} {t("common:productsFound")}
                {selectedCategories.length > 0 && ` (${t("common:filtered")})`}
                {selectedCategories.length === 0 &&
                  ` - ${t("common:page")} ${currentPage}`}
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((categoryId) => {
                    const category = categories.find(
                      (c) => c.id === categoryId,
                    );
                    return category ? (
                      <div
                        key={categoryId}
                        className="flex items-center bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        <span>{getCategoryName(category)}</span>
                        <button
                          onClick={() => removeCategory(categoryId)}
                          className="ml-2 text-blue-500 hover:text-blue-800 transition-colors"
                          aria-label="Remove filter"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
              >
                <FaFilter />
                {t("common:filter")}
                {selectedCategories.length > 0 && (
                  <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {selectedCategories.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container-max py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* الشريط الجانبي للتصفية */}
          {showFilter && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-24">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">
                    {t("common:filterByCategory")}
                  </h2>
                  <button
                    onClick={clearFilters}
                    disabled={selectedCategories.length === 0}
                    className={`text-sm font-medium transition-colors ${
                      selectedCategories.length === 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:text-blue-800"
                    }`}
                  >
                    {t("common:clearAll")}
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    {t("common:showingCategories")}: {visibleCategories.length}{" "}
                    / {categories.length}
                  </p>
                </div>

                {filterLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600 text-sm">
                      {t("common:loading")}
                    </p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    {t("common:noCategories")}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {visibleCategories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => toggleCategory(category.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="ml-3 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors truncate"
                            title={getCategoryName(category)}
                          >
                            {getCategoryName(category)}
                          </label>
                        </div>
                      ))}
                    </div>

                    {hasMoreCategories && (
                      <div className="mt-4">
                        <button
                          onClick={loadMoreCategories}
                          disabled={loadingMoreCategories}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {loadingMoreCategories ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-600"></div>
                              {t("common:loading")}
                            </>
                          ) : (
                            <>
                              <FaChevronDown size={12} />
                              {t("common:showMore")} (+
                              {categories.length - visibleCategoriesCount})
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      {t("common:selectedCategories")}:{" "}
                      <span className="font-bold text-blue-600">
                        {selectedCategories.length}
                      </span>
                    </p>
                    <p>
                      {t("common:productsShowing")}:{" "}
                      <span className="font-bold text-blue-600">
                        {products.length}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* المنتجات */}
          <div className={showFilter ? "lg:col-span-3" : "lg:col-span-4"}>
            {error ? (
              <div className="text-center py-16">
                <h3 className="text-2xl text-red-600 mb-4">{error}</h3>
                <button
                  onClick={() => {
                    if (selectedCategories.length > 0) {
                      filterProducts();
                    } else {
                      fetchProducts();
                    }
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {t("common:tryAgain")}
                </button>
              </div>
            ) : products.length === 0 && !loadingMore ? (
              <div className="text-center py-16">
                <h3 className="text-2xl text-gray-600">
                  {t("common:noProducts")}
                </h3>
                <p className="text-gray-500 mt-2">
                  {selectedCategories.length > 0
                    ? t("common:noProductsInCategory")
                    : t("common:noProductsAvailable")}
                </p>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {t("common:clearFilters")}
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* شبكة المنتجات */}
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 ${
                    showFilter ? "lg:grid-cols-3" : "lg:grid-cols-4"
                  } gap-6`}
                >
                  {products.map((product) => {
                    const priceInfo = getDisplayPrice(product);
                    const productName = getProductName(product);
                    const isAdding = addingToCart[product.id] || false;
                    const productImageUrl = getProductImageUrl(product);
                    const truncatedName = truncateText(productName, 75);

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group flex flex-col"
                      >
                        {/* صورة المنتج */}
                        <div className="relative h-52 bg-gray-100 overflow-hidden flex-shrink-0">
                          {productImageUrl ? (
                            <>
                              <img
                                src={productImageUrl}
                                alt={productName}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-2"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                  const parent = e.target.parentElement;
                                  const fallback =
                                    document.createElement("div");
                                  fallback.className =
                                    "w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200";
                                  fallback.innerHTML =
                                    '<svg class="w-16 h-16 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
                                  parent.appendChild(fallback);
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                              <FaTag className="text-4xl opacity-50" />
                            </div>
                          )}

                          {/* علامة الخصم */}
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
                              </div>
                            </div>
                          )}
                        </div>

                        {/* معلومات المنتج */}
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-800 text-base mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                            <Link
                              to={`/product/${product.id}`}
                              title={productName}
                            >
                              {truncatedName}
                            </Link>
                          </h3>

                          {product.artical && (
                            <p className="text-xs text-gray-500 mb-3">
                              {t("common:article")}:{" "}
                              <span className="font-medium">
                                {product.artical}
                              </span>
                            </p>
                          )}

                          <div className="mt-auto">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center flex-wrap gap-2">
                                {priceInfo.isFree ? (
                                  <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-green-600">
                                      {i18n.language === "sv"
                                        ? "GRATIS"
                                        : "FREE"}
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
                                        <span className="text-gray-400 line-through text-sm">
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
                                className={`transition-all p-2 rounded-lg ${
                                  isAdding
                                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                                    : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
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
                                  <FaShoppingCart size={20} />
                                )}
                              </button>
                            </div>

                            <Link
                              to={`/product/${product.id}`}
                              className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-lg font-medium text-center transition-all duration-300 text-sm shadow-md hover:shadow-lg"
                            >
                              {t("common:viewDetails")}
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* أزرار التنقل بين الصفحات */}
                {selectedCategories.length === 0 && products.length > 0 && (
                  <div className="mt-12 flex flex-col items-center gap-5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={loadPreviousPage}
                        disabled={currentPage === 1 || loadingMore}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                          currentPage === 1 || loadingMore
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gray-800 hover:bg-gray-900 text-white shadow-md hover:shadow-lg"
                        }`}
                      >
                        <FaChevronLeft />
                        {t("common:previousPage")}
                      </button>

                      <div className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md">
                        {t("common:page")} {currentPage}
                        {!hasMorePages &&
                          currentPage > 1 &&
                          ` (${t("common:lastPage")})`}
                      </div>

                      <button
                        onClick={loadNextPage}
                        disabled={!hasMorePages || loadingMore}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                          !hasMorePages || loadingMore
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gray-800 hover:bg-gray-900 text-white shadow-md hover:shadow-lg"
                        }`}
                      >
                        {t("common:nextPage")}
                        <FaChevronRight />
                      </button>
                    </div>

                    {loadingMore && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600"></div>
                        <span>{t("common:loadingMore")}</span>
                      </div>
                    )}

                    <div className="text-gray-500 text-sm">
                      {t("common:showing")} {products.length}{" "}
                      {t("common:products")}
                      {hasMorePages && ` - ${t("common:morePagesAvailable")}`}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
};

export default Products;
