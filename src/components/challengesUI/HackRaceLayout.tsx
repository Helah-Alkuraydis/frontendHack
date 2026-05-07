import React from 'react';
import { Timer, Heart, Lightbulb, Zap, XCircle, Key } from "lucide-react";
import Swal from "sweetalert2";

// دالة مساعدة لتنسيق الكلاسات
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

interface HackRaceLayoutProps {
    scenario: any;
    currentQuestionIndex: number;
    totalQuestions: number;
    playerProgress: number;
    aiProgress: number;
    timeLeft: number;
    lives: number;
    initialLevel: number;
    points_pool: number;
    isAnswered: boolean;
    selectedOptionIndex: number | null;
    showExplanation: boolean;
    userData: any;
    gameResult: "win" | "loss" | null; // أضفنا هذه لدعم شاشات النهاية
    onAnswer: (index: number) => void;
    onReset: () => void; // للزر Reboot
    onNavigateGames: () => void; // للزر Abort
}

const HackRaceLayout: React.FC<HackRaceLayoutProps> = ({
    scenario, currentQuestionIndex, totalQuestions, playerProgress, aiProgress,
    timeLeft, lives, initialLevel, points_pool, isAnswered, selectedOptionIndex,
    showExplanation, userData, gameResult, onAnswer, onReset, onNavigateGames
}) => {

    const FINISH_POSITION = 95;

    return (
        <div className="flex flex-col items-center p-8 text-white w-full max-w-6xl mx-auto font-sans">

            {/* 1. HEADER (نفس الستايل الأصلي) */}
            <div className="flex items-center gap-8 bg-[#1c2438]/60 px-8 py-3 rounded-full border border-white/10 mb-10 backdrop-blur-md">
                <div className="flex items-center gap-2 text-amber-500 font-bold border-r border-white/10 pr-5 text-sm">
                        <Key size={14} fill="currentColor" /> <span>Points: {points_pool} XP</span>
                    </div>

                <div className="flex items-center gap-3">
                    <Timer size={18} className={timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-white"} />
                    <span className={cn("font-mono text-xl", timeLeft <= 10 ? "text-red-500 font-bold" : "text-white")}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                    </span>
                </div>

                <div
                    onClick={() => Swal.fire({
                        title: "AI Hint",
                        text: scenario.hint || scenario.explanation,
                        icon: "info"
                    })}
                    className="cursor-pointer text-yellow-400 hover:scale-110 transition-transform"
                >
                    <Lightbulb />
                </div>

                <div className="flex gap-2 border-l border-white/10 pl-6">
                    {[...Array(3)].map((_, i) => (
                        <Heart
                            key={i}
                            size={20}
                            fill={i < lives ? "#ef4444" : "none"}
                            color="#ef4444"
                            className={cn(i < lives && "animate-pulse")}
                        />
                    ))}
                </div>
            </div>

            {/* 2. RACE TRACK (نفس الستايل الأصلي مع اللاعب والهكر) */}
            <div className="relative w-full max-w-5xl h-40 bg-gradient-to-r from-emerald-950/30 to-black rounded-[2.5rem] border border-emerald-500/20 mb-10 p-6 overflow-hidden shadow-2xl">

                {/* Track Lines */}
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
                            <img
                                src={`/${userData?.characterStyle || "Women3.png"}`}
                                className="w-full h-full object-contain"
                                alt="You"
                            />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg border border-emerald-500 animate-bounce">
                            <Zap size={12} className="text-emerald-500 fill-emerald-500" />
                        </div>
                    </div>
                    <span className="text-xs font-black mt-2 text-white bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-500/30 uppercase">YOU</span>
                </div>

                {/* HACKER */}
                <div
                    className="absolute top-4 transition-all duration-700 flex flex-col items-center z-10 animate-[wiggle_0.6s_ease-in-out_infinite]"
                    style={{ left: `calc(${Math.min(aiProgress, FINISH_POSITION)}% - 40px)` }}
                >
                    <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center overflow-hidden">
                        <img src="/Hacker1.png" className="w-full h-full object-contain opacity-80" alt="Hacker" />
                    </div>
                    <span className="text-xs font-black mt-2 text-red-400 bg-black/70 px-3 py-1 rounded-full border border-red-500/20 uppercase">Hacker</span>
                </div>

                {/* FINISH LINE */}
                <div className="absolute right-4 top-0 bottom-0 w-10 flex flex-col border-l-4 border-emerald-400 animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.9)]">
                    <div className="grid grid-cols-2 flex-1">
                        <div className="bg-white"></div>
                        <div className="bg-black"></div>
                        <div className="bg-black"></div>
                        <div className="bg-white"></div>
                        <div className="bg-white"></div>
                        <div className="bg-black"></div>
                        <div className="bg-black"></div>
                        <div className="bg-white"></div>
                    </div>
                </div>


            </div>

            {/* 3. QUESTION CARD */}
            <div className="w-full max-w-5xl bg-[#1c2438]/70 p-10 rounded-3xl border border-emerald-500/10 shadow-2xl backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6 text-sm text-emerald-300 font-bold uppercase tracking-widest">
                    <span>Questions {currentQuestionIndex + 1} / {totalQuestions}</span>
                </div>

                <h2 className="text-2xl font-semibold mb-10 leading-relaxed">
                    {scenario?.question}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scenario?.options?.map((opt: any, idx: number) => {
                        const optionText = typeof opt === 'object' ? opt.text : opt;
                        const isCorrectOption = typeof opt === "object"
                            ? (opt.isCorrect ?? opt.text === scenario.correctAnswer)
                            : opt === scenario.correctAnswer;

                        let style = "p-6 rounded-2xl border transition-all text-left text-lg font-medium w-full ";

                        if (!isAnswered) {
                            style += "border-emerald-500/20 bg-[#0f172a] hover:bg-emerald-950/40 cursor-pointer";
                        } else {
                            if (isCorrectOption) style += "border-emerald-400 bg-emerald-900 animate-pulse text-white";
                            else if (idx === selectedOptionIndex) style += "border-red-400 bg-red-900 text-white";
                            else style += "border-gray-700 bg-gray-800 text-gray-400 opacity-50";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => onAnswer(idx)}
                                disabled={isAnswered}
                                className={style}
                            >
                                {optionText}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 4. SUCCESS OVERLAY */}
            {gameResult === "win" && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-[600] animate-in fade-in duration-300">
                    <div className="bg-[#020617] border border-emerald-500/30 rounded-3xl p-14 text-center shadow-[0_0_50px_rgba(16,185,129,0.4)] max-w-lg">
                        <h1 className="text-[22px] font-bold text-emerald-500 mb-3 tracking-tight uppercase">MISSION COMPLETE</h1>
                        <div className="text-7xl mb-6">🏁</div>
                        <p className="text-[14px] text-gray-300 mb-2 leading-relaxed">You outran the hacker and secured the race! bravo 🎉</p>
                        <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wide mb-6">Level {initialLevel} Cleared</p>
                        <div className="text-[22px] font-black text-emerald-400 mb-6">+{25 * initialLevel} XP</div>
                        <button onClick={onNavigateGames} className="px-8 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-white transition shadow-lg shadow-emerald-500/20">
                            PROCEED →
                        </button>
                    </div>
                </div>
            )}

            {/* 5. FAILURE OVERLAY */}
            {gameResult === "loss" && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[600] flex items-center justify-center p-4 animate-in zoom-in duration-300">
                    <div className="bg-[#0a0000] rounded-[2.5rem] max-w-xl w-full shadow-2xl border-8 border-red-500/40 overflow-hidden">
                        <div className="px-8 py-6 border-b border-red-500/20 text-center">
                            <h2 className="text-3xl font-black text-red-500 tracking-wider uppercase italic">SYSTEM OVERLOAD</h2>
                        </div>
                        <div className="px-10 py-10 text-center">
                            <div className="text-7xl mb-6">💀</div>
                            <p className="text-xl font-bold text-white mb-4">Challenge Failed</p>
                            <div className="h-[3px] bg-red-500 w-full my-6"></div>
                            <p className="text-gray-300 text-lg leading-relaxed">Level {initialLevel} compromised. The hacker was faster.</p>
                        </div>
                        <div className="flex gap-4 p-8 border-t border-red-500/20 bg-black/40">
                            <button onClick={onReset} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase transition-all shadow-lg shadow-red-900/20">REBOOT SYSTEM</button>
                            <button onClick={onNavigateGames} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-2xl font-black uppercase transition-all">ABORT MISSION</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. WRONG ANSWER EXPLANATION */}
            {showExplanation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[550] animate-in fade-in duration-200">
                    <div className="bg-[#020617] border border-red-500/40 rounded-3xl p-14 text-center shadow-[0_0_50px_rgba(239,68,68,0.5)] max-w-2xl glitch-effect">
                        <XCircle size={48} className="text-red-500 mb-4 mx-auto" />
                        <h2 className="text-2xl font-black text-red-400 mb-3 tracking-wider uppercase">WRONG ANSWER</h2>
                        <p className="text-lg leading-relaxed text-gray-300 font-medium italic">
                            {scenario.explanation}
                        </p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes wiggle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .glitch-effect {
                    animation: glitch 0.3s ease-in-out infinite alternate;
                }
                @keyframes glitch {
                    from { transform: translate(0); }
                    to { transform: translate(1px, 1px); }
                }
            `}</style>
        </div>
    );
};

export default HackRaceLayout;