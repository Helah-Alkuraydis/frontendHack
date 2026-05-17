import React from 'react';
import { Lock, ChevronRight, Loader2, Timer, Heart, Key, ShieldAlert } from "lucide-react";

interface BreakerLayoutProps {
    scenario: any;
    timeLeft: number;
    lives: number;
    initialLevel: number;
    handleKeyPress: () => void;
    points_pool: number;
    breakerInput: string;
    setBreakerInput: (val: string) => void;
    isChecking: boolean;
    isAnswered: boolean;
    onGuess: (e?: React.FormEvent) => void;
    displayedAnalysis: string;
    isAlertActive: boolean;
}

const BreakerLayout: React.FC<BreakerLayoutProps> = ({
    scenario, timeLeft, lives, points_pool, initialLevel,
    breakerInput, setBreakerInput, isChecking, isAnswered,
    onGuess, displayedAnalysis, handleKeyPress, isAlertActive
}) => {
    return ( 
        <div className={`max-w-7xl mx-auto w-full flex flex-col gap-4 md:gap-10 animate-in slide-in-from-bottom-12 font-mono relative p-4 md:p-6 mb-wrapper transition-all duration-1000 
            ${isAlertActive ? 'animate-shake bg-red-900/20 backdrop-blur-sm' : ''} 
        `}>
            {/* COUNTER AND LIVES */}
            <div className="flex justify-center mb-2 md:mb-8 mb-header">
                <div className="flex items-center gap-4 md:gap-8 bg-[#1c2438]/60 px-6 py-2 rounded-full border border-white/5 backdrop-blur-xl shadow-xl">
                    <div className="flex items-center gap-2 text-amber-500 font-bold border-r border-white/10 pr-5 text-xs md:text-sm">
                        <Key size={14} fill="currentColor" /> <span>LEVEL {initialLevel}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Timer size={16} className={timeLeft < 60 ? "text-red-500 animate-pulse" : "text-blue-400"} />
                        <span className={`text-base md:text-lg font-mono font-black ${timeLeft < 60 ? "text-red-500" : "text-white"}`}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    <div className="flex gap-1.5 border-l border-white/10 pl-6">
                        {[...Array(3)].map((_, i) => <Heart key={i} size={18} fill={i < lives ? "#ef4444" : "none"} color="#ef4444" className={i < lives ? "animate-pulse" : "opacity-10"} />)}
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0 mb-grid-content">
                {/* Target Dossier Panel */}
                <div className="bg-[#0a0000] border-2 border-red-500/20 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-[0_0_50px_rgba(239,68,68,0.05)] relative overflow-hidden group md:col-span-5 flex flex-col justify-center mb-panel-dossier">
                    <div className="flex justify-between items-start mb-4 md:mb-10 pb-4 border-b border-red-500/10 shrink-0">
                        <div>
                            <h3 className="text-red-500 text-[9px] md:text-xs font-black uppercase tracking-[0.3em]">Investigation_Dossier</h3>
                            <p className="text-xs md:text-sm text-red-100/90 font-bold border-b border-red-500/20 pb-0.5 mb-1 truncate max-w-[150px] md:max-w-none">
                                TARGET_ID: {scenario.userData?.name?.toUpperCase() || "UNKNOWN_SUBJECT"}
                            </p>
                        </div>
                        <div className="text-red-600 text-[8px] md:text-[9px] font-black px-2 py-1 rounded border border-red-600 rotate-[-15deg] shrink-0">CLASSIFIED</div>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Birth_Year:</span><span className="text-white/80 font-bold">{scenario.userData?.birthYear || "----"}</span></div>
                            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Home_Sector:</span><span className="text-white/80 font-bold">{scenario.userData?.city || "UNKNOWN"}</span></div>
                            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Unit_Pet:</span><span className="text-white/80 font-bold">{scenario.userData?.pet || "NONE"}</span></div>
                            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Hobby:</span><span className="text-white/80 font-bold">{scenario.userData?.hobby || "UNDEFINED"}</span></div>
                        </div>
                        
                        {/* Dossier Hint Analysis */}
                        <div className="bg-red-500/5 rounded-xl p-3 font-mono italic border border-red-500/10 text-[11px] text-red-100/70 leading-relaxed">
                            {displayedAnalysis || "Decrypting field intelligence..."}
                        </div>
                    </div>
                </div>

                {/* Cracking Console Terminal */}
                <div className="flex flex-col gap-3 md:gap-6 md:col-span-7 justify-between mb-panel-terminal">
                    <div className="bg-[#080808] border-2 border-red-500/20 rounded-[2rem] p-5 md:p-10 relative group shadow-2xl focus-within:border-red-500/50 flex-1 flex flex-col justify-between">
                        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <label className="text-red-500/40 text-[8px] md:text-[9px] uppercase tracking-[0.5em]">_Brute_Force_Terminal_</label>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                        </div>

                        <form onSubmit={onGuess} className="relative mb-4 flex items-center shrink-0">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-red-500 text-xl font-bold opacity-30">$</span>
                            <input
                                type="text"
                                value={breakerInput}
                                onChange={(e) => setBreakerInput(e.target.value)}
                                onKeyDown={(e) => {
                                    handleKeyPress();
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        onGuess();
                                    }
                                }}
                                disabled={isChecking || isAnswered}
                                className="w-full bg-transparent border-none pl-6 pr-12 text-xl md:text-3xl text-red-400 placeholder:text-red-900/10 focus:ring-0 font-mono tracking-[0.15em] outline-none"
                                placeholder="GUESS_PASSWORD_"
                                autoFocus
                            />
                            <button type="submit" disabled={isChecking || isAnswered || !breakerInput} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-xl text-red-500/40 hover:text-red-400">
                                {isChecking ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={24} />}
                            </button>
                        </form>

                        {/* Progress Bar Status */}
                        <div className="flex gap-2 h-1 px-1 shrink-0">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={`flex-1 rounded-full ${isChecking ? 'bg-red-600 animate-pulse' : 'bg-white/5'}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Status Bar */}
                    <div className="flex justify-between items-center px-4 py-2.5 md:px-8 md:py-3 bg-red-500/5 rounded-full border border-red-500/10 shrink-0">
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-1.5">
                                <span className="bg-red-500/20 text-red-400 text-[8px] px-1.5 py-0.5 rounded border border-red-500/20 font-bold font-mono">ENTER</span>
                                <span className="text-[9px] text-red-500/40 uppercase tracking-widest font-mono">Execute Crack</span>
                            </div>
                        </div>
                        <div className="text-[8px] text-red-500/40 italic flex items-center gap-1"><Lock size={10} /> LAYER: 128-bit</div>
                    </div>
                </div>
            </div>

            {/* سحر ببجي المخصص لـ Breaker في الجوال */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 2px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(239, 68, 68, 0.2); border-radius: 4px; }
                
                @media (max-width: 930px) and (orientation: landscape) {
                    .mb-wrapper { padding: 4px !important; height: 100dvh !important; overflow: hidden !important; gap: 0 !important;}
                    .mb-header { display: none !important; }
                    .mb-grid-content { 
                        display: flex !important; 
                        flex-direction: row !important; 
                        gap: 10px !important; 
                        height: 100dvh !important;
                        max-height: 100dvh !important;
                        margin: 0 !important;
                        padding: 8px 16px !important;
                    }
                    .mb-panel-dossier { width: 45% !important; height: 100% !important; border-radius: 1.5rem !important; padding: 12px 16px !important;}
                    .mb-panel-terminal { width: 55% !important; height: 100% !important; gap: 4px !important;}
                    .mb-panel-terminal > div:first-child { border-radius: 1.5rem !important; padding: 12px 16px !important; }
                }
            `}</style>
        </div>
    );
};

export default BreakerLayout;