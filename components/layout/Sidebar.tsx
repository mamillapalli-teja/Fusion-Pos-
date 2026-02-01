
import React from 'react';
import { ViewType, AppConfig } from '../../types';
import { NAV_ITEMS, ICONS } from '../../constants';
import { Icon } from '../shared/Icon';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  appConfig: AppConfig;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, appConfig }) => {
  return (
    <div className="w-20 lg:w-64 bg-dark-card h-screen flex flex-col justify-between p-4 fixed z-40 border-r border-dark-border">
      <div>
        <div className="flex items-center justify-center lg:justify-start mb-10">
          <div className="bg-brand-primary p-2 rounded-lg shadow-lg shadow-brand-primary/20 shrink-0">
             {appConfig.logoUrl ? (
                 <img src={appConfig.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
             ) : (
                <Icon className="w-8 h-8 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l-3.75-3.75m0 0L3.75 6m-3.75 3.75h19.5m-19.5 0L3.75 10m-3.75-3.75L3.75 3m0 0L7.5 6.75M7.5 17.25l-3.75-3.75m3.75 3.75L7.5 21M14.25 13.5l3.75-3.75m0 0l-3.75-3.75m3.75 3.75h-19.5m19.5 0l-3.75 3.75m3.75-3.75l-3.75 6.75" />
                </Icon>
             )}
          </div>
          <h1 className="text-xl font-bold ml-3 hidden lg:block text-brand-primary tracking-tight truncate">{appConfig.appName}</h1>
        </div>
        <nav>
          <ul>
            {NAV_ITEMS.map(({ view, label }) => (
              <li key={view} className="mb-2">
                <button
                  onClick={() => onNavigate(view)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    currentView === view
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'text-medium-text hover:bg-dark-border hover:text-light-text'
                  }`}
                >
                  <Icon className="w-6 h-6">{ICONS[view]}</Icon>
                  <span className="ml-4 hidden lg:block font-medium">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div>
        <ul className="border-t border-dark-border pt-4">
            <li className="mb-2">
                <button
                    onClick={() => onNavigate('settings')}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    currentView === 'settings'
                        ? 'bg-brand-primary text-white'
                        : 'text-medium-text hover:bg-dark-border hover:text-light-text'
                    }`}
                >
                    <Icon>{ICONS.settings}</Icon>
                    <span className="ml-4 hidden lg:block font-medium">Settings</span>
                </button>
            </li>
            <li>
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center p-3 rounded-lg text-medium-text hover:bg-red-900/20 hover:text-red-400 transition-colors duration-200"
                >
                    <Icon>{ICONS.logout}</Icon>
                    <span className="ml-4 hidden lg:block font-medium">Logout</span>
                </button>
            </li>
        </ul>
      </div>
    </div>
  );
};
