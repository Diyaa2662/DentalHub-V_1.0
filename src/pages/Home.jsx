// src/pages/Home.jsx - النسخة المعدلة مع نظام الترجمة الجديد
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import {
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
  FaEye,
  FaTag,
} from "react-icons/fa";

const Home = () => {
  const { t, i18n } = useTranslation(["home", "common"]);
  const [homeData, setHomeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sliderProducts, setSliderProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Refs for scrollable sections
  const categoryRefs = useRef({});

  useEffect(() => {
    fetchHomeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/mainpage");

      // استخراج جميع المنتجات من كل الفئات
      const allProducts = response.data.date.flatMap((cat) => cat.products);

      // اختيار 5 منتجات للسلايدر (منتجات بصور متوفرة ومتوفرة بالمخزون)
      const sliderItems = allProducts
        .filter(
          (product) =>
            product.images &&
            product.images.length > 0 &&
            product.status === "instock",
        )
        .slice(0, 5);

      setSliderProducts(sliderItems);
      setHomeData(response.data.date.filter((cat) => cat.products.length > 0));
    } catch (err) {
      setError(t("common:error"));
      console.error("Error fetching home data:", err);
    } finally {
      setLoading(false);
    }
  };

  // وظائف السلايدر
  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === sliderProducts.length - 1 ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? sliderProducts.length - 1 : prev - 1,
    );
  };

  // وظائف التمرير للفئات
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

  // وظيفة لبناء رابط الصورة الكامل
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

    if (imageUrl.startsWith("storage/")) {
      return `https://nethy-production.up.railway.app/${imageUrl}`;
    }

    return `https://nethy-production.up.railway.app/${imageUrl}`;
  };

  // دالة للحصول على الاسم المناسب حسب اللغة
  const getProductName = (product) => {
    // إذا كانت اللغة سويدية وكان هناك s_name
    if (
      i18n.language === "sv" &&
      product.s_name &&
      product.s_name.trim() !== ""
    ) {
      return product.s_name;
    }
    // وإلا نعرض name
    return product.name || t("common:noName");
  };

  // دالة للحصول على الوصف المناسب حسب اللغة
  const getProductDescription = (product) => {
    // إذا كانت اللغة سويدية وكان هناك s_description
    if (
      i18n.language === "sv" &&
      product.s_description &&
      product.s_description.trim() !== ""
    ) {
      return product.s_description;
    }
    // وإلا نعرض description
    return product.description || t("home:hero_subtitle");
  };

  // دالة لتحديد سعر العرض الصحيح
  const getDisplayPrice = (product) => {
    const price = parseFloat(product.price) || 0;
    const discountPrice = parseFloat(product.discount_price) || 0;

    // إذا كان discount_price موجود وأقل من price وأكبر من 0
    if (discountPrice > 0 && discountPrice < price) {
      return {
        displayPrice: discountPrice,
        originalPrice: price,
        hasDiscount: true,
        discountPercentage: Math.round(((price - discountPrice) / price) * 100),
      };
    }

    // إذا كان discount_price = 0 أو يساوي price أو أكبر من price
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
      {/* السلايدر */}
      <section className="relative h-[500px] overflow-hidden bg-gradient-to-r from-blue-500 to-blue-300">
        {sliderProducts.length > 0 ? (
          <div className="relative w-full h-full">
            {/* حاوية السلايدر */}
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {sliderProducts.map((product, index) => {
                const priceInfo = getDisplayPrice(product);
                const productName = getProductName(product);
                const productDescription = getProductDescription(product);

                return (
                  <div
                    key={product.id}
                    className="min-w-full h-full flex-shrink-0 flex items-center"
                  >
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
                      <div className="md:w-1/2 text-white mb-10 md:mb-0">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                          {productName}
                        </h2>
                        <p className="text-xl mb-6 opacity-90">
                          {productDescription}
                        </p>
                        <div className="flex items-center mb-4">
                          <span className="text-3xl font-bold">
                            ${priceInfo.displayPrice.toFixed(2)}
                          </span>
                          {priceInfo.hasDiscount && (
                            <>
                              <span className="text-lg line-through text-gray-300 ml-4">
                                ${priceInfo.originalPrice.toFixed(2)}
                              </span>
                              <span className="ml-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                -{priceInfo.discountPercentage}%
                              </span>
                            </>
                          )}
                        </div>
                        <Link
                          to={`/product/${product.id}`}
                          className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                        >
                          <FaEye className="ml-2" /> {t("common:viewDetails")}
                        </Link>
                      </div>
                      <div className="md:w-1/2 flex justify-center">
                        <div className="w-full max-w-lg">
                          {product.images && product.images[0] ? (
                            <img
                              src={getFullImageUrl(product.images[0].url)}
                              alt={productName}
                              className="rounded-lg shadow-2xl w-full h-auto object-contain max-h-80"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="w-full h-64 bg-white/20 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xl">
                                {i18n.language === "sv"
                                  ? "Ingen bild tillgänglig"
                                  : t("product:noImages")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* أزرار التحكم */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors z-10"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors z-10"
            >
              <FaChevronRight />
            </button>

            {/* النقاط */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {sliderProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white text-2xl">
            {t("common:noProducts")}
          </div>
        )}
      </section>

      {/* أقسام الفئات */}
      <main className="container mx-auto px-4 py-8">
        {homeData.length > 0 ? (
          homeData.map((category) => (
            <section key={category.category} className="mb-12">
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

                  return (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-64 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                    >
                      {/* صورة المنتج */}
                      <div className="relative h-40 bg-gray-100 overflow-hidden">
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
                            {/* طبقة hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                            <FaTag className="text-3xl opacity-50" />
                          </div>
                        )}

                        {/* علامة الخصم - جذابة */}
                        {priceInfo.hasDiscount && (
                          <div className="absolute top-3 left-3">
                            <div className="relative">
                              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                                -{priceInfo.discountPercentage}%
                              </div>
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* معلومات المنتج - مبسطة */}
                      <div className="p-4">
                        {/* الاسم */}
                        <h3 className="font-bold text-gray-800 text-base mb-2 truncate hover:text-blue-600 transition-colors">
                          {productName}
                        </h3>

                        {/* التقييم */}
                        <div className="flex items-center mb-3">
                          <div className="flex">
                            {renderStars(product.product_rate)}
                          </div>
                          <span className="text-gray-500 text-xs ml-2">
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
                          {/* أيقونة صغيرة للسلة */}
                          <button
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title={t("common:addToCart")}
                          >
                            <FaShoppingCart size={24} />
                          </button>
                        </div>

                        {/* زر التفاصيل فقط */}
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
                : t("home:noCategoriesFound")}
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

      {/* CSS لاخفاء شريط التمرير */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Home;
