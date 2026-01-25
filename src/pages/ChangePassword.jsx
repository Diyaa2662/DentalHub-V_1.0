// src/pages/ChangePassword.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  FaLock,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaShieldAlt,
} from "react-icons/fa";

const ChangePassword = () => {
  const { t } = useTranslation(["common", "profile"]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // جلب الإيميل من localStorage إذا كان موجوداً
  React.useEffect(() => {
    const customerData = localStorage.getItem("customerData");
    if (customerData) {
      try {
        const parsedData = JSON.parse(customerData);
        if (parsedData.email) {
          setFormData((prev) => ({ ...prev, email: parsedData.email }));
        }
      } catch (err) {
        console.error("Error parsing customer data:", err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // فحص قوة كلمة السر إذا كان الحقل هو newPassword
    if (name === "newPassword") {
      checkPasswordStrength(value);
    }

    // تحقق من مطابقة كلمات السر إذا كان أحد حقلين كلمة السر الجديدة
    if (name === "newPassword" || name === "confirmPassword") {
      if (formData.newPassword && formData.confirmPassword) {
        // eslint-disable-next-line no-unused-vars
        setError((prev) =>
          formData.newPassword !== formData.confirmPassword
            ? t("profile:passwordsNotMatch")
            : "",
        );
      }
    }
  };

  const checkPasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordRequirements(requirements);

    // حساب قوة كلمة السر (0-5)
    const strength = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return t("profile:veryWeak");
    if (passwordStrength <= 2) return t("profile:weak");
    if (passwordStrength <= 3) return t("profile:medium");
    if (passwordStrength <= 4) return t("profile:strong");
    return t("profile:veryStrong");
  };

  const validateForm = () => {
    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError(t("profile:validEmailRequired"));
      return false;
    }

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError(t("profile:allFieldsRequired"));
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t("profile:passwordsNotMatch"));
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError(t("profile:passwordMinLength"));
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError(t("profile:samePasswordError"));
      return false;
    }

    return true;
  };

  // في ملف src/pages/ChangePassword.jsx - تحديث جزء handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🔐 Changing password...", {
        email: formData.email,
        currentPassword: "[HIDDEN]",
        newPassword: "[HIDDEN]",
        confirmPassword: "[HIDDEN]",
      });

      // هنا التعديل المهم: أسماء الحقول يجب أن تكون كما في API
      const response = await api.post(
        "/resetpassword",
        {
          email: formData.email,
          current_password: formData.currentPassword, // current_password (ليس currentPassword)
          new_password: formData.newPassword, // new_password (ليس newPassword)
          new_password_confirmation: formData.confirmPassword, // new_password_confirmation (ليس confirmPassword)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("✅ Password change response:", response.data);

      if (response.data && response.data.message) {
        setSuccess(response.data.message || t("profile:passwordChangeSuccess"));

        // إعادة تعيين النموذج
        setFormData({
          email: formData.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // إخفاء رسالة النجاح بعد 5 ثواني
        setTimeout(() => {
          setSuccess("");
          navigate("/profile");
        }, 5000);
      }
    } catch (err) {
      console.error("❌ Error changing password:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerData");
        navigate("/login");
      } else if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        setError(firstError || t("profile:validationError"));
      } else if (err.response?.status === 400) {
        setError(
          err.response.data?.message || t("profile:currentPasswordError"),
        );
      } else {
        setError(
          err.response?.data?.message || t("profile:passwordChangeError"),
        );
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* زر العودة */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            {t("profile:backToProfile")}
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* الهيدر */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-4">
              <FaLock className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t("profile:changePassword")}
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              {t("profile:passwordChangeDescription")}
            </p>
          </div>

          {/* النموذج */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
            {/* رسائل الحالة */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <FaTimes className="text-red-500 mr-3" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <FaCheck className="text-green-500 mr-3" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("profile:emailAddress")} *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    placeholder={t("profile:enterYourEmail")}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <FaShieldAlt className="text-gray-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {t("profile:emailCannotChange")}
                </p>
              </div>

              {/* كلمة السر الحالية */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("profile:currentPassword")} *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={t("profile:enterCurrentPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* كلمة السر الجديدة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("profile:newPassword")} *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={t("profile:enterNewPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>

                {/* شريط قوة كلمة السر */}
                {formData.newPassword && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {t("profile:passwordStrength")}:
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          passwordStrength <= 2
                            ? "text-red-600"
                            : passwordStrength <= 3
                              ? "text-yellow-600"
                              : passwordStrength <= 4
                                ? "text-blue-600"
                                : "text-green-600"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* متطلبات كلمة السر */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {t("profile:passwordRequirements")}:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center">
                      {passwordRequirements.length ? (
                        <FaCheck className="text-green-500 mr-2" />
                      ) : (
                        <FaTimes className="text-red-500 mr-2" />
                      )}
                      <span
                        className={`text-sm ${passwordRequirements.length ? "text-green-600" : "text-gray-600"}`}
                      >
                        {t("profile:min8Characters")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {passwordRequirements.uppercase ? (
                        <FaCheck className="text-green-500 mr-2" />
                      ) : (
                        <FaTimes className="text-red-500 mr-2" />
                      )}
                      <span
                        className={`text-sm ${passwordRequirements.uppercase ? "text-green-600" : "text-gray-600"}`}
                      >
                        {t("profile:uppercaseLetter")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {passwordRequirements.lowercase ? (
                        <FaCheck className="text-green-500 mr-2" />
                      ) : (
                        <FaTimes className="text-red-500 mr-2" />
                      )}
                      <span
                        className={`text-sm ${passwordRequirements.lowercase ? "text-green-600" : "text-gray-600"}`}
                      >
                        {t("profile:lowercaseLetter")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {passwordRequirements.number ? (
                        <FaCheck className="text-green-500 mr-2" />
                      ) : (
                        <FaTimes className="text-red-500 mr-2" />
                      )}
                      <span
                        className={`text-sm ${passwordRequirements.number ? "text-green-600" : "text-gray-600"}`}
                      >
                        {t("profile:oneNumber")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {passwordRequirements.special ? (
                        <FaCheck className="text-green-500 mr-2" />
                      ) : (
                        <FaTimes className="text-red-500 mr-2" />
                      )}
                      <span
                        className={`text-sm ${passwordRequirements.special ? "text-green-600" : "text-gray-600"}`}
                      >
                        {t("profile:specialCharacter")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* تأكيد كلمة السر الجديدة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("profile:confirmNewPassword")} *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                      formData.newPassword &&
                      formData.confirmPassword &&
                      formData.newPassword !== formData.confirmPassword
                        ? "border-red-300 focus:border-red-500"
                        : formData.newPassword &&
                            formData.confirmPassword &&
                            formData.newPassword === formData.confirmPassword
                          ? "border-green-300 focus:border-green-500"
                          : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder={t("profile:confirmNewPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {formData.newPassword &&
                  formData.confirmPassword &&
                  formData.newPassword === formData.confirmPassword && (
                    <p className="text-sm text-green-600 mt-2 flex items-center">
                      <FaCheck className="mr-2" />
                      {t("profile:passwordsMatch")}
                    </p>
                  )}
              </div>

              {/* أزرار */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/profile"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("common:cancel")}
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-3"></div>
                      {t("profile:changingPassword")}
                    </>
                  ) : (
                    <>
                      <FaKey className="mr-3" />
                      {t("profile:changePasswordButton")}
                    </>
                  )}
                </button>
              </div>

              {/* نص تذكيري */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                    <FaShieldAlt className="mr-2 text-blue-600" />
                    {t("profile:securityTips")}
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {t("profile:tipUniquePassword")}</li>
                    <li>• {t("profile:tipChangeRegularly")}</li>
                    <li>• {t("profile:tipNoPersonalInfo")}</li>
                    <li>• {t("profile:tipPasswordManager")}</li>
                  </ul>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
