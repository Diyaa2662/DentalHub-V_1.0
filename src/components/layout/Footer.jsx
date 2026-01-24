// src/components/layout/Footer.jsx - النسخة المعدلة مع نظام الترجمة الجديد
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCreditCard,
  FaShippingFast,
  FaShieldAlt,
  FaHeadset,
} from "react-icons/fa";

const Footer = () => {
  const { t } = useTranslation(["footer"]);

  const paymentMethods = [
    { name: "Visa", icon: "💳" },
    { name: "Mastercard", icon: "💳" },
    { name: "PayPal", icon: "💰" },
    { name: "Apple Pay", icon: "🍎" },
    { name: "Google Pay", icon: "G" },
  ];

  const socialLinks = [
    {
      icon: <FaFacebook />,
      url: "https://facebook.com/dentalhub",
      name: "Facebook",
    },
    {
      icon: <FaTwitter />,
      url: "https://twitter.com/dentalhub",
      name: "Twitter",
    },
    {
      icon: <FaInstagram />,
      url: "https://instagram.com/dentalhub",
      name: "Instagram",
    },
    {
      icon: <FaLinkedin />,
      url: "https://linkedin.com/company/dentalhub",
      name: "LinkedIn",
    },
  ];

  const features = [
    {
      icon: <FaShippingFast className="text-2xl text-blue-600" />,
      title: t("footer:features_freeShipping_title"),
      description: t("footer:features_freeShipping_desc"),
    },
    {
      icon: <FaShieldAlt className="text-2xl text-green-600" />,
      title: t("footer:features_warranty_title"),
      description: t("footer:features_warranty_desc"),
    },
    {
      icon: <FaCreditCard className="text-2xl text-purple-600" />,
      title: t("footer:features_securePay_title"),
      description: t("footer:features_securePay_desc"),
    },
    {
      icon: <FaHeadset className="text-2xl text-orange-600" />,
      title: t("footer:features_support_title"),
      description: t("footer:features_support_desc"),
    },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* شريط الميزات */}
      <div className="bg-white text-gray-800 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* معلومات الشركة */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">DentalHub</h3>
              <p className="text-gray-400 mb-6">
                {t("footer:company_description")}
              </p>

              {/* معلومات الاتصال */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-blue-400" />
                  <span className="text-gray-300">
                    123 Medical Street, Dental City, DC 12345
                  </span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-3 text-blue-400" />
                  <span className="text-gray-300">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="mr-3 text-blue-400" />
                  <span className="text-gray-300">info@dentalhub.com</span>
                </div>
              </div>
            </div>

            {/* روابط سريعة */}
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white">
                {t("footer:quickLinks_title")}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:quickLinks_home")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:quickLinks_shop")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categories"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:quickLinks_categories")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:quickLinks_about")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:quickLinks_contact")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:quickLinks_faq")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* فئات المنتجات */}
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white">
                {t("footer:categories_title")}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/category/examination"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:categories_examination")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/surgical"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:categories_surgical")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/equipment"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:categories_equipment")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/supplies"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:categories_supplies")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/personal"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:categories_personal")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/laboratory"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("footer:categories_laboratory")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* النشرة البريدية */}
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white">
                {t("footer:newsletter_title")}
              </h4>
              <p className="text-gray-400 mb-6">
                {t("footer:newsletter_description")}
              </p>

              <form className="space-y-4">
                <input
                  type="email"
                  placeholder={t("footer:newsletter_placeholder")}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {t("footer:newsletter_button")}
                </button>
              </form>

              {/* وسائل التواصل الاجتماعي */}
              <div className="mt-8">
                <h5 className="text-lg font-semibold mb-4 text-white">
                  {t("footer:social_title")}
                </h5>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-blue-600 rounded-full transition-colors"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* طرق الدفع */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h5 className="text-lg font-semibold mb-2 text-white">
                {t("footer:payment_title")}
              </h5>
              <div className="flex space-x-4">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="w-12 h-8 flex items-center justify-center bg-gray-800 rounded-md"
                    title={method.name}
                  >
                    <span className="text-lg">{method.icon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* الأمان والشهادات */}
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end space-x-4 mb-2">
                <div className="text-gray-400 text-sm">
                  {t("footer:security_ssl")}
                </div>
                <div className="w-10 h-6 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SSL</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} DentalHub. {t("footer:copyright")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الشريط السفلي */}
      <div className="bg-black py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="mb-2 md:mb-0">{t("footer:bottom_legal")}</div>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                {t("footer:bottom_privacy")}
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                {t("footer:bottom_terms")}
              </Link>
              <Link
                to="/cookies"
                className="hover:text-white transition-colors"
              >
                {t("footer:bottom_cookies")}
              </Link>
              <Link
                to="/sitemap"
                className="hover:text-white transition-colors"
              >
                {t("footer:bottom_sitemap")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
