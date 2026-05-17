import React from 'react';
import {
    Lock, ChevronRight, Loader2, Timer, Heart, Key, HelpCircle
} from "lucide-react";
import Swal from 'sweetalert2';

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
    scenario,
    timeLeft,
    lives,
    points_pool,
    initialLevel,
    breakerInput,
    setBreakerInput,
    isChecking,
    isAnswered,
    onGuess,
    displayedAnalysis,
    handleKeyPress,
    isAlertActive
}) => {

    const handleShowHint = () => {
        // نجيب نص اللغز من السscenario الحالي
        const hintText = scenario.hint || "No hints available for this level.";

        Swal.fire({
            title: '<div style="color:#ff88cc; font-family:monospace; font-size: 1.4rem; font-weight:  black; tracking-spacing:2px;">💡 DECRYPTION_ASSISTANCE</div>',
            html: `
        <div style="color: #a0aec0; font-family: monospace; text-align: left; padding: 10px; line-height: 1.6;">
          <p style="color: #ff88cc; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 8px; font-weight: bold;">Intercepted Intelligence:</p>
          <div style="background: rgba(255,136,204,0.05); border: 1px solid #ff88cc30; padding: 15px; border-radius: 15px; color: #fff; font-style: italic;">
            "${hintText}"
          </div>
        </div>
      `,
            background: "#080c14",
            confirmButtonText: "RETURN TO CRACKING",
            confirmButtonColor: "#ff88cc",
            customClass: {
                popup: "border border-[#ff88cc30] rounded-[2rem]",
                confirmButton: "rounded-xl px-6 py-2.5 font-bold uppercase tracking-wider text-black font-mono",
            },
            allowOutsideClick: true
        });
    };

    return (
        <div className={`max-w-7xl mx-auto w-full flex flex-col gap-10 animate-in slide-in-from-bottom-12  font-mono relative p-6 transition-all duration-1000 
            ${isAlertActive ? 'animate-shake bg-red-900/20 backdrop-blur-sm' : ''} 
        `}>
            {/* 1. العداد والقلوب العلوي */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center gap-8 bg-[#1c2438]/60 px-6 py-2 rounded-full border border-white/5 backdrop-blur-xl shadow-xl">
                    <div className="flex items-center gap-2 text-amber-500 font-bold border-r border-white/10 pr-5 text-sm">
                        <Key size={14} fill="currentColor" /> <span>LEVEL {initialLevel}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Timer size={16} className={timeLeft < 60 ? "text-red-500 animate-pulse" : "text-blue-400"} />
                        <span className={`text-lg font-mono font-black ${timeLeft < 60 ? "text-red-500" : "text-white"}`}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    <div className="flex gap-1.5 border-l border-white/10 pl-6">
                        {[...Array(3)].map((_, i) => <Heart key={i} size={18} fill={i < lives ? "#ef4444" : "none"} color="#ef4444" className={i < lives ? "animate-pulse" : "opacity-10"} />)}
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={handleShowHint}
                            className="text-gray-400 hover:text-pink-400 hover:bg-pink-500/5 hover:border-pink-500/30 transition-all font-black uppercase tracking-wider flex items-center gap-1.5 bg-white/5 px-4 py-1 rounded-full border border-white/5"
                        >
                            <HelpCircle size={13} className="text-pink-400 animate-pulse" /> Request Hint
                        </button>
                    </div>

                </div>
            </div>

            {/* 2. ملف الهدف (Target Dossier) */}
            <div className="bg-[#0a0000] border-2 border-red-500/20 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(239,68,68,0.05)] relative overflow-hidden group">
                <div className="flex justify-between items-start mb-10 pb-6 border-b border-red-500/10">
                    <div>
                        <h3 className="text-red-500 text-xs font-black uppercase tracking-[0.3em]">Investigation_Dossier</h3>
                        <p className="text-sm text-red-100/90 font-bold border-b border-red-500/20 pb-1 mb-1">
                            TARGET_ID: {scenario.userData?.name?.toUpperCase() || "UNKNOWN_SUBJECT"}
                        </p>
                        <p className="text-[10px] text-red-500/40">Correlation Index: {Math.floor(Math.random() * 20 + 70)}% / VULNERABLE</p>

                    </div>
                    <div className="text-red-600 text-[9px] font-black px-3 py-1.5 rounded border-2 border-red-600 rotate-[-15deg] animate-pulse">CLASSIFIED</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
                    {/* بيانات الـ OSINT */}
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

                    {/* التقرير الاستخباراتي مع تأثير الكتابة */}
                    <div className="bg-red-500/5 rounded-xl p-5 font-mono italic relative overflow-hidden border border-red-500/10">
                        <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-red-600/90"></div>
                        <div className="absolute -right-10 top-5 bg-red-500/80 text-white text-[8px] font-black px-10 py-1 rotate-45 shadow-lg">Agent Analysis</div>
                        <p className="text-xs text-red-100/70 leading-relaxed pt-2">
                            {displayedAnalysis || "Decrypting field intelligence..."}
                        </p>
                    </div>
                </div>
            </div>



            {/* 3. كونسول الاختراق (Cracking Console) */}
            <div className="flex flex-col gap-6">
                <div className="bg-[#080808] border-2 border-red-500/20 rounded-[2.5rem] p-10 relative group shadow-2xl transition-all duration-300 focus-within:border-red-500/50">
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                    <div className="flex justify-between items-center mb-8">
                        <label className="text-red-500/40 text-[9px] uppercase tracking-[0.5em]">_Brute_Force_Terminal_</label>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                        </div>
                    </div>

                    <form onSubmit={onGuess} className="relative mb-8 flex items-center">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-red-500 text-2xl font-bold opacity-30">$</span>
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
                            className="w-full bg-transparent border-none pl-8 pr-12 text-3xl text-red-400 placeholder:text-red-900/10 focus:ring-0 font-mono tracking-[0.2em] outline-none"
                            placeholder="GUESS_PASSWORD_"
                            autoFocus
                        />
                        <button type="submit" disabled={isChecking || isAnswered || !breakerInput} className="absolute right-0 top-1/2 -translate-y-1/2 p-3 hover:bg-red-500 hover:text-black rounded-xl transition-all text-red-500/30">
                            {isChecking ? <Loader2 className="animate-spin" /> : <ChevronRight size={28} />}
                        </button>
                    </form>

                    {/* بار الحالة */}
                    <div className="flex gap-2 h-1 px-1">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={`flex-1 rounded-full ${isChecking ? 'bg-red-600 animate-pulse' : 'bg-white/5'}`}></div>
                        ))}
                    </div>
                </div>

                {/* شريط الاختصارات السفلي */}
                <div className="flex justify-between items-center px-8 py-3 bg-red-500/5 rounded-full border border-red-500/10">
                    <div className="flex gap-6 items-center">
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