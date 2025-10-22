import React, { useState, useMemo } from 'react';
import { MenuItem, OrderItem, Modifier, ModifierGroup } from '../../types';
import { Icon } from '../shared/Icon';

interface ItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: OrderItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onAddToCart }) => {
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);
  const [notes, setNotes] = useState('');

  const handleModifierChange = (modifier: Modifier, group: ModifierGroup) => {
    setSelectedModifiers(prev => {
      if (group.selectionType === 'single') {
        const otherModifiersInGroup = prev.filter(m => !group.modifiers.some(gm => gm.id === m.id));
        return [...otherModifiersInGroup, modifier];
      } else { // 'multiple'
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
  
  const itemTotal = useMemo(() => {
    const modifiersPrice = selectedModifiers.reduce((sum, mod) => sum + mod.priceAdjustment, 0);
    return item.price + modifiersPrice;
  }, [item, selectedModifiers]);

  const handleConfirm = () => {
    const configuredItem: OrderItem = {
      ...item,
      quantity: 1,
      selectedModifiers,
      notes,
    };
    onAddToCart(configuredItem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-dark-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-light-text">{item.name}</h2>
          <button onClick={onClose} className="text-medium-text hover:text-light-text text-2xl">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {item.modifierGroups?.map(group => (
                <div key={group.id}>
                    <h3 className="text-lg font-semibold text-light-text border-b border-dark-border pb-2 mb-3">{group.name}</h3>
                    <div className="space-y-2">
                        {group.modifiers.map(modifier => (
                            <label key={modifier.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-bg cursor-pointer hover:bg-dark-border transition-colors">
                                <div className="flex items-center">
                                    <input
                                        type={group.selectionType === 'single' ? 'radio' : 'checkbox'}
                                        name={group.id}
                                        checked={isModifierSelected(modifier.id)}
                                        onChange={() => handleModifierChange(modifier, group)}
                                        className="h-5 w-5 rounded text-brand-primary bg-dark-border border-medium-text focus:ring-brand-secondary"
                                    />
                                    <span className="ml-3 text-light-text">{modifier.name}</span>
                                </div>
                                <span className="text-medium-text">
                                    {modifier.priceAdjustment > 0 ? `+$${modifier.priceAdjustment.toFixed(2)}` : 'Included'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            
            <div>
                 <h3 className="text-lg font-semibold text-light-text border-b border-dark-border pb-2 mb-3">Special Instructions</h3>
                 <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., no onions, extra sauce..."
                    className="w-full h-24 bg-dark-bg border border-dark-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                 />
            </div>
        </div>
        
        <div className="p-4 border-t border-dark-border mt-auto">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold">Item Total:</span>
                <span className="text-2xl font-bold text-brand-primary">${itemTotal.toFixed(2)}</span>
            </div>
            <button 
                onClick={handleConfirm}
                className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 rounded-lg transition-colors text-lg">
                Add to Order
            </button>
        </div>
      </div>
    </div>
  );
};