
import React from 'react';
import { ViewType } from '../../types';
import { Icon } from '../shared/Icon';
import { ICONS } from '../../constants';

interface HeaderProps {
  currentView: ViewType;
  user?: { name: string; role: string } | null;
  onNavigate?: (view: ViewType) => void;
}

const capitalizeFirstLetter = <T extends string,>(string: T): Capitalize<T> => {
    return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<T>;
};


export const Header: React.FC<HeaderProps> = ({ currentView, user, onNavigate }) => {
  return (
    <header className="p-4 bg-dark-card border-b border-dark-border flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-light-text">{capitalizeFirstLetter(currentView)}</h2>
      <div className="flex items-center space-x-4">
        {/* Bills Shortcut Button */}
        <button 
          onClick={() => onNavigate?.('bills')}
          className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            currentView === 'bills' 
            ? 'bg-brand-primary text-white shadow-lg' 
            : 'bg-dark-bg border border-dark-border text-medium-text hover:text-light-text hover:border-brand-primary'
          }`}
        >
          <Icon className="w-4 h-4">{ICONS.bills}</Icon>
          Bills
        </button>

        {/* System Status Indicator */}
        <div className="hidden md:flex items-center bg-dark-bg border border-dark-border px-3 py-1 rounded-full">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-ready opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-ready"></span>
            </span>
            <span className="text-xs font-medium text-light-text">System Online</span>
        </div>

        <button className="relative text-medium-text hover:text-light-text">
            <Icon>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </Icon>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
            </span>
        </button>
        <div className="flex items-center space-x-2 border-l border-dark-border pl-4">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=14b8a6&color=fff`} alt="User Avatar" className="w-10 h-10 rounded-full object-cover" />
            <div className="hidden sm:block">
                <p className="font-semibold text-light-text text-sm">{user?.name || 'User'}</p>
                <p className="text-xs text-medium-text">{user?.role || 'Staff'}</p>
            </div>
        </div>
      </div>
    </header>
  );
};
