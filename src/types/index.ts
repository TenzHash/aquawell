export type UserRole = "admin" | "staff" | "delivery" | "customer";
export type FulfillmentType = "Delivery" | "Pickup";
export type OrderStatus = "PENDING" | "OUT FOR-DELIVERY" | "DELIVERED" | "READY FOR PICKUP" | "PICKED UP";
export type PaymentMethod = "Cash" | "GCash" | "Bank Transfer";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  barangay: string;
  landmark?: string | null;
  role: UserRole;
  created_at: string;
}

export interface Customer {
  customer_id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  address: string;
  contact_number: string;
  email: string;
  created_at: string;
  profile_id?: string | null;
}

export interface Staff {
  staff_id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  role: "Admin" | "Staff" | "Delivery";
  contact_number: string;
  email: string;
  created_at: string;
  profile_id?: string | null;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: "Refill" | "Hardware";
  price: number;
  stock: number;
  min_stock: number;
  created_at: string;
}

export interface Order {
  id: string;
  type: FulfillmentType;
  total: number;
  status: OrderStatus;
  payment_status: string;
  created_at: string;
  receipt_url?: string | null;
  customer_id?: string | null;
  address?: string | null;
  reference_no?: string | null;
  archived?: boolean | null;
  rider_id?: number | null;
}

export interface OrderItem {
  id: number;
  order_id: string;
  inventory_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface Payment {
  payment_id: number;
  order_id: string;
  amount: number;
  payment_method?: PaymentMethod | null;
  payment_status: PaymentStatus;
  reference_no?: string | null;
  receipt_url?: string | null;
  paid_at?: string | null;
  created_at: string;
}

export interface Sale {
  transaction_id: string;
  customer_name: string;
  item_name: string;
  quantity: number;
  total_amount: number;
  payment_method: PaymentMethod;
  date: string;
  created_at: string;
  order_id?: string | null;
}
