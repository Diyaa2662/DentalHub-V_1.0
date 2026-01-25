// src/pages/Products.jsx - النسخة المعدلة مع إضافة للسلة
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالة للتنبيهات
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success", // success, error, info
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (selectedCategories.length > 0) {
      filterProducts();
    } else {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories]);

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
        // ✅ بيانات المنتجات تأتي مباشرة
        setProducts(response.data.date);

        // إذا كان عدد المنتجات أقل من 10، فهذه آخر صفحة
        setHasMorePages(response.data.date.length === 10);
      } else {
        // إذا كانت المصفوفة فارغة، هذه آخر صفحة
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

  const fetchCategories = async () => {
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

  // دالة لإظهار التنبيه
  const showNotification = (message, type = "success") => {
    setNotification({
      show: true,
      message,
      type,
    });

    // إخفاء التنبيه بعد 3 ثواني
    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        type: "success",
      });
    }, 3000);
  };

  // وظيفة إضافة منتج للسلة
  const handleAddToCart = async (productId, productName) => {
    // التحقق من تسجيل الدخول
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

    // تحديث حالة الإضافة لهذا المنتج
    setAddingToCart((prev) => ({ ...prev, [productId]: true }));

    try {
      const response = await api.post(
        "/additemtoorder",
        {
          product_id: productId,
          quantity: 1, // الكمية الافتراضية
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data && response.data.message) {
        showNotification(
          response.data.message ||
            (i18n.language === "sv"
              ? `${productName} har lagts till i varukorgen`
              : `${productName} added to cart successfully`),
          "success",
        );
      } else {
        showNotification(
          i18n.language === "sv"
            ? `${productName} har lagts till i varukorgen`
            : `${productName} added to cart successfully`,
          "success",
        );
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);

      let errorMessage = "";

      if (err.response?.status === 401) {
        // التوكن غير صالح
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerData");
        errorMessage =
          i18n.language === "sv"
            ? "Din session har gått ut. Var vänlig logga in igen"
            : "Your session has expired. Please login again";

        showNotification(errorMessage, "error");

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else if (err.response?.status === 422) {
        // خطأ في التحقق
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        errorMessage =
          firstError ||
          (i18n.language === "sv"
            ? "Ogiltig produktdata"
            : "Invalid product data");
        showNotification(errorMessage, "error");
      } else {
        errorMessage =
          err.response?.data?.message ||
          (i18n.language === "sv"
            ? `Kunde inte lägga till ${productName} i varukorgen`
            : `Could not add ${productName} to cart`);
        showNotification(errorMessage, "error");
      }
    } finally {
      // إزالة حالة الإضافة لهذا المنتج
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const filterProducts = async () => {
    try {
      setFilterLoading(true);

      // إرسال طلب POST لتصفية المنتجات
      const response = await api.post("/categoryfilter", {
        categories: selectedCategories,
      });

      if (response.data && response.data.date) {
        // ✅ تصحيح: بيانات الفلترة تأتي بهيكلية مختلفة
        // هيكلية الفلترة: [{category: "...", products: [...]}, ...]
        // نحتاج لتحويلها إلى مصفوفة مسطحة من المنتجات

        const allProducts = [];

        response.data.date.forEach((categoryGroup) => {
          if (categoryGroup.products && Array.isArray(categoryGroup.products)) {
            allProducts.push(...categoryGroup.products);
          }
        });

        setProducts(allProducts);
        setHasMorePages(false); // عند التصفية، لا يوجد صفحات
        setCurrentPage(1); // نرجع للصفحة الأولى عند التصفية
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

  // دالة للحصول على اسم الفئة حسب اللغة
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

  // إدارة الفئات المختارة
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // إزالة الفئة المحددة
  const removeCategory = (categoryId) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  // مسح جميع الفلاتر
  const clearFilters = () => {
    setSelectedCategories([]);
    setCurrentPage(1);
  };

  // تحميل الصفحة التالية
  const loadNextPage = () => {
    if (hasMorePages && !loadingMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // العودة للصفحة السابقة
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

            {/* فلتر */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
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

                          {/* علامة الخصم فقط */}
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

                {/* أزرار التنقل بين الصفحات - تظهر فقط عند عدم وجود فلترة */}
                {selectedCategories.length === 0 && products.length > 0 && (
                  <div className="mt-12 flex flex-col items-center gap-4">
                    {/* أزرار التنقل */}
                    <div className="flex items-center gap-4">
                      {/* زر الصفحة السابقة */}
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

                      {/* رقم الصفحة الحالية */}
                      <div className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg">
                        {t("common:page")} {currentPage}
                        {!hasMorePages &&
                          currentPage > 1 &&
                          ` (${t("common:lastPage")})`}
                      </div>

                      {/* زر الصفحة التالية */}
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

                    {/* تحميل المزيد */}
                    {loadingMore && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600"></div>
                        <span>{t("common:loadingMore")}</span>
                      </div>
                    )}

                    {/* معلومات الصفحة */}
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

        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Products;
