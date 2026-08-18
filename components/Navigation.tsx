
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  user: User | null;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, [user]);

  useEffect(() => {
    // Close menu on route change
    setIsMenuOpen(false);
  }, [location.pathname]);

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
            <div className="grid grid-cols-3 gap-3">
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
