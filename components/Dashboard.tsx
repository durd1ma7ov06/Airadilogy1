
import React, { useState, useRef, useEffect } from 'react';
import { analyzeLungImage } from '../services/geminiService';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';

interface HistoryItem {
  id: string;
  timestamp: string;
  imageUrl: string;
  report: string;
  summary: string;
}

const Dashboard: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastAnalysisId, setLastAnalysisId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const user = authService.getCurrentUser();
    if (user?.email) {
      const savedHistory = await authService.getUserHistory(user.email);
      setHistory(savedHistory.filter((item: any) => item.type === 'lung'));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setLastAnalysisId(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setResult(null);
    setLastAnalysisId(null);
    setError(null);

    try {
      const { resultText, id } = await analyzeLungImage(image);
      setResult(resultText);
      setLastAnalysisId(id);
      loadHistory();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Tahlil jarayonida xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectFromHistory = (item: HistoryItem) => {
    setImage(item.imageUrl);
    setResult(item.report);
    setLastAnalysisId(item.id);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setLastAnalysisId(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="dashboard-bg min-h-screen pt-20 sm:pt-28 pb-12 sm:pb-24 relative">
      <div className="absolute inset-0 overlay-light pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up">
          <div className="inline-block bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border border-indigo-100 mb-4 sm:mb-6 shadow-sm">
            <span className="text-indigo-600 font-black text-[10px] sm:text-xs tracking-[0.2em] uppercase">Radiologiya Markazi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight leading-tight">
            O'pka <span className="text-indigo-600 italic">Rentgen</span> Tahlili
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-700 font-semibold leading-relaxed px-4">
            Tasvirni yuklang va AI yordamida tezkor tibbiy xulosa oling.
          </p>
          <div className="mt-8 sm:mt-10 flex justify-center px-4">
            <Link
              to="/conclusions"
              className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl sm:rounded-[2rem] font-black text-xs sm:text-sm shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
            >
              <span className="text-lg sm:text-xl group-hover:animate-bounce">👨‍⚕️</span>
              SHIFOKOR XULOSALARI
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch mb-16">
          <div className="glass-panel p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] animate-fade-in-up flex flex-col min-h-[400px] sm:min-h-[500px]">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800">Tasvir yuklash</h3>
              {image && !isAnalyzing && (
                <button onClick={reset} className="text-red-500 hover:text-red-700 font-black text-[10px] sm:text-sm flex items-center bg-red-50 px-3 sm:px-4 py-2 rounded-xl transition-all">
                  Tozalash
                </button>
              )}
            </div>

            {!image ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-grow border-4 border-dashed border-indigo-100 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-white/50 transition-all p-8 sm:p-12 group"
              >
                <div className="bg-indigo-600 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-indigo-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-14 sm:w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg sm:text-2xl font-black text-slate-800 text-center">Tahlil uchun rentgen suratini tanlang</p>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>
            ) : (
              <div className="flex-grow flex flex-col">
                <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white aspect-square bg-slate-900">
                  <img src={image} alt="Preview" className="w-full h-full object-contain" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 sm:mb-6"></div>
                        <span className="text-white font-black tracking-[0.2em] text-[10px] sm:text-sm animate-pulse uppercase">SUN'IY INTELLEKT TAHLIL QILMOQDA...</span>
                      </div>
                    </div>
                  )}
                </div>

                {!isAnalyzing && !result && (
                  <button
                    onClick={handleAnalyze}
                    className="mt-8 sm:mt-10 w-full py-4 sm:py-5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl shadow-2xl shadow-indigo-200 transform hover:-translate-y-1 transition-all"
                  >
                    Tahlilni Boshlash
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] animate-fade-in-up flex flex-col min-h-[400px] sm:min-h-[500px]" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center space-x-4 mb-6 sm:mb-8">
              <div className="bg-emerald-500 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800">Tahlil Natijasi</h3>
            </div>

            <div className="flex-grow overflow-auto pr-2 custom-scrollbar">
              {error && (
                <div className="bg-rose-50 border-2 border-rose-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-rose-600 font-bold mb-6 animate-pulse text-sm sm:text-base">
                  ⚠️ {error}
                </div>
              )}

              {result && (
                <div className="animate-fade-in-up space-y-6">
                  <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-indigo-50 shadow-inner text-slate-800 leading-relaxed font-bold whitespace-pre-wrap text-base sm:text-lg">
                    {result}
                  </div>

                  {history.find(h => h.id === lastAnalysisId)?.doctor_comment && (
                    <div className="bg-indigo-600 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-indigo-200 text-white translate-y-2">
                      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-80 flex items-center gap-2">
                        <span>👨‍⚕️</span> SHIFOKOR XULOSASI
                      </p>
                      <p className="text-base sm:text-lg font-bold italic leading-relaxed">
                        "{history.find(h => h.id === lastAnalysisId)?.doctor_comment}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!result && !isAnalyzing && !error && (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 sm:py-12 opacity-40">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="text-slate-600 font-black text-lg sm:text-xl">Natija bu yerda ko'rinadi...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-8 sm:mb-10 flex items-center">
            <span className="bg-indigo-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl mr-4 sm:mr-5 shadow-2xl shadow-indigo-200 flex items-center justify-center">
              <span className="text-white text-xl sm:text-2xl">📽️</span>
            </span>
            Tahlillar Tarixi
          </h2>

          {history.length === 0 ? (
            <div className="glass-panel p-12 sm:p-20 rounded-[2rem] sm:rounded-[4rem] text-center border-dashed border-4 border-indigo-50">
              <p className="text-slate-400 font-black text-xl sm:text-2xl">Hozircha tahlillar mavjud emas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => selectFromHistory(item)}
                  className="glass-panel p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)] hover:scale-[1.03] transition-all cursor-pointer group border-l-[10px] sm:border-l-[15px] border-l-indigo-600"
                >
                  <div className="relative h-40 sm:h-48 w-full mb-4 sm:mb-6 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-slate-900 border-4 border-white shadow-inner">
                    <img src={item.imageUrl} alt="Scan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-3 right-3 sm:top-4 right-4 bg-indigo-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg">
                      {item.timestamp}
                    </div>
                  </div>
                  <h4 className="font-black text-slate-800 text-xl sm:text-2xl mb-2 sm:mb-3">Rentgen Tahlili</h4>
                  <p className="text-slate-500 text-xs sm:text-sm line-clamp-3 font-bold leading-relaxed opacity-80">{item.summary}</p>
                  <div className="mt-4 sm:mt-6 flex items-center text-indigo-600 font-black text-xs sm:text-sm group-hover:translate-x-2 transition-transform">
                    Tafsilotlarni ko'rish <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
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

export default Dashboard;
