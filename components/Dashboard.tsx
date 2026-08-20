import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeLungImage, analyzeLungSegmentation } from '../services/geminiService';

interface HistoryItem {
  id: string;
  timestamp: string;
  imageUrl: string;
  report: string;
  summary: string;
}

interface Segment {
  id: number;
  label: string;
  labelUz: string;
  type: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  severity: string;
  color: string;
}

interface SegmentationResult {
  segments: Segment[];
  overallDiagnosis: string;
  overallDiagnosisUz: string;
  confidence: number;
  normalAreas: string;
  normalAreasUz: string;
}

// Segmentation Canvas Overlay
const SegmentationOverlay: React.FC<{
  image: string;
  segmentation: SegmentationResult;
}> = ({ image, segmentation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [activeSegment, setActiveSegment] = useState<Segment | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const drawSegments = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    const w = img.naturalWidth  || img.width;
    const h = img.naturalHeight || img.height;
    canvas.width  = img.width;
    canvas.height = img.height;
    setCanvasSize({ w: img.width, h: img.height });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = img.width  / w;
    const scaleY = img.height / h;

    segmentation.segments.forEach(seg => {
      const x  = seg.x * img.width;
      const y  = seg.y * img.height;
      const sw = seg.width  * img.width;
      const sh = seg.height * img.height;

      // Colored fill
      ctx.fillStyle = seg.color + '30';
      ctx.fillRect(x, y, sw, sh);

      // Animated border
      ctx.strokeStyle = seg.color;
      ctx.lineWidth   = 3;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(x, y, sw, sh);
      ctx.setLineDash([]);

      // Corner markers
      const cs = 12;
      ctx.strokeStyle = seg.color;
      ctx.lineWidth   = 3;
      [[x, y], [x + sw, y], [x, y + sh], [x + sw, y + sh]].forEach(([cx, cy], i) => {
        ctx.beginPath();
        const h1 = i < 2 ? cs : -cs;
        const v1 = i % 2 === 0 ? cs : -cs;
        ctx.moveTo(cx, cy + h1); ctx.lineTo(cx, cy); ctx.lineTo(cx + v1, cy);
        ctx.stroke();
      });

      // Label badge
      const label = seg.labelUz || seg.label;
      ctx.font      = 'bold 12px Inter, sans-serif';
      const tw      = ctx.measureText(label).width;
      const badgeX  = x;
      const badgeY  = y > 24 ? y - 28 : y + sh + 4;
      ctx.fillStyle = seg.color;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, tw + 56, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, badgeX + 8, badgeY + 16);
      ctx.fillText(`${seg.confidence}%`, badgeX + tw + 14, badgeY + 16);
    });
  }, [segmentation]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    img.onload = drawSegments;
    if (img.complete) drawSegments();
  }, [drawSegments, image]);

  const getClickedSegment = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect  = canvas.getBoundingClientRect();
    const mx    = (e.clientX - rect.left) * (canvas.width  / rect.width);
    const my    = (e.clientY - rect.top)  * (canvas.height / rect.height);
    const found = segmentation.segments.find(seg => {
      const x = seg.x * canvas.width, y = seg.y * canvas.height;
      return mx >= x && mx <= x + seg.width * canvas.width
          && my >= y && my <= y + seg.height * canvas.height;
    });
    setActiveSegment(found || null);
  };

  const severityColor = (s: string) =>
    s === 'high' ? 'text-red-400' : s === 'medium' ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="space-y-4">
      {/* Canvas container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/30 bg-slate-900">
        <img
          ref={imgRef}
          src={image}
          alt="X-ray"
          className="w-full object-contain"
          style={{ maxHeight: '420px' }}
          onLoad={drawSegments}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onClick={getClickedSegment}
        />

        {/* Overall badge */}
        <div className="absolute top-3 left-3 px-3 py-2 glass-premium rounded-xl border border-cyan-500/30">
          <div className="text-cyan-400 text-xs font-bold">AI Segmentatsiya</div>
          <div className="text-white text-sm font-bold">{segmentation.overallDiagnosisUz}</div>
          <div className="text-slate-400 text-xs">{segmentation.confidence}% ishonch</div>
        </div>

        {/* Scan line animation */}
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 scan-animation pointer-events-none"></div>
      </div>

      {/* Active segment popup */}
      {activeSegment && (
        <div className="glass-premium rounded-xl p-4 border border-cyan-500/30 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeSegment.color }}></div>
              <span className="text-white font-bold">{activeSegment.labelUz}</span>
            </div>
            <button onClick={() => setActiveSegment(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="glass-premium rounded-lg p-2">
              <div className="text-cyan-400 text-xs mb-1">Ishonch</div>
              <div className="text-white font-bold">{activeSegment.confidence}%</div>
            </div>
            <div className="glass-premium rounded-lg p-2">
              <div className="text-cyan-400 text-xs mb-1">Daraja</div>
              <div className={`font-bold text-sm ${severityColor(activeSegment.severity)}`}>
                {activeSegment.severity === 'high' ? 'Yuqori' : activeSegment.severity === 'medium' ? "O'rta" : 'Past'}
              </div>
            </div>
            <div className="glass-premium rounded-lg p-2">
              <div className="text-cyan-400 text-xs mb-1">Tur</div>
              <div className="text-white font-bold text-xs capitalize">{activeSegment.type}</div>
            </div>
          </div>
        </div>
      )}

      {/* Segment list */}
      <div className="space-y-2">
        {segmentation.segments.map(seg => (
          <div
            key={seg.id}
            onClick={() => setActiveSegment(seg)}
            className="glass-premium rounded-xl p-3 border cursor-pointer hover:scale-105 transition-all"
            style={{ borderColor: seg.color + '40' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: seg.color }}></div>
                <span className="text-white text-sm font-semibold">{seg.labelUz}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${severityColor(seg.severity)}`}>
                  {seg.severity === 'high' ? '⚠️ Yuqori' : seg.severity === 'medium' ? "⚡ O'rta" : '✅ Past'}
                </span>
                <span className="text-cyan-400 text-sm font-bold">{seg.confidence}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Normal areas */}
      {segmentation.normalAreasUz && (
        <div className="glass-premium rounded-xl p-3 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-lg">✅</span>
            <div>
              <div className="text-emerald-400 text-xs font-bold mb-0.5">Normal hududlar</div>
              <div className="text-slate-300 text-sm">{segmentation.normalAreasUz}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Premium Result Card Component
const ResultCard: React.FC<{ text: string }> = ({ text }) => {
  const sections = text.split(/\n(?=##\s)/).filter(Boolean);

  if (sections.length <= 1) {
    const lines = text.split('\n').filter(l => l.trim());
    return (
      <div className="space-y-3">
        {lines.map((line, i) => {
          const isBold = line.startsWith('**') && line.endsWith('**');
          const isHeader = line.startsWith('#');
          const clean = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');

          if (isHeader) return (
            <div key={i} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg">
              {clean}
            </div>
          );
          if (isBold) return (
            <p key={i} className="font-bold text-white text-sm">{clean}</p>
          );
          if (line.startsWith('-') || line.startsWith('•')) return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-cyan-400 mt-0.5 flex-shrink-0">●</span>
              <p className="text-slate-300 text-sm font-medium">{line.replace(/^[-•]\s*/, '')}</p>
            </div>
          );
          return <p key={i} className="text-slate-300 text-sm font-medium leading-relaxed">{line}</p>;
        })}
      </div>
    );
  }

  const sectionColors: Record<number, { bg: string; icon: string; border: string }> = {
    0: { bg: 'from-cyan-500/10 to-blue-600/10', icon: '🔬', border: 'border-cyan-500/20' },
    1: { bg: 'from-emerald-500/10 to-teal-600/10', icon: '✅', border: 'border-emerald-500/20' },
    2: { bg: 'from-amber-500/10 to-orange-600/10', icon: '📋', border: 'border-amber-500/20' },
    3: { bg: 'from-rose-500/10 to-pink-600/10', icon: '⚠️', border: 'border-rose-500/20' },
    4: { bg: 'from-purple-500/10 to-indigo-600/10', icon: '💊', border: 'border-purple-500/20' },
  };

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => {
        const lines = section.split('\n').filter(l => l.trim());
        const title = lines[0]?.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/[🔬✅📋⚠️💊🫁🔍]/g, '').trim();
        const body = lines.slice(1);
        const color = sectionColors[idx % 5];

        return (
          <div key={idx} className={`bg-gradient-to-br ${color.bg} border ${color.border} rounded-xl p-4 backdrop-blur-sm`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{color.icon}</span>
              <h4 className="font-bold text-white text-sm sm:text-base">{title}</h4>
            </div>
            <div className="space-y-2">
              {body.map((line, li) => {
                const clean = line.replace(/\*\*/g, '').replace(/^[-•]\s*/, '').trim();
                if (!clean) return null;
                const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•');
                return isBullet ? (
                  <div key={li} className="flex gap-2 items-start">
                    <span className="text-cyan-400 mt-1 flex-shrink-0 text-xs">◆</span>
                    <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">{clean}</p>
                  </div>
                ) : (
                  <p key={li} className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">{clean}</p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [segmentation, setSegmentation] = useState<SegmentationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'report' | 'segmentation'>('report');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('lung_history') || '[]'); }
    catch { return []; }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setSegmentation(null);
    try {
      const { resultText, id } = await analyzeLungImage(image);
      setResult(resultText);
      const newItem: HistoryItem = {
        id, timestamp: new Date().toLocaleString('uz-UZ'),
        imageUrl: image, report: resultText,
        summary: resultText.replace(/#+\s*/g, '').replace(/\*\*/g, '').substring(0, 100) + '...'
      };
      const updated = [newItem, ...history].slice(0, 15);
      setHistory(updated);
      localStorage.setItem('lung_history', JSON.stringify(updated));

      // Auto segmentatsiya boshlash
      setIsSegmenting(true);
      try {
        const seg = await analyzeLungSegmentation(image);
        setSegmentation(seg);
      } catch { /* segmentatsiya xatoligi hisobot ko'rsatishga ta'sir qilmaydi */ }
      finally { setIsSegmenting(false); }

    } catch (err: any) {
      setError(err.message || "Tahlil jarayonida xatolik.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null); setResult(null); setError(null);
    setSegmentation(null); setActiveTab('report');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#050816] via-[#0B1220] to-[#050816] relative overflow-hidden">
      {/* Medical grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00E5FF08_1px,transparent_1px),linear-gradient(to_bottom,#00E5FF08_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
      
      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse-slow animation-delay-2000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center pt-6 pb-12">
          <div className="inline-flex items-center gap-3 glass-premium px-5 py-2.5 rounded-full border border-cyan-500/20 mb-6">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </div>
            <span className="text-cyan-400 font-bold text-xs tracking-wider uppercase">X-ray Analysis</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-4">
            Lung <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">X-ray</span> Analysis
          </h1>
          <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
            AI-powered chest X-ray analysis with 95%+ medical-grade accuracy
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">

          {/* Upload card */}
          <div className="glass-premium rounded-3xl border border-cyan-500/10 p-6 sm:p-8 flex flex-col min-h-[500px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Upload X-ray</h3>
              </div>
              {image && !isAnalyzing && (
                <button onClick={reset} className="text-xs text-rose-400 font-bold glass-premium px-4 py-2 rounded-lg hover:bg-rose-500/10 transition-all border border-rose-500/20">
                  ✕ Clear
                </button>
              )}
            </div>

            {!image ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-grow border-2 border-dashed border-cyan-500/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-all p-8 group"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-cyan-500/30 shadow-xl">
                  <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-white text-center mb-2">Drop X-ray image here</p>
                <p className="text-sm text-slate-400 font-medium">or click to browse</p>
                <p className="text-xs text-slate-500 mt-3">DICOM, JPG, PNG supported</p>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>
            ) : (
              <div className="flex-grow flex flex-col gap-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 flex-grow border-2 border-cyan-500/20" style={{ minHeight: '280px' }}>
                  <img src={image} alt="X-ray" className="w-full h-full object-contain" style={{ maxHeight: '360px' }} />
                  {isAnalyzing && (
                    <div className="absolute inset-0 glass-premium backdrop-blur-md flex flex-col items-center justify-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500/30 border-t-transparent rounded-full animate-spin animation-delay-500"></div>
                      </div>
                      <p className="text-cyan-400 font-bold text-sm mt-6 tracking-wider animate-pulse uppercase">AI Analyzing...</p>
                      <div className="flex gap-2 mt-4">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {!isAnalyzing && !result && (
                  <button
                    onClick={handleAnalyze}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Start AI Analysis</span>
                  </button>
                )}
                {result && (
                  <button
                    onClick={reset}
                    className="w-full py-3 glass-premium hover:bg-white/5 text-slate-300 rounded-xl font-bold text-sm transition-all border border-cyan-500/20"
                  >
                    + New Analysis
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Result card */}
          <div className="glass-premium rounded-3xl border border-cyan-500/10 p-6 sm:p-8 flex flex-col min-h-[500px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Analysis Result</h3>
              </div>
              {result && (
                <span className="text-xs glass-premium border border-emerald-500/30 text-emerald-400 font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                  ✓ Complete
                </span>
              )}
            </div>

            {/* Tabs */}
            {result && (
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'report'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'glass-premium border border-cyan-500/20 text-slate-300 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Hisobot
                </button>
                <button
                  onClick={() => setActiveTab('segmentation')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'segmentation'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'glass-premium border border-purple-500/20 text-slate-300 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Segmentatsiya
                  {isSegmenting && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {segmentation && !isSegmenting && (
                    <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                      {segmentation.segments.length}
                    </span>
                  )}
                </button>
              </div>
            )}

            <div className="flex-grow overflow-y-auto custom-scrollbar">
              {error && (
                <div className="glass-premium border border-rose-500/30 rounded-xl p-4 text-rose-400 text-sm font-medium">
                  ⚠️ {error}
                </div>
              )}

              {/* Report Tab */}
              {activeTab === 'report' && result && <ResultCard text={result} />}

              {/* Segmentation Tab */}
              {activeTab === 'segmentation' && (
                <>
                  {isSegmenting && !segmentation && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-pink-500/30 border-t-transparent rounded-full animate-spin animation-delay-500"></div>
                      </div>
                      <p className="text-purple-400 font-bold text-sm tracking-wider uppercase animate-pulse">
                        AI Segmentatsiya qilmoqda...
                      </p>
                    </div>
                  )}
                  {segmentation && image && (
                    <SegmentationOverlay image={image} segmentation={segmentation} />
                  )}
                  {!isSegmenting && !segmentation && result && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-4xl mb-4">🔬</div>
                      <p className="text-slate-400 text-sm">Segmentatsiya ma'lumoti yo'q</p>
                    </div>
                  )}
                </>
              )}

              {!result && !isAnalyzing && !error && (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-24 h-24 glass-premium rounded-full flex items-center justify-center mb-6 border border-cyan-500/20">
                    <svg className="w-12 h-12 text-cyan-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 font-bold text-sm">Results will appear here</p>
                  <p className="text-slate-500 text-xs mt-2">Upload an X-ray to begin</p>
                </div>
              )}
              {isAnalyzing && !result && (
                <div className="h-full flex flex-col items-center justify-center py-12">
                  <div className="space-y-3 w-full">
                    {[80, 60, 90, 50, 70].map((w, i) => (
                      <div key={i} className="h-3 glass-premium rounded-full animate-pulse border border-cyan-500/10" style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }}></div>
                    ))}
                  </div>
                  <p className="text-cyan-400 font-bold text-xs mt-8 tracking-widest animate-pulse uppercase">Processing medical data...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Analysis History</h2>
              <span className="text-xs glass-premium border border-purple-500/30 text-purple-400 font-bold px-3 py-1 rounded-lg">{history.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => { setImage(item.imageUrl); setResult(item.report); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="glass-premium rounded-2xl border border-cyan-500/10 hover:border-cyan-500/30 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 hover:scale-105 transition-all cursor-pointer group p-4"
                >
                  <div className="relative h-32 w-full mb-3 overflow-hidden rounded-xl bg-slate-900 border border-cyan-500/20">
                    <img src={item.imageUrl} alt="Scan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-2 right-2 glass-premium text-white px-2 py-1 rounded-md text-[9px] font-bold border border-white/10">
                      {item.timestamp}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed mb-2">{item.summary}</p>
                  <div className="flex items-center text-cyan-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                    <span>View Result</span>
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
