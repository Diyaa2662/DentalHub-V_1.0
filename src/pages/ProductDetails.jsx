// src/pages/ProductDetails.jsx - النسخة المختصرة والمبسطة
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import {
  FaStar,
  FaShoppingCart,
  FaChevronLeft,
  FaChevronRight,
  FaTag,
} from "react-icons/fa";

const ProductDetails = () => {
  const { t, i18n } = useTranslation(["common", "product"]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, i18n.language]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data);
    } catch (err) {
      setError(t("product:error"));
      console.error("Error fetching product details:", err);
    } finally {
      setLoading(false);
    }
  };

  // دالة لبناء رابط الصورة الكامل
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "https://via.placeholder.com/600x600/3B82F6/FFFFFF?text=No+Image";
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
      return `https://nethy-production.up.railway.app${imageUrl}`;
    }

    return `https://nethy-production.up.railway.app/${imageUrl}`;
  };

  // زيادة/تقليل الكمية
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // تغيير الصورة الرئيسية
  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1,
      );
    }
  };

  // إضافة للسلة
  const handleAddToCart = () => {
    alert(t("product:addedToCart"));
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

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-600 mb-4">
            {error || t("product:notFound")}
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("product:backToProducts")}
          </button>
        </div>
      </div>
    );
  }

  // الحصول على القيم مباشرة من product
  const productName =
    i18n.language === "sv" && product.s_name ? product.s_name : product.name;

  const productDescription =
    i18n.language === "sv" && product.s_description
      ? product.s_description
      : product.description;

  // حساب السعر ببساطة
  const price = parseFloat(product.price) || 0;
  const discountPrice = parseFloat(product.discount_price) || 0;

  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const displayPrice = hasDiscount ? discountPrice : price;

  // حساب نسبة الخصم إذا كان موجوداً
  const discountPercentage = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  // دالة لعرض النجوم
  const renderStars = (rating) => {
    const stars = [];
    const ratingNum = parseFloat(rating) || 0;
    const fullStars = Math.floor(ratingNum);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-500 text-lg" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300 text-lg" />);
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط التنقل */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">
              {t("product:breadcrumb_home")}
            </Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-blue-600">
              {t("product:breadcrumb_products")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium truncate max-w-xs">
              {productName}
            </span>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* قسم الصور */}
          <div className="space-y-4">
            {/* الصورة الرئيسية */}
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={getFullImageUrl(
                      product.images[selectedImageIndex].url,
                    )}
                    alt={productName}
                    className="w-full h-[400px] object-contain p-4"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/600x600/3B82F6/FFFFFF?text=No+Image";
                    }}
                  />

                  {/* أزرار التنقل بين الصور */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-colors"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-colors"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}

                  {/* علامة الخصم */}
                  {hasDiscount && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-bold px-4 py-2 rounded-lg shadow-xl">
                        -{discountPercentage}%
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <FaTag className="text-6xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t("product:noImages")}</p>
                  </div>
                </div>
              )}
            </div>

            {/* معرض الصور المصغرة */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto py-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={getFullImageUrl(image.url)}
                      alt={`${productName} - image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=Thumb";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* قسم المعلومات */}
          <div className="space-y-6">
            {/* الاسم والتقييم */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {productName}
              </h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {renderStars(product.product_rate)}
                  <span className="ml-2 text-gray-600">
                    {product.product_rate} ({t("product:rating")})
                  </span>
                </div>
              </div>
            </div>

            {/* السعر - عرض مباشر */}
            <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-100">
              <div className="flex items-center mb-2">
                <span className="text-4xl font-bold text-blue-600">
                  ${displayPrice.toFixed(2)}
                </span>

                {hasDiscount && (
                  <>
                    <span className="text-2xl line-through text-gray-400 ml-4">
                      ${price.toFixed(2)}
                    </span>
                    <span className="ml-4 bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full">
                      Save ${(price - discountPrice).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              <div className="text-gray-600">
                <span className="font-medium">{t("product:tax")}:</span>{" "}
                {product.tax_rate}%
              </div>
            </div>

            {/* الوصف */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {t("product:description")}
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {productDescription}
              </p>
            </div>

            {/* الكمية والإجراءات */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="space-y-6">
                {/* الكمية */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t("common:quantity")}
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-xl">−</span>
                    </button>

                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setQuantity(value >= 1 ? value : 1);
                      }}
                      className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <button
                      onClick={increaseQuantity}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      <span className="text-xl">+</span>
                    </button>
                  </div>
                </div>

                {/* زر إضافة للسلة فقط */}
                <div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <FaShoppingCart className="mr-3" />
                    {t("common:addToCart")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* زر العودة فقط */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <FaChevronLeft className="mr-2" />
            {t("product:backToAllProducts")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
