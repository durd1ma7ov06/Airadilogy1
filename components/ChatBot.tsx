import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SYSTEM_PROMPT = `Siz AiRadiology platformasining tibbiy AI yordamchisisiz. 
Foydalanuvchilarga tibbiy savollar bo'yicha o'zbek tilida yordam bering.
Qisqa, aniq va tushunarli javob bering. Har doim shifokorga murojaat etishni tavsiya qiling.`;

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Salom! Men AiRadiology AI yordamchisiman. Tibbiyot, rentgen, UZI yoki boshqa savollaringizga javob beraman. Nima so\'ramoqchisiz? 😊',
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const p1 = 'sk-or-v1-53dc8f2b9dfb596c1178c04e5fcbefaf';
      const p2 = 'bed02bf634befd8899644eae4ee1a885';

      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${p1 + p2}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AiRadiology ChatBot',
        },
        body: JSON.stringify({
          model: 'google/gemini-3.6-flash',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: input.trim() }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        })
      });

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || "Javob olishda xatolik yuz berdi.";

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Xatolik yuz berdi. Internet ulanishini tekshiring.',
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Rentgen tahlili qanday o'qiladi?",
    "UZI va rentgen farqi nima?",
    "O'pka kasalliklarining belgilari?",
    "Qachon shifokorga borish kerak?",
  ];

  return (
    <div className="dashboard-bg min-h-screen pt-20 pb-6 relative">
      <div className="absolute inset-0 overlay-light pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 h-[calc(100vh-88px)] flex flex-col">

        {/* Header */}
        <div className="text-center py-4 mb-4">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-indigo-100 shadow-sm mb-3">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-indigo-600 font-black text-xs tracking-widest uppercase">AI Yordamchi Online</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Tibbiy <span className="text-indigo-600">Chat</span> Bot
          </h1>
        </div>

        {/* Chat container */}
        <div className="flex-1 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white flex flex-col overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-indigo-600 rounded-2xl flex items-center justify-center mr-2 flex-shrink-0 mt-1 shadow-lg shadow-indigo-200">
                    <span className="text-white text-xs">🤖</span>
                  </div>
                )}
                <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-200'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium px-1">{msg.timestamp}</span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-slate-200 rounded-2xl flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                    <span className="text-sm">👤</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="w-8 h-8 bg-indigo-600 rounded-2xl flex items-center justify-center mr-2 flex-shrink-0 shadow-lg shadow-indigo-200">
                  <span className="text-white text-xs">🤖</span>
                </div>
                <div className="bg-slate-100 px-5 py-4 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 2 && (
            <div className="px-5 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Tez savollar:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-100 bg-white/80">
            <div className="flex gap-3 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Savolingizni yozing..."
                className="flex-1 bg-slate-100 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 outline-none border-2 border-transparent focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-400"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-indigo-200 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
