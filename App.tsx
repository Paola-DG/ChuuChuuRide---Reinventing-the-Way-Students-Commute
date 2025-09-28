
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { AIAgentChat } from './components/AIAgentChat';
import { Footer } from './components/Footer';
import type { UserProfile, UserRole, CommuteProvider, ChatSession, Ride, NewRideFormData, RideRequest, RideRequestDetails, ClassScheduleEntry } from './types';
import { BotIcon } from './components/icons/BotIcon';
import { useAuth } from './hooks/useAuth';
import { PooleeDashboard } from './components/dashboards/PooleeDashboard';
import { OwnerDashboard } from './components/dashboards/OwnerDashboard';
import { OrganizationDashboard } from './components/dashboards/OrganizationDashboard';
import { ProfileModal } from './components/ProfileModal';
import { MOCK_CHAT_SESSIONS, MOCK_RIDES, MOCK_RIDE_REQUESTS } from './data/mockData';
import { ChatsPage } from './components/pages/ChatsPage';
import { calculateCO2Saved, calculateRidePrice, calculateUberEstimate } from './services/rideCalculations';

const App: React.FC = () => {
  const { isAuthenticated, isAuthenticating, user: authUser, login, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  
  // --- Page and Data Management State ---
  const [view, setView] = useState<'dashboard' | 'chats'>('dashboard');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(MOCK_CHAT_SESSIONS);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [rides, setRides] = useState<Ride[]>(MOCK_RIDES);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>(MOCK_RIDE_REQUESTS);

  useEffect(() => {
    if (authUser) {
      if (!currentUser || currentUser.id !== authUser.id) {
        setCurrentUser(authUser);
      }
    } else {
      setCurrentUser(null);
    }
  }, [authUser, currentUser]);

  const handleRoleChange = (newRole: UserRole) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      if (newRole === 'Organization') {
        updatedUser.name = 'FIU Student Affairs';
        updatedUser.email = 'sga@fiu.edu';
      } else if (newRole === 'Poolee' || newRole === 'Owner') {
        updatedUser.name = authUser?.name || 'Alex Panther';
        updatedUser.email = authUser?.email || 'alex.panther@fiu.edu';
      }
      setCurrentUser(updatedUser);
      setView('dashboard'); // Go back to dashboard on role change
    }
  };
  
  const handleAddNewRide = (formData: NewRideFormData) => {
    if (!currentUser) return;

    const distanceMiles = parseFloat((Math.random() * (25 - 5) + 5).toFixed(1));
    const price = formData.price > 0 ? formData.price : calculateRidePrice(distanceMiles, formData.departureTime);
    
    const newRide: Ride = {
        id: `ride_${Date.now()}`,
        driver: currentUser,
        origin: formData.origin,
        destination: formData.destination,
        departureTime: formData.departureTime,
        availableSeats: formData.availableSeats,
        price,
        co2SavedKg: calculateCO2Saved(distanceMiles),
        distanceMiles: distanceMiles,
        uberEstimate: calculateUberEstimate(distanceMiles, formData.departureTime, formData.origin, formData.destination),
        eventId: formData.eventId || undefined,
    };
    
    setRides(prevRides => [newRide, ...prevRides]);
  };

  const handleAddRides = (newRides: Ride[]) => {
      setRides(prevRides => [...prevRides, ...newRides]);
  };

  const handleAddNewRideRequest = (requestData: RideRequestDetails) => {
      if (!currentUser) return;

      let detailsString = requestData.details || '';
      if (requestData.type === 'Regular Basis') {
          const days = requestData.days?.join(', ') || 'selected days';
          detailsString = `Needed on ${days}. Arrive by ${requestData.arriveBy}, leave at ${requestData.leaveAt}. ${detailsString}`;
      } else {
          const eventInfo = requestData.eventName ? `for ${requestData.eventName}` : 'for an event';
          detailsString = `Ride needed ${eventInfo}. Arrive by ${requestData.arriveBy}, leave at ${requestData.leaveAt}. ${detailsString}`;
      }

      let requestDateTime: Date;
      const now = new Date();

      if (requestData.type === 'Event Based' && requestData.eventDate) {
        const timePart = requestData.arriveBy || '00:00';
        requestDateTime = new Date(`${requestData.eventDate}T${timePart}`);
      } else {
        requestDateTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      const newRequest: RideRequest = {
          id: `req_${Date.now()}`,
          poolee: currentUser,
          origin: requestData.origin,
          destination: requestData.destination,
          type: requestData.type,
          details: detailsString.trim(),
          requestDateTime,
      };

      setRideRequests(prevRequests => [newRequest, ...prevRequests]);
  };

  const handleSaveProfile = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setIsProfileModalOpen(false);
  };

  const handleScheduleUpdate = (newSchedule: ClassScheduleEntry[]) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, classSchedule: newSchedule });
    }
  };

  const handleStartChat = (provider: CommuteProvider) => {
    if (!currentUser || currentUser.role !== 'Poolee') return;
    const poolee = currentUser;

    const existingSession = chatSessions.find(session => session.provider.user.id === provider.user.id && session.poolee.id === poolee.id);

    if (existingSession) {
      setActiveChatSessionId(existingSession.id);
    } else {
      const newSession: ChatSession = {
        id: `chat_${provider.user.id}_${poolee.id}`,
        provider: provider,
        poolee: poolee,
        messages: [],
        status: 'Tentative',
      };
      setChatSessions(prev => [newSession, ...prev]);
      setActiveChatSessionId(newSession.id);
    }
    setView('chats');
  };
  
  // NEW HANDLER for AI to create a ride request
  const handleAICreateRideRequest = (args: { origin: string; destination: string; details: string; }) => {
    if (!currentUser) return;
    
    const newRequestDetails: RideRequestDetails = {
      origin: args.origin,
      destination: args.destination,
      type: 'Regular Basis', // Defaulting, as AI doesn't specify type yet
      details: args.details,
    };
    handleAddNewRideRequest(newRequestDetails);
    // In a real app, a success toast/notification would be shown here.
  };

  // NEW HANDLER for AI to initiate a chat
  const handleAIChatInitiation = (ride: Ride) => {
    if (!currentUser) return;
    
    // Construct a CommuteProvider from the Ride to use the existing chat system
    const provider: CommuteProvider = {
        id: `prov_from_ride_${ride.id}`,
        user: ride.driver,
        routeOverlapPercentage: 100, // AI found a direct match
        estimatedCost: ride.price,
        routeOrigin: ride.origin,
        routeDestination: ride.destination,
        driverOriginalDurationMinutes: Math.round(ride.distanceMiles * 2.2), // Simple estimation
        driverCombinedDurationMinutes: Math.round(ride.distanceMiles * 2.2),
    };
    
    handleStartChat(provider);
    setIsChatOpen(false); // Close AI chat and switch to main chat view
  };


  const handleOfferRide = (request: RideRequest) => {
      if (!currentUser || currentUser.role !== 'Owner') return;
      const driver = currentUser;
      const poolee = request.poolee;

      const providerForChat: CommuteProvider = {
          id: `prov_offer_${driver.id}_${poolee.id}`,
          user: driver,
          routeOrigin: request.origin,
          routeDestination: request.destination,
          estimatedCost: calculateRidePrice(10), // Mocked distance
          routeOverlapPercentage: 100,
          driverOriginalDurationMinutes: 25,
          driverCombinedDurationMinutes: 25,
      };

      const existingSession = chatSessions.find(s => s.provider.user.id === driver.id && s.poolee.id === poolee.id);
      
      if (existingSession) {
          setActiveChatSessionId(existingSession.id);
      } else {
          const newSession: ChatSession = {
              id: `chat_${driver.id}_${poolee.id}`,
              provider: providerForChat,
              poolee: poolee,
              messages: [{
                  id: `msg_auto_${Date.now()}`,
                  senderId: driver.id,
                  text: `Hi ${poolee.name}, I saw your ride request and can give you a ride from ${request.origin}.`,
                  timestamp: new Date(),
              }],
              status: 'Tentative',
          };
          setChatSessions(prev => [newSession, ...prev]);
          setActiveChatSessionId(newSession.id);
      }
      setView('chats');
  };

  const handleBookOrganizationRide = (ride: Ride) => {
    if (!currentUser || currentUser.role !== 'Poolee') return;

    // Check if a session for this ride already exists to prevent double booking.
    const alreadyBooked = chatSessions.some(
      session => session.provider.id === `prov_org_${ride.id}` && session.poolee.id === currentUser.id
    );

    if (alreadyBooked) {
      console.warn("User has already booked this ride.");
      return;
    }
    
    if (ride.availableSeats <= 0) {
      console.warn("No available seats to book.");
      return;
    }

    const providerForChat: CommuteProvider = {
      id: `prov_org_${ride.id}`,
      user: ride.driver, // The organization profile
      routeOrigin: ride.origin,
      routeDestination: ride.destination,
      estimatedCost: ride.price,
      // FIX: Added missing 'routeOverlapPercentage' property to conform to the CommuteProvider type. Since this is for booking a specific organization ride, it's considered a 100% match.
      routeOverlapPercentage: 100,
      // Simple estimation for duration
      driverOriginalDurationMinutes: Math.round(ride.distanceMiles * 2.2),
      driverCombinedDurationMinutes: Math.round(ride.distanceMiles * 2.2),
    };

    const newSession: ChatSession = {
      id: `chat_org_${ride.id}_${currentUser.id}`,
      provider: providerForChat,
      poolee: currentUser,
      messages: [{
        id: `msg_auto_${Date.now()}`,
        senderId: 'system',
        text: `Your seat on the bus to ${ride.destination} is confirmed.`,
        timestamp: new Date(),
        isSystemMessage: true,
      }],
      status: 'Confirmed', // Organization rides are auto-confirmed
    };

    setChatSessions(prev => [newSession, ...prev]);

    // Decrement available seats for the ride
    setRides(prevRides => prevRides.map(r => 
      r.id === ride.id ? { ...r, availableSeats: r.availableSeats - 1 } : r
    ));
  };
  
  const handleViewChats = () => {
    if (!activeChatSessionId && chatSessions.length > 0) {
      setActiveChatSessionId(chatSessions[0].id);
    }
    setView('chats');
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginScreen onLogin={login} isAuthenticating={isAuthenticating} />;
  }

  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'Owner':
        return <OwnerDashboard 
          user={currentUser} 
          onAddNewRide={handleAddNewRide} 
          rideRequests={rideRequests} 
          onSaveProfile={handleSaveProfile}
          onOfferRide={handleOfferRide}
          setRideRequests={setRideRequests}
        />;
      case 'Organization':
        return <OrganizationDashboard user={currentUser} rides={rides} />;
      case 'Poolee':
      default:
        return <PooleeDashboard 
          user={currentUser} 
          onStartChat={handleStartChat} 
          rides={rides} 
          onAddNewRideRequest={handleAddNewRideRequest}
          rideRequests={rideRequests}
          onScheduleUpdate={handleScheduleUpdate}
          chatSessions={chatSessions}
          onAddRides={handleAddRides}
          onSaveProfile={handleSaveProfile}
          onBookOrganizationRide={handleBookOrganizationRide}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-dark-text font-sans">
      <Header 
        user={currentUser} 
        onLogout={logout} 
        onRoleChange={handleRoleChange}
        onProfileClick={() => setIsProfileModalOpen(true)} 
        onViewChats={handleViewChats}
        onGoHome={() => setView('dashboard')}
      />
      <main className="container mx-auto px-4 py-8">
        {view === 'dashboard' && renderDashboard()}
        {view === 'chats' && (
           <ChatsPage 
              user={currentUser}
              sessions={chatSessions}
              activeSessionId={activeChatSessionId}
              onSelectSession={setActiveChatSessionId}
              setSessions={setChatSessions}
           />
        )}
      </main>
      
      <div className="fixed bottom-6 right-6 z-40">
          <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="bg-brand-blue text-white p-4 rounded-full shadow-lg hover:bg-blue-800 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-opacity-50"
              aria-label="Open AI Assistant"
          >
              <BotIcon />
          </button>
      </div>
      
      {isChatOpen && <AIAgentChat 
        onClose={() => setIsChatOpen(false)}
        onInitiateChat={handleAIChatInitiation}
        onCreateRideRequest={handleAICreateRideRequest}
        availableRides={rides}
        currentUser={currentUser}
      />}

      {isProfileModalOpen && currentUser && (
        <ProfileModal 
          user={currentUser} 
          onClose={() => setIsProfileModalOpen(false)} 
          onSave={handleSaveProfile} 
        />
      )}
      
      <Footer />
    </div>
  );
};

export default App;
