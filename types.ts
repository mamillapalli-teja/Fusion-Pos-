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
}

export interface OrderItem extends MenuItem {
  quantity: number;
  notes?: string;
  selectedModifiers?: Modifier[];
}

export interface Order {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  dispatchType: DispatchType;
  status: OrderStatus;
  createdAt: Date;
  customerName?: string;
  tableNumber?: number;
  total: number;
  subtotal: number;
  tax: number;
}

export type ViewType = 'dashboard' | 'pos' | 'orders' | 'kds' | 'inventory' | 'reports' | 'staff' | 'settings';