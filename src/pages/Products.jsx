// src/pages/Products.jsx - النسخة المعدلة مع دعم external_url
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
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

  // حالة للصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // حالة لإضافة المنتجات للسلة
  const [addingToCart, setAddingToCart] = useState({});

  // ✅ دالة لإنشاء رابط الصورة الكامل (مع دعم external_url)
  const getImageUrl = (image) => {
    if (!image) return null;

    // الأولوية للـ url (الملف المحلي)
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
        return `http://back.neotonicglobal.com${image.url}`;
      }
      if (image.url.startsWith("storage/")) {
        return `http://back.neotonicglobal.com/${image.url}`;
      }
      return `http://back.neotonicglobal.com/${image.url}`;
    }

    // إذا لم يكن هناك url صالح، نستخدم external_url
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

  // ✅ ========== جلب المنتجات حسب الفئة (باستخدام /categoryfilter) ==========
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

  // ========== جلب المنتجات العادية (باجينيشن) ==========
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
        // ✅ بما أن كل صفحة تجيب 28 منتج، نقارن مع 28
        setHasMorePages(response.data.date.length === 28);
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

  // ========== قراءة الفئة من الرابط وتطبيق الفلتر ==========
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
      const response = await api.get("/categories");
      if (response.data && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
      setCategories([]);
    }
  };

  // ========== جلب الفئات عند تحميل الصفحة ==========
  useEffect(() => {
    fetchCategoriesList();
  }, []);

  // ========== مراقبة تغيير الصفحة (للباجينيشن فقط) ==========
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

  // ========== مراقبة تغيير الفئات (للفلتر اليدوي من شريط الفلتر) ==========
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasCategoryParam = params.has("category");

    // ✅ منع التنفيذ إذا كان هناك category في الرابط
    if (hasCategoryParam) return;

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

  // ========== فلتر المنتجات (للفلتر اليدوي من شريط الفلتر) ==========
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
    // إذا كان هناك فئة واحدة فقط، نمسح الفلتر بالكامل
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("common:shop")}
              </h1>
              <p className="text-gray-600 mt-1">
                {products.length} {t("common:productsFound")}
                {selectedCategories.length > 0 && ` (${t("common:filtered")})`}
                {selectedCategories.length === 0 &&
                  ` - ${t("common:page")} ${currentPage}`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((categoryId) => {
                    const category = categories.find(
                      (c) => c.id === categoryId,
                    );
                    return category ? (
                      <div
                        key={categoryId}
                        className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{getCategoryName(category)}</span>
                        <button
                          onClick={() => removeCategory(categoryId)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
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
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* الشريط الجانبي للتصفية */}
          {showFilter && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 sticky top-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t("common:filterByCategory")}
                  </h2>
                  <button
                    onClick={clearFilters}
                    disabled={selectedCategories.length === 0}
                    className={`text-sm ${
                      selectedCategories.length === 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:text-blue-800"
                    }`}
                  >
                    {t("common:clearAll")}
                  </button>
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
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="ml-3 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {getCategoryName(category)}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <p>
                      {t("common:selectedCategories")}:{" "}
                      {selectedCategories.length}
                    </p>
                    <p className="mt-2">
                      {t("common:productsShowing")}: {products.length}
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

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                      >
                        {/* صورة المنتج */}
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                          {productImageUrl ? (
                            <>
                              <img
                                src={productImageUrl}
                                alt={productName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                        {/* معلومات المنتج */}
                        <div className="p-4">
                          <h3 className="font-bold text-gray-800 text-lg mb-2 truncate hover:text-blue-600 transition-colors">
                            <Link to={`/product/${product.id}`}>
                              {productName}
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
                                    ${priceInfo.originalPrice.toFixed(2)}
                                  </span>
                                  <span className="text-xs text-green-500 font-medium mt-1">
                                    {i18n.language === "sv"
                                      ? "Begränsad erbjudande"
                                      : "Limited Offer"}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <span className="text-xl font-bold text-blue-600">
                                    ${priceInfo.displayPrice.toFixed(2)}
                                  </span>
                                  {priceInfo.hasDiscount &&
                                    priceInfo.displayPrice > 0 && (
                                      <span className="text-gray-400 line-through text-sm ml-2">
                                        ${priceInfo.originalPrice.toFixed(2)}
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

                {/* أزرار التنقل بين الصفحات */}
                {selectedCategories.length === 0 && products.length > 0 && (
                  <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={loadPreviousPage}
                        disabled={currentPage === 1 || loadingMore}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                          currentPage === 1 || loadingMore
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gray-800 hover:bg-gray-900 text-white"
                        }`}
                      >
                        <FaChevronLeft />
                        {t("common:previousPage")}
                      </button>

                      <div className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg">
                        {t("common:page")} {currentPage}
                        {!hasMorePages &&
                          currentPage > 1 &&
                          ` (${t("common:lastPage")})`}
                      </div>

                      <button
                        onClick={loadNextPage}
                        disabled={!hasMorePages || loadingMore}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                          !hasMorePages || loadingMore
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gray-800 hover:bg-gray-900 text-white"
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
      `}</style>
    </div>
  );
};

export default Products;
