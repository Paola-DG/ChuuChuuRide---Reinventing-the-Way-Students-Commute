
import React from 'react';
import type { UserProfile, FinancialTransaction } from '../../types';
import { FinancialHub } from '../FinancialHub';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { PaymentMethodsManager } from '../PaymentMethodsManager';

interface FinancialHubPageProps {
    user: UserProfile;
    transactions: FinancialTransaction[];
    onBack: () => void;
    onSaveProfile: (updatedUser: UserProfile) => void;
}

export const FinancialHubPage: React.FC<FinancialHubPageProps> = ({ user, transactions, onBack, onSaveProfile }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-brand-blue font-semibold mb-4">
                <ArrowLeftIcon className="h-5 w-5" />
                Back to Dashboard
            </button>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue mb-6">Financial Hub</h1>
                    <FinancialHub user={user} transactions={transactions} />
                </div>
                <div className="border-t border-gray-200 pt-8">
                    <PaymentMethodsManager user={user} onProfileSave={onSaveProfile} />
                </div>
            </div>
        </div>
    );
};