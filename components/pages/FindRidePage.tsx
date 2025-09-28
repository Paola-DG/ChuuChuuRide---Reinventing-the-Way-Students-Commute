
import React, { useState, useEffect, useRef } from 'react';
import type { RideRequestDetails, DayOfWeek } from '../../types';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

// Extend the Window interface for Google Maps API
declare global {
  interface Window {
    google: any;
  }
}

interface FindRidePageProps {
    onFindMatches: (details: RideRequestDetails) => void;
    onBack: () => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const FindRidePage: React.FC<FindRidePageProps> = ({ onFindMatches, onBack }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('FIU Engineering Center, Miami, FL');
  const [type, setType] = useState<'Regular Basis' | 'Event Based'>('Regular Basis');
  
  // State for Regular Basis
  const [days, setDays] = useState<DayOfWeek[]>(['Mon', 'Wed', 'Fri']);
  const [arriveBy, setArriveBy] = useState('10:30');
  const [leaveAt, setLeaveAt] = useState('17:00');

  // State for Event Based
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  
  const [details, setDetails] = useState('');

  // Refs for Google Places Autocomplete
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [apiLoadFailed, setApiLoadFailed] = useState(false);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !originInputRef.current || !destinationInputRef.current) {
        return;
      }
      
      const fiuLatLng = new window.google.maps.LatLng(25.7580, -80.3739);
      const bounds = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(fiuLatLng.lat() - 0.5, fiuLatLng.lng() - 0.5),
          new window.google.maps.LatLng(fiuLatLng.lat() + 0.5, fiuLatLng.lng() + 0.5)
      );

      const originOptions = {
        bounds: bounds,
        componentRestrictions: { country: "us" },
        fields: ["name"],
        types: ['(regions)'], // For zones
        strictBounds: false,
      };
      
      const destinationOptions = {
        bounds: bounds,
        componentRestrictions: { country: "us" },
        fields: ["formatted_address", "name"],
        strictBounds: false,
      };

      const originAutocomplete = new window.google.maps.places.Autocomplete(originInputRef.current, originOptions);
      const destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationInputRef.current, destinationOptions);

      originAutocomplete.addListener('place_changed', () => {
        const place = originAutocomplete.getPlace();
        setOrigin(place.name || '');
      });

      destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        setDestination(place.name || place.formatted_address || '');
      });
    };

    if (window.google && window.google.maps) {
      initAutocomplete();
    } else {
      const intervalId = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(intervalId);
          initAutocomplete();
        }
      }, 500);

      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        if (!window.google || !window.google.maps) {
            console.error("Google Maps API failed to load for FindRidePage.");
            setApiLoadFailed(true);
        }
      }, 5000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  const handleDayToggle = (day: DayOfWeek) => {
    setDays(prevDays => 
      prevDays.includes(day) 
        ? prevDays.filter(d => d !== day) 
        : [...prevDays, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) {
      alert("Please fill out the origin and destination fields.");
      return;
    }
    
    let rideDetails: RideRequestDetails = { origin, destination, type };

    if (type === 'Regular Basis') {
      rideDetails = { ...rideDetails, days, arriveBy, leaveAt, details };
    } else {
      rideDetails = { ...rideDetails, eventName, eventDate, arriveBy, leaveAt, details };
    }
    
    onFindMatches(rideDetails);
  };

  return (
    <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-brand-blue font-semibold mb-4">
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Dashboard
        </button>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold text-brand-blue mb-2">Find a Ride</h1>
          <p className="text-gray-600 mb-8">Post your ride request. Drivers with matching routes will see it.</p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="request-origin" className="block text-sm font-medium text-gray-700 mb-1">From (Your Zone)</label>
                <input 
                  ref={originInputRef} 
                  type="text" 
                  id="request-origin" 
                  value={origin} 
                  onChange={e => setOrigin(e.target.value)} 
                  placeholder="e.g., Brickell, South Beach" 
                  className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  disabled={apiLoadFailed}
                  required
                />
              </div>
              <div>
                <label htmlFor="request-destination" className="block text-sm font-medium text-gray-700 mb-1">To (Campus Building)</label>
                <input 
                  ref={destinationInputRef} 
                  type="text" 
                  id="request-destination" 
                  value={destination} 
                  onChange={e => setDestination(e.target.value)} 
                  placeholder="e.g., FIU Engineering Center" 
                  className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  disabled={apiLoadFailed}
                  required
                />
              </div>
            </div>
            
            {/* Ride Type Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type of Pool</label>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                        <input id="regular-basis" name="pool-type" type="radio" checked={type === 'Regular Basis'} onChange={() => setType('Regular Basis')} className="focus:ring-brand-blue h-4 w-4 text-brand-blue border-gray-300"/>
                        <label htmlFor="regular-basis" className="ml-2 block text-sm text-gray-900">Regular Basis</label>
                    </div>
                     <div className="flex items-center">
                        <input id="event-based" name="pool-type" type="radio" checked={type === 'Event Based'} onChange={() => setType('Event Based')} className="focus:ring-brand-blue h-4 w-4 text-brand-blue border-gray-300"/>
                        <label htmlFor="event-based" className="ml-2 block text-sm text-gray-900">Event Based</label>
                    </div>
                </div>
            </div>

            {/* Conditional Fields */}
            {type === 'Regular Basis' ? (
                <div className="p-4 bg-light-bg rounded-lg border space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Days of the Week</label>
                        <div className="flex gap-1">
                            {DAYS_OF_WEEK.map(day => (
                                <button key={day} type="button" onClick={() => handleDayToggle(day)} className={`w-10 h-10 rounded-full font-semibold text-sm transition-colors ${days.includes(day) ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    {day.charAt(0)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="arrive-by" className="block text-sm font-medium text-gray-700 mb-1">Arrive By</label>
                            <input type="time" id="arrive-by" value={arriveBy} onChange={e => setArriveBy(e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="leave-at" className="block text-sm font-medium text-gray-700 mb-1">Leave At</label>
                            <input type="time" id="leave-at" value={leaveAt} onChange={e => setLeaveAt(e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"/>
                        </div>
                    </div>
                </div>
            ) : (
                 <div className="p-4 bg-light-bg rounded-lg border space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                           <label htmlFor="event-name" className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                           <input type="text" id="event-name" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g., ShellHacks" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"/>
                       </div>
                       <div>
                           <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                           <input type="date" id="event-date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"/>
                       </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="event-arrive" className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                            <input type="time" id="event-arrive" value={arriveBy} onChange={e => setArriveBy(e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="event-leave" className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                            <input type="time" id="event-leave" value={leaveAt} onChange={e => setLeaveAt(e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"/>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Additional Details */}
             <div>
                <label htmlFor="request-details" className="block text-sm font-medium text-gray-700 mb-1">Additional Details (Optional)</label>
                <input type="text" id="request-details" value={details} onChange={e => setDetails(e.target.value)} placeholder="e.g., 'I have a large backpack' or 'Flexible on times'" className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
            </div>

            {/* Submit Button */}
            <div className="text-right">
              <button type="submit" className="w-full md:w-auto bg-eco-green text-white font-bold py-3 px-8 rounded-md hover:bg-green-600 transition-all duration-300">
                Post Request & Find Matches
              </button>
            </div>
          </form>
          {apiLoadFailed && (
            <p className="text-center text-yellow-500 text-sm mt-4">
              Address autocomplete is currently unavailable. Please type your full address manually.
            </p>
          )}
        </div>
    </div>
  );
};
