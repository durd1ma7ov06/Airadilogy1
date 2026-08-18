
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { AnalysisResult, User } from '../types';
import { Link } from 'react-router-dom';

const DoctorConclusions: React.FC = () => {
    const [history, setHistory] = useState<AnalysisResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            loadHistory(currentUser.email);
        }
    }, []);

    const loadHistory = async (email: string) => {
        try {
            const data = await authService.getUserHistory(email);
            // Filter only those with doctor comments
            const commented = data.filter(h => h.doctor_comment).sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setHistory(commented);
        } catch (error) {
            console.error("Error loading conclusions:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-r-4 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Shifokor <span className="text-indigo-600">Xulosalari</span></h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Tahlillar bo'yicha mutaxassis fikrlari</p>
                    </div>
                    <Link
                        to="/"
                        className="w-full sm:w-auto bg-white px-6 py-4 sm:py-3 rounded-2xl font-black text-xs text-slate-400 border border-slate-100 shadow-sm hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center gap-2 group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                        BOSH SAHIFA
                    </Link>
                </div>

                {history.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Hozircha xulosalar yo'q</h3>
                        <p className="text-slate-400 font-bold">Tahlillaringiz shifokorlar tomonidan ko'rib chiqilgach, bu yerda xulosalar paydo bo'ladi.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {history.map((h) => (
                            <div key={h.id} className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all animate-fade-in-up">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black shadow-lg text-sm sm:text-base ${h.type === 'lung' ? 'bg-indigo-500' : h.type === 'uzi' ? 'bg-blue-500' : 'bg-teal-500'
                                            }`}>
                                            {h.type === 'lung' ? 'RT' : h.type === 'uzi' ? 'UZI' : 'DIA'}
                                        </div>
                                        <div>
                                            <p className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                                                {h.type === 'lung' ? "O'pka Rentgen" : h.type === 'uzi' ? "Ultratovush (UZI)" : "Diabet Skriningi"}
                                            </p>
                                            <p className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                                                {new Date(h.timestamp).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                                        Shifokor ko'rgan
                                    </span>
                                </div>

                                <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 mb-6 relative">
                                    <div className="absolute -top-3 left-6 bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
                                        👨‍⚕️ MUTAXASSIS XULOSASI
                                    </div>
                                    <p className="text-slate-700 font-bold leading-relaxed italic">
                                        "{h.doctor_comment}"
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahlil natijasi (AI hisoboti)</p>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600 text-sm font-bold line-clamp-3 overflow-hidden mask-fade-bottom">
                                        {h.report}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorConclusions;
