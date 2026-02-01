
import React, { useState, useMemo } from 'react';
import { MenuItem, OrderItem, Modifier, ModifierGroup } from '../../types';
import { Icon } from '../shared/Icon';

interface ItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: OrderItem) => void;
  userRole?: string;
  onLogAction?: (action: string, details: string, severity?: 'low' | 'medium' | 'high') => void;
  initialSeat?: number;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onAddToCart, userRole, onLogAction, initialSeat = 1 }) => {
  const getInitialModifiers = () => {
    const defaults: Modifier[] = [];
    if (item.modifierGroups) {
      for (const group of item.modifierGroups) {
        if (group.selectionType === 'single') {
          const defaultModifier = group.modifiers.find(m => m.priceAdjustment === 0) || group.modifiers[0];
          if (defaultModifier) {
            defaults.push(defaultModifier);
          }
        }
      }
    }
    return defaults;
  };

  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>(getInitialModifiers);
  const [notes, setNotes] = useState('');
  const [seatNumber, setSeatNumber] = useState<number>(initialSeat);
  
  const [isOverrideEnabled, setIsOverrideEnabled] = useState(false);
  const [overridePrice, setOverridePrice] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState('');

  const canOverridePrice = userRole === 'Manager' || userRole === 'Admin';

  const handleModifierChange = (modifier: Modifier, group: ModifierGroup) => {
    setSelectedModifiers(prev => {
      if (group.selectionType === 'single') {
        const otherModifiersInGroup = prev.filter(m => !group.modifiers.some(gm => gm.id === m.id));
        return [...otherModifiersInGroup, modifier];
      } else {
        const isAlreadySelected = prev.some(m => m.id === modifier.id);
        if (isAlreadySelected) {
          return prev.filter(m => m.id !== modifier.id);
        } else {
          return [...prev, modifier];
        }
      }
    });
  };

  const isModifierSelected = (modifierId: string) => {
    return selectedModifiers.some(m => m.id === modifierId);
  };
  
  const basePrice = isOverrideEnabled && overridePrice !== '' ? parseFloat(overridePrice) : item.price;

  const itemTotal = useMemo(() => {
    const modifiersPrice = selectedModifiers.reduce((sum, mod) => sum + mod.priceAdjustment, 0);
    return basePrice + modifiersPrice;
  }, [basePrice, selectedModifiers]);

  const handleConfirm = () => {
    if (isOverrideEnabled) {
      if (overridePrice === '' || isNaN(parseFloat(overridePrice))) {
        alert("Please enter a valid numeric price.");
        return;
      }
      if (overrideReason.trim().length < 3) {
        alert("A valid reason (min 3 chars) is required for price overrides.");
        return;
      }
    }

    const configuredItem: OrderItem = {
      ...item,
      quantity: 1,
      selectedModifiers,
      notes,
      seatNumber
    };

    if (isOverrideEnabled && overridePrice !== '') {
        const newPrice = parseFloat(overridePrice);
        configuredItem.price = newPrice;
        configuredItem.originalPrice = item.price;
        configuredItem.priceOverrideReason = overrideReason;

        // Formal Audit Logging
        onLogAction?.(
          'Price Override', 
          `Item: ${item.name}. Original: $${item.price.toFixed(2)}. New: $${newPrice.toFixed(2)}. Reason: ${overrideReason}`,
          'medium'
        );
    }

    onAddToCart(configuredItem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-lg m-4 flex flex-col max-h-[90vh] border border-dark-border">
        <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-bg/20">
          <h2 className="text-xl font-bold text-light-text tracking-tight">{item.name}</h2>
          <button onClick={onClose} className="text-medium-text hover:text-light-text p-2 hover:bg-dark-border rounded-full transition-colors">
            <Icon className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Seat Selection */}
            <div className="bg-dark-bg/50 p-4 rounded-2xl border border-dark-border shadow-inner">
                <h3 className="text-[10px] font-black text-medium-text mb-3 uppercase tracking-[0.2em] opacity-60">Assign to Seat</h3>
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <button
                            key={s}
                            onClick={() => setSeatNumber(s)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                                seatNumber === s 
                                ? 'bg-brand-primary text-white scale-110 shadow-xl shadow-brand-primary/20' 
                                : 'bg-dark-card text-medium-text hover:bg-dark-border border border-dark-border'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                    <button
                        onClick={() => setSeatNumber(0)}
                        className={`px-4 h-10 rounded-xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest transition-all ${
                            seatNumber === 0 
                            ? 'bg-brand-primary text-white' 
                            : 'bg-dark-card text-medium-text hover:bg-dark-border border border-dark-border'
                        }`}
                    >
                        Shared
                    </button>
                </div>
            </div>

            {/* Price Override Section */}
            {canOverridePrice && (
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${isOverrideEnabled ? 'bg-brand-primary/5 border-brand-primary shadow-lg shadow-brand-primary/5' : 'bg-dark-bg/50 border-dark-border'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-xs font-black text-brand-primary flex items-center gap-3 cursor-pointer uppercase tracking-widest">
                            <input 
                                type="checkbox" 
                                checked={isOverrideEnabled} 
                                onChange={(e) => {
                                    setIsOverrideEnabled(e.target.checked);
                                    if (!e.target.checked) {
                                        setOverridePrice('');
                                        setOverrideReason('');
                                    }
                                }}
                                className="w-5 h-5 rounded border-dark-border text-brand-primary focus:ring-brand-primary bg-dark-bg"
                            />
                            Override Default Price
                        </label>
                        <div className="flex items-center gap-1.5 bg-brand-primary/10 px-2.5 py-1 rounded-full border border-brand-primary/20">
                            <Icon className="w-3 h-3 text-brand-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></Icon>
                            <span className="text-[9px] font-black text-brand-primary uppercase tracking-tighter">Manager Access</span>
                        </div>
                    </div>
                    {isOverrideEnabled && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black text-medium-text mb-1.5 uppercase tracking-widest">New Unit Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-medium-text/50 font-bold">$</span>
                                        <input 
                                            type="number" 
                                            autoFocus
                                            value={overridePrice}
                                            onChange={(e) => setOverridePrice(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 pl-7 text-sm text-light-text font-mono font-bold focus:ring-2 focus:ring-brand-primary outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end pb-1">
                                    <p className="text-[10px] text-medium-text italic">Default: ${item.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-medium-text mb-1.5 uppercase tracking-widest">Reason for Override <span className="text-red-400">*</span></label>
                                <input 
                                    type="text" 
                                    value={overrideReason}
                                    onChange={(e) => setOverrideReason(e.target.value)}
                                    placeholder="e.g. Price Match / Manager Special"
                                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-light-text font-bold focus:ring-2 focus:ring-brand-primary outline-none"
                                />
                                <p className="text-[9px] text-medium-text/50 mt-1 uppercase font-bold tracking-tighter">Required for audit trail logging</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {item.modifierGroups?.map(group => (
                <div key={group.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="text-[10px] font-black text-medium-text mb-3 uppercase tracking-[0.2em] border-b border-dark-border/30 pb-2">{group.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.modifiers.map(modifier => (
                            <label key={modifier.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isModifierSelected(modifier.id) ? 'bg-brand-primary/10 border-brand-primary shadow-sm' : 'bg-dark-bg/30 border-dark-border hover:bg-dark-border/50'}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type={group.selectionType === 'single' ? 'radio' : 'checkbox'}
                                        name={group.id}
                                        checked={isModifierSelected(modifier.id)}
                                        onChange={() => handleModifierChange(modifier, group)}
                                        className="h-5 w-5 rounded border-dark-border text-brand-primary bg-dark-bg focus:ring-brand-primary"
                                    />
                                    <span className="text-sm font-bold text-light-text">{modifier.name}</span>
                                </div>
                                <span className={`text-[10px] font-mono ${modifier.priceAdjustment > 0 ? 'text-brand-primary' : 'text-medium-text'}`}>
                                    {modifier.priceAdjustment > 0 ? `+$${modifier.priceAdjustment.toFixed(2)}` : 'INC.'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            
            <div>
                 <h3 className="text-[10px] font-black text-medium-text mb-3 uppercase tracking-[0.2em] border-b border-dark-border/30 pb-2">Preparation Notes</h3>
                 <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., no onions, extra spicy, well done..."
                    className="w-full h-24 bg-dark-bg border border-dark-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none placeholder-medium-text/30"
                 />
            </div>
        </div>
        
        <div className="p-6 border-t border-dark-border bg-dark-bg/20">
            <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-medium-text uppercase tracking-widest">Calculated Total</span>
                <div className="text-right">
                    <span className="text-3xl font-black text-brand-primary font-mono">${itemTotal.toFixed(2)}</span>
                </div>
            </div>
            <button 
                onClick={handleConfirm}
                disabled={isOverrideEnabled && (!overridePrice || !overrideReason.trim())}
                className={`w-full py-4 rounded-2xl font-black transition-all text-sm uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 ${
                  isOverrideEnabled && (!overridePrice || !overrideReason.trim())
                  ? 'bg-dark-border text-medium-text cursor-not-allowed opacity-50'
                  : 'bg-brand-primary hover:bg-brand-secondary text-white shadow-brand-primary/30 active:scale-[0.98]'
                }`}>
                {isOverrideEnabled ? <Icon className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></Icon> : null}
                Add to Cart (Seat {seatNumber || 'Shared'})
            </button>
        </div>
      </div>
    </div>
  );
};
