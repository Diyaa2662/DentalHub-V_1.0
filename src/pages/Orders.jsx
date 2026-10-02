// src/pages/Orders.jsx - النسخة المعدلة مع container-max
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { CURRENCY_SYMBOL } from "../constants/currency";
import {
  FaShoppingBag,
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaBox,
  FaExclamationTriangle,
  FaRedo,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

const Orders = () => {
  const { t, i18n } = useTranslation(["common", "orders"]);
  const navigate = useNavigate();

  // ✅ دالة لتنسيق السعر مع العملة
  const formatPrice = (price) => {
    if (price === undefined || price === null) return `0 ${CURRENCY_SYMBOL}`;
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return `0 ${CURRENCY_SYMBOL}`;
    return `${numPrice.toFixed(2)} ${CURRENCY_SYMBOL}`;
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/myhistory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setOrders(response.data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerData");
        navigate("/login");
      } else if (err.response?.status === 404) {
        setOrders([]);
      } else {
        setError(err.response?.data?.message || t("common:error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    return order.status === filterStatus;
  });

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  const getStatusInfo = (status) => {
    const statusLower = status?.toLowerCase() || "";

    switch (statusLower) {
      case "pending":
        return {
          text: t("orders:pending"),
          color: "bg-yellow-100 text-yellow-800",
          icon: <FaClock className="text-yellow-600" />,
        };
      case "confirmed":
        return {
          text: t("orders:confirmed"),
          color: "bg-green-100 text-green-800",
          icon: <FaCheckCircle className="text-green-600" />,
        };
      case "canceled":
      case "cancelled":
        return {
          text: t("orders:canceled"),
          color: "bg-red-100 text-red-800",
          icon: <FaExclamationTriangle className="text-red-600" />,
        };
      case "shipped":
      case "delivered":
        return {
          text: t("orders:delivered"),
          color: "bg-blue-100 text-blue-800",
          icon: <FaTruck className="text-blue-600" />,
        };
      default:
        return {
          text: status || t("orders:unknown"),
          color: "bg-gray-100 text-gray-800",
          icon: <FaBox className="text-gray-600" />,
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === "sv" ? "sv-SE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      {/* ✅ Header مع container-max */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-max py-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-5 flex-wrap">
              <Link
                to="/profile"
                className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                {t("orders:backToProfile")}
              </Link>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {t("orders:myOrders")}
                </h1>
                <p className="text-gray-600 mt-1">
                  {orders.length} {t("orders:ordersFound")}
                  {filterStatus !== "all" &&
                    ` (${filteredOrders.length} ${t("common:filtered")})`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={fetchOrders}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50"
                title={t("common:refresh")}
              >
                <FaRedo className="mr-2" />
                {t("common:refresh")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ المحتوى الرئيسي */}
      <div className="container-max py-10">
        {error && orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FaShoppingBag className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">{error}</h3>
            <p className="text-gray-500 mb-8">
              {t("orders:noOrdersDescription")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              >
                <FaArrowLeft className="mr-2" />
                {t("orders:startShopping")}
              </Link>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FaShoppingBag className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              {t("orders:noOrders")}
            </h3>
            <p className="text-gray-500 mb-8">
              {t("orders:noOrdersDescription")}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <FaArrowLeft className="mr-2" />
              {t("orders:startShopping")}
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* أدوات التصفية */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-7">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {t("orders:filterOrders")}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-gray-700 font-medium">
                        {t("orders:filterBy")}:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setFilterStatus("all")}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            filterStatus === "all"
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {t("orders:all")} ({orders.length})
                        </button>
                        <button
                          onClick={() => setFilterStatus("pending")}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            filterStatus === "pending"
                              ? "bg-yellow-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {t("orders:pending")} (
                          {orders.filter((o) => o.status === "pending").length})
                        </button>
                        <button
                          onClick={() => setFilterStatus("confirmed")}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            filterStatus === "confirmed"
                              ? "bg-green-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {t("orders:confirmed")} (
                          {
                            orders.filter((o) => o.status === "confirmed")
                              .length
                          }
                          )
                        </button>
                        <button
                          onClick={() => setFilterStatus("canceled")}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            filterStatus === "canceled"
                              ? "bg-red-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {t("orders:canceled")} (
                          {orders.filter((o) => o.status === "canceled").length}
                          )
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {filterStatus !== "all" && (
                  <button
                    onClick={() => setFilterStatus("all")}
                    className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors whitespace-nowrap font-medium px-4 py-2 rounded-lg hover:bg-red-50"
                  >
                    <FaTimes className="mr-2" />
                    {t("orders:clearFilter")}
                  </button>
                )}
              </div>
            </div>

            {/* قائمة الطلبات */}
            {sortedOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FaFilter className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  {t("orders:noFilteredOrders")}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t("orders:noFilteredOrdersDescription")}
                </p>
                <button
                  onClick={() => setFilterStatus("all")}
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  <FaTimes className="mr-2" />
                  {t("orders:showAllOrders")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {sortedOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300"
                    >
                      {/* هيدر الطلب */}
                      <div className="bg-gradient-to-r from-blue-50 to-white px-6 md:px-7 py-5 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FaShoppingBag className="text-blue-600 text-xl" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">
                                {t("orders:order")} #{order.order_number}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <div className="flex items-center text-gray-600 text-sm">
                                  <FaCalendarAlt className="mr-2" />
                                  {formatDate(
                                    order.order_date || order.created_at,
                                  )}
                                </div>
                                <div
                                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                                >
                                  {statusInfo.icon}
                                  <span>{statusInfo.text}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl md:text-3xl font-bold text-blue-600">
                              {formatPrice(order.total_amount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.number_of_items} {t("orders:items")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* تفاصيل الطلب */}
                      <div className="p-6 md:p-7">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                          {/* معلومات الطلب */}
                          <div>
                            <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                              {t("orders:orderDetails")}
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {t("orders:orderNumber")}:
                                </span>
                                <span className="font-medium">
                                  {order.order_number}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {t("orders:orderDate")}:
                                </span>
                                <span className="font-medium">
                                  {formatDate(
                                    order.order_date || order.created_at,
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {t("orders:paymentMethod")}:
                                </span>
                                <span className="font-medium">
                                  {order.payment_method ||
                                    t("orders:notSpecified")}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* ملخص المبلغ */}
                          <div>
                            <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                              {t("orders:amountSummary")}
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {t("orders:subtotal")}:
                                </span>
                                <span className="font-medium">
                                  {formatPrice(order.subtotal)}
                                </span>
                              </div>
                              {parseFloat(order.discount_amount) > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>{t("orders:discount")}:</span>
                                  <span className="font-medium">
                                    -{formatPrice(order.discount_amount)}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {t("orders:tax")}:
                                </span>
                                <span className="font-medium">
                                  {formatPrice(order.tax_amount)}
                                </span>
                              </div>
                              <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
                                <span className="font-bold text-gray-800">
                                  {t("orders:total")}:
                                </span>
                                <span className="font-bold text-blue-600 text-lg">
                                  {formatPrice(order.total_amount)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* معلومات إضافية */}
                          <div>
                            <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                              {t("orders:additionalInfo")}
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {t("orders:customerName")}:
                                </span>
                                <span className="font-medium">
                                  {order.user_name}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  {t("orders:status")}:
                                </span>
                                <span
                                  className={`font-medium px-3 py-1 rounded-full text-xs ${statusInfo.color}`}
                                >
                                  {statusInfo.text}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ملخص الإحصائيات */}
            {filterStatus === "all" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-7">
                <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                  {t("orders:orderStatistics")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="text-center bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {orders.length}
                    </div>
                    <div className="text-gray-700 font-medium text-sm">
                      {t("orders:totalOrders")}
                    </div>
                  </div>

                  <div className="text-center bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {orders.filter((o) => o.status === "pending").length}
                    </div>
                    <div className="text-gray-700 font-medium text-sm">
                      {t("orders:pendingOrders")}
                    </div>
                  </div>

                  <div className="text-center bg-green-50 p-6 rounded-xl border border-green-100">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {orders.filter((o) => o.status === "confirmed").length}
                    </div>
                    <div className="text-gray-700 font-medium text-sm">
                      {t("orders:confirmedOrders")}
                    </div>
                  </div>

                  <div className="text-center bg-purple-50 p-6 rounded-xl border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {formatPrice(
                        orders.reduce(
                          (sum, order) => sum + parseFloat(order.total_amount),
                          0,
                        ),
                      )}
                    </div>
                    <div className="text-gray-700 font-medium text-sm">
                      {t("orders:totalSpent")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
