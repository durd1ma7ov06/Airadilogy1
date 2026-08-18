
import React, { useState, useEffect, useRef } from 'react';
import { communicationService } from '../services/communicationService';
import { supabase } from '../services/supabaseClient';
import { User, Message } from '../types';

interface ChatWindowProps {
    currentUser: User;
    targetUser: User;
    onClose?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, targetUser, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async () => {
        const data = await communicationService.getMessages(currentUser.id, targetUser.id);
        setMessages(data);
        await communicationService.markMessagesAsRead(currentUser.id, targetUser.id);
    };

    useEffect(() => {
        loadMessages();

        // Real-time subscription (primary)
        const channel = communicationService.subscribeToMessages(currentUser.id, () => {
            loadMessages();
        });

        // Polling fallback (har 2 soniyada yangi xabarlarni tekshirish)
        const pollInterval = setInterval(() => {
            loadMessages();
        }, 2000);

        return () => {
            clearInterval(pollInterval);
            supabase.removeChannel(channel);
        };
    }, [currentUser.id, targetUser.id]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        // Optimistic update (optional, but let's stick to service call for now to ensure DB consistency)
        setIsLoading(true);
        try {
            await communicationService.sendMessage(currentUser.id, targetUser.id, newMessage);
            setNewMessage('');
            // loadMessages will be triggered by Realtime subscription or we can call it manually
            await loadMessages();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shadow-lg relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl shadow-inner">
                            {targetUser.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-indigo-600 rounded-full"></span>
                    </div>
                    <div>
                        <h4 className="font-black text-base tracking-tight">{targetUser.name}</h4>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest">
                                {targetUser.role === 'user' ? 'Bemor' : 'Mutaxassis'}
                            </span>
                            <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
                            <span className="text-[10px] text-indigo-200 font-bold tracking-widest uppercase">Online</span>
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition-all active:scale-90">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-slate-50/30 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <p className="font-black text-sm uppercase tracking-widest">Suhbatni boshlang...</p>
                    </div>
                ) : (
                    messages.map((m, i) => {
                        const isMe = m.sender_id === currentUser.id;
                        const prevMsg = messages[i - 1];
                        const showTime = !prevMsg || (new Date(m.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 300000);

                        return (
                            <div key={m.id} className="animate-fade-in-up">
                                {showTime && (
                                    <div className="text-center my-4">
                                        <span className="text-[9px] font-black text-slate-400 bg-white px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                )}
                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-[1.8rem] text-sm font-bold shadow-sm transition-all hover:shadow-md ${isMe
                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200'
                                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                                        }`}>
                                        {m.content}
                                        {isMe && (
                                            <div className="flex justify-end mt-1">
                                                <svg className={`w-3.5 h-3.5 ${m.is_read ? 'text-emerald-300' : 'text-indigo-300 opacity-50'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    {m.is_read && <path fillRule="evenodd" d="M11.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L3 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />}
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100 relative z-10">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                    <div className="flex-grow relative group">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Xabar yozing..."
                            className="w-full pl-6 pr-14 py-4 bg-slate-100 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white font-bold text-sm transition-all placeholder:text-slate-400"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {/* Emoji button or similar could go here */}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isLoading}
                        className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-90 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-6 h-6 rotate-45 mb-1 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
