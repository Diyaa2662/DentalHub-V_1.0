// src/pages/About.jsx - النسخة المعدلة مع container-max
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaTooth,
  FaShieldAlt,
  FaShippingFast,
  FaUsers,
  FaStar,
  FaHandsHelping,
  FaHospital,
  FaBriefcaseMedical,
  FaHeartbeat,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const About = () => {
  const { t } = useTranslation(["common", "about"]);

  const milestones = [
    {
      year: "2010",
      title: t("about:milestone_2010"),
      description: t("about:milestone_2010_desc"),
    },
    {
      year: "2013",
      title: t("about:milestone_2013"),
      description: t("about:milestone_2013_desc"),
    },
    {
      year: "2017",
      title: t("about:milestone_2017"),
      description: t("about:milestone_2017_desc"),
    },
    {
      year: "2020",
      title: t("about:milestone_2020"),
      description: t("about:milestone_2020_desc"),
    },
    {
      year: "2023",
      title: t("about:milestone_2023"),
      description: t("about:milestone_2023_desc"),
    },
  ];

  const values = [
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: t("about:value_quality"),
      description: t("about:value_quality_desc"),
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: t("about:value_customerFirst"),
      description: t("about:value_customerFirst_desc"),
    },
    {
      icon: <FaBriefcaseMedical className="text-3xl" />,
      title: t("about:value_expertise"),
      description: t("about:value_expertise_desc"),
    },
    {
      icon: <FaHeartbeat className="text-3xl" />,
      title: t("about:value_innovation"),
      description: t("about:value_innovation_desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ الهيدر مع container-max */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-max py-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {t("common:aboutUs")}
            </h1>
          </div>
        </div>
      </div>

      {/* ✅ القسم الرئيسي */}
      <div className="container-max py-14">
        {/* مقدمة */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <FaTooth className="text-3xl text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
            {t("about:welcomeTitle")}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("about:welcomeDescription")}
          </p>
        </div>

        {/* قيمنا */}
        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            {t("about:ourValues")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-5">
                  <div className="text-blue-600">{value.icon}</div>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* مهمتنا ورؤيتنا */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-white p-8 md:p-9 rounded-2xl shadow-lg border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <FaStar className="text-white text-xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {t("about:ourMission")}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              {t("about:missionDescription")}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white p-8 md:p-9 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <FaHospital className="text-white text-xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {t("about:ourVision")}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              {t("about:visionDescription")}
            </p>
          </div>
        </div>

        {/* المحطات الرئيسية */}
        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-14">
            {t("about:ourJourney")}
          </h3>
          <div className="relative">
            {/* الخط الزمني */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 hidden lg:block"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col lg:flex-row items-center ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* نقطة على الخط الزمني */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10 hidden lg:block"></div>

                  {/* السنة */}
                  <div
                    className={`lg:w-1/2 ${
                      index % 2 === 0 ? "lg:pr-12 lg:text-right" : "lg:pl-12"
                    }`}
                  >
                    <div className="bg-blue-600 text-white font-bold text-lg px-6 py-2.5 rounded-lg inline-block shadow-md">
                      {milestone.year}
                    </div>
                  </div>

                  {/* المحتوى */}
                  <div
                    className={`lg:w-1/2 mt-4 lg:mt-0 ${
                      index % 2 === 0 ? "lg:pl-12" : "lg:pr-12 lg:text-right"
                    }`}
                  >
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                      <h4 className="text-xl font-bold text-gray-800 mb-3">
                        {milestone.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* إحصائيات */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-2xl p-8 md:p-12 mb-20">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            {t("about:byTheNumbers")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">2,500+</div>
              <div className="text-blue-200">{t("about:stat_clients")}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">15+</div>
              <div className="text-blue-200">{t("about:stat_years")}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">5,000+</div>
              <div className="text-blue-200">{t("about:stat_products")}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-blue-200">
                {t("about:stat_satisfaction")}
              </div>
            </div>
          </div>
        </div>

        {/* دعوة للعمل */}
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {t("about:joinUs")}
          </h3>
          <p className="text-gray-600 mb-9 max-w-2xl mx-auto text-lg leading-relaxed">
            {t("about:joinDescription")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {t("about:contactUs")}
            </Link>
            <Link
              to="/products"
              className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3.5 rounded-lg font-bold text-lg transition-all shadow-md hover:shadow-lg"
            >
              {t("about:browseProducts")}
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ قسم الضمان */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 py-16">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <FaShieldAlt className="text-2xl text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {t("about:guarantee_quality")}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {t("about:guarantee_quality_desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <FaShippingFast className="text-2xl text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {t("about:guarantee_shipping")}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {t("about:guarantee_shipping_desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <FaHandsHelping className="text-2xl text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {t("about:guarantee_support")}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {t("about:guarantee_support_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
