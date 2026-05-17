import React from "react";
import { Heart, Zap, XCircle, Skull, Timer } from "lucide-react";

interface MultiLayoutProps {
    loading: boolean;
    scenarios: any[];
    currentScenarioIndex: number;
    scenario: any;
    TOTAL_STEPS: number;
    initialLevel: number;
    myUserId: string;
    raceState: any;
    myPlayerState: any;
    isAnswered: boolean;
    selectedOptionIndex: number | null;
    showExplanation: boolean;
    gameResult: any;
    userData: any;
    timeLeft: number; 
    lobbyPlayers: any[]; 
    navigate: any;
    handleAnswer: (index: number) => void;
}

const MultiLayout: React.FC<MultiLayoutProps> = ({
    loading, scenarios, currentScenarioIndex, scenario, TOTAL_STEPS,
    initialLevel, myUserId, raceState, myPlayerState, isAnswered,
    selectedOptionIndex, showExplanation, gameResult, userData, timeLeft, lobbyPlayers, navigate,
    handleAnswer
}) => {

    if (loading || !raceState) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-emerald-500 font-mono animate-pulse">
                <div className="text-4xl mb-4">🌐</div>
                <div className="text-xl tracking-widest uppercase text-center px-4">Syncing Mission Data...</div>
            </div>
        );
    }

    const playersList = Object.entries(raceState.players);
    const isMeEliminated = myPlayerState?.eliminated;
    
    const trackHeightClass = playersList.length > 2 ? 'h-[240px] md:h-[320px]' : 'h-[160px] md:h-[240px]';

    return (
        <div className="flex flex-col items-center p-3 md:p-8 text-white relative hr-wrapper">
            
            <div className="w-full flex flex-col items-center hr-left-panel max-w-6xl">
                {/* HEADER */}
                <div className="flex justify-between items-center w-full mb-3 md:mb-6 bg-[#1c2438]/80 px-4 md:px-8 py-2 md:py-4 rounded-full border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] hr-header">
                    <div className="flex items-center gap-1 md:gap-2 text-emerald-400 font-black tracking-widest border-r border-white/10 pr-2 md:pr-6 shrink-0">
                        <Zap size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">LEVEL</span> {initialLevel}
                    </div>
                    
                    <div className="flex items-center gap-1.5 md:gap-3 text-yellow-500 shrink-0">
                        <Timer size={18} className="md:w-5 md:h-5" />
                        <span className="font-mono text-sm md:text-2xl font-bold">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 pl-2 md:pl-6 border-l border-white/10 shrink-0">
                        <span className="text-[9px] md:text-xs text-gray-400 mr-1 md:mr-2 hidden sm:inline">INTEGRITY:</span>
                        {[...Array(3)].map((_, i) => (
                            <Heart 
                                key={i} className="w-3 h-3 md:w-5 md:h-5" 
                                fill={i < (myPlayerState?.lives || 0) ? "#ef4444" : "none"} 
                                color={i < (myPlayerState?.lives || 0) ? "#ef4444" : "#4b5563"} 
                            />
                        ))}
                    </div>
                </div>

                {/* 🔥 المضمار المشترك 🔥 */}
                <div className={`relative w-full max-w-6xl ${trackHeightClass} bg-gradient-to-r from-emerald-950/20 to-black rounded-[1.5rem] md:rounded-[2.5rem] border border-emerald-500/20 mb-4 md:mb-10 p-3 md:p-6 overflow-hidden shadow-2xl transition-all duration-500 hr-track`}>
                    
                    <div className="absolute inset-0 flex flex-col justify-around px-10 opacity-20 pointer-events-none py-10 hr-track-lines">
                        {playersList.map((_, i) => (
                            <div key={`line-${i}`} className="h-[2px] w-full bg-emerald-500 border-dashed border-b border-emerald-500/50"></div>
                        ))}
                    </div>

                    {playersList.map(([playerId, pState]: [string, any], index) => {
                        const isMe = playerId === myUserId;
                        const progressVal = Math.min(pState.progress, 90); 
                        
                        let topPos = 50;
                        if (playersList.length === 2) {
                            topPos = index === 0 ? 30 : 70; 
                        } else {
                            topPos = (index / (playersList.length - 1)) * 60 + 20; 
                        }
                        
                        const playerObj = lobbyPlayers?.find(p => 
                            String(p.user?._id || p.user || p.userId) === String(playerId)
                        ) || {};
                        
                        const realName = playerObj.user?.username || playerObj.username || `PLAYER ${index + 1}`;
                        const playerName = isMe ? "YOU" : realName;
                        const playerAvatar = playerObj.characterStyle || "Women3.png";

                        return (
                            <div 
                                key={playerId} 
                                className="absolute transition-all duration-700 ease-out z-20"
                                style={{ left: `calc(${progressVal}% + 10px)`, top: `${topPos}%`, transform: 'translateY(-50%)' }}
                            >
                                <div className="relative flex flex-col items-center">
                                    <div className={`w-10 h-10 md:w-16 md:h-16 rounded-full border-2 md:border-4 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden bg-[#0a0f1a] hr-avatar-container ${isMe ? 'border-emerald-500' : 'border-blue-500'} ${pState.eliminated ? 'grayscale opacity-50 border-gray-500' : ''}`}>
                                        {pState.eliminated ? <Skull size={20} className="md:w-[30px] md:h-[30px] text-gray-400 hr-skull"/> : 
                                        <img 
                                            src={`/${playerAvatar}`}
                                            className="w-full h-full object-contain" 
                                            alt="Avatar"
                                        />}
                                    </div>
                                    
                                    <div className="absolute -bottom-5 md:-bottom-8 flex justify-center w-max hr-multi-badge-container">
                                        <span className={`text-[7px] md:text-[11px] font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-full border shadow-lg hr-avatar-badge-multi ${isMe ? 'bg-emerald-900/90 text-emerald-300 border-emerald-500/50' : 'bg-blue-900/90 text-blue-300 border-blue-500/50'}`}>
                                            {playerName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* خط النهاية */}
                    <div className="absolute right-4 md:right-6 top-0 bottom-0 w-6 md:w-12 flex flex-col border-l-2 md:border-l-4 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] opacity-80 pointer-events-none hr-finish-line">
                        <div className="grid grid-cols-2 flex-1">
                            <div className="bg-white"></div><div className="bg-black"></div>
                            <div className="bg-black"></div><div className="bg-white"></div>
                            <div className="bg-white"></div><div className="bg-black"></div>
                            <div className="bg-black"></div><div className="bg-white"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col items-center hr-right-panel max-w-6xl">
                {/* QUESTION CARD */}
                <div className={`w-full bg-[#1c2438]/70 p-5 md:p-10 rounded-3xl md:rounded-[2rem] border ${isMeEliminated ? 'border-red-500/30' : 'border-emerald-500/10'} shadow-2xl transition-all hr-card flex flex-col custom-scrollbar`}>
                    {isMeEliminated ? (
                        <div className="text-center py-6 md:py-10 hr-eliminated-container flex-1 flex flex-col justify-center">
                            <Skull className="text-red-500 mx-auto mb-4 animate-bounce w-12 h-12 md:w-16 md:h-16 hr-skull-big" />
                            <h2 className="text-xl md:text-3xl font-black text-red-500 uppercase tracking-widest hr-eliminated-text">SYSTEM ELIMINATED</h2>
                            <p className="text-xs md:text-base text-gray-400 mt-2 hr-eliminated-sub">You have lost all lives. Spectating the rest of the race...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-3 md:mb-6 text-[11px] md:text-sm text-emerald-300 font-bold hr-card-header shrink-0">
                                <span>Questions {currentScenarioIndex + 1} / {TOTAL_STEPS}</span>
                            </div>
                            <h2 className="text-[15px] md:text-2xl font-semibold mb-4 md:mb-10 leading-snug hr-question-text shrink-0">{scenario.question}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 hr-options-grid">
                                {scenario.options?.map((opt: any, idx: number) => {
                                    const optionText = typeof opt === 'object' ? opt.text : opt;
                                    let style = "hr-option-btn p-4 md:p-6 rounded-xl md:rounded-2xl border border-emerald-500/20 bg-[#0f172a] hover:bg-emerald-950/40 transition text-left text-sm md:text-lg flex items-center min-h-[60px] md:min-h-[100px]";

                                    if (isAnswered) {
                                        const isCorrectOption = typeof opt === "object" ? (opt.isCorrect ?? opt.text === scenario.correctAnswer) : opt === scenario.correctAnswer;
                                        if (isCorrectOption) style = "hr-option-btn p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-emerald-400 bg-emerald-900 animate-pulse w-full text-left text-sm md:text-lg flex items-center min-h-[60px] md:min-h-[100px]";
                                        else if (idx === selectedOptionIndex) style = "hr-option-btn p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-red-400 bg-red-900 w-full text-left text-sm md:text-lg flex items-center min-h-[60px] md:min-h-[100px]";
                                        else style = "hr-option-btn p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-700 bg-gray-800 text-gray-400 w-full text-left text-sm md:text-lg flex items-center min-h-[60px] md:min-h-[100px]";
                                    }

                                    return (
                                        <button
                                            key={`${currentScenarioIndex}-${idx}`}
                                            onClick={() => handleAnswer(idx)}
                                            disabled={isAnswered}
                                            className={style}
                                        >
                                            {optionText}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* LEADERBOARD MODAL */}
            {gameResult && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md z-50 p-4">
                    <div className="bg-[#050810] border-2 border-emerald-500/50 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] max-w-2xl w-full flex flex-col max-h-[90vh]">
                        <h1 className="text-2xl md:text-4xl font-black text-emerald-500 mb-1 md:mb-2 tracking-[0.1em] md:tracking-[0.2em] uppercase">RACE CONCLUDED</h1>
                        <p className="text-gray-400 text-xs md:text-sm mb-6 md:mb-10">Final HackHero Leaderboard</p>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3 md:gap-4 mb-6 md:mb-10 text-left">
                            {Object.entries(gameResult).sort(([, a]: any, [, b]: any) => {
                                    if (a.rank === 'Eliminated') return 1;
                                    if (b.rank === 'Eliminated') return -1;
                                    return a.rank - b.rank;
                                }).map(([pId, data]: [string, any], index) => {
                                    const playerObj = lobbyPlayers?.find(p => String(p.user?._id || p.user || p.userId) === String(pId)) || {};
                                    const rName = playerObj.user?.username || playerObj.username || `Player`;
                                    return (
                                        <div key={pId} className={`flex justify-between items-center p-3 md:p-4 rounded-xl border ${pId === myUserId ? 'bg-emerald-900/30 border-emerald-500' : 'bg-white/5 border-white/10'}`}>
                                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                                <span className={`text-lg md:text-2xl font-black shrink-0 ${index === 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                                    #{data.rank === 'Eliminated' ? 'X' : data.rank}
                                                </span>
                                                <span className="font-bold text-xs md:text-base truncate">{pId === myUserId ? 'YOU (Agent)' : rName}</span>
                                            </div>
                                            <div className="text-[10px] md:text-sm font-mono text-gray-400 shrink-0 ml-2">
                                                {data.rank === 'Eliminated' ? <span className="text-red-500 font-bold">ELIMINATED</span> : `${data.progress}% Hacked`}
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                        <button onClick={() => navigate("/games")} className="w-full py-3 md:py-4 rounded-xl text-sm md:text-lg font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-black transition shadow-[0_0_20px_rgba(16,185,129,0.4)] mt-auto shrink-0">
                            Return to HQ
                        </button>
                    </div>
                </div>
            )}

            {showExplanation && !isMeEliminated && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
                    <div className="bg-[#020617] border border-red-500/40 rounded-3xl p-8 md:p-14 text-center shadow-[0_0_50px_rgba(239,68,68,0.5)] max-w-2xl w-full glitch-effect">
                        <XCircle className="text-red-500 mb-4 mx-auto w-10 h-10 md:w-12 md:h-12" />
                        <h2 className="text-lg md:text-2xl font-black text-red-400 mb-2 md:mb-3 tracking-wider">SYSTEM DAMAGE DETECTED</h2>
                        <p className="text-sm md:text-lg text-gray-300 leading-relaxed">{scenario.explanation}</p>
                    </div>
                </div>
            )}

            {/* 🔥 تصحيح شرط الجوال: (max-height: 600px) يمنع اللابتوب من الانهيار 🔥 */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
                
                @media (max-width: 930px) and (max-height: 600px) and (orientation: landscape) {
                    .hr-wrapper { 
                        padding: 4px !important; 
                        height: 100dvh !important; 
                        overflow: hidden !important; 
                        display: flex !important;
                        flex-direction: column !important; 
                        gap: 4px !important; 
                        justify-content: flex-start !important;
                    }
                    .hr-left-panel, .hr-right-panel {
                        width: 100% !important;
                        max-width: 100% !important;
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 4px !important;
                    }
                    .hr-right-panel { flex: 1 !important; overflow: hidden !important; }
                    
                    .hr-header { 
                        margin-bottom: 0 !important; 
                        padding: 2px 10px !important; 
                        width: 100% !important;
                        min-height: 28px !important;
                    }
                    .hr-header > div { padding-right: 5px !important; padding-left: 5px !important; gap: 4px !important;}
                    .hr-header svg { width: 12px !important; height: 12px !important; }
                    .hr-header span { font-size: 10px !important; }
                    
                    .hr-track { 
                        flex: none !important; 
                        height: 115px !important; 
                        min-height: 115px !important; 
                        margin-bottom: 0 !important; 
                        padding: 4px 10px !important; 
                        border-radius: 1rem !important; 
                    }
                    .hr-track-lines { padding-top: 5px !important; padding-bottom: 5px !important; }
                    .hr-avatar-container { width: 22px !important; height: 22px !important; border-width: 1px !important;}
                    .hr-skull { width: 12px !important; height: 12px !important; }
                    .hr-multi-badge-container { bottom: -8px !important; }
                    .hr-avatar-badge-multi { font-size: 5px !important; padding: 1px 3px !important; margin-top: 1px !important;}
                    .hr-finish-line { width: 15px !important; border-left-width: 2px !important; }
                    
                    .hr-card { 
                        padding: 10px 14px !important; 
                        margin-bottom: 0 !important; 
                        border-radius: 1rem !important; 
                        flex: 1 !important;
                        display: flex !important; 
                        flex-direction: column !important; 
                        justify-content: flex-start !important;
                        min-height: 0 !important;
                        overflow-y: auto !important;
                    }
                    .hr-card-header { margin-bottom: 6px !important; font-size: 10px !important; }
                    .hr-question-text { font-size: 12px !important; margin-bottom: 8px !important; line-height: 1.3 !important; }
                    .hr-eliminated-container { padding: 10px !important; }
                    .hr-skull-big { width: 20px !important; height: 20px !important; margin-bottom: 4px !important; }
                    .hr-eliminated-text { font-size: 14px !important; }
                    .hr-eliminated-sub { font-size: 10px !important; }
                    
                    .hr-options-grid { 
                        gap: 6px !important; 
                        display: grid !important; 
                        grid-template-columns: 1fr 1fr !important; 
                        flex: none !important; 
                        align-content: start !important; 
                    }
                    .hr-option-btn { 
                        padding: 6px 10px !important; 
                        font-size: 10px !important; 
                        border-radius: 0.5rem !important; 
                        line-height: 1.2 !important; 
                        display: flex !important; 
                        align-items: center !important; 
                        height: auto !important;
                        min-height: 35px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MultiLayout;