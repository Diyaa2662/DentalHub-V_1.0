// src/components/layout/Layout.jsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow pt-[52px] lg:pt-[57px]">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
