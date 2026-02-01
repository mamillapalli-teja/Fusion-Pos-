
import React, { useMemo } from 'react';
import { Order, OrderStatus } from '../../types';
import { KitchenOrderCard } from './KitchenOrderCard';

interface KitchenDisplayProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onEditOrder?: (orderId: string) => void;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({ orders, onUpdateStatus, onEditOrder }) => {
  // Only display orders that have items marked as 'sent to kitchen' and are not completed/cancelled
  const hasSentItems = (o: Order) => o.items.some(i => i.isSentToKitchen);

  const allActiveOrders = useMemo(() => {
    return orders
      .filter(o => 
        hasSentItems(o) && 
        o.status !== OrderStatus.COMPLETED && 
        o.status !== OrderStatus.CANCELLED
      )
      .sort((a, b) => {
        // Sort by status priority first: NEW > PREPARING > READY
        const statusPriority = {
          [OrderStatus.NEW]: 0,
          [OrderStatus.PREPARING]: 1,
          [OrderStatus.READY]: 2,
          [OrderStatus.COMPLETED]: 3,
          [OrderStatus.CANCELLED]: 4
        };
        
        const priorityA = statusPriority[a.status];
        const priorityB = statusPriority[b.status];
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // Then sort by oldest first within the same status
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }, [orders]);

  return (
    <div className="p-4 h-full flex flex-col bg-dark-bg/50">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Consolidated Header */}
        <div className="flex items-center justify-between mb-6 px-4 py-3 bg-dark-card border border-dark-border rounded-2xl shadow-lg">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black uppercase tracking-[0.3em] text-brand-primary">All Orders</h2>
            <div className="h-6 w-px bg-dark-border mx-2"></div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-new animate-pulse"></span>
                <span className="text-[10px] font-black uppercase text-medium-text tracking-widest">New: {allActiveOrders.filter(o => o.status === OrderStatus.NEW).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-preparing animate-pulse"></span>
                <span className="text-[10px] font-black uppercase text-medium-text tracking-widest">Cooking: {allActiveOrders.filter(o => o.status === OrderStatus.PREPARING).length}</span>
              </div>
            </div>
          </div>
          <span className="bg-brand-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg shadow-brand-primary/20">
            TOTAL: {allActiveOrders.length}
          </span>
        </div>

        {/* Single Scrollable Grid */}
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {allActiveOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-1">
              {allActiveOrders.map(order => (
                <div key={order.id} className="h-fit">
                   <KitchenOrderCard order={order} onUpdateStatus={onUpdateStatus} onEditOrder={onEditOrder} />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-medium-text/20 p-8 border-4 border-dark-border border-dashed rounded-[3rem] transition-all">
                <div className="bg-dark-card p-10 rounded-full mb-6 shadow-2xl border border-dark-border/50">
                   <svg className="w-24 h-24 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                   </svg>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-[0.4em]">Kitchen Clear</h3>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest opacity-40">All orders have been dispatched</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
