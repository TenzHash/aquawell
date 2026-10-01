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
  DollarSign,
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
  Phone,
  MapPin,
  Search,
  Shield,
  Briefcase,
  BarChart3,
  Edit3,
  Trash2,
  CoinsIcon,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "orders" | "products" | "reports" | "customers" | "staff"
  >("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [orderFilter, setOrderFilter] = useState("All Orders");

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
    showToast("Profile updated successfully!", "success");
  };

  const handleSaveSettings = () => {
    localStorage.setItem("aquawell_station_name", stationName);
    localStorage.setItem("aquawell_station_phone", stationPhone);
    setActiveSubView(null);
    setIsProfileMenuOpen(false);
    showToast("Station settings saved successfully!", "success");
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
        setActiveSubView(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= 1. ORDERS CRUD STATE & MODALS =================
  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      customer: "John Doe",
      phone: "+1234567891",
      type: "Delivery",
      date: "3/10/2026",
      total: "₱100.00",
      status: "DELIVERED",
      rider: "Rider Juan",
    },
    {
      id: "ORD-002",
      customer: "Maria Santos",
      phone: "+63 918 765 4321",
      type: "Delivery",
      date: "3/15/2026",
      total: "₱104.00",
      status: "OUT FOR-DELIVERY",
      rider: "Junmar Perez",
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter((o) => o.id !== id));
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
          return { ...ord, status: nextStatus };
        }
        return ord;
      }),
    );
    showToast(`Updated status for order ${id}`, "success");
  };

  // ================= 2. PRODUCTS CRUD STATE & MODALS =================
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "5-Gallon Purified Water Refill",
      category: "Refill",
      price: "₱50.00",
      stock: 120,
      status: "In Stock",
    },
    {
      id: 2,
      name: "Container Dispenser Pump",
      category: "Hardware",
      price: "₱250.00",
      stock: 15,
      status: "In Stock",
    },
  ]);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Refill");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: newProdName,
                category: newProdCategory,
                price: `₱${Number(newProdPrice).toFixed(2)}`,
                stock: Number(newProdStock),
                status: Number(newProdStock) > 0 ? "In Stock" : "Out of Stock",
              }
            : p,
        ),
      );
      showToast("Product updated successfully!", "success");
    } else {
      const newProduct = {
        id: products.length + 1,
        name: newProdName,
        category: newProdCategory,
        price: `₱${Number(newProdPrice).toFixed(2)}`,
        stock: Number(newProdStock),
        status: Number(newProdStock) > 0 ? "In Stock" : "Out of Stock",
      };
      setProducts([...products, newProduct]);
      showToast("Product added to inventory successfully!", "success");
    }
    setIsAddProductOpen(false);
    setEditingProduct(null);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdStock("");
  };

  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setNewProdName(prod.name);
    setNewProdCategory(prod.category);
    setNewProdPrice(prod.price.replace("₱", ""));
    setNewProdStock(prod.stock);
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
    showToast("Product removed from inventory", "success");
  };

  // ================= 3. CUSTOMER DIRECTORY CRUD STATE & MODALS =================
  const [customers, setCustomers] = useState([
    {
      CustomerID: 1,
      LastName: "Doe",
      FirstName: "John",
      MiddleName: "A.",
      Address: "Padang, Legazpi City, Albay",
      ContactNumber: "+63 912 345 6789",
      Email: "john.doe@example.com",
    },
    {
      CustomerID: 2,
      LastName: "Santos",
      FirstName: "Maria",
      MiddleName: "B.",
      Address: "Rawis, Legazpi City, Albay",
      ContactNumber: "+63 918 765 4321",
      Email: "maria.santos@example.com",
    },
  ]);

  const [customerSearch, setCustomerSearch] = useState("");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  const [newCustFirstName, setNewCustFirstName] = useState("");
  const [newCustLastName, setNewCustLastName] = useState("");
  const [newCustMiddleName, setNewCustMiddleName] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustContact, setNewCustContact] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      setCustomers(
        customers.map((c) =>
          c.CustomerID === editingCustomer.CustomerID
            ? {
                ...c,
                FirstName: newCustFirstName,
                LastName: newCustLastName,
                MiddleName: newCustMiddleName,
                Address: newCustAddress,
                ContactNumber: newCustContact,
                Email: newCustEmail,
              }
            : c,
        ),
      );
      showToast("Customer account updated successfully!", "success");
    } else {
      const newEntry = {
        CustomerID: customers.length + 1,
        FirstName: newCustFirstName,
        LastName: newCustLastName,
        MiddleName: newCustMiddleName,
        Address: newCustAddress,
        ContactNumber: newCustContact,
        Email: newCustEmail,
      };
      setCustomers([newEntry, ...customers]);
      showToast("Customer registered successfully!", "success");
    }
    setIsAddCustomerOpen(false);
    setEditingCustomer(null);
    setNewCustFirstName("");
    setNewCustLastName("");
    setNewCustMiddleName("");
    setNewCustAddress("");
    setNewCustContact("");
    setNewCustEmail("");
  };

  const handleOpenEditCustomer = (cust: any) => {
    setEditingCustomer(cust);
    setNewCustFirstName(cust.FirstName);
    setNewCustLastName(cust.LastName);
    setNewCustMiddleName(cust.MiddleName);
    setNewCustAddress(cust.Address);
    setNewCustContact(cust.ContactNumber);
    setNewCustEmail(cust.Email);
    setIsAddCustomerOpen(true);
  };

  const handleDeleteCustomer = (id: number) => {
    setCustomers(customers.filter((c) => c.CustomerID !== id));
    showToast("Customer account removed", "success");
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.FirstName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.LastName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.Email.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  // ================= 4. STAFF & DRIVERS CRUD STATE & MODALS =================
  const [staffList, setStaffList] = useState([
    {
      StaffID: 1,
      LastName: "Binamira",
      FirstName: "Terrenze Josh",
      MiddleName: "M.",
      Role: "Admin",
      ContactNumber: "+63 912 345 6789",
    },
    {
      StaffID: 2,
      LastName: "Colarina",
      FirstName: "Malbert",
      MiddleName: "P.",
      Role: "Staff",
      ContactNumber: "+63 919 876 5432",
    },
    {
      StaffID: 3,
      LastName: "Perez",
      FirstName: "Junmar",
      MiddleName: "S.",
      Role: "Delivery",
      ContactNumber: "+63 917 111 2233",
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
  const [newStaffRole, setNewStaffRole] = useState("Delivery");
  const [newStaffContact, setNewStaffContact] = useState("");

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      setStaffList(
        staffList.map((s) =>
          s.StaffID === editingStaff.StaffID
            ? {
                ...s,
                FirstName: newStaffFirstName,
                LastName: newStaffLastName,
                MiddleName: newStaffMiddleName,
                Role: newStaffRole,
                ContactNumber: newStaffContact,
              }
            : s,
        ),
      );
      showToast("Staff member updated successfully!", "success");
    } else {
      const newStaffEntry = {
        StaffID: staffList.length + 1,
        FirstName: newStaffFirstName,
        LastName: newStaffLastName,
        MiddleName: newStaffMiddleName,
        Role: newStaffRole,
        ContactNumber: newStaffContact,
      };
      setStaffList([newStaffEntry, ...staffList]);
      showToast("Staff member added successfully!", "success");
    }
    setIsAddStaffOpen(false);
    setEditingStaff(null);
    setNewStaffFirstName("");
    setNewStaffLastName("");
    setNewStaffMiddleName("");
    setNewStaffRole("Delivery");
    setNewStaffContact("");
  };

  const handleOpenEditStaff = (stf: any) => {
    setEditingStaff(stf);
    setNewStaffFirstName(stf.FirstName);
    setNewStaffLastName(stf.LastName);
    setNewStaffMiddleName(stf.MiddleName);
    setNewStaffRole(stf.Role);
    setNewStaffContact(stf.ContactNumber);
    setIsAddStaffOpen(true);
  };

  const handleDeleteStaff = (id: number) => {
    setStaffList(staffList.filter((s) => s.StaffID !== id));
    showToast("Staff member removed", "success");
  };

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
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 animate-bounce">
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

      {/* ================= MODALS FOR FULL CRUD OPERATIONS ================= */}

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
                <span className="font-bold text-slate-900">
                  {selectedOrder.rider}
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
                  {selectedStaffDetails.MiddleName}
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                >
                  <option value="Refill">Refill</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Unit Price (₱)
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
                    Stock Level
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustFirstName}
                    onChange={(e) => setNewCustFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={newCustMiddleName}
                    onChange={(e) => setNewCustMiddleName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+63 9..."
                    value={newCustContact}
                    onChange={(e) => setNewCustContact(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
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
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full p-8 space-y-6 animate-fadeIn">
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaffFirstName}
                    onChange={(e) => setNewStaffFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Role / Designation
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Delivery">Delivery / Rider</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+63 9..."
                  value={newStaffContact}
                  onChange={(e) => setNewStaffContact(e.target.value)}
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
        <div className="px-8 lg:px-12 pt-8 pb-2 flex justify-between items-center">
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
        </div>

        <main className="p-8 lg:p-12 pt-4 max-w-[1600px] w-full mx-auto flex-1 space-y-8">
          {/* ================= 1. DASHBOARD TAB ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              {/* 5 Stat Cards */}
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
                    <CoinsIcon className="h-7 w-7" />
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
                  Order Management & Fulfillment
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-base">
                    <thead>
                      <tr className="border-b border-slate-100 text-sm text-slate-400 uppercase font-black">
                        <th className="pb-5 px-5">Order ID</th>
                        <th className="pb-5 px-5">Customer</th>
                        <th className="pb-5 px-5">Type</th>
                        <th className="pb-5 px-5">Total</th>
                        <th className="pb-5 px-5">Status (Cycle)</th>
                        <th className="pb-5 px-5">Driver</th>
                        <th className="pb-5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {orders.map((ord) => (
                        <tr
                          key={ord.id}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-5 px-5 font-bold text-blue-600">
                            {ord.id}
                          </td>
                          <td className="py-5 px-5 font-bold text-slate-900">
                            {ord.customer}
                          </td>
                          <td className="py-5 px-5">
                            <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700 font-bold text-xs">
                              {ord.type}
                            </span>
                          </td>
                          <td className="py-5 px-5 font-bold text-slate-900">
                            {ord.total}
                          </td>
                          <td className="py-5 px-5">
                            <button
                              onClick={() => handleToggleOrderStatus(ord.id)}
                              className={`px-4 py-1.5 rounded-full font-black text-xs tracking-wider cursor-pointer hover:opacity-80 transition ${ord.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-orange-100 text-orange-800 border border-orange-200"}`}
                              title="Click to cycle status"
                            >
                              {ord.status} 🔄
                            </button>
                          </td>
                          <td className="py-5 px-5 font-bold text-slate-700">
                            {ord.rider}
                          </td>
                          <td className="py-5 px-5 text-right space-x-3">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition inline-flex items-center space-x-1.5 cursor-pointer text-sm"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(ord.id)}
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

          {/* ================= 3. PRODUCTS TAB ================= */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-end items-center">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProdName("");
                    setNewProdPrice("");
                    setNewProdStock("");
                    setIsAddProductOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="h-5 w-5 stroke-[3]" />
                  <span>Add Inventory Item</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white p-7 rounded-[28px] border border-slate-200 shadow-sm space-y-4 relative group"
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
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <span className="text-base font-black text-blue-600">
                        {prod.price}
                      </span>
                      <span className="text-sm font-bold text-slate-600">
                        Stock: {prod.stock} units
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 4. SALES REPORTS & FORECASTS TAB ================= */}
          {activeTab === "reports" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Sales Performance & Analytics
                  </h3>
                  <p className="text-sm text-slate-600">
                    Monitor financial reports and demand forecasts.
                  </p>
                </div>
                <button
                  onClick={() =>
                    showToast("CSV exported successfully", "success")
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-md cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Sales
                    </span>
                    <h3 className="text-3xl font-black text-blue-600">
                      ₱100.00
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
                      Delivered Orders
                    </span>
                    <h3 className="text-3xl font-black text-emerald-600">1</h3>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl border border-emerald-100">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Avg Order Value
                    </span>
                    <h3 className="text-3xl font-black text-purple-600">
                      ₱100.00
                    </h3>
                  </div>
                  <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl border border-purple-100">
                    <DollarSign className="h-7 w-7" />
                  </div>
                </div>
              </div>

              {/* Demand Forecast Table Section */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-base font-black uppercase text-slate-900 flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Demand Forecast Analytics (Forecast Table)</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-base">
                    <thead>
                      <tr className="border-b border-slate-100 text-sm text-slate-400 uppercase font-black">
                        <th className="pb-4 px-4">Forecast ID</th>
                        <th className="pb-4 px-4">Product Name</th>
                        <th className="pb-4 px-4">Forecast Date</th>
                        <th className="pb-4 px-4">Forecasted Demand</th>
                        <th className="pb-4 px-4">Sales Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {forecastList.map((fc) => (
                        <tr
                          key={fc.ForecastID}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-5 px-4 font-bold text-blue-600">
                            #FC-{fc.ForecastID}
                          </td>
                          <td className="py-5 px-4 font-bold text-slate-900">
                            {fc.ProductName}
                          </td>
                          <td className="py-5 px-4 text-slate-700">
                            {fc.ForecastDate}
                          </td>
                          <td className="py-5 px-4">
                            <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1.5 rounded-full font-black text-sm">
                              {fc.ForecastedDemand} units
                            </span>
                          </td>
                          <td className="py-5 px-4 font-mono text-slate-600 text-xs">
                            {fc.SalesHistoryRef}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Product Performance Table */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-black uppercase text-slate-700">
                  Product Performance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-base">
                    <thead>
                      <tr className="border-b border-slate-100 text-sm text-slate-400 uppercase font-black">
                        <th className="pb-4">Product Name</th>
                        <th className="pb-4">Quantity Sold</th>
                        <th className="pb-4 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      <tr>
                        <td className="py-5 font-bold text-slate-900">
                          5-Gallon Purified Water
                        </td>
                        <td className="py-5">2</td>
                        <td className="py-5 text-right font-black text-blue-600">
                          ₱50.00
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
                  <table className="w-full text-center text-base">
                    <thead>
                      <tr className="border-b border-slate-100 text-sm text-slate-400 uppercase font-black">
                        <th className="pb-5 px-5">ID</th>
                        <th className="pb-5 px-5">Full Name</th>
                        <th className="pb-5 px-5">Address</th>
                        <th className="pb-5 px-5">Contact</th>
                        <th className="pb-5 px-5">Email</th>
                        <th className="pb-5 px-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {filteredCustomers.map((cust) => (
                        <tr
                          key={cust.CustomerID}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-5 px-5 font-bold text-blue-600">
                            #CUST-{cust.CustomerID}
                          </td>
                          <td className="py-5 px-5 font-bold text-slate-900">
                            {cust.LastName}, {cust.FirstName} {cust.MiddleName}
                          </td>
                          <td className="py-5 px-5 text-slate-700">
                            {cust.Address}
                          </td>
                          <td className="py-5 px-5 text-slate-700">
                            {cust.ContactNumber}
                          </td>
                          <td className="py-5 px-5 text-blue-600 font-bold">
                            {cust.Email}
                          </td>
                          <td className="py-5 px-5 text-right space-x-3">
                            <button
                              onClick={() => handleOpenEditCustomer(cust)}
                              className="px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition inline-flex items-center space-x-1.5 cursor-pointer text-sm"
                            >
                              <Edit3 className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCustomer(cust.CustomerID)
                              }
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
                    setNewStaffRole("Delivery");
                    setNewStaffContact("");
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
                  Staff & Driver Roster
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-base">
                    <thead>
                      <tr className="border-b border-slate-100 text-sm text-slate-400 uppercase font-black">
                        <th className="pb-5 px-5">Staff ID</th>
                        <th className="pb-5 px-5">Full Name</th>
                        <th className="pb-5 px-5">Role</th>
                        <th className="pb-5 px-5">Contact</th>
                        <th className="pb-5 px-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {staffList.map((stf) => (
                        <tr
                          key={stf.StaffID}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-5 px-5 font-bold text-blue-600">
                            #STF-00{stf.StaffID}
                          </td>
                          <td className="py-5 px-5 font-bold text-slate-900">
                            {stf.LastName}, {stf.FirstName} {stf.MiddleName}
                          </td>
                          <td className="py-5 px-5">
                            <span
                              className={`px-4 py-1.5 rounded-full font-black text-xs tracking-wider inline-flex items-center space-x-1 ${stf.Role === "Admin" ? "bg-purple-100 text-purple-800 border border-purple-200" : stf.Role === "Staff" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"}`}
                            >
                              <span>{stf.Role}</span>
                            </span>
                          </td>
                          <td className="py-5 px-5 text-slate-700">
                            {stf.ContactNumber}
                          </td>
                          <td className="py-5 px-5 text-right space-x-3">
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
