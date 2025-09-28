
import React, { useEffect, useRef } from 'react';
import { XIcon } from './icons/XIcon';

interface Route {
    origin: string;
    destination: string;
    label: string;
    waypoints?: { location: string; stopover: boolean }[];
}

interface RouteMapModalProps {
  primaryRoute: Route;
  secondaryRoute?: Route;
  title: string;
  onClose: () => void;
}

declare global {
    interface Window {
      google: any;
    }
}

export const RouteMapModal: React.FC<RouteMapModalProps> = ({ primaryRoute, secondaryRoute, title, onClose }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!primaryRoute || !mapRef.current || !window.google || hasInitialized.current) {
            if (!window.google) {
                console.error("Google Maps API is not loaded.");
            }
            return;
        }
        
        hasInitialized.current = true; // Prevent re-initialization

        const map = new window.google.maps.Map(mapRef.current, {
            zoom: 10,
            center: { lat: 25.7617, lng: -80.1918 }, // Default center on Miami
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
        });

        const directionsService = new window.google.maps.DirectionsService();
        
        const primaryRenderer = new window.google.maps.DirectionsRenderer({
            polylineOptions: { strokeColor: '#002D62', strokeWeight: 6, strokeOpacity: 0.8 }
        });
        primaryRenderer.setMap(map);

        const bounds = new window.google.maps.LatLngBounds();

        // Prepare and render Primary Route
        const primaryRequest = {
            origin: primaryRoute.origin,
            destination: primaryRoute.destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
            waypoints: primaryRoute.waypoints || [],
        };

        directionsService.route(
            primaryRequest,
            (result: any, status: any) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    primaryRenderer.setDirections(result);
                    if (result.routes[0]) {
                        bounds.union(result.routes[0].bounds);
                    }
                    if (!secondaryRoute) {
                        map.fitBounds(bounds);
                    }
                } else {
                    console.error(`Primary route request failed due to ${status}`);
                    alert(`Could not display the primary route from ${primaryRoute.origin} to ${primaryRoute.destination}.`);
                }
            }
        );

        // Prepare and render Secondary Route if it exists
        if (secondaryRoute) {
            const secondaryRenderer = new window.google.maps.DirectionsRenderer({
                 polylineOptions: { strokeColor: '#22C55E', strokeWeight: 6, strokeOpacity: 0.9 }
            });
            secondaryRenderer.setMap(map);
            
            const secondaryRequest = {
                origin: secondaryRoute.origin,
                destination: secondaryRoute.destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
                waypoints: secondaryRoute.waypoints || [],
            };

             directionsService.route(
                secondaryRequest,
                (result: any, status: any) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        secondaryRenderer.setDirections(result);
                        if (result.routes[0]) {
                           bounds.union(result.routes[0].bounds);
                        }
                        map.fitBounds(bounds);
                    } else {
                        console.error(`Secondary route request failed due to ${status}`);
                        alert(`Could not display the secondary route from ${secondaryRoute.origin} to ${secondaryRoute.destination}.`);
                    }
                }
            );
        }

    }, [primaryRoute, secondaryRoute]);


    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="route-map-title"
        >
            <div
                className="bg-light-bg rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-95 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
                    <h2 id="route-map-title" className="text-xl font-bold text-brand-blue">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200"
                        aria-label="Close"
                    >
                        <XIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </header>
                <div className="relative w-full h-full flex-grow">
                     <div ref={mapRef} className="w-full h-full" />
                     {secondaryRoute && (
                         <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 space-y-2">
                             <h4 className="font-bold text-sm text-gray-800">Legend</h4>
                             <div className="flex items-center gap-2">
                                 <div className="w-4 h-4 rounded-full bg-[#002D62]"></div>
                                 <span className="text-xs text-gray-700">{primaryRoute.label}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <div className="w-4 h-4 rounded-full bg-[#22C55E]"></div>
                                 <span className="text-xs text-gray-700">{secondaryRoute.label}</span>
                             </div>
                         </div>
                     )}
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