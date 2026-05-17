import React from 'react';
import {
    Lock, ChevronRight, Loader2, Timer, Heart, Key, ShieldAlert
} from "lucide-react";

interface BreakerLayoutProps {
    scenario: any;
    timeLeft: number;
    lives: number;
    points_pool: number;
    breakerInput: string;
    setBreakerInput: (val: string) => void;
    isChecking: boolean;
    isAnswered: boolean;
    onGuess: (e?: React.FormEvent) => void;
    displayedAnalysis: string;
}

const BreakerLayout: React.FC<BreakerLayoutProps> = ({
    scenario,
    timeLeft,
    lives,
    points_pool,
    breakerInput,
    setBreakerInput,
    isChecking,
    isAnswered,
    onGuess,
    displayedAnalysis
}) => {
    return (
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-10 animate-in slide-in-from-bottom-12 duration-1000 font-mono relative px-3 py-6 md:p-6">

            <div className="flex justify-center mb-4">
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
            </div>

            <div className="bg-[#0a0000] border-2 border-red-500/20 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-10 shadow-[0_0_50px_rgba(239,68,68,0.05)] relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6 md:mb-10 pb-4 md:pb-6 border-b border-red-500/10">
                    <div>
                        <h3 className="text-red-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Investigation_Dossier</h3>
                        <p className="text-xs md:text-sm text-red-100/90 font-bold border-b border-red-500/20 pb-1 mb-1">
                            TARGET_ID: {scenario.userData?.name?.toUpperCase() || "UNKNOWN_SUBJECT"}
                        </p>
                        <p className="text-[9px] md:text-[10px] text-red-500/40">Correlation Index: {Math.floor(Math.random() * 20 + 70)}% / VULNERABLE</p>
                    </div>
                    <div className="text-red-600 text-[8px] md:text-[9px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded border-2 border-red-600 rotate-[-15deg] animate-pulse whitespace-nowrap">CLASSIFIED</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8 md:gap-y-6">
                    <div className="space-y-4">
                        <h4 className="text-red-500/60 text-[10px] uppercase tracking-widest border-b border-white/5 pb-1">Primary_Data</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs"><span className="text-gray-500">Birth_Year:</span><span className="text-white/80 font-bold">{scenario.userData?.birthYear || "----"}</span></div>
                            <div className="flex justify-between text-xs"><span className="text-gray-500">Home_Sector:</span><span className="text-white/80 font-bold">{scenario.userData?.city || "UNKNOWN"}</span></div>
                            <div className="flex justify-between text-xs"><span className="text-gray-500">Unit_Pet:</span><span className="text-white/80 font-bold">{scenario.userData?.pet || "NONE"}</span></div>
                            <div className="flex justify-between text-xs"><span className="text-gray-500">Hobby:</span><span className="text-white/80 font-bold">{scenario.userData?.hobby || "UNDEFINED"}</span></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-red-500/60 text-[10px] uppercase tracking-widest border-b border-white/5 pb-1">Digital_Trace</h4>
                        <div className="text-[10px] text-gray-500 leading-relaxed italic">
                            Subject's metadata indicates a predictable pattern. Behavioral analysis suggests high correlation between personal landmarks and security sequences.
                        </div>
                    </div>

                    <div className="bg-red-500/5 rounded-xl p-4 md:p-5 font-mono italic relative overflow-hidden border border-red-500/10">
                        <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-red-600/90"></div>
                        <div className="absolute -right-10 top-5 bg-red-500/80 text-white text-[8px] font-black px-10 py-1 rotate-45 shadow-lg">Agent Analysis</div>
                        <p className="text-xs text-red-100/70 leading-relaxed pt-2">
                            {displayedAnalysis || "Decrypting field intelligence..."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 md:gap-6">
                <div className="bg-[#080808] border-2 border-red-500/20 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-10 relative group shadow-2xl transition-all duration-300 focus-within:border-red-500/50">
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                    <div className="flex justify-between items-center mb-6 md:mb-8">
                        <label className="text-red-500/40 text-[9px] uppercase tracking-[0.5em]">_Brute_Force_Terminal_</label>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                        </div>
                    </div>

                    <form onSubmit={onGuess} className="relative mb-6 md:mb-8 flex items-center">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-red-500 text-xl md:text-2xl font-bold opacity-30">$</span>
                        <input
                            type="text"
                            value={breakerInput}
                            onChange={(e) => setBreakerInput(e.target.value)}
                            disabled={isChecking || isAnswered}
                            className="w-full bg-transparent border-none pl-6 md:pl-8 pr-10 md:pr-12 text-xl md:text-3xl text-red-400 placeholder:text-red-900/10 focus:ring-0 font-mono tracking-[0.1em] md:tracking-[0.2em] outline-none"
                            placeholder="GUESS_PASSWORD_"
                            autoFocus
                        />
                        <button type="submit" disabled={isChecking || isAnswered || !breakerInput} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 md:p-3 hover:bg-red-500 hover:text-black rounded-xl transition-all text-red-500/30">
                            {isChecking ? <Loader2 className="animate-spin w-5 h-5 md:w-auto md:h-auto" /> : <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />}
                        </button>
                    </form>

                    <div className="flex gap-2 h-1 px-1">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={`flex-1 rounded-full ${isChecking ? 'bg-red-600 animate-pulse' : 'bg-white/5'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 px-4 md:px-8 py-3 bg-red-500/5 rounded-2xl sm:rounded-full border border-red-500/10">
                    <div className="flex gap-4 sm:gap-6 items-center">
                        <div className="flex items-center gap-2">
                            <span className="bg-red-500/20 text-red-400 text-[8px] px-1.5 py-0.5 rounded border border-red-500/20 font-bold font-mono">ENTER</span>
                            <span className="text-[9px] text-red-500/40 uppercase tracking-widest font-mono">Execute Crack</span>
                        </div>
                        {/* <div className="flex items-center gap-2">
                            <span className="bg-red-500/20 text-red-400  text-[8px] px-1.5 py-0.5 rounded border border-red-500/20 font-bold font-mono">ESC</span>
                            <span className="text-[9px] text-red-500/40 uppercase tracking-widest font-mono">Reboot</span>
                        </div> */}
                    </div>
                    <div className="text-[8px] text-red-500/40 italic flex items-center gap-2"><Lock size={10} /> LAYER: 128-bit_ENCRYPTION_ACTIVE_</div>
                </div>
            </div>
        </div>
    );
};

export default BreakerLayout;
