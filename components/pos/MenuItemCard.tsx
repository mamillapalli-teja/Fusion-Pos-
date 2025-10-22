
import React from 'react';
import { MenuItem } from '../../types';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(item)}
      className="bg-dark-card rounded-lg overflow-hidden shadow-lg hover:shadow-brand-primary/50 transition-shadow duration-300 group flex flex-col"
    >
      <div className="relative h-32">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-3 text-left flex-grow flex flex-col justify-between">
        <h3 className="font-semibold text-light-text mb-1">{item.name}</h3>
        <p className="font-bold text-brand-primary text-lg">${item.price.toFixed(2)}</p>
      </div>
    </button>
  );
};
