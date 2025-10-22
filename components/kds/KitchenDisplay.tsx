
import React from 'react';
import { Order, OrderStatus } from '../../types';
import { KitchenOrderCard } from './KitchenOrderCard';

interface KitchenDisplayProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({ orders, onUpdateStatus }) => {
  const newOrders = orders.filter(o => o.status === OrderStatus.NEW).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
  const preparingOrders = orders.filter(o => o.status === OrderStatus.PREPARING).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
  const readyOrders = orders.filter(o => o.status === OrderStatus.READY).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 4);

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
        
        {/* New Orders */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-4 p-2 rounded bg-status-new text-white text-center">New ({newOrders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 overflow-y-auto pr-2">
            {newOrders.map(order => (
              <KitchenOrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} />
            ))}
          </div>
        </div>
        
        {/* Preparing Orders */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-4 p-2 rounded bg-status-preparing text-white text-center">Preparing ({preparingOrders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 overflow-y-auto pr-2">
            {preparingOrders.map(order => (
              <KitchenOrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} />
            ))}
          </div>
        </div>
        
        {/* Ready Orders */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-4 p-2 rounded bg-status-ready text-white text-center">Ready ({readyOrders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 overflow-y-auto pr-2">
            {readyOrders.map(order => (
              <KitchenOrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
