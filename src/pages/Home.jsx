// src/pages/Home.jsx - النسخة المعدلة مع دعم external_url
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import {
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
  FaEye,
  FaTag,
  FaExclamationTriangle,
} from "react-icons/fa";

const Home = () => {
  const { t, i18n } = useTranslation(["home", "common"]);
  const navigate = useNavigate();
  const [categoriesData, setCategoriesData] = useState([]); // للفئات مع منتجاتها
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sliderProducts, setSliderProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // حالة للتنبيهات
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Refs for scrollable sections
  const categoryRefs = useRef({});
  const autoSlideInterval = useRef(null);

  useEffect(() => {
    fetchHomeData();

    // الكشف عن حجم الشاشة
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  // بدء التمرير التلقائي بعد تحميل البيانات
  useEffect(() => {
    if (sliderProducts.length > 0) {
      startAutoSlide();
    }

    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderProducts.length]);

  const startAutoSlide = () => {
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
    }

    autoSlideInterval.current = setInterval(() => {
      nextSlide();
    }, 5000);
  };

  const stopAutoSlide = () => {
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
      autoSlideInterval.current = null;
    }
  };

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
        return `https://nethy.onrender.com${image.url}`;
      }
      if (image.url.startsWith("storage/")) {
        return `https://nethy.onrender.com/${image.url}`;
      }
      return `https://nethy.onrender.com/${image.url}`;
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

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      const langParam = i18n.language === "sv" ? "sv" : "en";

      // ✅ إضافة timeout مخصص لهذا الطلب
      const response = await api.get(`/mainpage?lang=${langParam}`, {
        timeout: 60000, // 60 ثانية
      });

      const recommendedProducts = response.data.data.recommended_products || [];
      setSliderProducts(recommendedProducts);

      const categoriesWithProducts =
        response.data.data.top_products_by_categories || [];
      const validCategories = categoriesWithProducts.filter(
        (category) => category.products && category.products.length > 0,
      );
      setCategoriesData(validCategories);
    } catch (err) {
      setError(t("common:error"));
      console.error("Error fetching home data:", err);
    } finally {
      setLoading(false);
    }
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

  const handleAddToCart = async (productId) => {
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

      if (response.data && response.data.message) {
        showNotification(
          response.data.message ||
            (i18n.language === "sv"
              ? "Produkten har lagts till i varukorgen"
              : "Product added to cart successfully"),
          "success",
        );
      } else {
        showNotification(
          i18n.language === "sv"
            ? "Produkten har lagts till i varukorgen"
            : "Product added to cart successfully",
          "success",
        );
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);

      let errorMessage = "";

      if (err.response?.status === 401) {
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
            ? "Kunde inte lägga till produkten i varukorgen"
            : "Could not add product to cart");
        showNotification(errorMessage, "error");
      }
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      if (prev === sliderProducts.length - 1) {
        return 0;
      } else {
        return prev + 1;
      }
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (prev === 0) {
        return sliderProducts.length - 1;
      } else {
        return prev - 1;
      }
    });
  };

  const scrollLeft = (category) => {
    if (categoryRefs.current[category]) {
      categoryRefs.current[category].scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = (category) => {
    if (categoryRefs.current[category]) {
      categoryRefs.current[category].scrollBy({
        left: 300,
        behavior: "smooth",
      });
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

  // دالة للوصف - تبحث في الحقول المتاحة
  const getProductDescription = (product, forMobile = false) => {
    let description = "";

    // محاولة الحصول على الوصف حسب اللغة
    if (i18n.language === "sv") {
      description =
        product.s_supplier_description || product.s_package_description || "";
    } else if (i18n.language === "en") {
      description =
        product.e_supplier_description || product.e_package_description || "";
    } else {
      description =
        product.d_supplier_description || product.d_package_description || "";
    }

    // إذا لم يوجد وصف، استخدم الاسم كبديل
    if (!description || description.trim() === "") {
      description = getProductName(product);
    }

    // قص الوصف إذا كان لشاشة الموبايل (5 كلمات فقط)
    if (forMobile && isMobile) {
      const words = description.split(" ");
      if (words.length > 5) {
        return words.slice(0, 5).join(" ") + "...";
      }
    }

    return description;
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
    const hasHalfStar = ratingNum % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common:loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl">{error}</p>
          <button
            onClick={fetchHomeData}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {t("common:tryAgain")}
          </button>
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

      {/* السلايدر - يستخدم recommended_products */}
      <section
        className="relative pt-16 md:pt-0 md:h-[500px] overflow-hidden bg-gradient-to-r from-blue-500 to-blue-200"
        onMouseEnter={stopAutoSlide}
        onMouseLeave={startAutoSlide}
      >
        {sliderProducts.length > 0 ? (
          <div className="relative w-full h-full">
            <div className="h-full">
              <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {sliderProducts.map((product, index) => {
                  const priceInfo = getDisplayPrice(product);
                  const productName = getProductName(product);
                  const productDescription = getProductDescription(
                    product,
                    true,
                  );
                  const productImageUrl = getProductImageUrl(product);

                  return (
                    <div
                      key={product.id}
                      className="min-w-full h-full flex-shrink-0"
                    >
                      {isMobile ? (
                        // تصميم الموبايل - عمودي
                        <div className="h-full flex flex-col items-center justify-center px-4 py-8">
                          <div className="w-full max-w-xs mb-6">
                            {productImageUrl ? (
                              <img
                                src={productImageUrl}
                                alt={productName}
                                className="rounded-lg shadow-xl w-full h-auto object-contain max-h-56"
                                onError={(e) => {
                                  e.target.onerror = null; // منع لoop
                                  e.target.style.display = "none";
                                  // إضافة نص بديل
                                  const parent = e.target.parentElement;
                                  const fallback =
                                    document.createElement("div");
                                  fallback.className =
                                    "w-full h-full bg-gray-200 flex items-center justify-center";
                                  fallback.innerHTML =
                                    '<span class="text-gray-400">No Image</span>';
                                  parent.appendChild(fallback);
                                }}
                              />
                            ) : (
                              <div className="w-full h-40 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="text-white text-base px-4 text-center">
                                  {i18n.language === "sv"
                                    ? "Ingen bild tillgänglig"
                                    : "No image available"}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="w-full text-white text-center px-2">
                            <h2 className="text-2xl font-bold mb-3 line-clamp-2">
                              {productName}
                            </h2>
                            <p className="text-sm mb-4 opacity-90 line-clamp-2 px-2">
                              {productDescription}
                            </p>

                            <div className="flex flex-col items-center justify-center mb-4">
                              {priceInfo.isFree ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-3xl font-bold text-green-500">
                                    {i18n.language === "sv" ? "GRATIS" : "FREE"}
                                  </span>
                                  <span className="text-base line-through text-gray-300 mt-1">
                                    $
                                    {priceInfo.originalPrice?.toFixed(2) ||
                                      "0.00"}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span className="text-2xl font-bold">
                                    ${priceInfo.displayPrice.toFixed(2)}
                                  </span>
                                  {priceInfo.hasDiscount &&
                                    priceInfo.displayPrice > 0 && (
                                      <div className="flex items-center mt-1">
                                        <span className="text-base line-through text-gray-300 mr-2">
                                          ${priceInfo.originalPrice.toFixed(2)}
                                        </span>
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                          -{priceInfo.discountPercentage}%
                                        </span>
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                              <Link
                                to={`/product/${product.id}`}
                                className="inline-flex items-center justify-center bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors text-sm"
                              >
                                <FaEye className="mr-2" />{" "}
                                {t("common:viewDetails")}
                              </Link>
                              <button
                                onClick={() => handleAddToCart(product.id)}
                                className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors text-sm"
                              >
                                <FaShoppingCart className="mr-2" />{" "}
                                {t("common:addToCart")}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // تصميم سطح المكتب - أفقي
                        <div className="container mx-auto px-4 h-full flex items-center justify-between">
                          <div className="w-1/2 text-white pr-8">
                            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                              {productName}
                            </h2>
                            <p className="text-lg lg:text-xl mb-6 opacity-90 line-clamp-3">
                              {getProductDescription(product, false)}
                            </p>
                            <div className="flex flex-wrap items-center mb-6">
                              {priceInfo.isFree ? (
                                <div className="flex flex-col">
                                  <span className="text-5xl font-bold text-green-500 mr-4">
                                    {i18n.language === "sv" ? "GRATIS" : "FREE"}
                                  </span>
                                  <span className="text-2xl line-through text-gray-300">
                                    $
                                    {priceInfo.originalPrice?.toFixed(2) ||
                                      "0.00"}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <span className="text-4xl font-bold mr-4">
                                    ${priceInfo.displayPrice.toFixed(2)}
                                  </span>
                                  {priceInfo.hasDiscount &&
                                    priceInfo.displayPrice > 0 && (
                                      <>
                                        <span className="text-xl line-through text-gray-300 mr-4">
                                          ${priceInfo.originalPrice.toFixed(2)}
                                        </span>
                                        <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                          -{priceInfo.discountPercentage}%
                                        </span>
                                      </>
                                    )}
                                </>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <Link
                                to={`/product/${product.id}`}
                                className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                              >
                                <FaEye className="mr-2" />{" "}
                                {t("common:viewDetails")}
                              </Link>
                              <button
                                onClick={() => handleAddToCart(product.id)}
                                className="inline-flex items-center bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                              >
                                <FaShoppingCart className="mr-2" />{" "}
                                {t("common:addToCart")}
                              </button>
                            </div>
                          </div>

                          <div className="w-1/2 flex justify-center">
                            <div className="max-w-lg">
                              {productImageUrl ? (
                                <img
                                  src={productImageUrl}
                                  alt={productName}
                                  className="rounded-lg shadow-xl w-full h-auto object-contain max-h-80"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                    const parent = e.target.parentElement;
                                    const fallback =
                                      document.createElement("div");
                                    fallback.className =
                                      "w-full h-full bg-white/20 rounded-lg flex items-center justify-center";
                                    fallback.innerHTML = `<span class="text-white text-xl">${i18n.language === "sv" ? "Ingen bild tillgänglig" : "No image available"}</span>`;
                                    parent.appendChild(fallback);
                                  }}
                                />
                              ) : (
                                <div className="w-full h-64 bg-white/20 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xl">
                                    {i18n.language === "sv"
                                      ? "Ingen bild tillgänglig"
                                      : "No image available"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* أزرار التحكم */}
            <button
              onClick={prevSlide}
              className={`absolute top-1/2 transform -translate-y-1/2 bg-blue-700/80 hover:bg-blue-700 text-white p-2 sm:p-3 rounded-full transition-colors z-10 ${
                isMobile ? "left-2" : "left-4"
              }`}
              aria-label="Previous Slide"
            >
              <FaChevronLeft className={isMobile ? "text-sm" : ""} />
            </button>
            <button
              onClick={nextSlide}
              className={`absolute top-1/2 transform -translate-y-1/2 bg-blue-700/80 hover:bg-blue-700 text-white p-2 sm:p-3 rounded-full transition-colors z-10 ${
                isMobile ? "right-2" : "right-4"
              }`}
              aria-label="Next Slide"
            >
              <FaChevronRight className={isMobile ? "text-sm" : ""} />
            </button>

            {/* النقاط */}
            <div
              className={`absolute ${isMobile ? "bottom-4" : "bottom-8"} left-1/2 transform -translate-x-1/2 flex space-x-2 z-10`}
            >
              {sliderProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`${isMobile ? "w-2 h-2" : "w-3 h-3"} rounded-full transition-colors ${
                    index === currentSlide
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white text-2xl px-4 text-center pt-16 md:pt-0">
            {t("common:noProducts")}
          </div>
        )}
      </section>

      {/* أقسام الفئات - تستخدم top_products_by_categories */}
      <main className="container mx-auto px-4 py-8">
        {categoriesData.length > 0 ? (
          categoriesData.map((category) => (
            <section key={category.category_id} className="mb-12">
              {/* عنوان الفئة */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 capitalize">
                    {category.category === "other"
                      ? t("common:otherProducts")
                      : category.category}
                  </h2>
                </div>

                {category.products.length > 4 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => scrollLeft(category.category)}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      onClick={() => scrollRight(category.category)}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </div>

              {/* المنتجات - قائمة أفقية */}
              <div
                ref={(el) => (categoryRefs.current[category.category] = el)}
                className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {category.products.map((product) => {
                  const priceInfo = getDisplayPrice(product);
                  const productName = getProductName(product);
                  const productImageUrl = getProductImageUrl(product);

                  return (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-64 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                    >
                      {/* صورة المنتج */}
                      <div className="relative h-40 bg-gray-100 overflow-hidden">
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
                                const fallback = document.createElement("div");
                                fallback.className =
                                  "w-full h-full bg-white/20 rounded-lg flex items-center justify-center";
                                fallback.innerHTML = `<span class="text-white text-xl">${i18n.language === "sv" ? "Ingen bild tillgänglig" : "No image available"}</span>`;
                                parent.appendChild(fallback);
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                            <FaTag className="text-3xl opacity-50" />
                          </div>
                        )}

                        {/* علامة الخصم أو المنتج المجاني */}
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
                        <h3 className="font-bold text-gray-800 text-base mb-2 truncate hover:text-blue-600 transition-colors">
                          <Link to={`/product/${product.id}`}>
                            {productName}
                          </Link>
                        </h3>

                        <div className="flex items-center mb-3">
                          <div className="flex">
                            {renderStars(product.product_rate)}
                          </div>
                          <span className="text-gray-500 text-xs ml-2">
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
                                  $
                                  {priceInfo.originalPrice?.toFixed(2) ||
                                    "0.00"}
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
                            onClick={() => handleAddToCart(product.id)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title={t("common:addToCart")}
                          >
                            <FaShoppingCart size={24} />
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
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl text-gray-600">{t("common:noProducts")}</h3>
            <p className="text-gray-500 mt-2">
              {i18n.language === "sv"
                ? "Inga kategorier med produkter hittades"
                : "No categories with products found"}
            </p>
          </div>
        )}
      </main>

      {/* دعوة للعمل */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("home:cta_title")}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t("home:cta_subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {t("home:cta_viewProducts")}
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 rounded-lg font-bold text-lg transition-colors"
            >
              {t("home:cta_contactSales")}
            </Link>
          </div>
        </div>
      </section>

      <style>{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

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

  @media (max-width: 768px) {
    .line-clamp-2 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .line-clamp-3 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }
`}</style>
    </div>
  );
};

export default Home;
