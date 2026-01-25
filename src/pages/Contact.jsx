// src/pages/Contact.jsx - صفحة الاتصال بنا
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Contact = () => {
  const { t } = useTranslation(["common", "contact"]);

  const contactInfo = [
    {
      icon: <FaPhone className="text-2xl" />,
      title: t("contact:phoneTitle"),
      details: ["+46 123 456 7890", "+46 987 654 3210"],
      description: t("contact:phoneDescription"),
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <FaEnvelope className="text-2xl" />,
      title: t("contact:emailTitle"),
      details: ["info@dental-equipment.com", "support@dental-equipment.com"],
      description: t("contact:emailDescription"),
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FaMapMarkerAlt className="text-2xl" />,
      title: t("contact:addressTitle"),
      details: ["Drottninggatan 123", "111 51 Stockholm, Sweden"],
      description: t("contact:addressDescription"),
      color: "bg-red-100 text-red-600",
    },
    {
      icon: <FaClock className="text-2xl" />,
      title: t("contact:hoursTitle"),
      details: [
        t("contact:weekdays") + ": 8:00 AM - 6:00 PM",
        t("contact:weekend") + ": 9:00 AM - 4:00 PM",
      ],
      description: t("contact:hoursDescription"),
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* الهيدر */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("common:contactUs")}
            </h1>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-12">
        {/* مقدمة */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("contact:welcomeTitle")}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("contact:welcomeDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
          {/* معلومات الاتصال */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              {t("contact:getInTouch")}
            </h3>

            {/* معلومات الاتصال */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${info.color}`}
                  >
                    {info.icon}
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">
                    {info.title}
                  </h4>
                  <div className="space-y-2 mb-3">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-700">
                        {detail}
                      </p>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">{info.description}</p>
                </div>
              ))}
            </div>

            {/* وسائل التواصل الاجتماعي */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
              <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
                {t("contact:connectWithUs")}
              </h4>
              <p className="text-gray-600 mb-6 text-center">
                {t("contact:socialDescription")}
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://wa.me/461234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
                  title="WhatsApp"
                >
                  <FaWhatsapp className="text-xl" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <FaFacebookF className="text-xl" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-400 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-colors"
                  title="Twitter"
                >
                  <FaTwitter className="text-xl" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition-colors"
                  title="LinkedIn"
                >
                  <FaLinkedinIn className="text-xl" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  <FaInstagram className="text-xl" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* قسم FAQ المصغر */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t("contact:faqTitle")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <span className="text-blue-600 font-bold">Q1</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">
                {t("contact:faq1_question")}
              </h4>
              <p className="text-gray-600 text-sm">
                {t("contact:faq1_answer")}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <span className="text-blue-600 font-bold">Q2</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">
                {t("contact:faq2_question")}
              </h4>
              <p className="text-gray-600 text-sm">
                {t("contact:faq2_answer")}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <span className="text-blue-600 font-bold">Q3</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">
                {t("contact:faq3_question")}
              </h4>
              <p className="text-gray-600 text-sm">
                {t("contact:faq3_answer")}
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              to="/faq"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("contact:viewAllFAQ")} →
            </Link>
          </div>
        </div>
      </div>

      {/* قسم التواصل السريع */}
      <div className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              {t("contact:preferQuickContact")}
            </h3>
            <p className="text-gray-600 mt-2">
              {t("contact:quickContactDescription")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="tel:+461234567890"
              className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FaPhone className="mr-2" />
              {t("contact:callNow")}
            </a>
            <a
              href="mailto:info@dental-equipment.com"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FaEnvelope className="mr-2" />
              {t("contact:emailNow")}
            </a>
            <a
              href="https://wa.me/461234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FaWhatsapp className="mr-2" />
              {t("contact:whatsappNow")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
