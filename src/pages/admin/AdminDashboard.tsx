import React, { useState, useRef, useEffect } from "react";
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
  BarChart3,
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
  const [orderFilter, setOrderFilter] = useState("All Orders");

  // Global Command Palette / Quick Search State
  const [globalSearch, setGlobalSearch] = useState("");

  // Notifications Dropdown State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Low Stock Warning",
      desc: "5-Gallon Refill stock is at 8 units (Min: 15).",
      time: "10m ago",
      unread: true,
    },
    {
      id: 2,
      title: "New Order Placed",
      desc: "Order #ORD-002 requires rider dispatch.",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      title: "System Backup",
      desc: "Automatic nightly database backup completed.",
      time: "5h ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  // Customer Order History Modal State
  const [viewingCustomerHistory, setViewingCustomerHistory] = useState<
    any | null
  >(null);

  // Sales Report Filtering State
  const [reportType, setReportType] = useState<"sales" | "inventory">("sales");
  const [reportDateRange, setReportDateRange] = useState("This Month");

  // System Audit Trail / Activity Log State
  const [auditLogs, setAuditLogs] = useState([
    {
      id: "LOG-301",
      user: "Admin User",
      action: "Assigned Rider Juan to Order #ORD-001",
      timestamp: "Today, 10:45 AM",
      type: "assignment",
    },
    {
      id: "LOG-300",
      user: "Admin User",
      action: "Recorded sales transaction TXN-1001 (₱100.00)",
      timestamp: "Today, 09:15 AM",
      type: "sale",
    },
  ]);

  const addAuditLog = (user: string, action: string, type: string) => {
    const newLog = {
      id: `LOG-${302 + auditLogs.length}`,
      user,
      action,
      timestamp: "Just now",
      type,
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Accordion Dropdown State for Sidebar Submenu
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeSubView, setActiveSubView] = useState<
    "profile" | "settings" | null
  >(null);

  // Toast Notification State
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

  // Persistent Profile & Settings State using localStorage
  const [adminName, setAdminName] = useState(
    () => localStorage.getItem("aquawell_admin_name") || "Admin User",
  );
  const [adminEmail, setAdminEmail] = useState(
    () => localStorage.getItem("aquawell_admin_email") || "admin@aquawell.com",
  );
  const [stationName, setStationName] = useState(
    () => localStorage.getItem("aquawell_station_name") || "Albay Station",
  );
  const [stationPhone, setStationPhone] = useState(
    () => localStorage.getItem("aquawell_station_phone") || "+63 912 345 6789",
  );

  const handleSaveProfile = () => {
    localStorage.setItem("aquawell_admin_name", adminName);
    localStorage.setItem("aquawell_admin_email", adminEmail);
    setActiveSubView(null);
    setIsProfileMenuOpen(false);
    addAuditLog(adminName, "Updated admin account profile details", "profile");
    showToast("Profile updated successfully!", "success");
  };

  const handleSaveSettings = () => {
    localStorage.setItem("aquawell_station_name", stationName);
    localStorage.setItem("aquawell_station_phone", stationPhone);
    setActiveSubView(null);
    setIsProfileMenuOpen(false);
    addAuditLog(
      adminName,
      `Updated station settings for ${stationName}`,
      "settings",
    );
    showToast("Station settings saved successfully!", "success");
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

  // ================= 1. SALES TRANSACTION STATE & MODAL =================
  const [salesRecords, setSalesRecords] = useState([
    {
      TransactionID: "TXN-1001",
      CustomerName: "John Doe",
      ItemName: "5-Gallon Purified Water Refill",
      Quantity: 2,
      TotalAmount: "₱100.00",
      PaymentMethod: "Cash",
      Date: "2026-03-30",
    },
  ]);

  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [saleCustomer, setSaleCustomer] = useState("Walk-in Customer");
  const [saleProduct, setSaleProduct] = useState(
    "5-Gallon Purified Water Refill",
  );
  const [saleQuantity, setSaleQuantity] = useState("1");
  const [saleAmount, setSaleAmount] = useState("50.00");
  const [salePaymentMethod, setSalePaymentMethod] = useState("Cash");

  const handleRecordSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(saleCustomer)) {
      showToast(
        "Buyer name cannot contain numbers or invalid symbols!",
        "error",
      );
      return;
    }
    const newTxn = {
      TransactionID: `TXN-10${salesRecords.length + 1}`,
      CustomerName: saleCustomer,
      ItemName: saleProduct,
      Quantity: Number(saleQuantity),
      TotalAmount: `₱${Number(saleAmount).toFixed(2)}`,
      PaymentMethod: salePaymentMethod,
      Date: new Date().toISOString().split("T")[0],
    };
    setSalesRecords([newTxn, ...salesRecords]);
    setIsRecordSaleOpen(false);
    setSaleCustomer("Walk-in Customer");
    setSaleQuantity("1");
    setSaleAmount("50.00");
    addAuditLog(
      adminName,
      `Recorded sales transaction ${newTxn.TransactionID} for ${saleCustomer}`,
      "sale",
    );
    showToast("Sales transaction recorded successfully!", "success");
  };

  // ================= 2. STAFF & DRIVERS STATE =================
  const [staffList, setStaffList] = useState([
    {
      StaffID: 1,
      LastName: "Binamira",
      FirstName: "Terrenze Josh",
      MiddleName: "M.",
      Suffix: "",
      Role: "Admin",
      ContactNumber: "+639123456789",
      Email: "terrenze@aquawell.com",
    },
    {
      StaffID: 2,
      LastName: "Colarina",
      FirstName: "Malbert",
      MiddleName: "P.",
      Suffix: "",
      Role: "Staff",
      ContactNumber: "09198765432",
      Email: "malbert@aquawell.com",
    },
    {
      StaffID: 3,
      LastName: "Perez",
      FirstName: "Junmar",
      MiddleName: "S.",
      Suffix: "",
      Role: "Delivery",
      ContactNumber: "09171112233",
      Email: "junmar@aquawell.com",
    },
    {
      StaffID: 4,
      LastName: "Juan",
      FirstName: "Rider",
      MiddleName: "D.",
      Suffix: "",
      Role: "Delivery",
      ContactNumber: "09203334455",
      Email: "juan.rider@aquawell.com",
    },
  ]);

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

  const handleAddStaff = (e: React.FormEvent) => {
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
      setStaffList(
        staffList.map((s) =>
          s.StaffID === editingStaff.StaffID
            ? {
                ...s,
                FirstName: newStaffFirstName,
                LastName: newStaffLastName,
                MiddleName: newStaffMiddleName,
                Suffix: newStaffSuffix,
                Role: newStaffRole,
                ContactNumber: newStaffContact,
                Email: newStaffEmail,
              }
            : s,
        ),
      );
      addAuditLog(
        adminName,
        `Updated staff member: ${newStaffFirstName} ${newStaffLastName} (${newStaffRole})`,
        "staff",
      );
      showToast("Staff member updated successfully!", "success");
    } else {
      const newStaffEntry = {
        StaffID: staffList.length + 1,
        FirstName: newStaffFirstName,
        LastName: newStaffLastName,
        MiddleName: newStaffMiddleName,
        Suffix: newStaffSuffix,
        Role: newStaffRole,
        ContactNumber: newStaffContact,
        Email: newStaffEmail,
      };
      setStaffList([newStaffEntry, ...staffList]);
      addAuditLog(
        adminName,
        `Added new staff member: ${newStaffFirstName} ${newStaffLastName} (${newStaffRole})`,
        "staff",
      );
      showToast("Staff member added successfully!", "success");
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

  const handleDeleteStaff = (id: number) => {
    setStaffList(staffList.filter((s) => s.StaffID !== id));
    addAuditLog(adminName, `Removed staff member ID ${id}`, "staff");
    showToast("Staff member removed", "success");
  };

  // ================= 3. ORDERS STATE =================
  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      customer: "John Doe",
      phone: "+639123456789",
      type: "Delivery",
      date: "3/10/2026",
      total: "₱100.00",
      status: "DELIVERED",
      rider: "Rider Juan",
      paymentStatus: "PAID - CASH",
    },
    {
      id: "ORD-002",
      customer: "Maria Santos",
      phone: "09187654321",
      type: "Delivery",
      date: "3/15/2026",
      total: "₱104.00",
      status: "OUT FOR-DELIVERY",
      rider: "Junmar Perez",
      paymentStatus: "PAID - GCASH",
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<any | null>(null);
  const [selectedRiderName, setSelectedRiderName] = useState("");

  const handleAssignRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningOrder) return;

    setOrders(
      orders.map((ord) =>
        ord.id === assigningOrder.id
          ? { ...ord, rider: selectedRiderName, status: "OUT FOR-DELIVERY" }
          : ord,
      ),
    );
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
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter((o) => o.id !== id));
    addAuditLog(adminName, `Deleted order record ${id}`, "delete");
    showToast(`Order ${id} removed successfully`, "success");
  };

  const handleToggleOrderStatus = (id: string) => {
    setOrders(
      orders.map((ord) => {
        if (ord.id === id) {
          const nextStatus =
            ord.status === "PENDING"
              ? "OUT FOR-DELIVERY"
              : ord.status === "OUT FOR-DELIVERY"
                ? "DELIVERED"
                : "PENDING";
          addAuditLog(
            adminName,
            `Cycled fulfillment status for ${id} to ${nextStatus}`,
            "status",
          );
          return { ...ord, status: nextStatus };
        }
        return ord;
      }),
    );
    showToast(`Updated status for order ${id}`, "success");
  };

  const handleTogglePaymentStatus = (id: string) => {
    setOrders(
      orders.map((ord) => {
        if (ord.id === id) {
          const nextPay =
            ord.paymentStatus === "UNPAID"
              ? "PAID - CASH"
              : ord.paymentStatus === "PAID - CASH"
                ? "PAID - GCASH"
                : "UNPAID";
          addAuditLog(
            adminName,
            `Updated payment verification for ${id} to ${nextPay}`,
            "payment",
          );
          return { ...ord, paymentStatus: nextPay };
        }
        return ord;
      }),
    );
    showToast(`Updated payment status for ${id}`, "success");
  };

  // ================= 4. PRODUCTS STATE =================
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "5-Gallon Purified Water Refill",
      category: "Refill",
      price: "₱50.00",
      stock: 8,
      minStock: 15,
      status: "Low Stock",
    },
    {
      id: 2,
      name: "Container Dispenser Pump",
      category: "Hardware",
      price: "₱250.00",
      stock: 15,
      minStock: 5,
      status: "In Stock",
    },
  ]);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Refill");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdMinStock, setNewProdMinStock] = useState("10");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const stockNum = Number(newProdStock);
    const minStockNum = Number(newProdMinStock);
    const stockStatus = stockNum <= minStockNum ? "Low Stock" : "In Stock";

    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: newProdName,
                category: newProdCategory,
                price: `₱${Number(newProdPrice).toFixed(2)}`,
                stock: stockNum,
                minStock: minStockNum,
                status: stockStatus,
              }
            : p,
        ),
      );
      addAuditLog(
        adminName,
        `Updated inventory item: ${newProdName}`,
        "inventory",
      );
      showToast("Product updated successfully!", "success");
    } else {
      const newProduct = {
        id: products.length + 1,
        name: newProdName,
        category: newProdCategory,
        price: `₱${Number(newProdPrice).toFixed(2)}`,
        stock: stockNum,
        minStock: minStockNum,
        status: stockStatus,
      };
      setProducts([...products, newProduct]);
      addAuditLog(
        adminName,
        `Added new product to inventory: ${newProdName}`,
        "inventory",
      );
      showToast("Product added to inventory successfully!", "success");
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

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
    addAuditLog(adminName, `Removed inventory item ID ${id}`, "inventory");
    showToast("Product removed from inventory", "success");
  };

  // ================= 5. CUSTOMERS STATE =================
  const [customers, setCustomers] = useState([
    {
      CustomerID: 1,
      LastName: "Doe",
      FirstName: "John",
      MiddleName: "A.",
      Suffix: "",
      Address: "Padang, Legazpi City, Albay",
      ContactNumber: "+639123456789",
      Email: "john.doe@example.com",
    },
    {
      CustomerID: 2,
      LastName: "Santos",
      FirstName: "Maria",
      MiddleName: "B.",
      Suffix: "",
      Address: "Rawis, Legazpi City, Albay",
      ContactNumber: "09187654321",
      Email: "maria.santos@example.com",
    },
  ]);

  const [customerSearch, setCustomerSearch] = useState("");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [newCustFirstName, setNewCustFirstName] = useState("");
  const [newCustLastName, setNewCustLastName] = useState("");
  const [newCustMiddleName, setNewCustMiddleName] = useState("");
  const [newCustSuffix, setNewCustSuffix] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustContact, setNewCustContact] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");

  const handleAddCustomer = (e: React.FormEvent) => {
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
      setCustomers(
        customers.map((c) =>
          c.CustomerID === editingCustomer.CustomerID
            ? {
                ...c,
                FirstName: newCustFirstName,
                LastName: newCustLastName,
                MiddleName: newCustMiddleName,
                Suffix: newCustSuffix,
                Address: newCustAddress,
                ContactNumber: newCustContact,
                Email: newCustEmail,
              }
            : c,
        ),
      );
      addAuditLog(
        adminName,
        `Updated customer profile: ${newCustFirstName} ${newCustLastName}`,
        "customer",
      );
      showToast("Customer account updated successfully!", "success");
    } else {
      const newEntry = {
        CustomerID: customers.length + 1,
        FirstName: newCustFirstName,
        LastName: newCustLastName,
        MiddleName: newCustMiddleName,
        Suffix: newCustSuffix,
        Address: newCustAddress,
        ContactNumber: newCustContact,
        Email: newCustEmail,
      };
      setCustomers([newEntry, ...customers]);
      addAuditLog(
        adminName,
        `Registered new customer: ${newCustFirstName} ${newCustLastName}`,
        "customer",
      );
      showToast("Customer registered successfully!", "success");
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

  const handleDeleteCustomer = (id: number) => {
    setCustomers(customers.filter((c) => c.CustomerID !== id));
    addAuditLog(adminName, `Removed customer account ID ${id}`, "customer");
    showToast("Customer account removed", "success");
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.FirstName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.LastName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.Email.toLowerCase().includes(customerSearch.toLowerCase()),
  );

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-blue-500 selection:text-white relative">
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-lg w-full p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
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
                    Lifetime Value (LTV)
                  </span>
                  <span className="text-2xl font-black text-blue-900">
                    ₱150.00
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-500 block">
                    Total Orders Placed
                  </span>
                  <span className="text-2xl font-black text-blue-900">
                    2 Orders
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
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

              <div className="grid grid-cols-2 gap-3">
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
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
                    .filter((s) => s.Role === "Delivery" || s.Role === "Staff")
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
                Order Details ({selectedOrder.id})
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-sm font-bold text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 text-sm">
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-sm w-full p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
                Staff Profile (#STF-00{selectedStaffDetails.StaffID})
              </h3>
              <button
                onClick={() => setSelectedStaffDetails(null)}
                className="text-sm font-bold text-slate-400"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 text-sm">
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
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
              <div className="grid grid-cols-3 gap-3">
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-lg w-full p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
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
              <div className="grid grid-cols-4 gap-2">
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
              <div className="grid grid-cols-2 gap-3">
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-lg w-full p-8 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
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
              <div className="grid grid-cols-4 gap-2">
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
              <div className="grid grid-cols-2 gap-3">
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

      {/* Sidebar Navigation */}
      <aside
        className={`bg-blue-900 text-white flex flex-col justify-between transition-all duration-300 shadow-xl z-30 sticky top-0 h-screen ${isSidebarCollapsed ? "w-20" : "w-72"}`}
      >
        <div className="overflow-y-auto overflow-x-hidden flex-1">
          <div className="p-6 border-b border-blue-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-blue-800 p-2.5 rounded-2xl shadow-sm shrink-0 border border-blue-700">
                <Droplet className="h-6 w-6 text-cyan-300 fill-cyan-300" />
              </div>
              {!isSidebarCollapsed && (
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
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-xl bg-blue-800/60 hover:bg-blue-800 transition text-white cursor-pointer border border-blue-700 shrink-0"
            >
              <Menu className="h-4 w-4" />
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
                if (!isSidebarCollapsed) {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setActiveSubView(null);
                }
              }}
              className={`w-full flex items-center justify-between bg-blue-800/60 hover:bg-blue-800 p-3 rounded-2xl border border-blue-700 transition cursor-pointer ${isSidebarCollapsed ? "justify-center px-1 py-2" : ""}`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-md shrink-0">
                  {adminName.charAt(0)}
                </div>
                {!isSidebarCollapsed && (
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
              {!isSidebarCollapsed && (
                <ChevronDown
                  className={`h-4 w-4 text-blue-200 transition-transform duration-300 ${isProfileMenuOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {isProfileMenuOpen && !isSidebarCollapsed && (
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
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-blue-900 border border-blue-700 rounded-xl text-sm text-white outline-none"
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
                          Branch
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
                          Hotline
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
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          localStorage.clear();
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
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "dashboard" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "orders" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <ShoppingCart className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>Orders</span>}
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "products" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <Package className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>Products</span>}
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "reports" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <TrendingUp className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>Sales & Forecasts</span>}
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "customers" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <Users className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>Customer Directory</span>}
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${activeTab === "staff" ? "bg-blue-800 text-white shadow-md border border-blue-700" : "text-blue-200 hover:bg-blue-800/50 hover:text-white"}`}
            >
              <Briefcase className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>Staff & Drivers</span>}
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-blue-800 shrink-0">
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 bg-blue-800/60 hover:bg-blue-800 text-blue-200 hover:text-white py-3.5 rounded-2xl font-bold text-base transition border border-blue-700"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {!isSidebarCollapsed && <span>Back to Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header (Quick Search First, Bell Second) */}
        <div className="px-8 lg:px-12 pt-8 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              {activeTab === "dashboard" && "Admin Dashboard"}
              {activeTab === "orders" && "Order Management"}
              {activeTab === "products" && "Product Catalog & Inventory"}
              {activeTab === "reports" && "Sales Reports & Demand Forecast"}
              {activeTab === "customers" && "Customer Directory"}
              {activeTab === "staff" && "Staff & Driver Management"}
            </h1>
            <p className="text-base text-slate-600 mt-1 font-semibold">
              Manage complete station operations with full CRUD interactivity.
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {/* Quick Search Bar */}
            <div className="relative w-full sm:w-64">
              <Command className="absolute left-4 top-3.5 h-4 w-4 text-blue-600" />
              <input
                type="text"
                placeholder="Quick search..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none shadow-sm focus:border-blue-500 transition"
              />
            </div>

            {/* Notifications Dropdown Bell */}
            <div className="relative" ref={notifRef}>
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
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 rounded-2xl border transition ${n.unread ? "bg-blue-50/50 border-blue-100" : "bg-slate-50 border-slate-100 opacity-75"}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-slate-900 block">
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          {n.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="p-8 lg:p-12 pt-4 max-w-[1600px] w-full mx-auto flex-1 space-y-8">
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
                      Total Revenue
                    </span>
                    <h3 className="text-3xl font-black text-blue-600">
                      ₱100.00
                    </h3>
                  </div>
                  <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl border border-blue-100">
                    <Coins className="h-7 w-7" />
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
                      Pending Orders
                    </span>
                    <h3 className="text-3xl font-black text-amber-600">0</h3>
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
                    <h3 className="text-3xl font-black text-blue-500">1</h3>
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
                    <h3 className="text-3xl font-black text-purple-600">1</h3>
                  </div>
                  <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl border border-purple-100">
                    <Box className="h-7 w-7" />
                  </div>
                </div>
              </div>

              {/* Low Stock Warning Banner */}
              {products.some((p) => p.stock <= p.minStock) && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-[28px] flex items-center justify-between shadow-sm animate-fadeIn">
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-100 text-amber-700 p-3 rounded-2xl">
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
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow cursor-pointer"
                  >
                    View Inventory
                  </button>
                </div>
              )}

              {/* Real SVG Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
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

                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
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
                          1 Order (50%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: "50%" }}
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
                          1 Order (50%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: "50%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Audit Trail Widget */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black uppercase text-slate-900 flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>System Audit Trail & Recent Activity Log</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    Live Workspace Monitoring
                  </span>
                </div>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/60 transition"
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
                              {log.user}
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
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-slate-600">
                  {orders.length} order(s) found
                </p>
                <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option>All Orders</option>
                    <option>Delivery</option>
                    <option>Pending</option>
                    <option>Delivered</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Order Management & Payment Verification
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-base">
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
                      {orders.map((ord) => (
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
                              onClick={() => handleTogglePaymentStatus(ord.id)}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. PRODUCTS TAB ================= */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-slate-600">
                  Product Catalog & Inventory Levels
                </p>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProdName("");
                    setNewProdPrice("");
                    setNewProdStock("");
                    setNewProdMinStock("10");
                    setIsAddProductOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="h-5 w-5 stroke-[3]" />
                  <span>Add Inventory Item</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => {
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
                          <span>LOW STOCK WARNING (Min: {prod.minStock})</span>
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
                })}
              </div>
            </div>
          )}

          {/* ================= 4. SALES REPORTS & GENERATE REPORTS TAB ================= */}
          {activeTab === "reports" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Generate Reports & Analytics
                  </h3>
                  <p className="text-sm text-slate-600">
                    Filter financial statements, sales logs, and inventory
                    requirements.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <select
                      value={reportType}
                      onChange={(e) =>
                        setReportType(e.target.value as "sales" | "inventory")
                      }
                      className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="sales">Sales & Transactions Report</option>
                      <option value="inventory">
                        Inventory & Demand Forecast Report
                      </option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <select
                      value={reportDateRange}
                      onChange={(e) => setReportDateRange(e.target.value)}
                      className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="Today">Today</option>
                      <option value="This Week">This Week</option>
                      <option value="This Month">This Month</option>
                      <option value="Year-to-Date">Year-to-Date</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setIsRecordSaleOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 shadow-md cursor-pointer"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 shadow-md cursor-pointer"
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
                      Period ({reportDateRange}) Sales
                    </span>
                    <h3 className="text-3xl font-black text-blue-600">
                      ₱150.00
                    </h3>
                  </div>
                  <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl border border-blue-100">
                    <TrendingUp className="h-7 w-7" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Entries
                    </span>
                    <h3 className="text-3xl font-black text-slate-900">
                      {salesRecords.length + orders.length}
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
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black uppercase text-slate-900 flex items-center space-x-2">
                      <Receipt className="h-5 w-5 text-emerald-600" />
                      <span>
                        Sales & Transactions Breakdown ({reportDateRange})
                      </span>
                    </h3>
                    <span className="text-xs font-bold text-slate-400">
                      Showing all registered logs
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-base">
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
                        {salesRecords.map((txn) => (
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black uppercase text-slate-900 flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span>
                        Inventory Usage & Demand Forecast Report (
                        {reportDateRange})
                      </span>
                    </h3>
                    <span className="text-xs font-bold text-slate-400">
                      Moving average calculations
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-base">
                      <thead>
                        <tr className="border-b border-slate-100 text-sm text-slate-400 uppercase font-black">
                          <th className="py-4 px-4 align-middle">
                            Forecast ID
                          </th>
                          <th className="py-4 px-4 align-middle">
                            Product Name
                          </th>
                          <th className="py-4 px-4 align-middle">
                            Forecast Date
                          </th>
                          <th className="py-4 px-4 align-middle">
                            Forecasted Demand
                          </th>
                          <th className="py-4 px-4 align-middle">Sales Ref</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {forecastList.map((fc) => (
                          <tr
                            key={fc.ForecastID}
                            className="hover:bg-slate-50 transition"
                          >
                            <td className="py-5 px-4 font-bold text-blue-600 align-middle">
                              #FC-{fc.ForecastID}
                            </td>
                            <td className="py-5 px-4 font-bold text-slate-900 align-middle">
                              {fc.ProductName}
                            </td>
                            <td className="py-5 px-4 text-slate-700 align-middle">
                              {fc.ForecastDate}
                            </td>
                            <td className="py-5 px-4 align-middle">
                              <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1.5 rounded-full font-black text-sm">
                                {fc.ForecastedDemand} units
                              </span>
                            </td>
                            <td className="py-5 px-4 font-mono text-slate-600 text-xs align-middle">
                              {fc.SalesHistoryRef}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-lg cursor-pointer shrink-0"
                >
                  <Plus className="h-5 w-5 stroke-[3]" />
                  <span>Register Customer</span>
                </button>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Registered Customer Accounts ({filteredCustomers.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-base">
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
                      {filteredCustomers.map((cust) => (
                        <tr
                          key={cust.CustomerID}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-5 px-5 font-bold text-blue-600 align-middle">
                            #CUST-{cust.CustomerID}
                          </td>
                          <td className="py-5 px-5 font-bold text-slate-900 align-middle">
                            {cust.LastName}, {cust.FirstName} {cust.MiddleName}{" "}
                            {cust.Suffix}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. STAFF & DRIVERS TAB ================= */}
          {activeTab === "staff" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-slate-600">
                  Total Team Members: {staffList.length}
                </p>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-lg cursor-pointer"
                >
                  <Plus className="h-5 w-5 stroke-[3]" />
                  <span>Add Staff / Rider</span>
                </button>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Staff & Driver Roster (Login Credentials)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-base">
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
                      {staffList.map((stf) => (
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
                      ))}
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
