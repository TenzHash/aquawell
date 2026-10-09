import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { friendlyErrorMessage } from "../lib/userMessages";

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
  const [busy, setBusy] = useState(false);
  const [forgotBusy, setForgotBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [regData, setRegData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    email: "",
    phone: "",
    address: "",
    barangay: "",
    landmark: "",
    password: "",
    confirmPassword: "",
  });

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    const email = loginEmail.trim().toLowerCase();
    if (!email || !loginPassword) {
      setErrorMessage("Please enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: loginPassword });
      if (error) {
        const message = String(error.message || "").toLowerCase();
        if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
          throw new Error("Login failed. The email or password is incorrect, or the account does not exist.");
        }
        if (message.includes("email not confirmed")) {
          throw new Error("This account has not been confirmed yet. Please contact the administrator if this is an admin-created account.");
        }
        throw new Error("Unable to sign in right now. Please check your account details and try again.");
      }
      if (!data.user) throw new Error("Login succeeded, but the account could not be loaded.");

      const { data: resolved, error: resolveError } = await supabase.functions.invoke("resolve-user-account");
      if (resolveError || !resolved?.success) {
        await supabase.auth.signOut();
        throw new Error(resolved?.error || "Your login exists, but your AquaWell account record is incomplete. Please contact the administrator.");
      }

      const role = String(resolved.role || "customer").toLowerCase();
      onClose();
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "staff" || role === "delivery") navigate("/staff/dashboard");
      else navigate("/customer/dashboard");
    } catch (err: any) {
      setErrorMessage(friendlyErrorMessage(err, "We could not sign you in. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    resetMessages();
    const email = loginEmail.trim().toLowerCase();
    if (!email) {
      setErrorMessage("Enter your email address first so we can send the reset instructions.");
      return;
    }
    setForgotBusy(true);
    try {
      setErrorMessage("Password reset by email is not used in AquaWell. Please contact the administrator to generate a temporary password for your account.");
    } finally {
      setForgotBusy(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (regData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (
      !regData.firstName.trim() ||
      !regData.middleName.trim() ||
      !regData.lastName.trim() ||
      !regData.email.trim() ||
      !regData.phone.trim() ||
      !regData.address.trim() ||
      !regData.barangay.trim()
    ) {
      setErrorMessage("First name, middle name, last name, email, contact number, address, and barangay are required.");
      return;
    }

    const fullName = [
      regData.firstName.trim(),
      regData.middleName.trim(),
      regData.lastName.trim(),
      regData.suffix.trim(),
    ].filter(Boolean).join(" ");

    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("register-customer-user", {
        body: {
          email: regData.email.trim().toLowerCase(),
          password: regData.password,
          first_name: regData.firstName.trim(),
          middle_name: regData.middleName.trim(),
          last_name: regData.lastName.trim(),
          suffix: regData.suffix.trim() || null,
          phone: regData.phone.trim(),
          address: regData.address.trim(),
          barangay: regData.barangay.trim(),
          landmark: regData.landmark.trim() || null,
        },
      });
      if (error || !data?.success) {
        const message = String(data?.error || error?.message || "").toLowerCase();
        if (data?.code === "EMAIL_EXISTS" || message.includes("already registered") || message.includes("already associated") || message.includes("already being used")) {
          throw new Error("This email is already registered. Please log in instead or use a different email.");
        }
        throw new Error(data?.error || error?.message || "Unable to create the account right now. Please check the information and try again.");
      }

      setSuccessMessage("Registration successful. Your account is ready. You can now log in.");
      setTimeout(() => {
        resetMessages();
        onSwitchToLogin();
      }, 1600);
    } catch (err: any) {
      setErrorMessage(friendlyErrorMessage(err, "We could not create your account. Please check your details and try again."));
    } finally {
      setBusy(false);
    }
  };

  if (!loginOpen && !registerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div
        className={`bg-white p-6 sm:p-8 rounded-[32px] shadow-2xl w-full relative border border-slate-100 max-h-[92vh] overflow-y-auto ${registerOpen ? "max-w-lg" : "max-w-md"}`}
      >
        <button
          onClick={onClose}
          disabled={busy}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-black text-slate-900 mb-1">
          {loginOpen ? "Welcome back" : "Create your AquaWell account"}
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-medium">
          {loginOpen
            ? "Sign in to manage orders, deliveries, and your profile."
            : "Register as a customer to order refills and track your deliveries."}
        </p>

        {errorMessage && (
          <div className="mb-4 bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-bold border border-rose-100 flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold border border-emerald-100 flex gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        )}

        {loginOpen ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Email Address
              <span className="relative block mt-1.5">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-blue-600" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800"
                />
              </span>
            </label>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Password
              <span className="relative block mt-1.5">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-blue-600" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800"
                />
              </span>
            </label>
            <div className="flex justify-end -mt-1">
              <button type="button" onClick={handleForgotPassword} disabled={busy || forgotBusy} className="text-xs font-bold text-blue-600 hover:underline disabled:opacity-50">
                {forgotBusy ? "Requesting reset…" : "Forgot password?"}
              </button>
            </div>
            <button
              disabled={busy}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-2xl font-black shadow-lg shadow-blue-600/25 transition text-sm"
            >
              {busy ? "Signing in…" : "Login"}
            </button>
            <p className="text-center text-xs text-slate-500">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  onSwitchToRegister();
                }}
                className="text-blue-600 font-bold hover:underline"
              >
                Register here
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-slate-700">
                First Name
                <input
                  required
                  value={regData.firstName}
                  onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Middle Name
                <input
                  required
                  value={regData.middleName}
                  onChange={(e) => setRegData({ ...regData, middleName: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Last Name
                <input
                  required
                  value={regData.lastName}
                  onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Suffix <span className="font-normal text-slate-400">(optional)</span>
                <input
                  value={regData.suffix}
                  onChange={(e) => setRegData({ ...regData, suffix: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
            <label className="block text-xs font-bold text-slate-700">
              Email Address
              <input
                type="email"
                required
                value={regData.email}
                onChange={(e) =>
                  setRegData({ ...regData, email: e.target.value })
                }
                className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Phone Number
              <span className="relative block">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                <input
                  required
                  value={regData.phone}
                  onChange={(e) =>
                    setRegData({ ...regData, phone: e.target.value })
                  }
                  className="mt-1 w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </span>
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Address
              <span className="relative block">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                <input
                  required
                  value={regData.address}
                  onChange={(e) =>
                    setRegData({ ...regData, address: e.target.value })
                  }
                  className="mt-1 w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-slate-700">
                Barangay
                <input
                  required
                  value={regData.barangay}
                  onChange={(e) =>
                    setRegData({ ...regData, barangay: e.target.value })
                  }
                  className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Landmark{" "}
                <span className="font-normal text-slate-400">(optional)</span>
                <input
                  value={regData.landmark}
                  onChange={(e) =>
                    setRegData({ ...regData, landmark: e.target.value })
                  }
                  className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
            <label className="block text-xs font-bold text-slate-700">
              Password
              <input
                type="password"
                required
                minLength={8}
                value={regData.password}
                onChange={(e) =>
                  setRegData({ ...regData, password: e.target.value })
                }
                autoComplete="new-password"
                className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Confirm Password
              <input
                type="password"
                required
                minLength={8}
                value={regData.confirmPassword}
                onChange={(e) =>
                  setRegData({ ...regData, confirmPassword: e.target.value })
                }
                autoComplete="new-password"
                className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <button
              disabled={busy}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-2xl font-black shadow-lg shadow-blue-600/25 transition text-sm mt-2"
            >
              {busy ? "Creating account…" : "Create Account"}
            </button>
            <p className="text-center text-xs text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  onSwitchToLogin();
                }}
                className="text-blue-600 font-bold hover:underline"
              >
                Login here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
