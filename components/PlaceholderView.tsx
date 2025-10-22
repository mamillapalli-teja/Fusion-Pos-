
import React from 'react';
import { ViewType } from '../types';
import { Icon } from './shared/Icon';
import { ICONS } from '../constants';

interface PlaceholderViewProps {
    view: ViewType;
}

const capitalizeFirstLetter = <T extends string,>(string: T): Capitalize<T> => {
    return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<T>;
};

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ view }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-medium-text p-8">
            <div className="bg-dark-card p-8 rounded-full mb-6">
                <Icon className="w-24 h-24 text-brand-primary">{ICONS[view]}</Icon>
            </div>
            <h1 className="text-4xl font-bold text-light-text mb-2">{capitalizeFirstLetter(view)}</h1>
            <p className="text-lg">This feature is currently under development.</p>
            <p className="mt-4 max-w-md">
                Here you will be able to manage {view}, view detailed reports, and configure settings.
                Check back soon for updates!
            </p>
        </div>
    );
};
