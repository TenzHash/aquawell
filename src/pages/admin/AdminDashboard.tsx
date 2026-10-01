import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowLeft,
  Droplet,
  Users,
  AlertTriangle,
  Plus,
  Search,
  ChevronRight,
  DollarSign,
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "orders" | "products" | "reports"
  >("dashboard");

  // Mock Data for Admin States
  const [orders] = useState([
    {
      id: "ORD-9021",
      customer: "Maria Santos",
      item: "5-Gallon Slim Refill (x3)",
      total: "₱150.00",
      status: "Pending",
      date: "Oct 1, 2026",
    },
    {
      id: "ORD-9020",
      customer: "Juan Dela Cruz",
      item: "5-Gallon Round Dispenser (x2)",
      total: "₱120.00",
      status: "In Transit",
      date: "Oct 1, 2026",
    },
    {
      id: "ORD-9019",
      customer: "Bicol University Dorm",
      item: "5-Gallon Slim Refill (x10)",
      total: "₱500.00",
      status: "Delivered",
      date: "Sep 30, 2026",
    },
  ]);

  const [products] = useState([
    {
      id: 1,
      name: "5-Gallon Slim Refill",
      category: "Refill",
      price: "₱50.00",
      stock: 145,
      status: "In Stock",
    },
    {
      id: 2,
      name: "5-Gallon Round Refill",
      category: "Refill",
      price: "₱45.00",
      stock: 12,
      status: "Low Stock",
    },
    {
      id: 3,
      name: "Container Dispenser Pump",
      category: "Hardware",
      price: "₱250.00",
      stock: 28,
      status: "In Stock",
    },
    {
      id: 4,
      name: "Mineral Water (500ml Bottle)",
      category: "Retail",
      price: "₱15.00",
      stock: 210,
      status: "In Stock",
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-cyan-400 selection:text-slate-950">
      {/* Sidebar Navigation with Landing Page Royal-Blue Branding */}
      <aside className="w-72 bg-blue-900/90 backdrop-blur-xl text-white flex flex-col shadow-2xl justify-between hidden lg:flex sticky top-0 h-screen border-r border-blue-500/20">
        <div>
          {/* Brand Logo Header */}
          <div className="p-6 border-b border-blue-800/60 flex items-center space-x-3">
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-sm">
              <Droplet className="h-6 w-6 text-cyan-300 fill-cyan-300" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                AquaWell
              </span>
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">
                Admin Station Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/30"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                activeTab === "orders"
                  ? "bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/30"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Order Fulfillment</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                activeTab === "products"
                  ? "bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/30"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Products & Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                activeTab === "reports"
                  ? "bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/30"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Sales & WMA Reports</span>
            </button>
          </nav>
        </div>

        {/* Back to Site Button at Sidebar Bottom */}
        <div className="p-6 border-t border-blue-800/60">
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-blue-100 py-3 rounded-2xl font-bold text-sm transition border border-white/20 backdrop-blur-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Header Bar matching landing page styling */}
        <header className="bg-blue-950/80 backdrop-blur-md border-b border-blue-500/20 px-8 py-4 flex justify-between items-center shadow-lg shadow-blue-950/40 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-black text-white uppercase tracking-wide">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "orders" && "Order Management"}
              {activeTab === "products" && "Inventory Control"}
              {activeTab === "reports" && "Sales & Demand Forecast"}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="lg:hidden text-xs font-bold text-cyan-300 flex items-center space-x-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Site</span>
            </Link>
            <div className="flex items-center space-x-3 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/20 backdrop-blur-md">
              <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
                A
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-bold text-white">
                  Admin User
                </span>
                <span className="block text-[10px] text-cyan-200">
                  Albay Station
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body Content */}
        <main className="p-8 max-w-[1600px] w-full mx-auto flex-1 space-y-8">
          {/* 1. DASHBOARD OVERVIEW TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[28px] border border-white/10 shadow-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Total Sales (Today)
                    </span>
                    <div className="bg-emerald-500/20 text-emerald-300 p-2.5 rounded-2xl border border-emerald-500/30">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white">₱4,850.00</h3>
                  <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                    <span>+12.5%</span>
                    <span>vs yesterday</span>
                  </span>
                </div>

                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[28px] border border-white/10 shadow-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Active Orders
                    </span>
                    <div className="bg-blue-500/20 text-cyan-300 p-2.5 rounded-2xl border border-blue-500/30">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white">18</h3>
                  <span className="text-xs font-bold text-cyan-300">
                    4 pending dispatch
                  </span>
                </div>

                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[28px] border border-white/10 shadow-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Stock Status
                    </span>
                    <div className="bg-amber-500/20 text-amber-300 p-2.5 rounded-2xl border border-amber-500/30">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white">1 Low</h3>
                  <span className="text-xs font-bold text-amber-300">
                    Round Refill needs restock
                  </span>
                </div>

                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[28px] border border-white/10 shadow-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Registered Customers
                    </span>
                    <div className="bg-indigo-500/20 text-indigo-300 p-2.5 rounded-2xl border border-indigo-500/30">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white">342</h3>
                  <span className="text-xs font-bold text-indigo-300">
                    +8 new this week
                  </span>
                </div>
              </div>

              {/* Recent Orders Preview Table */}
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Recent Deliveries
                    </h3>
                    <p className="text-xs text-slate-400">
                      Latest customer orders awaiting fulfillment or completed.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-cyan-300 hover:underline flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-slate-400 uppercase font-black">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Item</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-medium text-slate-300">
                      {orders.map((ord) => (
                        <tr
                          key={ord.id}
                          className="hover:bg-white/5 transition"
                        >
                          <td className="py-4 font-bold text-cyan-300">
                            {ord.id}
                          </td>
                          <td className="py-4 font-bold text-white">
                            {ord.customer}
                          </td>
                          <td className="py-4">{ord.item}</td>
                          <td className="py-4 font-bold text-white">
                            {ord.total}
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                ord.status === "Pending"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : ord.status === "In Transit"
                                    ? "bg-blue-500/20 text-cyan-300 border border-blue-500/30"
                                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. ORDER FULFILLMENT TAB */}
          {activeTab === "orders" && (
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">
                    Order Dispatch & Fulfillment
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manage real-time customer orders and update delivery
                    statuses.
                  </p>
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search order ID..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-slate-400 uppercase font-black">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Item Details</th>
                      <th className="pb-3">Total Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-medium text-slate-300">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/5 transition">
                        <td className="py-4 font-bold text-cyan-300">
                          {ord.id}
                        </td>
                        <td className="py-4 font-bold text-white">
                          {ord.customer}
                        </td>
                        <td className="py-4">{ord.item}</td>
                        <td className="py-4 font-bold text-white">
                          {ord.total}
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                              ord.status === "Pending"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : ord.status === "In Transit"
                                  ? "bg-blue-500/20 text-cyan-300 border border-blue-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() =>
                              alert(`Marking ${ord.id} as In Transit`)
                            }
                            className="px-3 py-1.5 bg-blue-600/30 text-cyan-300 font-bold rounded-xl border border-blue-500/40 hover:bg-blue-600/50 transition cursor-pointer"
                          >
                            Dispatch
                          </button>
                          <button
                            onClick={() =>
                              alert(`Marking ${ord.id} as Delivered`)
                            }
                            className="px-3 py-1.5 bg-emerald-600/30 text-emerald-300 font-bold rounded-xl border border-emerald-500/40 hover:bg-emerald-600/50 transition cursor-pointer"
                          >
                            Complete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. PRODUCTS & INVENTORY TAB */}
          {activeTab === "products" && (
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">
                    Inventory & Stock Control
                  </h3>
                  <p className="text-xs text-slate-400">
                    Monitor stock levels and manage store offerings.
                  </p>
                </div>
                <button
                  onClick={() => alert("Add product modal opened")}
                  className="bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Add New Product</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-slate-900/80 p-6 rounded-2xl border border-white/10 space-y-3 shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-slate-300">
                        {prod.category}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${prod.status === "Low Stock" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}
                      >
                        {prod.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">
                      {prod.name}
                    </h4>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-sm font-black text-cyan-300">
                        {prod.price}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Stock: {prod.stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SALES REPORT & WMA FORECAST TAB */}
          {activeTab === "reports" && (
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-xl space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-black text-white">
                  Sales Reports & 3-Period WMA Demand Forecast
                </h3>
                <p className="text-xs text-slate-400">
                  Algorithmic demand projections to ensure adequate water stock
                  preparation.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-blue-900/40 p-6 rounded-2xl border border-blue-500/30 space-y-2">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Period 1 Demand (Actual)
                  </span>
                  <h4 className="text-2xl font-black text-white">
                    410 Refills
                  </h4>
                  <p className="text-[11px] text-blue-200">
                    Observed sales volume for previous cycle.
                  </p>
                </div>

                <div className="bg-blue-900/40 p-6 rounded-2xl border border-blue-500/30 space-y-2">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Period 2 Demand (Actual)
                  </span>
                  <h4 className="text-2xl font-black text-white">
                    445 Refills
                  </h4>
                  <p className="text-[11px] text-blue-200">
                    Observed sales volume for last cycle.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 p-6 rounded-2xl shadow-xl space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    WMA Forecast (Next Period)
                  </span>
                  <h4 className="text-3xl font-black text-slate-950">
                    462 Refills
                  </h4>
                  <p className="text-[11px] font-bold text-blue-950">
                    Weighted Moving Average prediction.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-900/80 rounded-2xl border border-white/10 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Download Full Financial Report
                  </h4>
                  <p className="text-xs text-slate-400">
                    Export structured CSV or PDF records for administrative
                    auditing.
                  </p>
                </div>
                <button
                  onClick={() => alert("Report downloaded successfully!")}
                  className="bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs transition shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Export CSV
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
