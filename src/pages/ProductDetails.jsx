// src/pages/ProductDetails.jsx - النسخة المعدلة مع دعم external_url
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
  FaExclamationTriangle,
  FaCheckCircle,
  FaFilePdf,
  FaInfoCircle,
  FaShieldAlt,
  FaClipboardList,
  FaBoxes,
  FaArrowRight,
  FaLink,
  FaCogs,
  FaCopy,
  FaRandom,
} from "react-icons/fa";

// ========== مكون كرت المنتج للعلاقات ==========
const RelatedProductCard = ({ product, onAddToCart }) => {
  const { t, i18n } = useTranslation(["common", "product"]);
  const [isAdding, setIsAdding] = useState(false);

  const getProductName = (prod) => {
    if (i18n.language === "sv" && prod.s_name) return prod.s_name;
    return prod.name || "";
  };

  const getDisplayPrice = (prod) => {
    const price = parseFloat(prod.price) || 0;
    const discountPrice = parseFloat(prod.discount_price) || 0;
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

  // ✅ دالة لإنشاء رابط الصورة (مع دعم external_url)
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

  const renderStars = (rating) => {
    const stars = [];
    const ratingNum = parseFloat(rating) || 0;
    const fullStars = Math.floor(ratingNum);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={
            i < fullStars ? "text-yellow-500 text-sm" : "text-gray-300 text-sm"
          }
        />,
      );
    }
    return stars;
  };

  const handleAdd = async () => {
    setIsAdding(true);
    await onAddToCart(product.id, 1);
    setIsAdding(false);
  };

  const priceInfo = getDisplayPrice(product);
  const productName = getProductName(product);
  const productImageUrl =
    product.images && product.images[0] ? getImageUrl(product.images[0]) : null;

  return (
    <div className="flex-shrink-0 w-64 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {productImageUrl ? (
          <img
            src={productImageUrl}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <FaTag className="text-4xl opacity-50" />
          </div>
        )}
        {priceInfo.hasDiscount && (
          <div className="absolute top-2 left-2">
            <div
              className={`text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg ${priceInfo.isFree ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-red-500 to-red-600"}`}
            >
              {priceInfo.isFree
                ? i18n.language === "sv"
                  ? "GRATIS"
                  : "FREE"
                : `-${priceInfo.discountPercentage}%`}
            </div>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-gray-800 text-sm mb-1 truncate hover:text-blue-600 transition-colors">
          <Link to={`/product/${product.id}`}>{productName}</Link>
        </h3>
        <div className="flex items-center mb-2">
          <div className="flex">{renderStars(product.product_rate)}</div>
          <span className="text-gray-500 text-xs ml-1">
            ({product.product_rate})
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {priceInfo.isFree ? (
              <span className="text-lg font-bold text-green-600">
                {i18n.language === "sv" ? "GRATIS" : "FREE"}
              </span>
            ) : (
              <>
                <span className="text-lg font-bold text-blue-600">
                  ${priceInfo.displayPrice.toFixed(2)}
                </span>
                {priceInfo.hasDiscount && priceInfo.displayPrice > 0 && (
                  <span className="text-gray-400 line-through text-xs ml-1">
                    ${priceInfo.originalPrice.toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-600"></div>
            ) : (
              <FaShoppingCart size={18} />
            )}
          </button>
        </div>
        <Link
          to={`/product/${product.id}`}
          className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-1.5 rounded-lg font-medium text-center text-xs transition-all"
        >
          {t("common:viewDetails")}
        </Link>
      </div>
    </div>
  );
};

// ========== المكون الرئيسي ==========
const ProductDetails = () => {
  const { t, i18n } = useTranslation(["common", "product"]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // حالات للمنتجات المرتبطة
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [accessoryProducts, setAccessoryProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [variationProducts, setVariationProducts] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);

  // حالة للتنبيهات
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, i18n.language]);

  // ✅ دالة لإنشاء رابط الصورة (مع دعم external_url)
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

  // ✅ دالة لإنشاء رابط الملف (مع دعم external_url)
  const getFileUrl = (file) => {
    if (!file) return null;

    // الأولوية للـ file_path (الملف المحلي)
    if (
      file.file_path &&
      typeof file.file_path === "string" &&
      file.file_path.trim() &&
      file.file_path !== "there is no saved file"
    ) {
      if (
        file.file_path.startsWith("http://") ||
        file.file_path.startsWith("https://")
      ) {
        return file.file_path;
      }
      if (file.file_path.startsWith("/")) {
        return `https://nethy.onrender.com${file.file_path}`;
      }
      if (file.file_path.startsWith("storage/")) {
        return `https://nethy.onrender.com/${file.file_path}`;
      }
      return `https://nethy.onrender.com/${file.file_path}`;
    }

    // إذا لم يكن هناك file_path صالح، نستخدم external_url
    if (
      file.external_url &&
      typeof file.external_url === "string" &&
      file.external_url.trim() &&
      file.external_url !== "there is no external url"
    ) {
      return file.external_url;
    }

    return null;
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const productData = response.data.data;
      setProduct(productData);

      if (productData.relations) {
        await fetchRelatedProducts(productData.relations);
      }
    } catch (err) {
      setError(t("product:error"));
      console.error("Error fetching product details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (relations) => {
    setLoadingRelations(true);

    try {
      if (relations.related && relations.related.length > 0) {
        const relatedIds = relations.related.map((r) => r.related_product_id);
        const products = await fetchProductsByIds(relatedIds);
        setRelatedProducts(products);
      }

      if (relations.accessory && relations.accessory.length > 0) {
        const accessoryIds = relations.accessory.map(
          (r) => r.related_product_id,
        );
        const products = await fetchProductsByIds(accessoryIds);
        setAccessoryProducts(products);
      }

      if (relations.similar && relations.similar.length > 0) {
        const similarIds = relations.similar.map((r) => r.related_product_id);
        const products = await fetchProductsByIds(similarIds);
        setSimilarProducts(products);
      }

      if (relations.variation && relations.variation.length > 0) {
        const variationIds = relations.variation.map(
          (r) => r.related_product_id,
        );
        const products = await fetchProductsByIds(variationIds);
        setVariationProducts(products);
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    } finally {
      setLoadingRelations(false);
    }
  };

  const fetchProductsByIds = async (ids) => {
    const products = [];
    for (const productId of ids) {
      try {
        const response = await api.get(`/products/${productId}`);
        if (response.data && response.data.data) {
          products.push(response.data.data);
        }
      } catch (err) {
        console.error(`Error fetching product ${productId}:`, err);
      }
    }
    return products;
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleAddToCart = async (productId = null, qty = null) => {
    const token = localStorage.getItem("customerToken");
    const targetProductId = productId || parseInt(id);
    const targetQuantity = qty || quantity;

    if (!token) {
      showNotification(
        i18n.language === "sv"
          ? "Vänligen logga in för att lägga till produkter i varukorgen"
          : "Please login to add items to cart",
        "error",
      );
      return;
    }

    setAddingToCart(true);

    try {
      const response = await api.post(
        "/additemtoorder",
        {
          product_id: targetProductId,
          quantity: targetQuantity,
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
            ? `${targetQuantity} ${targetQuantity === 1 ? "produkt" : "produkter"} har lagts till i varukorgen`
            : `${targetQuantity} ${targetQuantity === 1 ? "item" : "items"} added to cart successfully`),
        "success",
      );

      if (!productId) setQuantity(1);
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
        setTimeout(() => navigate("/login"), 1000);
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
      setAddingToCart(false);
    }
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

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

  const getProductDescription = () => {
    if (!product) return "";
    if (i18n.language === "sv")
      return (
        product.s_supplier_description || product.s_package_description || ""
      );
    if (i18n.language === "en")
      return (
        product.e_supplier_description || product.e_package_description || ""
      );
    return (
      product.d_supplier_description || product.d_package_description || ""
    );
  };

  const getProductName = (prod = null) => {
    const target = prod || product;
    if (!target) return "";
    if (i18n.language === "sv" && target.s_name) return target.s_name;
    return target.name || "";
  };

  const getCategoryName = () => {
    if (!product) return "";
    if (i18n.language === "sv" && product.s_category) return product.s_category;
    return product.category || "";
  };

  const renderStars = (rating) => {
    const stars = [];
    const ratingNum = parseFloat(rating) || 0;
    const fullStars = Math.floor(ratingNum);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={
            i < fullStars ? "text-yellow-500 text-lg" : "text-gray-300 text-lg"
          }
        />,
      );
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

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-600 mb-4">
            {error || t("product:notFound")}
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {t("product:backToProducts")}
          </button>
        </div>
      </div>
    );
  }

  const price = parseFloat(product.price) || 0;
  const discountPrice = parseFloat(product.discount_price) || 0;
  const isFreeProduct = discountPrice === 0 && price > 0;
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const displayPrice = isFreeProduct ? 0 : hasDiscount ? discountPrice : price;
  const discountPercentage = isFreeProduct
    ? 100
    : hasDiscount
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0;

  const hasSafetySheets =
    product.safty_sheets && product.safty_sheets.length > 0;
  const hasInstructionSheets =
    product.instraction_sheets && product.instraction_sheets.length > 0;
  const hasInfoMaterials =
    product.info_materials && product.info_materials.length > 0;
  const hasAdditionalInfo =
    product.additonalinfo && product.additonalinfo.content?.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* تنبيهات */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 animate-fade-in-down ${notification.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"} border rounded-lg shadow-lg p-4 max-w-sm`}
        >
          <div className="flex items-start">
            <div
              className={`flex-shrink-0 ${notification.type === "success" ? "text-green-400" : "text-red-400"}`}
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
              {getProductName()}
            </span>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* قسم الصور */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(product.images[selectedImageIndex])}
                    alt={getProductName()}
                    className="w-full h-[350px] object-contain p-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                    }}
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                  {(hasDiscount || isFreeProduct) && (
                    <div className="absolute top-4 left-4">
                      <div
                        className={`text-white text-lg font-bold px-4 py-2 rounded-lg shadow-xl ${isFreeProduct ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-red-500 to-red-600"}`}
                      >
                        {isFreeProduct
                          ? i18n.language === "sv"
                            ? "GRATIS"
                            : "FREE"
                          : `-${discountPercentage}%`}
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
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto py-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${getProductName()} - ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* قسم المعلومات الأساسية */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getProductName()}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {renderStars(product.product_rate)}
                  <span className="ml-2 text-gray-600">
                    {product.product_rate} ({t("product:rating")})
                  </span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">
                  {t("product:category")}: {getCategoryName()}
                </span>
              </div>
            </div>

            {/* السعر */}
            <div
              className={`p-6 rounded-xl border ${isFreeProduct ? "bg-gradient-to-r from-green-50 to-white border-green-100" : "bg-gradient-to-r from-blue-50 to-white border-blue-100"}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                {isFreeProduct ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-5xl font-bold text-green-600 mb-1">
                        {i18n.language === "sv" ? "GRATIS" : "FREE"}
                      </span>
                      <span className="text-2xl line-through text-gray-400">
                        ${price.toFixed(2)}
                      </span>
                      <span className="text-green-500 text-sm font-medium mt-1">
                        {i18n.language === "sv"
                          ? "Begränsad tiderbjudande!"
                          : "Limited Time Offer!"}
                      </span>
                    </div>
                    <span className="ml-4 mt-2 sm:mt-0 bg-green-100 text-green-700 font-bold px-4 py-2 rounded-full">
                      {t("product:save")} ${price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-blue-600">
                      ${displayPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-2xl line-through text-gray-400 ml-4">
                          ${price.toFixed(2)}
                        </span>
                        <span className="ml-4 bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full">
                          {t("product:save")} $
                          {(price - discountPrice).toFixed(2)}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="text-gray-600 mt-2">
                <span className="font-medium">{t("product:tax")}:</span>{" "}
                {product.tax_rate}%
                {isFreeProduct && (
                  <span className="ml-4 text-green-600 font-medium">
                    ✓ No tax on free items
                  </span>
                )}
              </div>
            </div>

            {/* الكمية والإجراءات */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t("common:quantity")}
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                      <span className="text-xl">−</span>
                    </button>
                    <input
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-20 h-10 text-center border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={increaseQuantity}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      <span className="text-xl">+</span>
                    </button>
                    <span className="text-gray-600 ml-2">
                      {quantity}{" "}
                      {quantity === 1 ? t("common:piece") : t("common:pieces")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart()}
                  disabled={addingToCart}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center ${addingToCart ? "bg-gray-400 cursor-not-allowed" : isFreeProduct ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"}`}
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-3"></div>
                      {t("common:addingToCart")}
                    </>
                  ) : isFreeProduct ? (
                    <>
                      <FaShoppingCart className="mr-3" />
                      {i18n.language === "sv"
                        ? "FÅ GRATIS NU"
                        : "GET IT FOR FREE"}{" "}
                      ({quantity}{" "}
                      {quantity === 1 ? t("common:piece") : t("common:pieces")})
                    </>
                  ) : (
                    <>
                      <FaShoppingCart className="mr-3" />
                      {t("common:addToCart")} ({quantity}{" "}
                      {quantity === 1 ? t("common:piece") : t("common:pieces")})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* التبويبات */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab("description")}
                className={`pb-3 px-2 font-medium transition-colors ${activeTab === "description" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-600"}`}
              >
                {t("product:description")}
              </button>
              {hasAdditionalInfo && (
                <button
                  onClick={() => setActiveTab("additional")}
                  className={`pb-3 px-2 font-medium transition-colors ${activeTab === "additional" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-600"}`}
                >
                  <FaInfoCircle className="inline mr-1" />{" "}
                  {t("product:additionalInfo")}
                </button>
              )}
              {(hasSafetySheets ||
                hasInstructionSheets ||
                hasInfoMaterials) && (
                <button
                  onClick={() => setActiveTab("files")}
                  className={`pb-3 px-2 font-medium transition-colors ${activeTab === "files" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-600"}`}
                >
                  <FaFilePdf className="inline mr-1" /> {t("product:documents")}
                </button>
              )}
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === "description" && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {getProductDescription()}
                </p>
              </div>
            )}
            {activeTab === "additional" && hasAdditionalInfo && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                {product.additonalinfo.title && (
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {product.additonalinfo.title}
                  </h3>
                )}
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.additonalinfo.content}
                </p>
              </div>
            )}
            {activeTab === "files" && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="space-y-6">
                  {hasSafetySheets && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <FaShieldAlt className="mr-2 text-blue-600" />{" "}
                        {t("product:safetySheets")}
                      </h3>
                      <div className="space-y-2">
                        {product.safty_sheets.map((file, index) => {
                          const fileUrl = getFileUrl(file);
                          return fileUrl ? (
                            <a
                              key={file.id}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                              <div className="flex items-center">
                                <FaFilePdf className="text-red-500 mr-3" />
                                <span>Safety Sheet {index + 1}</span>
                              </div>
                              <FaArrowRight className="text-gray-400" />
                            </a>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  {hasInstructionSheets && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <FaClipboardList className="mr-2 text-green-600" />{" "}
                        {t("product:instructionSheets")}
                      </h3>
                      <div className="space-y-2">
                        {product.instraction_sheets.map((file, index) => {
                          const fileUrl = getFileUrl(file);
                          return fileUrl ? (
                            <a
                              key={file.id}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                              <div className="flex items-center">
                                <FaFilePdf className="text-red-500 mr-3" />
                                <span>Instruction Sheet {index + 1}</span>
                              </div>
                              <FaArrowRight className="text-gray-400" />
                            </a>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  {hasInfoMaterials && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <FaBoxes className="mr-2 text-purple-600" />{" "}
                        {t("product:infoMaterials")}
                      </h3>
                      <div className="space-y-2">
                        {product.info_materials.map((file, index) => {
                          const fileUrl = getFileUrl(file);
                          return fileUrl ? (
                            <a
                              key={file.id}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                              <div className="flex items-center">
                                <FaFilePdf className="text-red-500 mr-3" />
                                <span>Info Material {index + 1}</span>
                              </div>
                              <FaArrowRight className="text-gray-400" />
                            </a>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========== أقسام المنتجات المرتبطة ========== */}
        {!loadingRelations && (
          <>
            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaLink className="mr-2 text-blue-500" />{" "}
                    {t("product:relatedProducts")}
                  </h2>
                </div>
                <div className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4">
                  {relatedProducts.map((prod) => (
                    <RelatedProductCard
                      key={prod.id}
                      product={prod}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Accessory Products */}
            {accessoryProducts.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaCogs className="mr-2 text-green-500" />{" "}
                    {t("product:accessories")}
                  </h2>
                </div>
                <div className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4">
                  {accessoryProducts.map((prod) => (
                    <RelatedProductCard
                      key={prod.id}
                      product={prod}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Similar Products */}
            {similarProducts.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaRandom className="mr-2 text-purple-500" />{" "}
                    {t("product:similarProducts")}
                  </h2>
                </div>
                <div className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4">
                  {similarProducts.map((prod) => (
                    <RelatedProductCard
                      key={prod.id}
                      product={prod}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Variation Products */}
            {variationProducts.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaCopy className="mr-2 text-orange-500" />{" "}
                    {t("product:variations")}
                  </h2>
                </div>
                <div className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4">
                  {variationProducts.map((prod) => (
                    <RelatedProductCard
                      key={prod.id}
                      product={prod}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* زر العودة */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <FaChevronLeft className="mr-2" /> {t("product:backToAllProducts")}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-down { animation: fadeInDown 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ProductDetails;
