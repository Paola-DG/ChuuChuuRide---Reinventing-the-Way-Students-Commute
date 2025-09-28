
import React from 'react';
import type { AcademicEvent } from '../types';
import { format } from 'date-fns';
import { CarIcon } from './icons/CarIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { BusIcon } from './icons/BusIcon';

interface EventCardProps {
  event: AcademicEvent;
  onViewRides: (event: AcademicEvent) => void;
  privateOwnerCount: number;
  organizationBusCount: number;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onViewRides, privateOwnerCount, organizationBusCount }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {event.imageUrl ? (
        <img src={event.imageUrl} alt={event.name} className="w-full h-32 object-cover"/>
      ) : (
        <div className="w-full h-32 bg-brand-blue flex items-center justify-center p-4">
            <h3 className="text-2xl font-display text-brand-gold text-center">{event.name}</h3>
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <h4 className="text-lg font-bold text-brand-blue">{event.name}</h4>
        <p className="text-sm text-gray-600">{event.location}</p>
        <p className="text-sm text-gray-500 mb-3">{format(event.date, "EEEE, MMM d, yyyy")}</p>
        
        <div className="mt-auto space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <CarIcon />
              <span>{privateOwnerCount} Private Drivers</span>
            </div>
          </div>
           <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600">
              <BusIcon />
              <span>{organizationBusCount} Organization Rides</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-600">
              <PlusCircleIcon />
              <span>{event.ridesNeeded} Students Need Rides</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onViewRides(event)}
          className="mt-4 w-full bg-brand-gold text-brand-blue font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
        >
          View Event Rides
        </button>
      </div>
    </div>
  );
};
