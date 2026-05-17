import React from 'react';
import { Shield, ChevronRight, Loader2, User, Calendar, MapPin, Dog, MessageSquare, Key } from "lucide-react";

interface MakerMultiLayoutProps {
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
        <div className={`flex flex-1 flex-col h-full p-4 md:p-6 z-10 text-white mm-wrapper transition-all duration-300 ${isAlertActive ? 'animate-glitch bg-red-900/10' : ''}`}>
            
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-4 bg-[#050810]/80 backdrop-blur-md border border-emerald-500/20 rounded-[2.5rem] p-5 md:p-8 shadow-2xl font-mono mm-container flex-1 overflow-y-auto custom-scrollbar">
                
                <div className="flex justify-between items-center border-b border-emerald-500/20 pb-3 md:pb-4 shrink-0 mm-header">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-widest text-emerald-500">Mission Architect</h2>
                        <p className="text-[8px] md:text-[10px] text-emerald-500/50 tracking-[0.2em] mt-1">Design the target's digital footprint and set the encryption key.</p>
                    </div>
                    <div className="bg-emerald-500/10 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-emerald-500/20 flex items-center gap-2 md:gap-3 shrink-0">
                        <Shield size={16} className="text-emerald-400 animate-pulse" />
                        <span className="text-[9px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest">Mastermind Mode</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 flex-1 min-h-0 mm-grid-content">
                    
                    {/* Target Dossier */}
                    <div className="space-y-4 flex flex-col justify-center mm-panel-dossier">
                        <h3 className="text-emerald-500/80 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 border-b border-emerald-500/10 pb-1.5 shrink-0">
                            <User size={14} /> Target_Dossier_Creation
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-2 md:gap-4 mm-inputs-grid">
                            <div className="space-y-1">
                                <label className="text-[8px] md:text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-1"><User size={10}/> Target Name</label>
                                <input type="text" value={targetName} onChange={e => setTargetName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-[#080808] border border-emerald-500/20 rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-emerald-400 placeholder:text-emerald-900/30 focus:border-emerald-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] md:text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-1"><Calendar size={10}/> Birth Year</label>
                                <input type="text" value={birthYear} onChange={e => setBirthYear(e.target.value)} placeholder="e.g. 1990" className="w-full bg-[#080808] border border-emerald-500/20 rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-emerald-400 placeholder:text-emerald-900/30 focus:border-emerald-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] md:text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-1"><MapPin size={10}/> City / Sector</label>
                                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Neo Tokyo" className="w-full bg-[#080808] border border-emerald-500/20 rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-emerald-400 placeholder:text-emerald-900/30 focus:border-emerald-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] md:text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-1"><Dog size={10}/> Unit Pet</label>
                                <input type="text" value={pet} onChange={e => setPet(e.target.value)} placeholder="e.g. CyberDog" className="w-full bg-[#080808] border border-emerald-500/20 rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-emerald-400 placeholder:text-emerald-900/30 focus:border-emerald-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Hints & Password */}
                    <div className="space-y-4 flex flex-col justify-between mm-panel-encryption">
                        <h3 className="text-emerald-500/80 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 border-b border-emerald-500/10 pb-1.5 shrink-0">
                            <MessageSquare size={14} /> Encryption_&_Hints
                        </h3>
                        
                        <div className="space-y-1 flex-1 flex flex-col justify-center">
                            <label className="text-[8px] md:text-[10px] text-emerald-500/60 uppercase tracking-widest">Agent Intercept Hint</label>
                            <textarea 
                                value={hint} onChange={e => setHint(e.target.value)}
                                placeholder="Write a cryptic hint for the Breaker..." 
                                className="w-full h-16 md:h-24 bg-[#080808] border border-emerald-500/20 rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-emerald-400 placeholder:text-emerald-900/30 focus:border-emerald-500 outline-none resize-none"
                            />
                        </div>

                        <div className="space-y-1 relative shrink-0">
                            <label className="text-[8px] md:text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-1"><Key size={10}/> Deployment Sequence</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-emerald-500/30 font-bold">$</span>
                                <input 
                                    type="text" value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="e.g. CyberDog1990" 
                                    className="w-full bg-[#080808] border border-emerald-500/40 rounded-xl p-3 md:p-4 pl-10 text-base md:text-xl text-white tracking-[0.2em] focus:border-emerald-400 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Section */}
                {!isDeployed ? (
                    <div className="mt-4 flex justify-end border-t border-emerald-500/20 pt-3 shrink-0 mm-footer">
                        <button
                            disabled={loading || !isFormComplete}
                            onClick={handleDeploy}
                            className={`flex items-center gap-2 px-6 py-3 md:px-10 md:py-4 rounded-xl font-black uppercase text-xs md:text-sm tracking-widest transition-all ${isFormComplete ? 'bg-emerald-500 text-black hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Deploy Mission"} 
                            <ChevronRight size={16} />
                        </button>
                    </div>
                ) : (
                    /* Live Threat Monitoring Logs */
                    <div className="mt-4 border-t border-red-500/20 pt-3 animate-in fade-in zoom-in duration-500 shrink-0 mm-logs">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-red-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div> Live_Threat_Monitoring
                            </h3>
                        </div>
                        
                        <div className="bg-[#050810] border border-red-500/20 rounded-xl p-3 h-28 md:h-48 overflow-y-auto font-mono text-[10px] md:text-xs space-y-1 shadow-inner custom-scrollbar">
                            {attackLogs.length === 0 ? (
                                <span className="text-gray-600 italic animate-pulse">Scanning for brute-force attempts...</span>
                            ) : (
                                attackLogs.map((log, i) => (
                                    <div key={i} className="flex items-center gap-3 border-b border-white/5 pb-1.5">
                                        <span className="text-gray-600">[{log.time}]</span>
                                        <span className="text-white">Attacker Guess: <span className="text-gray-300 font-bold">"{log.guess}"</span></span>
                                        {log.isCorrect ? (
                                            <span className="text-red-500 font-black ml-auto shadow-[0_0_10px_#ef4444] px-1.5 py-0.5 rounded bg-red-500/10 text-[9px]">BREACH DETECTED</span>
                                        ) : (
                                            <span className="text-emerald-500 font-bold ml-auto opacity-70 text-[9px]">ACCESS DENIED</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* سحر ببجي المخصص لـ Maker Multi في الجوال */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 2px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 4px; }
                
                @media (max-width: 930px) and (orientation: landscape) {
                    .mm-wrapper { padding: 4px !important; height: 100dvh !important; overflow: hidden !important; }
                    .mm-container { 
                        height: 100dvh !important; 
                        max-height: 100dvh !important; 
                        border-radius: 0 !important; 
                        border: none !important; 
                        padding: 8px 16px !important;
                    }
                    .mm-header p { display: none !important; }
                    .mm-grid-content { display: flex !important; flex-direction: row !important; gap: 10px !important; overflow: hidden !important;}
                    .mm-panel-dossier { width: 45% !important; height: 100% !important; }
                    .mm-panel-encryption { width: 55% !important; height: 100% !important; }
                    .mm-inputs-grid { gap: 6px !important; }
                    .mm-inputs-grid input { padding: 6px 10px !important; font-size: 11px !important; }
                    .mm-footer { padding-top: 4px !important; margin-top: 4px !important; }
                    .mm-logs { padding-top: 4px !important; margin-top: 4px !important; }
                }
            `}</style>
        </div>
    );
};

export default MakerMultiLayout;