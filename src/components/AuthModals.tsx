import React, { useState } from "react";
import { X, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase"; // Import your supabase client

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
  const [errorMessage, setErrorMessage] = useState("");

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

  // REAL SUPABASE LOGIN HANDLER
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      onClose();

      // Role-based routing based on email identifier or database user metadata
      if (loginEmail.includes("admin")) {
        navigate("/admin/dashboard");
      } else if (loginEmail.includes("staff")) {
        navigate("/staff/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to login. Please check credentials.",
      );
    }
  };

  // REAL SUPABASE REGISTRATION HANDLER
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (regData.password !== regData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: regData.email,
        password: regData.password,
        options: {
          data: {
            full_name: regData.fullName,
            phone: regData.phone,
            address: regData.address,
            barangay: regData.barangay,
            landmark: regData.landmark,
          },
        },
      });

      if (error) throw error;

      alert("Registration successful! You can now log in.");
      onSwitchToLogin();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to register account.");
    }
  };

  if (!loginOpen && !registerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Login Modal */}
      {loginOpen && (
        <div className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-md relative border border-slate-100">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-2xl font-black text-slate-900 mb-1">Login</h2>
          <p className="text-xs text-slate-400 mb-6 font-medium">
            Access your station dashboard or client profile
          </p>

          {errorMessage && (
            <div className="mb-4 bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-100">
              {errorMessage}
            </div>
          )}

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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800"
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm font-medium text-slate-800"
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
        </div>
      )}

      {/* Register Modal */}
      {registerOpen && (
        <div className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-lg relative border border-slate-100 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-2xl font-black text-slate-900 mb-1">
            Create Account
          </h2>
          <p className="text-xs text-slate-400 mb-6 font-medium">
            Join us for fresh water delivery
          </p>

          {errorMessage && (
            <div className="mb-4 bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-100">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={regData.fullName}
                onChange={(e) =>
                  setRegData({ ...regData, fullName: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={regData.email}
                onChange={(e) =>
                  setRegData({ ...regData, email: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={regData.phone}
                onChange={(e) =>
                  setRegData({ ...regData, phone: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivery Address
              </label>
              <input
                type="text"
                required
                value={regData.address}
                onChange={(e) =>
                  setRegData({ ...regData, address: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Barangay
                </label>
                <input
                  type="text"
                  required
                  value={regData.barangay}
                  onChange={(e) =>
                    setRegData({ ...regData, barangay: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={regData.landmark}
                  onChange={(e) =>
                    setRegData({ ...regData, landmark: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={regData.password}
                onChange={(e) =>
                  setRegData({ ...regData, password: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={regData.confirmPassword}
                onChange={(e) =>
                  setRegData({ ...regData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none"
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
