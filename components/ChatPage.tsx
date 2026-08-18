import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import ChatWindow from './ChatWindow';
import { communicationService } from '../services/communicationService';

const ChatPage: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchUnreadCounts = async (userId: string) => {
        try {
            const counts: Record<string, number> = {};
            const { data, error } = await supabase
                .from('messages')
                .select('sender_id')
                .eq('receiver_id', userId)
                .eq('is_read', false);

            if (!error && data) {
                data.forEach(msg => {
                    counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
                });
            }
            setUnreadCounts(counts);
        } catch (error) {
            console.error("Error fetching unread counts:", error);
        }
    };

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }
        setCurrentUser(user);

        const fetchUsers = async () => {
            try {
                const allUsers = await authService.getUsers();
                const filtered = allUsers.filter(u => {
                    if (u.id === user.id) return false;
                    if (user.role === 'user') {
                        return u.role === 'admin' || u.role === 'super_admin';
                    }
                    return true;
                });
                setUsers(filtered);
                await fetchUnreadCounts(user.id);
            } catch (error) {
                console.error("Error fetching users for chat:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();

        // Subscribe to messages to update unread counts
        const channel = communicationService.subscribeToMessages(user.id, () => {
            fetchUnreadCounts(user.id);
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [navigate]);

    // When selecting a user, clear their unread count locally (ChatWindow will clear it in DB)
    useEffect(() => {
        if (selectedUser && currentUser) {
            setUnreadCounts(prev => ({ ...prev, [selectedUser.id]: 0 }));
        }
    }, [selectedUser, currentUser]);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-r-4 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-20 flex flex-col h-screen overflow-hidden">
            <div className="max-w-[1600px] mx-auto w-full flex-grow flex p-4 md:p-6 gap-6 overflow-hidden">
                {/* Sidebar: User List */}
                <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-6 border-b border-slate-50">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-black text-slate-800">Chatlar</h2>
                            <div className="w-10"></div>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Qidirish..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm transition-all"
                            />
                            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-10 opacity-40">
                                <p className="font-bold text-sm">Foydalanuvchilar topilmadi</p>
                            </div>
                        ) : (
                            filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`w-full p-4 rounded-2xl transition-all flex items-center gap-4 group relative ${selectedUser?.id === user.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${selectedUser?.id === user.id ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'}`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left flex-grow overflow-hidden">
                                        <h4 className={`font-black truncate ${selectedUser?.id === user.id ? 'text-white' : 'text-slate-800'}`}>{user.name}</h4>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${selectedUser?.id === user.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                                            {user.role === 'user' ? 'Bemor' : 'Mutaxassis'}
                                        </p>
                                    </div>
                                    {unreadCounts[user.id] > 0 && selectedUser?.id !== user.id && (
                                        <div className="absolute top-4 right-4 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                            {unreadCounts[user.id]}
                                        </div>
                                    )}
                                    {selectedUser?.id !== user.id && !unreadCounts[user.id] && (
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main: Chat Window */}
                <div className={`flex-grow h-full bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {selectedUser ? (
                        <div className="w-full h-full">
                            <ChatWindow
                                currentUser={currentUser}
                                targetUser={selectedUser}
                                onClose={() => setSelectedUser(null)}
                            />
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-10 opacity-30 select-none">
                            <div className="bg-slate-100 p-8 rounded-[3rem] mb-6">
                                <svg className="w-20 h-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Suhbatni tanlang</h3>
                            <p className="font-bold text-slate-500 max-w-xs mx-auto">Muloqotni boshlash uchun chap tarafdagi ro'yxatdan birorta foydalanuvchini tanlang</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
