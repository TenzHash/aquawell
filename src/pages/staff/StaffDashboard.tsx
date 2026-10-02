import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Droplet,
  LogOut,
  X,
  CheckCircle2,
  Receipt,
  Package,
  ShoppingCart,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "sales">(
    "orders",
  );

  // Orders State
  const [orders, setOrders] = useState([
    {
      id: "ORD-002",
      customer: "John Doe",
      variant: "5-Gallon Slim Refill",
      quantity: 2,
      type: "Delivery",
      address: "Pinned Location (13.1391, 123.7439) - Legazpi City",
      total: "₱104.00",
      status: "Out for Delivery",
      rider: "Rider Juan",
      paymentStatus: "Unpaid",
    },
    {
      id: "ORD-001",
      customer: "Maria Santos",
      variant: "5-Gallon Round Refill",
      quantity: 1,
      type: "Delivery",
      address: "Rawis, Legazpi City, Albay",
      total: "₱50.00",
      status: "Delivered",
      rider: "Junmar Perez",
      paymentStatus: "Paid - Verified",
    },
  ]);

  // Inventory State
  const [inventory] = useState([
    {
      id: 1,
      name: "5-Gallon Slim Refill",
      stock: 8,
      minStock: 15,
      price: "₱50.00",
    },
    {
      id: 2,
      name: "5-Gallon Round Refill",
      stock: 25,
      minStock: 15,
      price: "₱50.00",
    },
    {
      id: 3,
      name: "Container Dispenser Pump",
      stock: 12,
      minStock: 5,
      price: "₱250.00",
    },
  ]);

  // Sales Records State
  const [salesRecords, setSalesRecords] = useState([
    {
      txId: "TXN-1001",
      customer: "Walk-in Customer",
      item: "5-Gallon Round Refill",
      qty: 1,
      total: "₱50.00",
      method: "Cash",
      date: "Today, 09:15 AM",
    },
  ]);

  // Modals
  const [assigningOrder, setAssigningOrder] = useState<any | null>(null);
  const [selectedRider, setSelectedRider] = useState("");
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);

  // New Sale Form
  const [saleCustomer, setSaleCustomer] = useState("Walk-in Customer");
  const [saleProduct, setSaleProduct] = useState("5-Gallon Round Refill");
  const [saleQty, setSaleQty] = useState(1);
  const [saleMethod, setSaleMethod] = useState("Cash");

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3500);
  };

  const handleAssignRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningOrder) return;

    setOrders(
      orders.map((ord) =>
        ord.id === assigningOrder.id
          ? { ...ord, rider: selectedRider, status: "Out for Delivery" }
          : ord,
      ),
    );
    setAssigningOrder(null);
    setSelectedRider("");
    showToast(`Successfully assigned rider to ${assigningOrder.id}!`);
  };

  const handleToggleStatus = (id: string) => {
    setOrders(
      orders.map((ord) => {
        if (ord.id === id) {
          const nextStatus =
            ord.status === "Pending"
              ? "Out for Delivery"
              : ord.status === "Out for Delivery"
                ? "Delivered"
                : "Pending";
          return { ...ord, status: nextStatus };
        }
        return ord;
      }),
    );
    showToast(`Updated delivery fulfillment status!`);
  };

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmt = saleProduct.includes("Pump")
      ? 250 * saleQty
      : 50 * saleQty;
    const newTxn = {
      txId: `TXN-10${salesRecords.length + 2}`,
      customer: saleCustomer,
      item: saleProduct,
      qty: saleQty,
      total: `₱${totalAmt.toFixed(2)}`,
      method: saleMethod,
      date: "Just now",
    };
    setSalesRecords([newTxn, ...salesRecords]);
    setIsRecordSaleOpen(false);
    showToast("Walk-in sales transaction recorded successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center space-x-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            {toast.message}
          </span>
        </div>
      )}

      {/* Assign Rider Modal */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                Assign Rider for {assigningOrder.id}
              </h3>
              <button
                onClick={() => setAssigningOrder(null)}
                className="text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAssignRiderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Select Delivery Personnel
                </label>
                <select
                  required
                  value={selectedRider}
                  onChange={(e) => setSelectedRider(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="">-- Choose Rider --</option>
                  <option value="Rider Juan">Rider Juan</option>
                  <option value="Junmar Perez">Junmar Perez</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAssigningOrder(null)}
                  className="w-1/2 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      {isRecordSaleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                Record Sales Transaction
              </h3>
              <button
                onClick={() => setIsRecordSaleOpen(false)}
                className="text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRecordSale} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Customer / Buyer Name
                </label>
                <input
                  type="text"
                  required
                  value={saleCustomer}
                  onChange={(e) => setSaleCustomer(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Product Item
                </label>
                <select
                  value={saleProduct}
                  onChange={(e) => setSaleProduct(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="5-Gallon Slim Refill">
                    5-Gallon Slim Refill (₱50)
                  </option>
                  <option value="5-Gallon Round Refill">
                    5-Gallon Round Refill (₱50)
                  </option>
                  <option value="Container Dispenser Pump">
                    Container Dispenser Pump (₱250)
                  </option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={saleQty}
                    onChange={(e) => setSaleQty(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Payment
                  </label>
                  <select
                    value={saleMethod}
                    onChange={(e) => setSaleMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecordSaleOpen(false)}
                  className="w-1/2 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg cursor-pointer"
                >
                  Save Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-blue-600/95 text-white backdrop-blur-md border-b border-blue-400/20 px-4 sm:px-8 lg:px-16 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-white/15 border border-white/25 p-2.5 rounded-2xl shadow-sm shrink-0">
            <Droplet className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300 fill-cyan-300" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black tracking-wider text-white">
              AquaWell
            </span>
            <span className="block text-[10px] text-cyan-200 uppercase tracking-widest font-extrabold">
              Staff & Delivery Portal
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsRecordSaleOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Receipt className="h-4 w-4" />
            <span>Record Walk-in Sale</span>
          </button>
          <Link
            to="/"
            className="flex items-center space-x-2 text-white bg-rose-500 hover:bg-rose-600 px-3.5 py-2 rounded-xl transition text-xs font-bold shadow-md"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-12 max-w-[1600px] mx-auto space-y-8">
        {/* Module Switcher Tabs */}
        <div className="flex border-b border-slate-200 space-x-6">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 font-black text-sm sm:text-base flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === "orders"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Process & Dispatch Orders</span>
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`pb-3 font-black text-sm sm:text-base flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === "inventory"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Manage Inventory</span>
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`pb-3 font-black text-sm sm:text-base flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === "sales"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Sales Transactions Log</span>
          </button>
        </div>

        {/* Tab 1: Orders & Delivery Dispatch */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">
                Customer Orders & Fulfillment Management
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-white px-3 py-1 rounded-xl border border-slate-200">
                {orders.length} Active Requests
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders.map((ord, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-xs font-mono font-bold text-blue-600">
                        {ord.id}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(ord.id)}
                        className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-100"
                      >
                        {ord.status} 🔄
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold text-xs uppercase">
                          Customer
                        </span>
                        <span className="font-bold text-slate-900">
                          {ord.customer}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold text-xs uppercase">
                          Variant
                        </span>
                        <span className="font-bold text-slate-900">
                          {ord.variant} ({ord.quantity})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold text-xs uppercase">
                          Total
                        </span>
                        <span className="font-black text-blue-600">
                          {ord.total}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 mt-2">
                        📍 {ord.address}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      Driver:{" "}
                      <strong className="text-blue-600">{ord.rider}</strong>
                    </span>
                    <button
                      onClick={() => setAssigningOrder(ord)}
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-black border border-blue-200 cursor-pointer flex items-center space-x-1"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Assign</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Inventory Management */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">
                Station Inventory Stock Levels
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {inventory.map((inv) => {
                const lowStock = inv.stock <= inv.minStock;
                return (
                  <div
                    key={inv.id}
                    className={`bg-white border rounded-[32px] p-6 shadow-sm space-y-4 ${
                      lowStock
                        ? "border-amber-300 bg-amber-50/10"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-xl">
                        Product Stock
                      </span>
                      {lowStock && (
                        <span className="flex items-center space-x-1 text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Low Stock</span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-slate-900 text-lg">
                      {inv.name}
                    </h4>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-blue-600 font-black">
                        {inv.price}
                      </span>
                      <span className="font-black text-slate-700">
                        Stock: {inv.stock} units
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Sales Transactions Log */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">
                Recorded Sales Log
              </h3>
              <button
                onClick={() => setIsRecordSaleOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow cursor-pointer"
              >
                + Record New Sale
              </button>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase font-black">
                    <th className="py-3 px-4">TXN ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Qty</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {salesRecords.map((txn, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-4 px-4 font-bold text-blue-600">
                        {txn.txId}
                      </td>
                      <td className="py-4 px-4 font-bold">{txn.customer}</td>
                      <td className="py-4 px-4">{txn.item}</td>
                      <td className="py-4 px-4">{txn.qty}</td>
                      <td className="py-4 px-4 font-bold text-blue-600">
                        {txn.total}
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold">
                          {txn.method}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-slate-500">
                        {txn.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
