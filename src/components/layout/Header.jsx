// src/components/layout/Header.jsx
import React from "react";
import Navbar from "./Navbar";
import LinksBar from "./LinksBar";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 shadow-md">
      <Navbar />
      <LinksBar />
    </header>
  );
};

export default Header;
