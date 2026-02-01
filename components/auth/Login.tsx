
import React, { useState, useEffect } from 'react';
import { Icon } from '../shared/Icon';
import { StaffMember, AppConfig } from '../../types';

interface LoginProps {
  staffMembers: StaffMember[];
  onLogin: (member: StaffMember) => void;
  appConfig: AppConfig;
}

export const Login: React.FC<LoginProps> = ({ staffMembers, onLogin, appConfig }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const validatePin = (enteredPin: string) => {
    const user = staffMembers.find(m => m.pin === enteredPin && m.status === 'Active');
    
    if (user) {
        onLogin(user);
    } else {
        setError('Invalid PIN');
        // Clear pin after a short delay so user sees the dots full for a split second
        setTimeout(() => {
            setPin('');
        }, 300);
    }
  };

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        setError('');

        // AUTOMATIC SUBMISSION:
        // When the 4th digit is entered, validate immediately.
        if (newPin.length === 4) {
            validatePin(newPin);
        }
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  // Re-adding manual submit as fallback or for accessibility
  const handleSubmit = () => {
    if (pin.length === 4) {
        validatePin(pin);
    } else {
        setError('Enter 4 digits');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-dark-bg text-light-text font-sans p-4">
        <div className="bg-dark-card p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-dark-border flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="bg-brand-primary p-4 rounded-2xl mb-6 shadow-xl shadow-brand-primary/20">
                 {appConfig.logoUrl ? (
                     <img src={appConfig.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
                 ) : (
                    <Icon className="w-10 h-10 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l-3.75-3.75m0 0L3.75 6m-3.75 3.75h19.5m-19.5 0L3.75 10m-3.75-3.75L3.75 3m0 0L7.5 6.75M7.5 17.25l-3.75-3.75m3.75 3.75L7.5 21M14.25 13.5l3.75-3.75m0 0l-3.75-3.75m3.75 3.75h-19.5m19.5 0l-3.75 3.75m3.75-3.75l-3.75 6.75" />
                    </Icon>
                 )}
            </div>
            <h1 className="text-3xl font-black mb-1 text-light-text tracking-tight">{appConfig.appName}</h1>
            <p className="text-medium-text mb-8 text-sm font-bold uppercase tracking-widest opacity-60">Staff Terminal</p>
            
            <div className="flex space-x-6 mb-8">
                {[0, 1, 2, 3].map(i => (
                    <div 
                        key={i} 
                        className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                            i < pin.length 
                            ? 'bg-brand-primary border-brand-primary scale-125 shadow-lg shadow-brand-primary/40' 
                            : 'bg-dark-bg border-dark-border'
                        }`} 
                    />
                ))}
            </div>
            
             <div className="h-6 mb-4">
                {error && <p className="text-red-400 font-black text-xs uppercase tracking-tighter animate-bounce">{error}</p>}
             </div>

            <div className="grid grid-cols-3 gap-4 w-full mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button 
                        key={num} 
                        onClick={() => handleNumClick(num.toString())}
                        className="h-16 rounded-2xl bg-dark-bg border border-dark-border hover:bg-dark-border/80 hover:border-brand-primary text-2xl font-black transition-all text-light-text active:scale-90"
                    >
                        {num}
                    </button>
                ))}
                 <button onClick={handleClear} className="h-16 rounded-2xl bg-red-900/10 text-red-400 border border-red-900/20 hover:bg-red-900/20 text-lg font-black transition-all active:scale-90">C</button>
                 <button onClick={() => handleNumClick('0')} className="h-16 rounded-2xl bg-dark-bg border border-dark-border hover:bg-dark-border/80 hover:border-brand-primary text-2xl font-black transition-all text-light-text active:scale-90">0</button>
                 <button 
                    onClick={handleSubmit} 
                    className={`h-16 rounded-2xl transition-all active:scale-90 border ${
                        pin.length === 4 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/30' 
                        : 'bg-dark-bg text-medium-text border-dark-border opacity-50'
                    }`}
                 >
                    <Icon className="w-6 h-6 mx-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </Icon>
                 </button>
            </div>
            
             <div className="text-center space-y-1">
                <p className="text-[10px] text-medium-text font-black uppercase tracking-widest opacity-40">Sample PINs</p>
                <p className="text-xs text-brand-primary font-bold">1234 (Manager) • 0000 (Cashier)</p>
             </div>
        </div>
    </div>
  );
};
