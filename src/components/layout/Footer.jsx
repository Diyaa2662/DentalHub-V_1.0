// src/components/layout/Footer.jsx - النسخة المعدلة مع container-max
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaFacebook, FaInstagram, FaPhone, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  const { t } = useTranslation(["footer", "navbar"]);

  // نفس روابط اللينكس بار
  const quickLinks = [
    { path: "/", label: t("navbar:menu_home") },
    { path: "/products", label: t("navbar:menu_shop") },
    { path: "/about", label: t("navbar:menu_about") },
    { path: "/contact", label: t("navbar:menu_contact") },
  ];

  const socialLinks = [
    {
      icon: <FaFacebook />,
      url: "https://www.facebook.com/profile.php?id=100074439486926",
      name: "Facebook",
    },
    {
      icon: <FaInstagram />,
      url: "https://instagram.com/dsndental",
      name: "Instagram",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* المحتوى الرئيسي */}
      <div className="py-12 md:py-16">
        {/* ✅ container-max موحد */}
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
            {/* معلومات الشركة */}
            <div className="space-y-5">
              <h3 className="text-2xl font-bold text-white">DSN Dental</h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                {t("footer:company_description")}
              </p>

              {/* معلومات الاتصال */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center">
                  <FaPhone className="mr-3 text-blue-400 flex-shrink-0" />
                  <a
                    href="tel:0705496374"
                    className="text-gray-300 text-sm md:text-base hover:text-white transition-colors"
                  >
                    070-5496374
                  </a>
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-3 text-blue-400 flex-shrink-0" />
                  <a
                    href="tel:0700944945"
                    className="text-gray-300 text-sm md:text-base hover:text-white transition-colors"
                  >
                    070-0944945
                  </a>
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-3 text-blue-400 flex-shrink-0" />
                  <a
                    href="tel:0700194136"
                    className="text-gray-300 text-sm md:text-base hover:text-white transition-colors"
                  >
                    070-0194136
                  </a>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="mr-3 text-blue-400 flex-shrink-0" />
                  <a
                    href="mailto:info@dsndental.se"
                    className="text-gray-300 text-sm md:text-base hover:text-white transition-colors"
                  >
                    info@dsndental.se
                  </a>
                </div>
              </div>
            </div>

            {/* روابط سريعة */}
            <div className="space-y-5">
              <h4 className="text-xl font-semibold text-white">
                {t("footer:quickLinks_title")}
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white text-sm md:text-base inline-block py-1 hover:translate-x-1 transform transition-[color,transform]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* وسائل التواصل الاجتماعي */}
            <div className="space-y-5">
              <h4 className="text-xl font-semibold text-white">
                {t("footer:social_title")}
              </h4>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                {t("footer:social_description")}
              </p>

              <div className="flex space-x-4 pt-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 flex items-center justify-center bg-gray-800 hover:bg-blue-600 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                    aria-label={social.name}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* القسم السفلي - حقوق النشر */}
      <div className="border-t border-gray-800 py-5">
        <div className="container-max">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* حقوق النشر */}
            <div className="text-center md:text-left">
              <div className="text-gray-400 text-xs md:text-sm">
                © {new Date().getFullYear()} DSN Dental. {t("footer:copyright")}
              </div>
            </div>

            {/* شهادات الأمان */}
            <div className="flex items-center gap-3">
              <div className="text-gray-400 text-xs md:text-sm">
                Secure Payment
              </div>
              <div className="w-10 h-6 bg-green-500 rounded flex items-center justify-center shadow">
                <span className="text-white font-bold text-xs">SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
