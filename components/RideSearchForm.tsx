
import React, { useEffect, useRef, useState } from 'react';

// Extend the Window interface to include the google object for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

export const RideSearchForm: React.FC = () => {
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [apiLoadFailed, setApiLoadFailed] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // Effect for initializing autocomplete widgets once the API is loaded
  useEffect(() => {
    const initAutocomplete = () => {
      if (!originInputRef.current || !destinationInputRef.current) {
        return;
      }

      // Options to bias search results to the US and return specific fields
      const options = {
        componentRestrictions: { country: "us" },
        fields: ["address_components", "geometry", "icon", "name", "formatted_address"],
      };

      const originAutocomplete = new window.google.maps.places.Autocomplete(
        originInputRef.current,
        options
      );
      const destinationAutocomplete = new window.google.maps.places.Autocomplete(
        destinationInputRef.current,
        options
      );

      originAutocomplete.addListener('place_changed', () => {
        const place = originAutocomplete.getPlace();
        setOrigin(place.formatted_address || place.name || '');
      });

      destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        setDestination(place.formatted_address || place.name || '');
      });
    };

    if (window.google && window.google.maps) {
      initAutocomplete();
    } else {
      // Poll for the google object in case the script is still loading
      const intervalId = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(intervalId);
          initAutocomplete();
        }
      }, 500);

      // Set a timeout to consider the API load failed
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        if (!window.google || !window.google.maps) {
            console.error("Google Maps API failed to load.");
            setApiLoadFailed(true);
        }
      }, 5000); // 5 seconds timeout

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, []);


  return (
    <div className="bg-gradient-to-br from-brand-blue to-blue-800 p-6 rounded-xl shadow-xl">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">Find your next ride</h3>
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end" onSubmit={(e) => e.preventDefault()}>
        <div className="lg:col-span-2">
          <label htmlFor="origin" className="block text-sm font-medium text-gray-200 mb-1">From</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              ref={originInputRef}
              type="text"
              id="origin"
              placeholder="e.g., Brickell, Miami"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-blue-900/50 border border-blue-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              disabled={apiLoadFailed}
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-200 mb-1">To</label>
           <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              ref={destinationInputRef}
              type="text"
              id="destination"
              placeholder="e.g., FIU MMC Campus"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-blue-900/50 border border-blue-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              disabled={apiLoadFailed}
            />
          </div>
        </div>
        <div className="lg:col-span-1">
          <button type="submit" className="w-full bg-brand-gold text-brand-blue font-bold py-3 px-4 rounded-md hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105">
            Search
          </button>
        </div>
      </form>
       {apiLoadFailed && (
        <p className="text-center text-yellow-300 text-sm mt-4">
          Address autocomplete is currently unavailable. Please type your full address manually.
        </p>
      )}
    </div>
  );
};