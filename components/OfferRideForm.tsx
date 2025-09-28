
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_EVENTS } from '../../data/mockData';
import { format } from 'date-fns';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import type { NewRideFormData } from '../../types';
import { CheckIcon } from './icons/CheckIcon';

// Extend the Window interface to include the google object for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

interface OfferRideFormProps {
    onPostRide: (formData: NewRideFormData) => void;
}

export const OfferRideForm: React.FC<OfferRideFormProps> = ({ onPostRide }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('08:30');
  const [seats, setSeats] = useState('1');
  const [price, setPrice] = useState('5.00');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [apiLoadFailed, setApiLoadFailed] = useState(false);

  // Handles auto-filling destination/date when an event is selected
  useEffect(() => {
    if (selectedEventId) {
      const event = MOCK_EVENTS.find(e => e.id === selectedEventId);
      if (event) {
        setDestination(event.location);
        setDate(format(event.date, 'yyyy-MM-dd'));
        setTime(format(event.date, 'HH:mm'));
      }
    } else {
        // Clear fields if "Not for an event" is re-selected
        setDestination('');
    }
    // Clear validation errors when event changes
    setErrors({});
  }, [selectedEventId]);

  // Effect for initializing Google Places Autocomplete widgets
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
        types: ['(regions)'], 
        strictBounds: false,
      };
      
      const destinationOptions = {
        bounds: bounds,
        componentRestrictions: { country: "us" },
        fields: ["formatted_address", "name"],
        strictBounds: false,
      };

      const originAutocomplete = new window.google.maps.places.Autocomplete(
        originInputRef.current,
        originOptions
      );

      const destinationAutocomplete = new window.google.maps.places.Autocomplete(
        destinationInputRef.current,
        destinationOptions
      );

      originAutocomplete.addListener('place_changed', () => {
        const place = originAutocomplete.getPlace();
        setOrigin(place.name || '');
         if (errors.origin) clearError('origin');
      });

      destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        setDestination(place.name || place.formatted_address || '');
        if (errors.destination) clearError('destination');
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
            console.error("Google Maps API failed to load for OfferRideForm.");
            setApiLoadFailed(true);
        }
      }, 5000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [errors.origin, errors.destination]); // Rerun if errors are present to re-attach listeners
  
  const clearError = (fieldName: string) => {
    setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!origin.trim()) newErrors.origin = 'Origin is required.';
    if (!destination.trim()) newErrors.destination = 'Destination is required.';
    if (!date) newErrors.date = 'Date is required.';
    if (!time) newErrors.time = 'Time is required.';
    
    if (date && time) {
        const departureDateTime = new Date(`${date}T${time}`);
        // Check if the selected date and time is in the past.
        if (departureDateTime < new Date()) {
            newErrors.date = 'Departure cannot be in the past.';
            newErrors.time = 'Departure cannot be in the past.';
        }
    }

    const numSeats = parseInt(seats, 10);
    if (isNaN(numSeats) || numSeats < 1 || numSeats > 8) {
        newErrors.seats = 'Seats must be between 1 and 8.';
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
        newErrors.price = 'Price must be a valid number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }

    const departureTime = new Date(`${date}T${time}`);
    
    onPostRide({
        origin,
        destination,
        departureTime,
        availableSeats: parseInt(seats, 10),
        price: parseFloat(price),
        eventId: selectedEventId,
    });
    
    // Reset form and show confirmation
    setOrigin('');
    setDestination('');
    setDate('');
    setTime('08:30');
    setSeats('1');
    setPrice('5.00');
    setSelectedEventId('');
    setErrors({});
    
    setShowSuccessMessage(true);
    setTimeout(() => {
        setShowSuccessMessage(false);
    }, 4000);
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-bold text-brand-blue mb-1">Offer a Ride</h3>
      <p className="text-gray-600 mb-6">Help a fellow student and earn some cash. Fill out your route details below.</p>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2" onSubmit={handleSubmit}>
        <div className="md:col-span-2">
          <label htmlFor="offer-event" className="block text-sm font-medium text-gray-700 mb-1">For a Specific Event? (Optional)</label>
          <select
            id="offer-event"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <option value="">Not for an event</option>
            {MOCK_EVENTS.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-2">
          <label htmlFor="offer-origin" className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LocationMarkerIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
                ref={originInputRef}
                type="text" 
                id="offer-origin" 
                value={origin} 
                onChange={e => { setOrigin(e.target.value); if (errors.origin) clearError('origin'); }} 
                placeholder="e.g., Brickell, Miami" 
                className={`block w-full pl-10 pr-3 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 ${errors.origin ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-gold'}`}
                disabled={apiLoadFailed}
            />
          </div>
          {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin}</p>}
        </div>
        <div className="mt-2">
          <label htmlFor="offer-destination" className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LocationMarkerIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
                ref={destinationInputRef}
                type="text" 
                id="offer-destination" 
                value={destination} 
                onChange={e => { setDestination(e.target.value); if (errors.destination) clearError('destination'); }} 
                placeholder="e.g., FIU MMC Campus" 
                className={`block w-full pl-10 pr-3 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 ${errors.destination ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-gold'}`}
                disabled={apiLoadFailed}
            />
          </div>
           {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
        </div>
         <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-2">
            <div>
              <label htmlFor="offer-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                id="offer-date" 
                min={today}
                value={date} 
                onChange={e => { setDate(e.target.value); if (errors.date) clearError('date'); }} 
                className={`block w-full px-3 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-gold'}`} 
              />
               {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label htmlFor="offer-time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input 
                type="time" 
                id="offer-time" 
                value={time} 
                onChange={e => { setTime(e.target.value); if (errors.time || errors.date) { clearError('time'); clearError('date'); } }} 
                className={`block w-full px-3 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 ${errors.time ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-gold'}`} 
              />
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
            <div>
              <label htmlFor="offer-seats" className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
              <input 
                type="number" 
                id="offer-seats" 
                min="1" 
                max="8" 
                value={seats} 
                onChange={e => { setSeats(e.target.value); if (errors.seats) clearError('seats'); }} 
                placeholder="3" 
                className={`block w-full px-3 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 ${errors.seats ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-gold'}`}
              />
              {errors.seats && <p className="text-red-500 text-xs mt-1">{errors.seats}</p>}
            </div>
            <div>
              <label htmlFor="offer-price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input 
                type="number" 
                id="offer-price" 
                min="0" 
                step="0.50" 
                value={price} 
                onChange={e => { setPrice(e.target.value); if (errors.price) clearError('price'); }} 
                placeholder="5.00" 
                className={`block w-full px-3 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-gold'}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
        </div>
        <div className="md:col-span-2 text-right mt-4">
          <button type="submit" className="w-full md:w-auto bg-brand-blue text-white font-bold py-3 px-8 rounded-md hover:bg-blue-800 transition-all duration-300 transform hover:scale-105">
            Post Ride
          </button>
        </div>
      </form>
      {showSuccessMessage && (
        <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-eco-green-light text-green-800 font-semibold rounded-lg text-center transition-opacity duration-300" role="alert">
            <CheckIcon className="h-5 w-5 text-eco-green" />
            <span>Your ride has been posted successfully!</span>
        </div>
      )}
      {apiLoadFailed && (
        <p className="text-center text-yellow-500 text-sm mt-4">
          Address autocomplete is currently unavailable. Please type your full address manually.
        </p>
      )}
    </div>
  );
};
