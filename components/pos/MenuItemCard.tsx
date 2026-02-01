
import React from 'react';
import { MenuItem } from '../../types';
import { Icon } from '../shared/Icon';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  onCustomize: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect, onCustomize }) => {
  const isOutOfStock = item.stock !== undefined && item.stock <= 0;
  const isLowStock = item.stock !== undefined && item.stock > 0 && item.stock <= 5;
  const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0;

  return (
    <div
      onClick={() => !isOutOfStock && onSelect(item)}
      className={`bg-dark-card rounded-lg shadow-sm transition-all duration-200 group flex flex-col relative select-none border border-dark-border h-24 ${
        isOutOfStock 
            ? 'opacity-60 grayscale cursor-not-allowed' 
            : 'hover:shadow-brand-primary/30 cursor-pointer active:scale-[0.98]'
      }`}
    >
      <div className="p-3 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
            <h3 className={`font-semibold text-xs leading-tight pr-8 line-clamp-2 ${isOutOfStock ? 'text-medium-text' : 'text-light-text'}`}>
                {item.name}
            </h3>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isOutOfStock) onCustomize(item);
                }}
                disabled={isOutOfStock}
                className={`absolute top-2 right-2 p-1 rounded-md transition-colors z-10 ${
                    isOutOfStock 
                        ? 'text-dark-border cursor-not-allowed' 
                        : 'text-medium-text hover:text-brand-primary hover:bg-dark-border/50'
                }`}
                title="Customize / Add Note"
                aria-label="Customize item"
            >
                 <Icon className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </Icon>
            </button>
        </div>
        
        <div className="flex justify-between items-end">
            <div className="flex flex-col">
                <p className={`font-black text-sm ${isOutOfStock ? 'text-medium-text' : 'text-brand-primary'}`}>
                    ${item.price.toFixed(2)}
                </p>
                {item.stock !== undefined && (
                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded-sm mt-1 w-fit ${
                        isOutOfStock 
                            ? 'bg-red-900/30 text-red-500 border border-red-900/50' 
                            : isLowStock 
                                ? 'bg-orange-900/30 text-orange-500 border border-orange-900/50'
                                : 'bg-dark-bg text-medium-text border border-dark-border'
                    }`}>
                        {isOutOfStock ? 'Sold Out' : `${item.stock} left`}
                    </span>
                )}
            </div>

            {/* Quick Add Button - Only for items without modifiers */}
            {!hasModifiers && !isOutOfStock && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item);
                    }}
                    className="bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white p-1.5 rounded-lg transition-all shadow-sm group-hover:scale-110 active:scale-95 z-10"
                    title="Quick Add"
                >
                    <Icon className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </Icon>
                </button>
            )}

            {/* Indicator for items that REQUIRE selection */}
            {hasModifiers && !isOutOfStock && (
                 <div className="text-[8px] font-black text-medium-text/50 uppercase tracking-widest pb-1 pr-1">
                    Options
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};
