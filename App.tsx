import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import UziAnalysis from './components/UziAnalysis';
import ChatBot from './components/ChatBot';
import Navigation from './components/Navigation';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/"        element={<HomePage />} />
            <Route path="/analysis" element={<Dashboard />} />
            <Route path="/uzi"     element={<UziAnalysis />} />
            <Route path="/chat"    element={<ChatBot />} />
            <Route path="*"        element={<HomePage />} />
          </Routes>
        </main>
        <footer className="bg-white border-t py-6 text-center text-slate-400">
          <p className="font-bold text-sm">© {new Date().getFullYear()} AiRadiology. Barcha huquqlar himoyalangan.</p>
          <p className="text-xs mt-1 opacity-70">AI xulosalari faqat ma'lumot berish maqsadida. Shifokor maslahati shart.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
