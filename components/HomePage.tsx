import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Hooks
const useCounter = (end: number, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
};

const useVisible = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
};

// Medical particle system
const MedicalParticle = ({ delay = 0 }: { delay?: number }) => {
  const [pos, setPos] = useState({ x: Math.random() * 100, y: Math.random() * 100 });
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setPos({ x: Math.random() * 100, y: Math.random() * 100 });
      }, 8000 + Math.random() * 4000);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div
      className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30 transition-all duration-[8000ms] ease-in-out"
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, filter: 'blur(0.5px)', boxShadow: '0 0 8px rgba(0,229,255,0.5)' }}
    />
  );
};

// Stat Card Component
const StatCard = ({ value, suffix, label, description }: any) => {
  const { ref, visible } = useVisible();
  const count = useCounter(value, 2000, visible);
  
  return (
    <div ref={ref} className="glass-premium rounded-2xl p-8 text-center group hover:scale-105 transition-all duration-500 border border-cyan-500/10 hover:border-cyan-500/30">
      <div className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
        {count}{suffix}
      </div>
      <div className="text-white font-bold text-lg mb-1">{label}</div>
      <p className="text-slate-400 text-sm">{description}</p>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-medical-dark">

      {/* ===== HERO SECTION - Premium Medical AI ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#050816] via-[#0B1220] to-[#050816]">
        
        {/* Medical grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00E5FF08_1px,transparent_1px),linear-gradient(to_bottom,#00E5FF08_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500 rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse-slow animation-delay-2000"></div>

        {/* Medical particles */}
        {Array.from({ length: 50 }).map((_, i) => (
          <MedicalParticle key={i} delay={i * 80} />
        ))}

        {/* Spotlight effect */}
        <div
          className="absolute pointer-events-none inset-0 transition-all duration-300"
          style={{ 
            background: `radial-gradient(circle 600px at ${mousePos.x}px ${mousePos.y}px, rgba(0,229,255,0.08), transparent 50%)`,
          }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Content */}
            <div className="text-left space-y-8 animate-fade-in-up">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-premium border border-cyan-500/20">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </div>
                <span className="text-cyan-400 text-xs font-bold tracking-wider uppercase">AI-Powered Medical Analysis</span>
              </div>

              {/* Main headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                <span className="text-white">AiRadiology</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  AI-powered X-ray
                </span>
                <br />
                <span className="text-white">analysis for faster</span>
                <br />
                <span className="text-white">and smarter</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">diagnostics</span>
              </h1>

              {/* Subtext */}
              <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
                Analyze medical X-rays with AI-powered <span className="text-cyan-400 font-semibold">Classification</span>, 
                <span className="text-blue-400 font-semibold"> Detection</span> and 
                <span className="text-purple-400 font-semibold"> Segmentation</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link to="/analysis"
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  <span>Try AiRadiology</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                <button
                  className="px-8 py-4 glass-premium border border-cyan-500/30 text-white rounded-xl font-bold text-lg hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <span>Explore AI Model</span>
                </button>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-4 pt-4">
                {[
                  { icon: '⚡', text: '<10 sec Analysis' },
                  { icon: '🎯', text: '95%+ Accuracy' },
                  { icon: '🔒', text: 'HIPAA Compliant' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: MEGA 3D X-ray Medical Visualization */}
            <div className="relative hidden lg:block animate-fade-in-up delay-300">
              <div className="relative w-full h-[600px]">
                
                {/* Main 3D X-ray Display */}
                <div className="absolute inset-0 glass-premium rounded-3xl border border-cyan-500/20 overflow-hidden p-8 shadow-2xl shadow-cyan-500/10">
                  
                  {/* Multiple scanning lines */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent scan-animation opacity-60 shadow-lg shadow-cyan-400/50"></div>
                    <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent scan-animation opacity-40 shadow-lg shadow-blue-400/50" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
                  </div>

                  {/* Chest X-ray Simulation */}
                  <div className="relative w-full h-full bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-2xl border border-cyan-500/10 overflow-hidden">
                    
                    {/* Medical Grid */}
                    <div className="absolute inset-0 opacity-20">
                      {/* Vertical lines */}
                      {[...Array(10)].map((_, i) => (
                        <div key={`v-${i}`} className="absolute h-full w-px bg-cyan-400/30" style={{ left: `${i * 10}%` }}></div>
                      ))}
                      {/* Horizontal lines */}
                      {[...Array(10)].map((_, i) => (
                        <div key={`h-${i}`} className="absolute w-full h-px bg-cyan-400/30" style={{ top: `${i * 10}%` }}></div>
                      ))}
                    </div>

                    {/* 3D Chest/Lung Representation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Ribs structure (simplified) */}
                      <svg className="absolute w-96 h-96 opacity-30" viewBox="0 0 200 200">
                        <defs>
                          <linearGradient id="ribGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#00E5FF', stopOpacity: 0.6 }} />
                            <stop offset="100%" style={{ stopColor: '#6C63FF', stopOpacity: 0.2 }} />
                          </linearGradient>
                        </defs>
                        {/* Spine */}
                        <rect x="95" y="20" width="10" height="160" fill="url(#ribGrad)" rx="5" />
                        {/* Ribs - left side */}
                        {[40, 60, 80, 100, 120].map((y, i) => (
                          <ellipse key={`rib-l-${i}`} cx="100" cy={y} rx={50 - i * 5} ry="8" fill="none" stroke="url(#ribGrad)" strokeWidth="2" opacity="0.6" className="animate-pulse" style={{ animationDelay: `${i * 0.2}s`, animationDuration: '3s' }} />
                        ))}
                      </svg>

                      {/* Lungs - 3D effect */}
                      <div className="relative w-64 h-64">
                        {/* Left lung */}
                        <div className="absolute left-8 top-16 w-24 h-40 rounded-tl-full rounded-bl-full bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border-2 border-cyan-500/30 animate-pulse backdrop-blur-sm" style={{ animationDuration: '4s', transform: 'perspective(500px) rotateY(-15deg)' }}>
                          {/* Lung segments */}
                          <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-cyan-400/10 border border-cyan-400/30 animate-ping-slow"></div>
                          <div className="absolute bottom-8 left-6 w-10 h-10 rounded-full bg-blue-400/10 border border-blue-400/30 animate-ping-slow animation-delay-1000"></div>
                        </div>

                        {/* Right lung */}
                        <div className="absolute right-8 top-16 w-24 h-40 rounded-tr-full rounded-br-full bg-gradient-to-bl from-blue-500/20 to-purple-600/10 border-2 border-blue-500/30 animate-pulse backdrop-blur-sm" style={{ animationDuration: '4s', animationDelay: '0.5s', transform: 'perspective(500px) rotateY(15deg)' }}>
                          {/* Lung segments */}
                          <div className="absolute top-6 right-4 w-12 h-12 rounded-full bg-blue-400/10 border border-blue-400/30 animate-ping-slow animation-delay-2000"></div>
                          <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-purple-400/10 border border-purple-400/30 animate-ping-slow"></div>
                        </div>

                        {/* Heart position indicator */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-rose-500/20 to-pink-600/10 rounded-full border-2 border-rose-500/30 animate-pulse" style={{ animationDuration: '2s', clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 50% 85%, 18% 100%, 0% 38%)' }}>
                          <div className="absolute inset-2 bg-rose-400/20 rounded-full animate-ping-slow"></div>
                        </div>
                      </div>

                      {/* AI Detection Boxes */}
                      <div className="absolute top-20 left-20 w-32 h-24 border-2 border-yellow-400 rounded-lg animate-pulse" style={{ animationDuration: '3s' }}>
                        <div className="absolute -top-6 left-0 px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded">
                          Detection: 89%
                        </div>
                      </div>

                      <div className="absolute bottom-24 right-24 w-28 h-20 border-2 border-orange-400 rounded-lg animate-pulse animation-delay-1000" style={{ animationDuration: '3s' }}>
                        <div className="absolute -top-6 right-0 px-2 py-1 bg-orange-400 text-black text-xs font-bold rounded">
                          Alert: 76%
                        </div>
                      </div>

                      {/* Scanning circles */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute w-72 h-72 border border-cyan-500/20 rounded-full animate-ping-slow"></div>
                        <div className="absolute w-56 h-56 border border-blue-500/20 rounded-full animate-ping-slow animation-delay-1000"></div>
                        <div className="absolute w-40 h-40 border border-purple-500/20 rounded-full animate-ping-slow animation-delay-2000"></div>
                      </div>
                    </div>

                    {/* AI Analysis Data Points */}
                    <div className="absolute top-8 right-8 space-y-2">
                      <div className="px-3 py-2 glass-premium rounded-lg border border-cyan-500/20 text-xs font-mono">
                        <div className="flex items-center gap-2 text-cyan-400 mb-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                          <span className="font-bold">Classification</span>
                        </div>
                        <div className="text-white">Normal: 85%</div>
                      </div>
                      
                      <div className="px-3 py-2 glass-premium rounded-lg border border-blue-500/20 text-xs font-mono">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-500"></div>
                          <span className="font-bold">Detection</span>
                        </div>
                        <div className="text-white">2 regions</div>
                      </div>
                      
                      <div className="px-3 py-2 glass-premium rounded-lg border border-purple-500/20 text-xs font-mono">
                        <div className="flex items-center gap-2 text-purple-400 mb-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-1000"></div>
                          <span className="font-bold">Segmentation</span>
                        </div>
                        <div className="text-white">Processing...</div>
                      </div>
                    </div>

                    {/* Processing Status */}
                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="glass-premium rounded-xl p-4 border border-cyan-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-cyan-400 text-sm font-bold">AI Analysis</span>
                          <span className="text-white text-sm font-mono">8.3s</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Corner Markers */}
                    {[
                      { top: '16px', left: '16px' },
                      { top: '16px', right: '16px' },
                      { bottom: '16px', left: '16px' },
                      { bottom: '16px', right: '16px' },
                    ].map((pos, i) => (
                      <div key={i} className="absolute w-6 h-6 border-2 border-cyan-400/40" style={pos}>
                        <div className={`absolute w-full h-full border-2 border-cyan-400/60 animate-ping-slow`} style={{ animationDelay: `${i * 0.3}s` }}></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating 3D Info Cards */}
                <div className="absolute -top-6 -right-6 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white text-sm font-bold shadow-2xl shadow-cyan-500/40 animate-float backdrop-blur-xl border border-white/20" style={{ transform: 'perspective(500px) rotateX(10deg)' }}>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>AI Active</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 px-5 py-3 glass-premium border-2 border-cyan-500/40 rounded-xl text-cyan-400 text-sm font-bold animate-float animation-delay-2000 backdrop-blur-xl shadow-xl" style={{ transform: 'perspective(500px) rotateX(-10deg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                    </div>
                    <span>95% Accurate</span>
                  </div>
                </div>

                <div className="absolute top-1/2 -right-8 px-4 py-2 glass-premium border border-purple-500/30 rounded-lg text-purple-400 text-xs font-bold animate-float animation-delay-1000 backdrop-blur-xl" style={{ transform: 'translateY(-50%) perspective(500px) rotateY(-15deg)' }}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🧠</div>
                    <div>Deep Learning</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors">
            <span className="text-xs font-medium">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ===== AI DEMO - Interactive 3D Medical Visualization ===== */}
      <section className="py-32 bg-gradient-to-b from-[#0B1220] to-[#050816] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(108,99,255,0.05),transparent_50%)]"></div>
        
        {/* Floating medical icons */}
        <div className="absolute top-20 left-10 w-16 h-16 text-cyan-400/20 animate-float">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div className="absolute bottom-32 right-20 w-20 h-20 text-blue-400/20 animate-float animation-delay-2000">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium border border-cyan-500/20 mb-6">
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Live AI Demo</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6">
              Watch AI <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">in Action</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Interactive demonstration of our triple AI analysis system
            </p>
          </div>

          {/* Demo Dashboard */}
          <div className="glass-premium rounded-3xl border border-cyan-500/10 p-8 animate-fade-in-up delay-200">
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Left: X-ray Viewer */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">X-ray Input</h3>
                  <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:scale-105 transition-transform">
                    Upload Sample
                  </button>
                </div>

                {/* 3D X-ray Container */}
                <div className="relative aspect-square bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-cyan-500/20 overflow-hidden group">
                  
                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-10">
                    {[...Array(8)].map((_, i) => (
                      <div key={`grid-v-${i}`} className="absolute h-full w-px bg-cyan-400" style={{ left: `${i * 12.5}%` }}></div>
                    ))}
                    {[...Array(8)].map((_, i) => (
                      <div key={`grid-h-${i}`} className="absolute w-full h-px bg-cyan-400" style={{ top: `${i * 12.5}%` }}></div>
                    ))}
                  </div>

                  {/* Lung X-ray simulation */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <svg className="w-full h-full opacity-40" viewBox="0 0 300 400">
                      <defs>
                        <radialGradient id="lungGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" style={{ stopColor: '#00E5FF', stopOpacity: 0.3 }} />
                          <stop offset="100%" style={{ stopColor: '#6C63FF', stopOpacity: 0.05 }} />
                        </radialGradient>
                      </defs>
                      
                      {/* Rib cage */}
                      <path d="M150 50 L150 350" stroke="#00E5FF" strokeWidth="3" fill="none" opacity="0.4" />
                      {[80, 120, 160, 200, 240, 280].map((y, i) => (
                        <ellipse key={`rib-${i}`} cx="150" cy={y} rx={60 - i * 3} ry="12" fill="none" stroke="#00E5FF" strokeWidth="2" opacity="0.3" className="animate-pulse" style={{ animationDelay: `${i * 0.2}s`, animationDuration: '4s' }} />
                      ))}

                      {/* Left lung */}
                      <ellipse cx="100" cy="180" rx="50" ry="90" fill="url(#lungGlow)" stroke="#00E5FF" strokeWidth="2" opacity="0.6" className="animate-pulse" style={{ animationDuration: '5s' }} />
                      
                      {/* Right lung */}
                      <ellipse cx="200" cy="180" rx="50" ry="90" fill="url(#lungGlow)" stroke="#00E5FF" strokeWidth="2" opacity="0.6" className="animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />

                      {/* Suspicious area (detection) */}
                      <circle cx="120" cy="160" r="20" fill="#FF6B6B" fillOpacity="0.2" stroke="#FF6B6B" strokeWidth="2" className="animate-pulse" style={{ animationDuration: '2s' }} />
                      <rect x="100" y="140" width="40" height="40" fill="none" stroke="#FFFF00" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                    </svg>

                    {/* AI Detection boxes */}
                    <div className="absolute top-1/4 left-1/4 w-24 h-24 border-2 border-yellow-400 rounded-lg animate-pulse shadow-lg shadow-yellow-400/30" style={{ animationDuration: '3s' }}>
                      <div className="absolute -top-7 left-0 px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded shadow-lg">
                        Suspicious: 87%
                      </div>
                    </div>
                  </div>

                  {/* Scanning line */}
                  <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent scan-animation shadow-lg shadow-cyan-400/50"></div>

                  {/* Corner scanners */}
                  {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
                    <div key={i} className={`absolute ${pos} w-8 h-8 border-2 border-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity`}>
                      <div className="absolute inset-0 border-2 border-cyan-400 animate-ping-slow" style={{ animationDelay: `${i * 0.3}s` }}></div>
                    </div>
                  ))}
                </div>

                {/* Image Info */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass-premium rounded-lg p-3 border border-cyan-500/10">
                    <div className="text-cyan-400 text-xs mb-1">Format</div>
                    <div className="text-white text-sm font-bold">DICOM</div>
                  </div>
                  <div className="glass-premium rounded-lg p-3 border border-cyan-500/10">
                    <div className="text-cyan-400 text-xs mb-1">Size</div>
                    <div className="text-white text-sm font-bold">512x512</div>
                  </div>
                  <div className="glass-premium rounded-lg p-3 border border-cyan-500/10">
                    <div className="text-cyan-400 text-xs mb-1">Quality</div>
                    <div className="text-white text-sm font-bold">High</div>
                  </div>
                </div>
              </div>

              {/* Right: AI Analysis Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">AI Analysis Results</h3>

                {/* Classification */}
                <div className="glass-premium rounded-xl p-5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-bold">Classification</div>
                      <div className="text-cyan-400 text-xs">Disease Identification</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Normal', value: 45, color: 'bg-emerald-500' },
                      { label: 'Pneumonia', value: 35, color: 'bg-orange-500' },
                      { label: 'COVID-19', value: 15, color: 'bg-red-500' },
                      { label: 'Tuberculosis', value: 5, color: 'bg-purple-500' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white font-bold">{item.value}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-1000 animate-pulse`} style={{ width: `${item.value}%`, animationDelay: `${i * 0.2}s`, animationDuration: '3s' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detection */}
                <div className="glass-premium rounded-xl p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-bold">Detection</div>
                      <div className="text-blue-400 text-xs">Suspicious Regions</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-white">Region 1</span>
                      </div>
                      <span className="text-yellow-400 text-sm font-bold">87% confidence</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse animation-delay-500"></div>
                        <span className="text-sm text-white">Region 2</span>
                      </div>
                      <span className="text-orange-400 text-sm font-bold">72% confidence</span>
                    </div>
                  </div>
                </div>

                {/* Segmentation */}
                <div className="glass-premium rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-bold">Segmentation</div>
                      <div className="text-purple-400 text-xs">Affected Areas</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-black text-purple-400 mb-1">23%</div>
                      <div className="text-xs text-slate-400">Left Lung</div>
                    </div>
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-black text-pink-400 mb-1">18%</div>
                      <div className="text-xs text-slate-400">Right Lung</div>
                    </div>
                  </div>
                </div>

                {/* Analysis Time */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white font-semibold">Analysis completed</span>
                  </div>
                  <span className="text-cyan-400 font-bold">8.7s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AI TECHNOLOGY MODULES ===== */}
      <section className="py-24 bg-[#050816] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,255,0.03),transparent_50%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium border border-cyan-500/20 mb-6">
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">AI Technology</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6">
              Triple AI <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Power</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Our advanced AI system combines three powerful modules for comprehensive medical analysis
            </p>
          </div>

          {/* AI Modules Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Classification Module */}
            <div className="glass-premium rounded-2xl p-8 border border-cyan-500/10 hover:border-cyan-500/30 transition-all group animate-fade-in-up">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-cyan-500/30">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Classification</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Identifies possible diseases from X-ray images with 95%+ accuracy using deep learning
              </p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
                <span>Learn more</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Detection Module */}
            <div className="glass-premium rounded-2xl p-8 border border-blue-500/10 hover:border-blue-500/30 transition-all group animate-fade-in-up delay-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-blue-500/30">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Detection</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Detects and localizes suspicious areas with bounding boxes and confidence scores
              </p>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
                <span>Learn more</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Segmentation Module */}
            <div className="glass-premium rounded-2xl p-8 border border-purple-500/10 hover:border-purple-500/30 transition-all group animate-fade-in-up delay-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Segmentation</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Highlights and segments affected regions pixel by pixel for detailed analysis
              </p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold">
                <span>Learn more</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

          </div>

          {/* Connection lines visualization */}
          <div className="mt-12 flex justify-center">
            <div className="glass-premium px-6 py-3 rounded-full border border-cyan-500/20 text-slate-400 text-sm font-medium">
              All modules work together in real-time
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATISTICS ===== */}
      <section className="py-24 bg-gradient-to-b from-[#050816] to-[#0B1220] relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00E5FF05_1px,transparent_1px),linear-gradient(to_bottom,#00E5FF05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard value={95} suffix="%" label="AI Accuracy" description="Medical-grade precision" />
            <StatCard value={3} suffix="" label="AI Modules" description="Classification, Detection, Segmentation" />
            <StatCard value={24} suffix="/7" label="Analysis" description="Always available" />
            <StatCard value={10} suffix="s" label="Speed" description="Lightning fast results" />
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS - Timeline ===== */}
      <section className="py-32 bg-[#0B1220] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,229,255,0.05),transparent_50%)]"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium border border-cyan-500/20 mb-6">
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">How It Works</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6">
              4 Steps to <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Diagnosis</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Our AI-powered workflow transforms your X-ray into actionable insights
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-blue-500/50 to-purple-500/50 transform -translate-x-1/2"></div>

            {/* Steps */}
            {[
              {
                step: '01',
                title: 'Upload X-ray',
                description: 'Securely upload your medical X-ray image in any format (JPEG, PNG, DICOM). Our system supports all standard medical imaging formats.',
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
                color: 'from-cyan-500 to-blue-500',
                align: 'left',
              },
              {
                step: '02',
                title: 'AI Processing',
                description: 'Our triple AI modules analyze the image simultaneously - classification identifies diseases, detection finds suspicious areas, and segmentation highlights affected regions.',
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
                color: 'from-blue-500 to-purple-500',
                align: 'right',
              },
              {
                step: '03',
                title: 'Detection & Segmentation',
                description: 'AI draws bounding boxes around detected anomalies and creates pixel-perfect segmentation masks to highlight affected tissue areas.',
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
                color: 'from-purple-500 to-pink-500',
                align: 'left',
              },
              {
                step: '04',
                title: 'Results',
                description: 'Get comprehensive analysis results including disease classification, confidence scores, detection boxes, segmentation overlays, and downloadable reports in under 10 seconds.',
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                color: 'from-pink-500 to-rose-500',
                align: 'right',
              },
            ].map((step, i) => (
              <div key={i} className={`relative mb-20 lg:mb-32 lg:flex lg:items-center animate-fade-in-up delay-${i * 100} ${
                step.align === 'right' ? 'lg:flex-row-reverse' : ''
              }`}>
                
                {/* Timeline dot */}
                <div className="hidden lg:flex absolute left-1/2 top-0 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full z-10">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-ping opacity-75"></span>
                </div>

                {/* Content card */}
                <div className={`lg:w-5/12 ${step.align === 'right' ? 'lg:ml-auto lg:pl-16' : 'lg:pr-16'}`}>
                  <div className="glass-premium rounded-2xl p-8 border border-cyan-500/10 hover:border-cyan-500/30 transition-all group hover:scale-105">
                    
                    {/* Step number badge */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${step.color} rounded-xl text-white font-black text-lg mb-6 shadow-lg`}>
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className={`inline-flex p-4 bg-gradient-to-r ${step.color} bg-opacity-10 rounded-xl text-cyan-400 mb-6`}>
                      {step.icon}
                    </div>

                    <h3 className="text-2xl font-black text-white mb-4">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16 animate-fade-in-up delay-400">
            <Link to="/analysis"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all">
              <span>Start Analysis Now</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== BENEFITS - Bento Grid ===== */}
      <section className="py-32 bg-gradient-to-b from-[#0B1220] to-[#050816] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(108,99,255,0.05),transparent_50%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium border border-cyan-500/20 mb-6">
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Why Choose Us</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6">
              Built for <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Medical Excellence</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Advanced AI technology meets clinical precision
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                title: 'Lightning Fast',
                description: 'Get results in less than 10 seconds. No waiting, instant analysis.',
                color: 'from-cyan-500 to-blue-500'
              },
              { 
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                title: 'Medical Grade AI',
                description: '95%+ accuracy validated against radiologist diagnoses.',
                color: 'from-blue-500 to-purple-500'
              },
              { 
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
                title: 'HIPAA Compliant',
                description: 'Enterprise-grade security. Your data never leaves your device.',
                color: 'from-purple-500 to-pink-500'
              },
              { 
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
                title: 'Triple AI Power',
                description: 'Classification, Detection, and Segmentation in one platform.',
                color: 'from-pink-500 to-rose-500'
              },
              { 
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
                title: 'Cloud Ready',
                description: 'Access from anywhere, anytime. No installation required.',
                color: 'from-cyan-500 to-blue-500'
              },
              { 
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
                title: 'API Access',
                description: 'Integrate AI diagnosis into your existing healthcare systems.',
                color: 'from-blue-500 to-purple-500'
              },
            ].map((benefit, i) => (
              <div key={i} 
                className={`glass-premium rounded-2xl p-8 border border-cyan-500/10 hover:border-cyan-500/30 transition-all group hover:scale-105 animate-fade-in-up delay-${i * 50}`}>
                <div className={`inline-flex p-4 bg-gradient-to-r ${benefit.color} bg-opacity-10 rounded-xl text-cyan-400 mb-6 group-hover:scale-110 transition-transform`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-3">{benefit.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA - Epic ===== */}
      <section className="py-40 bg-gradient-to-br from-[#050816] via-[#0B1220] to-[#050816] relative overflow-hidden">
        
        {/* Animated beams */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-500 rounded-full mix-blend-screen filter blur-[200px] opacity-10 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-purple-600 rounded-full mix-blend-screen filter blur-[200px] opacity-10 animate-pulse-slow animation-delay-2000"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="animate-fade-in-up">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full glass-premium border border-cyan-500/30 mb-8">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </div>
              <span className="text-cyan-400 text-xs font-bold tracking-wider uppercase">Ready to Transform Diagnostics?</span>
            </div>
            
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight">
              Start analyzing with
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                AI-powered precision
              </span>
            </h2>
            
            <p className="text-xl sm:text-2xl text-slate-400 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload your X-ray and get comprehensive AI analysis in seconds. Join hundreds of medical professionals already using AiRadiology.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-16">
              <Link to="/analysis"
                className="group relative px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-110 active:scale-95 transition-all flex items-center gap-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 text-3xl">🚀</span>
                <span className="relative z-10">Try AiRadiology Free</span>
                <svg className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              
              <Link to="/chat"
                className="px-12 py-6 glass-premium border border-cyan-500/30 text-white rounded-xl font-bold text-xl hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all flex items-center gap-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Talk to AI</span>
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex flex-wrap justify-center gap-12">
              {[
                { value: '570+', label: 'Analyses', icon: '📊' },
                { value: '95%', label: 'Accuracy', icon: '🎯' },
                { value: '<10s', label: 'Speed', icon: '⚡' },
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-pointer">
                  <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">{stat.icon}</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">{stat.value}</div>
                  <div className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
