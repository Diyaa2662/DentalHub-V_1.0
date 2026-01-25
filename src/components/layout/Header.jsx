// src/components/layout/Header.jsx - النسخة المعدلة مع إصلاح الاهتزاز
import React, { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import LinksBar from "./LinksBar";

const Header = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const timeoutRef = useRef(null);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // استخدام requestAnimationFrame لمنع الاهتزاز
    if (!ticking.current) {
      ticking.current = true;

      requestAnimationFrame(() => {
        // عند أعلى الصفحة - أظهر Navbar دائماً
        if (currentScrollY <= 20) {
          setIsNavbarVisible(true);
          ticking.current = false;
          return;
        }

        // حساب فرق السكرول
        const scrollDifference = currentScrollY - lastScrollY.current;

        // تجاهل الحركات الصغيرة جداً (تمنع الاهتزاز)
        if (Math.abs(scrollDifference) < 8) {
          ticking.current = false;
          return;
        }

        const isScrollingDown = scrollDifference > 0;

        // زيادة العتبة لمنع التبديل السريع
        const scrollThreshold = 15;

        if (Math.abs(scrollDifference) > scrollThreshold) {
          if (isScrollingDown && isNavbarVisible) {
            // سكرول لأسفل - أخفي Navbar
            setIsNavbarVisible(false);
          } else if (!isScrollingDown && !isNavbarVisible) {
            // سكرول لأعلى - أظهر Navbar
            setIsNavbarVisible(true);
          }
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    }
  };

  useEffect(() => {
    // إضافة debounce بسيط لمنع الأحداث المتكررة جداً
    const debouncedHandleScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        handleScroll();
      }, 16); // ≈ 60fps
    };

    window.addEventListener("scroll", debouncedHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavbarVisible]);

  return (
    <div className="relative">
      {/* Navbar - مع تحسينات للأنيميشن */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-transform duration-300 ease-out ${
          isNavbarVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        <div className="w-full">
          <Navbar />
        </div>
      </div>

      {/* LinksBar - محسن للالتصاق */}
      <div
        className={`fixed left-0 right-0 z-40 w-full transition-all duration-300 ease-out ${
          isNavbarVisible
            ? "top-[64px]" // بعد Navbar
            : "top-0" // في الأعلى عندما يختفي Navbar
        }`}
        style={{
          willChange: "top",
          backfaceVisibility: "hidden",
        }}
      >
        <div className="w-full">
          <LinksBar />
        </div>
      </div>

      {/* مساحة احتياطية - ثابتة بدون ترانزشن */}
      <div className={`w-full ${isNavbarVisible ? "h-28" : "h-14"}`} />

      {/* زر العودة لأعلى - يظهر بعد تأخير */}
      {!isNavbarVisible && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-4 bottom-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-40 transition-opacity duration-300"
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
    </div>
  );
};

export default Header;
