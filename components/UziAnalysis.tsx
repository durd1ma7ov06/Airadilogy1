import React, { useState, useRef } from 'react';
import { analyzeUziImage } from '../services/geminiService';

interface HistoryItem {
  id: string;
  timestamp: string;
  imageUrl: string;
  report: string;
  summary: string;
}

const ResultCard: React.FC<{ text: string }> = ({ text }) => {
  const sections = text.split(/\n(?=##\s)/).filter(Boolean);
  const sectionColors = [
    { bg: 'bg-blue-50', border: 'border-blue-200', icon: '🔍' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '✅' },
    { bg: 'bg-amber-50', border: 'border-amber-200', icon: '📋' },
    { bg: 'bg-rose-50', border: 'border-rose-200', icon: '⚠️' },
    { bg: 'bg-purple-50', border: 'border-purple-200', icon: '💡' },
  ];

  if (sections.length <= 1) {
    return (
      <div className="space-y-2">
        {text.split('\n').filter(l => l.trim()).map((line, i) => {
          const clean = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
          if (line.startsWith('#')) return (
            <div key={i} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-black text-sm">{clean}</div>
          );
          if (line.trim().startsWith('-') || line.trim().startsWith('•')) return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-blue-400 mt-0.5 flex-shrink-0 text-xs">◆</span>
              <p className="text-slate-700 text-xs sm:text-sm font-medium">{clean.replace(/^[-•]\s*/, '')}</p>
            </div>
          );
          return <p key={i} className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">{clean}</p>;
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section, idx) => {
        const lines = section.split('\n').filter(l => l.trim());
        const title = lines[0]?.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
        const body = lines.slice(1);
        const color = sectionColors[idx % 5];
        return (
          <div key={idx} className={`${color.bg} border ${color.border} rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <span>{color.icon}</span>
              <h4 className="font-black text-slate-800 text-sm">{title}</h4>
            </div>
            <div className="space-y-1.5">
              {body.map((line, li) => {
                const clean = line.replace(/\*\*/g, '').replace(/^[-•*]\s*/, '').trim();
                if (!clean) return null;
                const isBullet = /^[-•*]/.test(line.trim());
                return isBullet ? (
                  <div key={li} className="flex gap-2 items-start">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0 text-xs">◆</span>
                    <p className="text-slate-700 text-xs font-medium leading-relaxed">{clean}</p>
                  </div>
                ) : (
                  <p key={li} className="text-slate-700 text-xs font-medium leading-relaxed">{clean}</p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const UziAnalysis: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('uzi_history') || '[]'); }
    catch { return []; }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setImage(reader.result as string); setResult(null); setError(null); };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true); setResult(null); setError(null);
    try {
      const { resultText, id } = await analyzeUziImage(image);
      setResult(resultText);
      const newItem: HistoryItem = {
        id, timestamp: new Date().toLocaleString('uz-UZ'),
        imageUrl: image, report: resultText,
        summary: resultText.replace(/#+\s*/g, '').replace(/\*\*/g, '').substring(0, 100) + '...'
      };
      const updated = [newItem, ...history].slice(0, 15);
      setHistory(updated);
      localStorage.setItem('uzi_history', JSON.stringify(updated));
    } catch (err: any) {
      setError(err.message || "Tahlil jarayonida xatolik.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null); setResult(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="uzi-bg min-h-screen pt-20 pb-16 relative">
      <div className="absolute inset-0 bg-blue-950/50 backdrop-blur-[2px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center pt-6 pb-8 sm:pb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md px-5 py-2 rounded-full border border-blue-400/30 shadow-sm mb-4">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="text-blue-300 font-black text-[10px] sm:text-xs tracking-widest uppercase">Sonografiya AI</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg">
            UZI <span className="text-blue-400">Tasvir</span> Tahlili
          </h1>
          <p className="mt-3 text-sm sm:text-base text-blue-100 font-medium max-w-xl mx-auto opacity-90">
            Ultratovush tasvirini yuklang — AI professional tahlil beradi
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">

          {/* Upload */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/70 shadow-xl p-5 sm:p-7 flex flex-col min-h-[420px] sm:min-h-[500px]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-800">UZI Suratini Yuklash</h3>
              </div>
              {image && !isAnalyzing && (
                <button onClick={reset} className="text-xs text-red-500 font-black bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all">
                  ✕ Tozalash
                </button>
              )}
            </div>

            {!image ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-grow border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all p-8 group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl shadow-blue-200">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-base sm:text-lg font-black text-slate-700 text-center">UZI tasvirini tanlang</p>
                <p className="text-xs text-slate-400 font-medium mt-1">JPG, PNG, WEBP qabul qilinadi</p>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>
            ) : (
              <div className="flex-grow flex flex-col gap-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 flex-grow border-4 border-slate-100 shadow-inner" style={{ minHeight: '250px' }}>
                  <img src={image} alt="UZI" className="w-full h-full object-contain" style={{ maxHeight: '340px' }} />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-white font-black text-xs tracking-widest animate-pulse uppercase">Organlar tahlil qilinmoqda...</p>
                    </div>
                  )}
                </div>
                {!isAnalyzing && !result && (
                  <button onClick={handleAnalyze} className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-black text-base sm:text-lg shadow-xl shadow-blue-200 transition-all">
                    🔍 Tahlilni Boshlash
                  </button>
                )}
                {result && (
                  <button onClick={reset} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all">
                    + Yangi tahlil
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Result */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/70 shadow-xl p-5 sm:p-7 flex flex-col min-h-[420px] sm:min-h-[500px]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">Tahlil Xulosasi</h3>
              {result && <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded-full">✓ Tayyor</span>}
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar">
              {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-medium">⚠️ {error}</div>}
              {result && <ResultCard text={result} />}
              {!result && !isAnalyzing && !error && (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-30">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 font-black text-sm">Natija bu yerda ko'rinadi</p>
                </div>
              )}
              {isAnalyzing && !result && (
                <div className="space-y-3 py-6">
                  {[75, 55, 85, 45, 65].map((w, i) => (
                    <div key={i} className="h-4 bg-blue-100 rounded-full animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }}></div>
                  ))}
                  <p className="text-blue-500 font-black text-xs mt-4 tracking-widest animate-pulse uppercase text-center">Tahlil qilinmoqda...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-blue-600/80 backdrop-blur-md rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">📋</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white drop-shadow">UZI Tahlillar Tarixi</h2>
              <span className="text-xs bg-blue-500/30 text-blue-100 font-black px-2 py-0.5 rounded-full">{history.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => { setImage(item.imageUrl); setResult(item.report); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/70 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group p-4 border-l-4 border-l-blue-500"
                >
                  <div className="relative h-32 w-full mb-3 overflow-hidden rounded-xl bg-slate-900">
                    <img src={item.imageUrl} alt="UZI" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">{item.timestamp}</div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{item.summary}</p>
                  <div className="mt-2 flex items-center text-blue-500 font-black text-xs group-hover:translate-x-1 transition-transform">
                    Ko'rish <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UziAnalysis;
