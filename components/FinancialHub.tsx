
import React from 'react';
import type { UserProfile, FinancialTransaction } from '../types';
import { format } from 'date-fns';
import { ReceiptIcon } from './icons/ReceiptIcon';

interface FinancialHubProps {
  user: UserProfile;
  transactions: FinancialTransaction[];
}

interface SummaryCardProps {
  title: string;
  value: string;
  colorClass: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, colorClass }) => (
  <div className={`p-4 rounded-lg bg-opacity-20 ${colorClass}`}>
    <p className={`text-sm font-medium text-opacity-80 ${colorClass}`}>{title}</p>
    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
  </div>
);

export const FinancialHub: React.FC<FinancialHubProps> = ({ user, transactions }) => {
  const isProvider = user.role === 'Owner';

  const passengerSummaries = {
    paid: '$9.50',
    due: '$0.00',
    future: '2',
  };

  const providerSummaries = {
    earnings: '$24.50',
    pending: '$45.33',
    future: '5',
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {isProvider ? (
          <>
            <SummaryCard title="Total Earnings" value={providerSummaries.earnings} colorClass="text-eco-green" />
            <SummaryCard title="Pending Payout" value={providerSummaries.pending} colorClass="text-brand-gold" />
            <SummaryCard title="Future Commutes" value={providerSummaries.future} colorClass="text-brand-blue" />
          </>
        ) : (
          <>
            <SummaryCard title="Money Paid" value={passengerSummaries.paid} colorClass="text-eco-green" />
            <SummaryCard title="Payments Due" value={passengerSummaries.due} colorClass="text-red-600" />
            <SummaryCard title="Future Bookings" value={passengerSummaries.future} colorClass="text-brand-blue" />
          </>
        )}
      </div>

      {/* Transaction Log */}
      <div>
        <div className="flex items-center gap-3 mb-3">
            <ReceiptIcon className="h-5 w-5 text-gray-600" />
            <h4 className="font-semibold text-gray-700">Recent Transactions</h4>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {transactions.map((tx, index) => (
            <div key={tx.id} className={`p-3 rounded-lg flex justify-between items-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-light-bg'}`}>
              <div>
                <p className="font-semibold text-sm text-gray-800">{tx.description}</p>
                <p className="text-xs text-gray-500">{format(tx.date, 'MMM d, yyyy')} - {tx.type}</p>
              </div>
              <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-eco-green' : 'text-red-600'}`}>
                {tx.type === 'Payment' || tx.type === 'Refund' ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
