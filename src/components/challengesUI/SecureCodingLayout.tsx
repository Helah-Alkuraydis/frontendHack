import React from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, Heart, Key, Timer } from 'lucide-react';

interface SecureCodingLayoutProps {
    scenario: any;
    phase: 1 | 2;
    timeLeft: number; // مستخدم في الهيدر
    lives: number; 
    points_pool: number; 
    userCode: string;
    setUserCode: (val: string) => void;
    selectedLineIdx: number | null;
    feedback: { message: string; isError: boolean } | null;
    onLineClick: (line: string, idx: number) => void;
    onCodeSubmit: () => void;
    onQuit: () => void;
    onNextLevel?: () => void;
    onEndGame?: () => void;
}

const SecureCodingLayout: React.FC<SecureCodingLayoutProps> = ({
    scenario,
    phase,
    timeLeft,
    lives,
    points_pool,
    userCode,
    setUserCode,
    selectedLineIdx,
    feedback,
    onLineClick,
    onCodeSubmit,
    onQuit,
    onNextLevel,
    onEndGame
}) => {
    const codeLines = (scenario.vulnerable_code || '').split('\n');

    return (
        // 🟢 التعديل: تقليل البادينق (p-4) للجوال وتكبيره (md:p-8) للابتوب
        <div className="min-h-screen bg-[#0b1121] text-slate-300 p-4 md:p-8 font-mono text-left overflow-y-auto">
            {/* Header القسم العلوي */}
            {/* <div className="flex justify-center mb-4">
                <div className="flex items-center gap-8 bg-[#1c2438]/60 px-6 py-2 rounded-full border border-white/5 backdrop-blur-xl shadow-xl">
                    <div className="flex items-center gap-2 text-amber-500 font-bold border-r border-white/10 pr-5 text-sm">
                        <Key size={14} fill="currentColor" /> <span>Points: {points_pool} XP</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Timer size={16} className={timeLeft < 20 ? "text-red-500 animate-pulse" : "text-blue-400"} />
                        <span className={`text-lg font-mono font-black ${timeLeft < 20 ? "text-red-500" : "text-white"}`}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    <div className="flex gap-1.5 border-l border-white/10 pl-6">
                        {[...Array(3)].map((_, i) => (
                            <Heart key={i} size={18} fill={i < lives ? "#ef4444" : "none"} color="#ef4444" className={i < lives ? "animate-pulse" : "opacity-10"} />
                        ))}
                    </div>
                </div>
            </div> */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-start">
                
                {/* العمود الأيسر: المعلومات والمرحلة الأولى */}
                <div className="space-y-4 md:space-y-6">
                    {/* كرت المعلومات */}
                    <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4 md:p-6 shadow-lg text-left">
                        <h2 className="text-[#00ff9d] font-bold tracking-[0.1em] md:tracking-widest uppercase mb-3 md:mb-4 text-xs md:text-sm underline decoration-emerald-500/30 underline-offset-4 md:underline-offset-8">
                            CHALLENGE: {scenario.title}
                        </h2>
                        <p className="text-xs md:text-sm text-slate-400 mb-4 md:mb-6 leading-relaxed italic">
                            {scenario.explanation}
                        </p>
                        <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                            <p className="flex flex-wrap gap-1"><span className="text-cyan-500 font-bold shrink-0">Vulnerability:</span> <span className="text-slate-300 break-words">{scenario.vulnerability_type}</span></p>
                            <p className="flex gap-1"><span className="text-green-500 font-bold shrink-0">Fix:</span> <span className="text-slate-300">Use proper secure syntax</span></p>
                            <p className="flex gap-1"><span className="text-cyan-500 font-bold shrink-0">Language:</span> <span className="text-slate-300 capitalize">{scenario.language}</span></p>
                        </div>
                    </div>

                    {/* المرحلة الأولى: تحديد الثغرة */}
                    <div className={`bg-[#1e293b] rounded-xl border p-4 md:p-6 shadow-lg transition-all ${phase === 1 ? 'border-slate-500' : 'border-slate-700/50 opacity-50'}`}>
                        <h2 className="text-white font-bold tracking-[0.1em] md:tracking-widest uppercase mb-3 md:mb-4 text-xs md:text-sm">PHASE 1: IDENTIFY VULNERABILITY</h2>
                        <p className="text-[10px] md:text-sm text-slate-400 mb-3 md:mb-4 italic">Click on the vulnerable line of code:</p>
                        
                        {/* 🟢 التعديل: تصغير الخط والبادينق للجوال في صندوق الكود */}
                        <div className="bg-[#0d1117] rounded-lg border border-slate-800 p-2 md:p-4 overflow-x-auto text-[10px] md:text-sm shadow-inner custom-scrollbar">
                            {codeLines.map((line: string, idx: number) => {
                                const isSelected = selectedLineIdx === idx;
                                const isWrongSelection = isSelected && feedback?.isError;
                                const isRightSelection = isSelected && !feedback?.isError && feedback !== null;

                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => onLineClick(line, idx)}
                                        className={`flex group cursor-pointer transition-colors py-1 md:py-0.5 rounded px-1 md:px-2
                                            ${phase !== 1 ? 'pointer-events-none' : 'hover:bg-slate-800'}
                                            ${isWrongSelection ? 'bg-red-900/40 text-red-400' : ''}
                                            ${isRightSelection ? 'bg-green-900/40 text-green-400 font-bold' : ''}
                                        `}
                                    >
                                        <span className="w-5 md:w-8 text-right pr-2 md:pr-4 text-slate-600 select-none group-hover:text-slate-400 italic shrink-0">{idx + 1}</span>
                                        <span className="whitespace-pre overflow-x-auto">{line || ' '}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {phase === 1 && feedback && (
                            <div className={`mt-3 md:mt-4 p-2.5 md:p-3 rounded border text-[10px] md:text-sm flex items-start md:items-center gap-2 animate-in fade-in slide-in-from-top-1 ${feedback.isError ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-green-900/20 border-green-500/50 text-[#00ff9d]'}`}>
                                {feedback.isError ? <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 shrink-0 mt-0.5 md:mt-0"/> : <CheckCircle className="w-3 h-3 md:w-4 md:h-4 shrink-0 mt-0.5 md:mt-0"/>}
                                <span className="leading-tight">{feedback.message}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* العمود الأيمن: المرحلة الثانية */}
                <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4 md:p-6 shadow-lg h-full flex flex-col min-h-[400px] md:min-h-[500px]">
                    <h2 className="text-white font-bold tracking-[0.1em] md:tracking-widest uppercase mb-3 md:mb-4 text-xs md:text-sm">PHASE 2: FIX THE CODE</h2>
                    
                    {phase === 1 ? (
                        <div className="flex-1 flex flex-col text-[10px] md:text-sm text-slate-400">
                            <p className="mb-3 md:mb-4">Identify the vulnerability first to unlock this phase.</p>
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-slate-500 flex-1 flex items-center justify-center italic text-center px-4">
                                Waiting for Phase 1 completion...
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col animate-in fade-in duration-500 h-full">
                            <p className="text-[10px] md:text-sm text-slate-400 mb-3 md:mb-4 italic">Rewrite the code below to make it secure:</p>
                            {/* 🟢 التعديل: تكبير منطقة الكتابة للجوال وتصغير الخط شوي عشان يناسب الكود */}
                            <div className="bg-[#0d1117] rounded-lg border border-slate-600 flex-1 flex flex-col p-1.5 md:p-2 min-h-[250px] md:min-h-[300px] shadow-inner focus-within:border-[#00ff9d]/50 transition-all">
                                <textarea 
                                    className="flex-1 w-full bg-transparent text-slate-300 font-mono text-[11px] md:text-sm resize-none focus:outline-none p-2 custom-scrollbar leading-relaxed"
                                    value={userCode}
                                    onChange={(e) => setUserCode(e.target.value)}
                                    spellCheck="false"
                                />
                            </div>
                            
                            {(!feedback || feedback.isError) && (
                                <button 
                                    onClick={onCodeSubmit}
                                    className="mt-4 md:mt-6 w-full py-2.5 md:py-3 bg-[#00ff9d] hover:bg-[#00cc7d] text-slate-900 font-black rounded flex justify-center items-center gap-2 transition-all active:scale-95 uppercase tracking-[0.1em] md:tracking-widest text-[10px] md:text-sm"
                                >
                                    <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                                    SUBMIT SECURE CODE
                                </button>
                            )}

                            {phase === 2 && feedback && (
                                <div className={`mt-3 md:mt-4 p-3 md:p-4 rounded border text-[10px] md:text-sm flex flex-col gap-2 md:gap-3 animate-in zoom-in-95 duration-300 ${feedback.isError ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-green-900/20 border-green-500/50 text-[#00ff9d]'}`}>
                                    <div className="flex items-center gap-2 font-bold uppercase tracking-tight md:tracking-tighter">
                                        {feedback.isError ? <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 shrink-0"/> : <CheckCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0"/>}
                                        {feedback.isError ? 'STILL VULNERABLE' : 'SYSTEM SECURED!'}
                                    </div>
                                    <p className="leading-relaxed">{feedback.message}</p>
                                    
                                    {!feedback.isError && (
                                        <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-2">
                                            {onNextLevel && (
                                                <button onClick={onNextLevel} className="flex-1 px-3 py-2.5 md:px-4 md:py-3 bg-slate-700 text-white font-bold rounded hover:bg-slate-600 transition-colors uppercase text-[9px] md:text-[10px] tracking-widest text-center">
                                                    NEXT LEVEL 🚀
                                                </button>
                                            )}
                                            <button onClick={onEndGame} className="flex-1 px-3 py-2.5 md:px-4 md:py-3 bg-transparent border-2 border-[#00ff9d] text-[#00ff9d] font-bold rounded hover:bg-[#00ff9d]/10 transition-colors uppercase text-[9px] md:text-[10px] tracking-widest text-center">
                                                SAVE & EXIT 🚪
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}</style>
        </div>
    );
};

export default SecureCodingLayout;