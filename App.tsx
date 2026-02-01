
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/Dashboard';
import { PointOfSale } from './components/pos/PointOfSale';
import { KitchenDisplay } from './components/kds/KitchenDisplay';
import { OrdersView } from './components/orders/OrdersView';
import { StaffView } from './components/staff/StaffView';
import { ReportsView } from './components/reports/ReportsView';
import { PlaceholderView } from './components/PlaceholderView';
import { Login } from './components/auth/Login';
import { BillsView } from './components/bills/BillsView';
import { Toast } from './components/shared/Toast';
import { ViewType, Order, MenuItem, OrderStatus, DispatchType, OrderItem, StaffMember, AppConfig, PaymentStatus, Notification, AuditLogEntry } from './types';

const MOCK_MENU: MenuItem[] = [
    // Starters
    { id: '10', name: 'Garlic Bread with Cheese', price: 4.99, category: 'Starters', imageUrl: '', stock: 50, barcode: '2001', allergens: ['Dairy', 'Gluten'] },
    { id: '11', name: 'Bruschetta Pomodoro', price: 6.50, category: 'Starters', imageUrl: '', stock: 30, barcode: '2002', allergens: ['Gluten'] },
    { id: '12', name: 'Chicken Wings (Hot)', price: 8.99, category: 'Starters', imageUrl: '', stock: 40, barcode: '2003' },
    
    // Mains - Pizza
    { id: '1', name: 'Margherita Pizza', price: 12.99, category: 'Pizza', imageUrl: '', stock: 20, barcode: '1001', allergens: ['Dairy', 'Gluten'] },
    { id: '2', name: 'Pepperoni Pizza', price: 14.99, category: 'Pizza', imageUrl: '', stock: 15, barcode: '1002', allergens: ['Dairy', 'Gluten'] },
    
    // Mains - Burgers
    { id: '3', name: 'Classic Cheeseburger', price: 9.99, category: 'Burgers', imageUrl: '', stock: 50, barcode: '1003', allergens: ['Dairy', 'Gluten', 'Mustard'] },
    
    // Mains - Pasta
    { id: '20', name: 'Spaghetti Carbonara', price: 13.50, category: 'Pasta', imageUrl: '', stock: 25, barcode: '3001', allergens: ['Eggs', 'Dairy', 'Gluten'] },
    { id: '21', name: 'Penne Arrabbiata', price: 11.99, category: 'Pasta', imageUrl: '', stock: 30, barcode: '3002', allergens: ['Gluten'] },
    
    // Sides
    { id: '30', name: 'French Fries', price: 3.50, category: 'Sides', imageUrl: '', stock: 100, barcode: '4001' },
    { id: '31', name: 'Sweet Potato Fries', price: 4.50, category: 'Sides', imageUrl: '', stock: 60, barcode: '4002' },
    { id: '32', name: 'Onion Rings', price: 3.99, category: 'Sides', imageUrl: '', stock: 80, barcode: '4003', allergens: ['Gluten'] },
    
    // Others
    { id: '4', name: 'Caesar Salad', price: 8.99, category: 'Salads', imageUrl: '', stock: 12, barcode: '1004', allergens: ['Dairy', 'Fish', 'Eggs'] },
    { id: '5', name: 'Iced Tea', price: 2.50, category: 'Drinks', imageUrl: '', stock: 200, barcode: '1005' },
    { id: '40', name: 'Chocolate Lava Cake', price: 6.99, category: 'Desserts', imageUrl: '', stock: 15, barcode: '5001', allergens: ['Dairy', 'Eggs', 'Gluten'] },
];

