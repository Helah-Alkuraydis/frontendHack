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
        <div className="flex flex-col items-center p-8 text-white">
            {/* HEADER */}
            <div className="flex items-center gap-8 bg-[#1c2438]/60 px-8 py-3 rounded-full border border-white/10 mb-10">
                <div className="flex items-center gap-2 text-yellow-500 font-bold border-r border-white/10 pr-6">
                    <Zap size={16} /> LEVEL {initialLevel}
                </div>
                <div className="flex items-center gap-3">
                    <Timer size={18} />
                    <span className="font-mono text-xl">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                    </span>
                </div>
                <div
                    onClick={() => Swal.fire({ title: "AI Hint", text: scenario.hint || scenario.explanation })}
                    className="cursor-pointer text-yellow-400"
                >
                    <Lightbulb />
                </div>
                <div className="flex gap-2 border-l border-white/10 pl-6">
                    {[...Array(3)].map((_, i) => (
                        <Heart key={i} size={20} fill={i < lives ? "#ef4444" : "none"} color="#ef4444" />
                    ))}
                </div>
            </div>

            {/* RACE TRACK */}
            <div className="relative w-full max-w-5xl h-40 bg-gradient-to-r from-emerald-950/30 to-black rounded-[2.5rem] border border-emerald-500/20 mb-10 p-6 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex flex-col justify-around px-10 opacity-20">
                    <div className="h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                    <div className="h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
                    <div className="h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                </div>

                {/* PLAYER */}
                <div
                    className="absolute top-4 transition-all duration-700 flex flex-col items-center z-20 animate-[wiggle_0.6s_ease-in-out_infinite]"
                    style={{ left: `calc(${Math.min(playerProgress, FINISH_POSITION)}% - 40px)` }}
                >
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center overflow-hidden">
                            <img src={`/${userData?.characterStyle || "Women3.png"}`} className="w-full h-full object-contain" alt="Player" />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg border border-emerald-500 animate-bounce">
                            <Zap size={12} className="text-emerald-500 fill-emerald-500" />
                        </div>
                    </div>
                    <span className="text-xs font-black mt-2 text-white bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-500/30">YOU</span>
                </div>

                {/* AI / Hacker */}
                <div
                    className="absolute top-4 transition-all duration-700 flex flex-col items-center animate-[wiggle_0.6s_ease-in-out_infinite]"
                    style={{ left: `calc(${Math.min(aiProgress, FINISH_POSITION)}% - 40px)` }}
                >
                    <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center overflow-hidden">
                        <img src="/Hacker1.png" className="w-full h-full object-contain" alt="Hacker" />
                    </div>
                    <span className="text-xs font-black mt-2 text-red-400 bg-black/70 px-3 py-1 rounded-full border border-red-500/20">Hacker</span>
                </div>

                {/* FINISH LINE */}
                <div className="absolute right-4 top-0 bottom-0 w-10 flex flex-col border-l-4 border-emerald-400 animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.9)]">
                    <div className="grid grid-cols-2 flex-1">
                        <div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-white"></div>
                        <div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-white"></div>
                    </div>
                </div>

                {isWarning && <div className="absolute inset-0 pointer-events-none z-50 animate-pulse border-4 border-red-600/50 shadow-[inside_0_0_50px_rgba(220,38,38,0.5)]"></div>}
                {aiProgress > 80 && <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none rounded-[2.5rem]"></div>}
            </div>

            {/* QUESTION CARD */}
            <div className="w-full max-w-5xl bg-[#1c2438]/70 p-10 rounded-3xl border border-emerald-500/10 shadow-2xl">
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
            </div>

            {/* WIN MODAL */}
            {gameResult === "win" && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-50">
                    <div className="bg-[#020617] border border-emerald-500/30 rounded-3xl p-14 text-center shadow-[0_0_50px_rgba(16,185,129,0.4)] max-w-lg">
                        <h1 className="text-[22px] font-bold text-emerald-500 mb-3 tracking-tight">MISSION COMPLETE</h1>
                        <div className="text-7xl mb-6">🏁</div>
                        <p className="text-[14px] text-gray-300 mb-2 leading-relaxed">You outran the hacker and won the Race! Bravo 🎉</p>
                        <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wide mb-6">Level {initialLevel} Cleared</p>
                        <div className="text-[22px] font-black text-emerald-400 mb-6">{`+${25 * initialLevel} XP`}</div>
                        <button onClick={() => navigate("/games")} className="px-6 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-white transition">
                            PROCEED →
                        </button>
                    </div>
                </div>
            )}

            {/* LOSS MODAL */}
            {gameResult === "loss" && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[500] flex items-center justify-center p-4">
                    <div className="bg-[#0a0000] rounded-[2.5rem] max-w-xl w-full shadow-2xl border-8 border-red-500/40 overflow-hidden">
                        <div className="px-8 py-6 border-b border-red-500/20 text-center">
                            <h2 className="text-3xl font-black text-red-500 tracking-wider uppercase">SYSTEM OVERLOAD</h2>
                        </div>
                        <div className="px-10 py-10 text-center">
                            <div className="text-7xl mb-6">💀</div>
                            <p className="text-xl font-bold text-white mb-4">Attempt 1 of 3 Failed</p>
                            <div className="h-[3px] bg-red-500 w-full my-6"></div>
                            <p className="text-gray-300 text-lg">Level {initialLevel} compromised. {message}</p>
                        </div>
                        <div className="flex gap-4 p-8 border-t border-red-500/20">
                            <button onClick={() => window.location.reload()} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase transition-all">
                                REBOOT SYSTEM (RETRY)
                            </button>
                            <button onClick={() => navigate("/games")} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-2xl font-black uppercase transition-all">
                                ABORT MISSION
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EXPLANATION MODAL */}
            {showExplanation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
                    <div className="bg-[#020617] border border-red-500/40 rounded-3xl p-14 text-center shadow-[0_0_50px_rgba(239,68,68,0.5)] max-w-2xl glitch-effect">
                        <XCircle size={48} className="text-red-500 mb-4 mx-auto" />
                        <h2 className="text-2xl font-black text-red-400 mb-3 tracking-wider">WRONG ANSWER</h2>
                        <p className="text-lg text-gray-300 leading-relaxed">{scenario.explanation}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleLayout;