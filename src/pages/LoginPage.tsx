import React, { useState } from "react";
import {
  Droplet,
  Lock,
  Mail,
  Shield,
  Phone,
  MapPin,
  Globe,
  Share2,
  MessageCircle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("admin")) {
      navigate("/admin/dashboard");
    } else {
      navigate("/customer/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar matching the Landing Page */}
      <nav className="sticky top-0 z-50 w-full bg-blue-700/85 backdrop-blur-md border-b border-blue-400/20 shadow-lg shadow-blue-900/30 transition-all">
        <div className="px-8 lg:px-16 py-4 flex justify-between items-center max-w-[1600px] mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center space-x-3 text-xl font-black tracking-tight text-white">
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-sm">
              <Droplet className="h-6 w-6 text-cyan-300 fill-cyan-300" />
            </div>
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
              AquaWell
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-blue-100">
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>
            <a href="/#services" className="hover:text-white transition">
              Services
            </a>
            <a href="/#about" className="hover:text-white transition">
              About
            </a>
            <a href="/#contact" className="hover:text-white transition">
              Contact
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md border border-white/30 transition shadow-md"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-black text-sm transition shadow-xl shadow-blue-900/30"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Card Body Container */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 w-full">
        <div className="bg-white p-8 lg:p-10 rounded-[32px] shadow-2xl shadow-slate-300/70 w-full max-w-lg border border-slate-100 relative overflow-hidden my-12">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -z-0 pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-2xl font-black text-slate-900 mb-1">Login</h2>
            <p className="text-xs text-slate-400 mb-6 font-medium">
              Access your station dashboard or client profile
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm transition font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
                  <Lock className="h-3.5 w-3.5 text-blue-600" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm transition font-medium text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-black shadow-lg shadow-blue-600/25 transition text-sm tracking-wide"
              >
                Login
              </button>
            </form>

            <div className="text-center mt-5">
              <span className="text-xs text-slate-500 font-medium">
                Don't have an account?{" "}
              </span>
              <Link
                to="/register"
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Register here
              </Link>
            </div>

            {/* Demo Credentials Box */}
            <div className="mt-6 text-xs text-slate-600 bg-blue-50/70 p-4 rounded-2xl border border-blue-100/80 leading-relaxed">
              <p className="font-extrabold text-blue-900 mb-1 flex items-center space-x-1.5">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Demo Credentials:</span>
              </p>
              <div className="grid grid-cols-1 gap-1 text-[11px] mt-1 text-slate-700">
                <p>
                  Customer:{" "}
                  <code className="text-blue-700 font-bold">
                    customer@example.com
                  </code>{" "}
                  /{" "}
                  <code className="text-slate-900 font-bold">customer123</code>
                </p>
                <p>
                  Admin:{" "}
                  <code className="text-blue-700 font-bold">
                    admin@aquatack.com
                  </code>{" "}
                  / <code className="text-slate-900 font-bold">admin123</code>
                </p>
              </div>
            </div>

            <div className="mt-5 text-center">
              <a
                href="#"
                className="text-xs text-blue-600 font-bold hover:text-blue-800 transition"
              >
                Are you a delivery rider? Login here
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Vibrant Royal-Blue Footer */}
      <footer className="w-full bg-blue-600 text-white pt-16 pb-8 px-8 lg:px-16 border-t border-blue-500/40">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 text-xl font-bold tracking-tight">
              <Droplet className="h-6 w-6 text-white fill-white" />
              <span>AquaWell</span>
            </div>
            <p className="text-blue-100 text-xs leading-relaxed max-w-xs">
              Your trusted water refilling station providing premium purified
              and alkaline water for your health and wellness.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-medium text-blue-100">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <a href="/#services" className="hover:text-white transition">
                  Products
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#contact" className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-xs text-blue-100">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-blue-200" />
                <span>
                  Upper Ground Floor Unit B Fullerton Suites 1, Silang,
                  Philippines, 4118
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 shrink-0 text-blue-200" />
                <span>0998-765-4321</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 shrink-0 text-blue-200" />
                <span>info@aquawell.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Business Hours & Safe Alternative Icons */}
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
              <a
                href="#"
                className="bg-blue-700/80 hover:bg-blue-700 p-2.5 rounded-xl transition border border-blue-400/30 text-white"
                aria-label="Website"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="bg-blue-700/80 hover:bg-blue-700 p-2.5 rounded-xl transition border border-blue-400/30 text-white"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="bg-blue-700/80 hover:bg-blue-700 p-2.5 rounded-xl transition border border-blue-400/30 text-white"
                aria-label="Support"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Line & Copyright */}
        <div className="max-w-[1600px] mx-auto pt-8 border-t border-blue-500/50 text-center text-xs text-blue-100 font-medium">
          <p>© 2026 AquaWell Water Refilling Station. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
