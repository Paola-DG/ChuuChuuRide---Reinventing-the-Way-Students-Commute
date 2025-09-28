import React from 'react';
import type { CommuteProvider, UserProfile } from '../types';
import { MapIcon } from './icons/MapIcon';
import { ClockIcon } from './icons/ClockIcon';
import { UsersIcon } from './icons/UsersIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';

interface MatchCardProps {
    provider: CommuteProvider;
    currentUser: UserProfile;
    onStartChat: () => void;
    onViewRoute: () => void;
    onViewCombinedRoute: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ provider, currentUser, onStartChat, onViewRoute, onViewCombinedRoute }) => {
    const findCommonClasses = (): string[] => {
        if (!currentUser.classSchedule || !provider.user.classSchedule) {
            return [];
        }
        const pooleeCourses = new Set(currentUser.classSchedule.map(c => c.courseCode));
        const commonCourses = provider.user.classSchedule
            .filter(driverClass => pooleeCourses.has(driverClass.courseCode))
            .map(commonClass => commonClass.courseCode);
        return commonCourses;
    };

    const commonClasses = findCommonClasses();
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-brand-blue transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <img src={provider.user.avatarUrl} alt={provider.user.name} className="w-16 h-16 rounded-full border-2 border-brand-gold"/>
                <div className="flex-grow w-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-lg font-bold text-brand-blue">{provider.user.name}</h4>
                            <p className="text-sm text-gray-600">
                                {provider.user.rating}⭐ ({provider.user.serviceTier})
                            </p>
                             {commonClasses.length > 0 && (
                                <div className="mt-1">
                                    <div className="flex items-center gap-1 text-xs text-brand-blue font-semibold">
                                        <AcademicCapIcon className="h-4 w-4" />
                                        <span>Shares Class</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{commonClasses.join(', ')}</p>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-eco-green">${provider.estimatedCost.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">estimated</p>
                        </div>
                    </div>
                    <div className="mt-2 h-2.5 w-full bg-gray-200 rounded-full">
                        <div className="bg-eco-green h-2.5 rounded-full" style={{ width: `${provider.routeOverlapPercentage}%` }}></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-gray-500">{provider.routeOverlapPercentage}% Route Match</p>

                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-around text-sm text-gray-700">
                        <div className="text-center px-2">
                            <div className="flex items-center gap-1.5 justify-center">
                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold">{provider.driverOriginalDurationMinutes} min</span>
                            </div>
                            <p className="text-xs text-gray-500">Original Route</p>
                        </div>
                        <div className="text-center px-2">
                            <div className="flex items-center gap-1.5 justify-center">
                                <ClockIcon className="h-4 w-4 text-brand-blue" />
                                <span className="font-semibold text-brand-blue">{provider.driverCombinedDurationMinutes} min</span>
                            </div>
                            <p className="text-xs text-gray-500">New Route</p>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                    <button 
                        onClick={onStartChat}
                        className="w-full sm:w-auto bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors"
                    >
                        Open Chat
                    </button>
                    <button
                        onClick={onViewRoute}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <MapIcon className="h-5 w-5" />
                        View Route
                    </button>
                    <button
                        onClick={onViewCombinedRoute}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-100 text-brand-blue font-bold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                        <UsersIcon className="h-5 w-5" />
                        New Route
                    </button>
                </div>
            </div>
        </div>
    );
}