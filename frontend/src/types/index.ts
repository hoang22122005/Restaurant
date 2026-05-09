// ── Entities matching Backend DTOs ──

export interface Restaurant {
  restaurantID: string;
  restaurantName: string;
  type: string;
  brand: string;
  taxCode: number;
}

export interface Branch {
  branchID: string;
  branchName: string;
  address: string;
  city: string;
  region: string;
  phoneNumber: string;
  email: string;
  establishedDate: string;
  status: string;
  restaurantID: string;
}

export interface Employee {
  employeeID: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  position: string;
  salary: number;
  hireDate: string;
  status: string;
  branchID: string;
}

export interface Customer {
  customerID: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  customerType: string;
  branchID: string;
}

export interface Dish {
  dishID: string;
  dishName: string;
  price: number;
  category: string;
  description: string;
  status: string;
}

export interface Order {
  orderID: string;
  orderTime: string;
  totalAmount: number;
  status: string;
  employeeID: string;
  customerID: string;
  vat: number;
  employeeName?: string;
  customerName?: string;
  branchID?: string;
  branchName?: string;
}

export interface OrderDetail {
  orderDetailID: string;
  orderID: string;
  dishID: string;
  quantity: number;
  unitPrice: number;
}

export interface Payment {
  paymentID: string;
  method: string;
  amount: number;
  paymentTime: string;
  status: string;
  orderID: string;
}

// ── Dashboard & Reports ──

export interface DashboardStats {
  totalBranches: number;
  totalDishes: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface RevenueReport {
  branchID: string;
  branchName: string;
  period: string;
  orderCount: number;
  totalRevenue: number;
}
