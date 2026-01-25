// src/components/layout/Header.jsx - النسخة المبسطة
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import LinksBar from "./LinksBar";

const Header = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // عند أعلى الصفحة - أظهر Navbar دائماً
      if (currentScrollY <= 10) {
        setIsNavbarVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // تحقق من اتجاه السكرول
      const isScrollingDown = currentScrollY > lastScrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // تأكد أن السكرول كبير كفاية قبل الاختفاء/الظهور
      if (scrollDifference > 10) {
        if (isScrollingDown && isNavbarVisible) {
          // سكرول لأسفل - أخفي Navbar
          setIsNavbarVisible(false);
        } else if (!isScrollingDown && !isNavbarVisible) {
          // سكرول لأعلى - أظهر Navbar
          setIsNavbarVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isNavbarVisible]);

  return (
    <>
      {/* Navbar - ثابت في الأعلى مع أنيميشن */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
          isNavbarVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Navbar />
      </div>

      {/* LinksBar - يتحرك مع Navbar لكن يلتصق عند الاختفاء */}
      <div
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isNavbarVisible ? "mt-16" : "mt-0"
        }`}
        style={{
          top: isNavbarVisible ? "auto" : "0",
        }}
      >
        <LinksBar />
      </div>

      {/* مساحة احتياطية لمنع القفز */}
      <div
        className={`transition-all duration-300 ${
          isNavbarVisible ? "h-28" : "h-14"
        }`}
      />

      {/* زر العودة لأعلى */}
      {!isNavbarVisible && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-4 bottom-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-40"
          aria-label="Top"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default Header;
