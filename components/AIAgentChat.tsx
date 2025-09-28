
import React, { useState, useRef, useEffect } from 'react';
import { getAIResponse } from '../services/geminiService';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { SendIcon } from './icons/SendIcon';
import { XIcon } from './icons/XIcon';
import type { Ride, UserProfile, AIResponse } from '../types';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface AIAgentChatProps {
    onClose: () => void;
    onInitiateChat: (ride: Ride) => void;
    onCreateRideRequest: (args: { origin: string; destination: string; details: string; }) => void;
    availableRides: Ride[];
    currentUser: UserProfile;
}

export const AIAgentChat: React.FC<AIAgentChatProps> = ({ onClose, onInitiateChat, onCreateRideRequest, availableRides, currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Hi! I'm your ChuuChuuRide AI assistant. How can I help you find a ride today? Try something like, 'Find me a quiet ride to the ShellHacks event on Friday evening from Brickell'." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const prompt = input; // Capture input before clearing
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse: AIResponse = await getAIResponse(prompt, availableRides, currentUser);
      
      const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse.responseText };
      setMessages(prev => [...prev, aiMessage]);

      switch (aiResponse.action) {
        case 'INITIATE_CHAT':
          if (aiResponse.ride) {
            onInitiateChat(aiResponse.ride);
            // Add a follow-up message and close the modal to direct the user to the main chats page.
            setTimeout(() => {
                const followUpMessage: ChatMessage = { sender: 'ai', text: "I've started a chat for you. You can find it in your main chat list." };
                setMessages(prev => [...prev, followUpMessage]);
                setTimeout(onClose, 2000); // Close after 2 seconds
            }, 1000);
          }
          break;
        case 'CREATE_RIDE_REQUEST':
          if (aiResponse.args) {
            onCreateRideRequest(aiResponse.args);
             // Add a follow up message to confirm the action.
             setTimeout(() => {
                const followUpMessage: ChatMessage = { sender: 'ai', text: "Your request is now visible to drivers. Good luck!" };
                setMessages(prev => [...prev, followUpMessage]);
            }, 1000);
          }
          break;
        case 'GENERAL_QUERY':
          // The response message is already displayed, no further action needed.
          break;
      }

    } catch (error) {
        console.error("Error processing AI request:", error);
        const errorMessage: ChatMessage = { sender: 'ai', text: "Oops, something went wrong on my end. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[70vh] flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-brand-blue text-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <BotIcon className="h-6 w-6"/>
                    <h3 className="text-lg font-semibold">ChuuChuuRide AI</h3>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
                    <XIcon className="h-6 w-6"/>
                </button>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center"><BotIcon className="h-5 w-5 text-brand-blue"/></div>}
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'ai' ? 'bg-gray-100 text-gray-800 rounded-tl-none' : 'bg-brand-blue text-white rounded-br-none'}`}>
                            {msg.text}
                        </div>
                        {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center"><UserIcon className="h-5 w-5 text-gray-600"/></div>}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center"><BotIcon className="h-5 w-5 text-brand-blue"/></div>
                        <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-none">
                            <div className="flex items-center justify-center space-x-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me to find a ride..."
                        className="w-full pl-4 pr-12 py-3 bg-brand-blue text-white placeholder-gray-300 border border-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-gold text-brand-blue p-2 rounded-full hover:opacity-90 disabled:opacity-50" disabled={isLoading}>
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
