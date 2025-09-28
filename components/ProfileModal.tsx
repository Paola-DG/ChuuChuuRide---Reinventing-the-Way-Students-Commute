
import React, { useState, useRef } from 'react';
import type { UserProfile, CommuteScheduleEntry } from '../types';
import { XIcon } from './icons/XIcon';
import { TagIcon } from './icons/TagIcon';
import { CheckIcon } from './icons/CheckIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CameraIcon } from './icons/CameraIcon';


interface ProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onSave: (updatedUser: UserProfile) => void;
}

const daysOfWeek: CommuteScheduleEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState<UserProfile>(() => {
    // Ensure schedule is a full 7-day array
    const existingSchedule = user.commuteSchedule || [];
    const scheduleMap = new Map(existingSchedule.map(s => [s.day, s]));
    const fullSchedule = daysOfWeek.map(day => 
      scheduleMap.get(day) || { day, arriveBy: '', leaveAt: '', enabled: false }
    );
    return { ...user, commuteSchedule: fullSchedule, interests: user.interests || [] };
  });

  const [newInterest, setNewInterest] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "music" || name === "chattiness") {
        setProfileData(prev => ({ ...prev, preferences: { ...prev.preferences, [name]: value } }));
    } else {
        setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleScheduleChange = (day: CommuteScheduleEntry['day'], field: keyof Omit<CommuteScheduleEntry, 'day'>, value: string | boolean) => {
    setProfileData(prev => ({
      ...prev,
      commuteSchedule: (prev.commuteSchedule || []).map(item =>
        item.day === day ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddInterest = () => {
    if (newInterest && !profileData.interests?.includes(newInterest)) {
      setProfileData(prev => ({
        ...prev,
        interests: [...(prev.interests || []), newInterest],
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: (prev.interests || []).filter(i => i !== interestToRemove),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleSaveChanges = () => {
    onSave(profileData);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div 
        className="bg-light-bg rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <h2 id="profile-modal-title" className="text-2xl font-bold text-brand-blue">Your Profile</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                <XIcon className="h-6 w-6 text-gray-600"/>
            </button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto space-y-8">
            {/* --- PROFILE PICTURE --- */}
            <section className="flex justify-center">
                <div className="relative group">
                    <img src={profileData.avatarUrl} alt={profileData.name} className="w-32 h-32 rounded-full border-4 border-brand-gold shadow-md" />
                    <button 
                        onClick={handleAvatarClick}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-300"
                        aria-label="Change profile picture"
                    >
                        <CameraIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </section>

            {/* --- BIO & INTERESTS --- */}
            <section>
                <h3 className="text-xl font-bold text-brand-blue mb-4 flex items-center gap-2"><PencilIcon className="h-5 w-5" /> Bio & Interests</h3>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">About You</label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            value={profileData.bio || ''}
                            onChange={handleInputChange}
                            placeholder="Tell your future carpool buddies a little about yourself..."
                            className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        />
                    </div>
                    <div>
                        <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">Your Interests</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {profileData.interests?.map(interest => (
                                <span key={interest} className="flex items-center gap-1 bg-brand-blue text-white text-sm font-medium px-3 py-1 rounded-full">
                                    {interest}
                                    <button onClick={() => handleRemoveInterest(interest)} className="text-blue-200 hover:text-white">
                                        <XIcon className="h-4 w-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                             <div className="relative flex-grow">
                                <TagIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    id="interests"
                                    value={newInterest}
                                    onChange={e => setNewInterest(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleAddInterest()}
                                    placeholder="Add an interest (e.g., Music, Sports)"
                                    className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                />
                             </div>
                            <button onClick={handleAddInterest} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Add</button>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* --- COMMUTE SCHEDULE --- */}
            <section>
                 <h3 className="text-xl font-bold text-brand-blue mb-4">Weekly Commute Schedule</h3>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
                    {profileData.commuteSchedule?.map(item => (
                        <div key={item.day} className={`grid grid-cols-1 sm:grid-cols-4 items-center gap-3 p-3 rounded-lg ${item.enabled ? 'bg-eco-green-light/30' : 'bg-gray-100'}`}>
                           <div className="sm:col-span-1 flex items-center gap-3">
                                <button
                                    onClick={() => handleScheduleChange(item.day, 'enabled', !item.enabled)}
                                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${item.enabled ? 'bg-eco-green border-eco-green' : 'border-gray-300'}`}
                                >
                                    {item.enabled && <CheckIcon className="h-4 w-4 text-white" />}
                                </button>
                                <span className="font-semibold text-gray-800">{item.day}</span>
                           </div>
                           <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Arrive by</label>
                                    <input type="time" value={item.arriveBy} onChange={e => handleScheduleChange(item.day, 'arriveBy', e.target.value)} disabled={!item.enabled} className="w-full text-sm p-1 border border-gray-300 rounded-md disabled:bg-gray-200 disabled:cursor-not-allowed"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Leave at</label>
                                    <input type="time" value={item.leaveAt} onChange={e => handleScheduleChange(item.day, 'leaveAt', e.target.value)} disabled={!item.enabled} className="w-full text-sm p-1 border border-gray-300 rounded-md disabled:bg-gray-200 disabled:cursor-not-allowed"/>
                                </div>
                           </div>
                        </div>
                    ))}
                 </div>
            </section>
            
            {/* --- PREFERENCES --- */}
            <section>
                 <h3 className="text-xl font-bold text-brand-blue mb-4">Ride Preferences</h3>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="music" className="block text-sm font-medium text-gray-700 mb-1">Music Vibe</label>
                        <input type="text" id="music" name="music" value={profileData.preferences.music} onChange={handleInputChange} className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                    </div>
                    <div>
                        <label htmlFor="chattiness" className="block text-sm font-medium text-gray-700 mb-1">Chattiness Level</label>
                        <select id="chattiness" name="chattiness" value={profileData.preferences.chattiness} onChange={handleInputChange} className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            <option>Quiet</option>
                            <option>Chatty</option>
                            <option>Depends</option>
                        </select>
                    </div>
                 </div>
            </section>
        </main>
        
        <footer className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3">
            <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                Cancel
            </button>
            <button onClick={handleSaveChanges} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors">
                Save Changes
            </button>
        </footer>
      </div>
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};