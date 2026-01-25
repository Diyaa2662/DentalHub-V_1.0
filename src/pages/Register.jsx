// src/pages/Register.jsx - صفحة إنشاء حساب جديد
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  FaUserPlus,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaShieldAlt,
  FaCheckCircle,
  FaBriefcaseMedical,
  FaShoppingCart,
  FaHeart,
} from "react-icons/fa";

const Register = () => {
  const { t } = useTranslation(["common", "auth"]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // تحقق من قوة كلمة المرور
    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;

    // طول كلمة المرور
    if (password.length >= 8) strength += 25;

    // يحتوي على حروف كبيرة
    if (/[A-Z]/.test(password)) strength += 25;

    // يحتوي على أرقام
    if (/[0-9]/.test(password)) strength += 25;

    // يحتوي على رموز خاصة
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return "bg-green-500";
    if (passwordStrength >= 50) return "bg-yellow-500";
    if (passwordStrength >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength >= 75) return t("auth:passwordStrong");
    if (passwordStrength >= 50) return t("auth:passwordMedium");
    if (passwordStrength >= 25) return t("auth:passwordWeak");
    return t("auth:passwordVeryWeak");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t("auth:nameRequired"));
      return false;
    }

    if (!formData.email.trim()) {
      setError(t("auth:emailRequired"));
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(t("auth:invalidEmail"));
      return false;
    }

    if (!formData.password) {
      setError(t("auth:passwordRequired"));
      return false;
    }

    if (formData.password.length < 8) {
      setError(t("auth:passwordMinLength"));
      return false;
    }

    if (formData.password !== formData.password_confirmation) {
      setError(t("auth:passwordMismatch"));
      return false;
    }

    return true;
  };

  // src/pages/Register.jsx - التعديلات المطلوبة في handleSubmit

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/register", formData);

      // التعديل: فقط نتحقق من أن الاستجابة تحتوي على رسالة نجاح
      if (response.data && response.data.message) {
        setSuccess(true);

        // تنظيف النموذج بعد النجاح (اختياري)
        setFormData({
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
          phone: "",
          address: "",
        });

        // توجيه المستخدم لصفحة تسجيل الدخول بعد 3 ثواني
        setTimeout(() => {
          navigate("/login", {
            state: {
              email: formData.email,
              registrationSuccess: true,
              message: response.data.message,
            },
          });
        }, 3000);
      } else {
        setError(t("auth:registrationFailed"));
      }
    } catch (err) {
      console.error("❌ Registration error:", err);

      if (err.response) {
        if (err.response.status === 422) {
          const errors = err.response.data.errors;
          const firstError = Object.values(errors)[0]?.[0];
          setError(firstError || t("auth:validationError"));
        } else if (err.response.status === 409) {
          setError(t("auth:emailExists"));
        } else {
          setError(err.response.data?.message || t("auth:serverError"));
        }
      } else if (err.request) {
        setError(t("auth:networkError"));
      } else {
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
              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-2xl p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-xl mb-6">
                    <FaBriefcaseMedical className="text-white text-2xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {t("auth:joinCommunity")}
                  </h2>
                  <p className="text-green-100 text-lg mb-8">
                    {t("auth:registerDescription")}
                  </p>
                </div>

                {/* مزايا التسجيل */}
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <FaShoppingCart className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">
                        {t("auth:benefit1_title")}
                      </h4>
                      <p className="text-green-200 text-sm">
                        {t("auth:benefit1_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <FaHeart className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">
                        {t("auth:benefit2_title")}
                      </h4>
                      <p className="text-green-200 text-sm">
                        {t("auth:benefit2_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <FaShieldAlt className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">
                        {t("auth:benefit3_title")}
                      </h4>
                      <p className="text-green-200 text-sm">
                        {t("auth:benefit3_desc")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* إحصائيات */}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">2K+</div>
                      <div className="text-green-200 text-sm">
                        {t("auth:stat_clinics")}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">4.8</div>
                      <div className="text-green-200 text-sm">
                        {t("auth:stat_rating")}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">24/7</div>
                      <div className="text-green-200 text-sm">
                        {t("auth:stat_support")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* قسم التسجيل */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                {/* الهيدر */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <FaUserPlus className="text-green-600 text-3xl" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t("auth:createAccount")}
                  </h1>
                  <p className="text-gray-600">{t("auth:registerSubtitle")}</p>
                </div>

                {/* رسالة النجاح */}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FaCheckCircle className="text-green-500 text-xl" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          {t("auth:registrationSuccess")}
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          ✅ {t("auth:accountCreated")}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          {t("auth:redirectingToLogin")}
                        </p>
                        <p className="text-xs text-green-500 mt-2">
                          <FaEnvelope className="inline mr-1" />
                          {t("auth:emailVerificationSent")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* أخطاء */}
                {error && !success && (
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
                {!success && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* الاسم الكامل */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <div className="flex items-center">
                          <FaUser className="mr-2 text-gray-400" />
                          {t("auth:fullName")} *
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder={t("auth:namePlaceholder")}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <FaUser className="text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* البريد الإلكتروني */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <div className="flex items-center">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          {t("auth:emailAddress")} *
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder={t("auth:emailPlaceholder")}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* رقم الهاتف (اختياري) */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <div className="flex items-center">
                          <FaPhone className="mr-2 text-gray-400" />
                          {t("auth:phoneNumber")}
                        </div>
                        <span className="text-gray-500 text-sm font-normal">
                          ({t("auth:optional")})
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder={t("auth:phonePlaceholder")}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <FaPhone className="text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* العنوان (اختياري) */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-gray-400" />
                          {t("auth:address")}
                        </div>
                        <span className="text-gray-500 text-sm font-normal">
                          ({t("auth:optional")})
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder={t("auth:addressPlaceholder")}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <FaMapMarkerAlt className="text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* كلمة المرور */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <div className="flex items-center">
                          <FaLock className="mr-2 text-gray-400" />
                          {t("auth:password")} *
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder={t("auth:passwordPlaceholder")}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <FaLock className="text-gray-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      {/* مؤشر قوة كلمة المرور */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{t("auth:passwordStrength")}:</span>
                            <span
                              className={`font-medium ${
                                passwordStrength >= 75
                                  ? "text-green-600"
                                  : passwordStrength >= 50
                                    ? "text-yellow-600"
                                    : passwordStrength >= 25
                                      ? "text-orange-600"
                                      : "text-red-600"
                              }`}
                            >
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                              style={{ width: `${passwordStrength}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {t("auth:passwordRequirements")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* تأكيد كلمة المرور */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <div className="flex items-center">
                          <FaLock className="mr-2 text-gray-400" />
                          {t("auth:confirmPassword")} *
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder={t("auth:confirmPasswordPlaceholder")}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <FaLock className="text-gray-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      {/* التحقق من مطابقة كلمة المرور */}
                      {formData.password_confirmation && (
                        <div className="mt-1">
                          {formData.password ===
                          formData.password_confirmation ? (
                            <p className="text-xs text-green-600 flex items-center">
                              <FaCheckCircle className="mr-1" />
                              {t("auth:passwordsMatch")}
                            </p>
                          ) : (
                            <p className="text-xs text-red-600">
                              {t("auth:passwordsDoNotMatch")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* زر التسجيل */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                        loading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-3"></div>
                          {t("auth:creatingAccount")}
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="mr-3" />
                          {t("auth:createAccountButton")}
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* رابط تسجيل الدخول */}
                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    {t("auth:alreadyHaveAccount")}{" "}
                    <Link
                      to="/login"
                      className="text-green-600 hover:text-green-800 font-bold"
                    >
                      {t("auth:signIn")}
                    </Link>
                  </p>
                </div>
              </div>

              {/* معلومات إضافية للهواتف */}
              <div className="mt-8 lg:hidden">
                <div className="bg-gradient-to-r from-green-50 to-white p-6 rounded-xl border border-green-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {t("auth:whyRegister")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                        <FaShoppingCart className="text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {t("auth:benefit1")}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                        <FaHeart className="text-green-600" />
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
                  {t("auth:securityGuarantee")}
                </h4>
                <p className="text-sm text-gray-600">
                  {t("auth:securityDescription")}
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">256-bit</div>
                <div className="text-xs text-gray-500">
                  {t("auth:encryption")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">GDPR</div>
                <div className="text-xs text-gray-500">
                  {t("auth:compliant")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">SSL</div>
                <div className="text-xs text-gray-500">{t("auth:secured")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
