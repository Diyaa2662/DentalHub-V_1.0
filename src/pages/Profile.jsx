// src/pages/Profile.jsx - النسخة المعدلة مع container-max
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { CURRENCY_SYMBOL } from "../constants/currency";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaShieldAlt,
  FaShoppingCart,
  FaSignOutAlt,
  FaCheckCircle,
  FaLock,
} from "react-icons/fa";

const Profile = () => {
  const { t } = useTranslation(["common", "profile"]);
  const navigate = useNavigate();

  // ✅ دالة لتنسيق السعر مع العملة
  const formatPrice = (price) => {
    if (price === undefined || price === null) return `0 ${CURRENCY_SYMBOL}`;
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return `0 ${CURRENCY_SYMBOL}`;
    return `${numPrice.toFixed(2)} ${CURRENCY_SYMBOL}`;
  };

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        const userData = response.data.data;
        setProfileData(userData);

        setFormData({
          name: userData.name || "",
          phone: userData.phone || "",
          address: userData.address || "",
        });
      } else {
        setError(t("profile:dataNotFound"));
      }
    } catch (err) {
      console.error("❌ Error fetching profile:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerData");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || t("profile:fetchError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/updateuser", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.data) {
        const updatedData = response.data.data;
        setProfileData(updatedData);

        const currentCustomerData = JSON.parse(
          localStorage.getItem("customerData") || "{}",
        );

        const updatedCustomerData = {
          ...currentCustomerData,
          name: updatedData.name || formData.name,
          phone: updatedData.phone || formData.phone,
          address: updatedData.address || formData.address,
          ...updatedData,
        };

        localStorage.setItem(
          "customerData",
          JSON.stringify(updatedCustomerData),
        );

        setFormData({
          name: updatedData.name || formData.name,
          phone: updatedData.phone || formData.phone,
          address: updatedData.address || formData.address,
        });

        setSuccess(t("profile:updateSuccess"));
        setEditMode(false);

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else if (response.data && response.data.message) {
        const currentCustomerData = JSON.parse(
          localStorage.getItem("customerData") || "{}",
        );

        const updatedCustomerData = {
          ...currentCustomerData,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        };

        localStorage.setItem(
          "customerData",
          JSON.stringify(updatedCustomerData),
        );

        setSuccess(response.data.message || t("profile:updateSuccess"));
        setEditMode(false);

        fetchProfile();

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (err) {
      console.error("❌ Error updating profile:", err);

      if (err.response?.status === 401) {
        navigate("/login");
      } else if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        setError(firstError || t("profile:validationError"));
      } else {
        setError(err.response?.data?.message || t("profile:updateError"));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerData");
    localStorage.removeItem("customerEmail");
    sessionStorage.removeItem("customerToken");
    sessionStorage.removeItem("customerData");

    navigate("/login");
    window.location.reload();
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

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-600 mb-4">{error}</h2>
          <button
            onClick={fetchProfile}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {t("common:tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ زر العودة مع container-max */}
      <div className="container-max pt-7">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            {t("common:backToHome")}
          </Link>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-red-50"
            >
              <FaSignOutAlt className="mr-2" />
              {t("profile:logout")}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ المحتوى الرئيسي */}
      <div className="container-max py-10">
        <div className="max-w-6xl mx-auto">
          {/* الهيدر */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-5 relative shadow-xl">
              <FaUser className="text-white text-4xl" />
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <FaCheckCircle className="text-white text-sm" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t("profile:myProfile")}
            </h1>
            <p className="text-gray-600">{t("profile:profileDescription")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* الشريط الجانبي */}
            <div className="lg:col-span-1">
              {/* معلومات الحساب */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-7 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                  {t("profile:accountInfo")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      {t("profile:memberSince")}
                    </span>
                    <span className="font-medium">
                      {profileData?.join_date
                        ? new Date(profileData.join_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      {t("profile:accountType")}
                    </span>
                    <span className="font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {t("profile:customer")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">{t("profile:status")}</span>
                    <span
                      className={`font-medium px-3 py-1 rounded-full text-sm ${
                        profileData?.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {profileData?.status === "active"
                        ? t("profile:active")
                        : t("profile:inactive")}
                    </span>
                  </div>
                </div>
              </div>

              {/* روابط سريعة */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-7">
                <h3 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                  {t("profile:quickLinks")}
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/orders"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                      <FaShoppingCart className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t("profile:myOrders")}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {profileData?.orders_count || 0} {t("profile:orders")}
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/change-password"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-11 h-11 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                      <FaLock className="text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t("profile:changePassword")}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {t("profile:security")}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* قسم الأمان */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <FaShieldAlt className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {t("profile:accountSecurity")}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t("profile:securityDescription")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-100">
                  <span className="text-sm text-gray-600">
                    {t("profile:lastLogin")}
                  </span>
                  <span className="text-sm font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* قسم الملف الشخصي */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* الهيدر */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-7">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {t("profile:personalInformation")}
                      </h2>
                      <p className="text-blue-200 mt-1">
                        {t("profile:manageYourInfo")}
                      </p>
                    </div>

                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center bg-white text-blue-600 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                      >
                        <FaEdit className="mr-2" />
                        {t("profile:editProfile")}
                      </button>
                    ) : (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setFormData({
                              name: profileData?.name || "",
                              phone: profileData?.phone || "",
                              address: profileData?.address || "",
                            });
                          }}
                          className="inline-flex items-center bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                        >
                          <FaTimes className="mr-2" />
                          {t("common:cancel")}
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="inline-flex items-center bg-white text-green-600 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          <FaSave className="mr-2" />
                          {saving
                            ? t("profile:saving")
                            : t("profile:saveChanges")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* الرسائل */}
                <div className="px-8 pt-6">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-3" />
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* المحتوى */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* الاسم */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {t("profile:fullName")}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t("profile:nameDescription")}
                          </p>
                        </div>
                      </div>
                      {editMode ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder={t("profile:enterYourName")}
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-900 p-3 bg-white rounded-lg border border-gray-200">
                          {profileData?.name || t("profile:notProvided")}
                        </p>
                      )}
                    </div>

                    {/* البريد الإلكتروني */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <FaEnvelope className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {t("profile:emailAddress")}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t("profile:emailDescription")}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-medium text-gray-900 p-3 bg-white rounded-lg border border-gray-200 break-all">
                        {profileData?.email || t("profile:notProvided")}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {t("profile:emailCannotChange")}
                      </p>
                    </div>

                    {/* رقم الهاتف */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <FaPhone className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {t("profile:phoneNumber")}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t("profile:phoneDescription")}
                          </p>
                        </div>
                      </div>
                      {editMode ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder={t("profile:enterYourPhone")}
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-900 p-3 bg-white rounded-lg border border-gray-200">
                          {profileData?.phone || t("profile:notProvided")}
                        </p>
                      )}
                    </div>

                    {/* العنوان */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <FaMapMarkerAlt className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {t("profile:address")}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t("profile:addressDescription")}
                          </p>
                        </div>
                      </div>
                      {editMode ? (
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          placeholder={t("profile:enterYourAddress")}
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-900 p-3 bg-white rounded-lg border border-gray-200 min-h-[60px]">
                          {profileData?.address || t("profile:notProvided")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* معلومات إضافية */}
                  {!editMode && (
                    <div className="mt-10 pt-8 border-t border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">
                        {t("profile:accountDetails")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center bg-blue-50 p-7 rounded-xl border border-blue-100">
                          <div className="text-4xl font-bold text-blue-600 mb-2">
                            {profileData?.orders_count || 0}
                          </div>
                          <div className="text-gray-700 font-medium">
                            {t("profile:totalOrders")}
                          </div>
                        </div>
                        <div className="text-center bg-purple-50 p-7 rounded-xl border border-purple-100">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {formatPrice(profileData?.total_spent || "0.00")}
                          </div>
                          <div className="text-gray-700 font-medium">
                            {t("profile:totalSpent")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
