import React from "react";
import Swal from "sweetalert2";
import { Timer, Heart, Lightbulb, Zap, XCircle } from "lucide-react";

interface SingleLayoutProps {
    loading: boolean;
    scenarios: any[];
    currentScenarioIndex: number;
    scenario: any;
    TOTAL_STEPS: number;
    FINISH_POSITION: number;
    initialLevel: number;
    timeLeft: number;
    lives: number;
    playerProgress: number;
    aiProgress: number;
    isWarning: boolean;
    isAnswered: boolean;
    selectedOptionIndex: number | null;
    gameResult: "win" | "loss" | null;
    message: string;
    showExplanation: boolean;
    userData: any;
    navigate: any;
    handleAnswer: (index: number) => void;
}

const SingleLayout: React.FC<SingleLayoutProps> = ({
    loading, scenarios, currentScenarioIndex, scenario, TOTAL_STEPS, FINISH_POSITION,
    initialLevel, timeLeft, lives, playerProgress, aiProgress, isWarning,
    isAnswered, selectedOptionIndex, gameResult, message, showExplanation,
    userData, navigate, handleAnswer
}) => {

    if (loading || scenarios.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen text-white text-xl">
                Loading mission...
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center p-3 md:p-8 text-white hr-wrapper">
            
            <div className="w-full flex flex-col items-center hr-left-panel max-w-5xl">
                {/* HEADER */}
                <div className="flex w-full md:w-auto items-center justify-between md:justify-center gap-2 md:gap-8 bg-[#1c2438]/60 px-4 md:px-8 py-2 md:py-3 rounded-full border border-white/10 mb-4 md:mb-10 hr-header shadow-lg">
                    <div className="flex items-center gap-1 md:gap-2 text-yellow-500 font-bold border-r border-white/10 pr-2 md:pr-6 shrink-0">
                        <Zap size={16} /> LEVEL {initialLevel}
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                        <Timer size={18} />
                        <span className="font-mono text-sm md:text-xl">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                        </span>
                    </div>
                    <div
                        onClick={() => Swal.fire({ title: "AI Hint", text: scenario.hint || scenario.explanation })}
                        className="cursor-pointer text-yellow-400 shrink-0"
                    >
                        <Lightbulb size={18}/>
                    </div>
                    <div className="flex gap-1 md:gap-2 border-l border-white/10 pl-2 md:pl-6 shrink-0">
                        {[...Array(3)].map((_, i) => (
                            <Heart key={i} size={18} className="md:w-5 md:h-5" fill={i < lives ? "#ef4444" : "none"} color="#ef4444" />
                        ))}
                    </div>
                </div>

                {/* RACE TRACK */}
                <div className="relative w-full max-w-5xl h-[120px] md:h-40 bg-gradient-to-r from-emerald-950/30 to-black rounded-3xl md:rounded-[2.5rem] border border-emerald-500/20 mb-4 md:mb-10 p-3 md:p-6 overflow-hidden shadow-2xl hr-track">
                    <div className="absolute inset-0 flex flex-col justify-around px-10 opacity-20 pointer-events-none">
                        <div className="h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                        <div className="h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
                        <div className="h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                    </div>

                    {/* PLAYER */}
                    <div
                        className="absolute top-1 md:top-4 transition-all duration-700 flex flex-col items-center z-20 animate-[wiggle_0.6s_ease-in-out_infinite]"
                        style={{ left: `calc(${Math.min(playerProgress, FINISH_POSITION)}% - 25px)` }}
                    >
                        <div className="relative">
                            <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center overflow-hidden hr-avatar-container">
                                <img src={`/${userData?.characterStyle || "Women3.png"}`} className="w-full h-full object-contain" alt="Player" />
                            </div>
                            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 md:p-1 shadow-lg border border-emerald-500 animate-bounce hr-zap">
                                <Zap size={10} className="md:w-3 md:h-3 text-emerald-500 fill-emerald-500" />
                            </div>
                        </div>
                        <span className="text-[8px] md:text-xs font-black mt-0.5 md:mt-2 text-white bg-emerald-900/80 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-emerald-500/30 hr-avatar-badge">YOU</span>
                    </div>

                    {/* AI / Hacker */}
                    <div
                        className="absolute bottom-1 md:bottom-4 transition-all duration-700 flex flex-col items-center animate-[wiggle_0.6s_ease-in-out_infinite]"
                        style={{ left: `calc(${Math.min(aiProgress, FINISH_POSITION)}% - 25px)` }}
                    >
                        <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-red-500/20 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center overflow-hidden hr-avatar-container">
                            <img src="/Hacker1.png" className="w-full h-full object-contain" alt="Hacker" />
                        </div>
                        <span className="text-[8px] md:text-xs font-black mt-0.5 md:mt-2 text-red-400 bg-black/70 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-red-500/20 hr-avatar-badge">Hacker</span>
                    </div>

                    {/* FINISH LINE */}
                    <div className="absolute right-4 top-0 bottom-0 w-6 md:w-10 flex flex-col border-l-4 border-emerald-400 animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.9)] pointer-events-none hr-finish-line">
                        <div className="grid grid-cols-2 flex-1">
                            <div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-white"></div>
                            <div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-white"></div>
                        </div>
                    </div>

                    {isWarning && <div className="absolute inset-0 pointer-events-none z-50 animate-pulse border-4 border-red-600/50 shadow-[inside_0_0_50px_rgba(220,38,38,0.5)]"></div>}
                    {aiProgress > 80 && <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none rounded-[2.5rem]"></div>}
                </div>
            </div>

            <div className="w-full flex flex-col items-center hr-right-panel max-w-5xl">
                {/* QUESTION CARD */}
                <div className="w-full bg-[#1c2438]/70 p-5 md:p-10 rounded-3xl md:rounded-[2rem] border border-emerald-500/10 shadow-2xl hr-card flex flex-col">
                    <div className="flex justify-between items-center mb-3 md:mb-6 text-[11px] md:text-sm text-emerald-300 font-bold hr-card-header shrink-0">
                        <span>Questions {currentScenarioIndex + 1} / {TOTAL_STEPS}</span>
                    </div>
                    <h2 className="text-[15px] md:text-2xl font-semibold mb-4 md:mb-10 leading-snug hr-question-text shrink-0">{scenario.question}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 hr-options-grid">
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
                </div>
            </div>

            {/* WIN MODAL */}
            {gameResult === "win" && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-50 p-4">
                    <div className="bg-[#020617] border border-emerald-500/30 rounded-[2.5rem] p-8 md:p-14 text-center shadow-[0_0_50px_rgba(16,185,129,0.4)] max-w-lg w-full">
                        <h1 className="text-xl md:text-[22px] font-bold text-emerald-500 mb-3 tracking-tight">MISSION COMPLETE</h1>
                        <div className="text-5xl md:text-7xl mb-6">🏁</div>
                        <p className="text-xs md:text-[14px] text-gray-300 mb-2 leading-relaxed">You outran the hacker and won the Race! Bravo 🎉</p>
                        <p className="text-[10px] md:text-[11px] text-emerald-400 font-bold uppercase tracking-wide mb-6">Level {initialLevel} Cleared</p>
                        <div className="text-xl md:text-[22px] font-black text-emerald-400 mb-6">{`+${25 * initialLevel} XP`}</div>
                        <button onClick={() => navigate("/games")} className="w-full md:w-auto px-6 py-3 rounded-xl text-xs md:text-[12px] font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-white transition shadow-lg shadow-emerald-500/30">
                            PROCEED →
                        </button>
                    </div>
                </div>
            )}

            {/* LOSS MODAL */}
            {gameResult === "loss" && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[500] flex items-center justify-center p-4">
                    <div className="bg-[#0a0000] rounded-[2.5rem] max-w-xl w-full shadow-2xl border-4 md:border-8 border-red-500/40 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 md:px-8 py-4 md:py-6 border-b border-red-500/20 text-center">
                            <h2 className="text-xl md:text-3xl font-black text-red-500 tracking-wider uppercase">SYSTEM OVERLOAD</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 md:py-10 text-center custom-scrollbar">
                            <div className="text-5xl md:text-7xl mb-4 md:mb-6">💀</div>
                            <p className="text-lg md:text-xl font-bold text-white mb-2 md:mb-4">Attempt 1 of 3 Failed</p>
                            <div className="h-[2px] md:h-[3px] bg-red-500 w-full my-4 md:my-6"></div>
                            <p className="text-gray-300 text-sm md:text-lg">Level {initialLevel} compromised. {message}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 p-4 md:p-8 border-t border-red-500/20">
                            <button onClick={() => window.location.reload()} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase transition-all shadow-lg shadow-red-500/30">
                                REBOOT (RETRY)
                            </button>
                            <button onClick={() => navigate("/games")} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase transition-all">
                                ABORT MISSION
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EXPLANATION MODAL */}
            {showExplanation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
                    <div className="bg-[#020617] border border-red-500/40 rounded-3xl p-8 md:p-14 text-center shadow-[0_0_50px_rgba(239,68,68,0.5)] max-w-2xl w-full glitch-effect">
                        <XCircle className="text-red-500 mb-4 mx-auto w-10 h-10 md:w-12 md:h-12" />
                        <h2 className="text-lg md:text-2xl font-black text-red-400 mb-2 md:mb-3 tracking-wider">WRONG ANSWER</h2>
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
                        height: 95px !important; 
                        min-height: 95px !important; 
                        margin-bottom: 0 !important; 
                        padding: 4px 10px !important; 
                        border-radius: 1rem !important; 
                    }
                    .hr-avatar-container { width: 22px !important; height: 22px !important; border-width: 1px !important;}
                    .hr-avatar-badge { font-size: 6px !important; padding: 1px 4px !important; margin-top: 1px !important;}
                    .hr-zap { display: none !important; }
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

export default SingleLayout;