// src/pages/Login.jsx - النسخة المعدلة مع اسم توكن مختلف
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  FaSignInAlt,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaEnvelope,
  FaArrowLeft,
  FaKey,
  FaBriefcaseMedical,
  FaShoppingCart,
  FaHeart,
} from "react-icons/fa";

const Login = () => {
  const { t } = useTranslation(["common", "auth"]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("📤 Sending login request:", formData);

      const response = await api.post("/login", formData);

      console.log("✅ Login response:", response.data);

      if (response.data && response.data.user && response.data.token) {
        // حفظ بيانات المستخدم في localStorage
        const userData = response.data.user;
        const token = response.data.token;

        // ⭐ استخدم اسم توكن مختلف لتجنب التعارض مع مشروع الداشبورد
        localStorage.setItem("customerToken", token);

        // حفظ بيانات المستخدم
        localStorage.setItem("customerData", JSON.stringify(userData));

        // إذا كان rememberMe، نحفظ البريد في localStorage
        if (rememberMe) {
          localStorage.setItem("customerEmail", formData.email);
        } else {
          localStorage.removeItem("customerEmail");
        }

        // حفظ في sessionStorage أيضاً
        sessionStorage.setItem("customerToken", token);
        sessionStorage.setItem("customerData", JSON.stringify(userData));

        console.log("💾 Saved customer data:", userData);
        console.log("🔑 Saved customer token:", token);

        // ⭐ توجيه المستجر للصفحة الرئيسية فقط
        navigate("/");

        // ⭐ إعادة تحميل الصفحة بعد توجيه ناجح لتحديث حالة الهيدر
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        setError(t("auth:loginFailed"));
      }
    } catch (err) {
      console.error("❌ Login error:", err);

      // عرض رسالة الخطأ المناسبة
      if (err.response) {
        // خطأ من السيرفر
        if (err.response.status === 401) {
          setError(t("auth:invalidCredentials"));
        } else if (err.response.status === 422) {
          setError(t("auth:validationError"));
        } else {
          setError(err.response.data?.message || t("auth:serverError"));
        }
      } else if (err.request) {
        // لا يوجد اتصال بالسيرفر
        setError(t("auth:networkError"));
      } else {
        // خطأ آخر
        setError(t("auth:unknownError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* زر العودة */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          {t("common:backToHome")}
        </Link>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* قسم الصورة والمعلومات */}
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-xl mb-6">
                    <FaBriefcaseMedical className="text-white text-2xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {t("auth:welcomeBack")}
                  </h2>
                  <p className="text-blue-100 text-lg mb-8">
                    {t("auth:loginDescription")}
                  </p>
                </div>

                {/* ميزات الحساب */}
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <FaShoppingCart className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">
                        {t("auth:feature1_title")}
                      </h4>
                      <p className="text-blue-200 text-sm">
                        {t("auth:feature1_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <FaHeart className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">
                        {t("auth:feature2_title")}
                      </h4>
                      <p className="text-blue-200 text-sm">
                        {t("auth:feature2_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <FaShieldAlt className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">
                        {t("auth:feature3_title")}
                      </h4>
                      <p className="text-blue-200 text-sm">
                        {t("auth:feature3_desc")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* إحصائيات */}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">2K+</div>
                      <div className="text-blue-200 text-sm">
                        {t("auth:stat_clinics")}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">4.8</div>
                      <div className="text-blue-200 text-sm">
                        {t("auth:stat_rating")}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">24/7</div>
                      <div className="text-blue-200 text-sm">
                        {t("auth:stat_support")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* قسم تسجيل الدخول */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                {/* الهيدر */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                    <FaSignInAlt className="text-blue-600 text-3xl" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t("auth:loginTitle")}
                  </h1>
                  <p className="text-gray-600">{t("auth:loginSubtitle")}</p>
                </div>

                {/* أخطاء */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-bold">!</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* النموذج */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* البريد الإلكتروني */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      <div className="flex items-center">
                        <FaUser className="mr-2 text-gray-400" />
                        {t("auth:emailLabel")}
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder={t("auth:emailPlaceholder")}
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* كلمة المرور */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      <div className="flex items-center">
                        <FaLock className="mr-2 text-gray-400" />
                        {t("auth:passwordLabel")}
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder={t("auth:passwordPlaceholder")}
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <FaKey className="text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* تذكرني فقط */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-gray-700">
                      {t("auth:rememberMe")}
                    </label>
                  </div>

                  {/* زر تسجيل الدخول */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-3"></div>
                        {t("auth:loggingIn")}
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="mr-3" />
                        {t("auth:loginButton")}
                      </>
                    )}
                  </button>
                </form>

                {/* رابط التسجيل */}
                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    {t("auth:noAccount")}{" "}
                    <Link
                      to="/register"
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      {t("auth:createAccount")}
                    </Link>
                  </p>
                </div>

                {/* سياسة الخصوصية */}
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-xs">
                    {t("auth:privacyNotice")}{" "}
                    <Link
                      to="/privacy"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {t("auth:privacyPolicy")}
                    </Link>{" "}
                    {t("auth:and")}{" "}
                    <Link
                      to="/terms"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {t("auth:termsOfService")}
                    </Link>
                  </p>
                </div>
              </div>

              {/* معلومات إضافية للهواتف */}
              <div className="mt-8 lg:hidden">
                <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {t("auth:benefitsTitle")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                        <FaShoppingCart className="text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {t("auth:benefit1")}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                        <FaHeart className="text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {t("auth:benefit2")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم الأمان */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <FaShieldAlt className="text-green-600 text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">
                  {t("auth:securityTitle")}
                </h4>
                <p className="text-sm text-gray-600">
                  {t("auth:securityDescription")}
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">HTTPS</div>
                <div className="text-xs text-gray-500">
                  {t("auth:secureConnection")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-xs text-gray-500">
                  {t("auth:monitoring")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">ISO</div>
                <div className="text-xs text-gray-500">
                  {t("auth:certified")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
