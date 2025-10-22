
import React from 'react';
import { Icon } from '../shared/Icon';
import { PaymentMethod } from '../../types';

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onPayment: (method: PaymentMethod) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ total, onClose, onPayment }) => {
  const paymentOptions: { method: PaymentMethod; icon: React.ReactNode; label: string }[] = [
    { method: PaymentMethod.CASH, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414-.336.75-.75.75h-.75m0-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />, label: 'Cash' },
    { method: PaymentMethod.CARD, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />, label: 'Card' },
    { method: PaymentMethod.MOBILE, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75A2.25 2.25 0 0015.75 1.5h-2.25m-3 0V3m3 0V3m0 18v-1.5m-3 0v-1.5m-6-3H18" />, label: 'Mobile Pay' },
    { method: PaymentMethod.VOUCHER, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h5.25m0 0h5.25M9 18.75h5.25m-5.25 0h5.25m0 0h5.25m-10.5 0h5.25m-5.25 0h5.25" />, label: 'Voucher' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="p-6 border-b border-dark-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-light-text">Payment</h2>
          <button onClick={onClose} className="text-medium-text hover:text-light-text">&times;</button>
        </div>
        <div className="p-6 text-center">
          <p className="text-medium-text text-lg">Total Due</p>
          <p className="text-5xl font-bold text-brand-primary my-4">${total.toFixed(2)}</p>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {paymentOptions.map(opt => (
            <button
              key={opt.method}
              onClick={() => onPayment(opt.method)}
              className="flex flex-col items-center justify-center p-6 bg-dark-border rounded-lg hover:bg-brand-secondary transition-colors duration-200"
            >
              <Icon className="w-12 h-12 mb-2">{opt.icon}</Icon>
              <span className="text-lg font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-dark-border text-center">
             <button onClick={onClose} className="w-full py-3 text-lg font-bold rounded-lg transition-colors bg-gray-600 hover:bg-gray-500">
                Cancel
             </button>
        </div>
      </div>
    </div>
  );
};
