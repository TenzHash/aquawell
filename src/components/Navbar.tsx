import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Droplet } from "lucide-react";

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export default function Navbar({ onOpenLogin, onOpenRegister }: NavbarProps) {
  const location = useLocation();
  const path = location.pathname;
  const [activeSection, setActiveSection] = useState("home");

  // Track scroll position to update active nav link on the landing page
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

  return (
    <nav className="sticky top-0 z-50 w-full bg-blue-700/85 backdrop-blur-md border-b border-blue-400/20 shadow-lg shadow-blue-900/30 transition-all">
      <div className="px-8 lg:px-16 py-4 flex justify-between items-center max-w-[1600px] mx-auto w-full">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={handleHomeClick}
          className="flex items-center space-x-3 text-xl font-black tracking-tight text-white group"
        >
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-sm transition group-hover:bg-white/20">
            <Droplet className="h-6 w-6 text-cyan-300 fill-cyan-300" />
          </div>
          <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
            AquaWell
          </span>
        </Link>

        {/* Nav Links with Dynamic Active States */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-blue-100">
          <Link
            to="/"
            onClick={handleHomeClick}
            className={`transition py-1 border-b-2 ${path === "/" && activeSection === "home" ? "text-white border-cyan-300 font-bold" : "border-transparent hover:text-white"}`}
          >
            Home
          </Link>
          <a
            href="/#services"
            onClick={() => setActiveSection("services")}
            className={`transition py-1 border-b-2 ${activeSection === "services" && path === "/" ? "text-white border-cyan-300 font-bold" : "border-transparent hover:text-white"}`}
          >
            Services
          </a>
          <a
            href="/#about"
            onClick={() => setActiveSection("about")}
            className={`transition py-1 border-b-2 ${activeSection === "about" && path === "/" ? "text-white border-cyan-300 font-bold" : "border-transparent hover:text-white"}`}
          >
            About
          </a>
          <a
            href="/#contact"
            onClick={() => setActiveSection("contact")}
            className={`transition py-1 border-b-2 ${activeSection === "contact" && path === "/" ? "text-white border-cyan-300 font-bold" : "border-transparent hover:text-white"}`}
          >
            Contact
          </a>
        </div>

        {/* Modal Trigger Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenLogin}
            className="px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md transition shadow-md bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={onOpenRegister}
            className="px-5 py-2.5 rounded-xl font-black text-sm transition shadow-xl bg-white text-blue-700 hover:bg-blue-50 cursor-pointer"
          >
            Register
          </button>
        </div>
      </div>
    </nav>
  );
}
