
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authService.register({ name, email, password });
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      // Aniq xatolikni foydalanuvchiga ko'rsatamiz
      setError(err.message || "Ro'yxatdan o'tishda noma'lum xatolik.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg flex flex-col justify-center py-12 px-4 min-h-screen">
      <div className="absolute inset-0 overlay-dark"></div>
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <div className="glass-panel py-10 px-8 sm:rounded-[3rem] shadow-2xl">
          <h2 className="text-3xl font-black text-slate-800 mb-2 text-center">Ro'yxatdan o'tish</h2>
          <p className="text-center text-slate-400 text-sm mb-8 font-bold">Yangi hisob yaratish</p>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 font-bold text-center text-sm animate-bounce">
                ⚠️ {error}
              </div>
            )}
            
            <input 
              type="text" required value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="To'liq ismingiz" 
              className="input-glass w-full px-5 py-4 rounded-2xl outline-none" 
            />
            
            <input 
              type="email" required value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email manzilingiz" 
              className="input-glass w-full px-5 py-4 rounded-2xl outline-none" 
            />
            
            <input 
              type="password" required value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Xavfsiz parol yarating" 
              className="input-glass w-full px-5 py-4 rounded-2xl outline-none" 
            />
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl disabled:opacity-50 transition-all flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  YUBORILMOQDA...
                </>
              ) : "TASDIQLASH"}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
             <p className="text-slate-400 text-sm font-bold">
               Hisobingiz bormi? <Link to="/login" className="text-indigo-600 underline">Kirish</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
