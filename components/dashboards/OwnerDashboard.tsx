import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile, NewRideFormData, RideRequest } from '../../types';
import { MOCK_PROVIDER_TRANSACTIONS } from '../../data/mockData';
import { RideRequestCard } from '../RideRequestCard';
import { OfferRideForm } from '../OfferRideForm';
import { ImpactDashboard } from '../ImpactDashboard';
import { FinancialHubPage } from '../pages/FinancialHubPage';
import { WalletIcon } from '../icons/WalletIcon';
import { generateMockRideRequests } from '../../services/mockGenerator';

interface OwnerDashboardProps {
  user: UserProfile;
  onAddNewRide: (formData: NewRideFormData) => void;
  rideRequests: RideRequest[];
  setRideRequests: React.Dispatch<React.SetStateAction<RideRequest[]>>;
  onOfferRide: (request: RideRequest) => void;
  onSaveProfile: (updatedUser: UserProfile) => void;
}

type OwnerPage = 'DASHBOARD' | 'FINANCIALS';

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user, onAddNewRide, rideRequests, setRideRequests, onOfferRide, onSaveProfile }) => {
  const [currentPage, setCurrentPage] = useState<OwnerPage>('DASHBOARD');

  // Effect to generate initial ride requests. Runs only once.
  useEffect(() => {
    // If the list is empty, populate it with 3 random requests.
    if (rideRequests.length === 0) {
      setRideRequests(generateMockRideRequests(3));
    }
    // The dependency array is empty to ensure this effect runs only once on mount.
  }, []);


  if (currentPage === 'FINANCIALS') {
    return <FinancialHubPage 
      user={user} 
      transactions={MOCK_PROVIDER_TRANSACTIONS} 
      onBack={() => setCurrentPage('DASHBOARD')}
      onSaveProfile={onSaveProfile}
    />;
  }

  const activeRideRequests = rideRequests.filter(req => req.requestDateTime >= new Date());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <OfferRideForm onPostRide={onAddNewRide} />
            <section>
                <h2 className="text-2xl font-bold text-brand-blue mb-4">Active Ride Requests</h2>
                <p className="text-gray-600 mb-4 -mt-2">Students looking for a ride that might match your routes.</p>
                {activeRideRequests.length > 0 ? (
                    <div className="space-y-4">
                        {activeRideRequests.map(request => (
                            <RideRequestCard 
                                key={request.id} 
                                request={request} 
                                currentUser={user} 
                                onOfferRide={onOfferRide}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed">
                        <p className="text-gray-600 font-semibold">
                            No active ride requests at the moment.
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Check back soon, new requests appear frequently!</p>
                    </div>
                )}
            </section>
        </div>
        <aside className="space-y-8">
            <ImpactDashboard />
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
              <div className="flex items-center gap-3">
                <WalletIcon className="h-6 w-6 text-brand-blue" />
                <h3 className="text-xl font-bold text-brand-blue">Financials</h3>
              </div>
              <p className="text-gray-600">View your transaction history, manage payouts, and track your earnings.</p>
              <button 
                onClick={() => setCurrentPage('FINANCIALS')}
                className="w-full bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Open Financial Hub
              </button>
            </div>
        </aside>
    </div>
  );
};