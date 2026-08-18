
import React, { useState, useRef, useEffect } from 'react';
import { analyzeUziImage } from '../services/geminiService';
import { authService } from '../services/authService';

interface HistoryItem {
  id: string;
  timestamp: string;
  imageUrl: string;
  report: string;
  summary: string;
  type: string;
}

const UziAnalysis: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const user = authService.getCurrentUser();
    if (user?.email) {
      const savedHistory = await authService.getUserHistory(user.email);
      setHistory(savedHistory.filter((item: any) => item.type === 'uzi'));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const analysis = await analyzeUziImage(image);
      setResult(analysis);
      loadHistory();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Tahlil jarayonida xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="uzi-bg min-h-screen pt-28 pb-20 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-[5px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up">
          <div className="inline-block bg-blue-500/20 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border border-blue-400/30 mb-4 sm:mb-6 shadow-xl">
            <span className="text-blue-300 font-black text-[10px] sm:text-xs tracking-[0.3em] uppercase">Sonografiya AI 1.0</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight drop-shadow-2xl">
            UZI <span className="text-blue-400 italic">Tasvir</span> Tahlili
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-blue-50 font-medium leading-relaxed opacity-90 px-4">
            Ultratovush tekshiruvi tasvirini yuklang va sun'iy intellekt yordamida professional tahlilni oling.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mb-20">
          <div className="glass-panel p-10 rounded-[3rem] animate-fade-in-up flex flex-col min-h-[500px] border-blue-200/20 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-800">UZI Suratini Yuklash</h3>
              {image && !isAnalyzing && (
                <button onClick={reset} className="text-red-500 hover:text-red-700 font-black text-sm flex items-center bg-red-50 px-5 py-2.5 rounded-2xl transition-all shadow-sm">
                  Tozalash
                </button>
              )}
            </div>

            {!image ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-grow border-4 border-dashed border-blue-100 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all p-8 sm:p-12 group"
              >
                <div className="bg-blue-600 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-blue-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-14 sm:w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-lg sm:text-2xl font-black text-slate-800 text-center">Faylni tanlang</p>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>
            ) : (
              <div className="flex-grow flex flex-col">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white aspect-video bg-slate-900">
                  <img src={image} alt="Preview" className="w-full h-full object-contain" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-md flex flex-col items-center justify-center">
                      <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mb-8"></div>
                      <span className="text-white font-black tracking-[0.4em] text-sm animate-pulse text-center px-4">ORGANLAR TAHLIL QILINMOQDA...</span>
                    </div>
                  )}
                </div>

                {!isAnalyzing && !result && (
                  <button
                    onClick={handleAnalyze}
                    className="mt-10 w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-blue-500/40 transform active:scale-95 transition-all"
                  >
                    Tahlilni boshlash
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel p-10 rounded-[3rem] animate-fade-in-up flex flex-col min-h-[500px] border-blue-200/20 shadow-2xl" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-violet-600 p-4 rounded-[1.5rem] shadow-xl shadow-violet-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800">Tahlil Xulosasi</h3>
            </div>

            <div className="flex-grow overflow-auto pr-2 custom-scrollbar">
              {error && (
                <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-red-600 font-bold animate-fade-in-up mb-6">
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {error}
                  </p>
                </div>
              )}

              {result && (
                <div className="animate-fade-in-up space-y-8">
                  <div className="bg-white/95 p-10 rounded-[2.5rem] border border-blue-50 shadow-inner text-slate-800 leading-relaxed font-bold whitespace-pre-wrap text-lg">
                    {result}
                  </div>

                  {history.find(h => h.report === result)?.doctor_comment && (
                    <div className="bg-blue-600 p-10 rounded-[3rem] shadow-2xl shadow-blue-500/30 text-white animate-fade-in-up">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-80 flex items-center gap-2">
                        <span>👨‍⚕️</span> SHIFOKOR XULOSASI
                      </p>
                      <p className="text-xl font-bold italic leading-relaxed">
                        "{history.find(h => h.report === result)?.doctor_comment}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!result && !isAnalyzing && !error && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                  <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <p className="text-slate-600 font-black text-xl">Tasvir yuklangandan so'ng xulosa bu yerda paydo bo'ladi.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-4xl font-black text-white mb-10 flex items-center drop-shadow-lg">
            <span className="bg-blue-600/80 p-4 rounded-2xl mr-5 backdrop-blur-md shadow-2xl">📽️</span>
            UZI Tahlillar Tarixi
          </h2>

          {history.length === 0 ? (
            <div className="glass-panel p-20 rounded-[4rem] text-center border-dashed border-4 border-white/20">
              <p className="text-white/60 font-black text-2xl">Hozircha UZI tahlillari mavjud emas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setImage(item.imageUrl);
                    setResult(item.report);
                    setError(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="glass-panel p-8 rounded-[3rem] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] hover:scale-[1.03] transition-all cursor-pointer group border-l-[15px] border-l-blue-600"
                >
                  <div className="relative h-48 w-full mb-6 overflow-hidden rounded-[2rem] bg-slate-900 border-4 border-white/50 shadow-inner">
                    <img src={item.imageUrl} alt="Scan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                      {item.timestamp}
                    </div>
                  </div>
                  <h4 className="font-black text-slate-800 text-2xl mb-3">UZI Skrining</h4>
                  <p className="text-slate-500 text-sm line-clamp-3 font-bold leading-relaxed opacity-80">{item.summary}</p>
                  <div className="mt-6 flex items-center text-blue-600 font-black text-sm group-hover:translate-x-2 transition-transform">
                    Tafsilotlarni ko'rish <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UziAnalysis;
