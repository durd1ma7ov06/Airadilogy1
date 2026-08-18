import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              Ai<span className="text-indigo-600">Radiology</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center space-x-1">
            <Link to="/" className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${location.pathname === '/' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              🫁 O'pka
            </Link>
            <Link to="/uzi" className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${location.pathname === '/uzi' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              🔍 UZI
            </Link>
            <Link to="/diabetes" className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${location.pathname === '/diabetes' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              🩸 Diabet
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-slate-100 shadow-xl">
          <div className="px-4 py-4 grid grid-cols-3 gap-3">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${location.pathname === '/' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-transparent text-slate-600'}`}>
              <span className="text-xl">🫁</span>
              <span className="text-[10px] font-black mt-1">O'PKA</span>
            </Link>
            <Link to="/uzi" onClick={() => setIsMenuOpen(false)} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${location.pathname === '/uzi' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-transparent text-slate-600'}`}>
              <span className="text-xl">🔍</span>
              <span className="text-[10px] font-black mt-1">UZI</span>
            </Link>
            <Link to="/diabetes" onClick={() => setIsMenuOpen(false)} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${location.pathname === '/diabetes' ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-slate-50 border-transparent text-slate-600'}`}>
              <span className="text-xl">🩸</span>
              <span className="text-[10px] font-black mt-1">DIABET</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
