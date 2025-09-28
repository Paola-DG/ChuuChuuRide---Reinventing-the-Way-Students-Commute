

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} ChuuChuuRide. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-1">Reducing CO₂ one ride at a time.</p>
      </div>
    </footer>
  );
};