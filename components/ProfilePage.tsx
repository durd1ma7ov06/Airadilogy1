
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Profile fields
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [telegram, setTelegram] = useState('');
    const [birthDay, setBirthDay] = useState<number | string>('');
    const [birthMonth, setBirthMonth] = useState<number | string>('');
    const [birthYear, setBirthYear] = useState<number | string>('');
    const [gender, setGender] = useState<string>('');
    const [address, setAddress] = useState('');

    // Health fields
    const [weight, setWeight] = useState<number | string>('');
    const [height, setHeight] = useState<number | string>('');
    const [bloodType, setBloodType] = useState('');
    const [rhFactor, setRhFactor] = useState('');
    const [allergies, setAllergies] = useState('');
    const [chronicDiseases, setChronicDiseases] = useState('');

    const months = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ];

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setBio(currentUser.bio || '');
            setPhone(currentUser.phone || '');
            setTelegram(currentUser.telegram || '');
            setBirthDay(currentUser.birth_day || '');
            setBirthMonth(currentUser.birth_month || '');
            setBirthYear(currentUser.birth_year || '');
            setGender(currentUser.gender || '');
            setAddress(currentUser.address || '');
            setWeight(currentUser.weight || '');
            setHeight(currentUser.height || '');
            setBloodType(currentUser.blood_type || '');
            setRhFactor(currentUser.rh_factor || '');
            setAllergies(currentUser.allergies || '');
            setChronicDiseases(currentUser.chronic_diseases || '');
        }
        setLoading(false);
    }, []);

    const calculateBMI = () => {
        if (weight && height && Number(height) > 0) {
            const hMeter = Number(height) / 100;
            return (Number(weight) / (hMeter * hMeter)).toFixed(1);
        }
        return null;
    };

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Vazn yetishmasligi', color: 'text-blue-500' };
        if (bmi < 25) return { label: 'Normal vazn', color: 'text-emerald-500' };
        if (bmi < 30) return { label: 'Ortiqcha vazn', color: 'text-orange-500' };
        return { label: 'Semizlik', color: 'text-rose-500' };
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const updatedUser = await authService.updateProfile(user.id, {
                bio,
                phone,
                telegram,
                birth_day: birthDay ? Number(birthDay) : undefined,
                birth_month: birthMonth ? Number(birthMonth) : undefined,
                birth_year: birthYear ? Number(birthYear) : undefined,
                gender: gender as any,
                address,
                weight: weight ? Number(weight) : undefined,
                height: height ? Number(height) : undefined,
                blood_type: bloodType,
                rh_factor: rhFactor as any,
                allergies,
                chronic_diseases: chronicDiseases
            });
            setUser(updatedUser);
            setMessage({ text: "Profil muvaffaqiyatli saqlandi!", type: 'success' });

            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (error: any) {
            setMessage({ text: error.message || "Xatolik yuz berdi", type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-r-4 border-r-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return <div className="min-h-screen pt-32 text-center font-bold">Iltimos, avval tizimga kiring.</div>;
    }

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
    const bmi = calculateBMI();

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10 animate-fade-in-up">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Mening <span className="text-indigo-600">Profilim</span></h1>
                    <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Sog'ligingiz va shaxsiy ma'lumotlaringiz</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-4 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center">
                            <div className="w-32 h-32 mx-auto bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-100 mb-6">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-1">{user.name}</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{user.email}</p>

                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'super_admin' ? 'bg-rose-50 text-rose-600' :
                                    user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Foydalanuvchi'}
                                </span>
                            </div>

                            {bmi && (
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mt-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tana Vazni Indeksi (BMI)</p>
                                    <p className="text-3xl font-black text-slate-900 mb-1">{bmi}</p>
                                    <p className={`text-[10px] font-black uppercase ${getBMICategory(Number(bmi)).color}`}>
                                        {getBMICategory(Number(bmi)).label}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-100">
                            <h4 className="font-black mb-4 flex items-center gap-3">
                                <span className="text-2xl">💡</span> Sog'lom maslahat
                            </h4>
                            <p className="text-sm font-bold text-indigo-50/80 leading-relaxed">
                                Profilingizdagi tibbiy ma'lumotlarni to'ldirish shifokorlarga sizga aniqroq tashxis qo'yishda yordam beradi.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="md:col-span-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="bg-white p-6 sm:p-8 md:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm">
                            <form onSubmit={handleSave} className="space-y-10">
                                {message.text && (
                                    <div className={`p-4 rounded-2xl font-bold text-center text-sm animate-bounce ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                        }`}>
                                        {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                                    </div>
                                )}

                                {/* Main Section */}
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                        <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600">👤</span> Shaxsiy Ma'lumotlar
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Telefon raqam</label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+998 90 123 45 67"
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Telegram username</label>
                                            <input
                                                type="text"
                                                value={telegram}
                                                onChange={(e) => setTelegram(e.target.value)}
                                                placeholder="@username"
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tug'ilgan sanangiz</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <select
                                                    value={birthDay}
                                                    onChange={(e) => setBirthDay(e.target.value)}
                                                    className="px-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                                >
                                                    <option value="">Kun</option>
                                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                                <select
                                                    value={birthMonth}
                                                    onChange={(e) => setBirthMonth(e.target.value)}
                                                    className="px-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                                >
                                                    <option value="">Oy</option>
                                                    {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                                                </select>
                                                <select
                                                    value={birthYear}
                                                    onChange={(e) => setBirthYear(e.target.value)}
                                                    className="px-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                                >
                                                    <option value="">Yil</option>
                                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Jinsingiz</label>
                                            <select
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                            >
                                                <option value="">Tanlang</option>
                                                <option value="male">Erkak</option>
                                                <option value="female">Ayol</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Uy manzili</label>
                                            <input
                                                type="text"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="Shahar, tuman..."
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Section */}
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3 border-t pt-10 border-slate-50">
                                        <span className="bg-rose-100 p-2 rounded-lg text-rose-600">🩺</span> Tibbiy Ma'lumotlar
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bo'yingiz (cm)</label>
                                            <input
                                                type="number"
                                                value={height}
                                                onChange={(e) => setHeight(e.target.value)}
                                                placeholder="175"
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Vazningiz (kg)</label>
                                            <input
                                                type="number"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                placeholder="70"
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Qon guruhingiz</label>
                                            <select
                                                value={bloodType}
                                                onChange={(e) => setBloodType(e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                            >
                                                <option value="">Tanlang</option>
                                                <option value="A">A (II)</option>
                                                <option value="B">B (III)</option>
                                                <option value="AB">AB (IV)</option>
                                                <option value="O">O (I)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Rezus faktor</label>
                                            <select
                                                value={rhFactor}
                                                onChange={(e) => setRhFactor(e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                            >
                                                <option value="">Tanlang</option>
                                                <option value="+">Musbat (+)</option>
                                                <option value="-">Manfiy (-)</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Allergiyalar</label>
                                            <input
                                                type="text"
                                                value={allergies}
                                                onChange={(e) => setAllergies(e.target.value)}
                                                placeholder="Masalan: Penitsillin, yong'oq..."
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Surunkali kasalliklar</label>
                                            <textarea
                                                rows={2}
                                                value={chronicDiseases}
                                                onChange={(e) => setChronicDiseases(e.target.value)}
                                                placeholder="Mavjud surunkali kasalliklaringizni yozing..."
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all resize-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t pt-10 border-slate-50">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                                    <textarea
                                        rows={3}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="O'zingiz haqingizda..."
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                                >
                                    {saving ? (
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                            O'ZGARISHLARNI SAQLASH
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
