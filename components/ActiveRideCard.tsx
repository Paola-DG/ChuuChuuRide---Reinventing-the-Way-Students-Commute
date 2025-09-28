
import React from 'react';
import type { CommuteProvider } from '../types';
import { ChatIcon } from './icons/ChatIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';

interface ActiveRideCardProps {
  provider: CommuteProvider;
  onContactDriver: (provider: CommuteProvider) => void;
}

export const ActiveRideCard: React.FC<ActiveRideCardProps> = ({ provider, onContactDriver }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0 flex flex-col items-center sm:w-24">
            <img src={provider.user.avatarUrl} alt={provider.user.name} className="w-16 h-16 rounded-full border-4 border-eco-green" />
            <span className="mt-2 text-center text-sm font-semibold text-gray-800">{provider.user.name}</span>
        </div>
        
        <div className="flex-grow border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg text-brand-blue">Ride with {provider.user.name}</p>
              <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                <LocationMarkerIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span>{provider.routeOrigin} &rarr; {provider.routeDestination}</span>
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-xl font-bold text-eco-green">${provider.estimatedCost.toFixed(2)}</p>
              <p className="text-xs text-green-700 font-semibold px-2 py-1 bg-eco-green-light rounded-full mt-1">Confirmed</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
             <button 
                onClick={() => onContactDriver(provider)}
                className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2"
            >
                <ChatIcon className="h-5 w-5" />
                Contact Driver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
