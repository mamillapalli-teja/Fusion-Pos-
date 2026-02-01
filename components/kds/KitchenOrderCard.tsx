
import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, DispatchType, OrderItem } from '../../types';
import { Icon } from '../shared/Icon';
import { getCategoryPriority, ICONS } from '../../constants';

interface KitchenOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onEditOrder?: (orderId: string) => void;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.NEW:
      return 'bg-status-new';
    case OrderStatus.PREPARING:
      return 'bg-status-preparing';
    case OrderStatus.READY:
      return 'bg-status-ready';
    default:
      return 'bg-gray-500';
  }
};

const getDispatchTypeColor = (dispatchType: DispatchType) => {
  switch (dispatchType) {
    case DispatchType.DINE_IN:
      return 'bg-blue-600';
    case DispatchType.DELIVERY:
      return 'bg-purple-600';
    case DispatchType.COLLECTION:
      return 'bg-green-600';
    case DispatchType.TAKE_OUT:
      return 'bg-yellow-600 text-dark-text';
    case DispatchType.QR_ORDER:
        return 'bg-pink-600';
    default:
      return 'bg-gray-600';
  }
};

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, onUpdateStatus, onEditOrder }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((new Date().getTime() - order.createdAt.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [order.createdAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNextStatus = () => {
    if (order.status === OrderStatus.NEW) {
      onUpdateStatus(order.id, OrderStatus.PREPARING);
    } else if (order.status === OrderStatus.PREPARING) {
      onUpdateStatus(order.id, OrderStatus.READY);
    }
  };

  const handlePrint = () => {
    const timeStr = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const itemsStr = order.items
      .filter(item => item.isSentToKitchen)
      .map(item => {
          const allergenInfo = item.allergens && item.allergens.length > 0 ? ` [ALLERGENS: ${item.allergens.join(', ')}]` : '';
          return `- ${item.quantity}x ${item.name}${item.seatNumber ? ` (P${item.seatNumber})` : ''}${allergenInfo}`;
      })
      .join('\n');
    
    const receiptText = `
--------------------------
ORDER #${order.orderNumber}
--------------------------
Type: ${order.dispatchType}
${order.tableNumber ? `Table: ${order.tableNumber}` : `Customer: ${order.customerName || 'Guest'}`}
Time: ${timeStr}
--------------------------
ITEMS:
${itemsStr}
--------------------------
    `;
    
    console.debug('%c[POS PRINTER SIMULATION]', 'color: #14b8a6; font-weight: bold;', receiptText);
    alert(`PRINTING RECEIPT #${order.orderNumber}\n${receiptText}`);
  };

  const sentItems = useMemo(() => order.items.filter(item => item.isSentToKitchen), [order.items]);
  const itemCount = sentItems.reduce((acc, item) => acc + item.quantity, 0);

  // Determine Ticket Magnitude
  const ticketSize = useMemo(() => {
    if (itemCount <= 2) return { label: 'SNACK', icon: '🍿', scale: 'lg', color: 'text-blue-400' };
    if (itemCount <= 5) return { label: 'MEAL', icon: '🍽️', scale: 'md', color: 'text-green-400' };
    return { label: 'FEAST', icon: '🔥', scale: 'sm', color: 'text-red-400' };
  }, [itemCount]);

  // CATEGORY-BASED GROUPING FOR KITCHEN (Starters First)
  const groupedItems = useMemo(() => {
    const groups: Record<string, OrderItem[]> = {};
    
    sentItems.forEach(item => {
        // Group by category to help kitchen workflow
        const groupName = item.category;
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(item);
    });

    return Object.keys(groups).sort((a, b) => {
        return getCategoryPriority(a) - getCategoryPriority(b);
    }).map(key => ({
        groupName: key,
        items: groups[key].sort((a,b) => (a.seatNumber || 0) - (b.seatNumber || 0))
    }));
  }, [sentItems]);

  return (
    <div className={`rounded-xl shadow-2xl flex flex-col h-full border-2 transition-all duration-300 ${order.status === OrderStatus.PREPARING ? 'border-status-preparing ring-2 ring-status-preparing/20' : 'border-dark-border'} bg-dark-card overflow-hidden`}>
      {/* Updated Header Layout as per Screenshot */}
      <div className={`p-2 flex justify-between items-center ${getStatusColor(order.status)}`}>
        <div className="flex items-center gap-1">
            <h3 className="text-xl font-black text-white px-2">#{order.orderNumber}</h3>
            {/* Magnitude Badge */}
            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                <span className="text-xs">{ticketSize.icon}</span>
                <span className={`text-[10px] font-black tracking-tighter ${ticketSize.color}`}>{ticketSize.label}</span>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-1 ml-2">
                {onEditOrder && (
                    <button 
                        onClick={() => onEditOrder(order.id)}
                        className="p-1.5 bg-black/20 hover:bg-black/40 rounded-lg text-white transition-colors"
                        title="Edit Order"
                    >
                        <Icon className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></Icon>
                    </button>
                )}
                <button 
                    onClick={handlePrint}
                    className="p-1.5 bg-black/20 hover:bg-black/40 rounded-lg text-white transition-colors"
                    title="Print"
                >
                    <Icon className="w-4 h-4">{ICONS.printer}</Icon>
                </button>
            </div>
        </div>
        
        <div className="flex items-center gap-2 pr-1">
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-80 text-white">
                {order.dispatchType.toUpperCase()} - {order.tableNumber ? `T${order.tableNumber}` : 'COL'}
            </span>
            <span className={`text-base font-black font-mono bg-black/30 px-2 py-0.5 rounded ${timeElapsed > 600 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {formatTime(timeElapsed)}
            </span>
        </div>
      </div>
      
      <div className={`p-4 flex-grow overflow-y-auto custom-scrollbar ${ticketSize.scale === 'sm' ? 'space-y-1' : 'space-y-4'}`}>
        {groupedItems.map((group, gIdx) => (
          <div key={group.groupName} className={gIdx > 0 ? (ticketSize.scale === 'sm' ? 'mt-2 pt-2 border-t border-dark-border/50' : 'mt-4 border-t border-dark-border pt-4') : ''}>
            <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${group.groupName === 'Starters' ? 'text-status-preparing' : 'text-brand-primary'}`}>
                    {group.groupName}
                </span>
                {group.groupName === 'Starters' && <span className="text-[8px] animate-pulse bg-status-preparing/20 text-status-preparing px-2 py-0.5 rounded font-black uppercase border border-status-preparing/30">Priority Course</span>}
            </div>
            <ul className={ticketSize.scale === 'sm' ? 'space-y-1.5' : 'space-y-4'}>
              {group.items.map((item, index) => {
                const hasAllergen = item.allergens && item.allergens.length > 0;
                return (
                    <li key={`${item.id}-${index}`} className={`flex flex-col p-2 rounded-lg transition-all animate-in fade-in slide-in-from-left-2 ${hasAllergen ? 'bg-red-500/10 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : ''}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex flex-grow">
                                <span className={`font-black mr-4 text-brand-primary min-w-[1.5rem] ${ticketSize.scale === 'sm' ? 'text-lg' : 'text-xl'}`}>{item.quantity}</span>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className={`font-black text-light-text leading-tight ${ticketSize.scale === 'sm' ? 'text-sm' : 'text-base'}`}>{item.name}</p>
                                        {item.seatNumber ? (
                                            <span className="text-[9px] bg-dark-bg border border-dark-border text-medium-text px-1.5 py-0.5 rounded-md font-black">P{item.seatNumber}</span>
                                        ) : null}
                                        {hasAllergen && (
                                            <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded animate-pulse uppercase tracking-widest shadow-lg shadow-red-500/20">Allergen Alert</span>
                                        )}
                                    </div>
                                    {hasAllergen && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {item.allergens?.map(allergy => (
                                                <span key={allergy} className="text-[8px] font-bold text-red-400 bg-red-900/20 px-1.5 rounded border border-red-900/30">Contains {allergy}</span>
                                            ))}
                                        </div>
                                    )}
                                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                        <ul className={`text-medium-text mt-2 space-y-1 border-l-2 border-dark-border pl-3 ml-1 ${ticketSize.scale === 'sm' ? 'text-[11px]' : 'text-xs'}`}>
                                            {item.selectedModifiers.map(mod => (
                                                <li key={mod.id} className="font-bold flex items-center gap-1">
                                                    <span className="w-1 h-1 rounded-full bg-brand-primary/50"></span>
                                                    {mod.name.toUpperCase()}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {item.notes && <p className={`text-status-preparing font-black italic mt-2 bg-status-preparing/10 px-3 py-1.5 rounded-lg border border-status-preparing/20 ${ticketSize.scale === 'sm' ? 'text-[11px]' : 'text-xs'}`}>Note: "{item.notes}"</p>}
                                </div>
                            </div>
                        </div>
                    </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-dark-border bg-dark-bg/30">
        <button
          onClick={handleNextStatus}
          disabled={order.status === OrderStatus.READY}
          className={`w-full py-4 font-black rounded-xl transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 ${
            ticketSize.scale === 'sm' ? 'text-xs' : 'text-sm'
          } ${
            order.status === OrderStatus.NEW
              ? 'bg-gradient-to-r from-orange-500 to-status-preparing hover:scale-[1.02] active:scale-95 text-white'
              : order.status === OrderStatus.PREPARING
              ? 'bg-gradient-to-r from-green-500 to-status-ready hover:scale-[1.02] active:scale-95 text-white'
              : 'bg-dark-border text-medium-text cursor-not-allowed opacity-50'
          }`}
        >
          {order.status === OrderStatus.NEW && (
              <>
                  <Icon className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></Icon>
                  ACCEPT & PREPARE
              </>
          )}
          {order.status === OrderStatus.PREPARING && (
              <>
                  <Icon className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>
                  MARK AS READY
              </>
          )}
          {order.status === OrderStatus.READY && 'COMPLETED'}
        </button>
      </div>
    </div>
  );
};
