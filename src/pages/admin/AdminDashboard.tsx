import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
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
  CreditCard,
  FileText,
  Calendar,
  Activity,
  Mail,
  AlertTriangle,
  History,
  Command,
  Bell,
  Check,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
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

  // ================= NOTIFICATIONS STATE & SUPABASE SYNC =================
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setNotifications(data);
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

  // ================= AUDIT LOGS STATE & SUPABASE SYNC =================
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchAuditLogs = async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to fetch audit logs:", error.message);
    } else if (data) {
      setAuditLogs(data);
    }
  };

  const addAuditLog = async (user: string, action: string, type: string) => {
    const newLogId = `LOG-${Math.floor(100 + Math.random() * 900)}_${Date.now().toString().slice(-4)}`;
    const timestampStr = "Just now";

    const { error } = await supabase.from("audit_logs").insert([
      {
        id: newLogId,
        user_name: user,
        action: action,
        log_type: type,
        timestamp: timestampStr,
      },
    ]);

    if (!error) {
      fetchAuditLogs();
    }
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

  // ================= ADMIN PROFILE & STATION SETTINGS STATES =================
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeSubView, setActiveSubView] = useState<
    "profile" | "settings" | null
  >(null);

  const [adminProfileId, setAdminProfileId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("Admin User");
  const [adminEmail, setAdminEmail] = useState("admin@aquawell.com");
  const [stationName, setStationName] = useState("Albay Station");
  const [stationPhone, setStationPhone] = useState("+63 912 345 6789");

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

      if (!error && data) {
        setAdminName(data.full_name || "Admin User");
        if (data.address) setStationName(data.address);
        if (data.phone) setStationPhone(data.phone);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!adminProfileId) {
      showToast("No active authenticated admin session found", "error");
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
      showToast("Failed to update profile in database", "error");
    } else {
      setActiveSubView(null);
      setIsProfileMenuOpen(false);
      addAuditLog(
        adminName,
        "Updated admin account profile details",
        "profile",
      );
      showToast("Profile updated successfully in Supabase!", "success");
      fetchAdminProfile();
    }
  };

  const handleSaveSettings = async () => {
    if (!adminProfileId) {
      showToast("No active authenticated admin session found", "error");
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
      showToast("Failed to update station settings", "error");
    } else {
      setActiveSubView(null);
      setIsProfileMenuOpen(false);
      addAuditLog(
        adminName,
        `Updated station settings for ${stationName}`,
        "settings",
      );
      showToast("Station settings saved to Supabase successfully!", "success");
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
      showToast("Failed to fetch sales records", "error");
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
        total_amount: `₱${Number(saleAmount).toFixed(2)}`,
        payment_method: salePaymentMethod,
        date: new Date().toISOString().split("T")[0],
      },
    ]);

    if (error) {
      showToast("Failed to record sale in database", "error");
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
      showToast("Sales transaction recorded successfully!", "success");
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
      showToast("Failed to fetch staff directory", "error");
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

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(newStaffFirstName) || !validateName(newStaffLastName)) {
      showToast(
        "Staff names cannot contain numbers or invalid symbols!",
        "error",
      );
      return;
    }
    if (!validatePhoneNumber(newStaffContact)) {
      showToast(
        "Invalid Philippine mobile number format! Use 09XXXXXXXXX or +639XXXXXXXXX",
        "error",
      );
      return;
    }

    if (editingStaff) {
      const { error } = await supabase
        .from("staff")
        .update({
          first_name: newStaffFirstName,
          last_name: newStaffLastName,
          middle_name: newStaffMiddleName,
          suffix: newStaffSuffix,
          role: newStaffRole,
          contact_number: newStaffContact,
          email: newStaffEmail,
        })
        .eq("staff_id", editingStaff.StaffID);

      if (error) {
        showToast("Failed to update staff member", "error");
      } else {
        addAuditLog(
          adminName,
          `Updated staff member: ${newStaffFirstName} ${newStaffLastName} (${newStaffRole})`,
          "staff",
        );
        showToast("Staff member updated successfully!", "success");
        fetchStaffList();
      }
    } else {
      const { error } = await supabase.from("staff").insert([
        {
          first_name: newStaffFirstName,
          last_name: newStaffLastName,
          middle_name: newStaffMiddleName,
          suffix: newStaffSuffix,
          role: newStaffRole,
          contact_number: newStaffContact,
          email: newStaffEmail,
        },
      ]);

      if (error) {
        showToast("Failed to add staff member", "error");
      } else {
        addAuditLog(
          adminName,
          `Added new staff member: ${newStaffFirstName} ${newStaffLastName} (${newStaffRole})`,
          "staff",
        );
        showToast("Staff member added successfully!", "success");
        fetchStaffList();
      }
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

  const handleDeleteStaff = async (id: number) => {
    const { error } = await supabase.from("staff").delete().eq("staff_id", id);
    if (error) {
      showToast("Failed to remove staff member", "error");
    } else {
      addAuditLog(adminName, `Removed staff member ID ${id}`, "staff");
      showToast("Staff member removed", "success");
      fetchStaffList();
    }
  };

  // ================= 3. ORDERS STATE & SUPABASE SYNC =================
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      showToast("Failed to fetch orders from database", "error");
    } else if (data) {
      const formattedOrders = data.map((o: any) => ({
        id: o.id,
        customer: o.customer_name,
        phone: o.phone,
        type: o.type,
        date: new Date(o.created_at).toLocaleDateString(),
        total: o.total,
        status: o.status,
        rider: o.rider || "",
        paymentStatus: o.payment_status,
      }));
      setOrders(formattedOrders);
    }
  };

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<any | null>(null);
  const [selectedRiderName, setSelectedRiderName] = useState("");

  const handleAssignRiderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningOrder) return;

    const { error } = await supabase
      .from("orders")
      .update({ rider: selectedRiderName, status: "OUT FOR-DELIVERY" })
      .eq("id", assigningOrder.id);

    if (error) {
      showToast("Failed to assign driver in database", "error");
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

  const handleDeleteOrder = async (id: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      showToast("Failed to delete order", "error");
    } else {
      addAuditLog(adminName, `Deleted order record ${id}`, "delete");
      showToast(`Order ${id} removed successfully`, "success");
      fetchOrders();
    }
  };

  const handleToggleOrderStatus = async (id: string) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    const nextStatus =
      target.status === "PENDING"
        ? "OUT FOR-DELIVERY"
        : target.status === "OUT FOR-DELIVERY"
          ? "DELIVERED"
          : "PENDING";

    const { error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", id);

    if (error) {
      showToast("Failed to update status", "error");
    } else {
      addAuditLog(
        adminName,
        `Cycled fulfillment status for ${id} to ${nextStatus}`,
        "status",
      );
      showToast(`Updated status for order ${id}`, "success");
      fetchOrders();
    }
  };

  const handleTogglePaymentStatus = async (id: string) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    const nextPay =
      target.paymentStatus === "UNPAID"
        ? "PAID - CASH"
        : target.paymentStatus === "PAID - CASH"
          ? "PAID - GCASH"
          : "UNPAID";

    const { error } = await supabase
      .from("orders")
      .update({ payment_status: nextPay })
      .eq("id", id);

    if (error) {
      showToast("Failed to update payment status", "error");
    } else {
      addAuditLog(
        adminName,
        `Updated payment verification for ${id} to ${nextPay}`,
        "payment",
      );
      showToast(`Updated payment status for ${id}`, "success");
      fetchOrders();
    }
  };

  // ================= 4. PRODUCTS STATE & SUPABASE SYNC =================
  const [products, setProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      showToast("Failed to fetch inventory from database", "error");
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

    // Supabase Realtime subscription for incoming notifications
    const notifChannel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          showToast(payload.new.title || "New system notification!", "error");
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
        showToast("Failed to update inventory item", "error");
      } else {
        addAuditLog(
          adminName,
          `Updated inventory item: ${newProdName}`,
          "inventory",
        );
        showToast("Product updated successfully!", "success");
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
        showToast("Failed to add inventory item", "error");
      } else {
        addAuditLog(
          adminName,
          `Added new product to inventory: ${newProdName}`,
          "inventory",
        );
        showToast("Product added to inventory successfully!", "success");
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

  const handleDeleteProduct = async (id: number) => {
    const { error } = await supabase.from("inventory").delete().eq("id", id);
    if (error) {
      showToast("Failed to remove item from inventory", "error");
    } else {
      addAuditLog(adminName, `Removed inventory item ID ${id}`, "inventory");
      showToast("Product removed from inventory", "success");
      fetchProducts();
    }
  };

  // ================= 5. CUSTOMERS STATE & SUPABASE SYNC =================
  const [customers, setCustomers] = useState<any[]>([]);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("customer_id", { ascending: true });
    if (error) {
      showToast("Failed to fetch customer directory", "error");
    } else if (data) {
      const formattedCustomers = data.map((cust: any) => ({
        CustomerID: cust.customer_id,
        LastName: cust.last_name,
        FirstName: cust.first_name,
        MiddleName: cust.middle_name || "",
        Suffix: cust.suffix || "",
        Address: cust.address,
        ContactNumber: cust.contact_number,
        Email: cust.email,
      }));
      setCustomers(formattedCustomers);
    }
  };

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [newCustFirstName, setNewCustFirstName] = useState("");
  const [newCustLastName, setNewCustLastName] = useState("");
  const [newCustMiddleName, setNewCustMiddleName] = useState("");
  const [newCustSuffix, setNewCustSuffix] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustContact, setNewCustContact] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");

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

    if (editingCustomer) {
      const { error } = await supabase
        .from("customers")
        .update({
          first_name: newCustFirstName,
          last_name: newCustLastName,
          middle_name: newCustMiddleName,
          suffix: newCustSuffix,
          address: newCustAddress,
          contact_number: newCustContact,
          email: newCustEmail,
        })
        .eq("customer_id", editingCustomer.CustomerID);

      if (error) {
        showToast("Failed to update customer account", "error");
      } else {
        addAuditLog(
          adminName,
          `Updated customer profile: ${newCustFirstName} ${newCustLastName}`,
          "customer",
        );
        showToast("Customer account updated successfully!", "success");
        fetchCustomers();
      }
    } else {
      const { error } = await supabase.from("customers").insert([
        {
          first_name: newCustFirstName,
          last_name: newCustLastName,
          middle_name: newCustMiddleName,
          suffix: newCustSuffix,
          address: newCustAddress,
          contact_number: newCustContact,
          email: newCustEmail,
        },
      ]);

      if (error) {
        showToast("Failed to register customer account", "error");
      } else {
        addAuditLog(
          adminName,
          `Registered new customer: ${newCustFirstName} ${newCustLastName}`,
          "customer",
        );
        showToast("Customer registered successfully!", "success");
        fetchCustomers();
      }
    }

    setIsAddCustomerOpen(false);
    setEditingCustomer(null);
    setNewCustFirstName("");
    setNewCustLastName("");
    setNewCustMiddleName("");
    setNewCustSuffix("");
    setNewCustAddress("");
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
    setNewCustContact(cust.ContactNumber);
    setNewCustEmail(cust.Email);
    setIsAddCustomerOpen(true);
  };

  const handleDeleteCustomer = async (id: number) => {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("customer_id", id);
    if (error) {
      showToast("Failed to remove customer account", "error");
    } else {
      addAuditLog(adminName, `Removed customer account ID ${id}`, "customer");
      showToast("Customer account removed", "success");
      fetchCustomers();
    }
  };

  // ================= FILTERED COMPUTED DATA =================
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.toLowerCase().includes(orderSearch.toLowerCase());

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

  // Forecast state
  const [forecastList] = useState([
    {
      ForecastID: 101,
      InventoryID: 1,
      ProductName: "5-Gallon Purified Water Refill",
      ForecastDate: "2026-04-01",
      ForecastedDemand: 145,
      SalesHistoryRef: "SH-REF-MAR2026",
    },
    {
      ForecastID: 102,
      InventoryID: 2,
      ProductName: "Container Dispenser Pump",
      ForecastDate: "2026-04-01",
      ForecastedDemand: 18,
      SalesHistoryRef: "SH-REF-MAR2026",
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-row font-sans selection:bg-blue-500 selection:text-white relative">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center space-x-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 animate-bounce">
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

      {/* ================= MODALS ================= */}

      {/* Customer Order History Modal */}
      {viewingCustomerHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Customer Order History
                </h3>
                <p className="text-xs font-bold text-blue-600">
                  {viewingCustomerHistory.FirstName}{" "}
                  {viewingCustomerHistory.LastName}{" "}
                  {viewingCustomerHistory.Suffix} (
                  {viewingCustomerHistory.Email})
                </p>
              </div>
              <button
                onClick={() => setViewingCustomerHistory(null)}
                className="text-sm font-bold text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-500 block">
                    Account Status
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-blue-900">
                    Active
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-500 block">
                    Registered ID
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-blue-900">
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
                      className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold"
                    >
                      <div>
                        <span className="text-blue-600 font-black block">
                          {item.id}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {item.date}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-900 font-black block">
                          {item.total}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => setViewingCustomerHistory(null)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Record Sales Transaction Modal */}
      {isRecordSaleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                <span>Record Sales Transaction</span>
              </h3>
              <button
                onClick={() => setIsRecordSaleOpen(false)}
                className="text-sm font-bold text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleRecordSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Customer / Buyer
                </label>
                <input
                  type="text"
                  required
                  value={saleCustomer}
                  onChange={(e) => setSaleCustomer(e.target.value)}
                  placeholder="Walk-in Customer or Name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none cursor-pointer"
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Total Amount (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Payment Method
                </label>
                <select
                  value={salePaymentMethod}
                  onChange={(e) => setSalePaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRecordSaleOpen(false)}
                  className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm cursor-pointer"
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Assign Driver for ({assigningOrder.id})
              </h3>
              <button
                onClick={() => setAssigningOrder(null)}
                className="text-sm font-bold text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleAssignRiderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Select Available Delivery Rider / Staff
                </label>
                <select
                  required
                  value={selectedRiderName}
                  onChange={(e) => setSelectedRiderName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none cursor-pointer"
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
                  className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm cursor-pointer"
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Order Details ({selectedOrder.id})
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-sm font-bold text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase">
                  Customer Name:
                </span>
                <span className="font-black text-slate-900">
                  {selectedOrder.customer}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase">
                  Contact Number:
                </span>
                <span className="font-bold text-slate-700">
                  {selectedOrder.phone}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase">
                  Fulfillment Type:
                </span>
                <span className="font-bold text-blue-600">
                  {selectedOrder.type}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase">
                  Date Placed:
                </span>
                <span className="font-bold text-slate-700">
                  {selectedOrder.date}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase">
                  Total Amount:
                </span>
                <span className="font-black text-blue-600 text-base">
                  {selectedOrder.total}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase">
                  Payment Status:
                </span>
                <span className="font-black text-purple-600">
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase">
                  Fulfillment Status:
                </span>
                <span className="font-black text-emerald-600">
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold text-slate-400 uppercase">
                  Assigned Driver / Rider:
                </span>
                <span className="font-bold text-blue-600">
                  {selectedOrder.rider || "Unassigned"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Staff Details View Modal */}
      {selectedStaffDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-sm w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
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
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase">
                  Full Name:
                </span>
                <span className="font-black text-slate-900">
                  {selectedStaffDetails.LastName},{" "}
                  {selectedStaffDetails.FirstName}{" "}
                  {selectedStaffDetails.MiddleName}{" "}
                  {selectedStaffDetails.Suffix}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase">
                  Role:
                </span>
                <span className="font-bold text-blue-600">
                  {selectedStaffDetails.Role}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase">
                  Login Email:
                </span>
                <span className="font-bold text-blue-600">
                  {selectedStaffDetails.Email || "No Email Provided"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold text-slate-400 uppercase">
                  Contact:
                </span>
                <span className="font-bold text-slate-700">
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
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
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g., Slim 5-Gallon Refill"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Category
                </label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="Refill">Refill</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="50.00"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Min Alert
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdMinStock}
                    onChange={(e) => setNewProdMinStock(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
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
                  className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm cursor-pointer"
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustFirstName}
                    onChange={(e) => setNewCustFirstName(e.target.value)}
                    className={`w-full px-3 py-3 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 outline-none ${newCustFirstName && !validateName(newCustFirstName) ? "border-rose-300 bg-rose-50/30" : "border-slate-200"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Middle
                  </label>
                  <input
                    type="text"
                    value={newCustMiddleName}
                    onChange={(e) => setNewCustMiddleName(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustLastName}
                    onChange={(e) => setNewCustLastName(e.target.value)}
                    className={`w-full px-3 py-3 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 outline-none ${newCustLastName && !validateName(newCustLastName) ? "border-rose-300 bg-rose-50/30" : "border-slate-200"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Suffix
                  </label>
                  <input
                    type="text"
                    placeholder="Jr., III"
                    value={newCustSuffix}
                    onChange={(e) => setNewCustSuffix(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street, Barangay, City"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Contact Number
                    </label>
                    <span className="text-[10px] text-blue-600 font-bold">
                      09xx or +639xx
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="09171234567"
                    value={newCustContact}
                    onChange={(e) => setNewCustContact(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 outline-none transition ${newCustContact && !validatePhoneNumber(newCustContact) ? "border-rose-300 bg-rose-50/30" : "border-slate-200"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
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
                  className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm cursor-pointer"
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaffFirstName}
                    onChange={(e) => setNewStaffFirstName(e.target.value)}
                    className={`w-full px-3 py-3 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 outline-none ${newStaffFirstName && !validateName(newStaffFirstName) ? "border-rose-300 bg-rose-50/30" : "border-slate-200"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Middle
                  </label>
                  <input
                    type="text"
                    value={newStaffMiddleName}
                    onChange={(e) => setNewStaffMiddleName(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaffLastName}
                    onChange={(e) => setNewStaffLastName(e.target.value)}
                    className={`w-full px-3 py-3 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 outline-none ${newStaffLastName && !validateName(newStaffLastName) ? "border-rose-300 bg-rose-50/30" : "border-slate-200"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Suffix
                  </label>
                  <input
                    type="text"
                    placeholder="Jr., III"
                    value={newStaffSuffix}
                    onChange={(e) => setNewStaffSuffix(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Role
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="Delivery">Delivery / Rider</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Contact
                    </label>
                    <span className="text-[10px] text-blue-600 font-bold">
                      09xx/ +639xx
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="0917..."
                    value={newStaffContact}
                    onChange={(e) => setNewStaffContact(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 outline-none transition ${newStaffContact && !validatePhoneNumber(newStaffContact) ? "border-rose-300 bg-rose-50/30" : "border-slate-200"}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Login Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@aquawell.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddStaffOpen(false);
                    setEditingStaff(null);
                  }}
                  className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm cursor-pointer"
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
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header: Explicitly locked side-by-side flex row */}
        <div className="px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-2 flex flex-row justify-between items-center gap-4 w-full">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Mobile Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 bg-blue-900 text-white rounded-2xl shadow hover:bg-blue-800 transition cursor-pointer shrink-0"
              aria-label="Open Mobile Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl lg:text-5xl font-black text-slate-950 tracking-tight leading-normal pb-1 truncate">
                {activeTab === "dashboard" && "Admin Dashboard"}
                {activeTab === "orders" && "Order Management"}
                {activeTab === "products" && "Product Catalog & Inventory"}
                {activeTab === "reports" && "Sales Reports & Demand Forecast"}
                {activeTab === "customers" && "Customer Directory"}
                {activeTab === "staff" && "Staff & Driver Management"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-semibold truncate">
                Manage complete station operations with full CRUD interactivity.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Global Quick Search Bar */}
            <div className="relative w-44 sm:w-64">
              <Command className="absolute left-3.5 top-3 h-4 w-4 text-blue-600" />
              <input
                type="text"
                placeholder="Global command search..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none shadow-sm focus:border-blue-500 transition"
              />
            </div>

            {/* Notifications Dropdown Bell */}
            <div className="relative shrink-0" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-700 transition cursor-pointer shadow-sm"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full font-black text-[10px] flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[24px] border border-slate-200 shadow-2xl p-5 z-50 space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <span className="font-black text-sm text-slate-900">
                        Notifications ({unreadCount} new)
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <Check className="h-3 w-3" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">
                        No notifications found.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 rounded-2xl border transition ${n.unread ? "bg-blue-50/50 border-blue-100" : "bg-slate-50 border-slate-100 opacity-75"}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-black text-slate-900 block">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {formatTimeAgo(n.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 font-medium">
                            {n.description}
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
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-[28px] space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-blue-900 uppercase tracking-wider flex items-center space-x-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  <span>
                    Command Palette Search Results for "{globalSearch}"
                  </span>
                </h4>
                <button
                  onClick={() => setGlobalSearch("")}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Clear Search
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-2">
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
                        className="text-sm font-bold text-slate-900 flex justify-between"
                      >
                        <span>
                          {c.FirstName} {c.LastName}
                        </span>
                        <button
                          onClick={() => {
                            setActiveTab("customers");
                            setCustomerSearch(c.LastName);
                          }}
                          className="text-blue-600 text-xs"
                        >
                          View
                        </button>
                      </div>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-2">
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
                        className="text-sm font-bold text-slate-900 flex justify-between"
                      >
                        <span>
                          {o.id} ({o.customer})
                        </span>
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="text-blue-600 text-xs"
                        >
                          View
                        </button>
                      </div>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-2">
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
                        className="text-sm font-bold text-slate-900 flex justify-between"
                      >
                        <span>{p.name}</span>
                        <button
                          onClick={() => setActiveTab("products")}
                          className="text-blue-600 text-xs"
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
                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Orders
                    </span>
                    <h3 className="text-3xl font-black text-slate-900">
                      {orders.length}
                    </h3>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl border border-emerald-100">
                    <ShoppingCart className="h-7 w-7" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Customers
                    </span>
                    <h3 className="text-3xl font-black text-blue-600">
                      {customers.length}
                    </h3>
                  </div>
                  <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl border border-blue-100">
                    <Users className="h-7 w-7" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Pending Orders
                    </span>
                    <h3 className="text-3xl font-black text-amber-600">
                      {orders.filter((o) => o.status === "PENDING").length}
                    </h3>
                  </div>
                  <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl border border-amber-100">
                    <Clock className="h-7 w-7" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Out for Delivery
                    </span>
                    <h3 className="text-3xl font-black text-blue-500">
                      {
                        orders.filter((o) => o.status === "OUT FOR-DELIVERY")
                          .length
                      }
                    </h3>
                  </div>
                  <div className="bg-blue-50 text-blue-500 p-3.5 rounded-2xl border border-blue-100">
                    <Truck className="h-7 w-7" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Delivered Orders
                    </span>
                    <h3 className="text-3xl font-black text-purple-600">
                      {orders.filter((o) => o.status === "DELIVERED").length}
                    </h3>
                  </div>
                  <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl border border-purple-100">
                    <Box className="h-7 w-7" />
                  </div>
                </div>
              </div>

              {/* Low Stock Warning Banner */}
              {products.some((p) => p.stock <= p.minStock) && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-[28px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-100 text-amber-700 p-3 rounded-2xl shrink-0">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-amber-900">
                        Low Stock Inventory Alert!
                      </h4>
                      <p className="text-xs font-bold text-amber-700">
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
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-black uppercase text-slate-700">
                    Sales Overview (Last 7 Days)
                  </h3>
                  <div className="h-64 flex flex-col justify-end bg-slate-50 p-4 rounded-2xl border border-slate-100 relative overflow-hidden">
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
                            stopColor="#2563eb"
                            stopOpacity="0.25"
                          />
                          <stop
                            offset="100%"
                            stopColor="#2563eb"
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>
                      <line
                        x1="0"
                        y1="0"
                        x2="500"
                        y2="0"
                        stroke="#e2e8f0"
                        strokeDasharray="4"
                      />
                      <line
                        x1="0"
                        y1="40"
                        x2="500"
                        y2="40"
                        stroke="#e2e8f0"
                        strokeDasharray="4"
                      />
                      <line
                        x1="0"
                        y1="80"
                        x2="500"
                        y2="80"
                        stroke="#e2e8f0"
                        strokeDasharray="4"
                      />
                      <line
                        x1="0"
                        y1="120"
                        x2="500"
                        y2="120"
                        stroke="#e2e8f0"
                        strokeDasharray="4"
                      />
                      <line
                        x1="0"
                        y1="160"
                        x2="500"
                        y2="160"
                        stroke="#cbd5e1"
                      />

                      <path
                        d="M 0 130 Q 80 80, 160 110 T 320 50 T 500 20 L 500 160 L 0 160 Z"
                        fill="url(#lineGrad)"
                      />
                      <path
                        d="M 0 130 Q 80 80, 160 110 T 320 50 T 500 20"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      <circle cx="0" cy="130" r="5" fill="#2563eb" />
                      <circle cx="83" cy="95" r="5" fill="#2563eb" />
                      <circle cx="166" cy="110" r="5" fill="#2563eb" />
                      <circle cx="250" cy="80" r="5" fill="#2563eb" />
                      <circle cx="333" cy="50" r="5" fill="#2563eb" />
                      <circle cx="416" cy="35" r="5" fill="#2563eb" />
                      <circle cx="500" cy="20" r="5" fill="#2563eb" />
                    </svg>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mt-2 px-1">
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

                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-black uppercase text-slate-700">
                    Order Status Distribution
                  </h3>
                  <div className="h-64 flex flex-col justify-center bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-700 flex items-center space-x-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block"></span>
                          <span>Delivered</span>
                        </span>
                        <span className="text-slate-900 font-black">
                          {
                            orders.filter((o) => o.status === "DELIVERED")
                              .length
                          }{" "}
                          Orders
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
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
                        <span className="text-slate-700 flex items-center space-x-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 inline-block"></span>
                          <span>Out for Delivery</span>
                        </span>
                        <span className="text-slate-900 font-black">
                          {
                            orders.filter(
                              (o) => o.status === "OUT FOR-DELIVERY",
                            ).length
                          }{" "}
                          Orders
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
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

              {/* System Audit Trail Widget */}
              <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black uppercase text-slate-900 flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>System Audit Trail & Recent Activity Log</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                    Live Cloud Database Sync
                  </span>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/60 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {log.action}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            Performed by{" "}
                            <span className="text-blue-600 font-bold">
                              {log.user_name}
                            </span>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-white px-3 py-1 rounded-xl border border-slate-200">
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-sm"
                  />
                </div>

                <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer w-full"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Delivery">Delivery Type</option>
                    <option value="Pending">Pending</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Order Management & Payment Verification (
                  {filteredOrders.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-base min-w-[750px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-sm text-slate-400 uppercase font-black">
                        <th className="py-5 px-5 align-middle">Order ID</th>
                        <th className="py-5 px-5 align-middle">Customer</th>
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
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-slate-400 font-semibold text-sm"
                          >
                            No orders match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr
                            key={ord.id}
                            className="hover:bg-slate-50 transition"
                          >
                            <td className="py-5 px-5 font-bold text-blue-600 align-middle">
                              {ord.id}
                            </td>
                            <td className="py-5 px-5 font-bold text-slate-900 align-middle">
                              {ord.customer}
                            </td>
                            <td className="py-5 px-5 font-bold text-slate-900 align-middle">
                              {ord.total}
                            </td>
                            <td className="py-5 px-5 align-middle">
                              <button
                                onClick={() =>
                                  handleTogglePaymentStatus(ord.id)
                                }
                                className={`px-4 py-1.5 rounded-full font-black text-xs tracking-wider cursor-pointer hover:opacity-80 transition inline-flex items-center space-x-1 ${ord.paymentStatus.includes("PAID") ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-rose-100 text-rose-800 border border-rose-200"}`}
                                title="Click to cycle payment status"
                              >
                                <CreditCard className="h-3 w-3 mr-1" />
                                <span>{ord.paymentStatus} 🔄</span>
                              </button>
                            </td>
                            <td className="py-5 px-5 align-middle">
                              <button
                                onClick={() => handleToggleOrderStatus(ord.id)}
                                className={`px-4 py-1.5 rounded-full font-black text-xs tracking-wider cursor-pointer hover:opacity-80 transition ${ord.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-orange-100 text-orange-800 border border-orange-200"}`}
                                title="Click to cycle fulfillment status"
                              >
                                {ord.status} 🔄
                              </button>
                            </td>
                            <td className="py-5 px-5 font-bold text-blue-700 align-middle">
                              {ord.rider ? (
                                <span className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl text-xs">
                                  {ord.rider}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs italic">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="py-5 px-5 text-center space-x-2 align-middle">
                              <button
                                onClick={() => setAssigningOrder(ord)}
                                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl border border-blue-200 transition inline-flex items-center space-x-1 cursor-pointer text-xs"
                                title="Assign Rider"
                              >
                                <UserCheck className="h-4 w-4" />
                                <span>Assign</span>
                              </button>
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="px-3 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition inline-flex items-center space-x-1 cursor-pointer text-xs"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(ord.id)}
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl border border-rose-200 transition inline-flex items-center space-x-1 cursor-pointer text-xs"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. PRODUCTS TAB ================= */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      <option value="Refill">Refill</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Low Stock">Low Stock Only</option>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-lg shadow-blue-500/20 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Plus className="h-5 w-5 stroke-[3]" />
                  <span>Add Inventory Item</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full bg-white p-8 rounded-3xl border text-center text-slate-400 font-semibold text-sm">
                    No inventory items match your filter criteria.
                  </div>
                ) : (
                  filteredProducts.map((prod) => {
                    const isLowStock = prod.stock <= (prod.minStock || 10);
                    return (
                      <div
                        key={prod.id}
                        className={`bg-white p-7 rounded-[28px] border shadow-sm space-y-4 relative group transition ${isLowStock ? "border-amber-300 bg-amber-50/20" : "border-slate-200"}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl border border-blue-100">
                            {prod.category}
                          </span>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-1"
                              title="Edit Product"
                            >
                              <Edit3 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="text-slate-400 hover:text-rose-500 transition cursor-pointer p-1"
                              title="Delete Product"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-black text-slate-900 text-lg">
                          {prod.name}
                        </h4>

                        {isLowStock && (
                          <div className="flex items-center space-x-2 bg-amber-100/80 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-black">
                            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                            <span>
                              LOW STOCK WARNING (Min: {prod.minStock})
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                          <span className="text-base font-black text-blue-600">
                            {prod.price}
                          </span>
                          <span
                            className={`text-sm font-black ${isLowStock ? "text-amber-700" : "text-slate-700"}`}
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
              <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Generate Reports & Analytics
                  </h3>
                  <p className="text-sm text-slate-600 font-medium">
                    Filter financial statements, sales logs, and WMA demand
                    forecasts[cite: 13, 16].
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex-1 sm:flex-initial">
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <select
                      value={reportType}
                      onChange={(e) =>
                        setReportType(e.target.value as "sales" | "inventory")
                      }
                      className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer w-full"
                    >
                      <option value="sales">Sales & Transactions Report</option>
                      <option value="inventory">
                        Inventory & WMA Demand Forecast[cite: 13, 16]
                      </option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex-1 sm:flex-initial">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <select
                      value={reportDateRange}
                      onChange={(e) => setReportDateRange(e.target.value)}
                      className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer w-full"
                    >
                      <option value="Today">Today</option>
                      <option value="This Week">This Week</option>
                      <option value="This Month">This Month</option>
                      <option value="Year-to-Date">Year-to-Date</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setIsRecordSaleOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 shadow-md cursor-pointer flex-1 sm:flex-initial justify-center"
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Record Sale</span>
                  </button>
                  <button
                    onClick={() =>
                      showToast(
                        `Successfully exported ${reportType} report for ${reportDateRange}!`,
                        "success",
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 shadow-md cursor-pointer flex-1 sm:flex-initial justify-center"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Report</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Transactions Logged
                    </span>
                    <h3 className="text-3xl font-black text-blue-600">
                      {salesRecords.length}
                    </h3>
                  </div>
                  <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl border border-blue-100">
                    <TrendingUp className="h-7 w-7" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Orders
                    </span>
                    <h3 className="text-3xl font-black text-slate-900">
                      {orders.length}
                    </h3>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl border border-emerald-100">
                    <ShoppingCart className="h-7 w-7" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Fulfillment Rate
                    </span>
                    <h3 className="text-3xl font-black text-emerald-600">
                      100%
                    </h3>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl border border-emerald-100">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Active Forecasts
                    </span>
                    <h3 className="text-3xl font-black text-purple-600">
                      {forecastList.length} Items
                    </h3>
                  </div>
                  <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl border border-purple-100">
                    <Coins className="h-7 w-7" />
                  </div>
                </div>
              </div>

              {reportType === "sales" ? (
                <div className="space-y-8 animate-fadeIn">
                  {/* Visual Charts Grid for Sales */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-base font-black uppercase text-slate-700">
                        Sales Volume by Product Variant
                      </h3>
                      <div className="h-64 flex flex-col justify-end bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
                        <div className="flex justify-around items-end h-48 w-full gap-4 pt-6">
                          <div className="flex flex-col items-center flex-1 h-full justify-end">
                            <span className="text-xs font-bold text-blue-600 mb-1">
                              2 Units
                            </span>
                            <div
                              className="w-16 bg-blue-600 rounded-t-xl transition-all duration-500 hover:bg-blue-700"
                              style={{ height: "70%" }}
                            ></div>
                            <span className="text-[11px] font-bold text-slate-600 mt-2 truncate w-full text-center">
                              5-Gallon Refill
                            </span>
                          </div>
                          <div className="flex flex-col items-center flex-1 h-full justify-end">
                            <span className="text-xs font-bold text-slate-400 mb-1">
                              0 Units
                            </span>
                            <div
                              className="w-16 bg-slate-200 rounded-t-xl"
                              style={{ height: "10%" }}
                            ></div>
                            <span className="text-[11px] font-bold text-slate-600 mt-2 truncate w-full text-center">
                              Dispenser Pump
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-base font-black uppercase text-slate-700">
                        Order Status Distribution
                      </h3>
                      <div className="h-64 flex flex-col justify-center bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-slate-700 flex items-center space-x-2">
                              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block"></span>
                              <span>Delivered</span>
                            </span>
                            <span className="text-slate-900 font-black">
                              {
                                orders.filter((o) => o.status === "DELIVERED")
                                  .length
                              }{" "}
                              Orders
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
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
                            <span className="text-slate-700 flex items-center space-x-2">
                              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 inline-block"></span>
                              <span>Out for Delivery</span>
                            </span>
                            <span className="text-slate-900 font-black">
                              {
                                orders.filter(
                                  (o) => o.status === "OUT FOR-DELIVERY",
                                ).length
                              }{" "}
                              Orders
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
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
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-black uppercase text-slate-900 flex items-center space-x-2">
                        <Receipt className="h-5 w-5 text-emerald-600" />
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
                          <tr className="border-b border-slate-100 text-sm text-slate-400 uppercase font-black">
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
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
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
                                className="hover:bg-slate-50 transition"
                              >
                                <td className="py-5 px-4 font-bold text-emerald-600 align-middle">
                                  {txn.TransactionID}
                                </td>
                                <td className="py-5 px-4 font-bold text-slate-900 align-middle">
                                  {txn.CustomerName}
                                </td>
                                <td className="py-5 px-4 text-slate-700 align-middle">
                                  {txn.ItemName}
                                </td>
                                <td className="py-5 px-4 text-slate-700 align-middle">
                                  {txn.Quantity}
                                </td>
                                <td className="py-5 px-4 font-bold text-blue-600 align-middle">
                                  {txn.TotalAmount}
                                </td>
                                <td className="py-5 px-4 align-middle">
                                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold">
                                    {txn.PaymentMethod}
                                  </span>
                                </td>
                                <td className="py-5 px-4 text-right text-slate-600 text-xs align-middle">
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
                  {/* Weighted Moving Average (WMA) Forecast Trend Visualization */}
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-base font-black uppercase text-slate-700">
                      WMA Demand Projections (Next Period)[cite: 13, 16]
                    </h3>
                    <div className="h-64 flex flex-col justify-end bg-slate-50 p-4 rounded-2xl border border-slate-100 relative overflow-hidden">
                      <svg
                        className="w-full h-48 overflow-visible"
                        viewBox="0 0 400 140"
                      >
                        <line
                          x1="0"
                          y1="120"
                          x2="400"
                          y2="120"
                          stroke="#cbd5e1"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M 0 90 Q 100 40, 200 60 T 400 20"
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <circle cx="0" cy="90" r="5" fill="#8b5cf6" />
                        <circle cx="200" cy="60" r="5" fill="#8b5cf6" />
                        <circle cx="400" cy="20" r="6" fill="#7c3aed" />
                      </svg>
                      <div className="flex justify-between text-xs font-bold text-slate-500 mt-2 px-1">
                        <span>Period 1</span>
                        <span>Period 2</span>
                        <span>Forecast (WMA)[cite: 13, 16]</span>
                      </div>
                    </div>
                  </div>

                  {/* Forecast Table Breakdown */}
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-base font-black uppercase text-slate-700">
                      Inventory Forecast Metrics[cite: 13, 16]
                    </h3>
                    <div className="space-y-3">
                      {forecastList.map((fc) => (
                        <div
                          key={fc.ForecastID}
                          className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center"
                        >
                          <div>
                            <span className="text-xs font-bold text-blue-600 uppercase block">
                              #FC-{fc.ForecastID}
                            </span>
                            <span className="text-sm font-black text-slate-900">
                              {fc.ProductName}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-purple-600 block">
                              {fc.ForecastedDemand} Units
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Target: {fc.ForecastDate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 5. CUSTOMER DIRECTORY TAB ================= */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none shadow-sm"
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
                    setNewCustContact("");
                    setNewCustEmail("");
                    setIsAddCustomerOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-lg cursor-pointer shrink-0 w-full sm:w-auto justify-center"
                >
                  <Plus className="h-5 w-5 stroke-[3]" />
                  <span>Register Customer</span>
                </button>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Registered Customer Accounts ({filteredCustomers.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-base min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-sm text-slate-400 uppercase font-black">
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
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
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
                            className="hover:bg-slate-50 transition"
                          >
                            <td className="py-5 px-5 font-bold text-blue-600 align-middle">
                              #CUST-{cust.CustomerID}
                            </td>
                            <td className="py-5 px-5 font-bold text-slate-900 align-middle">
                              {cust.LastName}, {cust.FirstName}{" "}
                              {cust.MiddleName} {cust.Suffix}
                            </td>
                            <td className="py-5 px-5 text-slate-700 align-middle">
                              {cust.Address}
                            </td>
                            <td className="py-5 px-5 text-slate-700 align-middle">
                              {cust.ContactNumber}
                            </td>
                            <td className="py-5 px-5 text-blue-600 font-bold align-middle">
                              {cust.Email}
                            </td>
                            <td className="py-5 px-5 text-center space-x-2 align-middle">
                              <button
                                onClick={() => setViewingCustomerHistory(cust)}
                                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl border border-blue-200 transition inline-flex items-center space-x-1 cursor-pointer text-xs"
                                title="View Order History"
                              >
                                <History className="h-4 w-4" />
                                <span>History</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditCustomer(cust)}
                                className="px-3 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition inline-flex items-center space-x-1 cursor-pointer text-xs"
                              >
                                <Edit3 className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCustomer(cust.CustomerID)
                                }
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl border border-rose-200 transition inline-flex items-center space-x-1 cursor-pointer text-xs"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. STAFF & DRIVERS TAB ================= */}
          {activeTab === "staff" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search staff..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                      value={staffFilter}
                      onChange={(e) => setStaffFilter(e.target.value)}
                      className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="All">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Staff">Staff</option>
                      <option value="Delivery">Delivery</option>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-lg cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Plus className="h-5 w-5 stroke-[3]" />
                  <span>Add Staff / Rider</span>
                </button>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Staff & Driver Roster ({filteredStaff.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-base min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-sm text-slate-400 uppercase font-black">
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
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
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
                            className="hover:bg-slate-50 transition"
                          >
                            <td className="py-5 px-5 font-bold text-blue-600 align-middle">
                              #STF-00{stf.StaffID}
                            </td>
                            <td className="py-5 px-5 font-bold text-slate-900 align-middle">
                              {stf.LastName}, {stf.FirstName} {stf.MiddleName}{" "}
                              {stf.Suffix}
                            </td>
                            <td className="py-5 px-5 align-middle">
                              <span
                                className={`px-4 py-1.5 rounded-full font-black text-xs tracking-wider inline-flex items-center space-x-1 ${stf.Role === "Admin" ? "bg-purple-100 text-purple-800 border border-purple-200" : stf.Role === "Staff" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"}`}
                              >
                                <span>{stf.Role}</span>
                              </span>
                            </td>
                            <td className="py-5 px-5 text-blue-600 font-bold align-middle flex items-center space-x-1.5 pt-7">
                              <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                              <span>{stf.Email || "No Email"}</span>
                            </td>
                            <td className="py-5 px-5 text-slate-700 align-middle">
                              {stf.ContactNumber}
                            </td>
                            <td className="py-5 px-5 text-center space-x-3 align-middle">
                              <button
                                onClick={() => setSelectedStaffDetails(stf)}
                                className="px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition inline-flex items-center space-x-1.5 cursor-pointer text-sm"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditStaff(stf)}
                                className="px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition inline-flex items-center space-x-1.5 cursor-pointer text-sm"
                              >
                                <Edit3 className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(stf.StaffID)}
                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl border border-rose-200 transition inline-flex items-center space-x-1.5 cursor-pointer text-sm"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
