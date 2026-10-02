import { useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import {
  Droplet,
  Clock,
  CheckCircle,
  LogOut,
  Plus,
  Truck,
  X,
  CheckCircle2,
  CreditCard,
  Settings,
  User,
  ShoppingBag,
  History,
  MapPin,
} from "lucide-react";

function LocationPicker({
  position,
  setPosition,
  setAddress,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  setAddress: (addr: string) => void;
}) {
  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      setAddress(
        `Pinned Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(
          4,
        )}) - Legazpi City`,
      );
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function CustomerDashboard() {
  // Orders State
  const [orders, setOrders] = useState([
    {
      id: "ORD-002",
      variant: "5-Gallon Slim Refill",
      quantity: 2,
      type: "Delivery",
      address: "Pinned Location (13.1391, 123.7439) - Legazpi City",
      total: "₱104.00",
      status: "Out for Delivery",
      rider: "Rider Juan",
      date: "Today, 10:30 AM",
      paymentStatus: "Unpaid",
      referenceNo: "",
    },
    {
      id: "ORD-001",
      variant: "5-Gallon Round Refill",
      quantity: 1,
      type: "Delivery",
      address: "Padang, Legazpi City, Albay",
      total: "₱50.00",
      status: "Delivered",
      rider: "Junmar Perez",
      date: "Yesterday",
      paymentStatus: "Paid - Verified",
      referenceNo: "GCASH-987654321",
    },
  ]);

  // Tab Filter State
  const [orderTab, setOrderTab] = useState<"active" | "history">("active");

  // Customer Profile State
  const [customerName, setCustomerName] = useState("John Doe");
  const [customerEmail, setCustomerEmail] = useState("john.doe@example.com");
  const [customerPhone, setCustomerPhone] = useState("+639123456789");
  const [customerAddress, setCustomerAddress] = useState(
    "Padang, Legazpi City, Albay",
  );

  // Modals State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [payingOrder, setPayingOrder] = useState<any | null>(null);

  // Ordering State
  const [selectedProduct, setSelectedProduct] = useState(
    "5-Gallon Slim Refill",
  );
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [fulfillmentType, setFulfillmentType] = useState("Delivery");
  const [orderDeliveryAddress, setOrderDeliveryAddress] =
    useState(customerAddress);

  // Default map center: Legazpi City, Albay coordinates
  const [mapPosition, setMapPosition] = useState<[number, number]>([
    13.1391, 123.7439,
  ]);

  // Payment Form State (Fixes the Uncaught ReferenceError)
  const [paymentMethod, setPaymentMethod] = useState("GCash");
  const [referenceNumber, setReferenceNumber] = useState("");

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3500);
  };

  const getUnitPrice = (prod: string) => {
    if (prod.includes("Refill")) return 50;
    if (prod.includes("Pump")) return 250;
    return 150;
  };

  const computedTotal = getUnitPrice(selectedProduct) * orderQuantity;

  const handleOpenOrderModal = () => {
    setOrderDeliveryAddress(customerAddress);
    setIsOrderModalOpen(true);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder = {
      id: `ORD-00${orders.length + 1}`,
      variant: selectedProduct,
      quantity: orderQuantity,
      type: fulfillmentType,
      address: orderDeliveryAddress,
      total: `₱${computedTotal.toFixed(2)}`,
      status: "Pending",
      rider: "Unassigned",
      date: "Just now",
      paymentStatus: "Unpaid",
      referenceNo: "",
    };

    setOrders([newOrder, ...orders]);
    setIsOrderModalOpen(false);
    showToast("Water refill order placed successfully with pinned location!");
  };

  const handleMakePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingOrder) return;

    setOrders(
      orders.map((ord) =>
        ord.id === payingOrder.id
          ? {
              ...ord,
              paymentStatus: `Verification Pending (${paymentMethod})`,
              referenceNo: referenceNumber,
            }
          : ord,
      ),
    );
    setPayingOrder(null);
    setReferenceNumber("");
    showToast(`Payment reference submitted for ${payingOrder.id}!`);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileModalOpen(false);
    showToast("Profile and delivery address updated successfully!");
  };

  const filteredOrders = orders.filter((ord) => {
    const isCompleted = ord.status === "Delivered";
    if (orderTab === "active") return !isCompleted;
    return isCompleted;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center space-x-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            {toast.message}
          </span>
        </div>
      )}

      {/* ================= MAKE PAYMENT MODAL ================= */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-50 p-2.5 rounded-2xl border border-purple-100">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Make Payment ({payingOrder.id})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Amount Due:{" "}
                    <span className="text-blue-600 font-bold">
                      {payingOrder.total}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPayingOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleMakePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="GCash">
                    GCash (0998-765-4321 - AquaWell)
                  </option>
                  <option value="Bank Transfer">
                    Bank Transfer (BPI / UnionBank)
                  </option>
                  <option value="Cash on Delivery">
                    Cash on Delivery (COD)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Transaction Reference No. / Receipt #
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1049285029"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPayingOrder(null)}
                  className="w-1/2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PROFILE & SETTINGS MODAL ================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Account Profile & Address
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update your personal information and default delivery
                    destination.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Default Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-1/2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-lg transition cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER MODAL WITH LEAFLET MAP PIN PICKER */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Request Water Refill
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select product, quantity, and click the map to pin delivery
                    location.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Product Variant
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="5-Gallon Slim Refill">
                    5-Gallon Slim Refill (₱50.00)
                  </option>
                  <option value="5-Gallon Round Refill">
                    5-Gallon Round Refill (₱50.00)
                  </option>
                  <option value="Container Dispenser Pump">
                    Container Dispenser Pump (₱250.00)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Fulfillment Type
                  </label>
                  <select
                    value={fulfillmentType}
                    onChange={(e) => setFulfillmentType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Delivery">Home/Office Delivery</option>
                    <option value="Pickup">Station Pickup</option>
                  </select>
                </div>
              </div>

              {fulfillmentType === "Delivery" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Click Map to Pin exact Delivery Location
                  </label>
                  <div className="h-56 w-full rounded-2xl overflow-hidden border border-slate-200 z-0">
                    <MapContainer
                      center={mapPosition}
                      zoom={14}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <LocationPicker
                        position={mapPosition}
                        setPosition={setMapPosition}
                        setAddress={setOrderDeliveryAddress}
                      />
                    </MapContainer>
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={orderDeliveryAddress}
                      onChange={(e) => setOrderDeliveryAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none mt-1"
                      placeholder="Selected address description..."
                    />
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Total Computation
                </span>
                <span className="text-xl font-black text-blue-900">
                  ₱{computedTotal.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="w-1/2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 transition cursor-pointer"
                >
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-blue-600/95 text-white backdrop-blur-md border-b border-blue-400/20 px-4 sm:px-8 lg:px-16 py-4 flex justify-between items-center shadow-lg shadow-blue-900/30">
        <div className="flex items-center space-x-3">
          <div className="bg-white/15 border border-white/25 p-2.5 rounded-2xl shadow-sm shrink-0">
            <Droplet className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300 fill-cyan-300" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black tracking-wider text-white">
              AquaWell
            </span>
            <span className="block text-[10px] text-cyan-200 uppercase tracking-widest font-extrabold">
              Customer Portal
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 text-sm font-semibold">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center space-x-2 bg-white/15 hover:bg-white/25 px-3.5 sm:px-4 py-2 rounded-xl border border-white/25 text-white transition cursor-pointer text-xs sm:text-sm"
          >
            <User className="h-4 w-4 text-cyan-200 shrink-0" />
            <span className="truncate max-w-[120px]">{customerName}</span>
          </button>
          <Link
            to="/"
            className="flex items-center space-x-2 text-white hover:bg-rose-600 bg-rose-500 px-3.5 sm:px-4 py-2 rounded-xl border border-rose-400 transition text-xs sm:text-sm font-bold shadow-md"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </Link>
        </div>
      </nav>

      {/* Main Fluid Content */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-12 max-w-[1600px] mx-auto space-y-8">
        {/* Hero Banner */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-2">
            <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Live Order Management & Map Pinned Deliveries
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Welcome back, {customerName.split(" ")[0]}! 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl leading-relaxed">
              Manage your purified water refills, pin your exact delivery
              location on the map, and track orders in real-time.
            </p>
          </div>

          <button
            onClick={handleOpenOrderModal}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center justify-center space-x-2 shrink-0 relative z-10"
          >
            <Plus className="h-5 w-5 stroke-[3]" />
            <span>Request Water Refill</span>
          </button>
        </div>

        {/* Section Header & Tab Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {orderTab === "active" ? "Active Orders" : "Order History"}
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              {orderTab === "active"
                ? "Monitoring active dispatches and pending payments."
                : "Archive of previously fulfilled and completed orders."}
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setOrderTab("active")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                orderTab === "active"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active Orders (
              {orders.filter((o) => o.status !== "Delivered").length})
            </button>
            <button
              onClick={() => setOrderTab("history")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                orderTab === "history"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Order History (
              {orders.filter((o) => o.status === "Delivered").length})
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                No {orderTab === "active" ? "active orders" : "order history"}{" "}
                found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {orderTab === "active"
                  ? "You currently have no pending or in-transit orders."
                  : "You have no completed deliveries yet."}
              </p>
            </div>
            {orderTab === "active" && (
              <button
                onClick={handleOpenOrderModal}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow hover:bg-blue-700 transition cursor-pointer inline-block"
              >
                Request Refill Now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((ord, idx) => {
              const isDelivered = ord.status === "Delivered";
              const isOutForDelivery = ord.status === "Out for Delivery";
              const isPending = ord.status === "Pending";
              const isPaid = ord.paymentStatus.includes("Paid");

              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 shadow-sm hover:shadow-md transition space-y-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <span className="text-xs font-mono font-bold text-blue-600 tracking-wider">
                        {ord.id}
                      </span>
                      <span
                        className={`px-3.5 py-1 rounded-full text-xs font-black tracking-wide border ${
                          isDelivered
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isOutForDelivery
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {isDelivered ? (
                          <CheckCircle className="h-3.5 w-3.5 shrink-0 inline mr-1" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 animate-spin shrink-0 inline mr-1" />
                        )}
                        <span>{ord.status}</span>
                      </span>
                    </div>

                    <div className="space-y-3.5 text-sm mt-5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-xs">
                          Product Variant
                        </span>
                        <span className="font-bold text-slate-900 truncate max-w-[180px]">
                          {ord.variant}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-xs">
                          Quantity
                        </span>
                        <span className="font-bold text-slate-800">
                          {ord.quantity} Container(s)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-xs">
                          Payment Status
                        </span>
                        <span
                          className={`text-xs px-3 py-1 rounded-lg font-black border ${
                            isPaid
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : ord.paymentStatus.includes("Verification")
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-slate-400 font-bold uppercase text-xs">
                          Total Amount
                        </span>
                        <span className="text-xl font-black text-blue-600">
                          {ord.total}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Pinned Address Badge */}
                    <div className="flex items-center space-x-2 text-xs text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100 mt-4">
                      <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="truncate font-semibold">
                        {ord.address}
                      </span>
                    </div>

                    {/* Live Tracking Progress Tracker Component */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 mt-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <span
                          className={
                            !isPending
                              ? "text-blue-600 font-black"
                              : "text-slate-400"
                          }
                        >
                          Pending
                        </span>
                        <span
                          className={
                            isOutForDelivery || isDelivered
                              ? "text-amber-600 font-black"
                              : "text-slate-400"
                          }
                        >
                          In Transit
                        </span>
                        <span
                          className={
                            isDelivered
                              ? "text-emerald-600 font-black"
                              : "text-slate-400"
                          }
                        >
                          Delivered
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isDelivered
                              ? "w-full bg-emerald-500"
                              : isOutForDelivery
                                ? "w-2/3 bg-amber-500"
                                : "w-1/3 bg-blue-600"
                          }`}
                        ></div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-slate-600 pt-1">
                        <Truck className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="truncate font-bold">
                          Driver: {ord.rider}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button: Make Payment if Unpaid */}
                  {!isPaid && !ord.paymentStatus.includes("Verification") && (
                    <button
                      onClick={() => setPayingOrder(ord)}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs shadow-lg shadow-purple-500/20 transition cursor-pointer flex items-center justify-center space-x-2 mt-4"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Make Payment Now</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
