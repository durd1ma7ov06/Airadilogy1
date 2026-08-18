
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { Link } from 'react-router-dom';

interface DoctorsListProps {
    currentUser: User;
}

const DoctorsList: React.FC<DoctorsListProps> = ({ currentUser }) => {
    const [doctors, setDoctors] = useState<User[]>([]);

    useEffect(() => {
        const fetchDoctors = async () => {
            const allUsers = await authService.getUsers();
            const onlyDoctors = allUsers.filter(u => u.role === 'admin' || u.role === 'super_admin');
            setDoctors(onlyDoctors);
        };
        fetchDoctors();
    }, []);

    return (
        <div className="min-h-screen pt-28 pb-20 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Shifokorlar bilan <span className="text-indigo-600">Bog'lanish</span></h1>
                    <p className="text-sm sm:text-base text-slate-500 font-bold px-4">Savollaringiz bo'lsa, mutaxassislarimiz bilan maslahatlashing</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {doctors.map(doc => (
                        <div
                            key={doc.id}
                            className="bg-white p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col sm:flex-row items-center justify-between group gap-4"
                        >
                            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg flex-shrink-0">
                                    {doc.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-black text-slate-800">{doc.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {doc.role === 'super_admin' ? 'Bosh Shifokor' : 'Mutaxassis'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link
                                to="/chat"
                                className="w-full sm:w-auto bg-indigo-50 text-indigo-600 px-8 py-4 sm:py-3 rounded-xl sm:rounded-2xl text-center font-black text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                                XABAR YOZISH
                            </Link>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default DoctorsList;
