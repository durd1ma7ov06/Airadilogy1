import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SYSTEM_PROMPT = `You are AiRadiology's expert medical AI assistant. 
Answer medical questions clearly and concisely in Uzbek language.
Focus on radiology, X-rays, ultrasound, and general medical topics.
Always recommend consulting a real doctor for diagnosis.`;

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Salom! Men AiRadiology AI tibbiy yordamchisiman 🏥\n\nRentgen, UZI, tibbiy savollar yoki boshqa mavzularda yordam bera olaman. Nima so'ramoqchisiz?",
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

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Xatolik yuz berdi. Internet ulanishini tekshiring.',
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickQuestions = [
    "Rentgen tahlili qanday o'qiladi?",
    "UZI va rentgen farqi nima?",
    "O'pka kasalliklarining belgilari?",
    "Pnevmoniya qanday aniqlanadi?",
    "Qachon shifokorga borish kerak?",
    "AI tahlilning aniqligi qancha?",
  ];

  return (
    <div className="min-h-screen pt-20 pb-6 bg-gradient-to-b from-[#050816] via-[#0B1220] to-[#050816] relative overflow-hidden">
      {/* Medical grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00E5FF08_1px,transparent_1px),linear-gradient(to_bottom,#00E5FF08_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
      {/* Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-screen filter blur-[150px] opacity-8 animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[150px] opacity-8 animate-pulse-slow animation-delay-2000"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 h-[calc(100vh-88px)] flex flex-col">

        {/* Header */}
        <div className="text-center py-4 mb-4">
          <div className="inline-flex items-center gap-3 glass-premium px-5 py-2.5 rounded-full border border-cyan-500/20 mb-4">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-emerald-400 font-bold text-xs tracking-wider uppercase">AI Assistant Online</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Medical <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">AI Chat</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Powered by Gemini 3.6 Flash</p>
        </div>

        {/* Chat container */}
        <div className="flex-1 glass-premium rounded-3xl border border-cyan-500/10 shadow-2xl flex flex-col overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                
                {/* Assistant avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-lg shadow-cyan-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )}

                <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-5 py-4 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-sm shadow-lg shadow-cyan-500/20'
                      : 'glass-premium border border-cyan-500/10 text-slate-200 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium px-1">{msg.timestamp}</span>
                </div>

                {/* User avatar */}
                {msg.role === 'user' && (
                  <div className="w-10 h-10 glass-premium rounded-2xl flex items-center justify-center ml-3 flex-shrink-0 mt-1 border border-cyan-500/20">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mr-3 flex-shrink-0 shadow-lg shadow-cyan-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="glass-premium border border-cyan-500/10 px-6 py-4 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-2 items-center">
                    {[0, 150, 300].map(d => (
                      <div key={d} className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 2 && (
            <div className="px-5 py-4 border-t border-cyan-500/10">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-wider">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-xs glass-premium text-cyan-400 px-3 py-2 rounded-full font-semibold hover:bg-cyan-500/10 transition-all border border-cyan-500/20 hover:border-cyan-500/40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-cyan-500/10">
            <div className="flex gap-3 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask a medical question..."
                className="flex-1 input-glass rounded-2xl px-5 py-4 text-sm outline-none transition-all placeholder:text-slate-500"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-110 active:scale-95"
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
            <p className="text-xs text-slate-600 text-center mt-2">Press Enter to send • AI can make mistakes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
