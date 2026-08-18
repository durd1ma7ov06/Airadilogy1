
import React, { useState, useEffect } from 'react';
import { analyzeDiabetesRisk } from '../services/geminiService';
import { authService } from '../services/authService';

interface Question {
  id: number;
  text: string;
  type: 'choice' | 'text';
  options?: string[];
  placeholder?: string;
  category: 'personal' | 'clinical' | 'symptoms' | 'lifestyle';
}

interface HistoryItem {
  id: string;
  timestamp: string;
  type: string;
  inputData: any;
  report: string;
}

const DIABETES_QUESTIONS: Question[] = [
  // Shaxsiy ma'lumotlar
  { id: 1, text: "Yoshingiz nechada?", type: 'text', placeholder: "Masalan: 38", category: 'personal' },
  { id: 2, text: "Vazningiz (kg) va bo'yingiz (cm)?", type: 'text', placeholder: "82kg, 175cm", category: 'personal' },
  { id: 3, text: "Beldagi aylana o'lchami (cm)?", type: 'text', placeholder: "Masalan: 95cm", category: 'personal' },

  // Klinik ko'rsatkichlar
  { id: 4, text: "Odatda qon bosimingiz qanday (masalan: 130/80)?", type: 'text', placeholder: "120/80", category: 'clinical' },
  { id: 5, text: "Qonda glyukoza (shakar) miqdori haqida oxirgi ma'lumot bormi?", type: 'text', placeholder: "Masalan: 5.8 yoki Bilmayman", category: 'clinical' },
  { id: 6, text: "Ilgari qoningizda qand miqdori baland chiqqanmi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'clinical' },
  { id: 7, text: "Qon bosimini tushiruvchi dorilar ichasizmi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'clinical' },
  { id: 8, text: "Oilada (ota-ona, aka-uka) diabet bilan kasallanganlar bormi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'clinical' },

  // Simptomlar
  { id: 9, text: "Doimiy kuchli chanqoq hissi sizni bezovta qiladimi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'symptoms' },
  { id: 10, text: "Kechasi 2 martadan ko'p peshobga chiqasizmi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'symptoms' },
  { id: 11, text: "Tushunarsiz sababsiz vazn yo'qotish kuzatildimi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'symptoms' },
  { id: 12, text: "Ko'zingiz xiralashishi yoki tumanlashishi kuzatilyaptimi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'symptoms' },
  { id: 13, text: "Oyoq-qo'llaringizda uvishish yoki 'murch' o'rmalash hissi bormi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'symptoms' },
  { id: 14, text: "Tanadagi jarohatlar bitishi qiyinlashganmi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'symptoms' },
  { id: 15, text: "Terida (bo'yin, qo'ltiq) qora dog'lar (akantoz) bormi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'symptoms' },
  { id: 16, text: "Doimiy charchoq va ish qobiliyati pasayishi bormi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'symptoms' },

  // Hayot tarzi
  { id: 17, text: "Kuniga necha soat uxlaysiz?", type: 'text', placeholder: "7 soat", category: 'lifestyle' },
  { id: 18, text: "Kuniga kamida 30 daqiqa jismoniy faol bo'lasizmi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'lifestyle' },
  { id: 19, text: "Sabzavot va mevalarni har kuni iste'mol qilasizmi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'lifestyle' },
  { id: 20, text: "Tez-tez tayyor shirinliklar yoki gazli ichimliklar ichasizmi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'lifestyle' },
  { id: 21, text: "Chekasizmi yoki alkogol iste'mol qilasizmi?", type: 'text', placeholder: "Masalan: Chekmayman", category: 'lifestyle' },
  { id: 22, text: "Stress darajangiz qanday?", type: 'text', placeholder: "Doimiy, O'rta yoki Past", category: 'lifestyle' },
  { id: 23, text: "Ishtahangiz g'ayritabiiy darajada yuqorimi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'symptoms' },
  { id: 24, text: "Terlash darajasi (ayniqsa kechasi) ortganmi?", type: 'choice', options: ["Ha", "Yo'q"], category: 'symptoms' },
  { id: 25, text: "Qo'shimcha tibbiy shikoyatlaringiz bormi?", type: 'text', placeholder: "Batafsil yozing yoki 'Yo'q'", category: 'symptoms' },
];

const DiabetesTest: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const user = authService.getCurrentUser();
    if (user?.email) {
      const savedHistory = await authService.getUserHistory(user.email);
      setHistory(savedHistory.filter((item: any) => item.type === 'diabetes'));
    }
  };

  const handleInputChange = (id: number, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const calculateCompletion = () => {
    const answeredCount = Object.keys(answers).filter(key => answers[parseInt(key)]?.trim().length > 0).length;
    return Math.round((answeredCount / DIABETES_QUESTIONS.length) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calculateCompletion() < 100) {
      setError("Iltimos, barcha 25 ta savolga javob bering. Aniq tahlil uchun bu juda muhim!");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const formattedAnswers = DIABETES_QUESTIONS.map(q => ({
        savol: q.text,
        javob: answers[q.id]
      }));

      const analysis = await analyzeDiabetesRisk(formattedAnswers);
      setResult(analysis);
      loadHistory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Tahlil jarayonida xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetTest = () => {
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'personal': return '👤';
      case 'clinical': return '🏥';
      case 'symptoms': return '🤒';
      case 'lifestyle': return '🚴';
      default: return '❓';
    }
  };

  return (
    <div className="diabetes-bg min-h-screen pt-28 pb-20 relative">
      <div className="absolute inset-0 bg-teal-950/70 backdrop-blur-[5px] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up">
          <div className="inline-block bg-teal-500/20 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border border-teal-400/30 mb-4 sm:mb-6 shadow-xl">
            <span className="text-teal-300 font-black text-[10px] sm:text-xs tracking-[0.3em] uppercase">Endokrinologiya AI 2.0</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight drop-shadow-2xl">
            Qandli <span className="text-teal-400 italic">Diabet</span> Skriningi
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-teal-50 font-medium leading-relaxed opacity-90 px-4">
            Tibbiy aniqlikka yo'naltirilgan 25 ta savol orqali salomatligingizni tekshiring.
            Xatolik ko'rsatkichi optimallashtirilgan AI tahlili.
          </p>
        </div>

        {result ? (
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-10 gap-6">
              <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg flex items-center">
                <span className="bg-emerald-500 p-3 rounded-xl sm:rounded-2xl mr-4 shadow-xl">🔬</span>
                Tahlil Xulosasi
              </h2>
              <button
                onClick={resetTest}
                className="w-full sm:w-auto bg-white/20 backdrop-blur-md px-8 sm:px-10 py-4 rounded-2xl sm:rounded-[2rem] text-white font-black hover:bg-white/30 transition-all border border-white/30 shadow-2xl flex items-center justify-center group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Yangi Test
              </button>
            </div>

            <div className="glass-panel p-1 rounded-[3.5rem] border-white/20 mb-16 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="bg-white/95 p-12 rounded-[3.4rem] text-slate-800 font-bold whitespace-pre-wrap leading-relaxed text-lg lg:text-xl shadow-inner max-h-[800px] overflow-auto custom-scrollbar">
                {result}
              </div>

              {history.find(h => h.report === result)?.doctor_comment && (
                <div className="p-12 bg-teal-600 text-white border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-80 flex items-center gap-2">
                    <span>👨‍⚕️</span> SHIFOKOR XULOSASI
                  </p>
                  <p className="text-xl font-bold italic leading-relaxed">
                    "{history.find(h => h.report === result)?.doctor_comment}"
                  </p>
                </div>
              )}

              <div className="p-8 bg-teal-900/40 backdrop-blur-md border-t border-white/10 text-center">
                <p className="text-teal-200 font-black text-sm uppercase tracking-widest">
                  🚨 DIQQAT: Yakuniy tashxis faqat shifokor tomonidan laborator tahlillardan so'ng qo'yiladi.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10 animate-fade-in-up">
            {/* Progress Header */}
            <div className="sticky top-24 z-50 glass-panel p-8 rounded-[2.5rem] mb-12 flex flex-col sm:flex-row items-center justify-between border-teal-500/40 shadow-2xl">
              <div className="flex items-center mb-6 sm:mb-0">
                <div className="w-16 h-16 bg-teal-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl mr-5 shadow-lg shadow-teal-500/40 animate-pulse">
                  {calculateCompletion()}%
                </div>
                <div>
                  <p className="text-slate-800 font-black text-lg uppercase tracking-wider">Test Progressi</p>
                  <p className="text-teal-600 font-bold">Hammasini to'ldiring</p>
                </div>
              </div>

              <div className="w-full sm:w-1/3 h-5 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200 shadow-inner">
                <div
                  className="h-full bg-teal-600 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
                  style={{ width: `${calculateCompletion()}%` }}
                ></div>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="hidden lg:flex ml-8 px-12 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-[1.5rem] shadow-xl shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? "..." : "Tahlilni olish"}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/90 backdrop-blur-md text-white p-6 rounded-[2rem] font-black text-center animate-bounce shadow-2xl border-2 border-white/20">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {DIABETES_QUESTIONS.map((q) => (
                <div key={q.id} className="glass-panel p-8 rounded-[2.5rem] border-white/40 hover:border-teal-400/60 transition-all duration-300 shadow-xl group hover:-translate-y-1">
                  <div className="flex items-start mb-6">
                    <span className="bg-teal-100/80 text-teal-700 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mr-4 flex-shrink-0 shadow-sm">
                      {getCategoryIcon(q.category)}
                    </span>
                    <label className="text-xl font-black text-slate-800 leading-tight group-hover:text-teal-900 transition-colors">
                      {q.text}
                    </label>
                  </div>

                  {q.type === 'choice' ? (
                    <div className="flex space-x-4">
                      {q.options?.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInputChange(q.id, opt)}
                          className={`flex-grow py-5 rounded-2xl font-black text-xl transition-all border-2 ${answers[q.id] === opt
                            ? 'bg-teal-600 text-white border-teal-600 shadow-lg scale-[1.02]'
                            : 'bg-white/80 text-slate-500 border-slate-100 hover:border-teal-200 hover:bg-white'
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={answers[q.id] || ''}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        className="input-glass w-full px-8 py-5 rounded-2xl outline-none border-2 border-slate-100 focus:border-teal-500 font-black text-slate-800 text-lg transition-all"
                      />
                      {answers[q.id] && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="py-20 flex justify-center">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full max-w-3xl py-8 bg-teal-600 hover:bg-teal-700 text-white font-black text-3xl rounded-[3rem] shadow-[0_20px_50px_rgba(13,148,136,0.4)] transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center border-4 border-white/20"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mr-6"></div>
                    Tahlil jarayonida...
                  </>
                ) : 'Tahlilni yakunlash'}
              </button>
            </div>
          </form>
        )}

        {/* Improved History */}
        {!result && (
          <div className="mt-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-black text-white flex items-center drop-shadow-lg">
                <span className="bg-teal-500/80 text-white p-4 rounded-2xl mr-5 backdrop-blur-md shadow-2xl">📜</span>
                Tahlillar Tarixi
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setResult(item.report)}
                  className="glass-panel p-10 rounded-[3rem] hover:scale-[1.05] transition-all cursor-pointer group border-l-[15px] border-l-teal-600 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)]"
                >
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-black text-teal-700 bg-teal-100 px-5 py-2 rounded-full uppercase tracking-widest shadow-sm">
                      {item.timestamp}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </div>
                  </div>
                  <h4 className="font-black text-slate-800 text-2xl mb-4 group-hover:text-teal-600 transition-colors">Tibbiy Skrining</h4>
                  <p className="text-slate-500 text-base line-clamp-4 font-bold leading-relaxed opacity-80">
                    {item.report.substring(0, 200)}...
                  </p>
                </div>
              ))}
              {history.length === 0 && (
                <div className="col-span-full py-24 text-center bg-white/10 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-white/20">
                  <p className="text-white font-black text-2xl drop-shadow-md opacity-60">Sizda hali tahlillar mavjud emas.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiabetesTest;
