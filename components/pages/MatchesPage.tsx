import React, { useState, useEffect } from 'react';
import type { CommuteProvider, RideRequestDetails, UserProfile } from '../../types';
import { generateMockProviders } from '../../services/mockGenerator';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { MatchCard } from '../MatchCard';
import { RouteMapModal } from '../RouteMapModal';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ClockIcon } from '../icons/ClockIcon';

interface MatchesPageProps {
    requestDetails: RideRequestDetails;
    currentUser: UserProfile;
    onStartChat: (provider: CommuteProvider) => void;
    onBack: () => void;
}

// Define the shape of the props for the RouteMapModal
type RouteModalProps = {
    primaryRoute: {
        origin: string;
        destination: string;
        label: string;
        waypoints?: { location: string; stopover: boolean }[];
    };
    secondaryRoute?: {
        origin: string;
        destination: string;
        label: string;
        waypoints?: { location: string; stopover: boolean }[];
    };
    title: string;
};

const formatTime = (time: string) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
};

const RequestSummary: React.FC<{ details: RideRequestDetails }> = ({ details }) => (
    <div className="mb-8 p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-lg">
        <h2 className="text-lg font-bold text-brand-blue mb-3">Your Ride Request</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
                <LocationMarkerIcon className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-gray-800">From:</p>
                    <p className="text-gray-600">{details.origin}</p>
                </div>
            </div>
             <div className="flex items-start gap-3">
                <LocationMarkerIcon className="h-5 w-5 text-eco-green flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-gray-800">To:</p>
                    <p className="text-gray-600">{details.destination}</p>
                </div>
            </div>
            {details.type === 'Regular Basis' && details.days && (
                <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-gray-800">Days:</p>
                        <p className="text-gray-600">{details.days.join(', ')}</p>
                    </div>
                </div>
            )}
             {details.type === 'Event Based' && (
                <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-gray-800">{details.eventName || 'Event'}:</p>
                        <p className="text-gray-600">{details.eventDate || 'N/A'}</p>
                    </div>
                </div>
             )}
             <div className="flex items-start gap-3">
                <ClockIcon className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-gray-800">Schedule:</p>
                    <p className="text-gray-600">Arrive by {formatTime(details.arriveBy || '')}, Leave at {formatTime(details.leaveAt || '')}</p>
                </div>
            </div>
        </div>
    </div>
);


export const MatchesPage: React.FC<MatchesPageProps> = ({ requestDetails, currentUser, onStartChat, onBack }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [matchedProviders, setMatchedProviders] = useState<CommuteProvider[]>([]);
    const [routeModalProps, setRouteModalProps] = useState<RouteModalProps | null>(null);

    useEffect(() => {
        setIsLoading(true);
        // Generate new providers based on the user's request details to simulate a real search.
        const { providers: newProviders } = generateMockProviders(3, requestDetails, currentUser);
        
        const timer = setTimeout(() => {
            setMatchedProviders(newProviders);
            setIsLoading(false);
        }, 2000); // Simulate loading to make it feel like an algorithm is running

        return () => clearTimeout(timer);
    }, [requestDetails, currentUser]); // Depend on requestDetails to re-run on new search

    const handleViewRoute = (provider: CommuteProvider) => {
        setRouteModalProps({
            title: "Route Comparison",
            primaryRoute: {
                origin: provider.routeOrigin,
                destination: provider.routeDestination,
                label: `${provider.user.name}'s Route`,
            },
            secondaryRoute: {
                origin: requestDetails.origin,
                destination: requestDetails.destination,
                label: 'Your Requested Route',
            },
        });
    };

    const handleViewCombinedRoute = (provider: CommuteProvider) => {
        setRouteModalProps({
            title: "Combined Route with Pickup",
            primaryRoute: {
                origin: provider.routeOrigin,
                destination: provider.routeDestination,
                label: `${provider.user.name}'s New Route`,
                waypoints: [
                    { location: requestDetails.origin, stopover: true },
                    { location: requestDetails.destination, stopover: true },
                ],
            },
            secondaryRoute: {
                origin: requestDetails.origin,
                destination: requestDetails.destination,
                label: 'Your Requested Route',
            },
        });
    };

    const handleCloseRouteModal = () => {
        setRouteModalProps(null);
    };


    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-96">
                <svg className="animate-spin h-12 w-12 text-brand-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h3 className="text-2xl font-bold text-brand-blue">Finding Your Best Matches...</h3>
                <p className="text-gray-600 mt-2">Our smart algorithm is analyzing the best routes for you.</p>
            </div>
        );
    }
    
    return (
        <>
            <div className="max-w-4xl mx-auto">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-brand-blue font-semibold mb-4">
                    <ArrowLeftIcon className="h-5 w-5" />
                    Back to Ride Details
                </button>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                    <div className="mb-8 flex justify-between items-end flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-brand-blue">Here are your best matches!</h1>
                            <p className="text-gray-600 mt-2">We found drivers with similar routes.</p>
                        </div>
                    </div>
                    
                    <RequestSummary details={requestDetails} />

                    <div className="space-y-4">
                        {matchedProviders.map(provider => (
                            <MatchCard 
                                key={provider.id} 
                                provider={provider} 
                                currentUser={currentUser}
                                onStartChat={() => onStartChat(provider)} 
                                onViewRoute={() => handleViewRoute(provider)}
                                onViewCombinedRoute={() => handleViewCombinedRoute(provider)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            {routeModalProps && (
                <RouteMapModal 
                    onClose={handleCloseRouteModal}
                    title={routeModalProps.title}
                    primaryRoute={routeModalProps.primaryRoute}
                    secondaryRoute={routeModalProps.secondaryRoute}
                />
            )}
        </>
    );
};