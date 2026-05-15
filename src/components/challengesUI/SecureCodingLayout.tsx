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
        <div className="min-h-screen bg-[#0b1121] text-slate-300 p-8 font-mono text-left">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                
                {/* العمود الأيسر: المعلومات والمرحلة الأولى */}
                <div className="space-y-6">
                    {/* كرت المعلومات */}
                    <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-6 shadow-lg text-left">
                        <h2 className="text-[#00ff9d] font-bold tracking-widest uppercase mb-4 text-sm underline decoration-emerald-500/30 underline-offset-8">
                            CHALLENGE: {scenario.title}
                        </h2>
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed italic">
                            {scenario.explanation}
                        </p>
                        <div className="space-y-2 text-sm">
                            <p><span className="text-cyan-500 font-bold">Vulnerability:</span> <span className="text-slate-300">{scenario.vulnerability_type}</span></p>
                            <p><span className="text-green-500 font-bold">Fix:</span> <span className="text-slate-300">Use proper secure syntax</span></p>
                            <p><span className="text-cyan-500 font-bold">Language:</span> <span className="text-slate-300 capitalize">{scenario.language}</span></p>
                        </div>
                    </div>

                    {/* المرحلة الأولى: تحديد الثغرة */}
                    <div className={`bg-[#1e293b] rounded-xl border p-6 shadow-lg transition-all ${phase === 1 ? 'border-slate-500' : 'border-slate-700/50 opacity-50'}`}>
                        <h2 className="text-white font-bold tracking-widest uppercase mb-4 text-sm">PHASE 1: IDENTIFY VULNERABILITY</h2>
                        <p className="text-sm text-slate-400 mb-4 italic">Click on the vulnerable line of code:</p>
                        
                        <div className="bg-[#0d1117] rounded-lg border border-slate-800 p-4 overflow-x-auto text-sm shadow-inner custom-scrollbar">
                            {codeLines.map((line: string, idx: number) => {
                                const isSelected = selectedLineIdx === idx;
                                const isWrongSelection = isSelected && feedback?.isError;
                                const isRightSelection = isSelected && !feedback?.isError && feedback !== null;

                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => onLineClick(line, idx)}
                                        className={`flex group cursor-pointer transition-colors py-0.5 rounded px-2
                                            ${phase !== 1 ? 'pointer-events-none' : 'hover:bg-slate-800'}
                                            ${isWrongSelection ? 'bg-red-900/40 text-red-400' : ''}
                                            ${isRightSelection ? 'bg-green-900/40 text-green-400 font-bold' : ''}
                                        `}
                                    >
                                        <span className="w-8 text-right pr-4 text-slate-600 select-none group-hover:text-slate-400 italic">{idx + 1}</span>
                                        <span className="whitespace-pre">{line || ' '}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {phase === 1 && feedback && (
                            <div className={`mt-4 p-3 rounded border text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${feedback.isError ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-green-900/20 border-green-500/50 text-[#00ff9d]'}`}>
                                {feedback.isError ? <AlertTriangle className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                                {feedback.message}
                            </div>
                        )}
                    </div>
                </div>

                {/* العمود الأيمن: المرحلة الثانية */}
                <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-6 shadow-lg h-full flex flex-col min-h-[500px]">
                    <h2 className="text-white font-bold tracking-widest uppercase mb-4 text-sm">PHASE 2: FIX THE CODE</h2>
                    
                    {phase === 1 ? (
                        <div className="flex-1 flex flex-col text-sm text-slate-400">
                            <p className="mb-4">Identify the vulnerability first to unlock this phase.</p>
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-slate-500 flex-1 flex items-center justify-center italic">
                                Waiting for Phase 1 completion...
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                            <p className="text-sm text-slate-400 mb-4 italic">Rewrite the code below to make it secure:</p>
                            <div className="bg-[#0d1117] rounded-lg border border-slate-600 flex-1 flex flex-col p-2 min-h-[300px] shadow-inner focus-within:border-[#00ff9d]/50 transition-all">
                                <textarea 
                                    className="flex-1 w-full bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none p-2 custom-scrollbar"
                                    value={userCode}
                                    onChange={(e) => setUserCode(e.target.value)}
                                    spellCheck="false"
                                />
                            </div>
                            
                            {(!feedback || feedback.isError) && (
                                <button 
                                    onClick={onCodeSubmit}
                                    className="mt-6 w-full py-3 bg-[#00ff9d] hover:bg-[#00cc7d] text-slate-900 font-black rounded flex justify-center items-center gap-2 transition-all active:scale-95 uppercase tracking-widest"
                                >
                                    <ShieldCheck className="w-5 h-5" />
                                    SUBMIT SECURE CODE
                                </button>
                            )}

                            {phase === 2 && feedback && (
                                <div className={`mt-4 p-4 rounded border text-sm flex flex-col gap-3 animate-in zoom-in-95 duration-300 ${feedback.isError ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-green-900/20 border-green-500/50 text-[#00ff9d]'}`}>
                                    <div className="flex items-center gap-2 font-bold uppercase tracking-tighter">
                                        {feedback.isError ? <AlertTriangle className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
                                        {feedback.isError ? 'STILL VULNERABLE' : 'SYSTEM SECURED!'}
                                    </div>
                                    <p>{feedback.message}</p>
                                    
                                    {!feedback.isError && (
                                        <div className="flex gap-2 mt-2">
                                            {onNextLevel && (
                                                <button onClick={onNextLevel} className="flex-1 px-4 py-3 bg-slate-700 text-white font-bold rounded hover:bg-slate-600 transition-colors uppercase text-[10px] tracking-widest">
                                                    NEXT LEVEL 🚀
                                                </button>
                                            )}
                                            <button onClick={onEndGame} className="flex-1 px-4 py-3 bg-transparent border-2 border-[#00ff9d] text-[#00ff9d] font-bold rounded hover:bg-[#00ff9d]/10 transition-colors uppercase text-[10px] tracking-widest">
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
        </div>
    );
};

export default SecureCodingLayout;