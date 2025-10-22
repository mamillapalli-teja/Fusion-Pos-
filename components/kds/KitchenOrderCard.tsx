import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, DispatchType } from '../../types';

interface KitchenOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
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

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, onUpdateStatus }) => {
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

  return (
    <div className={`rounded-lg shadow-lg flex flex-col h-full border-2 ${order.status === OrderStatus.PREPARING ? 'border-status-preparing' : 'border-dark-border'} bg-dark-card`}>
      <div className={`p-4 rounded-t-lg flex justify-between items-center ${getStatusColor(order.status)}`}>
        <h3 className="text-xl font-bold">#{order.orderNumber}</h3>
        <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${getDispatchTypeColor(order.dispatchType)}`}>
            {order.dispatchType} {order.tableNumber && `- T${order.tableNumber}`}
            </span>
            <span className="text-xl font-mono bg-dark-bg bg-opacity-50 px-2 rounded">{formatTime(timeElapsed)}</span>
        </div>
      </div>
      <div className="p-4 flex-grow overflow-y-auto">
        <ul className="space-y-3">
          {order.items.map((item, index) => (
            <li key={`${item.id}-${index}`} className="flex justify-between items-start border-b border-dark-border pb-2">
              <div className="flex">
                <span className="font-bold text-lg mr-3 text-brand-primary">{item.quantity}x</span>
                <div>
                  <p className="font-semibold text-light-text">{item.name}</p>
                   {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <ul className="text-sm text-medium-text pl-4 list-disc">
                        {item.selectedModifiers.map(mod => (
                            <li key={mod.id}>{mod.name}</li>
                        ))}
                    </ul>
                  )}
                  {item.notes && <p className="text-sm text-brand-primary italic mt-1">"{item.notes}"</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 border-t border-dark-border mt-auto">
        <button
          onClick={handleNextStatus}
          disabled={order.status === OrderStatus.READY}
          className={`w-full py-3 text-lg font-bold rounded-lg transition-colors ${
            order.status === OrderStatus.NEW
              ? 'bg-status-preparing hover:bg-orange-400 text-white'
              : order.status === OrderStatus.PREPARING
              ? 'bg-status-ready hover:bg-green-400 text-white'
              : 'bg-dark-border text-medium-text cursor-not-allowed'
          }`}
        >
          {order.status === OrderStatus.NEW && 'Start Preparing'}
          {order.status === OrderStatus.PREPARING && 'Mark as Ready'}
          {order.status === OrderStatus.READY && 'Ready for Collection'}
        </button>
      </div>
    </div>
  );
};