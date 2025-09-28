
import React, { useState, useRef, useEffect } from 'react';
import { RideCard } from '../RideCard';
import { EventCard } from '../EventCard';
import { ImpactDashboard } from '../ImpactDashboard';
import { MOCK_EVENTS, MOCK_PASSENGER_TRANSACTIONS } from '../../data/mockData';
import type { UserProfile, AcademicEvent, RideRequestDetails, CommuteProvider, Ride, RideRequest, ClassScheduleEntry, ChatSession, BookingStatus } from '../../types';
import { ClassSchedule } from '../ClassSchedule';
import { EventRidesModal } from '../EventRidesModal';
import { PostRequestCard } from '../PostRequestCard';
import { FindRidePage } from '../pages/FindRidePage';
import { MatchesPage } from '../pages/MatchesPage';
import { FinancialHubPage } from '../pages/FinancialHubPage';
import { WalletIcon } from '../icons/WalletIcon';
import { RouteMapModal } from '../RouteMapModal';
import { RideRequestCard } from '../RideRequestCard';
import { ActiveRideCard } from '../ActiveRideCard';
import { generateMockRides } from '../../services/mockGenerator';

interface PooleeDashboardProps {
  user: UserProfile;
  onStartChat: (provider: CommuteProvider) => void;
  rides: Ride[];
  rideRequests: RideRequest[];
  onAddNewRideRequest: (details: RideRequestDetails) => void;
  onScheduleUpdate: (newSchedule: ClassScheduleEntry[]) => void;
  chatSessions: ChatSession[];
  onAddRides: (newRides: Ride[]) => void;
  onSaveProfile: (updatedUser: UserProfile) => void;
  onBookOrganizationRide: (ride: Ride) => void;
}

type PooleePage = 'DASHBOARD' | 'FIND_RIDE' | 'MATCHES' | 'FINANCIALS';

