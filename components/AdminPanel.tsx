
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { communicationService } from '../services/communicationService';
import { User } from '../types';
import ChatWindow from './ChatWindow';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [allHistories, setAllHistories] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState('');

  const loadData = async () => {
    const u = await authService.getUsers();
    const h = await authService.getAllHistories();
    setUsers(u);
    setAllHistories(h);
  };

  useEffect(() => {
    loadData();
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userHistory = allHistories.filter(h => h.userEmail === selectedUser?.email);

  const handleRoleToggle = async (user: User) => {
    if (isChangingRole) return;

    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const actionText = newRole === 'admin' ? 'admin huquqlarini bermoqchimisiz' : 'admin huquqlarini olmoqchimisiz';

    if (!confirm(`${user.name}ga ${actionText}?`)) {
      return;
    }

    setIsChangingRole(true);
    try {
      await authService.updateUserRole(user.id, newRole);
      await loadData(); // Refresh user list
      alert(`${user.name}ning roli muvaffaqiyatli o'zgartirildi!`);
    } catch (error: any) {
      alert(`Xatolik: ${error.message}`);
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleAddComment = async (historyId: string, patientEmail: string) => {
    if (!tempComment.trim()) return;
    try {
      await communicationService.addDoctorComment(historyId, tempComment, patientEmail);
      await loadData();
      setCommentingId(null);
      setTempComment('');
      alert('Izoh muvaffaqiyatli saqlandi!');
    } catch (error: any) {
      alert(`Xatolik: ${error.message}`);
    }
  };

  const isSuperAdmin = authService.isSuperAdmin(currentUser);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">

        {!selectedUser ? (
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami Foydalanuvchilar</p>
                <p className="text-3xl font-black text-slate-900">{users.length}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami Tahlillar</p>
                <p className="text-3xl font-black text-indigo-600">{allHistories.length}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">O'pka Rentgen</p>
                <p className="text-3xl font-black text-blue-600">{allHistories.filter(h => h.type === 'lung').length}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">UZI & Diabet</p>
                <p className="text-3xl font-black text-teal-600">{allHistories.filter(h => h.type !== 'lung').length}</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-8 sm:mb-10 gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Boshqaruv <span className="text-indigo-600">Markazi</span></h1>
                <p className="text-slate-400 font-bold text-[10px] sm:text-sm uppercase tracking-widest">Foydalanuvchilar ro'yxati va tahlillar</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <button
                  onClick={() => authService.exportDatabase()}
                  className="bg-emerald-600 text-white px-6 py-4 sm:py-3 rounded-2xl font-black text-[10px] shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  BAZANI EKSPORT QILISH
                </button>
                <input
                  type="text"
                  placeholder="Ism yoki email bo'yicha qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-6 py-3 bg-white rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-sm w-full md:w-80 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:border-indigo-200 transition-all group flex items-center gap-4 relative overflow-hidden"
                >
                  <div
                    onClick={() => setSelectedUser(user)}
                    className="flex items-center gap-4 flex-grow cursor-pointer"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg sm:text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-black text-sm sm:text-base text-slate-800 group-hover:text-indigo-600 transition-colors">{user.name}</h4>
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mb-1 lg:mb-2">{user.email}</p>
                      <span className={`text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-lg ${user.role === 'super_admin' ? 'bg-red-100 text-red-600' :
                        user.role === 'admin' ? 'bg-orange-100 text-orange-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                        {user.role === 'super_admin' ? '👑 SUPER ADMIN' : user.role === 'admin' ? 'ADMIN' : 'BEMOR'}
                      </span>
                    </div>
                  </div>

                  {isSuperAdmin && user.role !== 'super_admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleToggle(user);
                      }}
                      disabled={isChangingRole}
                      className={`px-4 py-2 rounded-xl font-black text-[9px] transition-all whitespace-nowrap ${user.role === 'admin'
                        ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                        } ${isChangingRole ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {user.role === 'admin' ? 'ADMINNI AYIRISH' : 'ADMIN BERISH'}
                    </button>
                  )}

                  {!isSuperAdmin && (
                    <div className="text-slate-300 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setSelectedUser(null)}
              className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-xs group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              FOYDALANUVCHILAR RO'YXATIGA QAYTISH
            </button>

            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100 mb-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none hidden md:block">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
              </div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row gap-8 items-center mb-12 border-b pb-12 border-slate-50">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center md:text-left flex-grow">
                    <h2 className="text-4xl font-black text-slate-900 mb-2">{selectedUser.name}</h2>
                    <p className="text-xl font-bold text-indigo-600 mb-4">{selectedUser.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <span className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: {selectedUser.id}</span>
                      <span className="bg-indigo-50 px-4 py-2 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest">Tahlillar: {userHistory.length}</span>
                      <button
                        onClick={() => setIsChatOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        CHATNI OCHISH
                      </button>
                    </div>
                  </div>
                </div>

                {/* Profil Ma'lumotlari */}
                <div className="mb-12">
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600">👤</span> Shaxsiy Ma'lumotlar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefon raqami</p>
                      <p className="font-bold text-slate-700">{selectedUser.phone || "Kiritilmagan"}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telegram</p>
                      <p className="font-bold text-indigo-600">{selectedUser.telegram || "Kiritilmagan"}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tug'ilgan sana</p>
                      <p className="font-bold text-slate-700">
                        {selectedUser.birth_day && selectedUser.birth_month && selectedUser.birth_year
                          ? `${selectedUser.birth_day}.${selectedUser.birth_month}.${selectedUser.birth_year}`
                          : selectedUser.birth_year || "Kiritilmagan"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jinsi</p>
                      <p className="font-bold text-slate-700">
                        {selectedUser.gender === 'male' ? 'Erkak' : selectedUser.gender === 'female' ? 'Ayol' : "Kiritilmagan"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bo'y / Vazn / BMI</p>
                      <p className="font-bold text-slate-700">
                        {selectedUser.height && selectedUser.weight && Number(selectedUser.height) > 0
                          ? `${selectedUser.height}sm / ${selectedUser.weight}kg (BMI: ${(Number(selectedUser.weight) / ((Number(selectedUser.height) / 100) ** 2)).toFixed(1)})`
                          : "Kiritilmagan"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Qon guruhi</p>
                      <p className="font-bold text-rose-600">
                        {selectedUser.blood_type ? `${selectedUser.blood_type} (${selectedUser.rh_factor || ''})` : "Kiritilmagan"}
                      </p>
                    </div>
                    <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 transition-all hover:bg-white hover:shadow-md lg:col-span-2">
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Allergiyalar</p>
                      <p className="font-bold text-slate-700">{selectedUser.allergies || "Yo'q"}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md lg:col-span-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uy manzili</p>
                      <p className="font-bold text-slate-700">{selectedUser.address || "Kiritilmagan"}</p>
                    </div>
                    <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 lg:col-span-3">
                      <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Surunkali Kasalliklar</p>
                      <p className="font-bold text-slate-700 text-sm leading-relaxed">
                        {selectedUser.chronic_diseases || "Ma'lumot yo'q..."}
                      </p>
                    </div>
                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 lg:col-span-3">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Foydalanuvchi haqida (Bio)</p>
                      <p className="font-bold text-slate-700 italic leading-relaxed text-sm">
                        {selectedUser.bio || "Bio kiritilmagan..."}
                      </p>
                    </div>
                  </div>
                </div>

                {isChatOpen && currentUser && (
                  <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-xl h-[600px]">
                      <ChatWindow
                        currentUser={currentUser}
                        targetUser={selectedUser}
                        onClose={() => setIsChatOpen(false)}
                      />
                    </div>
                  </div>
                )}

                <h3 className="text-2xl font-black text-slate-800 mb-8 border-b pb-4 flex items-center gap-3">
                  <span className="text-indigo-600">📋</span> Tahlillar Tarixi
                </h3>

                {userHistory.length === 0 ? (
                  <div className="py-24 text-center border-4 border-dashed rounded-[3rem] text-slate-300 font-black text-xl">
                    BU FOYDALANUVCHIDA HALI TAHLILLAR MAVJUD EMAS
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userHistory.map((h, i) => (
                      <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${h.type === 'lung' ? 'bg-indigo-500' : h.type === 'uzi' ? 'bg-blue-500' : 'bg-teal-500'
                              }`}>
                              {h.type === 'lung' ? 'RT' : h.type === 'uzi' ? 'UZI' : 'DIA'}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 uppercase tracking-widest text-sm">
                                {h.type === 'lung' ? "O'pka Rentgen Tahlili" : h.type === 'uzi' ? "Ultratovush (UZI) Tahlili" : "Diabet Skriningi"}
                              </p>
                              <p className="text-xs font-bold text-slate-400 italic">{h.timestamp}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setCommentingId(h.id);
                              setTempComment(h.doctor_comment || '');
                            }}
                            className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
                          >
                            {h.doctor_comment ? 'IZOHNI TAHRIRLASH' : 'IZOH QOLDIRISH'}
                          </button>
                        </div>
                        {h.imageUrl && (
                          <div className="mb-6 group/img relative cursor-zoom-in">
                            <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-2xl z-10 flex items-center justify-center">
                              <span className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-black text-[10px] shadow-xl transform translate-y-4 group-hover/img:translate-y-0 transition-transform">
                                RASMNI TO'LIQ KO'RISH
                              </span>
                            </div>
                            <img
                              src={h.imageUrl}
                              alt="Tahlil rasmi"
                              className="w-full max-h-[400px] object-contain bg-slate-100 rounded-2xl border border-slate-200 shadow-sm transition-all"
                              onClick={() => window.open(h.imageUrl, '_blank')}
                            />
                            <div className="absolute top-2 right-2 z-20">
                              <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
                                {h.type === 'lung' ? 'Rentgen' : 'UZI'}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-inner mb-4 relative">
                          <div className="absolute -top-3 left-4 bg-indigo-600 text-white px-3 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase shadow-md">
                            AI HISOBOTI
                          </div>
                          <div className="text-sm text-slate-600 leading-relaxed font-bold whitespace-pre-wrap pt-2">
                            {h.report}
                          </div>
                        </div>


                        {(h.doctor_comment || commentingId === h.id) && (
                          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <span>👨‍⚕️</span> SHIFOKOR XULOSASI
                            </p>
                            {commentingId === h.id ? (
                              <div className="space-y-3">
                                <textarea
                                  value={tempComment}
                                  onChange={(e) => setTempComment(e.target.value)}
                                  placeholder="Shifokor xulosasini bu yerga yozing..."
                                  className="w-full p-4 rounded-xl border border-indigo-200 outline-none focus:ring-2 ring-indigo-500/20 font-bold text-sm min-h-[100px]"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAddComment(h.id, selectedUser.email)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-black text-[10px] hover:bg-indigo-700"
                                  >
                                    SAQLASH
                                  </button>
                                  <button
                                    onClick={() => setCommentingId(null)}
                                    className="text-slate-400 px-4 py-2 font-black text-[10px]"
                                  >
                                    BEKOR QILISH
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm font-bold text-slate-700 italic">
                                {h.doctor_comment}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
