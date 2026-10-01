import React from "react";
import { Link } from "react-router-dom";
import {
  Droplet,
  ShoppingCart,
  Clock,
  CheckCircle,
  LogOut,
  Plus,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";

export default function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Full-Width Modern Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-8 lg:px-16 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-blue-600 to-cyan-400 p-2.5 rounded-2xl shadow-lg shadow-cyan-500/20">
            <Droplet className="h-6 w-6 text-slate-950 fill-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white">
              AquaWell
            </span>
            <span className="block text-[10px] text-cyan-400 uppercase tracking-widest font-extrabold">
              Customer Portal
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm font-semibold">
          <div className="hidden sm:flex items-center space-x-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-slate-300">
            <User className="h-4 w-4 text-cyan-400" />
            <span>John Doe</span>
          </div>
          <Link
            to="/"
            className="flex items-center space-x-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Link>
        </div>
      </nav>

      {/* Main Fluid Content */}
      <main className="flex-1 w-full px-8 lg:px-16 py-10">
        {/* Full-Width Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 lg:p-12 mb-10 shadow-2xl">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-cyan-400 text-xs font-black uppercase tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">
                Live Order Management
              </span>
              <h1 className="text-3xl lg:text-5xl font-black text-white mt-4 mb-3 tracking-tight">
                Welcome back, John! 👋
              </h1>
              <p className="text-slate-400 text-sm lg:text-base max-w-2xl leading-relaxed">
                Manage your purified water refill schedules, select your
                container variants (5-Gallon Slim or Round), and track your
                deliveries in real-time.
              </p>
            </div>
            <button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-xl shadow-cyan-500/20 transition transform hover:-translate-y-0.5 flex items-center space-x-3 shrink-0">
              <Plus className="h-5 w-5 stroke-[3]" />
              <span>Request Water Refill</span>
            </button>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Active & Recent Refill Orders
            </h2>
            <p className="text-xs text-slate-400">
              Tracking state-based fulfillment progress across station
              operations.
            </p>
          </div>
          <span className="text-xs font-bold text-cyan-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
            2 Total Orders
          </span>
        </div>

        {/* Full Width Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Order 1 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-xl hover:border-cyan-500/50 transition">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                #ORD-002
              </span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5">
                <Clock className="h-3.5 w-3.5 animate-spin" />
                <span>Out for Delivery</span>
              </span>
            </div>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">
                  Product Variant
                </span>
                <span className="font-bold text-white">
                  5-Gallon Slim Refill
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Quantity</span>
                <span className="font-bold text-slate-200">2 Containers</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">
                  Fulfillment Type
                </span>
                <span className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-lg font-bold border border-blue-500/20">
                  Delivery
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="text-slate-400 font-bold">Total Amount</span>
                <span className="text-xl font-black text-cyan-400">
                  ₱104.00
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 flex items-center space-x-3 text-xs text-slate-400">
              <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="truncate font-medium">
                Assigned Driver: Rider Juan
              </span>
            </div>
          </div>

          {/* Order 2 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-xl hover:border-cyan-500/50 transition">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                #ORD-001
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Delivered</span>
              </span>
            </div>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">
                  Product Variant
                </span>
                <span className="font-bold text-white">
                  5-Gallon Round Refill
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Quantity</span>
                <span className="font-bold text-slate-200">1 Container</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">
                  Fulfillment Type
                </span>
                <span className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-lg font-bold border border-blue-500/20">
                  Delivery
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="text-slate-400 font-bold">Total Amount</span>
                <span className="text-xl font-black text-cyan-400">₱50.00</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 flex items-center space-x-3 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="truncate font-medium">
                Payment Confirmed & Recorded
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
