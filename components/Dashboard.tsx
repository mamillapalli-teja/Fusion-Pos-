
import React from 'react';
import { Order, OrderStatus } from '../types';
import { Icon } from './shared/Icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardProps {
  orders: Order[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-dark-card p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-8 h-8 text-white">{icon}</Icon>
        </div>
        <div>
            <p className="text-medium-text text-sm">{title}</p>
            <p className="text-2xl font-bold text-light-text">{value}</p>
        </div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  const totalSales = orders
    .filter(o => o.status === OrderStatus.COMPLETED)
    .reduce((sum, order) => sum + order.total, 0);

  const activeOrders = orders.filter(o => o.status === OrderStatus.NEW || o.status === OrderStatus.PREPARING).length;

  const totalOrders = orders.length;

  const averageOrderValue = totalOrders > 0 ? totalSales / orders.filter(o => o.status === OrderStatus.COMPLETED).length : 0;
  
  const salesData = [
    { name: '9am', sales: 400 },
    { name: '10am', sales: 300 },
    { name: '11am', sales: 600 },
    { name: '12pm', sales: 1100 },
    { name: '1pm', sales: 900 },
    { name: '2pm', sales: 1200 },
    { name: '3pm', sales: 850 },
  ];

  const dispatchTypeData = Object.values(OrderStatus).map(status => ({
    name: status,
    orders: orders.filter(o => o.status === status).length,
  }));


  return (
    <div className="p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Sales Today" value={`$${totalSales.toFixed(2)}`} color="bg-green-500" icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} />
        <StatCard title="Active Orders" value={activeOrders.toString()} color="bg-yellow-500" icon={<path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691L7.94 12.25m4.992-2.69l-3.182 3.182a4.5 4.5 0 00-6.364 0l-3.182-3.182m11.666 0L12 7.94a4.5 4.5 0 016.364 0l3.182 3.182" />} />
        <StatCard title="Completed Orders" value={totalOrders.toString()} color="bg-blue-500" icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} />
        <StatCard title="Avg. Order Value" value={`$${averageOrderValue.toFixed(2)}`} color="bg-purple-500" icon={<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414-.336.75-.75.75h-.75m0-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-light-text">Sales Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#14b8a6" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-dark-card p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-light-text">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dispatchTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="orders" fill="#14b8a6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
