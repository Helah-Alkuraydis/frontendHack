import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getSocket } from '../../socket';
import { useLocation } from 'react-router-dom';
import { BASE_URL } from '../../api/auth.js';

interface SecureCodingScenario {
    title: string;
    language: string;
    vulnerability_type: string;
    vulnerable_code: string;
    target_vulnerable_line: string;
    explanation: string;
    expected_fix_keywords: string[];
}

const SecureCodingChallenge = ({ level = 1, gameId, sessionId, onFinish, mode }: any) => {
    const socket = getSocket();
    const location = useLocation();
    const isHost = location.state?.isHost;
    const [user, setUser] = useState<any>(null);
    
    const [opponentProgress, setOpponentProgress] = useState<number>(0);
    const [winner, setWinner] = useState<string | null>(null);

    const [localLevel, setLocalLevel] = useState<number>(level);
    const [scenario, setScenario] = useState<SecureCodingScenario | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [phase, setPhase] = useState<1 | 2>(1);
    const [userCode, setUserCode] = useState<string>('');
    const [selectedLineIdx, setSelectedLineIdx] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
    
    const [score, setScore] = useState<number>(0);
    const [mistakes, setMistakes] = useState<number>(0);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [timeLeft, setTimeLeft] = useState<number>(180);
    const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
    const hasFetched = useRef(false);

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
    }, []);

    useEffect(() => {
        if (!hasFetched.current) {
            if (mode !== 'multiplayer') {
                hasFetched.current = true;
                fetchScenario();
            }
            else if (mode === 'multiplayer' && sessionId) {
                if (isHost || location.state?.isHost === undefined) { 
                    hasFetched.current = true;
                    fetchScenario().then((challengeData) => {
                        if (challengeData) {
                            socket.emit("start_secure_race", { 
                                sessionId, 
                                challengeData: challengeData 
                            });
                        }
                    });
                }
            }
        }

        if (mode === 'multiplayer' && sessionId) {
            socket.on("race_initiated", (data: any) => {
                if (data.challenge) {
                    setScenario(data.challenge);
                    setUserCode(data.challenge.vulnerable_code);
                    setLoading(false); 
                }
            });

            socket.on("opponent_race_progress", (data: any) => {
                if (data.userId !== user?._id) {
                    setOpponentProgress(data.progress);
                }
            });

            socket.on("race_finished", (data: any) => {
                setWinner(data.winnerName);
                if (data.winnerId !== user?._id) {
                    setFeedback({ message: `DEFEAT! ${data.winnerName} secured the system first! 🏁`, isError: true });
                    setPhase(1); 
                }
            });
        }

        return () => {
            socket.off("race_initiated");
            socket.off("opponent_race_progress");
            socket.off("race_finished");
        };
    }, [sessionId, isHost, localLevel, user?._id, mode]);

    useEffect(() => {
        if (loading || isTimeUp || winner) return;
        if (timeLeft <= 0) {
            setIsTimeUp(true);
            setFeedback({ message: "TIME IS UP! System Locked ⏳❌", isError: true });
            setTimeout(() => handleEndGame(), 3000);
            return;
        }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, loading, isTimeUp, winner]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const fetchScenario = async () => {
        setLoading(true);
        setFeedback(null);
        setPhase(1);
        setSelectedLineIdx(null);
        try {
            const response = await fetch(`${BASE_URL}/games/secure-coding/start?level=${localLevel}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await response.json();
            if (data.success) {
                setScenario(data.data);
                setUserCode(data.data.vulnerable_code || '');
                return data.data;
            }
        } catch (error) {
            setFeedback({ message: "Failed to load mission data.", isError: true });
        } finally {
            setLoading(false);
        }
        return null;
    };

    const handleLineClick = (lineText: string, idx: number) => {
        if (phase !== 1 || !scenario || winner) return;
        
        setSelectedLineIdx(idx);
        const cleanSelected = lineText.trim();
        const cleanTarget = scenario.target_vulnerable_line.trim();

        if (cleanSelected.includes(cleanTarget) || cleanTarget.includes(cleanSelected)) {
            setFeedback({ message: "Vulnerability identified! Now, fix the code.", isError: false });
            
            if (sessionId) {
                socket.emit("update_race_progress", { sessionId, userId: user?._id, progress: 50 });
            }

            setTimeout(() => {
                setPhase(2);
                setFeedback(null);
            }, 1000);
        } else {
            setMistakes(prev => prev + 1);
            setFeedback({ message: "Incorrect line. Look closer.", isError: true });
        }
    };

    const handleCodeSubmit = async (e?: any) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!scenario || winner) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/games/secure-coding/check`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    userCode: userCode,
                    expectedKeywords: scenario.expected_fix_keywords || []
                }),
            });
            
            const result = await response.json();

            if (result.success && result.isCorrect) {
                if (typeof sessionId !== 'undefined' && sessionId && sessionId.toString().startsWith('GG-')) {
                    socket.emit("submit_race_fix", { 
                        sessionId, 
                        userId: user?._id, 
                        username: user?.username 
                    });
                } else {
                    setWinner(user?.username || "Player");
                    setScore(prev => prev + (result.pointsEarned || 50));
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                }
            } else {
                setFeedback({ message: result.message || "Incorrect patch! Try again.", isError: true });
                setMistakes(prev => prev + 1);
            }
        } catch (error) {
            setFeedback({ message: "Backend connection error.", isError: true });
        }
    };

    const handleEndGame = () => {
        if (onFinish) {
            onFinish({
                score: score,
                status: (winner === user?.username || !sessionId) ? 'Win' : 'Loss',
                duration: Math.floor((Date.now() - startTime) / 1000),
                mistakesCount: mistakes
            });
        }
    };

    const handleQuit = () => onFinish?.({ status: 'QUIT' });

    if (loading) return <div className="min-h-screen bg-[#0b1121] text-[#00ff9d] flex items-center justify-center font-mono">INITIALIZING MISSION...</div>;

    return (
        <div className="min-h-screen bg-[#0b1121] text-slate-300 p-4 md:p-8 font-mono relative overflow-hidden">
            
            {sessionId && !winner && opponentProgress > 0 && (
                <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-900 z-50">
                    <div 
                        className="h-full bg-[#ff3b6b] shadow-[0_0_15px_#ff3b6b] transition-all duration-700"
                        style={{ width: `${opponentProgress}%` }}
                    ></div>
                </div>
            )}

            <header className="mb-6 md:mb-8 border-b border-slate-800 pb-4 flex flex-col gap-3">
                <button onClick={handleQuit} className="text-slate-500 hover:text-red-500 flex items-center gap-2 w-fit transition-colors font-bold text-xs md:text-base">
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /> ABORT MISSION
                </button>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                    <div>
                        <h1 className="text-lg md:text-2xl font-black italic text-[#00ff9d] tracking-tighter uppercase flex flex-wrap items-center gap-3 md:gap-4">
                            SECURE CODING {sessionId ? "RACE" : "CHALLENGE"}
                            <span className={`text-sm md:text-xl font-mono px-2 md:px-3 py-1 rounded border-2 shadow-lg ${timeLeft <= 60 ? 'text-red-500 border-red-500/50 animate-pulse' : 'text-cyan-400 border-cyan-500/30'}`}>
                                ⏱️ {formatTime(timeLeft)}
                            </span>
                        </h1>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-start">
                <div className="space-y-4 md:space-y-6">
                    <div className="bg-[#1e293b] rounded-2xl border border-white/5 p-4 md:p-6 shadow-lg">
                        <h2 className="text-[#00ff9d] font-bold tracking-widest uppercase mb-2 md:mb-4 text-[10px] md:text-xs">CHALLENGE: {scenario?.title}</h2>
                        <p className="text-xs md:text-sm text-slate-400 leading-relaxed">{scenario?.explanation}</p>
                    </div>

                    <div className={`bg-[#1e293b] rounded-2xl border p-4 md:p-6 shadow-lg transition-all ${phase === 1 ? 'border-[#00ff9d]/30' : 'opacity-40'}`}>
                        <h2 className="text-white font-bold tracking-widest uppercase mb-2 md:mb-4 text-[10px] md:text-xs">PHASE 1: IDENTIFY VULNERABILITY</h2>
                        <div className="bg-[#0d1117] rounded-xl border border-white/5 p-3 md:p-4 overflow-x-auto text-xs md:text-sm custom-scrollbar">
                            {scenario?.vulnerable_code.split('\n').map((line, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleLineClick(line, idx)}
                                    className={`flex cursor-pointer py-1 rounded px-2 ${phase !== 1 || winner ? 'pointer-events-none' : 'hover:bg-white/5'} ${selectedLineIdx === idx ? (feedback?.isError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400') : ''}`}
                                >
                                    <span className="w-6 md:w-8 text-right pr-2 md:pr-4 text-slate-600 select-none">{idx + 1}</span>
                                    <code className="whitespace-pre">{line || ' '}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e293b] rounded-2xl border border-white/5 p-4 md:p-6 shadow-lg flex flex-col min-h-[300px] md:min-h-[400px]">
                    <h2 className="text-white font-bold tracking-widest uppercase mb-2 md:mb-4 text-[10px] md:text-xs">PHASE 2: SECURE TERMINAL</h2>
                    {phase === 1 ? (
                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-slate-600 italic text-xs md:text-sm text-center p-4">
                            Identify the vulnerability in Phase 1<br/>to unlock the patch terminal...
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col h-full">
                            <textarea 
                                className="flex-1 w-full min-h-[150px] md:min-h-[250px] bg-[#0d1117] text-cyan-400 font-mono text-xs md:text-sm resize-none focus:outline-none p-3 md:p-4 rounded-xl border border-white/10 custom-scrollbar"
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value)}
                                spellCheck="false"
                                disabled={!!winner}
                            />
                            
                            {feedback && (
                                <div className={`mt-3 md:mt-4 p-3 md:p-4 rounded-xl flex flex-col gap-3 font-bold transition-all duration-300 text-xs md:text-base ${
                                    feedback.isError 
                                    ? 'bg-red-500/20 border border-red-500 text-red-400 animate-pulse' 
                                    : 'bg-green-500/20 border border-green-500 text-green-400'
                                }`}>
                                    <div className="flex items-start gap-2 md:gap-3 w-full">
                                        {feedback.isError ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                                        <span className="leading-relaxed">{feedback.message}</span>
                                    </div>
                                    
                                    {feedback.isError && mistakes > 2 && (
                                        <div className="flex justify-end w-full border-t border-red-500/20 pt-2 mt-1">
                                            <span className="text-[10px] md:text-xs bg-red-900/90 px-3 py-1.5 rounded-full text-red-100 whitespace-nowrap shadow-lg">
                                                Hint: Use data sanitization!
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button 
                                onClick={handleCodeSubmit}
                                disabled={!!winner}
                                className="mt-3 md:mt-4 w-full py-3 md:py-4 bg-[#00ff9d] hover:bg-[#00e68e] text-black font-black uppercase italic rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm md:text-base"
                            >
                                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 inline-block mr-2" /> SUBMIT SECURE PATCH
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {winner && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="text-center p-8 md:p-12 bg-[#0f172a] border border-white/10 rounded-[2rem] md:rounded-[3rem] shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
                        <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full flex items-center justify-center ${winner === user?.username || !sessionId ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {winner === user?.username || !sessionId ? <Zap size={32} className="md:w-10 md:h-10" fill="currentColor"/> : <AlertTriangle size={32} className="md:w-10 md:h-10"/>}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black italic uppercase text-white mb-2">
                            {winner === user?.username || !sessionId ? "Victory!" : "Defeat!"}
                        </h2>
                        <p className="text-sm md:text-base text-slate-400 mb-6 md:mb-8 font-medium italic">
                            {winner === user?.username || !sessionId ? "System secured! Mission Accomplished." : `${winner} was faster.`}
                        </p>
                        <button 
                            onClick={handleEndGame} 
                            className="w-full py-3 md:py-4 bg-white text-black font-black text-sm md:text-base uppercase rounded-xl md:rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                        >
                            RETURN TO HQ
                        </button>
                    </div>
                </div>
            )}
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 255, 157, 0.2); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 157, 0.4); }
            `}</style>
        </div>
    );
};

export default SecureCodingChallenge;