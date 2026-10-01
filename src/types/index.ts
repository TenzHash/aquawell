export type UserRole = 'Admin' | 'Staff' | 'Delivery' | 'Customer';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  contact_number: string;
  address?: string;
}

export interface InventoryItem {
  inventory_id: number;
  product_name: string; // e.g., "5-Gallon Slim", "5-Gallon Round"
  stock_level: number;
  max_stock_level: number;
  unit_price: number;
}

export interface Order {
  order_id: number;
  customer_id: string;
  staff_id?: string;
  order_date: string;
  delivery_or_pickup: 'Delivery' | 'Pickup';
  order_status: 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered' | 'Completed';
}