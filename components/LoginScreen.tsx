
import React, { useState, useEffect } from 'react';
import { CarIcon } from './icons/CarIcon';
import { LockIcon } from './icons/LockIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface LoginScreenProps {
  onLogin: () => void;
  isAuthenticating: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isAuthenticating }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for an error message passed via sessionStorage from the auth hook
    const authError = sessionStorage.getItem('authError');
    if (authError) {
      setError(authError);
      sessionStorage.removeItem('authError'); // Clear the error after displaying it once
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue to-blue-900 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6 text-center transform transition-all hover:scale-105">
        <div className="space-y-4">
          <div className="inline-block bg-brand-gold p-3 rounded-full">
            <CarIcon className="text-brand-blue h-10 w-10" />
          </div>
          <h1 className="text-4xl font-display text-brand-blue">ChuuChuuRide</h1>
          <p className="text-gray-600">Your sustainable ride-sharing platform, exclusively for students.</p>
        </div>
        
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-left" role="alert">
                <div className="flex">
                    <div className="py-1"><XCircleIcon className="h-6 w-6 text-red-500 mr-3"/></div>
                    <div>
                        <p className="font-bold">Authentication Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-4 h-28 flex flex-col justify-center items-center">
            {isAuthenticating ? (
                <div className="space-y-4 text-center">
                    <div className="flex justify-center items-center">
                        <svg className="animate-spin h-8 w-8 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-gray-700 animate-pulse">Redirecting to our secure sign-in portal...</p>
                </div>
            ) : (
                <>
                    <p className="text-gray-700">
                        Join an exclusive network of students. Sign up or log in with your university-provided <strong className="font-semibold text-brand-blue">.edu</strong> email.
                    </p>
                    <button
                        onClick={onLogin}
                        className="w-full flex justify-center items-center gap-3 bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
                        disabled={isAuthenticating}
                    >
                        <LockIcon />
                        Sign Up / Sign In with University Email
                    </button>
                </>
            )}
        </div>
        
        <p className="text-xs text-center text-gray-500">
          Securely managed by Auth0 for <span className="font-semibold">.edu</span> verification.
        </p>
      </div>
    </div>
  );
};
