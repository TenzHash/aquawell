import React, { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import ThemeToggleButton from "../../components/ThemeToggleButton";
import { useTheme } from "../../context/ThemeContext";
import { friendlyAuditAction, friendlyErrorMessage, friendlyEventTitle, friendlyNotificationTitle } from "../../lib/userMessages";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  ArrowLeft,
  Droplet,
  Plus,
  Coins,
  Menu,
  X,
  Eye,
  Filter,
  Download,
  CheckCircle,
  Clock,
  Box,
  Truck,
  Settings,
  User,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Search,
  Briefcase,
  Edit3,
  Trash2,
  UserCheck,
  Receipt,
  FileText,
  Calendar,
  Activity,
  Mail,
  AlertTriangle,
  Command,
  Bell,
  Check,
  Lock,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "orders" | "products" | "reports" | "customers" | "staff"
  >("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ================= MODULE FILTERS STATE =================
  const [orderFilter, setOrderFilter] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");

  const [productFilter, setProductFilter] = useState("All");
  const [productSearch, setProductSearch] = useState("");

  const [customerSearch, setCustomerSearch] = useState("");

  const [staffFilter, setStaffFilter] = useState("All");
  const [staffSearch, setStaffSearch] = useState("");

  // Global Command Palette / Quick Search State
  const [globalSearch, setGlobalSearch] = useState("");

  // ================= CONFIRMATION MODAL STATE =================
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // ================= NOTIFICATIONS STATE & SUPABASE SYNC =================
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setNotifications(
        data.map((notification: any) => ({
          ...notification,
          friendlyTitle: friendlyNotificationTitle(String(notification.title || "")),
          friendlyDescription: friendlyAuditAction(notification.description || "Activity recorded."),
        })),
      );
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllNotificationsAsRead = async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ unread: false })
      .eq("unread", true);

    if (!error) {
      fetchNotifications();
    }
  };

  // Helper for dynamic relative notification timestamps
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "Just now";
    const diffMinutes = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / 60000,
    );
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Customer Order History Modal State
  const [viewingCustomerHistory, setViewingCustomerHistory] = useState<
    any | null
  >(null);

  // Sales Report Filtering State
  const [reportType, setReportType] = useState<"sales" | "inventory">("sales");
  const [reportDateRange, setReportDateRange] = useState("This Month");

  // ================= ADMIN PROFILE & STATION SETTINGS STATES =================
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeSubView, setActiveSubView] = useState<
    "profile" | "settings" | null
  >(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [adminProfileId, setAdminProfileId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("Terrenze Josh Binamira");
  const [adminEmail, setAdminEmail] = useState("admin@aquawell.com");
  const [stationName, setStationName] = useState("Albay Station");
  const [stationPhone, setStationPhone] = useState("+63 912 345 6789");

  // ================= AUDIT LOGS & DUAL NOTIFICATION SYNC =================
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchAuditLogs = async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAuditLogs(
        data.map((log: any) => ({
          id: log.id,
          action: friendlyAuditAction(log.action),
          user_name: log.user_name,
          timestamp: formatTimeAgo(log.created_at),
        })),
      );
    }
  };

  const addAuditLog = async (user: string, action: string, type: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id ?? null;
    const nowIso = new Date().toISOString();

    // 1. Insert into audit_logs table
    await supabase.from("audit_logs").insert({
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_name: user || adminName || "Administrator",
      action,
      log_type: type,
      timestamp: nowIso,
      user_id: userId,
    });

    // 2. Simultaneously insert into notifications table with unread: true
    await supabase.from("notifications").insert({
      title: friendlyEventTitle(type),
      description: `${user || adminName || "Administrator"} ${friendlyAuditAction(action)}`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      unread: true,
      created_at: nowIso,
    });

    fetchAuditLogs();
    fetchNotifications();
  };

  // ================= TOAST NOTIFICATION STATE =================
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const fetchAdminProfile = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      const user = sessionData.session.user;
      setAdminProfileId(user.id);
      setAdminEmail(user.email || "admin@aquawell.com");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data || String(data.role).toLowerCase() !== "admin") {
        await supabase.auth.signOut();
        navigate("/login");
        return;
      }

      if (!error && data) {
        setAdminName(data.full_name || "Terrenze Josh Binamira");
        if (data.address) setStationName(data.address);
        if (data.phone) setStationPhone(data.phone);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!adminProfileId) {
      showToast("Your session has expired. Please sign in again.", "error");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: adminName,
        phone: stationPhone,
        address: stationName,
      })
      .eq("id", adminProfileId);

    if (error) {
      showToast("We could not save your profile changes. Please try again.", "error");
    } else {
      setActiveSubView(null);
      setIsProfileMenuOpen(false);
      addAuditLog(
        adminName,
        "Updated admin account profile details",
        "profile",
      );
      showToast("Your profile was updated successfully.", "success");
      fetchAdminProfile();
    }
  };

  const handleSaveSettings = async () => {
    if (!adminProfileId) {
      showToast("Your session has expired. Please sign in again.", "error");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        address: stationName,
        phone: stationPhone,
      })
      .eq("id", adminProfileId);

    if (error) {
      showToast("We could not save the station settings. Please try again.", "error");
    } else {
      setActiveSubView(null);
      setIsProfileMenuOpen(false);
      addAuditLog(
        adminName,
        `Updated station settings for ${stationName}`,
        "settings",
      );
      showToast("Station settings saved successfully.", "success");
      fetchAdminProfile();
    }
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
        setActiveSubView(null);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= VALIDATION HELPERS =================
  const validatePhoneNumber = (phone: string) => {
    const phPattern = /^(09|\+639)\d{9}$/;
    return phPattern.test(phone.replace(/\s+/g, ""));
  };

  const validateName = (name: string) => {
    const namePattern = /^[A-Za-zÀ-ÿ\s.-]+$/;
    return namePattern.test(name.trim());
  };

  // ================= 1. SALES TRANSACTION STATE & SUPABASE SYNC =================
  const [salesRecords, setSalesRecords] = useState<any[]>([]);

  const fetchSalesRecords = async () => {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      showToast("We could not load sales records. Please try again.", "error");
    } else if (data) {
      const formattedSales = data.map((s: any) => ({
        TransactionID: s.transaction_id,
        CustomerName: s.customer_name,
        ItemName: s.item_name,
        Quantity: s.quantity,
        TotalAmount: s.total_amount,
        PaymentMethod: s.payment_method,
        Date: s.date,
      }));
      setSalesRecords(formattedSales);
    }
  };

  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [saleCustomer, setSaleCustomer] = useState("Walk-in Customer");
  const [saleProduct, setSaleProduct] = useState(
    "5-Gallon Purified Water Refill",
  );
  const [saleQuantity, setSaleQuantity] = useState("1");
  const [saleAmount, setSaleAmount] = useState("50.00");
  const [salePaymentMethod, setSalePaymentMethod] = useState("Cash");

  const handleRecordSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(saleCustomer)) {
      showToast(
        "Buyer name cannot contain numbers or invalid symbols!",
        "error",
      );
      return;
    }

    const txId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const { error } = await supabase.from("sales").insert([
      {
        transaction_id: txId,
        customer_name: saleCustomer,
        item_name: saleProduct,
        quantity: Number(saleQuantity),
        total_amount: Number(saleAmount),
        payment_method: salePaymentMethod,
        date: new Date().toISOString().split("T")[0],
      },
    ]);

    if (error) {
      showToast("We could not record the sale. Please try again.", "error");
    } else {
      setIsRecordSaleOpen(false);
      setSaleCustomer("Walk-in Customer");
      setSaleQuantity("1");
      setSaleAmount("50.00");
      addAuditLog(
        adminName,
        `Recorded sales transaction ${txId} for ${saleCustomer}`,
        "sale",
      );
      showToast("Sale recorded successfully.", "success");
      fetchSalesRecords();
    }
  };

  // ================= 2. STAFF & DRIVERS STATE & SUPABASE SYNC =================
  const [staffList, setStaffList] = useState<any[]>([]);

  const fetchStaffList = async () => {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("staff_id", { ascending: true });
    if (error) {
      showToast("We could not load the staff list. Please try again.", "error");
    } else if (data) {
      const formattedStaff = data.map((stf: any) => ({
        StaffID: stf.staff_id,
        LastName: stf.last_name,
        FirstName: stf.first_name,
        MiddleName: stf.middle_name || "",
        Suffix: stf.suffix || "",
        Role: stf.role,
        ContactNumber: stf.contact_number,
        Email: stf.email,
      }));
      setStaffList(formattedStaff);
    }
  };

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState<any | null>(
    null,
  );
  const [newStaffFirstName, setNewStaffFirstName] = useState("");
  const [newStaffLastName, setNewStaffLastName] = useState("");
  const [newStaffMiddleName, setNewStaffMiddleName] = useState("");
  const [newStaffSuffix, setNewStaffSuffix] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Delivery");
  const [newStaffContact, setNewStaffContact] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [createdStaffCredentials, setCreatedStaffCredentials] = useState<{ email: string; password: string; role: string } | null>(null);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(newStaffFirstName) || !validateName(newStaffLastName)) {
      showToast("Staff names cannot contain numbers or invalid symbols!", "error");
      return;
    }
    if (!validatePhoneNumber(newStaffContact)) {
      showToast("Invalid Philippine mobile number format! Use 09XXXXXXXXX or +639XXXXXXXXX", "error");
      return;
    }

    if (editingStaff) {
      if (editingStaff.ProfileID && newStaffEmail.trim().toLowerCase() !== String(editingStaff.Email || "").trim().toLowerCase()) {
        const { data: authUpdate, error: authUpdateError } = await supabase.functions.invoke("update-user-email", {
          body: { user_id: editingStaff.ProfileID, email: newStaffEmail.trim().toLowerCase() },
        });
        if (authUpdateError || !authUpdate?.success) {
          showToast(friendlyErrorMessage(authUpdate?.error || authUpdateError, "We could not update the staff login email. Please try again."), "error");
          return;
        }
      }
      const { error } = await supabase.from("staff").update({
        first_name: newStaffFirstName, last_name: newStaffLastName, middle_name: newStaffMiddleName, suffix: newStaffSuffix,
        role: newStaffRole, contact_number: newStaffContact, email: newStaffEmail.trim(),
      }).eq("staff_id", editingStaff.StaffID);
      if (error) showToast("We could not update the staff member. Please try again.", "error");
      else {
        addAuditLog(adminName, `Updated staff member: ${newStaffFirstName} ${newStaffLastName} (${newStaffRole})`, "staff");
        showToast("Staff member updated successfully.", "success");
        fetchStaffList();
      }
    } else {
      const tempPassword = newStaffPassword || `AquaWell@${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: staffResult, error: staffAuthError } = await supabase.functions.invoke("create-staff-user", {
        body: { email: newStaffEmail.trim().toLowerCase(), password: tempPassword, first_name: newStaffFirstName, middle_name: newStaffMiddleName || null, last_name: newStaffLastName, suffix: newStaffSuffix || null, role: newStaffRole, contact_number: newStaffContact },
      });
      if (staffAuthError || !staffResult?.success) {
        showToast(friendlyErrorMessage(staffResult?.error || staffAuthError, "We could not create the staff account. Please try again."), "error");
        return;
      }
      addAuditLog(adminName, `Added new staff member: ${newStaffFirstName} ${newStaffLastName} (${newStaffRole})`, "staff");
      setCreatedStaffCredentials({ email: newStaffEmail.trim().toLowerCase(), password: tempPassword, role: newStaffRole });
      showToast("Staff account created successfully.", "success");
      fetchStaffList();
    }

    setIsAddStaffOpen(false);
    setEditingStaff(null);
    setNewStaffFirstName("");
    setNewStaffLastName("");
    setNewStaffMiddleName("");
    setNewStaffSuffix("");
    setNewStaffRole("Delivery");
    setNewStaffContact("");
    setNewStaffEmail("");
    setNewStaffPassword("");
  };

  const handleOpenEditStaff = (stf: any) => {
    setEditingStaff(stf);
    setNewStaffFirstName(stf.FirstName);
    setNewStaffLastName(stf.LastName);
    setNewStaffMiddleName(stf.MiddleName || "");
    setNewStaffSuffix(stf.Suffix || "");
    setNewStaffRole(stf.Role);
    setNewStaffContact(stf.ContactNumber);
    setNewStaffEmail(stf.Email || "");
    setIsAddStaffOpen(true);
  };

  const confirmDeleteStaff = (stf: any) => {
    const id = Number(stf?.StaffID);
    if (!id) {
      showToast("We could not identify that staff member. Please refresh and try again.", "error");
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: "Delete Staff Member",
      message:
        "This will remove the staff/delivery login and application profile. Assigned orders and sales history will be preserved. Continue?",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        const { data, error } = await supabase.functions.invoke("delete-user", {
          body: { user_id: stf.ProfileID || undefined, staff_id: id },
        });
        if (error || !data?.success) {
          showToast(friendlyErrorMessage(data?.error || error, "We could not remove the staff account. Please try again."), "error");
          return;
        }
        await addAuditLog(adminName, `Removed staff member ID ${id}`, "staff");
        showToast("Staff account and linked login removed. Historical records were preserved.", "success");
        fetchStaffList();
      },
    });
  };

  // ================= 3. ORDERS STATE & SUPABASE SYNC =================
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    const { data: orderData, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showToast("We could not load orders. Please try again.", "error");
      return;
    }

    const orderIds = (orderData ?? []).map((o: any) => o.id);
    const [itemsResult, profilesResult, staffResult] = await Promise.all([
      orderIds.length
        ? supabase
            .from("order_items")
            .select("*, inventory(name)")
            .in("order_id", orderIds)
        : Promise.resolve({ data: [], error: null } as any),
      supabase.from("profiles").select("id, full_name, email, phone"),
      supabase.from("staff").select("staff_id, first_name, last_name"),
    ]);

    const profiles = new Map(
      (profilesResult.data ?? []).map((p: any) => [p.id, p]),
    );
    const staff = new Map(
      (staffResult.data ?? []).map((st: any) => [st.staff_id, st]),
    );
    const itemsByOrder = new Map<string, any[]>();

    for (const item of itemsResult.data ?? []) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    setOrders(
      (orderData ?? []).map((o: any) => {
        const profile = profiles.get(o.customer_id);
        const rider = o.rider_id ? staff.get(o.rider_id) : null;
        const items = itemsByOrder.get(o.id) ?? [];
        const firstItem = items[0];
        const customerName = profile?.full_name || "Customer";
        const riderName = rider ? `${rider.first_name} ${rider.last_name}` : "";

        return {
          id: o.id,
          customer: customerName,
          phone: profile?.phone || "N/A",
          type: o.type,
          itemName:
            firstItem?.inventory?.name ||
            (items.length > 1 ? `${items.length} items` : "Order item"),
          quantity: firstItem?.quantity ?? 1,
          date: new Date(o.created_at).toLocaleDateString(),
          total: Number(o.total),
          status: o.status,
          rider: riderName,
          riderId: o.rider_id ?? null,
          paymentStatus: o.payment_status || "UNPAID",
          referenceNo: o.reference_no || "",
          receiptUrl: o.receipt_url || "",
          address: o.address || "Station Pickup",
        };
      }),
    );
  };

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<any | null>(null);
  const [selectedRiderName, setSelectedRiderName] = useState("");

  const handleAssignRiderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningOrder) return;

    const rider = staffList.find(
      (staff: any) =>
        `${staff.FirstName} ${staff.LastName}` === selectedRiderName,
    );

    if (!rider) {
      showToast("Please select a valid delivery rider", "error");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ rider_id: rider.StaffID, status: "PENDING" })
      .eq("id", assigningOrder.id);

    if (error) {
      showToast("We could not assign the delivery driver. Please try again.", "error");
    } else {
      addAuditLog(
        adminName,
        `Assigned driver ${selectedRiderName} to order ${assigningOrder.id}`,
        "assignment",
      );
      showToast(
        `Successfully assigned ${selectedRiderName} to order ${assigningOrder.id}`,
        "success",
      );
      setAssigningOrder(null);
      setSelectedRiderName("");
      fetchOrders();
    }
  };

  const confirmDeleteOrder = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Order Record",
      message: `Are you sure you want to delete order ${id}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        const { error } = await supabase
          .from("orders")
          .update({ archived: true })
          .eq("id", id);
        if (error) {
          showToast(friendlyErrorMessage(error, "We could not archive the order. Please try again."), "error");
        } else {
          addAuditLog(adminName, `Archived order record ${id}`, "archive");
          showToast(`Order ${id} archived successfully`, "success");
          fetchOrders();
        }
      },
    });
  };

  const handleOrderStatusChange = async (id: string, nextStatus: string) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;
    const { error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", id);
    if (error) {
      showToast("We could not update the order status. Please try again.", "error");
      return;
    }
    if (
      (nextStatus === "DELIVERED" || nextStatus === "PICKED UP") &&
      target.paymentStatus !== "PAID"
    ) {
      await supabase
        .from("orders")
        .update({ payment_status: "PAID" })
        .eq("id", id);
      await supabase.from("payments").insert({
        order_id: id,
        amount: Number(target.total),
        payment_method: "Cash",
        payment_status: "PAID",
        paid_at: new Date().toISOString(),
      });
    }
    await addAuditLog(
      adminName,
      `Order ${id} status changed to ${nextStatus}`,
      "status",
    );
    fetchOrders();
  };

  const handlePaymentStatusChange = async (id: string, nextPay: string) => {
    const target = orders.find((o) => o.id === id);
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: nextPay })
      .eq("id", id);
    if (error) {
      showToast("We could not update the payment status. Please try again.", "error");
      return;
    }
    if (nextPay === "PAID") {
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("payment_id")
        .eq("order_id", id)
        .eq("payment_status", "PAID")
        .limit(1)
        .maybeSingle();
      if (!existingPayment) {
        const { error: paymentError } = await supabase.from("payments").insert({
          order_id: id,
          amount: Number(target?.total || 0),
          payment_method: "Cash",
          payment_status: "PAID",
          paid_at: new Date().toISOString(),
        });
        if (paymentError) {
          showToast(friendlyErrorMessage(paymentError, "Payment status was saved, but we could not finish the payment record."), "error");
          return;
        }
      }
    }
    await addAuditLog(
      adminName,
      `Updated payment status for ${id} to ${nextPay}`,
      "payment",
    );
    fetchOrders();
  };

  // ================= 4. PRODUCTS STATE & SUPABASE SYNC =================
  const [products, setProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      showToast("We could not load inventory. Please try again.", "error");
    } else if (data) {
      const formattedProducts = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: `₱${Number(p.price).toFixed(2)}`,
        stock: p.stock,
        minStock: p.min_stock,
        status: p.stock <= p.min_stock ? "Low Stock" : "In Stock",
      }));
      setProducts(formattedProducts);
    }
  };

  // Trigger initial database sync & real-time subscriptions on load
  useEffect(() => {
    fetchAdminProfile();
    fetchOrders();
    fetchProducts();
    fetchStaffList();
    fetchCustomers();
    fetchSalesRecords();
    fetchAuditLogs();
    fetchNotifications();

    // Supabase Realtime subscription for incoming orders and low stocks
    const notifChannel = supabase
      .channel("public:all_operations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          fetchOrders();
          await addAuditLog(
            "System",
            `Received new order ${payload.new.id}`,
            "order",
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "inventory" },
        async (payload) => {
          fetchProducts();
          if (payload.new.stock <= payload.new.min_stock) {
            await addAuditLog(
              "System",
              `Low stock alert for ${payload.new.name} (${payload.new.stock} left)`,
              "inventory",
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
    };
  }, []);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Refill");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdMinStock, setNewProdMinStock] = useState("10");

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(newProdPrice);
    const stockNum = Number(newProdStock);
    const minStockNum = Number(newProdMinStock);

    if (editingProduct) {
      const { error } = await supabase
        .from("inventory")
        .update({
          name: newProdName,
          category: newProdCategory,
          price: priceNum,
          stock: stockNum,
          min_stock: minStockNum,
        })
        .eq("id", editingProduct.id);

      if (error) {
        showToast("We could not update the product. Please try again.", "error");
      } else {
        addAuditLog(
          adminName,
          `Updated inventory item: ${newProdName}`,
          "inventory",
        );
        showToast("Product updated successfully.", "success");
        fetchProducts();
      }
    } else {
      const { error } = await supabase.from("inventory").insert([
        {
          name: newProdName,
          category: newProdCategory,
          price: priceNum,
          stock: stockNum,
          min_stock: minStockNum,
        },
      ]);

      if (error) {
        showToast("We could not add the product. Please try again.", "error");
      } else {
        addAuditLog(
          adminName,
          `Added new product to inventory: ${newProdName}`,
          "inventory",
        );
        showToast("Product added successfully.", "success");
        fetchProducts();
      }
    }

    setIsAddProductOpen(false);
    setEditingProduct(null);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdStock("");
    setNewProdMinStock("10");
  };

  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setNewProdName(prod.name);
    setNewProdCategory(prod.category);
    setNewProdPrice(prod.price.replace("₱", ""));
    setNewProdStock(prod.stock);
    setNewProdMinStock(prod.minStock || 10);
    setIsAddProductOpen(true);
  };

  const confirmDeleteProduct = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product",
      message:
        "Are you sure you want to remove this item from inventory? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        const { error } = await supabase
          .from("inventory")
          .delete()
          .eq("id", id);
        if (error) {
          showToast("We could not remove the product. Please try again.", "error");
        } else {
          addAuditLog(
            adminName,
            `Removed inventory item ID ${id}`,
            "inventory",
          );
          showToast("Product removed successfully.", "success");
          fetchProducts();
        }
      },
    });
  };

  // ================= 5. CUSTOMERS STATE & SUPABASE SYNC =================
  const [customers, setCustomers] = useState<any[]>([]);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("customer_id", { ascending: false });

    if (error) {
      showToast("We could not load the customer list. Please try again.", "error");
      return;
    }

    const profileIds = (data ?? [])
      .map((cust: any) => cust.profile_id)
      .filter(Boolean);
    const { data: profileRows } = profileIds.length
      ? await supabase.from("profiles").select("id, barangay").in("id", profileIds)
      : { data: [] as any[] };
    const barangayByProfile = new Map(
      (profileRows ?? []).map((profile: any) => [profile.id, profile.barangay || ""]),
    );

    setCustomers(
      (data ?? []).map((cust: any) => ({
        CustomerID: cust.customer_id,
        ProfileID: cust.profile_id,
        LastName: cust.last_name,
        FirstName: cust.first_name,
        MiddleName: cust.middle_name || "",
        Suffix: cust.suffix || "",
        Address: cust.address,
        Barangay: barangayByProfile.get(cust.profile_id) || "",
        ContactNumber: cust.contact_number,
        Email: cust.email,
      })),
    );
  };

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [newCustFirstName, setNewCustFirstName] = useState("");
  const [newCustLastName, setNewCustLastName] = useState("");
  const [newCustMiddleName, setNewCustMiddleName] = useState("");
  const [newCustSuffix, setNewCustSuffix] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustBarangay, setNewCustBarangay] = useState("");
  const [newCustContact, setNewCustContact] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [createdCustomerCredentials, setCreatedCustomerCredentials] = useState<{ email: string; password: string; role?: string } | null>(null);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(newCustFirstName) || !validateName(newCustLastName)) {
      showToast(
        "Customer names cannot contain numbers or invalid symbols!",
        "error",
      );
      return;
    }
    if (!validatePhoneNumber(newCustContact)) {
      showToast(
        "Invalid Philippine mobile number format! Use 09XXXXXXXXX or +639XXXXXXXXX",
        "error",
      );
      return;
    }
    if (!editingCustomer && !newCustMiddleName.trim()) {
      showToast("Middle name is required when creating a customer account.", "error");
      return;
    }
    if (!editingCustomer && !newCustBarangay.trim()) {
      showToast("Barangay is required when creating a customer account.", "error");
      return;
    }

    const fullName =
      `${newCustFirstName} ${newCustMiddleName ? `${newCustMiddleName} ` : ""}${newCustLastName}${newCustSuffix ? ` ${newCustSuffix}` : ""}`.trim();

    if (editingCustomer) {
      // --- EDIT EXISTING CUSTOMER ---
      const profileId = editingCustomer.ProfileID;
      if (profileId && newCustEmail.trim().toLowerCase() !== String(editingCustomer.Email || "").trim().toLowerCase()) {
        const { data: authUpdate, error: authUpdateError } = await supabase.functions.invoke("update-user-email", {
          body: { user_id: profileId, email: newCustEmail.trim().toLowerCase() },
        });
        if (authUpdateError || !authUpdate?.success) {
          showToast(friendlyErrorMessage(authUpdate?.error || authUpdateError, "We could not update the customer email. Please try again."), "error");
          return;
        }
      }
      if (profileId) {
        const { error: profError } = await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            email: newCustEmail,
            phone: newCustContact,
            address: newCustAddress,
            barangay: newCustBarangay.trim() || undefined,
          })
          .eq("id", profileId);
        if (profError) {
          showToast(friendlyErrorMessage(profError, "We could not update the customer profile. Please try again."), "error");
          return;
        }
      }

      const { error: customerError } = await supabase
        .from("customers")
        .update({
          first_name: newCustFirstName,
          middle_name: newCustMiddleName || null,
          last_name: newCustLastName,
          suffix: newCustSuffix || null,
          address: newCustAddress,
          contact_number: newCustContact,
          email: newCustEmail,
        })
        .eq("customer_id", editingCustomer.CustomerID);

      if (customerError) {
        showToast(
          friendlyErrorMessage(customerError, "We could not update the customer. Please try again."),
          "error",
        );
        return;
      }

      await addAuditLog(
        adminName,
        `Updated customer profile: ${fullName}`,
        "customer",
      );
      showToast("Customer account updated successfully.");
    } else {
      // --- CREATE NEW CUSTOMER AUTH ACCOUNT + DATABASE RECORD ---
      const tempPassword = `AquaWell@${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: createdCustomer, error: createError } = await supabase.functions.invoke("create-customer-user", {
        body: {
          email: newCustEmail.trim().toLowerCase(),
          password: tempPassword,
          first_name: newCustFirstName,
          last_name: newCustLastName,
          middle_name: newCustMiddleName || null,
          suffix: newCustSuffix || null,
          contact_number: newCustContact,
          address: newCustAddress,
          barangay: newCustBarangay.trim(),
        },
      });

      if (createError || !createdCustomer?.success) {
        showToast(friendlyErrorMessage(createdCustomer?.error || createError, "We could not create the customer account. Please try again."), "error");
        return;
      }

      setCreatedCustomerCredentials({
        email: createdCustomer.email || newCustEmail.trim().toLowerCase(),
        password: createdCustomer.temporary_password || tempPassword,
      });
      await addAuditLog(
        adminName,
        `Registered new customer account: ${fullName} (${newCustEmail})`,
        "customer",
      );
      showToast("Customer account created successfully.", "success");
    }

    fetchCustomers();
    setIsAddCustomerOpen(false);
    setEditingCustomer(null);
    setNewCustFirstName("");
    setNewCustLastName("");
    setNewCustMiddleName("");
    setNewCustSuffix("");
    setNewCustAddress("");
    setNewCustBarangay("");
    setNewCustContact("");
    setNewCustEmail("");
  };

  const handleOpenEditCustomer = (cust: any) => {
    setEditingCustomer(cust);
    setNewCustFirstName(cust.FirstName);
    setNewCustLastName(cust.LastName);
    setNewCustMiddleName(cust.MiddleName || "");
    setNewCustSuffix(cust.Suffix || "");
    setNewCustAddress(cust.Address);
    setNewCustBarangay(cust.Barangay || "");
    setNewCustContact(cust.ContactNumber);
    setNewCustEmail(cust.Email);
    setIsAddCustomerOpen(true);
  };

  const handleAdminResetPassword = async (account: any, roleLabel: string) => {
    const email = String(account?.Email || account?.email || "").trim().toLowerCase();
    if (!email) { showToast("This account has no login email.", "error"); return; }
    const { data, error } = await supabase.functions.invoke("admin-reset-user-password", { body: { email } });
    if (error || !data?.success) { showToast(friendlyErrorMessage(data?.error || error, "We could not reset the account password. Please try again."), "error"); return; }
    setCreatedCustomerCredentials({ email, password: data.temporary_password, role: roleLabel });
    showToast(`${roleLabel} password reset successfully.`, "success");
  };

  const repairAuthLogin = async (profileId: string | null | undefined, label: string) => {
    if (!profileId) {
      showToast(`No linked Auth profile found for this ${label.toLowerCase()}.`, "error");
      return;
    }
    const { data, error } = await supabase.functions.invoke("repair-user-login", {
      body: { user_id: profileId },
    });
    if (error || !data?.success) {
      showToast(friendlyErrorMessage(data?.error || error, "We could not restore this login. Please try again."), "error");
      return;
    }
    showToast(`${label} login repaired. The account is now confirmed and can sign in.`, "success");
  };

  const confirmDeleteCustomer = (cust: any) => {
    if (!cust.CustomerID) {
      showToast("Error: Invalid customer ID", "error");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Delete Customer Account",
      message: `This will remove ${cust.FirstName} ${cust.LastName}'s login and application profile. Orders, payments, sales, and audit history will be preserved. Continue?`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        const { data, error } = await supabase.functions.invoke("delete-user", {
          body: { user_id: cust.ProfileID || undefined, customer_id: cust.CustomerID },
        });

        if (error || !data?.success) {
          showToast(
            friendlyErrorMessage(data?.error || error, "We could not remove the customer account. Please try again."),
            "error",
          );
          return;
        }

        await addAuditLog(
          adminName,
          `Removed customer account ${cust.CustomerID}`,
          "customer",
        );
        showToast("Customer account and linked login removed. Historical records were preserved.", "success");
        fetchCustomers();
      },
    });
  };

  // ================= FILTERED COMPUTED DATA =================
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.itemName.toLowerCase().includes(orderSearch.toLowerCase());

    if (orderFilter === "All") return matchesSearch;
    if (orderFilter === "Delivery")
      return matchesSearch && o.type.toLowerCase() === "delivery";
    if (orderFilter === "Pending")
      return matchesSearch && o.status.toLowerCase() === "pending";
    if (orderFilter === "Delivered")
      return matchesSearch && o.status.toLowerCase() === "delivered";
    return matchesSearch;
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(productSearch.toLowerCase());
    if (productFilter === "All") return matchesSearch;
    if (productFilter === "Refill")
      return matchesSearch && p.category.toLowerCase() === "refill";
    if (productFilter === "Hardware")
      return matchesSearch && p.category.toLowerCase() === "hardware";
    if (productFilter === "Low Stock")
      return matchesSearch && p.stock <= p.minStock;
    return matchesSearch;
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.FirstName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.LastName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.Email.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  const filteredStaff = staffList.filter((s) => {
    const fullName = `${s.FirstName} ${s.LastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(staffSearch.toLowerCase()) ||
      s.Email.toLowerCase().includes(staffSearch.toLowerCase());
    if (staffFilter === "All") return matchesSearch;
    return matchesSearch && s.Role.toLowerCase() === staffFilter.toLowerCase();
  });

  // Weighted Moving Average (WMA) analysis based on actual sales records.
  const [forecastPeriod, setForecastPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const forecastAnalysis = useMemo(() => {
    const buckets = new Map<string, number>();
    const toKey = (dateText: string) => {
      const date = new Date(`${dateText}T00:00:00`);
      if (forecastPeriod === "monthly")
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (forecastPeriod === "weekly") {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        return d.toISOString().slice(0, 10);
      }
      return dateText;
    };
    salesRecords.forEach((sale) => {
      const key = toKey(String(sale.Date));
      buckets.set(key, (buckets.get(key) || 0) + Number(sale.TotalAmount || 0));
    });
    const periods = Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-3);
    const values = periods.map(([, value]) => value);
    const weights = [1, 2, 3];
    const padded = [0, ...values].slice(-3);
    const forecast =
      padded.reduce((sum, value, index) => sum + value * weights[index], 0) / 6;
    const previous = values.length > 1 ? values[values.length - 2] : 0;
    const latest = values[values.length - 1] || 0;
    const trend =
      latest > previous
        ? "Increasing"
        : latest < previous
          ? "Decreasing"
          : "Stable";
    return { periods, values, forecast, trend, latest, previous };
  }, [salesRecords, forecastPeriod]);

  const forecastList = [
    {
      ForecastID: `WMA-${forecastPeriod.toUpperCase()}`,
      ProductName: `Total Sales (${forecastPeriod})`,
      ForecastDate: new Date().toISOString().split("T")[0],
      ForecastedDemand: forecastAnalysis.forecast,
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-row font-sans selection:bg-blue-500 selection:text-white relative transition-colors ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-950"
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
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-bold tracking-wide">
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

      {/* ================= UNIVERSAL CONFIRMATION MODAL ================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-[32px] border shadow-2xl max-w-sm w-full p-6 sm:p-8 space-y-6 animate-fadeIn ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-2xl border ${
                  isDark
                    ? "bg-rose-950/50 border-rose-900/50 text-rose-400"
                    : "bg-rose-50 border-rose-100 text-rose-600"
                }`}
              >
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3
                  className={`text-lg font-black ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {confirmModal.title}
                </h3>
              </div>
            </div>

            <p
              className={`text-xs sm:text-sm font-medium ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {confirmModal.message}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                className={`w-1/2 py-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="w-1/2 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-500/20 transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Customer Order History Modal */}
      {viewingCustomerHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-[32px] border shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-fadeIn ${
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
              <div>
                <h3
                  className={`text-lg sm:text-xl font-black ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  Customer Order History
                </h3>
                <p
                  className={`text-xs font-bold ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {viewingCustomerHistory.FirstName}{" "}
                  {viewingCustomerHistory.LastName}{" "}
                  {viewingCustomerHistory.Suffix} (
                  {viewingCustomerHistory.Email})
                </p>
              </div>
              <button
                onClick={() => setViewingCustomerHistory(null)}
                className={`text-sm font-bold ${
                  isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border flex justify-between items-center ${
                  isDark
                    ? "bg-blue-950/50 border-blue-900/50"
                    : "bg-blue-50 border-blue-100"
                }`}
              >
                <div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider block ${
                      isDark ? "text-blue-400" : "text-blue-500"
                    }`}
                  >
                    Account Status
                  </span>
                  <span
                    className={`text-xl sm:text-2xl font-black ${
                      isDark ? "text-blue-100" : "text-blue-900"
                    }`}
                  >
                    Active
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider block ${
                      isDark ? "text-blue-400" : "text-blue-500"
                    }`}
                  >
                    Registered ID
                  </span>
                  <span
                    className={`text-xl sm:text-2xl font-black ${
                      isDark ? "text-blue-100" : "text-blue-900"
                    }`}
                  >
                    #CUST-{viewingCustomerHistory.CustomerID}
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider pt-2">
                Frequent Order Logs
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {orders
                  .filter(
                    (o) =>
                      o.customer
                        .toLowerCase()
                        .includes(
                          viewingCustomerHistory.LastName.toLowerCase(),
                        ) ||
                      o.customer
                        .toLowerCase()
                        .includes(
                          viewingCustomerHistory.FirstName.toLowerCase(),
                        ),
                  )
                  .map((item) => ({
                    id: item.id,
                    customer: item.customer,
                    total: item.total,
                    date: item.date,
                    status: item.status,
                  }))
                  .concat(
                    salesRecords
                      .filter(
                        (s) =>
                          s.CustomerName.toLowerCase().includes(
                            viewingCustomerHistory.LastName.toLowerCase(),
                          ) ||
                          s.CustomerName.toLowerCase().includes(
                            viewingCustomerHistory.FirstName.toLowerCase(),
                          ),
                      )
                      .map((s) => ({
                        id: s.TransactionID,
                        customer: s.CustomerName,
                        total: s.TotalAmount,
                        date: s.Date,
                        status: "COMPLETED",
                      })),
                  )
                  .map((item, idx: number) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center p-3.5 rounded-xl border text-sm font-bold ${
                        isDark
                          ? "bg-slate-800 border-slate-700 text-slate-100"
                          : "bg-slate-50 border-slate-100 text-slate-900"
                      }`}
                    >
                      <div>
                        <span
                          className={`font-black block ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          {item.id}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {item.date}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-black block ${
                            isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {item.total}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md ${
                            isDark
                              ? "bg-emerald-950/60 text-emerald-300"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => setViewingCustomerHistory(null)}
              className={`w-full py-3 rounded-xl font-black text-sm cursor-pointer ${
                isDark ? "bg-slate-800 text-white" : "bg-slate-900 text-white"
              }`}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Record Sales Transaction Modal */}
      {isRecordSaleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-[32px] border shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn ${
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
              <h3
                className={`text-lg sm:text-xl font-black flex items-center space-x-2 ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                <Receipt
                  className={`h-5 w-5 ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <span>Record Sales Transaction</span>
              </h3>
              <button
                onClick={() => setIsRecordSaleOpen(false)}
                className={`text-sm font-bold ${
                  isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Close
              </button>
            </div>
            <form onSubmit={handleRecordSaleSubmit} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-bold uppercase mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Customer / Buyer
                </label>
                <input
                  type="text"
                  required
                  value={saleCustomer}
                  onChange={(e) => setSaleCustomer(e.target.value)}
                  placeholder="Walk-in Customer or Name"
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold uppercase mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Product Item
                </label>
                <select
                  value={saleProduct}
                  onChange={(e) => {
                    setSaleProduct(e.target.value);
                    if (e.target.value.includes("Refill")) {
                      setSaleAmount("50.00");
                    } else {
                      setSaleAmount("250.00");
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none cursor-pointer ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={saleQuantity}
                    onChange={(e) => {
                      setSaleQuantity(e.target.value);
                      const base = saleProduct.includes("Refill") ? 50 : 250;
                      setSaleAmount((base * Number(e.target.value)).toFixed(2));
                    }}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Total Amount (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold uppercase mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Payment Method
                </label>
                <select
                  value={salePaymentMethod}
                  onChange={(e) => setSalePaymentMethod(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none cursor-pointer ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {!editingStaff && (
                <div>
                  <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Temporary Login Password
                  </label>
                  <input
                    type="password"
                    required={!editingStaff}
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                      isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                  <p className={`mt-1 text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    The staff member can use this temporary password to sign in and then change it from their account settings.
                  </p>
                </div>
              )}
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRecordSaleOpen(false)}
                  className={`w-1/2 py-3 rounded-xl font-bold text-sm cursor-pointer ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Rider Modal */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-[32px] border shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn ${
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
              <h3
                className={`text-lg sm:text-xl font-black ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Assign Driver for ({assigningOrder.id})
              </h3>
              <button
                onClick={() => setAssigningOrder(null)}
                className={`text-sm font-bold ${
                  isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Close
              </button>
            </div>
            <form onSubmit={handleAssignRiderSubmit} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-bold uppercase mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Select Available Delivery Rider / Staff
                </label>
                <select
                  required
                  value={selectedRiderName}
                  onChange={(e) => setSelectedRiderName(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none cursor-pointer ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="">-- Choose Rider --</option>
                  {staffList
                    .filter(
                      (s) =>
                        s.Role.toLowerCase() === "delivery" ||
                        s.Role.toLowerCase() === "staff",
                    )
                    .map((s) => {
                      const fullName = `${s.FirstName} ${s.LastName}`;
                      return (
                        <option key={s.StaffID} value={fullName}>
                          {fullName} ({s.Role})
                        </option>
                      );
                    })}
                </select>
              </div>
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setAssigningOrder(null)}
                  className={`w-1/2 py-3 rounded-xl font-bold text-sm cursor-pointer ${
                    isDark
                      ? "bg-slate-800 text-slate-200"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  Assign Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-[32px] border shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn ${
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
              <h3
                className={`text-lg sm:text-xl font-black ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Order Details ({selectedOrder.id})
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className={`text-sm font-bold ${
                  isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div
                className={`flex justify-between py-2 border-b ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-400 uppercase">
                  Customer Name:
                </span>
                <span
                  className={`font-black ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {selectedOrder.customer}
                </span>
              </div>
              <div
                className={`flex justify-between py-2 border-b ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-400 uppercase">
                  Item Ordered:
                </span>
                <span
                  className={`font-black ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {selectedOrder.itemName}
                </span>
              </div>
              <div
                className={`flex justify-between py-2 border-b ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-400 uppercase">
                  Contact Number:
                </span>
                <span
                  className={`font-bold ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {selectedOrder.phone}
                </span>
              </div>
              <div
                className={`flex justify-between py-2 border-b ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-400 uppercase">
                  Fulfillment Type:
                </span>
                <span
                  className={`font-bold ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {selectedOrder.type}
                </span>
              </div>
              <div
                className={`flex justify-between py-2 border-b ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-400 uppercase">
                  Date Placed:
                </span>
                <span
                  className={`font-bold ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {selectedOrder.date}
                </span>
              </div>
              <div
                className={`flex justify-between py-2 border-b ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-400 uppercase">
                  Total Amount:
                </span>
                <span
                  className={`font-black text-base ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {selectedOrder.total}
                </span>
              </div>
              <div
                className={`flex justify-between py-2 border-b ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-400 uppercase">
                  Payment Status:
                </span>
                <span
                  className={`font-black ${
                    isDark ? "text-purple-400" : "text-purple-600"
                  }`}
                >
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              {selectedOrder.referenceNo && (
                <div
                  className={`flex justify-between py-2 border-b ${
                    isDark ? "border-slate-800" : "border-slate-100"
                  }`}
                >
                  <span className="font-bold text-slate-400 uppercase">
                    Ref Number:
                  </span>
                  <span
                    className={`font-bold ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {selectedOrder.referenceNo}
                  </span>
                </div>
              )}
              {selectedOrder.receiptUrl && (
                <div
                  className={`flex justify-between py-2 border-b items-center ${
                    isDark ? "border-slate-800" : "border-slate-100"
                  }`}
                >
                  <span className="font-bold text-slate-400 uppercase">
                    Receipt Proof:
                  </span>
                  <a
                    href={selectedOrder.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs font-bold underline ${
                      isDark
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-800"
                    }`}
                  >
                    Open Screenshot ↗
                  </a>
                </div>
              )}
              <div
                className={`flex justify-between py-2 border-b ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-400 uppercase">
                  Fulfillment Status:
                </span>
                <span
                  className={`font-black ${
                    isDark ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold text-slate-400 uppercase">
                  Assigned Driver / Rider:
                </span>
                <span
                  className={`font-bold ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {selectedOrder.rider || "Unassigned"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className={`w-full py-3 rounded-xl font-black text-sm cursor-pointer ${
                isDark ? "bg-slate-800 text-white" : "bg-slate-900 text-white"
              }`}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Staff Details View Modal */}
      {selectedStaffDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-[32px] border shadow-2xl max-w-sm w-full p-6 sm:p-8 space-y-6 animate-fadeIn ${
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
              <h3
                className={`text-lg sm:text-xl font-black ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Staff Profile (#STF-00{selectedStaffDetails.StaffID})
              </h3>
              <button
                onClick={() => setSelectedStaffDetails(null)}
                className="text-sm font-bold text-slate-400"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div
                className={`flex justify-between py-2 border-b ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-400 uppercase">
                  Full Name:
                </span>
                <span
                  className={`font-black ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {selectedStaffDetails.LastName},{" "}
                  {selectedStaffDetails.FirstName}{" "}
                  {selectedStaffDetails.MiddleName}{" "}
                  {selectedStaffDetails.Suffix}
                </span>
              </div>
              <div
                className={`flex justify-between py-2 border-b ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-400 uppercase">
                  Role:
                </span>
                <span
                  className={`font-bold ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {selectedStaffDetails.Role}
                </span>
              </div>
              <div
                className={`flex justify-between py-2 border-b ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-400 uppercase">
                  Login Email:
                </span>
                <span
                  className={`font-bold ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {selectedStaffDetails.Email || "No Email Provided"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold text-slate-400 uppercase">
                  Contact:
                </span>
                <span
                  className={`font-bold ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {selectedStaffDetails.ContactNumber}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedStaffDetails(null)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-sm cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-[32px] border shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn ${
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
              <h3
                className={`text-lg sm:text-xl font-black ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {editingProduct
                  ? "Edit Inventory Item"
                  : "Add New Inventory Item"}
              </h3>
              <button
                onClick={() => {
                  setIsAddProductOpen(false);
                  setEditingProduct(null);
                }}
                className="text-sm font-bold text-slate-400"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-bold uppercase mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g., Slim 5-Gallon Refill"
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-bold uppercase mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Category
                </label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none cursor-pointer ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="Refill">Refill</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="50.00"
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="100"
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Min Alert
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdMinStock}
                    onChange={(e) => setNewProdMinStock(e.target.value)}
                    placeholder="10"
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductOpen(false);
                    setEditingProduct(null);
                  }}
                  className={`w-1/2 py-3 rounded-xl font-bold text-sm cursor-pointer ${
                    isDark
                      ? "bg-slate-800 text-slate-200"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  {editingProduct ? "Save Changes" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-[32px] border shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-fadeIn ${
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
              <h3
                className={`text-lg sm:text-xl font-black ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {editingCustomer ? "Edit Customer Details" : "Add New Customer"}
              </h3>
              <button
                onClick={() => {
                  setIsAddCustomerOpen(false);
                  setEditingCustomer(null);
                }}
                className="text-sm font-bold text-slate-400"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustFirstName}
                    onChange={(e) => setNewCustFirstName(e.target.value)}
                    className={`w-full px-3 py-3 border rounded-xl text-sm font-bold outline-none ${
                      newCustFirstName && !validateName(newCustFirstName)
                        ? "border-rose-300 bg-rose-50/30"
                        : isDark
                          ? "bg-slate-800 border-slate-700 text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Middle
                  </label>
                  <input
                    type="text"
                    required={!editingCustomer}
                    value={newCustMiddleName}
                    onChange={(e) => setNewCustMiddleName(e.target.value)}
                    className={`w-full px-3 py-3 border rounded-xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustLastName}
                    onChange={(e) => setNewCustLastName(e.target.value)}
                    className={`w-full px-3 py-3 border rounded-xl text-sm font-bold outline-none ${
                      newCustLastName && !validateName(newCustLastName)
                        ? "border-rose-300 bg-rose-50/30"
                        : isDark
                          ? "bg-slate-800 border-slate-700 text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Suffix
                  </label>
                  <input
                    type="text"
                    placeholder="Jr., III"
                    value={newCustSuffix}
                    onChange={(e) => setNewCustSuffix(e.target.value)}
                    className={`w-full px-3 py-3 border rounded-xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block text-xs font-bold uppercase mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Delivery Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street, Barangay, City"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-bold uppercase mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Barangay
                </label>
                <input
                  type="text"
                  required={!editingCustomer}
                  placeholder="e.g. Rawis"
                  value={newCustBarangay}
                  onChange={(e) => setNewCustBarangay(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label
                      className={`block text-xs font-bold uppercase ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Contact Number
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      09xx or +639xx
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="09171234567"
                    value={newCustContact}
                    onChange={(e) => setNewCustContact(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none transition ${
                      newCustContact && !validatePhoneNumber(newCustContact)
                        ? "border-rose-300 bg-rose-50/30"
                        : isDark
                          ? "bg-slate-800 border-slate-700 text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCustomerOpen(false);
                    setEditingCustomer(null);
                  }}
                  className={`w-1/2 py-3 rounded-xl font-bold text-sm cursor-pointer ${
                    isDark
                      ? "bg-slate-800 text-slate-200"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  {editingCustomer ? "Save Changes" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-[32px] border shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-fadeIn ${
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
              <h3
                className={`text-lg sm:text-xl font-black ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
              </h3>
              <button
                onClick={() => {
                  setIsAddStaffOpen(false);
                  setEditingStaff(null);
                }}
                className="text-sm font-bold text-slate-400"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaffFirstName}
                    onChange={(e) => setNewStaffFirstName(e.target.value)}
                    className={`w-full px-3 py-3 border rounded-xl text-sm font-bold outline-none ${
                      newStaffFirstName && !validateName(newStaffFirstName)
                        ? "border-rose-300 bg-rose-50/30"
                        : isDark
                          ? "bg-slate-800 border-slate-700 text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Middle
                  </label>
                  <input
                    type="text"
                    value={newStaffMiddleName}
                    onChange={(e) => setNewStaffMiddleName(e.target.value)}
                    className={`w-full px-3 py-3 border rounded-xl text-sm font-bold outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaffLastName}
                    onChange={(e) => setNewStaffLastName(e.target.value)}
                    className={`w-full px-3 py-3 border rounded-xl text-sm font-bold outline-none ${
                      newStaffLastName && !validateName(newStaffLastName)
                        ? "border-rose-300 bg-rose-50/30"
                        : isDark
                          ? "bg-slate-800 border-slate-700 text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Suffix
                  </label>
                  <input
                    type="text"
                    placeholder="Jr., III"
                    value={newStaffSuffix}
                    onChange={(e) => setNewStaffSuffix(e.target.value)}
                    className={`w-full px-3 py-3 border rounded-xl text-sm font-bold outline-none ${
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
                    className={`block text-xs font-bold uppercase mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Role
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none cursor-pointer ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="Delivery">Delivery / Rider</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label
                      className={`block text-xs font-bold uppercase ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Contact
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      09xx/ +639xx
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="0917..."
                    value={newStaffContact}
                    onChange={(e) => setNewStaffContact(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none transition ${
                      newStaffContact && !validatePhoneNumber(newStaffContact)
                        ? "border-rose-300 bg-rose-50/30"
                        : isDark
                          ? "bg-slate-800 border-slate-700 text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block text-xs font-bold uppercase mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Login Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@aquawell.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddStaffOpen(false);
                    setEditingStaff(null);
                  }}
                  className={`w-1/2 py-3 rounded-xl font-bold text-sm cursor-pointer ${
                    isDark
                      ? "bg-slate-800 text-slate-200"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  {editingStaff ? "Save Changes" : "Save Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {createdStaffCredentials && (
        <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[28px] p-6 shadow-2xl border ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}`}>
            <h3 className="text-xl font-black mb-2">Staff Login Created</h3>
            <p className={`text-sm mb-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Give these credentials to the staff member. The temporary password is shown only here.
            </p>
            <div className={`rounded-2xl p-4 space-y-3 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
              <div><div className="text-[10px] uppercase font-black opacity-60">Role</div><div className="font-bold">{createdStaffCredentials.role}</div></div>
              <div><div className="text-[10px] uppercase font-black opacity-60">Email</div><div className="font-bold break-all">{createdStaffCredentials.email}</div></div>
              <div><div className="text-[10px] uppercase font-black opacity-60">Temporary Password</div><div className="font-mono font-bold break-all">{createdStaffCredentials.password}</div></div>
            </div>
            <button onClick={() => setCreatedStaffCredentials(null)} className="w-full mt-5 py-3 rounded-2xl bg-blue-600 text-white font-black">Done</button>
          </div>
        </div>
      )}

      {createdCustomerCredentials && (
        <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[28px] p-6 shadow-2xl border ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}`}>
            <h3 className="text-xl font-black mb-2">{createdCustomerCredentials.role ? `${createdCustomerCredentials.role} Login Credentials` : "Customer Login Created"}</h3>
            <p className={`text-sm mb-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Give these credentials to the account owner. The temporary password is shown only here.</p>
            <div className={`rounded-2xl p-4 space-y-3 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
              <div><div className="text-[10px] uppercase font-black opacity-60">Email</div><div className="font-bold break-all">{createdCustomerCredentials.email}</div></div>
              <div><div className="text-[10px] uppercase font-black opacity-60">Temporary Password</div><div className="font-mono font-bold break-all">{createdCustomerCredentials.password}</div></div>
            </div>
            <button onClick={() => setCreatedCustomerCredentials(null)} className="w-full mt-5 py-3 rounded-2xl bg-blue-600 text-white font-black">Done</button>
          </div>
        </div>
      )}

      {/* Mobile Backdrop Overlay for Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      {/* Sidebar Navigation: True static sticky sidebar on desktop, drawer on mobile */}
      <aside
        className={`bg-blue-900 text-white flex flex-col justify-between transition-all duration-300 shadow-xl z-50 fixed lg:sticky top-0 h-screen shrink-0 ${
          isMobileMenuOpen ? "left-0" : "-left-72 lg:left-0"
        } ${isSidebarCollapsed ? "lg:w-20" : "w-72"}`}
      >
        <div className="overflow-y-auto overflow-x-hidden flex-1">
          <div className="p-6 border-b border-blue-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-blue-800 p-2.5 rounded-2xl shadow-sm shrink-0 border border-blue-700">
                <Droplet className="h-6 w-6 text-cyan-300 fill-cyan-300" />
              </div>
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <div className="overflow-hidden whitespace-nowrap">
                  <span className="text-lg font-black tracking-tight text-white block">
                    Admin Panel
                  </span>
                  <span className="text-xs text-blue-200 font-medium block">
                    AquaWell Portal
                  </span>
                </div>
              )}
            </div>
            {/* Desktop collapse toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:block p-2 rounded-xl bg-blue-800/60 hover:bg-blue-800 transition text-white cursor-pointer border border-blue-700 shrink-0"
            >
              <Menu className="h-4 w-4" />
            </button>
            {/* Mobile close toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-xl bg-blue-800/60 hover:bg-blue-800 transition text-white cursor-pointer border border-blue-700 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Profile Badge Section */}
          <div
            className="p-4 border-b border-blue-800 relative"
            ref={dropdownRef}
          >
            <button
              type="button"
              onClick={() => {
                if (!isSidebarCollapsed || isMobileMenuOpen) {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setActiveSubView(null);
                }
              }}
              className={`w-full flex items-center justify-between bg-blue-800/60 hover:bg-blue-800 p-3 rounded-2xl border border-blue-700 transition cursor-pointer ${isSidebarCollapsed && !isMobileMenuOpen ? "justify-center px-1 py-2" : ""}`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-md shrink-0">
                  {adminName.charAt(0)}
                </div>
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                  <div className="text-left overflow-hidden whitespace-nowrap">
                    <span className="block text-xs font-bold text-white leading-tight truncate">
                      {adminName}
                    </span>
                    <span className="block text-[10px] text-blue-200 font-medium truncate">
                      {stationName}
                    </span>
                  </div>
                )}
              </div>
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <ChevronDown
                  className={`h-4 w-4 text-blue-200 transition-transform duration-300 ${isProfileMenuOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {isProfileMenuOpen && (!isSidebarCollapsed || isMobileMenuOpen) && (
              <div className="mt-2 space-y-1 bg-blue-950/60 p-2 rounded-2xl border border-blue-800 animate-fadeIn">
                {activeSubView === "profile" ? (
                  <div className="p-3 space-y-2.5">
                    <div className="flex justify-between items-center border-b border-blue-800 pb-1.5">
                      <span className="text-xs font-black uppercase text-cyan-300">
                        Edit Profile
                      </span>
                      <button
                        onClick={() => setActiveSubView(null)}
                        className="text-xs text-blue-300 hover:text-white"
                      >
                        Back
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-bold text-blue-200 uppercase mb-0.5">
                          Name
                        </label>
                        <input
                          type="text"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full px-3 py-2 bg-blue-900 border border-blue-700 rounded-xl text-sm text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-blue-200 uppercase mb-0.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={adminEmail}
                          disabled
                          className="w-full px-3 py-2 bg-blue-900/50 border border-blue-800 rounded-xl text-sm text-blue-300 outline-none cursor-not-allowed"
                        />
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        className="w-full py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl font-black text-sm transition cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                ) : activeSubView === "settings" ? (
                  <div className="p-3 space-y-2.5">
                    <div className="flex justify-between items-center border-b border-blue-800 pb-1.5">
                      <span className="text-xs font-black uppercase text-cyan-300">
                        Station Settings
                      </span>
                      <button
                        onClick={() => setActiveSubView(null)}
                        className="text-xs text-blue-300 hover:text-white"
                      >
                        Back
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-bold text-blue-200 uppercase mb-0.5">
                          Branch / Address
                        </label>
                        <input
                          type="text"
                          value={stationName}
                          onChange={(e) => setStationName(e.target.value)}
                          className="w-full px-3 py-2 bg-blue-900 border border-blue-700 rounded-xl text-sm text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-blue-200 uppercase mb-0.5">
                          Hotline Phone
                        </label>
                        <input
                          type="text"
                          value={stationPhone}
                          onChange={(e) => setStationPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-blue-900 border border-blue-700 rounded-xl text-sm text-white outline-none"
                        />
                      </div>
                      <button
                        onClick={handleSaveSettings}
                        className="w-full py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl font-black text-sm transition cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Settings</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveSubView("profile")}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-bold text-blue-100 hover:bg-blue-800 hover:text-white transition cursor-pointer"
                    >
                      <User className="h-4 w-4 text-cyan-300" />
                      <span>Account Profile</span>
                    </button>
                    <button
                      onClick={() => setActiveSubView("settings")}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-bold text-blue-100 hover:bg-blue-800 hover:text-white transition cursor-pointer"
                    >
                      <Settings className="h-4 w-4 text-cyan-300" />
                      <span>Station Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsPasswordModalOpen(true);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-bold text-blue-100 hover:bg-blue-800 hover:text-white transition cursor-pointer"
                    >
                      <Lock className="h-4 w-4 text-cyan-300" />
                      <span>Change Password</span>
                    </button>
                    <div className="border-t border-blue-800 pt-1 mt-1">
                      <button
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          await supabase.auth.signOut();
                          showToast("Logged out successfully", "success");
                          navigate("/");
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-bold text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-rose-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "dashboard" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <span>Dashboard</span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("orders");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "orders" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <ShoppingCart className="h-5 w-5 shrink-0" />
              {(!isSidebarCollapsed || isMobileMenuOpen) && <span>Orders</span>}
            </button>
            <button
              onClick={() => {
                setActiveTab("products");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "products" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <Package className="h-5 w-5 shrink-0" />
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <span>Products</span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("reports");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "reports" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <TrendingUp className="h-5 w-5 shrink-0" />
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <span>Sales & Forecasts</span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("customers");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "customers" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <Users className="h-5 w-5 shrink-0" />
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <span>Customer Directory</span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("staff");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "staff" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <Briefcase className="h-5 w-5 shrink-0" />
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <span>Staff & Drivers</span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-blue-800 shrink-0">
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 bg-blue-800/60 hover:bg-blue-800 text-blue-200 hover:text-white py-3.5 rounded-2xl font-bold text-base transition border border-blue-700"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <span>Back to Site</span>
            )}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 relative min-h-screen transition-colors ${isDark ? "bg-slate-950" : "bg-slate-50"}`}
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-2 flex flex-row justify-between items-center gap-3 w-full">
          <div className="flex items-center space-x-3 shrink-0">
            {/* Mobile Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 bg-blue-900 text-white rounded-2xl shadow hover:bg-blue-800 transition cursor-pointer shrink-0"
              aria-label="Open Mobile Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Hidden on mobile view using 'hidden sm:block' */}
            <div className="min-w-0 hidden sm:block">
              <h1
                className={`text-xl sm:text-3xl lg:text-5xl font-black tracking-tight leading-normal pb-1 truncate ${isDark ? "text-slate-100" : "text-slate-950"}`}
              >
                {activeTab === "dashboard" && "Admin Dashboard"}
                {activeTab === "orders" && "Order Management"}
                {activeTab === "products" && "Product Catalog & Inventory"}
                {activeTab === "reports" && "Sales Reports & Demand Forecast"}
                {activeTab === "customers" && "Customer Directory"}
                {activeTab === "staff" && "Staff & Driver Management"}
              </h1>
              <p
                className={`text-xs sm:text-sm mt-0.5 font-semibold truncate ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Manage complete station operations with full CRUD interactivity.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 justify-end min-w-0">
            <ThemeToggleButton
              className={`p-3 rounded-2xl border transition shadow-sm cursor-pointer ${isDark ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"}`}
            />
            {/* Global Quick Search Bar - Extended to occupy blank space */}
            <div className="relative flex-1 max-w-2xl mx-1 sm:mx-4 min-w-0">
              <Command
                className={`absolute left-3.5 top-3 h-4 w-4 shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`}
              />
              <input
                type="text"
                placeholder="Search orders, products, customers..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 border rounded-2xl text-xs font-bold outline-none shadow-sm transition truncate ${isDark ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-blue-500" : "bg-white border-slate-200 text-slate-900 focus:border-blue-500"}`}
              />
            </div>

            {/* Notifications Dropdown Bell */}
            <div className="relative shrink-0" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-3 border rounded-2xl transition cursor-pointer shadow-sm ${isDark ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full font-black text-[10px] flex items-center justify-center border-2 animate-pulse ${isDark ? "border-slate-900" : "border-white"}`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div
                  className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-[24px] border shadow-2xl p-5 z-50 space-y-4 animate-fadeIn ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div
                    className={`flex justify-between items-center border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-100"}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Bell
                        className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                      />
                      <span
                        className={`font-black text-sm ${isDark ? "text-slate-100" : "text-slate-900"}`}
                      >
                        Notifications ({unreadCount} new)
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className={`text-xs font-bold hover:underline flex items-center space-x-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                      >
                        <Check className="h-3 w-3" />
                        <span>Mark all as read</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">
                        You're all caught up.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 rounded-2xl border transition ${n.unread ? (isDark ? "bg-blue-950/40 border-blue-900/50" : "bg-blue-50/50 border-blue-100") : isDark ? "bg-slate-800/50 border-slate-800 opacity-75" : "bg-slate-50 border-slate-100 opacity-75"}`}
                        >
                          <div className="flex justify-between items-start">
                            <span
                              className={`text-xs font-black block ${isDark ? "text-slate-100" : "text-slate-900"}`}
                            >
                              {n.friendlyTitle || friendlyEventTitle(String(n.title || ""))}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {formatTimeAgo(n.created_at)}
                            </span>
                          </div>
                          <p
                            className={`text-xs mt-1 font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
                          >
                            {n.friendlyDescription || friendlyAuditAction(n.description || "Activity recorded.")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-8 lg:p-12 pt-4 max-w-[1600px] w-full mx-auto flex-1 space-y-8">
          {/* Global Search Results Overlay */}
          {globalSearch && (
            <div
              className={`border p-6 rounded-[28px] space-y-4 animate-fadeIn ${isDark ? "bg-blue-950/40 border-blue-900/50" : "bg-blue-50 border-blue-200"}`}
            >
              <div className="flex justify-between items-center">
                <h4
                  className={`text-sm font-black uppercase tracking-wider flex items-center space-x-2 ${isDark ? "text-blue-200" : "text-blue-900"}`}
                >
                  <Search
                    className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                  />
                  <span>
                    Command Palette Search Results for "{globalSearch}"
                  </span>
                </h4>
                <button
                  onClick={() => setGlobalSearch("")}
                  className={`text-xs font-bold hover:underline ${isDark ? "text-blue-400" : "text-blue-600"}`}
                >
                  Clear Search
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-2xl border shadow-sm space-y-2 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-blue-100"}`}
                >
                  <span className="text-xs font-black uppercase text-slate-400">
                    Customers Found
                  </span>
                  {customers
                    .filter((c) =>
                      `${c.FirstName} ${c.LastName} ${c.Email}`
                        .toLowerCase()
                        .includes(globalSearch.toLowerCase()),
                    )
                    .map((c) => (
                      <div
                        key={c.CustomerID}
                        className={`text-sm font-bold flex justify-between ${isDark ? "text-slate-100" : "text-slate-900"}`}
                      >
                        <span>
                          {c.FirstName} {c.LastName}
                        </span>
                        <button
                          onClick={() => {
                            setActiveTab("customers");
                            setCustomerSearch(c.LastName);
                          }}
                          className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"}`}
                        >
                          View
                        </button>
                      </div>
                    ))}
                </div>

                <div
                  className={`p-4 rounded-2xl border shadow-sm space-y-2 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-blue-100"}`}
                >
                  <span className="text-xs font-black uppercase text-slate-400">
                    Orders Found
                  </span>
                  {orders
                    .filter((o) =>
                      `${o.id} ${o.customer}`
                        .toLowerCase()
                        .includes(globalSearch.toLowerCase()),
                    )
                    .map((o) => (
                      <div
                        key={o.id}
                        className={`text-sm font-bold flex justify-between ${isDark ? "text-slate-100" : "text-slate-900"}`}
                      >
                        <span>
                          {o.id} ({o.customer})
                        </span>
                        <button
                          onClick={() => setActiveTab("orders")}
                          className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"}`}
                        >
                          View
                        </button>
                      </div>
                    ))}
                </div>

                <div
                  className={`p-4 rounded-2xl border shadow-sm space-y-2 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-blue-100"}`}
                >
                  <span className="text-xs font-black uppercase text-slate-400">
                    Products Found
                  </span>
                  {products
                    .filter((p) =>
                      p.name.toLowerCase().includes(globalSearch.toLowerCase()),
                    )
                    .map((p) => (
                      <div
                        key={p.id}
                        className={`text-sm font-bold flex justify-between ${isDark ? "text-slate-100" : "text-slate-900"}`}
                      >
                        <span>{p.name}</span>
                        <button
                          onClick={() => setActiveTab("products")}
                          className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"}`}
                        >
                          View
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 1. DASHBOARD TAB ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div
                  className={`p-6 rounded-[28px] border shadow-sm flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Orders
                    </span>
                    <h3
                      className={`text-3xl font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}
                    >
                      {orders.length}
                    </h3>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl border ${isDark ? "bg-emerald-950/50 text-emerald-400 border-emerald-900/50" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}
                  >
                    <ShoppingCart className="h-7 w-7" />
                  </div>
                </div>

                <div
                  className={`p-6 rounded-[28px] border shadow-sm flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Customers
                    </span>
                    <h3
                      className={`text-3xl font-black ${isDark ? "text-blue-400" : "text-blue-600"}`}
                    >
                      {customers.length}
                    </h3>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl border ${isDark ? "bg-blue-950/50 text-blue-400 border-blue-900/50" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                  >
                    <Users className="h-7 w-7" />
                  </div>
                </div>

                <div
                  className={`p-6 rounded-[28px] border shadow-sm flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Pending Orders
                    </span>
                    <h3
                      className={`text-3xl font-black ${isDark ? "text-amber-400" : "text-amber-600"}`}
                    >
                      {orders.filter((o) => o.status === "PENDING").length}
                    </h3>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl border ${isDark ? "bg-amber-950/50 text-amber-400 border-amber-900/50" : "bg-amber-50 text-amber-600 border-amber-100"}`}
                  >
                    <Clock className="h-7 w-7" />
                  </div>
                </div>

                <div
                  className={`p-6 rounded-[28px] border shadow-sm flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Out for Delivery
                    </span>
                    <h3
                      className={`text-3xl font-black ${isDark ? "text-blue-400" : "text-blue-500"}`}
                    >
                      {
                        orders.filter((o) => o.status === "OUT FOR-DELIVERY")
                          .length
                      }
                    </h3>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl border ${isDark ? "bg-blue-950/50 text-blue-400 border-blue-900/50" : "bg-blue-50 text-blue-500 border-blue-100"}`}
                  >
                    <Truck className="h-7 w-7" />
                  </div>
                </div>

                <div
                  className={`p-6 rounded-[28px] border shadow-sm flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Delivered Orders
                    </span>
                    <h3
                      className={`text-3xl font-black ${isDark ? "text-purple-400" : "text-purple-600"}`}
                    >
                      {orders.filter((o) => o.status === "DELIVERED").length}
                    </h3>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl border ${isDark ? "bg-purple-950/50 text-purple-400 border-purple-900/50" : "bg-purple-50 text-purple-600 border-purple-100"}`}
                  >
                    <Box className="h-7 w-7" />
                  </div>
                </div>
              </div>

              {/* Low Stock Warning Banner */}
              {products.some((p) => p.stock <= p.minStock) && (
                <div
                  className={`border p-6 rounded-[28px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fadeIn ${isDark ? "bg-amber-950/40 border-amber-900/50" : "bg-amber-50 border-amber-200"}`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-3 rounded-2xl shrink-0 ${isDark ? "bg-amber-900/60 text-amber-300" : "bg-amber-100 text-amber-700"}`}
                    >
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h4
                        className={`text-base font-black ${isDark ? "text-amber-200" : "text-amber-900"}`}
                      >
                        Low Stock Inventory Alert!
                      </h4>
                      <p
                        className={`text-xs font-bold ${isDark ? "text-amber-400" : "text-amber-700"}`}
                      >
                        One or more items have dropped below their minimum
                        threshold and require a reorder or production run.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow cursor-pointer shrink-0"
                  >
                    View Inventory
                  </button>
                </div>
              )}

              {/* Real SVG Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div
                  className={`p-6 sm:p-8 rounded-[32px] border shadow-sm space-y-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <h3
                    className={`text-base font-black uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}
                  >
                    Sales Overview (Last 7 Days)
                  </h3>
                  <div
                    className={`h-64 flex flex-col justify-end p-4 rounded-2xl border relative overflow-hidden ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"}`}
                  >
                    <svg
                      className="w-full h-48 overflow-visible"
                      viewBox="0 0 500 160"
                    >
                      <defs>
                        <linearGradient
                          id="lineGrad"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity="0.25"
                          />
                          <stop
                            offset="100%"
                            stopColor="#3b82f6"
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>
                      <line
                        x1="0"
                        y1="0"
                        x2="500"
                        y2="0"
                        stroke={isDark ? "#334155" : "#e2e8f0"}
                        strokeDasharray="4"
                      />
                      <line
                        x1="0"
                        y1="40"
                        x2="500"
                        y2="40"
                        stroke={isDark ? "#334155" : "#e2e8f0"}
                        strokeDasharray="4"
                      />
                      <line
                        x1="0"
                        y1="80"
                        x2="500"
                        y2="80"
                        stroke={isDark ? "#334155" : "#e2e8f0"}
                        strokeDasharray="4"
                      />
                      <line
                        x1="0"
                        y1="120"
                        x2="500"
                        y2="120"
                        stroke={isDark ? "#334155" : "#e2e8f0"}
                        strokeDasharray="4"
                      />
                      <line
                        x1="0"
                        y1="160"
                        x2="500"
                        y2="160"
                        stroke={isDark ? "#475569" : "#cbd5e1"}
                      />

                      <path
                        d="M 0 130 Q 80 80, 160 110 T 320 50 T 500 20 L 500 160 L 0 160 Z"
                        fill="url(#lineGrad)"
                      />
                      <path
                        d="M 0 130 Q 80 80, 160 110 T 320 50 T 500 20"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      <circle cx="0" cy="130" r="5" fill="#3b82f6" />
                      <circle cx="83" cy="95" r="5" fill="#3b82f6" />
                      <circle cx="166" cy="110" r="5" fill="#3b82f6" />
                      <circle cx="250" cy="80" r="5" fill="#3b82f6" />
                      <circle cx="333" cy="50" r="5" fill="#3b82f6" />
                      <circle cx="416" cy="35" r="5" fill="#3b82f6" />
                      <circle cx="500" cy="20" r="5" fill="#3b82f6" />
                    </svg>
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 px-1">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-6 sm:p-8 rounded-[32px] border shadow-sm space-y-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <h3
                    className={`text-base font-black uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}
                  >
                    Order Status Distribution
                  </h3>
                  <div
                    className={`h-64 flex flex-col justify-center p-6 rounded-2xl border space-y-4 ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"}`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm font-bold">
                        <span
                          className={`flex items-center space-x-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block"></span>
                          <span>Delivered</span>
                        </span>
                        <span
                          className={`font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}
                        >
                          {
                            orders.filter((o) => o.status === "DELIVERED")
                              .length
                          }{" "}
                          Orders
                        </span>
                      </div>
                      <div
                        className={`w-full h-3.5 rounded-full overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                      >
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{
                            width: `${orders.length ? (orders.filter((o) => o.status === "DELIVERED").length / orders.length) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm font-bold">
                        <span
                          className={`flex items-center space-x-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 inline-block"></span>
                          <span>Out for Delivery</span>
                        </span>
                        <span
                          className={`font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}
                        >
                          {
                            orders.filter(
                              (o) => o.status === "OUT FOR-DELIVERY",
                            ).length
                          }{" "}
                          Orders
                        </span>
                      </div>
                      <div
                        className={`w-full h-3.5 rounded-full overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                      >
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{
                            width: `${orders.length ? (orders.filter((o) => o.status === "OUT FOR-DELIVERY").length / orders.length) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div
                className={`p-6 sm:p-8 rounded-[32px] border shadow-sm space-y-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
              >
                <div className="flex justify-between items-center">
                  <h3
                    className={`text-base font-black uppercase flex items-center space-x-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}
                  >
                    <Activity
                      className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                    />
                    <span>Recent Activity</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                    Updates appear automatically
                  </span>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 rounded-2xl border transition ${isDark ? "bg-slate-800/60 border-slate-800 hover:bg-slate-800" : "bg-slate-50 border-slate-100 hover:bg-slate-100/60"}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${isDark ? "bg-blue-400" : "bg-blue-600"}`}
                        ></div>
                        <div>
                          <p
                            className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                          >
                            {log.action}
                          </p>
                          <p
                            className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                          >
                            Performed by{" "}
                            <span
                              className={`font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}
                            >
                              {log.user_name}
                            </span>
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-mono px-3 py-1 rounded-xl border ${isDark ? "text-slate-500 bg-slate-900 border-slate-800" : "text-slate-400 bg-white border-slate-200"}`}
                      >
                        {log.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. ORDERS TAB ================= */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-row items-center justify-between gap-2.5 sm:gap-4">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3.5 sm:left-4 top-3 h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 border rounded-xl text-xs font-bold outline-none shadow-sm truncate ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                </div>

                <div
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2.5 rounded-xl border shadow-sm shrink-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className={`bg-transparent text-xs sm:text-sm font-bold outline-none cursor-pointer ${isDark ? "text-slate-200" : "text-slate-700"}`}
                  >
                    <option
                      value="All"
                      className={isDark ? "bg-slate-900" : ""}
                    >
                      All Statuses
                    </option>
                    <option
                      value="Delivery"
                      className={isDark ? "bg-slate-900" : ""}
                    >
                      Delivery Type
                    </option>
                    <option
                      value="Pending"
                      className={isDark ? "bg-slate-900" : ""}
                    >
                      Pending
                    </option>
                    <option
                      value="Delivered"
                      className={isDark ? "bg-slate-900" : ""}
                    >
                      Delivered
                    </option>
                  </select>
                </div>
              </div>

              <div
                className={`rounded-[32px] border shadow-sm overflow-hidden p-4 sm:p-6 space-y-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
              >
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Order Management & Payment Verification (
                  {filteredOrders.length})
                </h3>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-base min-w-[850px]">
                    <thead>
                      <tr
                        className={`border-b text-sm text-slate-400 uppercase font-black ${isDark ? "border-slate-800" : "border-slate-100"}`}
                      >
                        <th className="py-5 px-5 align-middle">Order ID</th>
                        <th className="py-5 px-5 align-middle">Customer</th>
                        <th className="py-5 px-5 align-middle">Item Ordered</th>
                        <th className="py-5 px-5 align-middle">Total</th>
                        <th className="py-5 px-5 align-middle">
                          Payment Status (Cycle)
                        </th>
                        <th className="py-5 px-5 align-middle">
                          Fulfillment (Cycle)
                        </th>
                        <th className="py-5 px-5 align-middle">
                          Assigned Driver
                        </th>
                        <th className="py-5 px-5 align-middle text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y font-medium ${isDark ? "divide-slate-800 text-slate-200" : "divide-slate-100 text-slate-800"}`}
                    >
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-8 text-center text-slate-400 font-semibold text-sm"
                          >
                            No orders match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr
                            key={ord.id}
                            className={`transition ${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}
                          >
                            <td
                              className={`py-5 px-5 font-bold align-middle ${isDark ? "text-blue-400" : "text-blue-600"}`}
                            >
                              {ord.id}
                            </td>
                            <td
                              className={`py-5 px-5 font-bold align-middle ${isDark ? "text-slate-100" : "text-slate-900"}`}
                            >
                              {ord.customer}
                            </td>
                            <td
                              className={`py-5 px-5 font-semibold align-middle ${isDark ? "text-slate-300" : "text-slate-700"}`}
                            >
                              {ord.itemName}
                            </td>
                            <td
                              className={`py-5 px-5 font-bold align-middle ${isDark ? "text-slate-100" : "text-slate-900"}`}
                            >
                              {ord.total}
                            </td>
                            <td className="py-5 px-5 align-middle">
                              <select
                                value={ord.paymentStatus}
                                onChange={(e) =>
                                  handlePaymentStatusChange(
                                    ord.id,
                                    e.target.value,
                                  )
                                }
                                className={`px-3 py-1.5 rounded-xl font-black text-xs border cursor-pointer ${ord.paymentStatus.includes("PAID") ? (isDark ? "bg-purple-950/60 text-purple-300 border-purple-900/50" : "bg-purple-100 text-purple-800 border-purple-200") : isDark ? "bg-rose-950/60 text-rose-300 border-rose-900/50" : "bg-rose-100 text-rose-800 border-rose-200"}`}
                              >
                                <option
                                  value="UNPAID"
                                  className={isDark ? "bg-slate-900" : ""}
                                >
                                  UNPAID
                                </option>
                                <option
                                  value="PAID"
                                  className={isDark ? "bg-slate-900" : ""}
                                >
                                  PAID
                                </option>
                              </select>
                            </td>
                            <td className="py-5 px-5 align-middle">
                              <select
                                value={ord.status}
                                onChange={(e) =>
                                  handleOrderStatusChange(
                                    ord.id,
                                    e.target.value,
                                  )
                                }
                                className={`px-3 py-1.5 rounded-xl font-black text-xs border cursor-pointer ${ord.status === "DELIVERED" ? (isDark ? "bg-emerald-950/60 text-emerald-300 border-emerald-900/50" : "bg-emerald-100 text-emerald-800 border-emerald-200") : isDark ? "bg-orange-950/60 text-orange-300 border-orange-900/50" : "bg-orange-100 text-orange-800 border-orange-200"}`}
                              >
                                <option
                                  value="PENDING"
                                  className={isDark ? "bg-slate-900" : ""}
                                >
                                  PENDING
                                </option>
                                <option
                                  value="READY FOR PICKUP"
                                  className={isDark ? "bg-slate-900" : ""}
                                >
                                  READY FOR PICKUP
                                </option>
                                <option
                                  value="OUT FOR-DELIVERY"
                                  className={isDark ? "bg-slate-900" : ""}
                                >
                                  OUT FOR-DELIVERY
                                </option>
                                <option
                                  value="PICKED UP"
                                  className={isDark ? "bg-slate-900" : ""}
                                >
                                  PICKED UP
                                </option>
                                <option
                                  value="DELIVERED"
                                  className={isDark ? "bg-slate-900" : ""}
                                >
                                  DELIVERED
                                </option>
                              </select>
                            </td>
                            <td
                              className={`py-5 px-5 font-bold align-middle ${isDark ? "text-blue-300" : "text-blue-700"}`}
                            >
                              {ord.rider ? (
                                <span
                                  className={`px-3 py-1 rounded-xl text-xs border ${isDark ? "bg-blue-950/50 border-blue-900/50" : "bg-blue-50 border-blue-200"}`}
                                >
                                  {ord.rider}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs italic">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="py-5 px-5 text-center whitespace-nowrap align-middle">
                              <div className="inline-flex items-center space-x-2">
                                <button
                                  onClick={() => setAssigningOrder(ord)}
                                  className={`px-3 py-2 font-bold rounded-xl border transition inline-flex items-center space-x-1 cursor-pointer text-xs ${isDark ? "bg-blue-950/50 hover:bg-blue-900/50 text-blue-400 border-blue-950" : "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"}`}
                                  title="Assign Rider"
                                >
                                  <UserCheck className="h-4 w-4" />
                                  <span>Assign</span>
                                </button>
                                <button
                                  onClick={() => setSelectedOrder(ord)}
                                  className={`px-3 py-2 font-bold rounded-xl border transition inline-flex items-center space-x-1 cursor-pointer text-xs ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700" : "bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200"}`}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => confirmDeleteOrder(ord.id)}
                                  className={`px-3 py-2 font-bold rounded-xl border transition inline-flex items-center space-x-1 cursor-pointer text-xs ${isDark ? "bg-rose-950/50 hover:bg-rose-900/50 text-rose-400 border-rose-950" : "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200"}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Stack View */}
                <div className="md:hidden space-y-4">
                  {filteredOrders.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">
                      No orders found.
                    </p>
                  ) : (
                    filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className={`border rounded-2xl p-4 space-y-3 shadow-sm ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-xs font-mono font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}
                          >
                            {ord.id}
                          </span>
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleOrderStatusChange(ord.id, e.target.value)
                            }
                            className={`px-2.5 py-1 rounded-xl font-black text-[11px] border cursor-pointer ${isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200"}`}
                          >
                            <option
                              value="PENDING"
                              className={isDark ? "bg-slate-900" : ""}
                            >
                              PENDING
                            </option>
                            <option
                              value="READY FOR PICKUP"
                              className={isDark ? "bg-slate-900" : ""}
                            >
                              READY FOR PICKUP
                            </option>
                            <option
                              value="OUT FOR-DELIVERY"
                              className={isDark ? "bg-slate-900" : ""}
                            >
                              OUT FOR-DELIVERY
                            </option>
                            <option
                              value="PICKED UP"
                              className={isDark ? "bg-slate-900" : ""}
                            >
                              PICKED UP
                            </option>
                            <option
                              value="DELIVERED"
                              className={isDark ? "bg-slate-900" : ""}
                            >
                              DELIVERED
                            </option>
                          </select>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold text-xs uppercase">
                              Customer
                            </span>
                            <span
                              className={`font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                            >
                              {ord.customer}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold text-xs uppercase">
                              Item
                            </span>
                            <span
                              className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}
                            >
                              {ord.itemName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold text-xs uppercase">
                              Total
                            </span>
                            <span
                              className={`font-black ${isDark ? "text-blue-400" : "text-blue-600"}`}
                            >
                              {ord.total}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-slate-400 font-bold text-xs uppercase">
                              Payment
                            </span>
                            <select
                              value={ord.paymentStatus}
                              onChange={(e) =>
                                handlePaymentStatusChange(
                                  ord.id,
                                  e.target.value,
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg font-black text-[11px] border cursor-pointer ${isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200"}`}
                            >
                              <option
                                value="UNPAID"
                                className={isDark ? "bg-slate-900" : ""}
                              >
                                UNPAID
                              </option>
                              <option
                                value="PAID"
                                className={isDark ? "bg-slate-900" : ""}
                              >
                                PAID
                              </option>
                            </select>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-400 font-bold text-xs uppercase">
                              Driver
                            </span>
                            <span
                              className={`font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}
                            >
                              {ord.rider || "Unassigned"}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`pt-2 border-t flex justify-end space-x-2 ${isDark ? "border-slate-800" : "border-slate-200"}`}
                        >
                          <button
                            onClick={() => setAssigningOrder(ord)}
                            className={`px-3 py-1.5 font-bold rounded-xl border text-xs ${isDark ? "bg-blue-950/50 text-blue-400 border-blue-900/50" : "bg-blue-50 text-blue-600 border-blue-200"}`}
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className={`px-3 py-1.5 font-bold rounded-xl border text-xs ${isDark ? "bg-slate-900 text-slate-200 border-slate-700" : "bg-white text-slate-700 border-slate-200"}`}
                          >
                            View
                          </button>
                          <button
                            onClick={() => confirmDeleteOrder(ord.id)}
                            className={`px-3 py-1.5 font-bold rounded-xl border text-xs ${isDark ? "bg-rose-950/50 text-rose-400 border-rose-900/50" : "bg-rose-50 text-rose-600 border-rose-200"}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. PRODUCTS TAB ================= */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-row items-center justify-between gap-2.5 sm:gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3.5 sm:left-4 top-3 h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 border rounded-xl text-xs font-bold outline-none shadow-sm truncate ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}`}
                    />
                  </div>

                  <div
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2.5 rounded-xl border shadow-sm shrink-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                  >
                    <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                    <select
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className={`bg-transparent text-xs sm:text-sm font-bold outline-none cursor-pointer ${isDark ? "text-slate-200" : "text-slate-700"}`}
                    >
                      <option
                        value="All"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        All Categories
                      </option>
                      <option
                        value="Refill"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        Refill
                      </option>
                      <option
                        value="Hardware"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        Hardware
                      </option>
                      <option
                        value="Low Stock"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        Low Stock Only
                      </option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProdName("");
                    setNewProdPrice("");
                    setNewProdStock("");
                    setNewProdMinStock("10");
                    setIsAddProductOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-blue-500/20 cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 stroke-[3]" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                  <div
                    className={`col-span-full p-8 rounded-3xl border text-center text-slate-400 font-semibold text-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                  >
                    No inventory items match your filter criteria.
                  </div>
                ) : (
                  filteredProducts.map((prod) => {
                    const isLowStock = prod.stock <= (prod.minStock || 10);
                    return (
                      <div
                        key={prod.id}
                        className={`p-7 rounded-[28px] border shadow-sm space-y-4 relative group transition ${isLowStock ? (isDark ? "border-amber-800 bg-amber-950/20" : "border-amber-300 bg-amber-50/20") : isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                      >
                        <div className="flex justify-between items-start">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border ${isDark ? "bg-blue-950/50 text-blue-400 border-blue-900/50" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                          >
                            {prod.category}
                          </span>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className={`transition cursor-pointer p-1 ${isDark ? "text-slate-400 hover:text-blue-400" : "text-slate-400 hover:text-blue-600"}`}
                              title="Edit Product"
                            >
                              <Edit3 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => confirmDeleteProduct(prod.id)}
                              className="text-slate-400 hover:text-rose-500 transition cursor-pointer p-1"
                              title="Delete Product"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <h4
                          className={`font-black text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}
                        >
                          {prod.name}
                        </h4>

                        {isLowStock && (
                          <div
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-black ${isDark ? "bg-amber-950/60 text-amber-200 border-amber-900/60" : "bg-amber-100/80 text-amber-950 border-amber-200"}`}
                          >
                            <AlertTriangle
                              className={`h-4 w-4 shrink-0 ${isDark ? "text-amber-400" : "text-amber-700"}`}
                            />
                            <span>
                              LOW STOCK WARNING (Min: {prod.minStock})
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex justify-between items-center pt-4 border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}
                        >
                          <span
                            className={`text-base font-black ${isDark ? "text-blue-400" : "text-blue-600"}`}
                          >
                            {prod.price}
                          </span>
                          <span
                            className={`text-sm font-black ${isLowStock ? (isDark ? "text-amber-400" : "text-amber-700") : isDark ? "text-slate-300" : "text-slate-700"}`}
                          >
                            Stock: {prod.stock} units
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= 4. SALES REPORTS & GENERATE REPORTS TAB ================= */}
          {activeTab === "reports" && (
            <div className="space-y-8 animate-fadeIn">
              <div
                className={`flex justify-between items-center flex-wrap gap-3 p-4 sm:p-6 rounded-[28px] border shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
              >
                <div>
                  <h3
                    className={`text-base sm:text-lg font-black ${isDark ? "text-slate-100" : "text-slate-950"}`}
                  >
                    Generate Reports & Analytics
                  </h3>
                  <p
                    className={`text-xs sm:text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Filter financial statements, sales logs, and WMA demand
                    forecasts.
                  </p>
                </div>

                <div className="flex flex-row items-center gap-2 w-full sm:w-auto flex-wrap">
                  <div
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border flex-1 sm:flex-initial ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                  >
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <select
                      value={reportType}
                      onChange={(e) =>
                        setReportType(e.target.value as "sales" | "inventory")
                      }
                      className={`bg-transparent text-xs sm:text-sm font-bold outline-none cursor-pointer w-full ${isDark ? "text-slate-200" : "text-slate-700"}`}
                    >
                      <option
                        value="sales"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        Sales & Transactions
                      </option>
                      <option
                        value="inventory"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        WMA Trend & Forecast
                      </option>
                    </select>
                  </div>

                  <div
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border flex-1 sm:flex-initial ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                  >
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <select
                      value={reportDateRange}
                      onChange={(e) => setReportDateRange(e.target.value)}
                      className={`bg-transparent text-xs sm:text-sm font-bold outline-none cursor-pointer w-full ${isDark ? "text-slate-200" : "text-slate-700"}`}
                    >
                      <option
                        value="Today"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        Today
                      </option>
                      <option
                        value="This Week"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        This Week
                      </option>
                      <option
                        value="This Month"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        This Month
                      </option>
                      <option
                        value="Year-to-Date"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        Year-to-Date
                      </option>
                    </select>
                  </div>

                  {reportType === "inventory" && (
                    <div
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border flex-1 sm:flex-initial ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                    >
                      <TrendingUp className="h-4 w-4 text-slate-400 shrink-0" />
                      <select
                        value={forecastPeriod}
                        onChange={(e) =>
                          setForecastPeriod(
                            e.target.value as "daily" | "weekly" | "monthly",
                          )
                        }
                        className={`bg-transparent text-xs sm:text-sm font-bold outline-none cursor-pointer w-full ${isDark ? "text-slate-200" : "text-slate-700"}`}
                      >
                        <option
                          value="daily"
                          className={isDark ? "bg-slate-900" : ""}
                        >
                          Daily Sales
                        </option>
                        <option
                          value="weekly"
                          className={isDark ? "bg-slate-900" : ""}
                        >
                          Weekly Sales
                        </option>
                        <option
                          value="monthly"
                          className={isDark ? "bg-slate-900" : ""}
                        >
                          Monthly Sales
                        </option>
                      </select>
                    </div>
                  )}

                  <button
                    onClick={() => setIsRecordSaleOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center space-x-1.5 shadow-md cursor-pointer flex-1 sm:flex-initial justify-center"
                  >
                    <Receipt className="h-4 w-4 shrink-0" />
                    <span>Record</span>
                  </button>
                  <button
                    onClick={() => {
                      const csvRows = [];

                      if (reportType === "sales") {
                        // Headers
                        csvRows.push(
                          [
                            "TXN ID",
                            "Buyer / Customer",
                            "Item",
                            "Qty",
                            "Total",
                            "Method",
                            "Date",
                          ].join(","),
                        );

                        // Rows
                        salesRecords.forEach((s) => {
                          const row = [
                            `"${s.TransactionID}"`,
                            `"${s.CustomerName}"`,
                            `"${s.ItemName}"`,
                            s.Quantity,
                            `"${s.TotalAmount}"`,
                            `"${s.PaymentMethod}"`,
                            `"${s.Date}"`,
                          ];
                          csvRows.push(row.join(","));
                        });
                      } else {
                        // Headers
                        csvRows.push(
                          [
                            "Forecast ID",
                            "Product Name",
                            "Forecast Date",
                            "Forecasted Demand",
                          ].join(","),
                        );

                        // Rows
                        forecastList.forEach((f) => {
                          const row = [
                            `"${f.ForecastID}"`,
                            `"${f.ProductName}"`,
                            `"${f.ForecastDate}"`,
                            f.ForecastedDemand,
                          ];
                          csvRows.push(row.join(","));
                        });
                      }

                      // Prepend UTF-8 BOM (\ufeff) so Excel reads currency symbols (₱) and characters correctly
                      const blob = new Blob(["\ufeff" + csvRows.join("\n")], {
                        type: "text/csv;charset=utf-8;",
                      });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute(
                        "download",
                        `${reportType}_report_${reportDateRange.toLowerCase().replace(/\s+/g, "_")}.csv`,
                      );
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      showToast(
                        `Successfully exported ${reportType} report as clean CSV!`,
                        "success",
                      );
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center space-x-1.5 shadow-md cursor-pointer flex-1 sm:flex-initial justify-center"
                  >
                    <Download className="h-4 w-4 shrink-0" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                  className={`p-6 rounded-[28px] border shadow-sm flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Transactions Logged
                    </span>
                    <h3
                      className={`text-3xl font-black ${isDark ? "text-blue-400" : "text-blue-600"}`}
                    >
                      {salesRecords.length}
                    </h3>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl border ${isDark ? "bg-blue-950/50 text-blue-400 border-blue-900/50" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                  >
                    <TrendingUp className="h-7 w-7" />
                  </div>
                </div>

                <div
                  className={`p-6 rounded-[28px] border shadow-sm flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Orders
                    </span>
                    <h3
                      className={`text-3xl font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}
                    >
                      {orders.length}
                    </h3>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl border ${isDark ? "bg-emerald-950/50 text-emerald-400 border-emerald-900/50" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}
                  >
                    <ShoppingCart className="h-7 w-7" />
                  </div>
                </div>

                <div
                  className={`p-6 rounded-[28px] border shadow-sm flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Fulfillment Rate
                    </span>
                    <h3
                      className={`text-3xl font-black ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                    >
                      100%
                    </h3>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl border ${isDark ? "bg-emerald-950/50 text-emerald-400 border-emerald-900/50" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}
                  >
                    <CheckCircle className="h-7 w-7" />
                  </div>
                </div>

                <div
                  className={`p-6 rounded-[28px] border shadow-sm flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Active Forecasts
                    </span>
                    <h3
                      className={`text-3xl font-black ${isDark ? "text-purple-400" : "text-purple-600"}`}
                    >
                      {forecastList.length} Items
                    </h3>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl border ${isDark ? "bg-purple-950/50 text-purple-400 border-purple-900/50" : "bg-purple-50 text-purple-600 border-purple-100"}`}
                  >
                    <Coins className="h-7 w-7" />
                  </div>
                </div>
              </div>

              {reportType === "sales" ? (
                <div className="space-y-8 animate-fadeIn">
                  {/* Visual Charts Grid for Sales */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div
                      className={`p-6 sm:p-8 rounded-[32px] border shadow-sm space-y-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                    >
                      <h3
                        className={`text-base font-black uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}
                      >
                        Sales Volume by Product Variant
                      </h3>
                      <div
                        className={`h-64 flex flex-col justify-end p-6 rounded-2xl border relative ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"}`}
                      >
                        <div className="flex justify-around items-end h-48 w-full gap-4 pt-6">
                          <div className="flex flex-col items-center flex-1 h-full justify-end">
                            <span
                              className={`text-xs font-bold mb-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                            >
                              2 Units
                            </span>
                            <div
                              className="w-16 bg-blue-600 dark:bg-blue-500 rounded-t-xl transition-all duration-500 hover:bg-blue-700"
                              style={{ height: "70%" }}
                            ></div>
                            <span
                              className={`text-[11px] font-bold mt-2 truncate w-full text-center ${isDark ? "text-slate-400" : "text-slate-600"}`}
                            >
                              5-Gallon Refill
                            </span>
                          </div>
                          <div className="flex flex-col items-center flex-1 h-full justify-end">
                            <span className="text-xs font-bold text-slate-400 mb-1">
                              0 Units
                            </span>
                            <div
                              className={`w-16 rounded-t-xl ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                              style={{ height: "10%" }}
                            ></div>
                            <span
                              className={`text-[11px] font-bold mt-2 truncate w-full text-center ${isDark ? "text-slate-400" : "text-slate-600"}`}
                            >
                              Dispenser Pump
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-6 sm:p-8 rounded-[32px] border shadow-sm space-y-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                    >
                      <h3
                        className={`text-base font-black uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}
                      >
                        Order Status Distribution
                      </h3>
                      <div
                        className={`h-64 flex flex-col justify-center p-6 rounded-2xl border space-y-4 ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"}`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm font-bold">
                            <span
                              className={`flex items-center space-x-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block"></span>
                              <span>Delivered</span>
                            </span>
                            <span
                              className={`font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}
                            >
                              {
                                orders.filter((o) => o.status === "DELIVERED")
                                  .length
                              }{" "}
                              Orders
                            </span>
                          </div>
                          <div
                            className={`w-full h-3.5 rounded-full overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                          >
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{
                                width: `${orders.length ? (orders.filter((o) => o.status === "DELIVERED").length / orders.length) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm font-bold">
                            <span
                              className={`flex items-center space-x-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 inline-block"></span>
                              <span>Out for Delivery</span>
                            </span>
                            <span
                              className={`font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}
                            >
                              {
                                orders.filter(
                                  (o) => o.status === "OUT FOR-DELIVERY",
                                ).length
                              }{" "}
                              Orders
                            </span>
                          </div>
                          <div
                            className={`w-full h-3.5 rounded-full overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                          >
                            <div
                              className="bg-blue-500 h-full rounded-full"
                              style={{
                                width: `${orders.length ? (orders.filter((o) => o.status === "OUT FOR-DELIVERY").length / orders.length) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full Transactions Breakdown Table */}
                  <div
                    className={`p-6 sm:p-8 rounded-[32px] border shadow-sm space-y-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                  >
                    <div className="flex justify-between items-center">
                      <h3
                        className={`text-base font-black uppercase flex items-center space-x-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}
                      >
                        <Receipt
                          className={`h-5 w-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                        />
                        <span>
                          Sales & Transactions Breakdown ({reportDateRange})
                        </span>
                      </h3>
                      <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                        Showing all cloud registered logs
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-base min-w-[700px]">
                        <thead>
                          <tr
                            className={`border-b text-sm text-slate-400 uppercase font-black ${isDark ? "border-slate-800" : "border-slate-100"}`}
                          >
                            <th className="py-4 px-4 align-middle">TXN ID</th>
                            <th className="py-4 px-4 align-middle">
                              Buyer / Customer
                            </th>
                            <th className="py-4 px-4 align-middle">Item</th>
                            <th className="py-4 px-4 align-middle">Qty</th>
                            <th className="py-4 px-4 align-middle">Total</th>
                            <th className="py-4 px-4 align-middle">Method</th>
                            <th className="py-4 px-4 align-middle text-right">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className={`divide-y font-medium ${isDark ? "divide-slate-800 text-slate-200" : "divide-slate-100 text-slate-800"}`}
                        >
                          {salesRecords.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="py-8 text-center text-slate-400"
                              >
                                No sales transactions recorded yet.
                              </td>
                            </tr>
                          ) : (
                            salesRecords.map((txn) => (
                              <tr
                                key={txn.TransactionID}
                                className={`transition ${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}
                              >
                                <td
                                  className={`py-5 px-4 font-bold align-middle ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                                >
                                  {txn.TransactionID}
                                </td>
                                <td
                                  className={`py-5 px-4 font-bold align-middle ${isDark ? "text-slate-100" : "text-slate-900"}`}
                                >
                                  {txn.CustomerName}
                                </td>
                                <td
                                  className={`py-5 px-4 align-middle ${isDark ? "text-slate-300" : "text-slate-700"}`}
                                >
                                  {txn.ItemName}
                                </td>
                                <td
                                  className={`py-5 px-4 align-middle ${isDark ? "text-slate-300" : "text-slate-700"}`}
                                >
                                  {txn.Quantity}
                                </td>
                                <td
                                  className={`py-5 px-4 font-bold align-middle ${isDark ? "text-blue-400" : "text-blue-600"}`}
                                >
                                  {txn.TotalAmount}
                                </td>
                                <td className="py-5 px-4 align-middle">
                                  <span
                                    className={`px-3 py-1 rounded-lg text-xs font-bold ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}
                                  >
                                    {txn.PaymentMethod}
                                  </span>
                                </td>
                                <td
                                  className={`py-5 px-4 text-right text-xs align-middle ${isDark ? "text-slate-400" : "text-slate-600"}`}
                                >
                                  {txn.Date}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                  <div
                    className={`p-6 sm:p-8 rounded-[32px] border shadow-sm space-y-5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3
                          className={`text-base font-black uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}
                        >
                          Weighted Moving Average Trend
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Actual sales grouped by {forecastPeriod} period.
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-xl text-xs font-black ${forecastAnalysis.trend === "Increasing" ? (isDark ? "bg-emerald-950/50 text-emerald-300" : "bg-emerald-50 text-emerald-700") : forecastAnalysis.trend === "Decreasing" ? (isDark ? "bg-rose-950/50 text-rose-300" : "bg-rose-50 text-rose-700") : isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}
                      >
                        {forecastAnalysis.trend}
                      </span>
                    </div>
                    {forecastAnalysis.periods.length === 0 ? (
                      <div
                        className={`h-56 flex items-center justify-center rounded-2xl border text-sm font-bold text-slate-400 ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"}`}
                      >
                        Not enough sales data for analysis yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {forecastAnalysis.periods.map(([period, value]) => {
                          const max = Math.max(
                            forecastAnalysis.forecast,
                            ...forecastAnalysis.values,
                            1,
                          );
                          return (
                            <div key={period}>
                              <div
                                className={`flex justify-between text-xs font-black mb-1.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}
                              >
                                <span>{period}</span>
                                <span>₱{Number(value).toFixed(2)}</span>
                              </div>
                              <div
                                className={`h-4 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}n`}
                              >
                                <div
                                  className="h-full rounded-full bg-blue-600"
                                  style={{
                                    width: `${Math.max(3, (Number(value) / max) * 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        <div
                          className={`pt-3 border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}
                        >
                          <div
                            className={`flex justify-between text-xs font-black mb-1.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}
                          >
                            <span>Next-period WMA forecast</span>
                            <span
                              className={` ${isDark ? "text-purple-400" : "text-purple-600"}`}
                            >
                              ₱{forecastAnalysis.forecast.toFixed(2)}
                            </span>
                          </div>
                          <div
                            className={`h-4 rounded-full overflow-hidden ${isDark ? "bg-purple-950/50" : "bg-purple-50"}`}
                          >
                            <div
                              className="h-full rounded-full bg-purple-600"
                              style={{
                                width: `${Math.min(100, Math.max(3, (forecastAnalysis.forecast / Math.max(forecastAnalysis.forecast, ...forecastAnalysis.values, 1)) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={`p-6 sm:p-8 rounded-[32px] border shadow-sm space-y-5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                  >
                    <div>
                      <h3
                        className={`text-base font-black uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}
                      >
                        Forecast Analysis
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Three-period weighted moving average using weights 1, 2,
                        and 3.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`rounded-2xl border p-4 ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"}`}
                      >
                        <span className="block text-[10px] font-black uppercase text-slate-400">
                          Latest sales
                        </span>
                        <strong
                          className={`block text-xl mt-1 ${isDark ? "text-slate-100" : "text-slate-900"}`}
                        >
                          ₱{forecastAnalysis.latest.toFixed(2)}
                        </strong>
                      </div>
                      <div
                        className={`rounded-2xl border p-4 ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"}`}
                      >
                        <span className="block text-[10px] font-black uppercase text-slate-400">
                          WMA forecast
                        </span>
                        <strong
                          className={`block text-xl mt-1 ${isDark ? "text-purple-400" : "text-purple-600"}`}
                        >
                          ₱{forecastAnalysis.forecast.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                    <div
                      className={`rounded-2xl border p-4 text-xs font-bold ${isDark ? "bg-blue-950/40 border-blue-900/50 text-blue-300" : "bg-blue-50 border-blue-100 text-blue-800"}`}
                    >
                      {forecastAnalysis.periods.length < 3
                        ? "The system will become more reliable as at least three historical periods are recorded."
                        : `Based on the latest ${forecastAnalysis.periods.length} ${forecastPeriod} sales periods, the weighted forecast emphasizes the most recent period.`}
                    </div>
                    <div className="overflow-x-auto">
                      <table
                        className={`w-full text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}
                      >
                        <thead>
                          <tr
                            className={`border-b text-[10px] uppercase text-slate-400 ${isDark ? "border-slate-800" : "border-slate-100"}`}
                          >
                            <th className="text-left py-2">Period</th>
                            <th className="text-right py-2">Actual Sales</th>
                            <th className="text-right py-2">Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {forecastAnalysis.periods.map(
                            ([period, value], index) => (
                              <tr
                                key={period}
                                className={`border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}
                              >
                                <td className="py-2 font-bold">{period}</td>
                                <td className="py-2 text-right">
                                  ₱{Number(value).toFixed(2)}
                                </td>
                                <td className="py-2 text-right font-black">
                                  {index + 1}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 5. CUSTOMER DIRECTORY TAB ================= */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-row items-center justify-between gap-2.5 sm:gap-4 flex-wrap sm:flex-nowrap">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3.5 sm:let-4 top-3.5 h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 border rounded-2xl text-xs sm:text-sm font-bold outline-none shadow-sm truncate ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingCustomer(null);
                    setNewCustFirstName("");
                    setNewCustLastName("");
                    setNewCustMiddleName("");
                    setNewCustSuffix("");
                    setNewCustAddress("");
                    setNewCustBarangay("");
                    setNewCustContact("");
                    setNewCustEmail("");
                    setIsAddCustomerOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 shadow-lg cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 stroke-[3]" />
                  <span>Register Customer</span>
                </button>
              </div>

              <div
                className={`rounded-[32px] border shadow-sm overflow-hidden p-4 sm:p-6 space-y-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
              >
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Registered Customer Accounts ({filteredCustomers.length})
                </h3>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-base min-w-[700px]">
                    <thead>
                      <tr
                        className={`border-b text-sm text-slate-400 uppercase font-black ${isDark ? "border-slate-800" : "border-slate-100"}`}
                      >
                        <th className="py-5 px-5 align-middle">ID</th>
                        <th className="py-5 px-5 align-middle">Full Name</th>
                        <th className="py-5 px-5 align-middle">Address</th>
                        <th className="py-5 px-5 align-middle">Contact</th>
                        <th className="py-5 px-5 align-middle">Email</th>
                        <th className="py-5 px-5 align-middle text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y font-medium ${isDark ? "divide-slate-800 text-slate-200" : "divide-slate-100 text-slate-800"}`}
                    >
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-slate-400 font-semibold text-sm"
                          >
                            No customers match your search.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((cust) => (
                          <tr
                            key={cust.CustomerID}
                            className={`transition ${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}
                          >
                            <td
                              className={`py-5 px-5 font-bold align-middle ${isDark ? "text-blue-400" : "text-blue-600"}`}
                            >
                              #CUST-{cust.CustomerID}
                            </td>
                            <td
                              className={`py-5 px-5 font-bold align-middle ${isDark ? "text-slate-100" : "text-slate-900"}`}
                            >
                              {cust.LastName}, {cust.FirstName}{" "}
                              {cust.MiddleName} {cust.Suffix}
                            </td>
                            <td
                              className={`py-5 px-5 align-middle ${isDark ? "text-slate-300" : "text-slate-700"}`}
                            >
                              {cust.Address}
                            </td>
                            <td
                              className={`py-5 px-5 align-middle ${isDark ? "text-slate-300" : "text-slate-700"}`}
                            >
                              {cust.ContactNumber}
                            </td>
                            <td
                              className={`py-5 px-5 font-bold align-middle ${isDark ? "text-blue-400" : "text-blue-600"}`}
                            >
                              {cust.Email}
                            </td>
                            <td className="py-5 px-5 text-center whitespace-nowrap align-middle">
                              <div className="inline-flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    setViewingCustomerHistory(cust)
                                  }
                                  className={`px-3 py-2 font-bold rounded-xl border text-xs ${isDark ? "bg-blue-950/50 text-blue-400 border-blue-900/50" : "bg-blue-50 text-blue-600 border-blue-200"}`}
                                >
                                  History
                                </button>
                                <button onClick={() => handleAdminResetPassword(cust, "Customer")} className={`px-3 py-2 font-bold rounded-xl border text-xs ${isDark ? "bg-amber-950/50 text-amber-300 border-amber-900/50" : "bg-amber-50 text-amber-700 border-amber-200"}`}>Reset Password</button>
                                <button
                                  onClick={() => handleOpenEditCustomer(cust)}
                                  className={`px-3 py-2 font-bold rounded-xl border text-xs ${isDark ? "bg-slate-800 text-slate-200 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200"}`}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => repairAuthLogin(cust.ProfileID, "Customer")}
                                  className={`px-3 py-2 font-bold rounded-xl border text-xs ${isDark ? "bg-amber-950/50 text-amber-400 border-amber-900/50" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                                >
                                  Repair Login
                                </button>
                                <button
                                  onClick={() => confirmDeleteCustomer(cust)}
                                  className={`px-3 py-2 font-bold rounded-xl border transition text-xs cursor-pointer ${isDark ? "bg-rose-950/50 text-rose-400 border-rose-950" : "bg-rose-50 text-rose-600 border-rose-200"}`}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Stack View */}
                <div className="md:hidden space-y-4">
                  {filteredCustomers.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">
                      No customers found.
                    </p>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <div
                        key={cust.CustomerID}
                        className={`border rounded-2xl p-4 space-y-3 shadow-sm ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-xs font-mono font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}
                          >
                            #CUST-{cust.CustomerID}
                          </span>
                          <span className="text-xs font-bold text-slate-400 truncate max-w-[180px]">
                            {cust.Email}
                          </span>
                        </div>
                        <div>
                          <h4
                            className={`font-bold text-base ${isDark ? "text-slate-100" : "text-slate-900"}`}
                          >
                            {cust.LastName}, {cust.FirstName} {cust.MiddleName}{" "}
                            {cust.Suffix}
                          </h4>
                          <p
                            className={`text-xs mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}
                          >
                            📍 {cust.Address}
                          </p>
                          <p
                            className={`text-xs font-semibold mt-0.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}
                          >
                            📞 {cust.ContactNumber}
                          </p>
                        </div>
                        <div
                          className={`pt-2 border-t flex justify-end space-x-2 ${isDark ? "border-slate-800" : "border-slate-200"}`}
                        >
                          <button
                            onClick={() => setViewingCustomerHistory(cust)}
                            className={`px-3 py-1.5 font-bold rounded-xl border text-xs ${isDark ? "bg-blue-950/50 text-blue-400 border-blue-900/50" : "bg-blue-50 text-blue-600 border-blue-200"}`}
                          >
                            History
                          </button>
                          <button onClick={() => handleAdminResetPassword(cust, "Customer")} className={`px-3 py-1.5 font-bold rounded-xl border text-xs ${isDark ? "bg-amber-950/50 text-amber-300 border-amber-900/50" : "bg-amber-50 text-amber-700 border-amber-200"}`}>Reset</button>
                          <button
                            onClick={() => handleOpenEditCustomer(cust)}
                            className={`px-3 py-1.5 font-bold rounded-xl border text-xs ${isDark ? "bg-slate-900 text-slate-200 border-slate-700" : "bg-white text-slate-700 border-slate-200"}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDeleteCustomer(cust)}
                            className={`px-3 py-1.5 font-bold rounded-xl border text-xs ${isDark ? "bg-rose-950/50 text-rose-400 border-rose-900/50" : "bg-rose-50 text-rose-600 border-rose-200"}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. STAFF & DRIVERS TAB ================= */}
          {activeTab === "staff" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-row items-center justify-between gap-2.5 sm:gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3.5 sm:left-4 top-3 h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search staff..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 border rounded-xl text-xs font-bold outline-none shadow-sm truncate ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}`}
                    />
                  </div>

                  <div
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2.5 rounded-xl border shadow-sm shrink-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                  >
                    <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                    <select
                      value={staffFilter}
                      onChange={(e) => setStaffFilter(e.target.value)}
                      className={`bg-transparent text-xs sm:text-sm font-bold outline-none cursor-pointer ${isDark ? "text-slate-200" : "text-slate-700"}`}
                    >
                      <option
                        value="All"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        All Roles
                      </option>
                      <option
                        value="Admin"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        Admin
                      </option>
                      <option
                        value="Staff"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        Staff
                      </option>
                      <option
                        value="Delivery"
                        className={isDark ? "bg-slate-900" : ""}
                      >
                        Delivery
                      </option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingStaff(null);
                    setNewStaffFirstName("");
                    setNewStaffLastName("");
                    setNewStaffMiddleName("");
                    setNewStaffSuffix("");
                    setNewStaffRole("Delivery");
                    setNewStaffContact("");
                    setNewStaffEmail("");
                    setIsAddStaffOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 shadow-lg cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 stroke-[3]" />
                  <span>Add Staff</span>
                </button>
              </div>

              <div
                className={`rounded-[32px] border shadow-sm overflow-hidden p-4 sm:p-6 space-y-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
              >
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Staff & Driver Roster ({filteredStaff.length})
                </h3>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-base min-w-[700px]">
                    <thead>
                      <tr
                        className={`border-b text-sm text-slate-400 uppercase font-black ${isDark ? "border-slate-800" : "border-slate-100"}`}
                      >
                        <th className="py-5 px-5 align-middle">Staff ID</th>
                        <th className="py-5 px-5 align-middle">Full Name</th>
                        <th className="py-5 px-5 align-middle">Role</th>
                        <th className="py-5 px-5 align-middle">Login Email</th>
                        <th className="py-5 px-5 align-middle">Contact</th>
                        <th className="py-5 px-5 align-middle text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y font-medium ${isDark ? "divide-slate-800 text-slate-200" : "divide-slate-100 text-slate-800"}`}
                    >
                      {filteredStaff.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-slate-400 font-semibold text-sm"
                          >
                            No staff members match your filter.
                          </td>
                        </tr>
                      ) : (
                        filteredStaff.map((stf) => (
                          <tr
                            key={stf.StaffID}
                            className={`transition ${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}
                          >
                            <td
                              className={`py-5 px-5 font-bold align-middle ${isDark ? "text-blue-400" : "text-blue-600"}`}
                            >
                              #STF-00{stf.StaffID}
                            </td>
                            <td
                              className={`py-5 px-5 font-bold align-middle ${isDark ? "text-slate-100" : "text-slate-900"}`}
                            >
                              {stf.LastName}, {stf.FirstName} {stf.MiddleName}{" "}
                              {stf.Suffix}
                            </td>
                            <td className="py-5 px-5 align-middle">
                              <span
                                className={`px-4 py-1.5 rounded-full font-black text-xs tracking-wider inline-flex items-center space-x-1 ${stf.Role === "Admin" ? (isDark ? "bg-purple-950/60 text-purple-300 border border-purple-900/50" : "bg-purple-100 text-purple-800 border border-purple-200") : stf.Role === "Staff" ? (isDark ? "bg-blue-950/60 text-blue-300 border border-blue-900/50" : "bg-blue-100 text-blue-800 border border-blue-200") : isDark ? "bg-emerald-950/60 text-emerald-300 border border-emerald-900/50" : "bg-emerald-100 text-emerald-800 border border-emerald-200"}`}
                              >
                                <span>{stf.Role}</span>
                              </span>
                            </td>
                            <td
                              className={`py-5 px-5 font-bold align-middle flex items-center space-x-1.5 pt-7 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                            >
                              <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                              <span>{stf.Email || "No Email"}</span>
                            </td>
                            <td
                              className={`py-5 px-5 align-middle ${isDark ? "text-slate-300" : "text-slate-700"}`}
                            >
                              {stf.ContactNumber}
                            </td>
                            <td className="py-5 px-5 text-center whitespace-nowrap align-middle">
                              <div className="inline-flex items-center space-x-2">
                                <button
                                  onClick={() => setSelectedStaffDetails(stf)}
                                  className={`px-3 py-2 font-bold rounded-xl border transition text-xs cursor-pointer ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700" : "bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200"}`}
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleOpenEditStaff(stf)}
                                  className={`px-3 py-2 font-bold rounded-xl border transition text-xs cursor-pointer ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700" : "bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200"}`}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => repairAuthLogin(stf.ProfileID, "Staff")}
                                  className={`px-3 py-2 font-bold rounded-xl border text-xs ${isDark ? "bg-amber-950/50 text-amber-400 border-amber-900/50" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                                >
                                  Repair Login
                                </button>
                                <button onClick={() => handleAdminResetPassword(stf, "Staff / Delivery")} className={`px-3 py-2 font-bold rounded-xl border text-xs ${isDark ? "bg-amber-950/50 text-amber-300 border-amber-900/50" : "bg-amber-50 text-amber-700 border-amber-200"}`}>Reset Password</button>
                                <button
                                  onClick={() =>
                                    confirmDeleteStaff(stf)
                                  }
                                  className={`px-3 py-2 font-bold rounded-xl border transition text-xs cursor-pointer ${isDark ? "bg-rose-950/50 text-rose-400 border-rose-950" : "bg-rose-50 text-rose-600 border-rose-200"}`}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Stack View */}
                <div className="md:hidden space-y-4">
                  {filteredStaff.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">
                      No staff members match your filter.
                    </p>
                  ) : (
                    filteredStaff.map((stf) => (
                      <div
                        key={stf.StaffID}
                        className={`border rounded-2xl p-4 space-y-3 shadow-sm ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-xs font-mono font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}
                          >
                            #STF-00{stf.StaffID}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full font-black text-xs ${stf.Role === "Admin" ? (isDark ? "bg-purple-950/60 text-purple-300" : "bg-purple-100 text-purple-800") : stf.Role === "Staff" ? (isDark ? "bg-blue-950/60 text-blue-300" : "bg-blue-100 text-blue-800") : isDark ? "bg-emerald-950/60 text-emerald-300" : "bg-emerald-100 text-emerald-800"}`}
                          >
                            {stf.Role}
                          </span>
                        </div>
                        <div>
                          <h4
                            className={`font-bold text-base ${isDark ? "text-slate-100" : "text-slate-900"}`}
                          >
                            {stf.LastName}, {stf.FirstName} {stf.MiddleName}{" "}
                            {stf.Suffix}
                          </h4>
                          <p className="text-xs text-slate-400 truncate mt-1 flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-blue-400 shrink-0" />
                            <span>{stf.Email || "No Email"}</span>
                          </p>
                          <p
                            className={`text-xs font-semibold mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}
                          >
                            📞 {stf.ContactNumber}
                          </p>
                        </div>
                        <div
                          className={`pt-2 border-t flex justify-end space-x-2 ${isDark ? "border-slate-800" : "border-slate-200"}`}
                        >
                          <button
                            onClick={() => setSelectedStaffDetails(stf)}
                            className={`px-3 py-1.5 font-bold rounded-xl border text-xs ${isDark ? "bg-slate-900 text-slate-200 border-slate-700" : "bg-white text-slate-700 border-slate-200"}`}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleOpenEditStaff(stf)}
                            className={`px-3 py-1.5 font-bold rounded-xl border text-xs ${isDark ? "bg-blue-950/50 text-blue-400 border-blue-900/50" : "bg-blue-50 text-blue-600 border-blue-200"}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDeleteStaff(stf)}
                            className={`px-3 py-1.5 font-bold rounded-xl border text-xs ${isDark ? "bg-rose-950/50 text-rose-400 border-rose-900/50" : "bg-rose-50 text-rose-600 border-rose-200"}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
