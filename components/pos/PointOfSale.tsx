import React, { useState, useMemo, useCallback } from 'react';
import { OrderItem, MenuItem, DispatchType, PaymentMethod } from '../../types';
import { MenuItemCard } from './MenuItemCard';
import { PaymentModal } from './PaymentModal';
import { Icon } from '../shared/Icon';

interface PointOfSaleProps {
  menu: MenuItem[];
  onPlaceOrder: (items: OrderItem[], dispatchType: DispatchType) => void;
}

export const PointOfSale: React.FC<PointOfSaleProps> = ({ menu, onPlaceOrder }) => {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedDispatchType, setSelectedDispatchType] = useState<DispatchType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const categories = useMemo(() => {
    if (!selectedDispatchType) return [];
    const filteredByDispatch = menu.filter(item => !item.availableFor || item.availableFor.includes(selectedDispatchType));
    return ['All', ...new Set(filteredByDispatch.map(item => item.category))];
  }, [menu, selectedDispatchType]);
  
  const filteredMenu = useMemo(() => {
    if (!selectedDispatchType) return [];
    
    let items = menu.filter(item => !item.availableFor || item.availableFor.includes(selectedDispatchType));

    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [menu, selectedDispatchType, selectedCategory, searchQuery]);

  const addToOrder = useCallback((item: MenuItem) => {
    setCurrentOrder(prevOrder => {
      const existingItem = prevOrder.find(orderItem => orderItem.id === item.id);
      if (existingItem) {
        return prevOrder.map(orderItem =>
          orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem
        );
      }
      return [...prevOrder, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    setCurrentOrder(prevOrder => {
      if (newQuantity <= 0) {
        return prevOrder.filter(item => item.id !== itemId);
      }
      return prevOrder.map(item => (item.id === itemId ? { ...item, quantity: newQuantity } : item));
    });
  }, []);
  
  const subtotal = useMemo(() => currentOrder.reduce((acc, item) => acc + item.price * item.quantity, 0), [currentOrder]);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
      if(currentOrder.length > 0 && selectedDispatchType) {
          onPlaceOrder(currentOrder, selectedDispatchType);
          setCurrentOrder([]);
          setSelectedDispatchType(null);
      }
  };

  const handlePayment = (method: PaymentMethod) => {
      console.log(`Processing payment of $${total.toFixed(2)} via ${method}`);
      setIsPaymentModalOpen(false);
      handlePlaceOrder();
  };

  const handleNewOrder = useCallback(() => {
    setCurrentOrder([]);
    setSelectedDispatchType(null);
    setSearchQuery('');
    setSelectedCategory('All');
  }, []);

  if (!selectedDispatchType) {
     const dispatchIcons = {
        [DispatchType.DINE_IN]: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25V5.106c0-.612.498-1.106 1.106-1.106H15.894c.612 0 1.106.494 1.106 1.106v9.144m0-9.144a1.125 1.125 0 112.25 0v9.144m-2.25-9.144H9.75" />,
        [DispatchType.TAKE_OUT]: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
        [DispatchType.DELIVERY]: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h5.25a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 19.5v-1.5A2.25 2.25 0 014.5 15.75h1.5" />,
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <Icon className="w-24 h-24 text-brand-primary mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5c0-.966-.379-1.858-.99-2.524l-2.02-2.02a2.934 2.934 0 010-4.15l2.02-2.02a2.828 2.828 0 012.523-.99H21M3 13.5h9M3 7.5h9" />
            </Icon>
            <h1 className="text-4xl font-bold text-light-text mb-2">Start a New Order</h1>
            <p className="text-lg text-medium-text mb-12">How will the customer receive their order?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {[DispatchType.DINE_IN, DispatchType.TAKE_OUT, DispatchType.DELIVERY].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedDispatchType(type)}
                  className="bg-dark-card rounded-lg p-8 text-center hover:bg-dark-border hover:border-brand-primary border-2 border-transparent transition-all duration-300 group"
                  aria-label={`Start ${type} order`}
                >
                  <Icon className="w-16 h-16 mx-auto mb-4 text-brand-primary group-hover:scale-110 transition-transform">
                    {dispatchIcons[type]}
                  </Icon>
                  <h2 className="text-2xl font-semibold text-light-text">{type}</h2>
                </button>
              ))}
            </div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 p-4 h-full">
      {isPaymentModalOpen && <PaymentModal total={total} onClose={() => setIsPaymentModalOpen(false)} onPayment={handlePayment} />}

      {/* Menu Section */}
      <div className="col-span-12 lg:col-span-7 flex flex-col h-full">
        <div className="mb-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search for a product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    aria-label="Search menu items"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="w-5 h-5 text-medium-text">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </Icon>
                </div>
            </div>
        </div>
        <div className="mb-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-brand-primary text-white'
                    : 'bg-dark-card hover:bg-dark-border'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
            {filteredMenu.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredMenu.map(item => (
                    <MenuItemCard key={item.id} item={item} onSelect={addToOrder} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-medium-text text-center">
                    <Icon className="w-20 h-20 mb-4 text-dark-border">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </Icon>
                    <h3 className="text-xl font-semibold text-light-text">No Results Found</h3>
                    <p>Try adjusting your search query or category filter.</p>
                </div>
            )}
        </div>
      </div>

      {/* Order Ticket Section */}
      <div className="col-span-12 lg:col-span-5 bg-dark-card rounded-lg flex flex-col h-full shadow-lg">
        <div className="p-4 border-b border-dark-border">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Current Order</h2>
                 <button onClick={handleNewOrder} className="text-sm bg-gray-600 hover:bg-gray-500 text-light-text px-4 py-2 rounded-md transition-colors">
                    New Order
                 </button>
            </div>
            <div className="mt-3 bg-dark-bg p-2 rounded-lg">
                <p className="text-sm text-medium-text">
                    Order Type: <span className="font-bold text-brand-primary">{selectedDispatchType}</span>
                </p>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
            {currentOrder.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-medium-text">
                    <Icon className="w-16 h-16 mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></Icon>
                    <p>No items in order</p>
                    <p className="text-sm">Click on a menu item to add it.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {currentOrder.map(item => (
                        <li key={item.id} className="flex items-center space-x-3">
                            <div className="flex-grow">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-medium-text">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-2 bg-dark-bg rounded-full">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 rounded-full hover:bg-dark-border">-</button>
                                <span className="font-bold w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 rounded-full hover:bg-dark-border">+</button>
                            </div>
                            <p className="font-bold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        {currentOrder.length > 0 && (
            <div className="p-4 border-t border-dark-border mt-auto">
                <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                        <span className="text-medium-text">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-medium-text">Tax (8%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-dark-border pt-2 mt-2">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-4 rounded-lg transition-colors text-xl"
                >
                    Pay & Place Order
                </button>
            </div>
        )}
      </div>
    </div>
  );
};