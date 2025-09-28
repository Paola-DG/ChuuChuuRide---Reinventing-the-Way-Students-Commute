import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile, ChatSession, ChatMessage, BookingStatus, PaymentMethodType } from '../../types';
import { ChatListItem } from '../ChatListItem';
import { SendIcon } from '../icons/SendIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { XIcon } from '../icons/XIcon';
import { ChatIcon } from '../icons/ChatIcon';

interface ChatsPageProps {
  user: UserProfile;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
}

export const ChatsPage: React.FC<ChatsPageProps> = ({ user, sessions, activeSessionId, onSelectSession, setSessions }) => {
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const updateSession = (updater: (session: ChatSession) => ChatSession) => {
    if (activeSessionId) {
        setSessions(prevSessions =>
            prevSessions.map(session =>
                session.id === activeSessionId ? updater(session) : session
            )
        );
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && activeSessionId) {
        const userMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            senderId: user.id,
            text: newMessage,
            timestamp: new Date(),
        };
        updateSession(session => ({...session, messages: [...session.messages, userMessage]}));
        setNewMessage('');
    }
  };
  
  const handleSelectPaymentMethod = (methodType: PaymentMethodType) => {
    const systemMessage: ChatMessage = {
      id: `sys_${Date.now()}`,
      senderId: user.id, // The user performing the action
      text: `Payment method set to ${methodType}.`,
      timestamp: new Date(),
      isSystemMessage: true,
    };
    updateSession(session => ({
        ...session, 
        selectedPaymentMethod: methodType,
        messages: [...session.messages, systemMessage]
    }));
  };

  const handleUserConfirm = () => {
    if (activeSession?.status === 'Tentative') {
        updateSession(s => ({...s, status: user.role === 'Poolee' ? 'UserConfirmed' : 'ProviderConfirmed'}));
    } else if (activeSession?.status === 'ProviderConfirmed' && user.role === 'Poolee') {
        updateSession(s => ({...s, status: 'Confirmed'}));
    } else if (activeSession?.status === 'UserConfirmed' && user.role === 'Owner') {
        updateSession(s => ({...s, status: 'Confirmed'}));
    }
  };

  const handleCancel = () => {
      updateSession(s => ({...s, status: 'Cancelled'}));
  };

  // This is for demonstration purposes to see the full flow
  const simulateOtherPartyConfirm = () => {
      if (activeSession?.status === 'Tentative') {
          updateSession(s => ({...s, status: user.role === 'Poolee' ? 'ProviderConfirmed' : 'UserConfirmed'}));
      } else if (activeSession?.status === 'UserConfirmed' && user.role === 'Poolee') {
          updateSession(s => ({...s, status: 'Confirmed'}));
      } else if (activeSession?.status === 'ProviderConfirmed' && user.role === 'Owner') {
          updateSession(s => ({...s, status: 'Confirmed'}));
      }
  }

  const renderFooterContent = () => {
    if (!activeSession) return null;

    const otherUser = user.id === activeSession.poolee.id ? activeSession.provider.user : activeSession.poolee;
    
    // Poolee-specific logic
    const isPoolee = user.role === 'Poolee';
    const showPaymentSelection = isPoolee && ['Tentative', 'ProviderConfirmed'].includes(activeSession.status) && !activeSession.selectedPaymentMethod;
    const pooleeCanConfirm = isPoolee && activeSession.selectedPaymentMethod && ['Tentative', 'ProviderConfirmed'].includes(activeSession.status);
    
    // Owner-specific logic
    const isOwner = user.role === 'Owner';
    const ownerCanConfirm = isOwner && ['Tentative', 'UserConfirmed'].includes(activeSession.status);

    const showCancelButton = ['Tentative', 'UserConfirmed', 'ProviderConfirmed'].includes(activeSession.status);

    return (
        <div className="space-y-3">
            {showPaymentSelection && (
                <div className="p-3 bg-gray-100 rounded-lg">
                    <h4 className="font-bold text-sm text-gray-800 mb-2 text-center">Select Payment Method</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {(user.paymentMethods || []).map(method => (
                            <button key={method.id} onClick={() => handleSelectPaymentMethod(method.type)}
                                className="w-full text-sm bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-md hover:bg-gray-50 hover:border-brand-blue"
                            >{method.type}</button>
                        ))}
                    </div>
                </div>
            )}
            
            {(pooleeCanConfirm || ownerCanConfirm) && (
                 <button onClick={handleUserConfirm} className="w-full bg-eco-green text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                    <CheckIcon className="h-5 w-5" /> Finalize Booking
                </button>
            )}

            {activeSession.status === 'UserConfirmed' && isOwner && (
                 <div className="text-center p-3 bg-blue-100 rounded-lg text-brand-blue font-semibold">
                    {otherUser.name} has confirmed! Please finalize to book the ride.
                </div>
            )}

            {activeSession.status === 'ProviderConfirmed' && isPoolee && !activeSession.selectedPaymentMethod && (
                 <div className="text-center p-3 bg-blue-100 rounded-lg text-brand-blue font-semibold">
                    {otherUser.name} has confirmed! Please select a payment method to finalize.
                </div>
            )}
            
            {(activeSession.status === 'UserConfirmed' && isPoolee) && (
                <div className="text-center p-3 bg-blue-100 rounded-lg text-brand-blue font-semibold">
                    Waiting for {otherUser.name} to confirm...
                </div>
            )}

            {(activeSession.status === 'ProviderConfirmed' && isOwner) && (
                 <div className="text-center p-3 bg-blue-100 rounded-lg text-brand-blue font-semibold">
                    Waiting for {otherUser.name} to confirm...
                </div>
            )}
            
            {activeSession.status === 'Confirmed' && (
                <div className="text-center p-4 bg-eco-green-light rounded-lg text-green-800 font-semibold">
                    This ride is confirmed!
                </div>
            )}

            {activeSession.status === 'Cancelled' && (
                <div className="text-center p-4 bg-red-100 rounded-lg text-red-800 font-semibold">
                    This booking has been cancelled.
                </div>
            )}

            <div className="relative">
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-12 py-3 bg-brand-blue text-white placeholder-gray-300 border border-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-gold text-brand-blue p-2 rounded-full hover:opacity-90">
                    <SendIcon />
                </button>
            </div>
            
            {showCancelButton && (
                <button onClick={handleCancel} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 text-sm">
                    <XIcon className="h-4 w-4" /> Cancel Ride
                </button>
            )}

            {(activeSession.status === 'Tentative' || (isPoolee && activeSession.status === 'UserConfirmed') || (isOwner && activeSession.status === 'ProviderConfirmed')) && (
                <button onClick={simulateOtherPartyConfirm} className="w-full bg-brand-gold/80 text-brand-blue font-semibold py-2 px-4 rounded-lg hover:bg-brand-gold transition-colors text-sm">
                    (Demo: Simulate {otherUser.name}'s Confirmation)
                </button>
            )}
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[75vh] flex">
      <aside className="w-1/3 border-r border-gray-200 flex flex-col">
        <header className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-brand-blue">Your Chats</h1>
        </header>
        <div className="flex-grow p-2 space-y-1 overflow-y-auto">
            {sessions.map(session => (
                <ChatListItem 
                    key={session.id} session={session} isActive={session.id === activeSessionId} onSelect={() => onSelectSession(session.id)} currentUser={user}
                />
            ))}
        </div>
      </aside>

      <main className="w-2/3 flex flex-col">
        {activeSession ? (
            (() => {
                const otherUser = user.id === activeSession.poolee.id ? activeSession.provider.user : activeSession.poolee;
                return (
                    <>
                        <header className="p-4 border-b border-gray-200 flex items-center gap-4 flex-shrink-0">
                            <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-12 h-12 rounded-full" />
                            <div>
                                <h2 className="font-bold text-lg text-brand-blue">{otherUser.name}</h2>
                                <p className="text-sm text-gray-600">
                                    Est. Cost: <span className="font-semibold text-eco-green">${activeSession.provider.estimatedCost.toFixed(2)}</span>
                                    {activeSession.selectedPaymentMethod && ` (via ${activeSession.selectedPaymentMethod})`}
                                </p>
                            </div>
                        </header>
                        <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50">
                            {activeSession.messages.map(msg => (
                                msg.isSystemMessage ? (
                                    <div key={msg.id} className="text-center text-xs text-gray-500 italic py-2">{msg.text}</div>
                                ) : (
                                    <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === user.id ? 'justify-end' : ''}`}>
                                        {msg.senderId !== user.id && <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-8 h-8 rounded-full" />}
                                        <p className={`max-w-md px-4 py-2 rounded-2xl ${msg.senderId !== user.id ? 'bg-gray-200 text-gray-800 rounded-bl-none' : 'bg-brand-blue text-white rounded-br-none'}`}>
                                            {msg.text}
                                        </p>
                                        {msg.senderId === user.id && <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />}
                                    </div>
                                )
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <footer className="p-4 border-t border-gray-200 flex-shrink-0">
                            {renderFooterContent()}
                        </footer>
                    </>
                )
            })()
        ) : (
             <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div>
                    <ChatIcon className="h-16 w-16 mx-auto text-gray-300" />
                    <p className="mt-4 text-lg">Select a chat to start messaging.</p>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};
