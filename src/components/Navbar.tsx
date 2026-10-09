import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Droplet, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export default function Navbar({ onOpenLogin, onOpenRegister }: NavbarProps) {
  const location = useLocation();
  const path = location.pathname;
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
  };

  const handleThemeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full backdrop-blur-md border-b shadow-lg transition-all ${
        isDark
          ? "bg-slate-950/90 text-white border-blue-900 shadow-blue-950/50"
          : "bg-blue-600/95 text-white border-blue-400/20 shadow-blue-900/30"
      }`}
    >
      <div className="px-4 sm:px-8 lg:px-16 py-3.5 flex justify-between items-center max-w-[1600px] mx-auto w-full">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={handleHomeClick}
          className="flex items-center space-x-2.5 text-lg sm:text-xl font-black tracking-tight group shrink-0"
        >
          <div
            className={`backdrop-blur-md p-2 rounded-xl border shadow-sm transition ${
              isDark
                ? "bg-blue-900/60 border-blue-800 group-hover:bg-blue-900"
                : "bg-white/15 border-white/25 group-hover:bg-white/25"
            }`}
          >
            <Droplet className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300 fill-cyan-300" />
          </div>
          <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
            AquaWell
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-blue-100">
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
            onClick={() => {
              setActiveSection("services");
              setMobileMenuOpen(false);
            }}
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
            onClick={() => {
              setActiveSection("about");
              setMobileMenuOpen(false);
            }}
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
            onClick={() => {
              setActiveSection("contact");
              setMobileMenuOpen(false);
            }}
            className={`transition py-1 border-b-2 ${
              activeSection === "contact" && path === "/"
                ? "text-white border-cyan-300 font-bold"
                : "border-transparent hover:text-white"
            }`}
          >
            Contact
          </a>
        </div>

        {/* Actions & Theme Toggle / Mobile Menu Trigger */}
        <div className="flex items-center space-x-2 sm:space-x-3 relative z-50">
          <button
            type="button"
            onClick={handleThemeClick}
            className={`p-2 sm:p-2.5 rounded-xl backdrop-blur-md transition cursor-pointer shadow-md border ${
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

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              type="button"
              onClick={onOpenLogin}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm backdrop-blur-md transition shadow-md border cursor-pointer ${
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
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition shadow-xl cursor-pointer ${
                isDark
                  ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-950 hover:from-cyan-300 hover:to-blue-300"
                  : "bg-white text-blue-600 hover:bg-blue-50"
              }`}
            >
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? "bg-blue-900/60 text-white border-blue-800"
                : "bg-white/15 text-white border-white/25"
            }`}
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden absolute top-full left-0 w-full border-b shadow-2xl p-6 space-y-4 animate-fadeIn ${
            isDark
              ? "bg-slate-950 border-blue-900 text-white"
              : "bg-blue-700 border-blue-500 text-white"
          }`}
        >
          <div className="flex flex-col space-y-3 font-bold text-base">
            <Link
              to="/"
              onClick={handleHomeClick}
              className="py-2 px-3 rounded-xl hover:bg-white/10 transition"
            >
              Home
            </Link>
            <a
              href="/#services"
              onClick={() => {
                setActiveSection("services");
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-xl hover:bg-white/10 transition"
            >
              Services
            </a>
            <a
              href="/#about"
              onClick={() => {
                setActiveSection("about");
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-xl hover:bg-white/10 transition"
            >
              About
            </a>
            <a
              href="/#contact"
              onClick={() => {
                setActiveSection("contact");
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-xl hover:bg-white/10 transition"
            >
              Contact
            </a>
          </div>

          <div className="pt-4 border-t border-white/15 flex flex-col space-y-3 sm:hidden">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full py-3 rounded-xl font-bold text-sm bg-white/15 border border-white/25 text-center cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegister();
              }}
              className="w-full py-3 rounded-xl font-black text-sm bg-white text-blue-600 text-center cursor-pointer shadow-lg"
            >
              Register
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
