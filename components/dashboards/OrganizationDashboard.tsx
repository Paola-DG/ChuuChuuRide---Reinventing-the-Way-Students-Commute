
import React, { useState } from 'react';
import type { UserProfile, AcademicEvent, Ride } from '../../types';
import { ImpactDashboard } from '../ImpactDashboard';
import { EventCard } from '../EventCard';
import { MOCK_EVENTS } from '../../data/mockData';
import { EventRidesModal } from '../EventRidesModal';

interface OrganizationDashboardProps {
  user: UserProfile;
  rides: Ride[];
}

export const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({ user, rides }) => {
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [mileage, setMileage] = useState('');
  const [gasCost, setGasCost] = useState('');
  const [gallons, setGallons] = useState('');

  const handleViewEventRides = (event: AcademicEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleGasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Gas info submitted:\nMileage: ${mileage} MPG\nCost: $${gasCost}\nGallons: ${gallons}`);
    setMileage('');
    setGasCost('');
    setGallons('');
  };

  return (
    <>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-brand-blue mb-2">Welcome, {user.name}</h2>
          <p className="text-gray-600">Here's an overview of carpooling activity and events at your organization.</p>
          <div className="mt-6 flex flex-wrap gap-4">
              <button className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors">
                  Create New Event
              </button>
              <button className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                  View Full Analytics
              </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-brand-blue mb-1">Track Your Gas Usage</h3>
            <p className="text-gray-600 mb-6">Help us calculate your savings and environmental impact by logging your gas purchases.</p>
            <form onSubmit={handleGasSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">Car's Gas Mileage (MPG)</label>
                    <input
                        type="number"
                        id="mileage"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                        placeholder="e.g., 25"
                        required
                        min="1"
                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                </div>
                <div>
                    <label htmlFor="gas-cost" className="block text-sm font-medium text-gray-700 mb-1">Total Gas Cost ($)</label>
                    <input
                        type="number"
                        id="gas-cost"
                        value={gasCost}
                        onChange={(e) => setGasCost(e.target.value)}
                        placeholder="e.g., 45.50"
                        step="0.01"
                        min="0"
                        required
                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                </div>
                <div>
                    <label htmlFor="gallons" className="block text-sm font-medium text-gray-700 mb-1">Gallons Filled</label>
                    <input
                        type="number"
                        id="gallons"
                        value={gallons}
                        onChange={(e) => setGallons(e.target.value)}
                        placeholder="e.g., 10.5"
                        step="0.01"
                        min="0"
                        required
                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                </div>
                <div className="sm:col-span-2 md:col-span-3 text-right">
                    <button type="submit" className="w-full sm:w-auto bg-eco-green text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors">
                        Log Gas Purchase
                    </button>
                </div>
            </form>
        </div>

        <ImpactDashboard />
          <section>
            <h2 className="text-2xl font-bold text-brand-blue mb-4">Managed Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>

      {selectedEvent && (
        <EventRidesModal 
          event={selectedEvent} 
          rides={rides}
          onClose={handleCloseModal} 
          onViewRoute={() => {}}
          currentUser={user}
          onStartChat={() => {}}
          chatSessions={[]}
          onBookOrganizationRide={() => {}}
        />
      )}
    </>
  );
};
