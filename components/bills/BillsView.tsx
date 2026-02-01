
import React, { useState, useMemo, useEffect } from 'react';
import { Order, AppConfig, PaymentStatus } from '../../types';
import { Icon } from '../shared/Icon';
import { ICONS } from '../../constants';

interface BillsViewProps {
  orders: Order[];
  appConfig: AppConfig;
}

export const BillsView: React.FC<BillsViewProps> = ({ orders, appConfig }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [printProgress, setPrintProgress] = useState<number | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.orderNumber.toString().includes(searchQuery) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [orders, searchQuery]);

  const handlePrintAll = () => {
    setPrintProgress(0);
    const interval = setInterval(() => {
        setPrintProgress(prev => {
            if (prev !== null && prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return (prev || 0) + 5;
        });
    }, 100);

    setTimeout(() => {
        setPrintProgress(null);
        alert(`Printed ${filteredOrders.length} bills successfully.`);
    }, 2500);
  };

  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-light-text tracking-tight flex items-center gap-3">
             <Icon className="w-8 h-8 text-brand-primary">{ICONS.bills}</Icon>
             Order Bills
          </h1>
          <p className="text-medium-text mt-1">Review and dispatch customer receipts.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <input
                type="text"
                placeholder="Search Order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-card border border-dark-border rounded-xl py-2 px-4 text-sm text-light-text focus:ring-2 focus:ring-brand-primary outline-none"
            />
            <button 
                onClick={handlePrintAll}
                disabled={printProgress !== null}
                className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
                {printProgress !== null ? `Printing ${printProgress}%` : 'Print All Bills'}
            </button>
        </div>
      </div>

      {printProgress !== null && (
          <div className="w-full h-1 bg-dark-border rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-brand-primary transition-all duration-300" style={{ width: `${printProgress}%` }}></div>
          </div>
      )}

      <div className="bg-dark-card rounded-2xl border border-dark-border shadow-2xl overflow-hidden flex-grow">
        <table className="w-full text-left">
          <thead className="bg-dark-bg/50 text-medium-text text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-5">Order #</th>
              <th className="p-5">Method</th>
              <th className="p-5">Customer</th>
              <th className="p-5 text-right">Total</th>
              <th className="p-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/30">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                <td className="p-5 font-black text-light-text">#{order.orderNumber}</td>
                <td className="p-5 text-xs font-bold text-medium-text">{order.dispatchType}</td>
                <td className="p-5 text-sm text-light-text font-medium">{order.customerName || `Table ${order.tableNumber || '-'}`}</td>
                <td className="p-5 text-right font-black text-brand-primary">{appConfig.currencySymbol}{order.total.toFixed(2)}</td>
                <td className="p-5 text-right">
                    <button className="p-2 bg-dark-bg border border-dark-border rounded-lg hover:border-brand-primary transition-colors">
                        <Icon className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 3h.008v.008H12V18zm-3-6h.008v.008H9v-.008zM9 15h.008v.008H9V15zm0 3h.008v.008H9V18zm6-6h.008v.008H15v-.008zM15 15h.008v.008H15V15zm0 3h.008v.008H15V18z" /></Icon>
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
