import React from 'react';
import { Shield, ChevronRight, Loader2, User, Calendar, MapPin, Dog, MessageSquare, Key } from "lucide-react";

interface MakerMultiLayoutProps {
    // States
    targetName: string;
    setTargetName: (val: string) => void;
    birthYear: string;
    setBirthYear: (val: string) => void;
    city: string;
    setCity: (val: string) => void;
    pet: string;
    setPet: (val: string) => void;
    hint: string;
    setHint: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    handleKeyPress: () => void;
    
    // Actions
    handleDeploy: () => void;
    loading: boolean;
    isAlertActive: boolean;

    isDeployed?: boolean;
    attackLogs?: {guess: string, isCorrect: boolean, time: string}[];

}

const MakerMultiLayout: React.FC<MakerMultiLayoutProps> = ({
    targetName, setTargetName, birthYear, setBirthYear,
    city, setCity, pet, setPet, hint, setHint,
    password, setPassword, handleDeploy, loading, isAlertActive,
    handleKeyPress, isDeployed, attackLogs = []
}) => {

    const isFormComplete = targetName && birthYear && city && pet && hint && password.length >= 4;

    return (
        <div className={`flex flex-1 flex-col h-full p-6 z-10 text-white transition-all duration-300 ${isAlertActive ? 'animate-glitch bg-red-900/10' : ''}`}>
            
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-700 bg-[#050810]/80 backdrop-blur-md border border-emerald-500/20 rounded-[2.5rem] p-8 shadow-2xl font-mono">
                
                <div className="flex justify-between items-center border-b border-emerald-500/20 pb-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-widest text-emerald-500">Mission Architect</h2>
                        <p className="text-[10px] text-emerald-500/50 tracking-[0.2em] mt-1">Design the target's digital footprint and set the encryption key.</p>
                    </div>
                    <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-3">
                        <Shield size={20} className="text-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Mastermind Mode</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    {/* 🟢 القسم الأول: بيانات الضحية (Target Dossier) */}
                    <div className="space-y-6">
                        <h3 className="text-emerald-500/80 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 border-b border-emerald-500/10 pb-2">
                            <User size={14} /> Target_Dossier_Creation
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-1"><User size={10}/> Target Name</label>
                                <input type="text" value={targetName} onChange={e => setTargetName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-[#080808] border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-400 placeholder:text-emerald-900/30 focus:border-emerald-500 outline-none transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-1"><Calendar size={10}/> Birth Year</label>
                                <input type="text" value={birthYear} onChange={e => setBirthYear(e.target.value)} placeholder="e.g. 1990" className="w-full bg-[#080808] border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-400 placeholder:text-emerald-900/30 focus:border-emerald-500 outline-none transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-1"><MapPin size={10}/> City / Sector</label>
                                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Neo Tokyo" className="w-full bg-[#080808] border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-400 placeholder:text-emerald-900/30 focus:border-emerald-500 outline-none transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-1"><Dog size={10}/> Unit Pet</label>
                                <input type="text" value={pet} onChange={e => setPet(e.target.value)} placeholder="e.g. CyberDog" className="w-full bg-[#080808] border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-400 placeholder:text-emerald-900/30 focus:border-emerald-500 outline-none transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* 🟢 القسم الثاني: التلميح والباسوورد */}
                    <div className="space-y-6 flex flex-col">
                        <h3 className="text-emerald-500/80 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 border-b border-emerald-500/10 pb-2">
                            <MessageSquare size={14} /> Encryption_&_Hints
                        </h3>
                        
                        <div className="space-y-2 flex-1">
                            <label className="text-[10px] text-emerald-500/60 uppercase tracking-widest">Agent Intercept Hint</label>
                            <textarea 
                                value={hint} onChange={e => setHint(e.target.value)}
                                placeholder="Write a cryptic hint for the Breaker to figure out the password based on the dossier..." 
                                className="w-full h-24 bg-[#080808] border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-400 placeholder:text-emerald-900/30 focus:border-emerald-500 outline-none transition-colors resize-none"
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-1"><Key size={10}/> Deployment Sequence (Password)</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-emerald-500/30 font-bold">$</span>
                                <input 
                                    type="text" value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="e.g. CyberDog1990" 
                                    className="w-full bg-[#080808] border border-emerald-500/40 rounded-xl p-4 pl-10 text-xl text-white tracking-[0.2em] placeholder:text-emerald-900/20 focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* 🟢 منطقة القرار: زر الإرسال أو شاشة المراقبة */}
                {!isDeployed ? (
                    <div className="mt-8 flex justify-end border-t border-emerald-500/20 pt-6">
                        <button
                            disabled={loading || !isFormComplete}
                            onClick={handleDeploy}
                            className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-all ${isFormComplete ? 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : "Deploy Mission"} 
                            <ChevronRight size={20} />
                        </button>
                    </div>
                ) : (
                    /* 🚨 شاشة المراقبة الحية (تظهر بعد الإرسال) */
                    <div className="mt-8 border-t border-red-500/20 pt-6 animate-in fade-in zoom-in duration-500">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-red-500 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div> Live_Threat_Monitoring
                            </h3>
                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Awaiting attacker inputs...</span>
                        </div>
                        
                        <div className="bg-[#050810] border border-red-500/20 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs space-y-2 shadow-inner">
                            {attackLogs.length === 0 ? (
                                <span className="text-gray-600 italic animate-pulse">Scanning for brute-force attempts...</span>
                            ) : (
                                attackLogs.map((log, i) => (
                                    <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-2 animate-in slide-in-from-left-2">
                                        <span className="text-gray-600">[{log.time}]</span>
                                        <span className="text-white">Attacker Guess: <span className="text-gray-300 font-bold">"{log.guess}"</span></span>
                                        {log.isCorrect ? (
                                            <span className="text-red-500 font-black ml-auto blink shadow-[0_0_10px_#ef4444] px-2 py-1 rounded bg-red-500/10">BREACH DETECTED</span>
                                        ) : (
                                            <span className="text-emerald-500 font-bold ml-auto opacity-70">ACCESS DENIED</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MakerMultiLayout;