const MOCK_STAFF: StaffMember[] = [
    { id: 's1', name: 'Mike (Manager)', role: 'Manager', pin: '1234', status: 'Active', joinedDate: new Date() },
    { id: 's2', name: 'Sarah (Cashier)', role: 'Cashier', pin: '0000', status: 'Active', joinedDate: new Date() },
    { id: 's3', name: 'Chef Gordon', role: 'Chef', pin: '8888', status: 'Active', joinedDate: new Date() }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('pos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [user, setUser] = useState<StaffMember | null>(null);
  const [menu] = useState<MenuItem[]>(MOCK_MENU);
  const [staff] = useState<StaffMember[]>(MOCK_STAFF);
  const [appConfig] = useState<AppConfig>({ appName: 'FusionPOS', currencySymbol: '$' });

  const notify = useCallback((message: string, type: Notification['type'] = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  const logAuditAction = useCallback((action: string, details: string, severity: AuditLogEntry['severity'] = 'low') => {
    if (!user) return;
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      userId: user.id,
      userName: user.name,
      action,
      details,
      severity
    };
    setAuditLogs(prev => [entry, ...prev]);
    console.debug('[AUDIT LOG]', entry);
  }, [user]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleNavigate = useCallback((view: ViewType) => setCurrentView(view), []);

  const handleSaveOrder = useCallback((
      items: OrderItem[], 
      dispatchType: DispatchType, 
      discount: number, 
      details: any, 
      paymentStatus: PaymentStatus,
      existingOrderId?: string,
      sendToKitchen: boolean = true
  ) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax - discount;

    const itemsProcessed = items.map(i => ({ ...i, isSentToKitchen: sendToKitchen || i.isSentToKitchen }));

    if (existingOrderId) {
        setOrders(prev => prev.map(o => o.id === existingOrderId ? { ...o, items: itemsProcessed, total, paymentStatus, status: sendToKitchen ? OrderStatus.PREPARING : o.status, ...details } : o));
        notify(`Order updated successfully.`, 'success');
    } else {
        const newOrder: Order = {
            id: `ord${Date.now()}`,
            orderNumber: orders.length + 101,
            items: itemsProcessed,
            dispatchType,
            status: OrderStatus.NEW,
            paymentStatus,
            createdAt: new Date(),
            subtotal,
            tax,
            total,
            ...details
        };
        setOrders(prev => [newOrder, ...prev]);
        notify(`Order #${newOrder.orderNumber} placed.`, 'success');
    }
  }, [orders, notify]);

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    notify(`Status: ${status}`, 'info');
    logAuditAction('Status Change', `Order status updated to ${status}`, 'low');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'pos': return (
        <PointOfSale 
          menu={menu} 
          orders={orders} 
          onPlaceOrder={handleSaveOrder} 
          appConfig={appConfig} 
          currentUser={user} 
          onLogAuditTrail={logAuditAction}
        />
      );
      case 'kds': return <KitchenDisplay orders={orders} onUpdateStatus={handleUpdateStatus} />;
      case 'bills': return <BillsView orders={orders} appConfig={appConfig} />;
      case 'orders': return <OrdersView orders={orders} onUpdateStatus={handleUpdateStatus} onEditOrder={(id) => setCurrentView('pos')} />;
      case 'reports': return <ReportsView orders={orders} />;
      case 'staff': return <StaffView staffMembers={staff} onAddStaff={()=>{}} onUpdateStaff={()=>{}} onDeleteStaff={()=>{}} />;
      default: return <PlaceholderView view={currentView} />;
    }
  };

  if (!user) return <Login staffMembers={staff} onLogin={u => { setUser(u); notify(`Authenticated as ${u.name}`); }} appConfig={appConfig} />;

  return (
    <div className="flex h-screen bg-dark-bg text-light-text font-sans overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} onLogout={() => setUser(null)} appConfig={appConfig} />
      <div className="flex-1 flex flex-col ml-20 lg:ml-64 transition-all duration-300 relative">
        <Header currentView={currentView} user={user} onNavigate={handleNavigate} />
        <main className="flex-1 overflow-y-auto bg-dark-bg/20">{renderContent()}</main>
        
        {/* Production Notifications Layer */}
        <div className="fixed top-6 right-6 z-[100] pointer-events-none flex flex-col gap-3">
          {notifications.map(n => <div key={n.id} className="pointer-events-auto"><Toast notification={n} onDismiss={dismissNotification} /></div>)}
        </div>
      </div>
    </div>
  );
};

export default App;
