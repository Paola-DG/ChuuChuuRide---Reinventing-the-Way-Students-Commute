import React from 'react';
import type { Ride, UserProfile, CommuteProvider, BookingStatus } from '../types';
import { format } from 'date-fns';
import { LeafIcon } from './icons/LeafIcon';
import { MoneyIcon } from './icons/MoneyIcon';
import { UsersIcon } from './icons/UsersIcon';
import { MapIcon } from './icons/MapIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { ClockIcon } from './icons/ClockIcon';

interface RideCardProps {
  ride: Ride;
  onViewRoute: (ride: Ride) => void;
  onStartChat: (provider: CommuteProvider) => void;
  currentUser: UserProfile;
  chatStatus?: BookingStatus;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, onViewRoute, onStartChat, currentUser, chatStatus }) => {
  const isOwnRide = ride.driver.id === currentUser.id;

  const findCommonClasses = (): string[] => {
    if (!currentUser.classSchedule || !ride.driver.classSchedule) {
      return [];
    }
    const pooleeCourses = new Set(currentUser.classSchedule.map(c => c.courseCode));
    const commonCourses = ride.driver.classSchedule
      .filter(driverClass => pooleeCourses.has(driverClass.courseCode))
      .map(commonClass => commonClass.courseCode);
    return commonCourses;
  };

  const handleRequestRide = () => {
    // Construct a CommuteProvider from the Ride object to initiate a chat
    const provider: CommuteProvider = {
        id: `prov_from_ride_${ride.id}`,
        user: ride.driver,
        routeOverlapPercentage: 100, // It's a direct match from a posted ride
        estimatedCost: ride.price,
        routeOrigin: ride.origin,
        routeDestination: ride.destination,
        // Estimate duration based on distance (e.g., 2 mins per mile)
        driverOriginalDurationMinutes: Math.round(ride.distanceMiles * 2),
        driverCombinedDurationMinutes: Math.round(ride.distanceMiles * 2), // No detour for a direct ride
    };
    onStartChat(provider);
  };

  const commonClasses = findCommonClasses();

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Driver Info */}
        <div className="flex-shrink-0 flex flex-col items-center sm:w-24">
          <img src={ride.driver.avatarUrl} alt={ride.driver.name} className="w-16 h-16 rounded-full border-2 border-gray-200" />
          <span className="mt-2 text-center text-sm font-semibold text-gray-800">{ride.driver.name}</span>
          <span className="text-xs text-gray-500">{ride.driver.preferences.chattiness}</span>
          {commonClasses.length > 0 && (
            <div className="mt-1 text-center">
              <div className="flex items-center gap-1 text-xs text-brand-blue font-semibold">
                <AcademicCapIcon className="h-4 w-4" />
                <span>Shares Class</span>
              </div>
              <p className="text-xs text-gray-600">{commonClasses.join(', ')}</p>
            </div>
          )}
        </div>
        
        {/* Ride Details */}
        <div className="flex-grow border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg text-brand-blue">{ride.origin} &rarr; {ride.destination}</p>
              <p className="text-gray-600 text-sm">
                {format(ride.departureTime, "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-eco-green">${ride.price.toFixed(2)}</p>
              <p className="text-xs text-gray-500">per seat</p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <UsersIcon className="text-brand-blue"/>
              <span>{ride.availableSeats} seat{ride.availableSeats > 1 ? 's' : ''} left</span>
            </div>
             <div className="flex items-center gap-2 text-eco-green font-medium">
              <LeafIcon />
              <span>{ride.co2SavedKg} kg CO₂ saved</span>
            </div>
             <div className="flex items-center gap-2">
              <MoneyIcon className="text-brand-gold"/>
              <span>vs. {ride.uberEstimate} Uber</span>
            </div>
          </div>

        </div>
      </div>
      <div className="mt-4 flex justify-end items-center gap-3">
          <button 
            onClick={() => onViewRoute(ride)}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
              <MapIcon className="h-5 w-5" />
              View Route
          </button>
          {isOwnRide ? (
            <button
              disabled
              className="bg-gray-300 text-gray-500 font-bold py-2 px-6 rounded-lg cursor-not-allowed"
            >
              Your Publication
            </button>
          ) : chatStatus && ['Tentative', 'UserConfirmed', 'ProviderConfirmed'].includes(chatStatus) ? (
            <button
              disabled
              className="bg-yellow-100 text-yellow-800 font-bold py-2 px-6 rounded-lg cursor-wait flex items-center justify-center gap-2"
            >
              <ClockIcon className="h-5 w-5" />
              Request Pending
            </button>
          ) : (
            <button 
              onClick={handleRequestRide}
              className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Request Ride
            </button>
          )}
      </div>
    </div>
  );
};