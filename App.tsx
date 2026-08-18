
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DiabetesTest from './components/DiabetesTest';
import UziAnalysis from './components/UziAnalysis';
import Navigation from './components/Navigation';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/diabetes" element={<DiabetesTest />} />
            <Route path="/uzi" element={<UziAnalysis />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>

        <footer className="bg-white/80 backdrop-blur-md border-t py-6 text-center text-slate-400">
          <div className="max-w-4xl mx-auto px-4">
            <p className="font-bold text-sm">© {new Date().getFullYear()} AiRadiology. Barcha huquqlar himoyalangan.</p>
            <p className="mt-1 text-xs">
              AI xulosalari faqat ma'lumot berish maqsadida. Shifokor maslahati shart.
            </p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
