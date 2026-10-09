import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { supabase } from "../../lib/supabase";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import ThemeToggleButton from "../../components/ThemeToggleButton";
import { useTheme } from "../../context/ThemeContext";
import { friendlyErrorMessage } from "../../lib/userMessages";
import {
  Droplet,
  Clock,
  CheckCircle,
  LogOut,
  Plus,
  Truck,
  X,
  CheckCircle2,
  Settings,
  User,
  History,
  MapPin,
  Lock,
  ArrowLeft,
  Navigation,
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
  const map = useMap();

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

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Theme Context Hook
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Orders State (Synced with Supabase)
  const [orders, setOrders] = useState<any[]>([]);

  // Inventory Products State for Relational Mapping
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(
    null,
  );

  // Tab Filter State
  const [orderTab, setOrderTab] = useState<"active" | "history">("active");

  // Customer Profile State (Aligned with `customers` table columns)
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Modals & View States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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

  // Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3500,
    );
  };

  // Fetch Session, Inventory & Customer Data on Load
  useEffect(() => {
    fetchInventoryProducts();
    fetchUserDataAndOrders();
  }, []);

  const fetchInventoryProducts = async () => {
    const { data, error } = await supabase.from("inventory").select("*");
    if (!error && data && data.length > 0) {
      setInventoryProducts(data);
      setSelectedInventoryId(data[0].id);
      setSelectedProduct(data[0].name);
    }
  };

  const fetchUserDataAndOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }
    setCurrentUser(user);
    setCustomerEmail(user.email || "");

    const { data: staffByProfile } = await supabase
      .from("staff")
      .select("role")
      .eq("profile_id", user.id)
      .maybeSingle();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const effectiveRole = String(staffByProfile?.role || profile?.role || user.user_metadata?.role || "customer").toLowerCase();
    if (effectiveRole !== "customer") {
      if (effectiveRole === "admin") navigate("/admin/dashboard");
      else if (effectiveRole === "staff" || effectiveRole === "delivery") navigate("/staff/dashboard");
      else navigate("/login");
      return;
    }

    // Fetch customer info matching the `customers` table structure
    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (customerData) {
      setCustomerId(customerData.customer_id);
      if (customerData.first_name) setFirstName(customerData.first_name);
      if (customerData.middle_name) setMiddleName(customerData.middle_name);
      if (customerData.last_name) setLastName(customerData.last_name);
      if (customerData.suffix) setSuffix(customerData.suffix);
      if (customerData.contact_number)
        setCustomerPhone(customerData.contact_number);
      if (customerData.address) {
        setCustomerAddress(customerData.address);
        setOrderDeliveryAddress(customerData.address);
      }
    } else {
      // Do not invent a placeholder customer record. A missing customer row
      // means the account provisioning flow is incomplete and must be repaired
      // by resolve-user-account rather than silently becoming "Customer User".
      showToast(
        "Your customer account is incomplete. Please contact the administrator so the account can be repaired.",
        "error",
      );
      await supabase.auth.signOut();
      navigate("/login");
      return;
    }

    // orders.customer_id references profiles.id (UUID), not customers.customer_id (integer).
    // Always query orders using the authenticated profile UUID.
    const profileId = user.id;
    {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", profileId)
        .order("created_at", { ascending: false });

      if (!error && ordersData) {
        const orderIds = ordersData.map((o: any) => o.id);
        const { data: itemsData } = orderIds.length
          ? await supabase
              .from("order_items")
              .select("*, inventory(name)")
              .in("order_id", orderIds)
          : { data: [] as any[] };
        const { data: staffData } = await supabase
          .from("staff")
          .select("staff_id, first_name, last_name");
        const staffMap = new Map(
          (staffData ?? []).map((st: any) => [st.staff_id, st]),
        );
        const itemsByOrder = new Map<string, any[]>();

        for (const item of itemsData ?? []) {
          const list = itemsByOrder.get(item.order_id) ?? [];
          list.push(item);
          itemsByOrder.set(item.order_id, list);
        }

        setOrders(
          ordersData.map((o: any) => {
            const items = itemsByOrder.get(o.id) ?? [];
            const firstItem = items[0];
            const rider = o.rider_id ? staffMap.get(o.rider_id) : null;
            return {
              id: o.id,
              variant:
                firstItem?.inventory?.name ||
                (items.length > 1 ? `${items.length} items` : "Order item"),
              quantity: firstItem?.quantity ?? 1,
              type: o.type,
              address: o.address || "Station Pickup",
              total: Number(o.total),
              status: o.status,
              rider: rider
                ? `${rider.first_name} ${rider.last_name}`
                : "Unassigned",
              date: new Date(o.created_at).toLocaleDateString(),
              paymentStatus: o.payment_status || "UNPAID",
              referenceNo: o.reference_no || "",
              receiptUrl: o.receipt_url || "",
            };
          }),
        );
      }
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodName = e.target.value;
    setSelectedProduct(prodName);
    const found = inventoryProducts.find((p) => p.name === prodName);
    if (found) {
      setSelectedInventoryId(found.id);
    }
  };

  const getUnitPrice = (prod: string) => {
    const found = inventoryProducts.find((p) => p.name === prod);
    return found ? Number(found.price) : 50;
  };

  const computedTotal = getUnitPrice(selectedProduct) * orderQuantity;

  const handleOpenOrderModal = () => {
    setOrderDeliveryAddress(customerAddress);
    setIsOrderModalOpen(true);
  };

  // Browser Geolocation Handler to Pin Exact User Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }

    showToast("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapPosition([lat, lng]);
        setOrderDeliveryAddress(
          `GPS Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        );
        showToast("Location pinned successfully!");
      },
      () => {
        showToast(
          "Unable to retrieve your location. Please check permissions.",
          "error",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedInventoryId || !customerId) {
      showToast(
        "Please select a valid product and ensure your profile is loaded.",
        "error",
      );
      return;
    }

    const product = inventoryProducts.find(
      (item) => item.id === selectedInventoryId,
    );
    if (!product) {
      showToast("Selected product is no longer available.", "error");
      return;
    }
    if (Number(product.stock) < orderQuantity) {
      showToast("The selected product does not have enough stock.", "error");
      return;
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { data: orderResult, error: orderError } = await supabase.rpc("place_customer_order", {
      p_order_id: orderId,
      p_customer_id: currentUser.id,
      p_inventory_id: product.id,
      p_quantity: orderQuantity,
      p_type: fulfillmentType,
      p_address: fulfillmentType === "Delivery"
        ? orderDeliveryAddress || customerAddress || null
        : null,
    });

    if (orderError) {
      showToast(friendlyErrorMessage(orderError, "We could not place your order. Please try again."), "error");
      return;
    }
    if (!orderResult?.success) {
      showToast(orderResult?.error || "Unable to place order.", "error");
      return;
    }

    setIsOrderModalOpen(false);
    showToast("Order placed successfully!");
    fetchInventoryProducts();
    fetchUserDataAndOrders();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const currentAuthEmail = String(currentUser.email || "").trim().toLowerCase();
    const requestedEmail = customerEmail.trim().toLowerCase();
    if (requestedEmail && requestedEmail !== currentAuthEmail) {
      const { error: authEmailError } = await supabase.auth.updateUser({ email: requestedEmail });
      if (authEmailError) {
        showToast(friendlyErrorMessage(authEmailError, "We could not update your email. Please try again."), "error");
        return;
      }
    }

    const { error: customerError } = await supabase
      .from("customers")
      .update({
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix: suffix,
        contact_number: customerPhone,
        address: customerAddress,
        email: customerEmail,
      })
      .eq("profile_id", currentUser.id);

    if (customerError) {
      showToast(friendlyErrorMessage(customerError, "We could not save your profile. Please try again."), "error");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: `${firstName} ${middleName ? `${middleName} ` : ""}${lastName}${suffix ? ` ${suffix}` : ""}`.trim(),
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
      })
      .eq("id", currentUser.id);

    if (profileError) {
      showToast(friendlyErrorMessage(profileError, "Your customer details were saved, but your profile could not be updated."), "error");
      return;
    }

    setIsProfileModalOpen(false);
    showToast("Profile and delivery address updated successfully!");
    fetchUserDataAndOrders();
  };

  const filteredOrders = orders.filter((ord) => {
    const isCompleted =
      ord.status === "Delivered" || ord.status === "DELIVERED";
    if (orderTab === "active") return !isCompleted;
    return isCompleted;
  });

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden transition-colors ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Toast Notification Banner */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-[11000] flex items-center space-x-3 text-white px-6 py-4 rounded-2xl shadow-2xl border animate-bounce ${
            toast.type === "error"
              ? "bg-rose-900 border-rose-800"
              : isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-slate-900 border-slate-800"
          }`}
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            {toast.message}
          </span>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        showToast={showToast}
      />

      {/* ================= PROFILE & SETTINGS MODAL ================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-[32px] border shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-fadeIn max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div
              className={`flex justify-between items-center border-b pb-4 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2.5 rounded-2xl border ${
                    isDark
                      ? "bg-blue-950/50 border-blue-900/50"
                      : "bg-blue-50 border-blue-100"
                  }`}
                >
                  <Settings
                    className={`h-5 w-5 ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`text-lg font-black ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    Account Profile & Address
                  </h3>
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Update your personal information and default delivery
                    destination.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className={`p-2 cursor-pointer ${
                  isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={customerEmail}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm font-bold cursor-not-allowed ${
                      isDark
                        ? "bg-slate-800/50 border-slate-700/50 text-slate-400"
                        : "bg-slate-100 border-slate-200 text-slate-500"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Contact Number
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Default Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm font-bold outline-none ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsPasswordModalOpen(true);
                }}
                className={`w-full py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center justify-center space-x-2 ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <Lock
                  className={`h-4 w-4 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                />
                <span>Change Account Password</span>
              </button>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className={`w-1/2 py-3.5 rounded-2xl font-bold text-sm transition cursor-pointer ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
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

      {/* Navbar Matching Navbar.tsx & Optimized for Mobile */}
      <nav
        className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 sm:px-8 lg:px-16 py-3.5 flex justify-between items-center shadow-lg transition-all ${
          isDark
            ? "bg-slate-950/90 text-white border-blue-900 shadow-blue-950/50"
            : "bg-blue-600/95 text-white border-blue-400/20 shadow-blue-900/30"
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div
            className={`p-2 rounded-xl border shadow-sm shrink-0 ${
              isDark
                ? "bg-blue-900/60 border-blue-800"
                : "bg-white/15 border-white/25"
            }`}
          >
            <Droplet className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300 fill-cyan-300" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-black tracking-wider text-white">
              AquaWell
            </span>
            <span className="block text-[9px] sm:text-[10px] text-cyan-200 uppercase tracking-widest font-extrabold">
              Customer Portal
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-3 text-sm font-semibold">
          <ThemeToggleButton
            className={`w-10 h-10 sm:w-auto sm:h-auto p-0 sm:p-2.5 rounded-xl border backdrop-blur-md transition cursor-pointer shadow-md flex items-center justify-center shrink-0 ${
              isDark
                ? "bg-blue-900/60 hover:bg-blue-900 text-white border-blue-800"
                : "bg-white/15 hover:bg-white/25 text-white border-white/25"
            }`}
          />
          {/* Profile Button */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className={`w-10 h-10 sm:w-auto sm:h-auto p-0 sm:px-4 sm:py-2 rounded-xl border transition cursor-pointer text-xs sm:text-sm flex items-center justify-center sm:space-x-1.5 shrink-0 ${
              isDark
                ? "bg-blue-900/60 hover:bg-blue-900 text-white border-blue-800"
                : "bg-white/15 hover:bg-white/25 text-white border-white/25"
            }`}
            title={`${firstName} ${lastName}`}
          >
            <User className="h-4 w-4 text-cyan-200 shrink-0" />
            <span className="hidden sm:inline truncate max-w-[120px]">
              {firstName} {lastName}
            </span>
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }}
            className="w-10 h-10 sm:w-auto sm:h-auto p-0 sm:px-4 sm:py-2 text-white hover:bg-rose-600 bg-rose-500 rounded-xl border border-rose-400 transition text-xs sm:text-sm font-bold shadow-md cursor-pointer flex items-center justify-center sm:space-x-1.5 shrink-0"
            title="Logout"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Fluid Content */}
      <main className="flex-1 w-full px-3 sm:px-8 lg:px-12 pt-5 sm:pt-8 pb-12 max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        {/* CONDITIONAL VIEW: IF ORDER CARD IS OPEN */}
        {isOrderModalOpen ? (
          <div
            className={`rounded-[32px] border p-6 sm:p-8 shadow-lg space-y-6 animate-fadeIn max-w-2xl mx-auto w-full ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div
              className={`flex justify-between items-center border-b pb-4 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsOrderModalOpen(false)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h3
                    className={`text-lg sm:text-xl font-black ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    Order Product or Refill
                  </h3>
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Select hardware or refill item, quantity, and pin exact
                    delivery location on map.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Select Product / Item
                </label>
                <select
                  value={selectedProduct}
                  onChange={handleProductChange}
                  className={`w-full px-4 py-3.5 border rounded-2xl text-sm font-bold outline-none cursor-pointer ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  {inventoryProducts.map((prod) => (
                    <option key={prod.id} value={prod.name}>
                      {prod.name} (₱{Number(prod.price).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* SIDE-BY-SIDE QUANTITY & FULFILLMENT TYPE */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className={`w-full px-4 py-3.5 border rounded-2xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Fulfillment Type
                  </label>
                  <select
                    value={fulfillmentType}
                    onChange={(e) => setFulfillmentType(e.target.value)}
                    className={`w-full px-4 py-3.5 border rounded-2xl text-sm font-bold outline-none cursor-pointer ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    <option value="Delivery">Delivery — COD</option>
                    <option value="Pickup">Station Pickup</option>
                  </select>
                </div>
              </div>

              {fulfillmentType === "Delivery" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-3">
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider shrink-0 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Pin Exact Location
                    </label>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>Use My Current Location</span>
                    </button>
                  </div>

                  <div
                    className={`h-64 w-full rounded-2xl overflow-hidden border z-0 ${
                      isDark ? "border-slate-700" : "border-slate-200"
                    }`}
                  >
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
                      className={`w-full px-4 py-3 border rounded-xl text-xs font-bold outline-none mt-1 ${
                        isDark
                          ? "bg-slate-800 border-slate-700 text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                      placeholder="Selected address description..."
                    />
                  </div>
                </div>
              )}

              <div
                className={`p-4 rounded-2xl border flex justify-between items-center ${
                  isDark
                    ? "bg-blue-950/50 border-blue-900/50"
                    : "bg-blue-50 border-blue-100"
                }`}
              >
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Total Computation
                </span>
                <span
                  className={`text-xl font-black ${
                    isDark ? "text-blue-200" : "text-blue-900"
                  }`}
                >
                  ₱{computedTotal.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className={`w-1/2 py-3.5 rounded-2xl font-bold text-sm transition cursor-pointer ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
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
        ) : (
          <>
            {/* Hero Banner */}
            <div
              className={`border rounded-[32px] p-5 sm:p-8 lg:p-10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden ${
                isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <div
                className={`absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full blur-3xl pointer-events-none ${
                  isDark ? "bg-blue-500/10" : "bg-blue-500/5"
                }`}
              ></div>

              <div className="relative z-10 space-y-2">
                <span
                  className={`text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full border ${
                    isDark
                      ? "text-blue-400 bg-blue-950/60 border-blue-900/50"
                      : "text-blue-600 bg-blue-50 border-blue-100"
                  }`}
                >
                  Live Cloud Orders & Map Pinned Deliveries
                </span>
                <h1
                  className={`text-2xl sm:text-4xl font-black tracking-tight ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  Welcome back, {firstName}! 👋
                </h1>
                <p
                  className={`text-xs sm:text-base font-medium max-w-2xl leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Manage your purified water refills and hardware orders, and
                  track your deliveries in real-time.
                </p>
              </div>

              <button
                onClick={handleOpenOrderModal}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center justify-center space-x-2 shrink-0 relative z-10 text-sm sm:text-base"
              >
                <Plus className="h-5 w-5 stroke-[3]" />
                <span>Order Now</span>
              </button>
            </div>

            {/* Section Header & Tab Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2
                  className={`text-lg sm:text-xl font-black tracking-tight ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {orderTab === "active" ? "Active Orders" : "Order History"}
                </h2>
                <p
                  className={`text-xs font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {orderTab === "active"
                    ? "Monitoring active dispatches and COD/pickup orders."
                    : "Archive of previously fulfilled and completed orders."}
                </p>
              </div>

              <div
                className={`flex items-center space-x-1 p-1 rounded-2xl border shadow-sm w-full sm:w-auto ${
                  isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-200"
                }`}
              >
                <button
                  onClick={() => setOrderTab("active")}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    orderTab === "active"
                      ? "bg-blue-600 text-white shadow"
                      : isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Active Orders (
                  {
                    orders.filter(
                      (o) =>
                        o.status !== "Delivered" && o.status !== "DELIVERED",
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() => setOrderTab("history")}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    orderTab === "history"
                      ? "bg-blue-600 text-white shadow"
                      : isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Order History (
                  {
                    orders.filter(
                      (o) =>
                        o.status === "Delivered" || o.status === "DELIVERED",
                    ).length
                  }
                  )
                </button>
              </div>
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
              <div
                className={`rounded-[32px] border p-8 sm:p-12 text-center space-y-4 shadow-sm ${
                  isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-200"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
                    isDark
                      ? "bg-blue-950/50 text-blue-400 border-blue-900/50"
                      : "bg-blue-50 text-blue-600 border-blue-100"
                  }`}
                >
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <h3
                    className={`text-base font-black ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    No{" "}
                    {orderTab === "active" ? "active orders" : "order history"}{" "}
                    found
                  </h3>
                  <p
                    className={`text-xs mt-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
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
                    Order Now
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map((ord, idx) => {
                  const isDelivered =
                    ord.status === "Delivered" || ord.status === "DELIVERED";
                  const isOutForDelivery =
                    ord.status === "Out for Delivery" ||
                    ord.status === "OUT FOR-DELIVERY";
                  const isPending =
                    ord.status === "Pending" || ord.status === "PENDING";
                  const isPaid =
                    ord.paymentStatus.includes("Paid") ||
                    ord.paymentStatus.includes("PAID");

                  return (
                    <div
                      key={idx}
                      className={`rounded-[32px] border p-6 sm:p-8 shadow-sm hover:shadow-md transition space-y-6 flex flex-col justify-between ${
                        isDark
                          ? "bg-slate-900 border-slate-800"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div>
                        <div
                          className={`flex justify-between items-center pb-4 border-b ${
                            isDark ? "border-slate-800" : "border-slate-100"
                          }`}
                        >
                          <span
                            className={`text-xs font-mono font-bold tracking-wider ${
                              isDark ? "text-blue-400" : "text-blue-600"
                            }`}
                          >
                            {ord.id}
                          </span>
                          <span
                            className={`px-3.5 py-1 rounded-full text-xs font-black tracking-wide border ${
                              isDelivered
                                ? isDark
                                  ? "bg-emerald-950/50 text-emerald-300 border-emerald-900/50"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isOutForDelivery
                                  ? isDark
                                    ? "bg-amber-950/50 text-amber-300 border-amber-900/50"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                  : isDark
                                    ? "bg-blue-950/50 text-blue-300 border-blue-900/50"
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
                            <span
                              className={`font-bold uppercase text-xs ${
                                isDark ? "text-slate-500" : "text-slate-400"
                              }`}
                            >
                              Product Variant
                            </span>
                            <span
                              className={`font-bold truncate max-w-[180px] ${
                                isDark ? "text-slate-100" : "text-slate-900"
                              }`}
                            >
                              {ord.variant}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span
                              className={`font-bold uppercase text-xs ${
                                isDark ? "text-slate-500" : "text-slate-400"
                              }`}
                            >
                              Payment Status
                            </span>
                            <span
                              className={`text-xs px-3 py-1 rounded-lg font-black border ${
                                isPaid
                                  ? isDark
                                    ? "bg-purple-950/50 text-purple-300 border-purple-900/50"
                                    : "bg-purple-50 text-purple-700 border-purple-200"
                                  : ord.paymentStatus.includes("Verification")
                                    ? isDark
                                      ? "bg-amber-950/50 text-amber-300 border-amber-900/50"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                    : isDark
                                      ? "bg-rose-950/50 text-rose-300 border-rose-900/50"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {ord.paymentStatus === "UNPAID"
                                ? "COD — UNPAID"
                                : ord.paymentStatus}
                            </span>
                          </div>
                          <div
                            className={`flex justify-between items-center pt-4 border-t ${
                              isDark ? "border-slate-800" : "border-slate-100"
                            }`}
                          >
                            <span
                              className={`font-bold uppercase text-xs ${
                                isDark ? "text-slate-500" : "text-slate-400"
                              }`}
                            >
                              Total Amount
                            </span>
                            <span
                              className={`text-xl font-black ${
                                isDark ? "text-blue-400" : "text-blue-600"
                              }`}
                            >
                              {ord.total}
                            </span>
                          </div>
                        </div>

                        {/* Delivery Pinned Address Badge */}
                        <div
                          className={`flex items-center space-x-2 text-xs p-3 rounded-xl border mt-4 ${
                            isDark
                              ? "bg-blue-950/30 border-blue-900/40 text-slate-300"
                              : "bg-blue-50/50 border-blue-100 text-slate-600"
                          }`}
                        >
                          <MapPin
                            className={`h-4 w-4 shrink-0 ${
                              isDark ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                          <span className="truncate font-semibold">
                            {ord.address}
                          </span>
                        </div>

                        {/* Live Tracking Progress Tracker Component */}
                        <div
                          className={`p-4 rounded-2xl border space-y-3 mt-4 ${
                            isDark
                              ? "bg-slate-800/60 border-slate-800"
                              : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          <div
                            className={`flex justify-between items-center text-[10px] font-black uppercase tracking-wider ${
                              isDark ? "text-slate-500" : "text-slate-400"
                            }`}
                          >
                            <span
                              className={
                                isPending
                                  ? isDark
                                    ? "text-blue-400 font-black"
                                    : "text-blue-600 font-black"
                                  : isDark
                                    ? "text-slate-500"
                                    : "text-slate-400"
                              }
                            >
                              Pending
                            </span>
                            <span
                              className={
                                isOutForDelivery
                                  ? isDark
                                    ? "text-amber-400 font-black"
                                    : "text-amber-600 font-black"
                                  : isDark
                                    ? "text-slate-500"
                                    : "text-slate-400"
                              }
                            >
                              In Transit
                            </span>
                            <span
                              className={
                                isDelivered
                                  ? isDark
                                    ? "text-emerald-400 font-black"
                                    : "text-emerald-600 font-black"
                                  : isDark
                                    ? "text-slate-500"
                                    : "text-slate-400"
                              }
                            >
                              Delivered
                            </span>
                          </div>

                          <div
                            className={`w-full h-2 rounded-full overflow-hidden flex ${
                              isDark ? "bg-slate-700" : "bg-slate-200"
                            }`}
                          >
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

                          <div
                            className={`flex items-center space-x-2 text-xs pt-1 ${
                              isDark ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            <Truck
                              className={`h-4 w-4 shrink-0 ${
                                isDark ? "text-blue-400" : "text-blue-600"
                              }`}
                            />
                            <span className="truncate font-bold">
                              Driver: {ord.rider}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
