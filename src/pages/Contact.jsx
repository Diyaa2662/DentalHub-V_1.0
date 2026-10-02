// src/pages/Contact.jsx - النسخة المعدلة مع container-max
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Contact = () => {
  const { t } = useTranslation(["common", "contact"]);

  const contactInfo = [
    {
      icon: <FaPhone className="text-2xl" />,
      title: t("contact:phoneTitle"),
      details: ["070-5496374", "070-0944945", "070-0194136"],
      description: t("contact:phoneDescription"),
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <FaEnvelope className="text-2xl" />,
      title: t("contact:emailTitle"),
      details: ["info@dsndental.se", "faraj@dsndental.se"],
      description: t("contact:emailDescription"),
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FaMapMarkerAlt className="text-2xl" />,
      title: t("contact:addressTitle"),
      details: [
        "DSN DENTAL AB",
        "Skytteholmsväge -7C",
        "171 44 Solna ",
        "Stockholm, Sweden",
      ],
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
      {/* ✅ الهيدر مع container-max */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-max py-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {t("common:contactUs")}
            </h1>
          </div>
        </div>
      </div>

      {/* ✅ المحتوى الرئيسي */}
      <div className="container-max py-14">
        {/* مقدمة */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
            {t("contact:welcomeTitle")}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("contact:welcomeDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
          {/* معلومات الاتصال */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">
              {t("contact:getInTouch")}
            </h3>

            {/* بطاقات معلومات الاتصال */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-5 ${info.color}`}
                  >
                    {info.icon}
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">
                    {info.title}
                  </h4>
                  <div className="space-y-2 mb-4">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-700">
                        {detail}
                      </p>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {info.description}
                  </p>
                </div>
              ))}
            </div>

            {/* وسائل التواصل الاجتماعي */}
            <div className="bg-white p-8 md:p-9 rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
              <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {t("contact:connectWithUs")}
              </h4>
              <p className="text-gray-600 mb-7 text-center leading-relaxed">
                {t("contact:socialDescription")}
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://wa.me/46705496374"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-13 h-13 w-[52px] h-[52px] bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="text-xl" />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=100074439486926"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[52px] h-[52px] bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="text-xl" />
                </a>
                <a
                  href="https://instagram.com/dsndental"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[52px] h-[52px] bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-xl" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* قسم FAQ المصغر */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-10 max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">
            {t("contact:faqTitle")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-5">
                <span className="text-blue-600 font-bold text-lg">Q1</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-3">
                {t("contact:faq1_question")}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t("contact:faq1_answer")}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-5">
                <span className="text-blue-600 font-bold text-lg">Q2</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-3">
                {t("contact:faq2_question")}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t("contact:faq2_answer")}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-5">
                <span className="text-blue-600 font-bold text-lg">Q3</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-3">
                {t("contact:faq3_question")}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t("contact:faq3_answer")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ قسم التواصل السريع */}
      <div className="bg-gray-50 border-t border-gray-200 py-14">
        <div className="container-max">
          <div className="text-center mb-9">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t("contact:preferQuickContact")}
            </h3>
            <p className="text-gray-600 mt-3 text-lg">
              {t("contact:quickContactDescription")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+46 70 549 63 74"
              className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-7 py-3.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <FaPhone className="mr-2" />
              {t("contact:callNow")}
            </a>
            <a
              href="mailto:info@dsndental.se"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <FaEnvelope className="mr-2" />
              {t("contact:emailNow")}
            </a>
            <a
              href="https://wa.me/46705496374"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-7 py-3.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
