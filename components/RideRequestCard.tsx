import React from 'react';
import type { RideRequest, UserProfile } from '../types';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';

interface RideRequestCardProps {
  request: RideRequest;
  currentUser: UserProfile;
  onOfferRide?: (request: RideRequest) => void;
}

export const RideRequestCard: React.FC<RideRequestCardProps> = ({ request, currentUser, onOfferRide }) => {
  const isOwnRequest = request.poolee.id === currentUser.id;
  const isDriverView = currentUser.role === 'Owner';

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <img src={request.poolee.avatarUrl} alt={request.poolee.name} className="w-16 h-16 rounded-full border-2 border-gray-200" />
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg text-brand-blue">{request.poolee.name} is looking for a ride</p>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <LocationMarkerIcon className="h-4 w-4 text-gray-500" />
                {request.origin} &rarr; {request.destination}
              </p>
            </div>
            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${request.type === 'Event Based' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-brand-blue'}`}>
                {request.type}
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
             <p className="text-sm text-gray-700">"{request.details}"</p>
          </div>
        </div>
      </div>
       <div className="mt-4 text-right">
          {isOwnRequest ? (
            <button
              disabled
              className="bg-gray-300 text-gray-500 font-bold py-2 px-6 rounded-lg cursor-not-allowed"
            >
              Your Request
            </button>
          ) : isDriverView && onOfferRide ? (
            <button 
              onClick={() => onOfferRide(request)}
              className="bg-brand-gold text-brand-blue font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              Offer Ride
            </button>
          ) : null}
      </div>
    </div>
  );
};
