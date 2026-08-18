
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Link, useLocation } from 'react-router-dom';
import { communicationService } from '../services/communicationService';

interface NavigationProps {
  user: User | null;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadConclusions, setUnreadConclusions] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const loadUnreadCounts = async () => {
    if (!user) return;
    const msgCount = await communicationService.getUnreadMessageCount(user.id);
    setUnreadMessages(msgCount);
    const allNotifs = await communicationService.getNotifications(user.id);
    const unreadComments = allNotifs.filter(n => n.type === 'comment' && !n.is_read).length;
    setUnreadConclusions(unreadComments);
  };

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

    if (user) {
      loadUnreadCounts();
      const msgSub = communicationService.subscribeToMessages(user.id, loadUnreadCounts);
      const notifSub = communicationService.subscribeToNotifications(user.id, loadUnreadCounts);

      return () => {
        window.removeEventListener('online', handleStatus);
        window.removeEventListener('offline', handleStatus);
        msgSub.unsubscribe();
        notifSub.unsubscribe();
      };
    }

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/conclusions' && user) {
      const clearNotifs = async () => {
        const allNotifs = await communicationService.getNotifications(user.id);
        const unreadComments = allNotifs.filter(n => n.type === 'comment' && !n.is_read);
        for (const n of unreadComments) {
          await communicationService.markNotificationAsRead(n.id);
        }
        setUnreadConclusions(0);
      };
      clearNotifs();
    }
    // Close menu on route change
    setIsMenuOpen(false);
  }, [location.pathname, user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-slate-100 shadow-sm">
      <div className={`h-1 w-full transition-colors duration-500 ${isOnline ? 'bg-indigo-600' : 'bg-rose-500 animate-pulse'}`}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-indigo-600 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">PnevmoScan <span className="text-indigo-600">AI</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link to="/" className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${location.pathname === '/' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>O'pka</Link>
            <Link to="/uzi" className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${location.pathname === '/uzi' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>UZI</Link>
            <Link to="/diabetes" className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${location.pathname === '/diabetes' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Diabet</Link>
            {user?.role === 'user' && (
              <Link to="/doctors" className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${location.pathname === '/doctors' ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'}`}>Shifokorlar</Link>
            )}
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Link to="/admin" className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${location.pathname === '/admin' ? 'bg-rose-600 text-white' : 'text-rose-600 hover:bg-rose-50'}`}>Admin</Link>
            )}

            <Link to="/chat" className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${location.pathname === '/chat' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              Chat
              {unreadMessages > 0 && (
                <span className="w-5 h-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                  {unreadMessages}
                </span>
              )}
            </Link>

            {user?.role === 'user' && (
              <Link to="/conclusions" className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${location.pathname === '/conclusions' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                Xulosalar
                {unreadConclusions > 0 && (
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                )}
              </Link>
            )}
            <Link to="/profile" className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${location.pathname === '/profile' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Profil</Link>

            <div className="h-6 w-px bg-slate-100 mx-2"></div>

            <button
              onClick={onLogout}
              className="px-4 py-2 bg-slate-50 text-[10px] font-black rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
            >
              CHIQISH
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            <Link to="/chat" className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {unreadMessages > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full animate-pulse font-black">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-50 animate-fade-in-down shadow-2xl overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="px-4 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link to="/" className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${location.pathname === '/' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-transparent text-slate-600'}`}>
                <span className="text-xl mb-1">🫁</span>
                <span className="text-[10px] font-black uppercase tracking-widest">O'pka</span>
              </Link>
              <Link to="/uzi" className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${location.pathname === '/uzi' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-transparent text-slate-600'}`}>
                <span className="text-xl mb-1">🔍</span>
                <span className="text-[10px] font-black uppercase tracking-widest">UZI</span>
              </Link>
              <Link to="/diabetes" className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${location.pathname === '/diabetes' ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-slate-50 border-transparent text-slate-600'}`}>
                <span className="text-xl mb-1">🩸</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Diabet</span>
              </Link>
              <Link to="/profile" className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${location.pathname === '/profile' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-transparent text-slate-600'}`}>
                <span className="text-xl mb-1">👤</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Profil</span>
              </Link>
            </div>

            <div className="space-y-2">
              {user?.role === 'user' && (
                <>
                  <Link to="/doctors" className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-sm transition-all ${location.pathname === '/doctors' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700'}`}>
                    <span>👨‍⚕️ SHIFOKORLAR</span>
                    <svg className="h-5 w-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                  <Link to="/conclusions" className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-sm transition-all ${location.pathname === '/conclusions' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700'}`}>
                    <span className="flex items-center gap-2">
                      📋 XULOSALAR
                      {unreadConclusions > 0 && <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>}
                    </span>
                    <svg className="h-5 w-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </>
              )}

              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <Link to="/admin" className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-sm transition-all ${location.pathname === '/admin' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-600'}`}>
                  <span>⚙️ ADMIN PANEL</span>
                  <svg className="h-5 w-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </Link>
              )}
            </div>

            <button
              onClick={onLogout}
              className="w-full p-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              TIZIMDAN CHIQISH
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
