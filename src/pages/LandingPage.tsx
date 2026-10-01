import { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Globe,
  Share2,
  MessageCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import AuthModals from "../components/AuthModals";
import { useTheme } from "../context/ThemeContext";

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-cyan-400 selection:text-slate-950 ${
        isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"
      }`}
    >
      {/* Sticky Navbar with Modal Triggers */}
      <Navbar
        onOpenLogin={() => {
          setLoginOpen(true);
          setRegisterOpen(false);
        }}
        onOpenRegister={() => {
          setRegisterOpen(true);
          setLoginOpen(false);
        }}
      />

      {/* Hero Section */}
      <div
        className="relative w-full flex-1 flex flex-col justify-center bg-cover bg-center bg-fixed py-24 lg:py-36 px-8 lg:px-16"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-700/85 to-cyan-900/80 backdrop-blur-[2px]"></div>

        <div className="relative z-10 max-w-[1200px] mx-auto w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-cyan-200 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest mb-6 border border-white/15 shadow-inner">
              <Zap className="h-3.5 w-3.5 text-cyan-300 fill-cyan-300" />
              <span>Digital Water Station Management</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-[1.08] mb-6 tracking-tight text-white drop-shadow-md">
              Pure Water, <br />
              <span className="bg-gradient-to-r from-cyan-300 via-white to-blue-200 bg-clip-text text-transparent">
                Delivered Fresh.
              </span>
            </h1>

            <p className="text-blue-100 text-base lg:text-lg mb-10 font-normal max-w-2xl leading-relaxed drop-shadow-sm">
              Premium purified and alkaline water for your home and office.
              Experience real-time order processing, automated stock tracking,
              and fast dispatch.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setRegisterOpen(true)}
                className="bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 px-8 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-cyan-500/40 transition transform hover:-translate-y-0.5 flex items-center space-x-2 group cursor-pointer"
              >
                <span>Order Now</span>
                <ArrowRight className="h-4 w-4 stroke-[3] transition group-hover:translate-x-1" />
              </button>

              <div className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs font-bold text-blue-100 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                <span>ISO/IEC 25010 Assured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section
        id="services"
        className={`w-full py-24 px-8 lg:px-16 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] relative z-20 transition-colors duration-300 ${
          isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
        }`}
      >
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span
              className={`font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full border ${
                isDark
                  ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                  : "text-blue-600 bg-blue-50 border-blue-100"
              }`}
            >
              Our Offerings
            </span>
            <h2
              className={`text-3xl lg:text-4xl font-black mt-3 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Designed for Quality & Reliability
            </h2>
            <p
              className={`text-sm mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              Everything you need for clean drinking water and seamless business
              management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className={`p-8 rounded-3xl border shadow-sm hover:shadow-md transition space-y-4 ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-6 ${
                  isDark
                    ? "bg-blue-900/40 text-cyan-300"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                💧
              </div>
              <h3
                className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Pure Refill & Delivery
              </h3>
              <p
                className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                Choose between 5-Gallon Slim or Round refills with options for
                direct home/office delivery or station pickup.
              </p>
            </div>

            <div
              className={`p-8 rounded-3xl border shadow-sm hover:shadow-md transition space-y-4 ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-6 ${
                  isDark
                    ? "bg-cyan-950/50 text-cyan-300"
                    : "bg-cyan-50 text-cyan-600"
                }`}
              >
                🚚
              </div>
              <h3
                className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Live Logistics Tracking
              </h3>
              <p
                className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                State-based tracking allowing customers and admins to monitor
                delivery stages in real-time (Pending, In Transit, Delivered).
              </p>
            </div>

            <div
              className={`p-8 rounded-3xl border shadow-sm hover:shadow-md transition space-y-4 ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-6 ${
                  isDark
                    ? "bg-indigo-950/50 text-indigo-300"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                📊
              </div>
              <h3
                className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Smart Inventory Forecast
              </h3>
              <p
                className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                Automated low-stock safety alerts (&lt;20%) and 3-period
                Weighted Moving Average demand analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className={`w-full py-24 px-8 lg:px-16 border-t transition-colors duration-300 ${
          isDark
            ? "bg-slate-950 text-white border-slate-800"
            : "bg-white text-slate-900 border-slate-200"
        }`}
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span
              className={`font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full border ${
                isDark
                  ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                  : "text-blue-600 bg-blue-50 border-blue-100"
              }`}
            >
              About AquaWell
            </span>
            <h2
              className={`text-3xl lg:text-4xl font-black mt-3 mb-6 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Serving the Community with Safe Drinking Water
            </h2>
            <p
              className={`text-sm leading-relaxed mb-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}
            >
              Located in Albay, AquaWell Water Refilling Station is committed to
              providing clean, purified, and affordable drinking water to local
              households and commercial spaces.
            </p>
            <ul
              className={`space-y-3 text-sm font-medium mb-8 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              <li className="flex items-center space-x-3">
                <CheckCircle2
                  className={`h-5 w-5 shrink-0 ${isDark ? "text-cyan-400" : "text-blue-600"}`}
                />
                <span>Strict quality control and multi-stage filtration</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2
                  className={`h-5 w-5 shrink-0 ${isDark ? "text-cyan-400" : "text-blue-600"}`}
                />
                <span>Digitalized operations to prevent misplaced orders</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2
                  className={`h-5 w-5 shrink-0 ${isDark ? "text-cyan-400" : "text-blue-600"}`}
                />
                <span>Reliable scheduling and dedicated driver logistics</span>
              </li>
            </ul>
          </div>
          <div
            className={`p-8 lg:p-10 rounded-[36px] border shadow-sm relative overflow-hidden ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-blue-50 border-blue-100 text-slate-900"
            }`}
          >
            <h3
              className={`text-2xl font-black mb-4 ${isDark ? "text-cyan-300" : "text-blue-900"}`}
            >
              Our Mission
            </h3>
            <p
              className={`text-sm leading-relaxed mb-6 relative z-10 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              To eliminate administrative friction and logistical delays in
              community water refilling through an intuitive web-based platform
              that guarantees reliable fulfillment and customer satisfaction.
            </p>
            <div
              className={`pt-4 border-t flex justify-between text-xs font-bold ${
                isDark
                  ? "border-slate-800 text-cyan-200"
                  : "border-blue-200/60 text-blue-900"
              }`}
            >
              <span>📍 Albay, Philippines</span>
              <span>⚡ Fully Digitalized Operations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className={`w-full py-24 px-8 lg:px-16 transition-colors duration-300 ${
          isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
        }`}
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <span
              className={`font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full border ${
                isDark
                  ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                  : "text-blue-600 bg-blue-50 border-blue-100"
              }`}
            >
              Get in Touch
            </span>
            <h2
              className={`text-3xl lg:text-4xl font-black mt-3 mb-6 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Contact AquaWell Station
            </h2>
            <p
              className={`text-sm leading-relaxed mb-8 ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              Have questions regarding bulk deliveries, subscription refills, or
              station partnerships? Reach out to our team below.
            </p>

            <div className="space-y-6 text-sm">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-2xl border ${isDark ? "bg-slate-800 text-cyan-400 border-slate-700" : "bg-white text-blue-600 border-slate-200 shadow-sm"}`}
                >
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <strong
                    className={`block font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    Station Location
                  </strong>
                  <span
                    className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Legazpi City / Albay Region, Philippines
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-2xl border ${isDark ? "bg-slate-800 text-cyan-400 border-slate-700" : "bg-white text-blue-600 border-slate-200 shadow-sm"}`}
                >
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <strong
                    className={`block font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    Hotline Number
                  </strong>
                  <span
                    className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    0998-765-4321 / (052) 123-4567
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-2xl border ${isDark ? "bg-slate-800 text-cyan-400 border-slate-700" : "bg-white text-blue-600 border-slate-200 shadow-sm"}`}
                >
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <strong
                    className={`block font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    Support Email
                  </strong>
                  <span
                    className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    info@aquawell.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`p-8 lg:p-10 rounded-[36px] border shadow-2xl backdrop-blur-xl ${
              isDark
                ? "bg-slate-800/80 border-slate-700 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Send us a Message
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Message sent successfully!");
              }}
              className="space-y-4"
            >
              <div>
                <label
                  className={`block text-xs font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  className={`w-full px-4 py-3 border rounded-2xl text-sm outline-none ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  required
                  className={`w-full px-4 py-3 border rounded-2xl text-sm outline-none ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="How can we help you today?"
                  required
                  className={`w-full px-4 py-3 border rounded-2xl text-sm outline-none resize-none ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                  }`}
                ></textarea>
              </div>
              <button
                type="submit"
                className={`w-full font-black py-3.5 rounded-2xl transition shadow-lg text-sm cursor-pointer ${
                  isDark
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/20"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                }`}
              >
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-blue-600 dark:bg-blue-950 text-white pt-16 pb-8 px-8 lg:px-16 border-t border-blue-500/40 dark:border-blue-900 transition-colors">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              AquaWell
            </h4>
            <p className="text-blue-100 text-xs leading-relaxed max-w-xs">
              Your trusted water refilling station providing premium purified
              and alkaline water for your health and wellness.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-medium text-blue-100">
              <li>
                <a href="#" className="hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition">
                  Products
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-xs text-blue-100">
              <li>
                Upper Ground Floor Unit B Fullerton Suites 1, Silang,
                Philippines, 4118
              </li>
              <li>0998-765-4321</li>
              <li>info@aquawell.com</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              Business Hours
            </h4>
            <div className="space-y-1.5 text-xs text-blue-100">
              <p>Monday - Friday: 7:00 AM - 7:00 PM</p>
              <p>Saturday: 8:00 AM - 6:00 PM</p>
              <p>Sunday: 9:00 AM - 5:00 PM</p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Globe className="h-4 w-4 text-white" />
              <Share2 className="h-4 w-4 text-white" />
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto pt-8 border-t border-blue-500/50 dark:border-blue-900 text-center text-xs text-blue-100 font-medium">
          <p>© 2026 AquaWell Water Refilling Station. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modals */}
      <AuthModals
        loginOpen={loginOpen}
        registerOpen={registerOpen}
        onClose={() => {
          setLoginOpen(false);
          setRegisterOpen(false);
        }}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
    </div>
  );
}
