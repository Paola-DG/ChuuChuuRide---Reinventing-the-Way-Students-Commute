
import React, { useState } from 'react';
import type { UserProfile, PaymentMethod, PaymentMethodType } from '../types';
import { XIcon } from './icons/XIcon';
import { WalletIcon } from './icons/WalletIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface PaymentMethodsManagerProps {
  user: UserProfile;
  onProfileSave: (updatedUser: UserProfile) => void;
}

const PAYMENT_METHOD_TYPES: PaymentMethodType[] = ['Credit Card', 'Cash', 'Venmo', 'Zelle'];

export const PaymentMethodsManager: React.FC<PaymentMethodsManagerProps> = ({ user, onProfileSave }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMethodType, setNewMethodType] = useState<PaymentMethodType>('Credit Card');
  const [newMethodDetails, setNewMethodDetails] = useState('');

  const handleRemoveMethod = (methodId: string) => {
    const updatedMethods = (user.paymentMethods || []).filter(m => m.id !== methodId);
    onProfileSave({ ...user, paymentMethods: updatedMethods });
  };

  const handleAddMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodDetails) {
        alert("Please provide details for the new payment method.");
        return;
    }
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: newMethodType,
      details: newMethodDetails,
    };
    const updatedMethods = [...(user.paymentMethods || []), newMethod];
    onProfileSave({ ...user, paymentMethods: updatedMethods });

    // Reset form
    setIsAdding(false);
    setNewMethodType('Credit Card');
    setNewMethodDetails('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <WalletIcon className="h-6 w-6 text-gray-600" />
            <h3 className="text-xl font-bold text-brand-blue">Payment Methods</h3>
        </div>
        {!isAdding && (
            <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors text-sm"
            >
                <PlusCircleIcon className="h-5 w-5" />
                Add New
            </button>
        )}
      </div>
      
      <div className="space-y-3">
        {(user.paymentMethods || []).map(method => (
          <div key={method.id} className="p-3 bg-light-bg rounded-lg flex justify-between items-center border">
            <div>
              <p className="font-semibold text-gray-800">{method.type}</p>
              <p className="text-sm text-gray-500">{method.details}</p>
            </div>
            <button 
                onClick={() => handleRemoveMethod(method.id)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full"
                aria-label={`Remove ${method.type}`}
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
        {user.paymentMethods?.length === 0 && !isAdding && (
            <p className="text-center text-gray-500 py-4">You have no saved payment methods.</p>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddMethod} className="p-4 bg-gray-50 border-2 border-dashed rounded-lg space-y-4">
            <h4 className="font-semibold text-gray-700">Add a New Method</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="payment-type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                        id="payment-type"
                        value={newMethodType}
                        onChange={e => setNewMethodType(e.target.value as PaymentMethodType)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    >
                        {PAYMENT_METHOD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="payment-details" className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                    <input
                        type="text"
                        id="payment-details"
                        value={newMethodDetails}
                        onChange={e => setNewMethodDetails(e.target.value)}
                        placeholder={
                            newMethodType === 'Credit Card' ? 'e.g., Visa **** 1234' :
                            newMethodType === 'Venmo' ? 'e.g., @username' :
                            newMethodType === 'Zelle' ? 'e.g., your@email.com' : 'e.g., Pay in person'
                        }
                        required
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
                    Cancel
                </button>
                <button type="submit" className="bg-eco-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
                    Save Method
                </button>
            </div>
        </form>
      )}
    </div>
  );
};
