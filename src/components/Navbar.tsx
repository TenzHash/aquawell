import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Droplet, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export default function Navbar({ onOpenLogin, onOpenRegister }: NavbarProps) {
  const location = useLocation();
  const path = location.pathname;
  const [activeSection, setActiveSection] = useState("home");
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  useEffect(() => {
    if (path !== "/") return;

    const handleScroll = () => {
      const servicesSection = document.getElementById("services");
      const aboutSection = document.getElementById("about");
      const contactSection = document.getElementById("contact");
      const scrollPosition = window.scrollY + 200;

      if (contactSection && scrollPosition >= contactSection.offsetTop) {
        setActiveSection("contact");
      } else if (aboutSection && scrollPosition >= aboutSection.offsetTop) {
        setActiveSection("about");
      } else if (
        servicesSection &&
        scrollPosition >= servicesSection.offsetTop
      ) {
        setActiveSection("services");
      } else {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [path]);

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (path === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("home");
    }
  };

  const handleThemeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full backdrop-blur-md border-b shadow-lg transition-all ${
        isDark
          ? "bg-brandBlue text-white border-blue-900 shadow-blue-950/50"
          : "bg-blue-600 text-white border-blue-400/20 shadow-blue-900/30"
      }`}
    >
      <div className="px-8 lg:px-16 py-4 flex justify-between items-center max-w-[1600px] mx-auto w-full">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={handleHomeClick}
          className="flex items-center space-x-3 text-xl font-black tracking-tight group"
        >
          <div
            className={`backdrop-blur-md p-2.5 rounded-2xl border shadow-sm transition ${
              isDark
                ? "bg-blue-900/60 border-blue-800 group-hover:bg-blue-900"
                : "bg-white/15 border-white/25 group-hover:bg-white/25"
            }`}
          >
            <Droplet className="h-6 w-6 text-cyan-300 fill-cyan-300" />
          </div>
          <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
            AquaWell
          </span>
        </Link>

        {/* Nav Links */}
        <div
          className={`hidden md:flex items-center space-x-8 text-sm font-semibold ${isDark ? "text-blue-100" : "text-blue-100"}`}
        >
          <Link
            to="/"
            onClick={handleHomeClick}
            className={`transition py-1 border-b-2 ${
              path === "/" && activeSection === "home"
                ? "text-white border-cyan-300 font-bold"
                : "border-transparent hover:text-white"
            }`}
          >
            Home
          </Link>
          <a
            href="/#services"
            onClick={() => setActiveSection("services")}
            className={`transition py-1 border-b-2 ${
              activeSection === "services" && path === "/"
                ? "text-white border-cyan-300 font-bold"
                : "border-transparent hover:text-white"
            }`}
          >
            Services
          </a>
          <a
            href="/#about"
            onClick={() => setActiveSection("about")}
            className={`transition py-1 border-b-2 ${
              activeSection === "about" && path === "/"
                ? "text-white border-cyan-300 font-bold"
                : "border-transparent hover:text-white"
            }`}
          >
            About
          </a>
          <a
            href="/#contact"
            onClick={() => setActiveSection("contact")}
            className={`transition py-1 border-b-2 ${
              activeSection === "contact" && path === "/"
                ? "text-white border-cyan-300 font-bold"
                : "border-transparent hover:text-white"
            }`}
          >
            Contact
          </a>
        </div>

        {/* Actions & Theme Toggle Button */}
        <div className="flex items-center space-x-3 relative z-50">
          <button
            type="button"
            onClick={handleThemeClick}
            className={`p-2.5 rounded-xl backdrop-blur-md transition cursor-pointer pointer-events-auto shadow-md border ${
              isDark
                ? "bg-blue-900/60 hover:bg-blue-900 text-white border-blue-800"
                : "bg-white/15 hover:bg-white/25 text-white border-white/25"
            }`}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-cyan-300" />
            ) : (
              <Moon className="h-4 w-4 text-cyan-200" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenLogin}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md transition shadow-md border cursor-pointer pointer-events-auto ${
              isDark
                ? "bg-blue-900/60 hover:bg-blue-900 text-white border-blue-800"
                : "bg-white/15 hover:bg-white/25 text-white border-white/25"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={onOpenRegister}
            className={`px-5 py-2.5 rounded-xl font-black text-sm transition shadow-xl cursor-pointer pointer-events-auto ${
              isDark
                ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-950 hover:from-cyan-300 hover:to-blue-300"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            Register
          </button>
        </div>
      </div>
    </nav>
  );
}
