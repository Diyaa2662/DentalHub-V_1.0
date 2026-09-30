// src/components/layout/Footer.jsx - النسخة النهائية المبسطة
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
} from "react-icons/fa";

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
    // {
    //   icon: <FaTwitter />,
    //   url: "https://twitter.com/dentalhub",
    //   name: "Twitter",
    // },
    {
      icon: <FaInstagram />,
      url: "https://instagram.com/dsndental",
      name: "Instagram",
    },
    // {
    //   icon: <FaLinkedin />,
    //   url: "https://linkedin.com/company/dentalhub",
    //   name: "LinkedIn",
    // },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* المحتوى الرئيسي */}
      <div className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* معلومات الشركة */}
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-bold text-white">
                DentalHub
              </h3>
              <p className="text-gray-400 text-sm md:text-base">
                {t("footer:company_description")}
              </p>

              {/* معلومات الاتصال */}
              <div className="space-y-3">
                {/* <div className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm md:text-base">
                    123 Medical Street, Dental City, DC 12345
                  </span>
                </div> */}
                <div className="flex items-center">
                  <FaPhone className="mr-3 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm md:text-base">
                    070-5496374
                  </span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-3 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm md:text-base">
                    070-0944945
                  </span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-3 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm md:text-base">
                    070-0194136
                  </span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="mr-3 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm md:text-base">
                    info@dsndental.se
                  </span>
                </div>
              </div>
            </div>

            {/* روابط سريعة - نفس اللينكس بار */}
            <div className="space-y-4">
              <h4 className="text-lg md:text-xl font-semibold text-white">
                {t("footer:quickLinks_title")}
              </h4>
              <ul className="space-y-2 md:space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors text-sm md:text-base inline-block py-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* وسائل التواصل الاجتماعي فقط */}
            <div className="space-y-4">
              <h4 className="text-lg md:text-xl font-semibold text-white">
                {t("footer:social_title")}
              </h4>
              <p className="text-gray-400 text-sm md:text-base">
                {t("footer:social_description")}
              </p>

              <div className="flex space-x-3 md:space-x-4 pt-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-800 hover:bg-blue-600 rounded-full transition-colors"
                    aria-label={social.name}
                  >
                    <span className="text-sm md:text-base">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* القسم السفلي - حقوق النشر فقط */}
      <div className="border-t border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            {/* حقوق النشر */}
            <div className="text-center md:text-left">
              <div className="text-gray-400 text-xs md:text-sm">
                © {new Date().getFullYear()} DentalHub. {t("footer:copyright")}
              </div>
            </div>

            {/* شهادات الأمان */}
            <div className="flex items-center space-x-2">
              <div className="text-gray-400 text-xs md:text-sm">
                Secure Payment
              </div>
              <div className="w-8 h-5 md:w-10 md:h-6 bg-green-500 rounded flex items-center justify-center">
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
