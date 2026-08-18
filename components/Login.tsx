import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError("Email yoki parol noto'g'ri");
      }
    } catch (err) {
      setError("Tizimga kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overlay-dark pointer-events-none"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <h2 className="text-center text-4xl font-black text-white tracking-tight drop-shadow-xl mb-2">AiRadiology</h2>
        <p className="text-center text-indigo-100 font-medium opacity-80 italic">AI bilan tibbiy tahlil platformasi</p>
      </div>

      <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="glass-panel py-10 px-8 shadow-2xl sm:rounded-[3rem]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 p-4 rounded-2xl text-red-600 font-bold text-center">
                {error}
              </div>
            )}

            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-glass block w-full px-5 py-4 rounded-2xl outline-none"
            />
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol"
              className="input-glass block w-full px-5 py-4 rounded-2xl outline-none"
            />

            <button
              type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl shadow-xl text-lg font-black text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