export const PooleeDashboard: React.FC<PooleeDashboardProps> = ({ user, onStartChat, rides, rideRequests, onAddNewRideRequest, onScheduleUpdate, chatSessions, onAddRides, onSaveProfile, onBookOrganizationRide }) => {
  const [currentPage, setCurrentPage] = useState<PooleePage>('DASHBOARD');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [selectedRideForMap, setSelectedRideForMap] = useState<Ride | null>(null);
  const requestsSectionRef = useRef<HTMLElement>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  // Filter for user's requests and exclude any that are more than 3 days old.
  const myRequests = rideRequests
    .filter(req => req.poolee.id === user.id)
    .filter(req => req.requestDateTime >= threeDaysAgo);

  const activeRequests = myRequests.filter(req => req.requestDateTime >= now);
  const pastRequests = myRequests.filter(req => req.requestDateTime < now);
  const confirmedRides = chatSessions.filter(session => session.status === 'Confirmed');

  // Create a map of ride IDs to their chat status for quick lookup and filtering
  const rideIdToChatStatus = new Map<string, BookingStatus>();
  chatSessions.forEach(session => {
    const rideIdPrefix = 'prov_from_ride_';
    if (session.provider.id.startsWith(rideIdPrefix)) {
      const rideId = session.provider.id.substring(rideIdPrefix.length);
      rideIdToChatStatus.set(rideId, session.status);
    }
  });

  // Filter out rides that are already in a terminal state (Confirmed or Cancelled)
  const availableRides = rides.filter(ride => {
    const status = rideIdToChatStatus.get(ride.id);
    return !ride.eventId && ride.driver.role !== 'Organization' && (!status || !['Confirmed', 'Cancelled'].includes(status));
  });
  
  // Effect for initial population of 7 rides. Runs only once.
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      const newRides = generateMockRides(7, user);
      onAddRides(newRides);
      setHasInitiallyLoaded(true);
    }
  }, [hasInitiallyLoaded, onAddRides, user]);


  // State to pass between pages
  const [rideRequestDetails, setRideRequestDetails] = useState<RideRequestDetails | null>(null);

  const handleViewEventRides = (event: AcademicEvent) => {
    setSelectedEvent(event);
  };
  
  const handleViewRequests = () => {
    requestsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCloseEventModal = () => {
    setSelectedEvent(null);
  };

  const handleViewRoute = (ride: Ride) => {
    setSelectedRideForMap(ride);
  };

  const handleCloseRouteModal = () => {
    setSelectedRideForMap(null);
  };

  const handleFindMatches = (details: RideRequestDetails) => {
    onAddNewRideRequest(details);
    setRideRequestDetails(details);
    setCurrentPage('MATCHES');
  };

  const handleSelectProvider = (provider: CommuteProvider) => {
    onStartChat(provider);
  };

  if (currentPage === 'FIND_RIDE') {
    return <FindRidePage 
      onFindMatches={handleFindMatches} 
      onBack={() => setCurrentPage('DASHBOARD')} 
    />;
  }

  if (currentPage === 'MATCHES' && rideRequestDetails) {
    return <MatchesPage 
      requestDetails={rideRequestDetails} 
      onStartChat={handleSelectProvider}
      onBack={() => setCurrentPage('FIND_RIDE')}
      currentUser={user}
    />;
  }
    
  if (currentPage === 'FINANCIALS') {
      return <FinancialHubPage
          user={user}
          transactions={MOCK_PASSENGER_TRANSACTIONS}
          onBack={() => setCurrentPage('DASHBOARD')}
          onSaveProfile={onSaveProfile}
      />;
  }


  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          <PostRequestCard onClick={() => setCurrentPage('FIND_RIDE')} onViewRequests={handleViewRequests} />

          {confirmedRides.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-brand-blue mb-4">Your Active Rides</h2>
              <div className="space-y-4">
                {confirmedRides.map(session => (
                  <ActiveRideCard 
                    key={session.id} 
                    provider={session.provider} 
                    onContactDriver={onStartChat}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold text-brand-blue mb-4">Available Rides</h2>
            {availableRides.length > 0 ? (
                <div className="space-y-4">
                  {availableRides.map(ride => (
                    <RideCard 
                      key={ride.id} 
                      ride={ride} 
                      onViewRoute={handleViewRoute} 
                      currentUser={user} 
                      onStartChat={onStartChat} 
                      chatStatus={rideIdToChatStatus.get(ride.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed">
                    <p className="text-gray-600 font-semibold">
                        ...we're sorry for the inconvenience, but there are not ChuuChuuDrivers available at the moment, please wait patiently or post a request.
                    </p>
                </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-blue mb-4">Rides for Academic Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_EVENTS.map(event => {
                 const eventRides = rides.filter(ride => ride.eventId === event.id);
                 const privateOwnerCount = eventRides.filter(ride => ride.driver.role === 'Owner').length;
                 const organizationBusCount = eventRides.filter(ride => ride.driver.role === 'Organization').length;

                 return (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onViewRides={handleViewEventRides}
                      privateOwnerCount={privateOwnerCount}
                      organizationBusCount={organizationBusCount}
                    />
                 );
              })}
            </div>
          </section>

          {activeRequests.length > 0 && (
            <section ref={requestsSectionRef}>
              <h2 className="text-2xl font-bold text-brand-blue mb-4">Your Active Requests</h2>
              <div className="space-y-4">
                {activeRequests.map(request => (
                  <RideRequestCard key={request.id} request={request} currentUser={user} />
                ))}
              </div>
            </section>
          )}

          {pastRequests.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-500 mb-4">Your Past Requests</h2>
              <p className="text-gray-500 -mt-3 mb-4 text-sm">These requests have expired and will be removed after 3 days.</p>
              <div className="space-y-4 opacity-70">
                {pastRequests.map(request => (
                  <RideRequestCard key={request.id} request={request} currentUser={user} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Column */}
        <aside className="space-y-8">
          <ImpactDashboard />
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
            <div className="flex items-center gap-3">
              <WalletIcon className="h-6 w-6 text-brand-blue" />
              <h3 className="text-xl font-bold text-brand-blue">Financials</h3>
            </div>
            <p className="text-gray-600">View your transaction history, manage payments, and track your spending.</p>
            <button 
              onClick={() => setCurrentPage('FINANCIALS')}
              className="w-full bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Open Financial Hub
            </button>
          </div>
          {user.classSchedule && <ClassSchedule schedule={user.classSchedule} onScheduleUpdate={onScheduleUpdate} />}
        </aside>
      </div>
      {selectedEvent && (
        <EventRidesModal 
          event={selectedEvent} 
          rides={rides}
          onClose={handleCloseEventModal} 
          onViewRoute={handleViewRoute}
          currentUser={user}
          onStartChat={onStartChat}
          chatSessions={chatSessions}
          onBookOrganizationRide={onBookOrganizationRide}
        />
      )}
      {selectedRideForMap && (
        <RouteMapModal 
          onClose={handleCloseRouteModal}
          primaryRoute={{
            origin: selectedRideForMap.origin,
            destination: selectedRideForMap.destination,
            label: `${selectedRideForMap.driver.name}'s Route`
          }}
          title={`${selectedRideForMap.driver.name}'s Route`}
        />
      )}
    </>
  );
};
