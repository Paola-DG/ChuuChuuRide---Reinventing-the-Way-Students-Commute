import React from 'react';
import type { ChatSession, UserProfile } from '../types';

interface ChatListItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  currentUser: UserProfile;
}

const getStatusStyles = (status: ChatSession['status']) => {
  switch (status) {
    case 'Confirmed':
      return 'bg-eco-green text-white';
    case 'Cancelled':
      return 'bg-red-500 text-white';
    case 'UserConfirmed':
    case 'ProviderConfirmed':
      return 'bg-blue-500 text-white';
    case 'Tentative':
    default:
      return 'bg-yellow-400 text-yellow-900';
  }
};

export const ChatListItem: React.FC<ChatListItemProps> = ({ session, isActive, onSelect, currentUser }) => {
  const lastMessage = session.messages[session.messages.length - 1];
  const otherUser = currentUser.id === session.poolee.id ? session.provider.user : session.poolee;

  return (
    <button 
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg transition-colors flex gap-3 items-center ${isActive ? 'bg-brand-blue text-white' : 'hover:bg-gray-200'}`}
    >
      <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center">
            <h3 className={`font-bold truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>{otherUser.name}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusStyles(session.status)}`}>
                {session.status}
            </span>
        </div>
        <p className={`text-sm truncate ${isActive ? 'text-blue-200' : 'text-gray-500'}`}>
          {lastMessage ? `${lastMessage.senderId === currentUser.id ? 'You: ' : ''}${lastMessage.text}` : 'No messages yet'}
        </p>
      </div>
    </button>
  );
};
