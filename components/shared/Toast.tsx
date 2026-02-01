
import React, { useEffect } from 'react';
import { Notification } from '../../types';
import { Icon } from './Icon';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), 4000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  const config = {
    success: { bg: 'bg-status-ready', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    error: { bg: 'bg-red-500', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /> },
    info: { bg: 'bg-brand-primary', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /> },
    warning: { bg: 'bg-status-preparing', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" /> },
  };

  const { bg, icon } = config[notification.type];

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border border-white/10 text-white animate-in slide-in-from-right-10 fade-in duration-300 backdrop-blur-md ${bg} mb-3 min-w-[300px]`}>
      <Icon className="w-6 h-6">{icon}</Icon>
      <p className="flex-1 font-bold text-sm tracking-tight">{notification.message}</p>
      <button onClick={() => onDismiss(notification.id)} className="opacity-50 hover:opacity-100 transition-opacity">
        <Icon className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>
      </button>
    </div>
  );
};
