
import React from 'react';
import type { AcademicEvent, Ride, UserProfile, CommuteProvider, ChatSession, BookingStatus } from '../types';
import { format } from 'date-fns';
import { RideCard } from './RideCard';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';

interface EventRidesModalProps {
  event: AcademicEvent;
  rides: Ride[];
  onClose: () => void;
  onViewRoute: (ride: Ride) => void;
  onStartChat: (provider: CommuteProvider) => void;
  currentUser: UserProfile;
  chatSessions: ChatSession[];
  onBookOrganizationRide: (ride: Ride) => void;
}

export const EventRidesModal: React.FC<EventRidesModalProps> = ({ event, rides, onClose, onViewRoute, onStartChat, currentUser, chatSessions, onBookOrganizationRide }) => {
  const eventRides = rides.filter(ride => ride.eventId === event.id);
  
  const rideIdToChatStatus = new Map<string, BookingStatus>();
  chatSessions.forEach(session => {
    const rideIdPrefix = 'prov_from_ride_';
    if (session.provider.id.startsWith(rideIdPrefix)) {
      const rideId = session.provider.id.substring(rideIdPrefix.length);
      rideIdToChatStatus.set(rideId, session.status);
    }
  });

  const communityRides = eventRides.filter(ride => {
    const status = rideIdToChatStatus.get(ride.id);
    return ride.driver.role !== 'Organization' && (!status || !['Confirmed', 'Cancelled'].includes(status));
  });

  const organizationRides = eventRides.filter(ride => ride.driver.role === 'Organization');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-rides-title"
    >
      <div 
        className="bg-light-bg rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <header className="relative">
            {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.name} className="w-full h-48 object-cover"/>
            ) : (
                <div className="w-full h-48 bg-brand-blue" />
            )}
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
                aria-label="Close"
            >
                <XIcon className="h-6 w-6"/>
            </button>
        </header>
        
        <div className="p-6 flex-grow overflow-y-auto">
            <h2 id="event-rides-title" className="text-3xl font-bold text-brand-blue">{event.name}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 mt-2 mb-6">
                <p className="flex items-center gap-2"><LocationMarkerIcon className="h-5 w-5 text-gray-500" />{event.location}</p>
                <p className="flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-gray-500" />{format(event.date, "EEEE, MMM d, yyyy 'at' h:mm a")}</p>
            </div>
            
            {/* Organization Buses Section */}
            {organizationRides.length > 0 && (
                <section className="mb-8">
                    <h3 className="text-xl font-bold text-brand-blue mb-4 border-b-2 border-brand-gold pb-2">Organization Buses</h3>
                    <div className="space-y-4">
                        {organizationRides.map(ride => {
                             const isBooked = chatSessions.some(
                                session => session.provider.id === `prov_org_${ride.id}` && 
                                           session.poolee.id === currentUser.id &&
                                           session.status === 'Confirmed'
                            );
                            const hasSeats = ride.availableSeats > 0;
                            return (
                                <div key={ride.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <img src={ride.driver.avatarUrl} alt={ride.driver.name} className="w-16 h-16 rounded-full border-2 border-gray-200" />
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-lg">{ride.driver.name}</h4>
                                            <p className="text-sm text-gray-600">{ride.origin} &rarr; {ride.destination}</p>
                                            <p className="text-sm text-gray-500">
                                                {format(ride.departureTime, "MMM d 'at' h:mm a")}
                                            </p>
                                        </div>
                                        <div className="text-center flex-shrink-0 mx-4">
                                            <p className="font-bold text-2xl text-brand-blue">{ride.availableSeats}</p>
                                            <p className="text-xs text-gray-500">seats left</p>
                                        </div>
                                        <button 
                                            onClick={() => onBookOrganizationRide(ride)}
                                            disabled={isBooked || !hasSeats}
                                            className={`ml-auto font-bold py-2 px-4 rounded-lg transition-colors text-sm w-32 text-center ${
                                                isBooked 
                                                ? 'bg-eco-green text-white cursor-not-allowed flex items-center justify-center gap-2' 
                                                : !hasSeats
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-brand-blue text-white hover:bg-blue-800'
                                            }`}
                                        >
                                            {isBooked ? (
                                                <>
                                                    <CheckIcon className="h-5 w-5" />
                                                    Booked
                                                </>
                                            ) : !hasSeats ? (
                                                'Full'
                                            ) : (
                                                ride.price > 0 ? `Book ($${ride.price.toFixed(2)})` : 'Book (Free)'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Community Carpools Section */}
            <section>
                <h3 className="text-xl font-bold text-brand-blue mb-4 border-b-2 border-brand-gold pb-2">Community Carpools</h3>
                 {communityRides.length > 0 ? (
                    <div className="space-y-4">
                        {communityRides.map(ride => (
                          <RideCard 
                            key={ride.id} 
                            ride={ride} 
                            onViewRoute={onViewRoute} 
                            currentUser={currentUser} 
                            onStartChat={onStartChat} 
                            chatStatus={rideIdToChatStatus.get(ride.id)}
                          />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed">
                        <p className="text-gray-600">No community carpools posted for this event yet.</p>
                        <p className="text-sm text-gray-500 mt-1">Check back later or post a ride request!</p>
                    </div>
                )}
            </section>
        </div>
      </div>
       <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
