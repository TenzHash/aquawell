import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Building,
  Compass,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthModalsProps {
  loginOpen: boolean;
  registerOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
}

export default function AuthModals({
  loginOpen,
  registerOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToLogin,
}: AuthModalsProps) {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regData, setRegData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    barangay: "",
    landmark: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.includes("admin")) {
      navigate("/admin/dashboard");
    } else {
      navigate("/customer/dashboard");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Account created successfully!");
    navigate("/customer/dashboard");
  };

  if (!loginOpen && !registerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Login Modal */}
      {loginOpen && (
        <div className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-md relative border border-slate-100">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-2xl font-black text-slate-900 mb-1">Login</h2>
          <p className="text-xs text-slate-400 mb-6 font-medium">
            Access your station dashboard or client profile
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-black shadow-lg shadow-blue-600/25 transition text-sm cursor-pointer"
            >
              Login
            </button>
          </form>

          <div className="text-center mt-5">
            <span className="text-xs text-slate-500 font-medium">
              Don't have an account?{" "}
            </span>
            <button
              onClick={onSwitchToRegister}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Register here
            </button>
          </div>

          <div className="mt-6 text-xs text-slate-600 bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100">
            <p className="font-extrabold text-blue-900 mb-1 flex items-center space-x-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span>Demo Credentials:</span>
            </p>
            <p>
              Customer:{" "}
              <code className="text-blue-700 font-bold">
                customer@example.com
              </code>{" "}
              / <code className="text-slate-900 font-bold">customer123</code>
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
      )}

      {/* Register Modal with Fixed Visible Text Styling */}
      {registerOpen && (
        <div className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-lg relative border border-slate-100 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-2xl font-black text-slate-900 mb-1">
            Create Account
          </h2>
          <p className="text-xs text-slate-400 mb-6 font-medium">
            Join us for fresh water delivery
          </p>

          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                required
                value={regData.fullName}
                onChange={(e) =>
                  setRegData({ ...regData, fullName: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={regData.email}
                onChange={(e) =>
                  setRegData({ ...regData, email: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-600" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                placeholder="+1234567890"
                required
                value={regData.phone}
                onChange={(e) =>
                  setRegData({ ...regData, phone: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                <span>Address</span>
              </label>
              <input
                type="text"
                placeholder="Your delivery address"
                required
                value={regData.address}
                onChange={(e) =>
                  setRegData({ ...regData, address: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <Building className="h-3.5 w-3.5 text-blue-600" />
                  <span>Barangay</span>
                </label>
                <input
                  type="text"
                  placeholder="Barangay"
                  required
                  value={regData.barangay}
                  onChange={(e) =>
                    setRegData({ ...regData, barangay: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <Compass className="h-3.5 w-3.5 text-blue-600" />
                  <span>Landmark</span>
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={regData.landmark}
                  onChange={(e) =>
                    setRegData({ ...regData, landmark: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={regData.password}
                onChange={(e) =>
                  setRegData({ ...regData, password: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={regData.confirmPassword}
                onChange={(e) =>
                  setRegData({ ...regData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black shadow-lg transition text-sm mt-3 cursor-pointer"
            >
              Create Account
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-xs text-slate-500 font-medium">
              Already have an account?{" "}
            </span>
            <button
              onClick={onSwitchToLogin}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Login here
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
