
export enum DispatchType {
  DINE_IN = 'Dine-In',
  COLLECTION = 'Collection',
  TAKE_OUT = 'Takeaway',
  DELIVERY = 'Delivery',
  QR_ORDER = 'QR Order'
}

export enum OrderStatus {
  NEW = 'New',
  PREPARING = 'Preparing',
  READY = 'Ready',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum PaymentMethod {
    CASH = 'Cash',
    CARD = 'Card',
    MOBILE = 'Mobile',
    VOUCHER = 'Voucher'
}

export enum PaymentStatus {
    PENDING = 'Pending',
    PAID = 'Paid'
}

export interface AppConfig {
  appName: string;
  logoUrl?: string;
  currencySymbol: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Modifier {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  selectionType: 'single' | 'multiple';
  modifiers: Modifier[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  availableFor?: DispatchType[];
  modifierGroups?: ModifierGroup[];
  stock?: number;
  barcode?: string;
  allergens?: string[];
}

export interface OrderItem extends MenuItem {
  quantity: number;
  notes?: string;
  selectedModifiers?: Modifier[];
  originalPrice?: number;
  priceOverrideReason?: string;
  seatNumber?: number;
  isSentToKitchen?: boolean;
}

export interface DeliveryAddress {
  eircode: string;
  line1: string;
  line2?: string;
  city: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  addresses: DeliveryAddress[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Manager' | 'Cashier' | 'Chef' | 'Admin';
  pin: string;
  email?: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  joinedDate: Date;
}

export interface Order {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  dispatchType: DispatchType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  customerName?: string;
  customerPhone?: string;
  tableNumber?: number;
  numberOfGuests?: number;
  deliveryAddress?: DeliveryAddress;
  total: number;
  subtotal: number;
  tax: number;
  discountAmount?: number;
}

export type ViewType = 'dashboard' | 'pos' | 'orders' | 'kds' | 'inventory' | 'reports' | 'staff' | 'settings' | 'bills' | 'audit';
