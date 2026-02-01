
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, DispatchType, PaymentStatus } from '../../types';
import { Icon } from '../shared/Icon';

interface OrdersViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onEditOrder: (orderId: string) => void;
}

type DateFilter = 'Today' | 'Yesterday' | 'Week' | 'All';

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, onUpdateStatus, onEditOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed' | 'Cancelled'>('All');
  const [dispatchFilter, setDispatchFilter] = useState<'All' | DispatchType>('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | PaymentStatus>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>('Today');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search Match
      const searchMatch = 
        order.orderNumber.toString().includes(searchQuery) ||
        (order.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (order.tableNumber?.toString() || '').includes(searchQuery);
      
      if (!searchMatch) return false;

      // Status Match
      if (statusFilter === 'Active') {
        if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) return false;
      } else if (statusFilter !== 'All' && order.status !== statusFilter) {
        return false;
      }

      // Dispatch Match
      if (dispatchFilter !== 'All' && order.dispatchType !== dispatchFilter) return false;

      // Payment Match
      if (paymentFilter !== 'All' && order.paymentStatus !== paymentFilter) return false;

      // Date Match
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      if (dateFilter === 'Today') {
        if (orderDate < today) return false;
      } else if (dateFilter === 'Yesterday') {
        if (orderDate < yesterday || orderDate >= today) return false;
      } else if (dateFilter === 'Week') {
        if (orderDate < startOfWeek) return false;
      }

      return true;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [orders, searchQuery, statusFilter, dispatchFilter, paymentFilter, dateFilter]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NEW: return 'bg-status-new/20 text-blue-400 border-status-new/50';
      case OrderStatus.PREPARING: return 'bg-status-preparing/20 text-orange-400 border-status-preparing/50';
      case OrderStatus.READY: return 'bg-status-ready/20 text-green-400 border-status-ready/50';
      case OrderStatus.COMPLETED: return 'bg-dark-border text-gray-400 border-gray-600';
      case OrderStatus.CANCELLED: return 'bg-red-900/20 text-red-400 border-red-900/50';
      default: return 'bg-gray-800 text-gray-500';
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setDispatchFilter('All');
    setPaymentFilter('All');
    setDateFilter('Today');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-black text-light-text tracking-tight">Order Management</h1>
            <p className="text-medium-text text-sm font-medium">Monitoring {filteredOrders.length} matching entries</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-grow min-w-[200px] xl:max-w-xs">
                <input
                    type="text"
                    placeholder="Search Number, Name, Table..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm text-light-text placeholder-medium-text/50 shadow-lg"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Icon className="w-4 h-4 text-medium-text/50">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </Icon>
                </div>
            </div>
            <button 
                onClick={resetFilters}
                className="px-4 py-2.5 bg-dark-card border border-dark-border hover:bg-dark-border text-medium-text hover:text-light-text rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
                Reset
            </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-dark-card/50 p-4 rounded-2xl border border-dark-border mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shadow-inner">
          {/* Status Quick Filter */}
          <div>
            <label className="block text-[10px] font-black text-medium-text mb-2 uppercase tracking-[0.2em] opacity-60">Status</label>
            <div className="flex bg-dark-bg rounded-xl p-1 border border-dark-border">
                {(['All', 'Active', 'Completed'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            statusFilter === f ? 'bg-brand-primary text-white shadow-lg' : 'text-medium-text hover:text-light-text'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
          </div>

          {/* Dispatch Dropdown */}
          <div>
            <label className="block text-[10px] font-black text-medium-text mb-2 uppercase tracking-[0.2em] opacity-60">Dispatch Type</label>
            <select 
                value={dispatchFilter}
                onChange={(e) => setDispatchFilter(e.target.value as any)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-2 text-xs font-bold text-light-text focus:ring-1 focus:ring-brand-primary outline-none appearance-none"
            >
                <option value="All">All Dispatch Types</option>
                {Object.values(DispatchType).map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
          </div>

          {/* Payment Status Dropdown */}
          <div>
            <label className="block text-[10px] font-black text-medium-text mb-2 uppercase tracking-[0.2em] opacity-60">Payment</label>
            <select 
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-2 text-xs font-bold text-light-text focus:ring-1 focus:ring-brand-primary outline-none appearance-none"
            >
                <option value="All">All Payment Status</option>
                {Object.values(PaymentStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
          </div>

          {/* Date Picker (Quick Range) */}
          <div>
            <label className="block text-[10px] font-black text-medium-text mb-2 uppercase tracking-[0.2em] opacity-60">Timeframe</label>
            <div className="flex bg-dark-bg rounded-xl p-1 border border-dark-border">
                {(['Today', 'Week', 'All'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setDateFilter(f)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            dateFilter === f ? 'bg-brand-primary text-white shadow-lg' : 'text-medium-text hover:text-light-text'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
          </div>
      </div>

      <div className="bg-dark-card rounded-2xl border border-dark-border shadow-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
            <thead className="sticky top-0 z-10 bg-dark-bg border-b border-dark-border text-medium-text text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="p-4 w-28">Order #</th>
                <th className="p-4 w-28">Time</th>
                <th className="p-4 w-40">Type</th>
                <th className="p-4 w-48">Reference</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4 w-32 text-right">Payment</th>
                <th className="p-4 w-32 text-right">Total</th>
                <th className="p-4 w-40 text-center">Status</th>
                <th className="p-4 w-44 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/30">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 font-mono font-black text-light-text">#{order.orderNumber}</td>
                  <td className="p-4 text-xs font-bold text-medium-text">{formatDate(order.createdAt)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm ${
                      order.dispatchType === DispatchType.DINE_IN ? 'bg-blue-900/40 text-blue-400 border border-blue-900/60' :
                      order.dispatchType === DispatchType.TAKE_OUT ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-900/60' :
                      order.dispatchType === DispatchType.DELIVERY ? 'bg-purple-900/40 text-purple-400 border border-purple-900/60' :
                      'bg-green-900/40 text-green-400 border border-green-900/60'
                    }`}>
                      {order.dispatchType}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-bold text-light-text truncate">
                    {order.tableNumber ? (
                        <span className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-medium-text/50"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></Icon>
                            Table {order.tableNumber}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5">
                             <Icon className="w-3.5 h-3.5 text-medium-text/50"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></Icon>
                             {order.customerName || 'Guest'}
                        </span>
                    )}
                  </td>
                  <td className="p-4 text-[11px] text-medium-text font-medium truncate italic opacity-80">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${order.paymentStatus === PaymentStatus.PAID ? 'text-status-ready' : 'text-status-preparing'}`}>
                        {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-light-text font-mono">${order.total.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                          <button
                            onClick={() => {
                                const nextStatus = order.status === OrderStatus.NEW ? OrderStatus.PREPARING 
                                    : order.status === OrderStatus.PREPARING ? OrderStatus.READY 
                                    : OrderStatus.COMPLETED;
                                onUpdateStatus(order.id, nextStatus);
                            }}
                            className="text-[10px] font-black uppercase tracking-wider bg-dark-bg border border-dark-border hover:border-brand-primary hover:text-brand-primary text-medium-text px-3 py-1.5 rounded-lg transition-all"
                          >
                            {order.status === OrderStatus.NEW ? 'Prep' : order.status === OrderStatus.PREPARING ? 'Ready' : 'Settle'}
                          </button>
                        )}
                        <button
                            onClick={() => onEditOrder(order.id)}
                            className="p-1.5 bg-brand-primary/10 border border-brand-primary/20 hover:bg-brand-primary hover:text-white text-brand-primary rounded-lg transition-all"
                            title="Edit / View Details"
                        >
                            <Icon className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></Icon>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-20 text-center text-medium-text">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                        <div className="p-6 bg-dark-border rounded-full">
                            <Icon className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></Icon>
                        </div>
                        <span className="text-xl font-black uppercase tracking-[0.2em]">No Matches Found</span>
                        <p className="max-w-xs text-xs font-bold leading-relaxed">Try adjusting your filters or search terms to find the order you are looking for.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer / Summary */}
        <div className="p-4 bg-dark-bg/50 border-t border-dark-border flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-medium-text">
            <span>Viewing {filteredOrders.length} of {orders.length} Records</span>
            <div className="flex gap-6">
                <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-status-preparing"></div>
                    Pending: {filteredOrders.filter(o => o.paymentStatus === PaymentStatus.PENDING).length}
                </span>
                <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-status-ready"></div>
                    Paid: {filteredOrders.filter(o => o.paymentStatus === PaymentStatus.PAID).length}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};
