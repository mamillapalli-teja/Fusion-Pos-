
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { OrderItem, MenuItem, DispatchType, PaymentMethod, DeliveryAddress, Customer, AppConfig, PaymentStatus, Order, OrderStatus, StaffMember } from '../../types';
import { MenuItemCard } from './MenuItemCard';
import { PaymentModal } from './PaymentModal';
import { Icon } from '../shared/Icon';
import { ItemDetailModal } from './ItemDetailModal';
import { DispatchDetailsModal } from './DispatchDetailsModal';
import { getCategoryPriority } from '../../constants';

// Category Icons Mapping
const CATEGORY_ICONS: Record<string, string> = {
    'All': '🍽️',
    'Pizza': '🍕',
    'Burgers': '🍔',
    'Salads': '🥗',
    'Pasta': '🍝',
    'Sides': '🍟',
    'Drinks': '🥤',
    'Desserts': '🍰',
    'Starters': '🥘',
    'Mains': '🍱'
};

// --- Note Modal ---
interface NoteModalProps {
  initialNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ initialNote, onSave, onClose }) => {
  const [note, setNote] = useState(initialNote);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-xl shadow-2xl w-full max-sm border border-dark-border flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-3 bg-dark-bg border-b border-dark-border flex justify-between items-center">
            <h3 className="text-base font-bold text-light-text">Item Note</h3>
             <button onClick={onClose} className="p-1.5 hover:bg-dark-border rounded-full text-medium-text hover:text-light-text transition-colors">
                <Icon className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>
            </button>
        </div>
        <div className="p-4">
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-32 bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none mb-4 placeholder-gray-500 text-sm"
                placeholder="Enter instructions (e.g. No ice, extra spicy)..."
                autoFocus
            />
            <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2 bg-dark-border hover:bg-dark-border/80 text-light-text font-bold rounded-lg transition-colors text-sm">
                    Cancel
                </button>
                <button onClick={() => onSave(note)} className="flex-1 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg transition-colors shadow-lg shadow-brand-primary/20 text-sm">
                    Save Note
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Quantity Control Modal ---
interface QuantityControlModalProps {
  item: OrderItem;
  initialQuantity: number;
  onSave: (quantity: number) => void;
  onClose: () => void;
}

const QuantityControlModal: React.FC<QuantityControlModalProps> = ({ item, initialQuantity, onSave, onClose }) => {
  const [value, setValue] = useState(initialQuantity.toString());
  const [overwriteOnNextInput, setOverwriteOnNextInput] = useState(true);

  const handleNumClick = (num: number) => {
    if (overwriteOnNextInput) {
      setValue(num.toString());
      setOverwriteOnNextInput(false);
    } else {
      setValue(prev => (prev === '0' ? num.toString() : prev + num.toString()));
    }
  };

  const handleBackspace = () => {
    if (overwriteOnNextInput) {
        setValue('0');
        setOverwriteOnNextInput(false);
    } else {
        setValue(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    }
  };

  const handleClear = () => {
    setValue('0');
    setOverwriteOnNextInput(false);
  };

  const itemUnitPrice = useMemo(() => {
    const modifiersCost = item.selectedModifiers?.reduce((sum, mod) => sum + mod.priceAdjustment, 0) || 0;
    return item.price + modifiersCost;
  }, [item]);

  const newTotal = itemUnitPrice * parseInt(value || '0', 10);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-xl shadow-2xl w-full max-xs border border-dark-border flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-3 bg-dark-bg border-b border-dark-border flex justify-between items-center">
            <h3 className="text-base font-bold text-light-text">Update Quantity</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-dark-border rounded-full text-medium-text hover:text-light-text transition-colors">
                <Icon className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>
            </button>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
            <p className="text-center text-medium-text font-medium text-sm">{item.name}</p>
            <p className="text-center text-xs text-medium-text mb-2">Unit Price: ${itemUnitPrice.toFixed(2)}</p>
            
            <div className={`text-4xl font-mono font-bold text-center mb-2 bg-dark-bg p-2 rounded-lg border border-dark-border shadow-inner ${overwriteOnNextInput ? 'text-brand-primary/70' : 'text-brand-primary'}`}>
                {value}
            </div>
            
            <p className="text-center text-base mb-4">
                Total: <span className="font-bold text-light-text">${newTotal.toFixed(2)}</span>
            </p>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumClick(num)}
                        className="h-12 text-xl font-bold bg-dark-border rounded-lg hover:bg-brand-secondary active:bg-brand-primary transition-all text-light-text"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={handleClear}
                    className="h-12 text-lg font-bold bg-red-900/20 text-red-400 border border-red-900/30 rounded-lg hover:bg-red-900/40 transition-all"
                >
                    C
                </button>
                <button
                    onClick={() => handleNumClick(0)}
                    className="h-12 text-xl font-bold bg-dark-border rounded-lg hover:bg-brand-secondary active:bg-brand-primary transition-all text-light-text"
                >
                    0
                </button>
                <button
                    onClick={handleBackspace}
                    className="h-12 flex items-center justify-center bg-dark-border rounded-lg hover:bg-brand-secondary active:bg-brand-primary transition-all text-light-text"
                >
                    <Icon className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l3.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" /></Icon>
                </button>
            </div>
            
            <button
                onClick={() => onSave(parseInt(value, 10))}
                className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-white text-lg font-bold rounded-lg transition-colors shadow-lg shadow-brand-primary/20"
            >
                Confirm
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Recall Order Modal ---
interface HeldOrdersModalProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onClose: () => void;
}

const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({ orders, onSelectOrder, onClose }) => {
    // Filter for orders that are NOT paid (Pending) and NOT cancelled
    const heldOrders = orders.filter(o => o.paymentStatus === PaymentStatus.PENDING && o.status !== OrderStatus.CANCELLED);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl border border-dark-border flex flex-col h-[80vh] animate-in fade-in zoom-in duration-200">
                <div className="p-4 bg-dark-bg border-b border-dark-border flex justify-between items-center rounded-t-xl">
                    <h3 className="text-xl font-bold text-light-text">Recall Held Order</h3>
                    <button onClick={onClose} className="p-2 hover:bg-dark-border rounded-full text-medium-text hover:text-light-text transition-colors">
                        <Icon className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                    {heldOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-medium-text">
                            <Icon className="w-12 h-12 mb-4 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>
                            <p>No held orders found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {heldOrders.map(order => (
                                <button
                                    key={order.id}
                                    onClick={() => onSelectOrder(order)}
                                    className="bg-dark-bg p-4 rounded-lg border border-dark-border hover:border-brand-primary hover:shadow-lg transition-all text-left flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-2 w-full">
                                        <span className="font-bold text-brand-primary">#{order.orderNumber}</span>
                                        <span className="text-xs bg-dark-card px-2 py-1 rounded text-medium-text">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                                            order.dispatchType === DispatchType.DINE_IN ? 'bg-blue-900/30 text-blue-400' :
                                            order.dispatchType === DispatchType.TAKE_OUT ? 'bg-yellow-900/30 text-yellow-400' :
                                            order.dispatchType === DispatchType.DELIVERY ? 'bg-purple-900/30 text-purple-400' :
                                            'bg-green-900/30 text-green-400'
                                        }`}>
                                            {order.dispatchType}
                                        </span>
                                        {order.tableNumber && <span className="ml-2 text-sm text-light-text">Table: {order.tableNumber}</span>}
                                        {order.customerName && <span className="ml-2 text-sm text-light-text">{order.customerName}</span>}
                                    </div>
                                    <div className="text-sm text-medium-text truncate mb-3">
                                        {order.items.length} items: {order.items.map(i => i.name).join(', ')}
                                    </div>
                                    <div className="mt-auto pt-2 border-t border-dark-border w-full flex justify-between items-center">
                                        <span className="text-xs text-medium-text">Total</span>
                                        <span className="font-bold text-light-text">${order.total.toFixed(2)}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main PointOfSale Component ---

interface OrderDetails {
  tableNumber?: number;
  numberOfGuests?: number;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: DeliveryAddress;
}

interface PointOfSaleProps {
  menu: MenuItem[];
  customers?: Customer[];
  orders: Order[];
  onPlaceOrder: (items: OrderItem[], dispatchType: DispatchType, discount: number, details: OrderDetails, paymentStatus: PaymentStatus, existingOrderId?: string, sendToKitchen?: boolean) => void;
  appConfig: AppConfig;
  currentUser: StaffMember | null;
  onLogAuditTrail: (action: string, details: string, severity?: 'low' | 'medium' | 'high') => void;
  initialOrderId?: string;
  onClearInitialOrderId?: () => void;
}

export const PointOfSale: React.FC<PointOfSaleProps> = ({ menu, customers = [], orders, onPlaceOrder, appConfig, currentUser, onLogAuditTrail, initialOrderId, onClearInitialOrderId }) => {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | undefined>(undefined);
  const [activeSeat, setActiveSeat] = useState<number>(1);
  
  const [selectedDispatchType, setSelectedDispatchType] = useState<DispatchType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [discount, setDiscount] = useState(0);
  
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [pendingDispatchType, setPendingDispatchType] = useState<DispatchType | null>(null);
  const [currentOrderDetails, setCurrentOrderDetails] = useState<OrderDetails>({});

  const [itemToEditQuantity, setItemToEditQuantity] = useState<{ index: number, item: OrderItem } | null>(null);
  const [itemToAnnotate, setItemToAnnotate] = useState<{ index: number, note: string } | null>(null);

  const handleRecallOrder = useCallback((order: Order) => {
      setCurrentOrder(order.items);
      setSelectedDispatchType(order.dispatchType);
      setCurrentOrderDetails({
          tableNumber: order.tableNumber,
          numberOfGuests: order.numberOfGuests,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          deliveryAddress: order.deliveryAddress
      });
      setDiscount(order.discountAmount || 0);
      setActiveOrderId(order.id);
      setIsRecallModalOpen(false);
  }, []);

  // Effect to handle initial order load (Add Items to Existing)
  useEffect(() => {
    if (initialOrderId) {
        const order = orders.find(o => o.id === initialOrderId);
        if (order) {
            handleRecallOrder(order);
            onClearInitialOrderId?.();
        }
    }
  }, [initialOrderId, orders, handleRecallOrder, onClearInitialOrderId]);

  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        const currentTime = Date.now();
        if (currentTime - lastKeyTime > 100) {
            barcodeBuffer = '';
        }
        lastKeyTime = currentTime;

        if (e.key === 'Enter') {
            if (barcodeBuffer.length > 0) {
                handleBarcodeScan(barcodeBuffer);
                barcodeBuffer = '';
            }
        } else if (e.key.length === 1) {
            barcodeBuffer += e.key;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menu, currentOrder, activeSeat]);

  const handleBarcodeScan = (barcode: string) => {
    const item = menu.find(i => i.barcode === barcode);
    if (item) {
        if (item.modifierGroups && item.modifierGroups.length > 0) {
            setEditingItem(item);
        } else {
             if (item.stock !== undefined) {
                 const currentQty = currentOrder.filter(i => i.id === item.id).reduce((sum, i) => sum + i.quantity, 0);
                 if (currentQty >= item.stock) return;
             }
             
             setCurrentOrder(prevOrder => {
                const existingItem = prevOrder.find(orderItem => orderItem.id === item.id && !orderItem.selectedModifiers?.length && !orderItem.notes && !orderItem.isSentToKitchen && orderItem.seatNumber === activeSeat);
                if (existingItem) {
                    return prevOrder.map(orderItem =>
                    orderItem === existingItem ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem
                    );
                }
                return [...prevOrder, { ...item, quantity: 1, seatNumber: activeSeat }];
            });
        }
    }
  };

  const categories = useMemo(() => {
    if (!selectedDispatchType) return [];
    // Only show categories that have items available for the current dispatch type
    const availableItems = menu.filter(item => !item.availableFor || item.availableFor.includes(selectedDispatchType));
    const counts: Record<string, number> = {};
    availableItems.forEach(item => {
        counts[item.category] = (counts[item.category] || 0) + 1;
    });
    
    // Sort based on priority helper
    const sortedUniqueCategories = Object.keys(counts).sort((a, b) => getCategoryPriority(a) - getCategoryPriority(b));

    return [
        { name: 'All', count: availableItems.length },
        ...sortedUniqueCategories.map(cat => ({ name: cat, count: counts[cat] }))
    ];
  }, [menu, selectedDispatchType]);
  
  const filteredMenu = useMemo(() => {
    if (!selectedDispatchType) return [];
    let items = menu.filter(item => !item.availableFor || item.availableFor.includes(selectedDispatchType));
    
    // Apply Category Filter
    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    // Apply Search Filter
    if (searchQuery.trim() !== '') {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.barcode && item.barcode.includes(searchQuery))
      );
    }
    return items;
  }, [menu, selectedDispatchType, selectedCategory, searchQuery]);

  const getItemQuantityInCart = (itemId: string) => {
    return currentOrder.filter(i => i.id === itemId).reduce((sum, i) => sum + i.quantity, 0);
  };

  const addSimpleItemToOrder = (item: MenuItem) => {
    if (item.stock !== undefined) {
        const currentQty = getItemQuantityInCart(item.id);
        if (currentQty >= item.stock) return; 
    }
    setCurrentOrder(prevOrder => {
      const existingItem = prevOrder.find(orderItem => orderItem.id === item.id && !orderItem.selectedModifiers?.length && !orderItem.notes && !orderItem.isSentToKitchen && orderItem.seatNumber === activeSeat);
      if (existingItem) {
        return prevOrder.map(orderItem =>
          orderItem === existingItem ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem
        );
      }
      return [...prevOrder, { ...item, quantity: 1, seatNumber: activeSeat }];
    });
  };
  
  const addConfiguredItemToOrder = (item: OrderItem) => {
    if (item.stock !== undefined) {
        const currentQty = getItemQuantityInCart(item.id);
        if (currentQty + item.quantity > item.stock) {
             alert(`Not enough stock. Only ${item.stock} available.`);
             return;
        }
    }
    // Ensure seat number is set
    const itemWithSeat = { ...item, seatNumber: item.seatNumber || activeSeat };
    setCurrentOrder(prevOrder => [...prevOrder, itemWithSeat]);
    setEditingItem(null);
  };

  const handleSelectItem = (item: MenuItem) => {
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setEditingItem(item);
    } else {
      addSimpleItemToOrder(item);
    }
  };

  const updateQuantity = useCallback((itemIndex: number, newQuantity: number) => {
    setCurrentOrder(prevOrder => {
      const item = prevOrder[itemIndex];
      if (item.stock !== undefined && newQuantity > item.quantity) {
          const qtyDifference = newQuantity - item.quantity;
          const currentTotalInCart = prevOrder.filter(i => i.id === item.id).reduce((sum, i) => sum + i.quantity, 0);
          if (currentTotalInCart + qtyDifference > item.stock) return prevOrder;
      }
      if (newQuantity <= 0) {
        return prevOrder.filter((_, index) => index !== itemIndex);
      }
      return prevOrder.map((item, index) => (index === itemIndex ? { ...item, quantity: newQuantity } : item));
    });
  }, []);
  
  const handleQuantityUpdate = (newQuantity: number) => {
    if (itemToEditQuantity) {
        updateQuantity(itemToEditQuantity.index, newQuantity);
        setItemToEditQuantity(null);
    }
  };

  const handleSaveNote = (note: string) => {
    if (itemToAnnotate) {
        setCurrentOrder(prevOrder => prevOrder.map((item, index) => 
            index === itemToAnnotate.index ? { ...item, notes: note } : item
        ));
        setItemToAnnotate(null);
    }
  };
  
  const calculateItemTotal = (item: OrderItem) => {
    const modifiersTotal = item.selectedModifiers?.reduce((sum, mod) => sum + mod.priceAdjustment, 0) ?? 0;
    return (item.price + modifiersTotal) * item.quantity;
  }

  const subtotal = useMemo(() => currentOrder.reduce((acc, item) => acc + calculateItemTotal(item), 0), [currentOrder]);
  const tax = subtotal * 0.08;
  const total = Math.max(0, subtotal + tax - discount);

  const handleHoldOrder = () => {
    if(currentOrder.length > 0 && selectedDispatchType) {
        onPlaceOrder(currentOrder, selectedDispatchType, discount, currentOrderDetails, PaymentStatus.PENDING, activeOrderId, false);
        handleNewOrder();
    }
  };

  const handleSaveOrderToKitchen = () => {
    if(currentOrder.length > 0 && selectedDispatchType) {
        onPlaceOrder(currentOrder, selectedDispatchType, discount, currentOrderDetails, PaymentStatus.PENDING, activeOrderId, true);
        handleNewOrder();
    }
  };

  const handlePayment = (method: PaymentMethod) => {
      setIsPaymentModalOpen(false);
      if(currentOrder.length > 0 && selectedDispatchType) {
          onPlaceOrder(currentOrder, selectedDispatchType, discount, currentOrderDetails, PaymentStatus.PAID, activeOrderId, true);
          handleNewOrder();
      }
  };

  const handleNewOrder = useCallback(() => {
    setCurrentOrder([]);
    setSelectedDispatchType(null);
    setSearchQuery('');
    setSelectedCategory('All');
    setDiscount(0);
    setCurrentOrderDetails({});
    setActiveOrderId(undefined);
    setActiveSeat(1);
  }, []);

  const handleDispatchSelect = (type: DispatchType | 'More') => {
    if (type === 'More') return;
    setPendingDispatchType(type);
    setDispatchModalOpen(true);
  };

  const handleEditDispatchDetails = () => {
    if (selectedDispatchType) {
        setPendingDispatchType(selectedDispatchType);
        setDispatchModalOpen(true);
    }
  };

  const handleDispatchDetailsConfirm = (details: OrderDetails) => {
      setCurrentOrderDetails(details);
      setSelectedDispatchType(pendingDispatchType);
      setDispatchModalOpen(false);
      setPendingDispatchType(null);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          const exactBarcodeItem = menu.find(item => item.barcode === searchQuery);
          if (exactBarcodeItem) {
             setSearchQuery('');
             if (exactBarcodeItem.modifierGroups && exactBarcodeItem.modifierGroups.length > 0) {
                 setEditingItem(exactBarcodeItem);
             } else {
                 addSimpleItemToOrder(exactBarcodeItem);
             }
          }
      }
  };

  if (!selectedDispatchType) {
     const dispatchIcons: Record<string, React.ReactNode> = {
        [DispatchType.DINE_IN]: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25V5.106c0-.612.498-1.106 1.106-1.106H15.894c.612 0 1.106.494 1.106 1.106v9.144m0-9.144a1.125 1.125 0 112.25 0v9.144m-2.25-9.144H9.75" />,
        [DispatchType.TAKE_OUT]: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
        [DispatchType.DELIVERY]: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h5.25a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 19.5v-1.5A2.25 2.25 0 014.5 15.75h1.5" />,
        [DispatchType.COLLECTION]: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
        ['More']: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in duration-300 relative overflow-hidden">
            {dispatchModalOpen && pendingDispatchType && (
                <DispatchDetailsModal 
                    dispatchType={pendingDispatchType}
                    customers={customers}
                    onConfirm={handleDispatchDetailsConfirm}
                    onCancel={() => {
                        setDispatchModalOpen(false);
                        setPendingDispatchType(null);
                    }}
                    initialDetails={currentOrderDetails}
                />
            )}
             {isRecallModalOpen && (
                <HeldOrdersModal 
                    orders={orders} 
                    onSelectOrder={handleRecallOrder} 
                    onClose={() => setIsRecallModalOpen(false)} 
                />
            )}
            <div className="mb-8 text-center relative z-10">
                <h1 className="text-6xl font-extrabold tracking-tighter mb-2 text-status-preparing">
                    {appConfig.appName}
                    <span className="inline-block w-3 h-3 bg-brand-primary rounded-full ml-1 mb-2"></span>
                </h1>
                <p className="text-lg text-medium-text tracking-widest uppercase opacity-70">Point of Sale</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 w-full max-w-5xl z-10">
              {[DispatchType.DINE_IN, DispatchType.TAKE_OUT, DispatchType.COLLECTION, DispatchType.DELIVERY, 'More'].map(type => (
                <button
                  key={type}
                  onClick={() => handleDispatchSelect(type as DispatchType | 'More')}
                  className="bg-dark-card w-32 h-32 md:w-36 md:h-36 rounded-xl flex flex-col items-center justify-center hover:bg-dark-border hover:translate-y-[-2px] hover:shadow-lg hover:shadow-brand-primary/10 border border-dark-border transition-all duration-300 group"
                >
                  <div className="bg-dark-bg p-3 rounded-full mb-3 group-hover:bg-brand-primary/10 transition-colors">
                    <Icon className="w-8 h-8 text-light-text group-hover:text-brand-primary transition-colors">
                        {dispatchIcons[type]}
                    </Icon>
                  </div>
                  <h2 className="text-sm font-bold text-light-text uppercase tracking-wide">{type}</h2>
                </button>
              ))}
            </div>
            
            <button 
                onClick={() => setIsRecallModalOpen(true)}
                className="mt-8 px-8 py-3 bg-dark-card border border-dark-border hover:border-brand-primary text-light-text rounded-full font-bold shadow-lg flex items-center gap-2 transition-all"
            >
                <Icon className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>
                Recall Order
            </button>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 p-4 h-full">
      {isPaymentModalOpen && <PaymentModal total={total} onClose={() => setIsPaymentModalOpen(false)} onPayment={handlePayment} />}
      {editingItem && (
        <ItemDetailModal 
            item={editingItem} 
            onClose={() => setEditingItem(null)} 
            onAddToCart={addConfiguredItemToOrder} 
            userRole={currentUser?.role}
            onLogAction={onLogAuditTrail}
            initialSeat={activeSeat}
        />
      )}
      {itemToEditQuantity && (
          <QuantityControlModal 
            item={itemToEditQuantity.item}
            initialQuantity={itemToEditQuantity.item.quantity}
            onSave={handleQuantityUpdate}
            onClose={() => setItemToEditQuantity(null)}
          />
      )}
      {itemToAnnotate && (
          <NoteModal 
            initialNote={itemToAnnotate.note}
            onSave={handleSaveNote}
            onClose={() => setItemToAnnotate(null)}
          />
      )}
      {isRecallModalOpen && (
          <HeldOrdersModal 
            orders={orders} 
            onSelectOrder={handleRecallOrder} 
            onClose={() => setIsRecallModalOpen(false)} 
        />
      )}
      {dispatchModalOpen && pendingDispatchType && (
          <DispatchDetailsModal 
              dispatchType={pendingDispatchType}
              customers={customers}
              onConfirm={handleDispatchDetailsConfirm}
              onCancel={() => {
                  setDispatchModalOpen(false);
                  setPendingDispatchType(null);
              }}
              initialDetails={currentOrderDetails}
          />
      )}

      {/* Categories Sidebar */}
      <div className="col-span-12 lg:col-span-2 flex flex-col h-auto lg:h-full">
         <div 
           className="bg-dark-card rounded-xl h-full overflow-x-auto lg:overflow-y-auto p-3 flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-3 border border-dark-border [&::-webkit-scrollbar]:hidden shadow-inner" 
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
         >
             <h3 className="hidden lg:block text-[10px] font-extrabold text-medium-text px-2 py-1 uppercase tracking-[0.2em] mb-1 opacity-60">Menu Sections</h3>
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-between gap-3 group relative overflow-hidden ${
                  selectedCategory === category.name
                    ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-[1.02]'
                    : 'bg-dark-bg/50 text-medium-text hover:bg-dark-border/80 hover:text-light-text border border-transparent hover:border-dark-border'
                }`}
              >
                <div className="flex items-center gap-2.5 relative z-10">
                    <span className="text-xl filter drop-shadow-sm">{CATEGORY_ICONS[category.name] || '🍴'}</span>
                    <span className="truncate">{category.name}</span>
                </div>
                 <span className={`text-[10px] font-black px-2 py-1 rounded-lg relative z-10 transition-colors ${
                    selectedCategory === category.name 
                    ? 'bg-white/20 text-white' 
                    : 'bg-dark-card text-medium-text group-hover:bg-dark-bg group-hover:text-brand-primary'
                }`}>
                    {category.count}
                </span>
                {selectedCategory === category.name && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                )}
              </button>
            ))}
          </div>
      </div>

      {/* Menu Section */}
      <div className="col-span-12 lg:col-span-6 flex flex-col h-full">
        <div className="mb-4 flex gap-3">
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder={`Search in ${selectedCategory === 'All' ? 'Menu' : selectedCategory}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full bg-dark-card border border-dark-border rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary text-light-text placeholder-medium-text/50 shadow-lg text-sm transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="w-5 h-5 text-medium-text/50">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </Icon>
                </div>
            </div>
            
            {/* Seat Selector UI for Dine-In */}
            {selectedDispatchType === DispatchType.DINE_IN && (
                <div className="bg-dark-card border border-dark-border rounded-xl flex p-1 h-[50px] items-center shadow-lg">
                    <span className="text-[10px] font-black text-medium-text px-3 uppercase tracking-widest border-r border-dark-border mr-1">Person</span>
                    <div className="flex gap-1.5 px-1 overflow-x-auto max-w-[220px] scrollbar-hide">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <button
                                key={s}
                                onClick={() => setActiveSeat(s)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                                    activeSeat === s ? 'bg-brand-primary text-white scale-110 shadow-lg shadow-brand-primary/30' : 'bg-dark-bg text-medium-text hover:bg-dark-border'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 rounded-xl custom-scrollbar">
            {filteredMenu.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {filteredMenu.map(item => (
                    <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        onSelect={handleSelectItem}
                        onCustomize={setEditingItem}
                    />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-medium-text text-center bg-dark-card/30 rounded-2xl border-2 border-dark-border border-dashed p-12 transition-all">
                    <div className="bg-dark-card p-6 rounded-full mb-4 shadow-xl border border-dark-border">
                        <Icon className="w-12 h-12 text-dark-border">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </Icon>
                    </div>
                    <h3 className="text-xl font-bold text-light-text mb-1">No items found</h3>
                    <p className="text-sm opacity-60">Try adjusting your filters or search query</p>
                    <button 
                        onClick={() => {setSelectedCategory('All'); setSearchQuery('');}}
                        className="mt-6 text-brand-primary font-bold hover:underline text-sm"
                    >
                        Reset all filters
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Order Ticket Section */}
      <div className="col-span-12 lg:col-span-4 bg-dark-card rounded-xl flex flex-col h-full shadow-2xl border border-dark-border overflow-hidden">
        <div className="p-4 border-b border-dark-border bg-dark-bg/20">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                    {activeOrderId ? `UPDATING #${orders.find(o=>o.id===activeOrderId)?.orderNumber}` : 'ACTIVE TICKET'}
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => setIsRecallModalOpen(true)} className="text-[10px] font-black bg-dark-bg hover:bg-dark-border text-light-text border border-dark-border px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider">Recall</button>
                    <button onClick={handleNewOrder} className="text-[10px] font-black bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider">Clear</button>
                 </div>
            </div>
            <div className="bg-brand-primary/10 border border-brand-primary/20 p-3 rounded-xl flex flex-col gap-1.5 relative group">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-brand-primary font-black uppercase tracking-[0.1em]">{selectedDispatchType}</span>
                    <button 
                        onClick={handleEditDispatchDetails}
                        className="p-1 hover:bg-brand-primary/20 rounded-md transition-colors"
                        title="Edit Details"
                    >
                        <Icon className="w-3.5 h-3.5 text-brand-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </Icon>
                    </button>
                </div>
                <div className="text-[11px] text-light-text/70 leading-relaxed font-medium">
                    {selectedDispatchType === DispatchType.DINE_IN && currentOrderDetails.tableNumber && (
                        <span>Table: <strong className="text-light-text">{currentOrderDetails.tableNumber}</strong> | Guests: <strong className="text-light-text">{currentOrderDetails.numberOfGuests || 1}</strong></span>
                    )}
                    {(selectedDispatchType === DispatchType.TAKE_OUT || selectedDispatchType === DispatchType.COLLECTION) && currentOrderDetails.customerName && (
                        <span>Customer: <strong className="text-light-text">{currentOrderDetails.customerName}</strong></span>
                    )}
                    {selectedDispatchType === DispatchType.DELIVERY && currentOrderDetails.deliveryAddress && (
                        <span className="truncate block">Address: <strong className="text-light-text">{currentOrderDetails.deliveryAddress.line1}</strong></span>
                    )}
                </div>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 bg-dark-bg/40 custom-scrollbar">
            {currentOrder.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-medium-text/30">
                    <Icon className="w-16 h-16 mb-4 opacity-10"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></Icon>
                    <p className="font-black text-xs uppercase tracking-widest">Cart is empty</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {currentOrder.map((item, index) => (
                        <li key={`${item.id}-${index}`} className={`flex flex-col bg-dark-card p-3 rounded-xl border shadow-lg transition-all ${item.isSentToKitchen ? 'border-l-4 border-l-status-ready border-dark-border opacity-70' : 'border-dark-border'}`}>
                             <div className="flex justify-between items-start mb-2">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-light-text text-sm">{item.name}</p>
                                        {item.seatNumber && (
                                            <span className="text-[9px] bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded-md font-black">PERSON {item.seatNumber}</span>
                                        )}
                                        {item.isSentToKitchen && (
                                            <span className="text-[8px] bg-status-ready/20 text-status-ready px-1.5 py-0.5 rounded-md flex items-center gap-1 font-black uppercase">
                                                <div className="w-1 h-1 rounded-full bg-status-ready"></div> Sent
                                            </span>
                                        )}
                                    </div>
                                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                        <ul className="text-[10px] text-medium-text mt-1 space-y-0.5 border-l border-dark-border ml-1 pl-2">
                                            {item.selectedModifiers.map(mod => (
                                                <li key={mod.id} className="flex justify-between">
                                                    <span>{mod.name}</span>
                                                    {mod.priceAdjustment > 0 && <span className="font-mono text-[9px]">+${mod.priceAdjustment.toFixed(2)}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {item.notes && <p className="text-[10px] text-orange-400 font-medium italic mt-1 bg-orange-900/10 px-2 py-0.5 rounded">Note: {item.notes}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-light-text ml-2 text-sm font-mono">${(calculateItemTotal(item)).toFixed(2)}</p>
                                </div>
                             </div>
                             
                             <div className="flex justify-between items-center pt-2 border-t border-dark-border/30">
                                <div className="flex items-center bg-dark-bg rounded-xl p-0.5 border border-dark-border shadow-inner">
                                    <button 
                                        onClick={() => !item.isSentToKitchen && updateQuantity(index, item.quantity - 1)} 
                                        disabled={!!item.isSentToKitchen}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all text-lg font-bold ${item.isSentToKitchen ? 'text-medium-text opacity-20 cursor-not-allowed' : 'hover:bg-dark-border text-brand-primary hover:text-light-text active:scale-90'}`}
                                    >
                                        -
                                    </button>
                                    <button className="font-mono font-black w-10 text-center text-xs bg-transparent text-light-text" onClick={() => !item.isSentToKitchen && setItemToEditQuantity({ index, item })} disabled={!!item.isSentToKitchen}>
                                        {item.quantity}
                                    </button>
                                    <button 
                                        onClick={() => !item.isSentToKitchen && updateQuantity(index, item.quantity + 1)}
                                        disabled={!!item.isSentToKitchen} 
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all text-lg font-bold ${item.isSentToKitchen ? 'text-medium-text opacity-20 cursor-not-allowed' : 'hover:bg-dark-border text-brand-primary hover:text-light-text active:scale-90'}`}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="flex gap-1.5">
                                    <button 
                                        onClick={() => !item.isSentToKitchen && setItemToAnnotate({ index, note: item.notes || '' })} 
                                        className={`p-2 rounded-lg hover:bg-dark-border transition-all ${item.notes ? 'text-orange-400 bg-orange-400/10' : 'text-medium-text'} ${item.isSentToKitchen ? 'opacity-20 cursor-not-allowed' : 'active:scale-90'}`} 
                                        disabled={!!item.isSentToKitchen}
                                    >
                                        <Icon className="w-4.5 h-4.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></Icon>
                                    </button>
                                    <button 
                                        onClick={() => !item.isSentToKitchen && updateQuantity(index, 0)} 
                                        className={`p-2 rounded-lg hover:bg-red-900/30 text-medium-text hover:text-red-400 transition-all ${item.isSentToKitchen ? 'opacity-20 cursor-not-allowed' : 'active:scale-90'}`} 
                                        disabled={!!item.isSentToKitchen}
                                    >
                                        <Icon className="w-4.5 h-4.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></Icon>
                                    </button>
                                </div>
                             </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        
        <div className="p-4 border-t border-dark-border bg-dark-card shadow-[0_-8px_25px_rgba(0,0,0,0.4)] z-10">
             {currentOrder.length > 0 && (
                <div className="space-y-1.5 mb-4 text-sm font-medium">
                    <div className="flex justify-between text-medium-text/80 text-xs font-bold uppercase tracking-wider"><span>Subtotal</span><span className="font-mono text-light-text">{appConfig.currencySymbol}{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-medium-text/80 text-xs font-bold uppercase tracking-wider"><span>Vat (8%)</span><span className="font-mono text-light-text">{appConfig.currencySymbol}{tax.toFixed(2)}</span></div>
                     <div className="flex justify-between items-center py-1">
                        <label htmlFor="discount-input" className="text-brand-primary cursor-pointer hover:underline text-[10px] uppercase font-black tracking-[0.2em]">Add Discount</label>
                        <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-medium-text/50 font-bold">{appConfig.currencySymbol}</span>
                            <input id="discount-input" type="number" value={discount > 0 ? discount : ''} onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))} className="w-20 bg-dark-bg border border-dark-border rounded-lg py-1 pl-5 pr-2 text-right text-xs font-mono font-bold focus:ring-1 focus:ring-brand-primary outline-none" placeholder="0.00" />
                        </div>
                    </div>
                    <div className="flex justify-between font-black text-2xl text-light-text pt-3 border-t border-dark-border/50 mt-2"><span>TOTAL</span><span className="font-mono text-brand-primary">{appConfig.currencySymbol}{total.toFixed(2)}</span></div>
                </div>
             )}
             <div className="grid grid-cols-3 gap-2">
                 <button 
                    onClick={handleHoldOrder} 
                    disabled={currentOrder.length === 0} 
                    className={`font-black py-4 rounded-xl transition-all shadow-lg flex justify-center items-center px-2 border uppercase tracking-[0.1em] text-[10px] ${currentOrder.length === 0 ? 'bg-dark-border text-medium-text cursor-not-allowed opacity-30' : 'bg-dark-bg hover:bg-dark-border border-dark-border text-light-text transform hover:scale-[1.02] active:scale-95'}`}
                 >
                    Hold
                 </button>
                 <button 
                    onClick={handleSaveOrderToKitchen} 
                    disabled={currentOrder.length === 0} 
                    className={`font-black py-4 rounded-xl transition-all shadow-xl flex justify-center items-center px-2 border uppercase tracking-[0.1em] text-[10px] ${currentOrder.length === 0 ? 'bg-dark-border text-medium-text cursor-not-allowed opacity-30' : 'bg-status-preparing hover:bg-orange-600 border-orange-500 text-white transform hover:scale-[1.02] active:scale-95'}`}
                 >
                    To Kitchen
                 </button>
                <button 
                    onClick={() => setIsPaymentModalOpen(true)} 
                    disabled={currentOrder.length === 0} 
                    className={`font-black py-4 rounded-xl transition-all shadow-2xl flex justify-between items-center px-3 uppercase tracking-[0.1em] ${currentOrder.length === 0 ? 'bg-dark-border text-medium-text cursor-not-allowed opacity-30' : 'bg-gradient-to-r from-brand-secondary to-brand-primary hover:from-brand-primary hover:to-teal-400 text-white transform hover:scale-[1.02] active:scale-95'}`}
                >
                    <span className="text-[10px]">Pay</span>
                    <span className="text-[10px] font-mono">{appConfig.currencySymbol}{total.toFixed(2)}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
