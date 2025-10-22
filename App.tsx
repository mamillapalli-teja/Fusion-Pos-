import React, { useState, useCallback, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/Dashboard';
import { PointOfSale } from './components/pos/PointOfSale';
import { KitchenDisplay } from './components/kds/KitchenDisplay';
import { PlaceholderView } from './components/PlaceholderView';
import { ViewType, Order, MenuItem, OrderStatus, DispatchType, OrderItem, ModifierGroup } from './types';

// Mock Data
const MOCK_MODIFIERS: { [key: string]: ModifierGroup } = {
  pizzaSizes: {
    id: 'mg1',
    name: 'Size',
    selectionType: 'single',
    modifiers: [
      { id: 'm1', name: 'Medium', priceAdjustment: 0 },
      { id: 'm2', name: 'Large', priceAdjustment: 3.00 },
      { id: 'm3', name: 'Extra Large', priceAdjustment: 5.00 },
    ],
  },
  pizzaToppings: {
    id: 'mg2',
    name: 'Toppings',
    selectionType: 'multiple',
    modifiers: [
      { id: 'm4', name: 'Extra Cheese', priceAdjustment: 1.50 },
      { id: 'm5', name: 'Mushrooms', priceAdjustment: 0.75 },
      { id: 'm6', name: 'Olives', priceAdjustment: 0.75 },
      { id: 'm7', name: 'Onions', priceAdjustment: 0.50 },
    ],
  },
  burgerAddons: {
    id: 'mg3',
    name: 'Add-ons',
    selectionType: 'multiple',
    modifiers: [
        { id: 'm8', name: 'Bacon', priceAdjustment: 2.00 },
        { id: 'm9', name: 'Avocado', priceAdjustment: 1.50 },
        { id: 'm10', name: 'Fried Egg', priceAdjustment: 1.25 },
    ]
  }
};


const MOCK_MENU: MenuItem[] = [
    { id: '1', name: 'Margherita Pizza', price: 12.99, category: 'Pizza', imageUrl: 'https://picsum.photos/id/102/400/300', modifierGroups: [MOCK_MODIFIERS.pizzaSizes, MOCK_MODIFIERS.pizzaToppings] },
    { id: '2', name: 'Pepperoni Pizza', price: 14.99, category: 'Pizza', imageUrl: 'https://picsum.photos/id/103/400/300', modifierGroups: [MOCK_MODIFIERS.pizzaSizes, MOCK_MODIFIERS.pizzaToppings] },
    { id: '3', name: 'Cheeseburger', price: 9.99, category: 'Burgers', imageUrl: 'https://picsum.photos/id/104/400/300', modifierGroups: [MOCK_MODIFIERS.burgerAddons] },
    { id: '4', name: 'Caesar Salad', price: 8.99, category: 'Salads', imageUrl: 'https://picsum.photos/id/106/400/300', availableFor: [DispatchType.DINE_IN, DispatchType.TAKE_OUT, DispatchType.COLLECTION] },
    { id: '5', name: 'Spaghetti Carbonara', price: 13.50, category: 'Pasta', imageUrl: 'https://picsum.photos/id/108/400/300', availableFor: [DispatchType.DINE_IN] },
    { id: '6', name: 'Fries', price: 3.99, category: 'Sides', imageUrl: 'https://picsum.photos/id/111/400/300' },
    { id: '7', name: 'Coca-Cola', price: 2.50, category: 'Drinks', imageUrl: 'https://picsum.photos/id/112/400/300' },
    { id: '8', name: 'Veggie Burger', price: 10.99, category: 'Burgers', imageUrl: 'https://picsum.photos/id/113/400/300', modifierGroups: [MOCK_MODIFIERS.burgerAddons] },
    { id: '9', name: 'Greek Salad', price: 9.50, category: 'Salads', imageUrl: 'https://picsum.photos/id/115/400/300' },
    { id: '10', name: 'Iced Tea', price: 2.50, category: 'Drinks', imageUrl: 'https://picsum.photos/id/116/400/300', availableFor: [DispatchType.DINE_IN] },
];

const MOCK_INITIAL_ORDERS: Order[] = [
    { id: 'ord1', orderNumber: 101, items: [{...MOCK_MENU[2], quantity: 1, selectedModifiers: [MOCK_MODIFIERS.pizzaSizes.modifiers[1], MOCK_MODIFIERS.pizzaToppings.modifiers[0]], notes: "Extra crispy crust"}, {...MOCK_MENU[5], quantity: 2}], dispatchType: DispatchType.DINE_IN, status: OrderStatus.NEW, createdAt: new Date(Date.now() - 120000), tableNumber: 5, subtotal: 33.99, tax: 2.72, total: 36.71 },
    { id: 'ord2', orderNumber: 102, items: [{...MOCK_MENU[0], quantity: 2}], dispatchType: DispatchType.COLLECTION, status: OrderStatus.PREPARING, createdAt: new Date(Date.now() - 300000), customerName: 'Alice', subtotal: 25.98, tax: 2.08, total: 28.06 },
    { id: 'ord3', orderNumber: 103, items: [{...MOCK_MENU[3], quantity: 1}], dispatchType: DispatchType.DELIVERY, status: OrderStatus.READY, createdAt: new Date(Date.now() - 600000), customerName: 'Bob', subtotal: 8.99, tax: 0.72, total: 9.71 },
    { id: 'ord4', orderNumber: 104, items: [{...MOCK_MENU[6], quantity: 4}], dispatchType: DispatchType.QR_ORDER, status: OrderStatus.COMPLETED, createdAt: new Date(Date.now() - 900000), tableNumber: 12, subtotal: 10.00, tax: 0.80, total: 10.80 },
    { id: 'ord5', orderNumber: 105, items: [{...MOCK_MENU[1], quantity: 1}, {...MOCK_MENU[4], quantity:1}], dispatchType: DispatchType.TAKE_OUT, status: OrderStatus.NEW, createdAt: new Date(Date.now() - 60000), subtotal: 28.49, tax: 2.28, total: 30.77 },
];


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [orders, setOrders] = useState<Order[]>(MOCK_INITIAL_ORDERS);
  const menu = useMemo(() => MOCK_MENU, []);

  const handleNavigate = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  const handleUpdateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order => (order.id === orderId ? { ...order, status } : order))
    );
  }, []);
  
  const handlePlaceOrder = useCallback((items: OrderItem[], dispatchType: DispatchType) => {
    const calculateItemTotal = (item: OrderItem) => {
        const modifiersTotal = item.selectedModifiers?.reduce((sum, mod) => sum + mod.priceAdjustment, 0) ?? 0;
        return (item.price + modifiersTotal) * item.quantity;
    }
    const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const newOrder: Order = {
        id: `ord${Date.now()}`,
        orderNumber: Math.max(...orders.map(o => o.orderNumber), 0) + 1,
        items,
        dispatchType,
        status: OrderStatus.NEW,
        createdAt: new Date(),
        subtotal,
        tax,
        total,
        ...(dispatchType === DispatchType.DINE_IN && { tableNumber: Math.floor(Math.random() * 20) + 1 }),
        ...(dispatchType === DispatchType.COLLECTION && { customerName: 'New Customer' }),
    };
    setOrders(prev => [newOrder, ...prev]);
  }, [orders]);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard orders={orders} />;
      case 'pos':
        return <PointOfSale menu={menu} onPlaceOrder={handlePlaceOrder} />;
      case 'kds':
        return <KitchenDisplay orders={orders} onUpdateStatus={handleUpdateOrderStatus} />;
      case 'orders':
      case 'inventory':
      case 'reports':
      case 'staff':
      case 'settings':
         return <PlaceholderView view={currentView} />;
      default:
        return <Dashboard orders={orders} />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-light-text font-sans">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col ml-20 lg:ml-64">
        <Header currentView={currentView} />
        <main className="flex-1 overflow-y-auto">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;