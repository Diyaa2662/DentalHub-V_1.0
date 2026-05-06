// src/pages/Cart.jsx - صفحة السلة مع الشيك اوت (معدلة لدعم external_url)
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaArrowRight,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTag,
  FaCreditCard,
  FaTruck,
  FaShieldAlt,
  FaUndo,
} from "react-icons/fa";

const Cart = () => {
  const { t, i18n } = useTranslation(["common", "cart"]);
  const navigate = useNavigate();

  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [updatingQuantity, setUpdatingQuantity] = useState({});
  const [tempQuantities, setTempQuantities] = useState({});
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchCartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        return `https://back.neotonicglobal.com${image.url}`;
      }
      if (image.url.startsWith("storage/")) {
        return `https://back.neotonicglobal.com/${image.url}`;
      }
      return `https://back.neotonicglobal.com/${image.url}`;
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

  const fetchCartData = async () => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/mycart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setCartData(response.data);
      } else {
        setError(t("cart:emptyCart"));
      }
    } catch (err) {
      console.error("❌ Error fetching cart:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerData");
        navigate("/login");
      } else if (err.response?.status === 404) {
        setCartData(null); // السلة فارغة
      } else {
        setError(err.response?.data?.message || t("common:error"));
      }
    } finally {
      setLoading(false);
    }
  };

  // دالة لإظهار التنبيه
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

  // دالة تحديث الكمية المؤقتة
  const handleQuantityChange = (productId, change) => {
    const currentQuantity =
      tempQuantities[productId] ||
      cartData?.related_products?.find((p) => p.id === productId)?.pivot
        ?.quantity ||
      1;

    let newQuantity = currentQuantity + change;
    if (newQuantity < 1) newQuantity = 1;

    setTempQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  // دالة حفظ الكمية الجديدة
  const saveQuantity = async (productId) => {
    const newQuantity = tempQuantities[productId];
    if (!newQuantity || newQuantity < 1) return;

    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setUpdatingQuantity((prev) => ({ ...prev, [productId]: true }));

    try {
      const orderId = cartData?.order?.id;
      if (!orderId) {
        showNotification(t("common:orderNotFound"), "error");
        return;
      }

      await api.post(
        `/removeitemfromorder/${orderId}`,
        {
          product_id: productId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      const addResponse = await api.post(
        "/additemtoorder",
        {
          product_id: productId,
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (addResponse.data && addResponse.data.message) {
        showNotification(
          addResponse.data.message || t("cart:quantityUpdated"),
          "success",
        );

        fetchCartData();

        setTempQuantities((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
      }
    } catch (err) {
      console.error("❌ Error updating quantity:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerData");
        navigate("/login");
      } else if (err.response?.status === 404) {
        try {
          await api.post(
            "/additemtoorder",
            {
              product_id: productId,
              quantity: newQuantity,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          showNotification(t("cart:quantityUpdated"), "success");
          fetchCartData();

          setTempQuantities((prev) => {
            const newState = { ...prev };
            delete newState[productId];
            return newState;
          });
        } catch (addErr) {
          console.error("❌ Direct addition also failed:", addErr);
          showNotification(
            addErr.response?.data?.message || t("cart:updateError"),
            "error",
          );
        }
      } else {
        showNotification(
          err.response?.data?.message || t("cart:updateError"),
          "error",
        );
      }
    } finally {
      setUpdatingQuantity((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // دالة حذف منتج من السلة
  const removeItem = async (productId) => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const orderId = cartData?.order?.id;
    if (!orderId) {
      showNotification(t("common:orderNotFound"), "error");
      return;
    }

    if (
      !window.confirm(
        i18n.language === "sv"
          ? "Är du säker på att du vill ta bort denna produkt från varukorgen?"
          : "Are you sure you want to remove this item from cart?",
      )
    ) {
      return;
    }

    try {
      const response = await api.post(
        `/removeitemfromorder/${orderId}`,
        {
          product_id: productId,
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
          response.data.message || t("cart:itemRemoved"),
          "success",
        );
        fetchCartData();
      }
    } catch (err) {
      console.error("❌ Error removing item:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerData");
        navigate("/login");
      } else {
        showNotification(
          err.response?.data?.message || t("cart:removeError"),
          "error",
        );
      }
    }
  };

  // دالة الشيك اوت
  const handleCheckout = async () => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const orderId = cartData?.order?.id;
    if (!orderId) {
      showNotification(t("common:orderNotFound"), "error");
      return;
    }

    const confirmMessage =
      i18n.language === "sv"
        ? `Är du säker på att du vill slutföra beställningen ${cartData.order.order_number}?\n\nTotalt: ${cartData.order.currency} ${parseFloat(cartData.order.total_amount).toFixed(2)}\n\nDenna åtgärd kan inte ångras.`
        : `Are you sure you want to complete order ${cartData.order.order_number}?\n\nTotal: ${cartData.order.currency} ${parseFloat(cartData.order.total_amount).toFixed(2)}\n\nThis action cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setCheckingOut(true);

    try {
      const response = await api.post(
        `/checkout/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data && response.data.message) {
        showNotification(
          response.data.message || t("cart:checkoutSuccess"),
          "success",
        );

        setTimeout(() => {
          navigate("/products");
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }, 3000);
      }
    } catch (err) {
      console.error("❌ Checkout error:", err);

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
      } else if (err.response?.status === 400) {
        errorMessage =
          err.response.data?.message ||
          (i18n.language === "sv"
            ? "Beställningen kan inte slutföras. Kontrollera att alla produkter är tillgängliga."
            : "Order cannot be completed. Please check if all items are available.");
        showNotification(errorMessage, "error");
      } else if (err.response?.status === 404) {
        errorMessage =
          i18n.language === "sv"
            ? "Beställningen hittades inte eller har redan slutförts"
            : "Order not found or already completed";
        showNotification(errorMessage, "error");
      } else {
        errorMessage =
          err.response?.data?.message ||
          (i18n.language === "sv"
            ? "Ett fel uppstod vid slutförande av beställningen"
            : "An error occurred while processing your order");
        showNotification(errorMessage, "error");
      }
    } finally {
      setCheckingOut(false);
    }
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
                  {t("common:shoppingCart")}
                </h1>
                <p className="text-gray-600 mt-1">
                  {cartData?.order ? (
                    <>
                      {t("cart:orderNumber")}:{" "}
                      <span className="font-bold">
                        {cartData.order.order_number}
                      </span>{" "}
                      •{cartData.order.number_of_items} {t("cart:items")}
                    </>
                  ) : (
                    t("cart:emptyCart")
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FaArrowRight className="mr-2" />
                {t("cart:continueShopping")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-8">
        {error && !cartData ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FaShoppingCart className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">{error}</h3>
            <p className="text-gray-500 mb-8">
              {t("cart:emptyCartDescription")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <FaArrowRight className="mr-2" />
                {t("cart:startShopping")}
              </Link>
              <Link
                to="/"
                className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                {t("common:backToHome")}
              </Link>
            </div>
          </div>
        ) : cartData?.related_products?.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FaShoppingCart className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              {t("cart:emptyCart")}
            </h3>
            <p className="text-gray-500 mb-8">
              {t("cart:emptyCartDescription")}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FaArrowRight className="mr-2" />
              {t("cart:startShopping")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* المنتجات في السلة */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* هيدر السلة */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <FaShoppingCart className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {t("cart:yourItems")} (
                          {cartData?.order?.number_of_items || 0})
                        </h2>
                        <p className="text-blue-200 text-sm">
                          {t("cart:orderNumber")}:{" "}
                          {cartData?.order?.order_number}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={fetchCartData}
                      className="inline-flex items-center text-white/80 hover:text-white transition-colors"
                      title={t("common:refresh")}
                    >
                      <FaUndo />
                    </button>
                  </div>
                </div>

                {/* قائمة المنتجات */}
                <div className="divide-y divide-gray-200">
                  {cartData?.related_products?.map((product) => {
                    const productName = getProductName(product);
                    const isUpdating = updatingQuantity[product.id] || false;
                    const currentQuantity = product.pivot?.quantity || 1;
                    const tempQuantity = tempQuantities[product.id];
                    const quantity =
                      tempQuantity !== undefined
                        ? tempQuantity
                        : currentQuantity;
                    const hasUnsavedChanges =
                      tempQuantity !== undefined &&
                      tempQuantity !== currentQuantity;
                    const unitPrice = parseFloat(
                      product.pivot?.unit_price || product.price,
                    );
                    const subtotal = parseFloat(product.pivot?.subtotal || 0);
                    const discountAmount = parseFloat(
                      product.pivot?.discount_amount || 0,
                    );
                    const hasDiscount = discountAmount > 0;

                    // ✅ الحصول على رابط الصورة باستخدام الدالة الجديدة
                    const productImageUrl =
                      product.images && product.images[0]
                        ? getImageUrl(product.images[0])
                        : null;

                    return (
                      <div
                        key={product.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* صورة المنتج - معدلة مع دعم external_url */}
                          <div className="md:w-32">
                            <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              {productImageUrl ? (
                                <img
                                  src={productImageUrl}
                                  alt={productName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                    const parent = e.target.parentElement;
                                    const fallback =
                                      document.createElement("div");
                                    fallback.className =
                                      "w-full h-full flex items-center justify-center text-gray-400 bg-gray-100";
                                    fallback.innerHTML =
                                      '<svg class="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
                                    parent.appendChild(fallback);
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                  <FaTag className="text-3xl opacity-50" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* معلومات المنتج */}
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="mb-4">
                                  <h3 className="font-bold text-gray-800 text-lg mb-1 hover:text-blue-600 transition-colors">
                                    <Link to={`/product/${product.id}`}>
                                      {productName}
                                    </Link>
                                  </h3>
                                </div>

                                {/* السعر */}
                                <div className="flex items-center flex-wrap gap-4 mb-4">
                                  <div className="text-lg font-bold text-gray-900">
                                    ${unitPrice.toFixed(2)}
                                  </div>
                                  {hasDiscount && (
                                    <div className="text-sm text-green-600">
                                      {t("cart:discountApplied")}: -$
                                      {discountAmount.toFixed(2)}
                                    </div>
                                  )}
                                </div>

                                {/* الكمية */}
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center">
                                    <span className="text-gray-700 mr-3">
                                      {t("common:quantity")}:
                                    </span>
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                      <button
                                        onClick={() =>
                                          handleQuantityChange(product.id, -1)
                                        }
                                        disabled={quantity <= 1 || isUpdating}
                                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        <FaMinus className="text-gray-600" />
                                      </button>

                                      <div className="w-16 h-10 flex items-center justify-center bg-white border-x border-gray-300">
                                        {isUpdating ? (
                                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600"></div>
                                        ) : (
                                          <span
                                            className={`font-medium ${hasUnsavedChanges ? "text-blue-600" : ""}`}
                                          >
                                            {quantity}
                                            {hasUnsavedChanges && (
                                              <span className="text-xs text-blue-500 ml-1">
                                                *
                                              </span>
                                            )}
                                          </span>
                                        )}
                                      </div>

                                      <button
                                        onClick={() =>
                                          handleQuantityChange(product.id, 1)
                                        }
                                        disabled={isUpdating}
                                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        <FaPlus className="text-gray-600" />
                                      </button>
                                    </div>

                                    {/* زر حفظ إذا كانت هناك تغييرات غير محفوظة */}
                                    {hasUnsavedChanges && !isUpdating && (
                                      <button
                                        onClick={() => saveQuantity(product.id)}
                                        className="ml-3 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg font-medium transition-colors"
                                      >
                                        {t("common:save")}
                                      </button>
                                    )}
                                  </div>

                                  {/* المجموع الفرعي */}
                                  <div className="text-lg font-bold text-blue-600">
                                    ${subtotal.toFixed(2)}
                                  </div>
                                </div>
                              </div>

                              {/* زر الحذف */}
                              <div>
                                <button
                                  onClick={() => removeItem(product.id)}
                                  disabled={isUpdating}
                                  className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-2"
                                  title={t("cart:removeItem")}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* رسوم التوصيل والضمان */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <FaTruck className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {t("cart:freeShipping")}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t("cart:shippingInfo")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <FaShieldAlt className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {t("cart:warranty")}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t("cart:warrantyInfo")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <FaUndo className="text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {t("cart:easyReturns")}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t("cart:returnsInfo")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ملخص الطلب */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-8">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t("cart:orderSummary")}
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("cart:subtotal")}
                      </span>
                      <span className="font-medium">
                        ${parseFloat(cartData?.order?.subtotal || 0).toFixed(2)}
                      </span>
                    </div>

                    {parseFloat(cartData?.order?.discount_amount || 0) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{t("cart:discount")}</span>
                        <span className="font-medium">
                          -$
                          {parseFloat(
                            cartData?.order?.discount_amount || 0,
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("cart:tax")}</span>
                      <span className="font-medium">
                        $
                        {parseFloat(cartData?.order?.tax_amount || 0).toFixed(
                          2,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("cart:shipping")}
                      </span>
                      <span className="font-medium text-green-600">
                        {t("cart:free")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* الإجمالي */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      {t("cart:total")}
                    </span>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        $
                        {parseFloat(cartData?.order?.total_amount || 0).toFixed(
                          2,
                        )}
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        {cartData?.order?.currency || "USD"}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t("cart:totalDescription")}
                  </p>
                </div>

                {/* أزرار الدفع */}
                <div className="p-6">
                  <button
                    onClick={handleCheckout}
                    disabled={
                      checkingOut ||
                      !cartData?.order ||
                      cartData?.related_products?.length === 0
                    }
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl mb-4 flex items-center justify-center ${
                      checkingOut ||
                      !cartData?.order ||
                      cartData?.related_products?.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    }`}
                  >
                    {checkingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-3"></div>
                        {t("cart:processing")}
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="mr-3" />
                        {t("cart:proceedToCheckout")}
                      </>
                    )}
                  </button>

                  <Link
                    to="/products"
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
                  >
                    <FaArrowRight className="mr-2" />
                    {t("cart:continueShopping")}
                  </Link>
                </div>

                {/* معلومات الطلب */}
                <div className="p-6 bg-gray-50 rounded-b-2xl">
                  <h4 className="font-bold text-gray-900 mb-3">
                    {t("cart:orderDetails")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("cart:orderNumber")}:
                      </span>
                      <span className="font-medium">
                        {cartData?.order?.order_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("cart:orderDate")}:
                      </span>
                      <span className="font-medium">
                        {cartData?.order?.order_date
                          ? new Date(
                              cartData.order.order_date,
                            ).toLocaleDateString()
                          : new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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

export default Cart;
