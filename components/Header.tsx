

import React, { useState, useRef, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { CarIcon } from './icons/CarIcon';
import { UserIcon } from './icons/UserIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ChatIcon } from './icons/ChatIcon';


interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  onRoleChange: (role: UserRole) => void;
  onProfileClick: () => void;
  onViewChats: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onRoleChange, onProfileClick, onViewChats, onGoHome }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    <header className="bg-brand-blue shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onGoHome(); }}
          className="flex items-center space-x-3 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-blue focus:ring-brand-gold rounded-md p-1 -ml-1" 
          aria-label="Go to Home"
        >
          <CarIcon className="text-brand-gold h-8 w-8"/>
          <h1 className="text-3xl font-display text-brand-gold tracking-wider" style={{ textShadow: '2px 2px #002D62' }}>ChuuChuuRide</h1>
        </a>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <button
                onClick={onViewChats}
                className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                aria-label="View Chats"
              >
                <ChatIcon className="h-6 w-6" />
              </button>

               <div className="hidden sm:block">
                <label htmlFor="role-switcher" className="sr-only">View As</label>
                <select
                  id="role-switcher"
                  value={user.role}
                  onChange={(e) => onRoleChange(e.target.value as UserRole)}
                  className="bg-brand-blue border border-blue-700 hover:border-brand-gold text-white text-sm font-semibold rounded-md py-2 px-3 focus:ring-2 focus:ring-brand-gold focus:outline-none transition-colors"
                  aria-label="Switch user role view"
                >
                  <option value="Poolee">Rider</option>
                  <option value="Owner">Driver</option>
                  <option value="Organization">Impact</option>
                </select>
              </div>

              <div ref={dropdownRef} className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(prev => !prev)} 
                  className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-blue focus:ring-brand-gold rounded-full transition-all"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full border-2 border-brand-gold" />
                   <div className="text-white hidden md:block text-left">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm opacity-80">{user.email}</div>
                  </div>
                </button>
                {isDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50 ring-1 ring-black ring-opacity-5"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); onProfileClick(); setIsDropdownOpen(false); }} 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          <UserIcon className="h-5 w-5 text-gray-500" />
                          <span>My Profile</span>
                        </a>
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); onLogout(); }} 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          <LogoutIcon className="h-5 w-5 text-gray-500" />
                          <span>Logout</span>
                        </a>
                    </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};