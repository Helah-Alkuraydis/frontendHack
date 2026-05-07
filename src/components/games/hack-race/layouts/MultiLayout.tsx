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
                <div className="text-xl tracking-widest uppercase">Syncing Players...</div>
            </div>
        );
    }

    const playersList = Object.entries(raceState.players);
    const isMeEliminated = myPlayerState?.eliminated;
    
    // رفعنا الارتفاع شوي لـ 240 عشان الاسم ياخذ راحته تحت
    const trackHeightClass = playersList.length > 2 ? 'h-[320px]' : 'h-[240px]';

    return (
        <div className="flex flex-col items-center p-8 text-white relative">
            
            {/* HEADER */}
            <div className="flex justify-between items-center w-full max-w-6xl mb-6 bg-[#1c2438]/80 px-8 py-4 rounded-full border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <div className="flex items-center gap-2 text-emerald-400 font-black tracking-widest border-r border-white/10 pr-6">
                    <Zap size={20} /> LEVEL {initialLevel}
                </div>
                
                <div className="flex items-center gap-3 text-yellow-500">
                    <Timer size={22} />
                    <span className="font-mono text-2xl font-bold">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                    </span>
                </div>

                <div className="flex items-center gap-2 pl-6 border-l border-white/10">
                    <span className="text-xs text-gray-400 mr-2">INTEGRITY:</span>
                    {[...Array(3)].map((_, i) => (
                        <Heart 
                            key={i} size={22} 
                            fill={i < (myPlayerState?.lives || 0) ? "#ef4444" : "none"} 
                            color={i < (myPlayerState?.lives || 0) ? "#ef4444" : "#4b5563"} 
                        />
                    ))}
                </div>
            </div>

            {/* 🔥 المضمار المشترك 🔥 */}
            <div className={`relative w-full max-w-6xl ${trackHeightClass} bg-gradient-to-r from-emerald-950/20 to-black rounded-[2.5rem] border border-emerald-500/20 mb-10 p-6 overflow-hidden shadow-2xl transition-all duration-500`}>
                
                <div className="absolute inset-0 flex flex-col justify-around px-10 opacity-20 pointer-events-none py-10">
                    {playersList.map((_, i) => (
                        <div key={`line-${i}`} className="h-[2px] w-full bg-emerald-500 border-dashed border-b border-emerald-500/50"></div>
                    ))}
                </div>

                {playersList.map(([playerId, pState]: [string, any], index) => {
                    const isMe = playerId === myUserId;
                    const progressVal = Math.min(pState.progress, 90); 
                    
                    // مسافات التوسيط
                    let topPos = 50;
                    if (playersList.length === 2) {
                        topPos = index === 0 ? 30 : 70; 
                    } else {
                        topPos = (index / (playersList.length - 1)) * 60 + 20; 
                    }
                    
                    // 🔥 كود استخراج الاسم الذكي والمضبوط 100%
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
                            style={{ left: `calc(${progressVal}% + 20px)`, top: `${topPos}%`, transform: 'translateY(-50%)' }}
                        >
                            <div className="relative flex flex-col items-center">
                                {/* صورة اللاعب */}
                                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden bg-[#0a0f1a] ${isMe ? 'border-emerald-500' : 'border-blue-500'} ${pState.eliminated ? 'grayscale opacity-50 border-gray-500' : ''}`}>
                                    {pState.eliminated ? <Skull size={30} className="text-gray-400"/> : 
                                    <img 
                                        src={`/${playerAvatar}`}
                                        className="w-full h-full object-contain" 
                                        alt="Avatar"
                                    />}
                                </div>
                                
                                {/* 🔥 الاسم الإجباري (Floating Badge) مستحيل يختفي */}
                                <div className="absolute -bottom-8 flex justify-center w-max">
                                    <span className={`text-[11px] font-black px-3 py-1 rounded-full border shadow-lg ${isMe ? 'bg-emerald-900/90 text-emerald-300 border-emerald-500/50' : 'bg-blue-900/90 text-blue-300 border-blue-500/50'}`}>
                                        {playerName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* خط النهاية */}
                <div className="absolute right-6 top-0 bottom-0 w-12 flex flex-col border-l-4 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] opacity-80 pointer-events-none">
                    <div className="grid grid-cols-2 flex-1">
                        <div className="bg-white"></div><div className="bg-black"></div>
                        <div className="bg-black"></div><div className="bg-white"></div>
                        <div className="bg-white"></div><div className="bg-black"></div>
                        <div className="bg-black"></div><div className="bg-white"></div>
                    </div>
                </div>
            </div>

            {/* QUESTION CARD */}
            <div className={`w-full max-w-6xl bg-[#1c2438]/70 p-10 rounded-3xl border ${isMeEliminated ? 'border-red-500/30' : 'border-emerald-500/10'} shadow-2xl transition-all`}>
                {isMeEliminated ? (
                    <div className="text-center py-10">
                        <Skull size={64} className="text-red-500 mx-auto mb-4 animate-bounce" />
                        <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest">SYSTEM ELIMINATED</h2>
                        <p className="text-gray-400 mt-2">You have lost all lives. Spectating the rest of the race...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6 text-sm text-emerald-300 font-bold">
                            <span>Questions {currentScenarioIndex + 1} / {TOTAL_STEPS}</span>
                        </div>
                        <h2 className="text-2xl font-semibold mb-10">{scenario.question}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {scenario.options?.map((opt: any, idx: number) => {
                                const optionText = typeof opt === 'object' ? opt.text : opt;
                                let style = "p-6 rounded-2xl border border-emerald-500/20 bg-[#0f172a] hover:bg-emerald-950/40 transition text-left text-lg";

                                if (isAnswered) {
                                    const isCorrectOption = typeof opt === "object" ? (opt.isCorrect ?? opt.text === scenario.correctAnswer) : opt === scenario.correctAnswer;
                                    if (isCorrectOption) style = "p-6 rounded-2xl border-2 border-emerald-400 bg-emerald-900 animate-pulse w-full";
                                    else if (idx === selectedOptionIndex) style = "p-6 rounded-2xl border-2 border-red-400 bg-red-900 w-full";
                                    else style = "p-6 rounded-2xl border border-gray-700 bg-gray-800 text-gray-400 w-full";
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

            {/* LEADERBOARD MODAL */}
            {gameResult && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md z-50 p-4">
                    <div className="bg-[#050810] border-2 border-emerald-500/50 rounded-[3rem] p-12 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] max-w-2xl w-full">
                        <h1 className="text-4xl font-black text-emerald-500 mb-2 tracking-[0.2em] uppercase">RACE CONCLUDED</h1>
                        <p className="text-gray-400 text-sm mb-10">Final HackHero Leaderboard</p>
                        <div className="flex flex-col gap-4 mb-10 text-left">
                            {Object.entries(gameResult).sort(([, a]: any, [, b]: any) => {
                                    if (a.rank === 'Eliminated') return 1;
                                    if (b.rank === 'Eliminated') return -1;
                                    return a.rank - b.rank;
                                }).map(([pId, data]: [string, any], index) => {
                                    const playerObj = lobbyPlayers?.find(p => String(p.user?._id || p.user || p.userId) === String(pId)) || {};
                                    const rName = playerObj.user?.username || playerObj.username || `Player`;
                                    return (
                                        <div key={pId} className={`flex justify-between items-center p-4 rounded-xl border ${pId === myUserId ? 'bg-emerald-900/30 border-emerald-500' : 'bg-white/5 border-white/10'}`}>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-2xl font-black ${index === 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                                    #{data.rank === 'Eliminated' ? 'X' : data.rank}
                                                </span>
                                                <span className="font-bold">{pId === myUserId ? 'YOU (Agent)' : rName}</span>
                                            </div>
                                            <div className="text-sm font-mono text-gray-400">
                                                {data.rank === 'Eliminated' ? <span className="text-red-500 font-bold">ELIMINATED</span> : `${data.progress}% Hacked`}
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                        <button onClick={() => navigate("/games")} className="w-full py-4 rounded-xl text-lg font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-black transition shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                            Return to HQ
                        </button>
                    </div>
                </div>
            )}

            {showExplanation && !isMeEliminated && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
                    <div className="bg-[#020617] border border-red-500/40 rounded-3xl p-14 text-center shadow-[0_0_50px_rgba(239,68,68,0.5)] max-w-2xl glitch-effect">
                        <XCircle size={48} className="text-red-500 mb-4 mx-auto" />
                        <h2 className="text-2xl font-black text-red-400 mb-3 tracking-wider">SYSTEM DAMAGE DETECTED</h2>
                        <p className="text-lg text-gray-300 leading-relaxed">{scenario.explanation}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiLayout;