
import React from 'react';
import { ViewType } from '../../types';
import { Icon } from '../shared/Icon';

interface HeaderProps {
  currentView: ViewType;
}

const capitalizeFirstLetter = <T extends string,>(string: T): Capitalize<T> => {
    return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<T>;
};


export const Header: React.FC<HeaderProps> = ({ currentView }) => {
  return (
    <header className="p-4 bg-dark-card border-b border-dark-border flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-light-text">{capitalizeFirstLetter(currentView)}</h2>
      <div className="flex items-center space-x-4">
        <button className="relative text-medium-text hover:text-light-text">
            <Icon>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </Icon>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
            </span>
        </button>
        <div className="flex items-center space-x-2">
            <img src="https://picsum.photos/id/237/40/40" alt="User Avatar" className="w-10 h-10 rounded-full object-cover" />
            <div>
                <p className="font-semibold text-light-text">John Doe</p>
                <p className="text-xs text-medium-text">Manager</p>
            </div>
        </div>
      </div>
    </header>
  );
};
