import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { supabase } from "../../lib/supabase";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import ThemeToggleButton from "../../components/ThemeToggleButton";
import { useTheme } from "../../context/ThemeContext";
import { friendlyErrorMessage } from "../../lib/userMessages";
import {
  Droplet,
  LogOut,
  X,
  CheckCircle2,
  Receipt,
  UserCheck,
  MapPin,
  Lock,
  Menu,
} from "lucide-react";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"orders" | "sales">("orders");

  const [userRole, setUserRole] = useState<string>("Staff");

  // Orders State (Supabase Synced)
  const [orders, setOrders] = useState<any[]>([]);

  // Inventory State (Supabase Synced)
  const [inventory, setInventory] = useState<any[]>([]);

  // Sales Records State (Supabase Synced)
  const [salesRecords, setSalesRecords] = useState<any[]>([]);

  // Staff Roster for Driver Assignment
  const [staffList, setStaffList] = useState<any[]>([]);

  // Modals
  const [assigningOrder, setAssigningOrder] = useState<any | null>(null);
  const [selectedRider, setSelectedRider] = useState("");
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New Sale Form State
  const [saleCustomer, setSaleCustomer] = useState("Walk-in Customer");
  const [saleProduct, setSaleProduct] = useState("5-Gallon Slim Refill");
  const [saleQty, setSaleQty] = useState(1);
  const [saleMethod] = useState("Cash");

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

  // Fetch Session & Data on Load
  useEffect(() => {
    fetchSessionAndData();
  }, []);

  const fetchSessionAndData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }

    const { data: staffByProfile } = await supabase.from("staff").select("*").eq("profile_id", user.id).maybeSingle();
    const { data: staffByEmail } = staffByProfile ? { data: null } : await supabase.from("staff").select("*").eq("email", user.email || "").maybeSingle();
    const staffData = staffByProfile || staffByEmail;
    const { data: profile } = await supabase.from("profiles").select("role, full_name, email").eq("id", user.id).maybeSingle();
    const role = staffData?.role || profile?.role || user.user_metadata?.role || "staff";
    setUserRole(role);

    if (role.toLowerCase() === "delivery") setActiveTab("orders");

    await Promise.all([
      fetchStaffData(),
      fetchOrders(staffData?.staff_id ?? null, role),
      fetchInventory(),
      fetchSales(),
    ]);
  };

  const fetchStaffData = async () => {
    const { data, error } = await supabase.from("staff").select("*");
    if (!error && data) setStaffList(data);
  };

  const fetchOrders = async (riderId: number | null, role: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("archived", false)
      .order("created_at", { ascending: false });

    if (error) {
      showToast(friendlyErrorMessage(error, "We could not load orders. Please try again."), "error");
      return;
    }

    const orderIds = (data ?? []).map((o: any) => o.id);
    const [itemsResult, profilesResult, staffResult] = await Promise.all([
      orderIds.length
        ? supabase.from("order_items").select("*, inventory(name)").in("order_id", orderIds)
        : Promise.resolve({ data: [], error: null } as any),
      supabase.from("profiles").select("id, full_name, phone"),
      supabase.from("staff").select("staff_id, first_name, last_name"),
    ]);

    const profiles = new Map((profilesResult.data ?? []).map((p: any) => [p.id, p]));
    const staff = new Map((staffResult.data ?? []).map((st: any) => [st.staff_id, st]));
    const itemsByOrder = new Map<string, any[]>();
    for (const item of itemsResult.data ?? []) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    let visible = data ?? [];
    if (role.toLowerCase() === "delivery" && riderId) {
      visible = visible.filter((o: any) => o.rider_id === riderId && !["DELIVERED", "PICKED UP"].includes(o.status));
    }

    setOrders(visible.map((o: any) => {
      const profile = profiles.get(o.customer_id);
      const rider = o.rider_id ? staff.get(o.rider_id) : null;
      const items = itemsByOrder.get(o.id) ?? [];
      const firstItem = items[0];
      return {
        id: o.id,
        customer: profile?.full_name || "Customer",
        variant: firstItem?.inventory?.name || (items.length > 1 ? `${items.length} items` : "Order item"),
        quantity: firstItem?.quantity ?? 1,
        type: o.type,
        address: o.address || "Station Pickup",
        total: Number(o.total),
        status: o.status || "PENDING",
        rider: rider ? `${rider.first_name} ${rider.last_name}` : "Unassigned",
        riderId: o.rider_id ?? null,
        paymentStatus: o.payment_status || "UNPAID",
        archived: o.archived || false,
      };
    }));
  };

  const fetchInventory = async () => {
    const { data, error } = await supabase.from("inventory").select("*");
    if (!error && data) setInventory(data);
  };

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      const formatted = data.map((s: any) => ({
        txId: s.transaction_id,
        customer: s.customer_name,
        item: s.item_name,
        qty: s.quantity,
        total: s.total_amount,
        method: s.payment_method,
        date: s.date,
      }));
      setSalesRecords(formatted);
    }
  };

  const handleAssignRiderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningOrder) return;

    const { error } = await supabase
      .from("orders")
      .update({ rider_id: Number(selectedRider), status: "PENDING" })
      .eq("id", assigningOrder.id);

    if (error) {
      showToast("We could not assign the delivery driver. Please try again.", "error");
    } else {
      setAssigningOrder(null);
      setSelectedRider("");
      showToast(`Delivery driver assigned to order ${assigningOrder.id}.`);
      fetchSessionAndData();
    }
  };

  const handleAcceptDelivery = async (ord: any) => {
    const { error } = await supabase.from("orders").update({ status: "OUT FOR-DELIVERY" }).eq("id", ord.id);
    if (error) { showToast("We could not accept the delivery. Please try again.", "error"); return; }
    showToast(`Delivery ${ord.id} accepted.`);
    fetchSessionAndData();
  };

  const handleRejectDelivery = async (ord: any) => {
    const { error } = await supabase.rpc("reject_delivery_order", { p_order_id: ord.id });
    if (error) { console.error("AquaWell delivery rejection failed:", error); showToast(friendlyErrorMessage(error, "We could not reject the delivery. Please try again."), "error"); return; }
    showToast(`Delivery ${ord.id} was rejected and returned for reassignment.`);
    fetchSessionAndData();
  };

  const handleStatusChange = async (ord: any, nextStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: nextStatus }).eq("id", ord.id);
    if (error) { showToast("We could not update the order status. Please try again.", "error"); return; }
    if ((nextStatus === "DELIVERED" || nextStatus === "PICKED UP") && ord.paymentStatus !== "PAID") {
      const { error: paymentError } = await supabase
        .from("orders")
        .update({ payment_status: "PAID" })
        .eq("id", ord.id);
      if (paymentError) {
        showToast(friendlyErrorMessage(paymentError, "The order was updated, but we could not update the payment status."), "error");
        fetchSessionAndData();
        return;
      }
      await supabase.from("payments").insert({
        order_id: ord.id,
        amount: Number(ord.total),
        payment_method: "Cash",
        payment_status: "PAID",
        paid_at: new Date().toISOString(),
      });
    }
    showToast(`Order ${ord.id} updated successfully.`);
    fetchSessionAndData();
  };

  const handleArchiveOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ archived: true })
      .eq("id", orderId);

    if (error) {
      showToast("We could not archive the order. Please try again.", "error");
    } else {
      showToast(`Order ${orderId} archived successfully.`);
      fetchSessionAndData();
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedInventory = inventory.find((item: any) => item.name === saleProduct);
    const unitPrice = selectedInventory ? Number(selectedInventory.price) : 50;
    const totalAmt = unitPrice * saleQty;
    const txId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase.from("sales").insert([
      {
        transaction_id: txId,
        customer_name: saleCustomer,
        item_name: saleProduct,
        quantity: saleQty,
        total_amount: totalAmt,
        payment_method: saleMethod,
        date: new Date().toISOString().split("T")[0],
      },
    ]);

    if (error) {
      showToast("We could not record the walk-in sale. Please try again.", "error");
    } else {
      setIsRecordSaleOpen(false);
      showToast("Walk-in sale recorded successfully.");
      fetchSales();
    }
  };

  const isDeliveryRider = userRole.toLowerCase() === "delivery";

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden`} data-dashboard="staff">
      {/* Toast notification - always above dialogs */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-[11000] flex items-center space-x-3 text-white px-6 py-4 rounded-2xl shadow-2xl border animate-bounce ${toast.type === "error" ? "bg-rose-900 border-rose-800" : "bg-slate-900 border-slate-800"}`}
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

      {/* Assign Rider Modal */}
      {assigningOrder && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`${isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"} rounded-[28px] sm:rounded-[32px] border shadow-2xl max-w-md w-full p-5 sm:p-8 space-y-5 sm:space-y-6 animate-fadeIn max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center border-b pb-4 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
              <h3 className={`text-base sm:text-lg font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                Assign Rider for {assigningOrder.id}
              </h3>
              <button
                onClick={() => setAssigningOrder(null)}
                className={`${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"} cursor-pointer`}
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
                  className={`w-full px-4 py-3 rounded-2xl text-sm font-bold outline-none cursor-pointer ${isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                >
                  <option value="">-- Choose Rider --</option>
                  {staffList.filter((stf) => String(stf.role).toLowerCase() === "delivery").map((stf) => {
                    const fullName = `${stf.first_name} ${stf.last_name}`;
                    return (
                      <option key={stf.staff_id} value={stf.staff_id}>
                        {fullName} ({stf.role})
                      </option>
                    );
                  })}
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
        <div className="fixed inset-0 z-[2000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`${isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"} rounded-[28px] sm:rounded-[32px] border shadow-2xl max-w-md w-full p-5 sm:p-8 space-y-5 sm:space-y-6 animate-fadeIn max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center border-b pb-4 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
              <h3 className={`text-base sm:text-lg font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                Record Sales Transaction
              </h3>
              <button
                onClick={() => setIsRecordSaleOpen(false)}
                className={`${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"} cursor-pointer`}
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
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/30 ${isDark ? "bg-slate-950 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"}`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Product Item
                </label>
                <select
                  value={saleProduct}
                  onChange={(e) => setSaleProduct(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl text-sm font-bold outline-none cursor-pointer ${isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"}`}
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
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/30 ${isDark ? "bg-slate-950 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Payment
                  </label>
                  <div className={`w-full px-4 py-3 rounded-2xl text-sm font-black border ${isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"}`}>
                    Cash
                  </div>
                  <p className="mt-1.5 text-[10px] font-bold text-slate-400">Staff walk-in sales are recorded as cash only.</p>
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

      {/* Responsive Staff / Delivery Header */}
      <nav className="sticky top-0 z-40 w-full bg-blue-600/95 text-white backdrop-blur-md border-b border-blue-400/20 shadow-lg">
        <div className="relative mx-auto flex min-h-[68px] w-full max-w-[1600px] items-center justify-between gap-2 px-3 py-2.5 sm:px-8 lg:px-12">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-sm sm:h-11 sm:w-11">
              <Droplet className="h-5 w-5 text-cyan-300 sm:h-6 sm:w-6" fill="currentColor" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-base font-black tracking-wide sm:text-xl">AquaWell</span>
              <span className="hidden truncate text-[9px] font-extrabold uppercase tracking-[0.18em] text-cyan-200 sm:block">
                {isDeliveryRider ? "Delivery Rider Portal" : "Staff & Delivery Portal"}
              </span>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            {!isDeliveryRider && (
              <button
                onClick={() => setIsRecordSaleOpen(true)}
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 text-xs font-black text-white shadow transition hover:bg-emerald-600"
              >
                <Receipt className="h-4 w-4" />
                <span>Record Sale</span>
              </button>
            )}
            <ThemeToggleButton className="h-11 w-11 p-3 bg-white/15 hover:bg-white/25 border-white/25 text-white" />
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-4 text-xs font-bold text-white shadow-md transition hover:bg-blue-800"
            >
              <Lock className="h-4 w-4" />
              <span>Password</span>
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-rose-500 px-4 text-xs font-bold text-white shadow-md transition hover:bg-rose-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Compact mobile actions: theme + menu only */}
          <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
            <ThemeToggleButton className="h-10 w-10 p-2.5 bg-white/15 hover:bg-white/25 border-white/25 text-white" />
            <button
              type="button"
              aria-label="Open dashboard menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-md transition hover:bg-blue-800"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className={`absolute right-3 top-[62px] z-[60] w-[min(230px,calc(100vw-24px))] rounded-2xl border p-2 shadow-2xl backdrop-blur-xl sm:hidden ${isDark ? "border-slate-700 bg-slate-900/98" : "border-slate-200 bg-white/98"}`}>
              {!isDeliveryRider && (
                <button
                  onClick={() => { setIsRecordSaleOpen(true); setMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black transition ${isDark ? "text-slate-100 hover:bg-white/10" : "text-slate-800 hover:bg-slate-100"}`}
                >
                  <Receipt className="h-4 w-4 text-emerald-400" />
                  Record Sale
                </button>
              )}
              <button
                onClick={() => { setIsPasswordModalOpen(true); setMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black transition ${isDark ? "text-slate-100 hover:bg-white/10" : "text-slate-800 hover:bg-slate-100"}`}
              >
                <Lock className="h-4 w-4 text-blue-300" />
                Change Password
              </button>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await supabase.auth.signOut();
                  navigate("/");
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black transition ${isDark ? "text-rose-300 hover:bg-rose-500/10" : "text-rose-600 hover:bg-rose-50"}`}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <main className={`flex-1 w-full px-3 sm:px-8 lg:px-12 pt-4 sm:pt-8 pb-10 sm:pb-12 max-w-[1600px] mx-auto space-y-5 sm:space-y-8 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        {!isDeliveryRider && (
          <div className="flex justify-end">
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value as "orders" | "sales")} className="w-full sm:w-auto px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black text-slate-800 dark:text-slate-100 outline-none cursor-pointer shadow-sm">
              <option value="orders">Orders & Dispatch</option>
              <option value="sales">Sales Log</option>
            </select>
          </div>
        )}

        {/* Tab 1: Orders & Delivery Dispatch */}
        {(activeTab === "orders" || isDeliveryRider) && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col items-start justify-between gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <h3 className={`text-lg sm:text-xl font-black ${isDark ? "text-slate-100" : "text-slate-900"} leading-snug`}>
                {isDeliveryRider
                  ? "My Assigned Deliveries"
                  : "Customer Orders & Fulfillment Management"}
              </h3>
              <span className={`text-xs font-bold text-blue-600 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"} px-3 py-1 rounded-xl border shrink-0`}>
                {orders.length} Requests
              </span>
            </div>

            {orders.length === 0 ? (
              <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} rounded-[32px] border p-12 text-center text-slate-400 font-bold text-sm`}>
                No orders found assigned to your route.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {orders.map((ord, idx) => {
                  const isPickup = ord.type?.toLowerCase() === "pickup";

                  // Parse coordinates from order address string if available
                  let lat = 13.1391;
                  let lng = 123.7439;
                  const match = ord.address.match(/\(([^)]+)\)/);
                  if (match && match[1]) {
                    const parts = match[1].split(",");
                    if (parts.length === 2) {
                      const parsedLat = parseFloat(parts[0].trim());
                      const parsedLng = parseFloat(parts[1].trim());
                      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                        lat = parsedLat;
                        lng = parsedLng;
                      }
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between`}
                    >
                      <div className="space-y-3">
                        <div className="flex flex-col items-start gap-2 pb-3 border-b border-slate-800 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-xs font-mono font-bold text-blue-600">
                            {ord.id} ({ord.type})
                          </span>
                          {isDeliveryRider ? (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">{ord.status}</span>
                          ) : (
                            <select value={ord.status} onChange={(e) => handleStatusChange(ord, e.target.value)} className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer outline-none ${isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-800"}`} style={{ colorScheme: isDark ? "dark" : "light" }}>
                              <option value="PENDING">PENDING</option>
                              <option value="READY FOR PICKUP">READY FOR PICKUP</option>
                              <option value="OUT FOR-DELIVERY">OUT FOR-DELIVERY</option>
                              <option value="PICKED UP">PICKED UP</option>
                              <option value="DELIVERED">DELIVERED</option>
                            </select>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-slate-400 font-bold text-xs uppercase">
                              Customer
                            </span>
                            <span className={`max-w-[62%] text-right font-bold break-words ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                              {ord.customer}
                            </span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-slate-400 font-bold text-xs uppercase">
                              Variant
                            </span>
                            <span className={`max-w-[62%] text-right font-bold break-words ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                              {ord.variant} ({ord.quantity})
                            </span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-slate-400 font-bold text-xs uppercase">
                              Total
                            </span>
                            <span className={`font-black ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                              {ord.total}
                            </span>
                          </div>

                          {/* Dynamic Interactive Map Preview & Google Maps Navigation */}
                          {!isPickup && (
                            <div className="space-y-2 pt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase">
                                  Delivery Pinned Location
                                </span>
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
                                >
                                  <span>Open in Google Maps ↗</span>
                                </a>
                              </div>
                              <div className={`relative z-0 h-32 sm:h-36 w-full rounded-2xl overflow-hidden border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                                <MapContainer
                                  center={[lat, lng]}
                                  zoom={15}
                                  style={{ height: "100%", width: "100%" }}
                                  dragging={false}
                                  scrollWheelZoom={false}
                                >
                                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                  <Marker position={[lat, lng]}></Marker>
                                </MapContainer>
                              </div>
                              <div className={`text-[11px] ${isDark ? "text-slate-300 bg-slate-800 border-slate-700" : "text-slate-600 bg-slate-50 border-slate-100"} p-2 rounded-xl border flex items-center space-x-1`}>
                                <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                <span className="truncate font-semibold">
                                  {ord.address}
                                </span>
                              </div>
                            </div>
                          )}

                          {isPickup && (
                            <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2 font-bold">
                              📦 Station Pickup Order (No delivery required)
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                          Driver:{" "}
                          <strong className="text-blue-600">{ord.rider}</strong>
                        </span>

                        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                          {isDeliveryRider && ord.status === "PENDING" && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleRejectDelivery(ord)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-black border border-rose-200 cursor-pointer">Reject</button>
                              <button onClick={() => handleAcceptDelivery(ord)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer">Accept</button>
                            </div>
                          )}
                          {isDeliveryRider && ord.status === "OUT FOR-DELIVERY" && (
                            <button onClick={() => handleStatusChange(ord, "DELIVERED")} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer">Mark Delivered</button>
                          )}
                          {!isDeliveryRider && (
                            <button
                              onClick={() => setAssigningOrder(ord)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-black border border-blue-200 cursor-pointer flex items-center space-x-1"
                            >
                              <UserCheck className="h-3 w-3" />
                              <span>Assign</span>
                            </button>
                          )}

                          {/* Archive button for completed/delivered orders */}
                          {(ord.status === "DELIVERED" ||
                            ord.status === "PICKED UP") &&
                            !isDeliveryRider && (
                              <button
                                onClick={() => handleArchiveOrder(ord.id)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black border border-slate-200 cursor-pointer"
                              >
                                Archive 📁
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Sales Transactions Log (Admin/Staff only) */}
        {activeTab === "sales" && !isDeliveryRider && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h3 className={`text-lg sm:text-xl font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                Recorded Sales Log
              </h3>
              <button
                onClick={() => setIsRecordSaleOpen(true)}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow cursor-pointer"
              >
                + Record New Sale
              </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm overflow-x-auto">
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
                  {salesRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-slate-400"
                      >
                        No sales recorded yet.
                      </td>
                    </tr>
                  ) : (
                    salesRecords.map((txn, idx) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Stack View for Sales Log */}
            <div className="md:hidden space-y-4">
              {salesRecords.length === 0 ? (
                <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} rounded-[32px] border p-12 text-center text-slate-400 font-bold text-sm`}>
                  No sales recorded yet.
                </div>
              ) : (
                salesRecords.map((txn, idx) => (
                  <div
                    key={idx}
                    className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border rounded-[28px] p-5 shadow-sm space-y-3`}
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800 dark:border-slate-800">
                      <span className="text-xs font-mono font-bold text-blue-600">
                        {txn.txId}
                      </span>
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                        {txn.method}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-slate-400 font-bold text-xs uppercase">
                          Customer
                        </span>
                        <span className={`max-w-[62%] text-right font-bold break-words ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {txn.customer}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-slate-400 font-bold text-xs uppercase">
                          Item
                        </span>
                        <span className="font-semibold text-slate-700 text-right max-w-[180px] truncate">
                          {txn.item} ({txn.qty})
                        </span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400 font-bold text-xs uppercase">
                          Total Amount
                        </span>
                        <span className={`font-black ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                          {txn.total}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400 font-bold text-xs uppercase">
                          Date
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {txn.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
