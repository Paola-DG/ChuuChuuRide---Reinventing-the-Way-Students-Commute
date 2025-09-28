

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LeafIcon } from './icons/LeafIcon';
import { MoneyIcon } from './icons/MoneyIcon';
import { UsersIcon } from './icons/UsersIcon';

const data = [
  { name: 'Jan', co2Saved: 30, moneySaved: 50 },
  { name: 'Feb', co2Saved: 45, moneySaved: 80 },
  { name: 'Mar', co2Saved: 60, moneySaved: 110 },
  { name: 'Apr', co2Saved: 55, moneySaved: 95 },
  { name: 'May', co2Saved: 75, moneySaved: 130 },
];

export const ImpactDashboard: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6">
      <h3 className="text-xl font-bold text-brand-blue">Your Impact</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-eco-green-light p-4 rounded-lg">
          <LeafIcon className="mx-auto text-eco-green h-6 w-6"/>
          <p className="text-2xl font-bold text-eco-green mt-1">125 kg</p>
          <p className="text-sm text-green-800">CO₂ Saved</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <MoneyIcon className="mx-auto text-brand-gold h-6 w-6"/>
          <p className="text-2xl font-bold text-brand-gold mt-1">$210</p>
          <p className="text-sm text-yellow-800">Money Saved</p>
        </div>
         <div className="bg-blue-100 p-4 rounded-lg">
          <UsersIcon className="mx-auto text-brand-blue h-6 w-6"/>
          <p className="text-2xl font-bold text-brand-blue mt-1">42</p>
          <p className="text-sm text-blue-800">Rides Completed</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Monthly Progress</h4>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }}/>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem' 
                }}
                labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
              />
              <Bar dataKey="co2Saved" fill="#22C55E" name="CO₂ Saved (kg)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="moneySaved" fill="#D4AF37" name="Money Saved ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};