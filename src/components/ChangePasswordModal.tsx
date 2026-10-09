import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Lock, X } from "lucide-react";
import { friendlyErrorMessage } from "../lib/userMessages";

export default function ChangePasswordModal({
  isOpen,
  onClose,
  showToast,
}: {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match!", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters long.", "error");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      showToast(friendlyErrorMessage(error, "We could not update your password. Please try again."), "error");
    } else {
      showToast("Password updated successfully!", "success");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn relative z-[10001]">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Change Password
              </h3>
              <p className="text-xs text-slate-500">
                Choose a new password for your account.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              New password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Confirm New password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
