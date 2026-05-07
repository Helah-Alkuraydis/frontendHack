import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Loader2, ChevronRight, Timer, Heart, Key } from "lucide-react";

interface MakerSingleLayoutProps {
    password: string;
    setPassword: (val: string) => void;
    handleKeyPress: () => void;
    strength: number;
    isVulnerable: boolean;
    isAlertActive: boolean;
    isAiAnalyzing: boolean;
    displayedText: string;
    aiRecommendation: string;
    loading: boolean;
    timeLeft: number;
    lives: number;
    initialLevel: number;
    handleMakerSubmit: () => void;
    handleReset: () => void;
}

const MakerSingleLayout: React.FC<MakerSingleLayoutProps> = ({
    password, setPassword, strength, isVulnerable, isAlertActive,
    isAiAnalyzing, displayedText, aiRecommendation, loading,
    timeLeft, lives, initialLevel, handleMakerSubmit, handleReset,
    handleKeyPress

}) => {
    
    // شروط الباسوورد
    const rules = [
        { label: "MIN_LENGTH_10", met: password.length >= 10 },
        { label: "UPPERCASE_CHAR", met: /[A-Z]/.test(password) },
        { label: "LOWERCASE_CHAR", met: /[a-z]/.test(password) },
        { label: "NUMERIC_DIGIT", met: /[0-9]/.test(password) },
        { label: "SPECIAL_SYMBOL", met: /[^A-Za-z0-9]/.test(password) },
    ];

    

    return (
        <div className={`flex flex-1 flex-col h-full p-6 z-10 text-white transition-all duration-300 ${isAlertActive ? 'animate-glitch bg-red-900/10' : ''}`}>
            
            {/* الهيدر العلوي (العداد والقلوب) */}
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
                </div>
            </div>

            {/* الحاوية الرئيسية للميكر */}
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-700 bg-black/40 backdrop-blur-md border border-emerald-500/20 rounded-[2rem] p-6 shadow-xl font-mono">
                <div className="flex justify-between p-2 border-b border-emerald-500/10 text-[9px] font-mono">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isVulnerable || isAlertActive ? 'bg-red-500 animate-ping ' : 'bg-emerald-500'}`}></span>
                            SYSTEM: {isAlertActive ? 'BREACHED' : isVulnerable ? 'VULNERABLE' : 'OPTIMAL'}
                        </span>
                        <span className="opacity-30">|</span>
                        <span className={isVulnerable ? 'text-red-500' : 'text-emerald-500'}>
                            THREAT_LEVEL: {isVulnerable ? 'HIGH' : 'LOW'}
                        </span>
                    </div>
                    <div className="text-emerald-500/40 italic">HACKHERO_SIMULATOR_v1.0</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* قائمة الشروط */}
                    <div className="Security Protocols md:col-span-1">
                        <h3 className="text-emerald-500 text-[10px] font-black mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Shield size={14} className="animate-pulse" /> Security_Protocols
                        </h3>
                        <ul className="space-y-3">
                            {rules.map((rule, idx) => (
                                <li key={idx} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-500 ${rule.met ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' : 'border-white/5 text-gray-600'}`}>
                                    <span className="text-[10px] font-bold">{rule.label}</span>
                                    {rule.met ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* حقل الإدخال */}
                    <div className="password-input-field md:col-span-2">
                        <div className="bg-[#080808] rounded-[2rem] p-10 relative overflow-hidden group shadow-inner">
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <label className="block text-emerald-500/40 text-[9px] mb-6 uppercase tracking-[0.5em] font-mono">_Initialize_Security_Sequence_</label>

                            <div className="relative mb-8 flex items-center">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-emerald-500 text-2xl font-bold opacity-30">$</span>
                                <input
                                    type="text"
                                    onKeyDown={(e) => {
                                        handleKeyPress();
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleMakerSubmit();
                                        } else if (e.key === 'Escape') {
                                            handleReset();
                                        }
                                    }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent border-none pl-6 pr-12 text-2xl text-emerald-400 placeholder:text-emerald-900/30 focus:ring-0 font-mono tracking-widest outline-none focus:outline-none"
                                    placeholder="ENTER_PASS_SEQUENCE_"
                                    autoFocus
                                />
                                <button
                                    disabled={loading || password.length < 6}
                                    onClick={handleMakerSubmit}
                                    className="ml-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} />}
                                </button>
                            </div>

                            {/* شريط القوة */}
                            <div className="flex gap-2 h-1.5 px-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`flex-1 rounded-full transition-all duration-1000 ${i < strength ? (strength <= 2 ? 'bg-red-600 shadow-[0_0_15px_#ef4444]' : strength <= 4 ? 'bg-amber-500 shadow-[0_0_15px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]') : 'bg-white/5'}`} />
                                ))}
                            </div>

                            {/* مربع الـ AI */}
                            <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl relative overflow-hidden min-h-[80px]">
                                <div className="flex items-center gap-2 mb-2 relative z-10">
                                    {isAiAnalyzing ? <Loader2 size={14} className="text-emerald-400 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                        {isAiAnalyzing ? "AI_DECRYPTING_PATTERNS..." : "AI_CO_PILOT_ADVISORY"}
                                    </span>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-300 font-mono leading-relaxed">
                                        {isAiAnalyzing ? (
                                            <span className="opacity-50 italic">Analyzing entropy and keyboard sequence correlations...</span>
                                        ) : (
                                            <>
                                                <span className="text-emerald-500 mr-2 font-bold">{">"}</span>
                                                {displayedText}
                                                <span className="inline-block w-1.5 h-3 bg-emerald-500 ml-1 animate-pulse" />
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MakerSingleLayout;