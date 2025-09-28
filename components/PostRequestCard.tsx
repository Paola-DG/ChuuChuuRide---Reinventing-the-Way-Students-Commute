
import React from 'react';

interface PostRequestCardProps {
    onClick: () => void;
    onViewRequests: () => void;
}

export const PostRequestCard: React.FC<PostRequestCardProps> = ({ onClick, onViewRequests }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-bold text-brand-blue mb-1">Need a Ride?</h3>
      <p className="text-gray-600 mb-6">Let drivers know you're looking for a carpool. Post a public request.</p>
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3">
          <button 
            onClick={onViewRequests}
            className="w-full sm:w-auto bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-md hover:bg-gray-300 transition-colors">
            View My Requests
          </button>
          <button 
            onClick={onClick}
            className="w-full sm:w-auto bg-eco-green text-white font-bold py-3 px-8 rounded-md hover:bg-green-600 transition-all duration-300">
            Post Request
          </button>
        </div>
    </div>
  );
};
