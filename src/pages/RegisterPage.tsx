import React, { useState } from "react";
import {
  Droplet,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Building,
  Compass,
  Globe,
  Share2,
  MessageCircle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    barangay: "",
    landmark: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Account created successfully!");
    navigate("/customer/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar matching the Landing Page and Login Page */}
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
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md border border-white/20 transition shadow-md"
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

      {/* Main Registration Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16 max-w-4xl mx-auto w-full">
        {/* Page Title Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Join us for fresh water delivery
          </p>
        </div>

        {/* Registration Card Form */}
        <div className="bg-white p-8 lg:p-10 rounded-[32px] shadow-2xl shadow-slate-300/70 w-full border border-slate-200/80 mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Register</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800 transition"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                placeholder="admin@aquawell.com"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800 transition"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-600" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                placeholder="+1234567890"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800 transition"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                <span>Address</span>
              </label>
              <input
                type="text"
                placeholder="Your delivery address"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800 transition"
              />
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Building className="h-3.5 w-3.5 text-blue-600" />
                <span>Barangay</span>
              </label>
              <input
                type="text"
                placeholder="Your barangay"
                required
                value={formData.barangay}
                onChange={(e) =>
                  setFormData({ ...formData, barangay: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800 transition"
              />
            </div>

            {/* Landmark (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Compass className="h-3.5 w-3.5 text-blue-600" />
                <span>Landmark (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Nearby landmark for easy delivery"
                value={formData.landmark}
                onChange={(e) =>
                  setFormData({ ...formData, landmark: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800 transition"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-black shadow-lg shadow-blue-600/25 transition text-sm tracking-wide mt-2"
            >
              Create Account
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-xs text-slate-500 font-medium">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Login here
            </Link>
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
