export const SITE_OPTIONS = [
  { id: 'MAIN', label: 'Tổng Hệ Thống', branchId: '' },
  { id: 'SITE1', label: 'Chi Nhánh Thái Bình', branchId: 'BRA01' },
  { id: 'SITE2', label: 'Chi Nhánh vĩnh Phúc', branchId: 'BRA02' },
  { id: 'SITE3', label: 'Chi Nhánh Hà Nội', branchId: 'BRA03' },
] as const;

export type SiteId = 'MAIN' | 'SITE1' | 'SITE2' | 'SITE3';

export const SITE_TO_BRANCH: Record<SiteId, string> = {
  MAIN: '',
  SITE1: 'BRA01',
  SITE2: 'BRA02',
  SITE3: 'BRA03',
};

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'] as const;
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'] as const;
export const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Bank Transfer', 'E-Wallet'] as const;
export const EMPLOYEE_POSITIONS = ['Manager', 'Chef', 'Waiter', 'Cashier', 'Security'] as const;
export const DISH_CATEGORIES = ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish'] as const;
export const CUSTOMER_TYPES = ['Regular', 'VIP', 'New'] as const;
