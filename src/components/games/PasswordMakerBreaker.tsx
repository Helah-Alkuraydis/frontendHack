import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    Shield, ShieldCheck, ShieldAlert, Timer, Heart,
    Key, Loader2, ChevronRight, Lock,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { socket } from '../../socket'; // تأكدي من مسار ملف socket.js
import { BASE_URL } from '../../api/auth.js';

interface PasswordProps {
    gameId: string;
    sessionId: string;
    initialLevel: number;
    userData: any;
    navigate: any;
    mode?: string;
    initialRole?: 'maker' | 'breaker';
    onFinish: (results: any) => void;
}

const PasswordMakerBreaker: React.FC<PasswordProps> = ({ gameId, sessionId, initialLevel, userData, onFinish, mode, initialRole }) => {
    const [gameMode, setGameMode] = useState<'choice' | 'maker' | 'breaker'>(initialRole || 'choice');
    const [timeLeft, setTimeLeft] = useState(180);
    const [lives, setLives] = useState(3);
    const [loading, setLoading] = useState(false);
    const [displayedText, setDisplayedText] = useState("");
    const [tourStep, setTourStep] = useState(0);
    const [showTour, setShowTour] = useState(false);
    const navigate = useNavigate();

    //multi 
    const [isWaitingForMaker, setIsWaitingForMaker] = useState(mode === 'multiplayer' && initialRole === 'breaker');

    // Maker State
    const [password, setPassword] = useState('');
    const [strength, setStrength] = useState(0);
    const [isAlertActive, setIsAlertActive] = useState(false);
    const [isVulnerable, setIsVulnerable] = useState(true);
    const [aiRecommendation, setAiRecommendation] = useState<string>('');
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
    const [gameStatus, setGameStatus] = useState<'Win' | 'Loss' | null>(null);

    // Breaker State
    const [breakerData, setBreakerData] = useState<any>(null);
    const [challengeId, setChallengeId] = useState<string | null>(null);
    const [displayedHint, setDisplayedHint] = useState("");
    const [displayedAnalysis, setDisplayedAnalysis] = useState("");
    const [analysis, setAnalysis] = useState('');
    const [targetAlias, setTargetAlias] = useState('');
    const [metadataLeak, setMetadataLeak] = useState('');
    const [breakerInput, setBreakerInput] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isAnswered, setIsAnswered] = useState(false);
    const [correctAnswerFromServer, setCorrectAnswerFromServer] = useState<string | null>(null);

    const [currentStage, setCurrentStage] = useState(1); // من 1 إلى 3
    const [excludedIds, setExcludedIds] = useState<string[]>([]); // لتخزين معرفات الألغاز اللي حلها

    // 1. تعريف الأصوات (تأكدي من وضع ملفات mp3 في مجلد public/sounds)
    const audioRef = React.useRef(new Audio('/sounds/type.mp3')); const playSuccessSound = () => new Audio('/sounds/success.mp3').play(); const playErrorSound = () => new Audio('/sounds/alarm.mp3').play();

    const tourContent = {
        maker: [
            { title: "Security Protocols", desc: "These are your core defense requirements. Ensure every shield turns green to verify your fortress is impenetrable." },
            { title: "Sequence Input", desc: "Deploy your security sequence here. Remember: High entropy through mixed characters is your strongest weapon." },
            { title: "AI Analysis", desc: "Astra AI is monitoring. She analyzes behavioral patterns, not just rules—don't let her find a logical vulnerability!" }
        ],
        breaker: [
            { title: "Target Dossier", desc: "This is the leaked intelligence file. Analyze birth years, locations, and personal assets for potential password fragments." },
            { title: "Field Agent Hint", desc: "Our operative has intercepted a cryptic clue. It bridges the gap between the target's identity and their private key." },
            { title: "Breach Stages", desc: "You must compromise 3 consecutive security nodes to achieve a full system override. Stay focused." }
        ]


    };

    useEffect(() => {
        if (gameMode !== 'choice') {
            const hasSeenTour = localStorage.getItem(`hasSeenTour_${gameMode}`);
            if (!hasSeenTour) {
                setTourStep(0);
                setShowTour(true);
            }
        }
    }, [gameMode]);

    useEffect(() => {
        if (initialRole === 'breaker') {
            setGameMode('breaker');
            // في السنقل بلاير نجيب اللغز من الداتابيز، في الملتي بلاير ننتظر السوكيت!
            if (mode !== 'multiplayer') {
                // initBreaker();
                setIsWaitingForMaker(true);
            }
            else {
                initBreaker();
            }
        } else if (initialRole === 'maker') {
            setGameMode('maker');
            setIsWaitingForMaker(false);
        }
    }, [initialRole, mode]);

    useEffect(() => {
        if (mode !== 'multiplayer' || gameMode !== 'breaker') return;

        socket.on("receive_password", (data) => {
            console.log("🔥 Password received from Maker:", data.password);

            setIsWaitingForMaker(false); // نلغي شاشة الانتظار
            setCorrectAnswerFromServer(data.password); // نحفظ الكلمة للمقارنة لاحقاً

            // نجهز بيانات وهمية تناسب التحدي المباشر بدل الداتابيز
            setBreakerData({
                userData: { name: "The_Maker", birthYear: "CLASSIFIED", city: "Sector_7", pet: "Unknown" },
            });
            setDisplayedHint("Intercepted real-time sequence. The Maker just deployed a custom password.");
            setDisplayedAnalysis("No database logs. You must rely on brute force and intuition.");

            Swal.fire({
                title: "TRANSMISSION RECEIVED",
                text: "The Maker has deployed the password. Start cracking!",
                icon: "warning",
                background: "#0a0000",
                color: "#ef4444"
            });
        });

        return () => {
            socket.off("receive_password");
        };
    }, [mode, gameMode]);


    const handleKeyPress = () => {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
        });
    };
    
    // --- Real-time Strength Check (Frontend Only for UI) ---
    useEffect(() => {
        if (!sessionId) {
            navigate('/games');
        }
    }, [sessionId, navigate]);

    useEffect(() => {
        let s = 0;
        if (password.length >= 10) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[a-z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        setStrength(s);
    }, [password]);

    const handleReset = () => {
        setPassword('');
        setBreakerInput('');
        setStrength(0);
        setIsVulnerable(true);
    };

    useEffect(() => {
        let timer: any;
        if (timeLeft > 0 && lives > 0 && gameMode !== 'choice' && !showTour) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }

        if (timeLeft === 0) {
            handleFinishGame('Loss');
            Swal.fire({
                title: 'TIME EXPIRED',
                text: 'The system has been compromised due to time out!',
                icon: 'error',
                background: '#0a0000',
                color: '#ef4444'
            }).then(() => navigate('/games'));
        }

        if (lives == 0) {
            handleFinishGame('Loss');
        }

        return () => clearInterval(timer);
    }, [timeLeft, lives, gameMode, navigate, showTour]);

    // --- Logic for Maker Mode Submission ---

    useEffect(() => {
        if (!isAiAnalyzing && aiRecommendation) {
            setDisplayedText("");
            let i = 0;
            const cleanTarget = aiRecommendation.trim();
            const typingInterval = setInterval(() => {
                if (i < cleanTarget.length) {
                    setDisplayedText(cleanTarget.substring(0, i + 1));
                    i++;
                } else {
                    clearInterval(typingInterval);
                    if (gameStatus) {
                        console.log("Typing finished for:", gameStatus); setTimeout(() => {
                            // handleFinishGame(gameStatus);
                            setGameStatus(null);
                        }, 1000);
                    }
                }
            }, 70);
            return () => clearInterval(typingInterval);
        }
    }, [aiRecommendation, isAiAnalyzing]);

    const handleMakerSubmit = async () => {
        setIsAlertActive(false);

        setIsAiAnalyzing(true);
        setAiRecommendation("System checking protocols...");
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${BASE_URL}/games/password/evaluate`, {
                password, gameId, duration: 180 - timeLeft, level: initialLevel
            }, { headers: { Authorization: `Bearer ${token}` } });

            const { status, aiRecommendation, strengthScore } = res.data;

            setAiRecommendation(aiRecommendation);
            setGameStatus(status);

            setTimeout(() => {
                setLoading(false);
                setIsAiAnalyzing(false);


                if (status === 'Win') {
                    // handleFinishGame('Win');
                    // setGameStatus(status);

                    if (mode === 'multiplayer') {
                        socket.emit("send_password", {
                            sessionId: sessionId,
                            password: password
                        });
                    }
                } else if (status === 'Loss') {
                    playErrorSound();
                    setLives(prev => {
                        const newLives = prev - 1;
                        if (newLives <= 0) {
                            handleFinishGame('Loss');
                            navigate('/games');
                        }
                        return newLives;
                    });
                    setIsAlertActive(true);
                    setTimeout(() => setIsAlertActive(false), 500);
                    setPassword(''); // تصفير الحقل في حال الخسارة ليعيد المحاولة
                }
                // إذا كانت الحالة Win أو In-Progress لا نصفر الباسوورد ليرى اللاعب نجاحه
            }, 1500);
        } catch (e) {
            setLoading(false);
            setIsAiAnalyzing(false);
            setAiRecommendation("CRITICAL_ERROR: AI_NEURAL_LINK_SEVERED.");
        }

    };

    useEffect(() => {
        const isDoneTyping = displayedText.trim() === aiRecommendation.trim();

        if (!isAiAnalyzing &&
            aiRecommendation &&
            isDoneTyping &&
            gameStatus) {
            console.log("Typing finished, triggering Swal for:", gameStatus);
            const timer = setTimeout(() => {
                // handleFinishGame("Win");
                setGameStatus(null);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [displayedText, aiRecommendation, isAiAnalyzing, gameStatus]);


    // --- Logic for Breaker Mode Initializer ---

    // دالة مساعدة لتأثير الكتابة
    const typeEffect = (fullText: string, setter: (val: string) => void) => {
        setter(""); // تصفير النص
        let i = 0;
        const interval = setInterval(() => {
            if (i < fullText.length) {
                setter(fullText.substring(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 30);
        return interval;
    };

    const initBreaker = async (exclude: string[] = []) => {
        console.log("Current Game ID:", gameId);
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
            const token = localStorage.getItem('token');
            const isTechnical = userData?.isTechnical || false;
            const res = await axios.post(`${BASE_URL}/games/password/init-breaker`, {
                gameId,
                level: initialLevel,
                isTechnical,
                excludeIds: exclude
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.success) {
                const { data, challengeId } = res.data;
                setBreakerData(data);
                setChallengeId(challengeId);
                setAnalysis(data.analysis_report);
                setTargetAlias(data.target_alias);
                setMetadataLeak(data.metadata_leak);

                typeEffect(data.hint, setDisplayedHint);
                typeEffect(data.analysis_report, setDisplayedAnalysis);

                setGameMode('breaker');
            }
        } catch (e) {
            Swal.fire("Error", "Could not fetch intelligence data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleBreakerGuess = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isChecking || !breakerInput.trim()) return;

        setIsChecking(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${BASE_URL}/games/password/verify-breaker`, {
                challengeId, // هذا من الـ state الحالي
                userGuess: breakerInput,
                gameId,
                duration: 300 - timeLeft
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.success) {
                const currentId = challengeId as string;
                const newExcludedIds = [...excludedIds, currentId];
                setExcludedIds(newExcludedIds);

                if (currentStage < 3) {
                    setCurrentStage(prev => prev + 1);
                    setBreakerInput("");
                    initBreaker(newExcludedIds);
                } else {
                    playSuccessSound();
                    const duration = 5 * 1000;
                    const animationEnd = Date.now() + duration;
                    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

                    const interval: any = setInterval(function () {
                        const timeLeft = animationEnd - Date.now();

                        if (timeLeft <= 0) {
                            return clearInterval(interval);
                        }

                        const particleCount = 50 * (timeLeft / duration);
                        // إطلاق من اليمين ومن اليسار
                        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                    }, 250);
                    handleFinishGame('Win');
                    navigate('/games');
                }

            } else {
                playErrorSound();
                const newLives = lives - 1;
                setLives(newLives);
                setIsAlertActive(true);

                if (newLives <= 0) {
                    setCurrentStage(1);
                    setExcludedIds([]);
                    handleFinishGame('Loss');
                    navigate('/games');
                } else {
                    setIsAlertActive(true);

                    setTimeout(() => setIsAlertActive(false), 500);
                    setBreakerInput("");
                }
            }
        } catch (err) {
            console.error("Verification failed", err);
        } finally {
            setIsChecking(false);
        }
    };

    const handleFinishGame = async (status: 'Win' | 'Loss') => {
        const token = localStorage.getItem('token');
        const winXP = 25 * initialLevel;

        const gameResults = {
            status: status,
            score: status === 'Win' ? winXP : 0,
            duration: 180 - timeLeft,
            mistakesCount: 3 - lives
        };

        const isBreaker = gameMode === 'breaker';
        let swalContent = {
            title: '',
            html: '',
            confirmButtonText: '',
            color: status === 'Win' ? '#10b981' : '#ef4444'
        };

        if (status === 'Win') {
            const isWeekly = mode === 'weekly';
            if (isBreaker) {
                swalContent.title = isWeekly ? '[CHALLENGE_NODE_BREACHED]' : '[ACCESS_GRANTED]';
                swalContent.html = `
        <div style="background: #000a05; padding: 25px; border: 2px solid #10b981; color: #fff; font-family: monospace; text-align: left;">
            <div style="text-align: center; margin-bottom: 15px;">
                <span style="background: #10b981; color: #000; padding: 2px 10px; font-weight: bold; font-size: 10px;">
                    ${isWeekly ? 'WEEKLY PROGRESS REGISTERED' : 'SYSTEM OVERRIDE SUCCESSFUL'}
                </span>
            </div>
            <p style="background: rgba(16, 185, 129, 0.1); padding: 10px; border-left: 4px solid #10b981; font-size: 12px;">
                <strong>DECRYPTION_LOG:</strong> Target node breached. Weekly mission objective updated.
            </p>
            <div style="margin-top: 20px; font-size: 11px; color: #aaa;">
                <p>> Status: <span style="color: #10b981;">Ghost Protocol Active</span></p>
                <p>> Result: <span style="color: #3b82f6;">${isWeekly ? 'Weekly Progress +1' : `+${winXP} XP`}</span></p>
            </div>
        </div>`;
            } else {
                // ✅ فوز الميكر (المدافع) - بناء كلمة سر قوية
                const isWeekly = mode === 'weekly';

                swalContent.title = isWeekly
                    ? '<span style="color: #3b82f6; font-family: monospace; font-weight: bold;">[CHALLENGE_STABILIZED]</span>'
                    : '<span style="color: #10b981; font-family: monospace; font-weight: bold;">[DEFENSE_STABILIZED]</span>';

                swalContent.confirmButtonText = isWeekly ? 'SECURE PROGRESS & EXIT' : 'PROCEED TO NEXT NODE';
                swalContent.color = isWeekly ? '#3b82f6' : '#10b981'; // تغيير لون الزر للأزرق في التحدي

                swalContent.html = `
    <div style="background: #000a05; padding: 25px; border: 2px solid ${isWeekly ? '#3b82f6' : '#10b981'}; color: #fff; font-family: monospace; text-align: left;">
        <div style="text-align: center; margin-bottom: 15px;">
            <span style="background: ${isWeekly ? '#3b82f6' : '#10b981'}; color: #000; padding: 2px 10px; font-weight: bold; font-size: 10px;">
                ${isWeekly ? 'WEEKLY OBJECTIVE SECURED' : 'SHIELD PROTOCOL ACTIVE'}
            </span>
        </div>
        <p style="background: rgba(${isWeekly ? '59, 130, 246' : '16, 185, 129'}, 0.1); padding: 10px; border-left: 4px solid ${isWeekly ? '#3b82f6' : '#10b981'}; font-size: 12px; line-height: 1.4;">
            <strong>SECURITY_LOG:</strong> Brute-force attempt repelled. Password entropy held firm. ${isWeekly ? 'Weekly mission progress logged.' : 'Attacker has disconnected.'}
        </p>
        <div style="margin-top: 20px; font-size: 11px; color: #aaa;">
            <p>> Status: <span style="color: #10b981;">Fortress Secured</span></p>
            <p>> Result: <span style="color: #3b82f6; font-weight: bold;">${isWeekly ? 'Weekly Progress +1' : `+${winXP} XP`}</span></p>
        </div>
        <div style="margin-top: 15px; font-size: 10px; color: #555; text-align: center; border-top: 1px dashed ${isWeekly ? '#3b82f6' : '#10b981'}44; padding-top: 10px;">
            DEPLOYED_SEQUENCE: [ ${password.toUpperCase()} ]
        </div>
    </div>`;
            }
        } else if (status === 'Loss') {
            // ❌ حالات الخسارة (Loss)
            if (isBreaker) {
                swalContent.title = '<span style="color: #ef4444; font-family: monospace; font-weight: bold;">[CONNECTION_LOST]</span>';
                swalContent.confirmButtonText = 'REBOOT SYSTEM';
                swalContent.html = `
                <div style="background: #0a0000; padding: 25px; border: 2px solid #ef4444; color: #fff; font-family: monospace; text-align: left;">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <span style="background: #ef4444; color: #000; padding: 2px 10px; font-weight: bold; font-size: 10px;">TRACE_DETECTED</span>
                    </div>
                    <p style="background: rgba(239, 68, 68, 0.1); padding: 10px; border-left: 4px solid #ef4444; font-size: 12px; line-height: 1.4;">
                        <strong>ERROR_LOG:</strong> Your digital signature was correlated. Intelligence assets compromised. Retreat immediately.
                    </p>
                    <div style="margin-top: 20px; font-size: 11px; color: #aaa; text-align: center;">
                        <p style="color: #ef4444;">STRIKES_EXHAUSTED: 3/3</p>
                    </div>
                </div>`;
            } else {
                swalContent.title = '<span style="color: #ef4444; font-family: monospace; font-weight: bold;">[BREACH_CONFIRMED]</span>';
                swalContent.confirmButtonText = 'WIPE SYSTEM & RETRY';
                swalContent.html = `
                <div style="background: #0a0000; padding: 25px; border: 2px solid #ef4444; color: #fff; font-family: monospace; text-align: left;">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <span style="background: #ef4444; color: #000; padding: 2px 10px; font-weight: bold; font-size: 10px;">SHIELD_COLLAPSED</span>
                    </div>
                    <p style="background: rgba(239, 68, 68, 0.1); padding: 10px; border-left: 4px solid #ef4444; font-size: 12px; line-height: 1.4;">
                        <strong>FATAL_ERROR:</strong> Attacker found a pattern in your sequence. Internal servers are being encrypted.
                    </p>
                    <div style="margin-top: 20px; font-size: 11px; color: #aaa; text-align: center;">
                        <p style="color: #ef4444;">CRITICAL_FAILURE: DATA_LEAKED</p>
                    </div>
                </div>`;
            }
        }
        try {
            // await axios.post('http://localhost:5000/api/games/submit', {
            //     sessionId, score: status === 'Win' ? winXP : 0, status,
            //     duration: 180 - timeLeft, mistakesCount: 3 - lives
            // }, { headers: { Authorization: `Bearer ${token}` } });

            // if (status === 'Win') {
            //     await axios.post('http://localhost:5000/api/games/level/up', { gameId, status: 'Win', score: winXP }, { headers: { Authorization: `Bearer ${token}` } });
            // }

            Swal.fire({
                title: swalContent.title,
                html: swalContent.html,
                background: '#050810',
                confirmButtonText: swalContent.confirmButtonText,
                confirmButtonColor: swalContent.color,
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    onFinish(gameResults); // إرسال النتائج للـ Parent
                    // إذا كان الـ onFinish لا ينقلك تلقائياً، أضيفي السطر التالي:
                    // navigate('/games'); 
                }
            });
        } catch (e) { navigate('/games'); }
    };


    return (

        <div className={`flex flex-1 flex-col h-full p-6 z-10 text-white transition-all duration-300 ${isAlertActive ? 'animate-glitch bg-red-900/10' : ''}`}>            {/* Header Stats */}

            {loading && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050810]/20 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative">
                        {/* الدائرة الدوارة */}
                        <div className="w-24 h-24 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                        {/* أيقونة في المنتصف */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ShieldCheck size={32} className="text-emerald-500 animate-pulse" />
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-2">
                        <span className="text-emerald-500 font-mono text-[10px] tracking-[0.5em] uppercase animate-pulse">
                            Establishing Neural Link
                        </span>
                        <div className="h-1 w-48 bg-emerald-500/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 animate-progress-fast shadow-[0_0_10px_#10b981]" />
                        </div>
                        <span className="text-white/30 font-mono text-[8px] mt-2 italic uppercase">
                            {Math.random() > 0.5 ? "Decrypting Target Metadata..." : "Bypassing Firewall Layers..."}
                        </span>
                    </div>
                </div>
            )}

            {/* 🛰️ Spotlight Tour System */}
            {showTour && (
                <>
                    <div className="tour-overlay" />
                    <div
                        className={`fixed inset-x-0 z-[160] flex justify-center px-6 pointer-events-none transition-all duration-700 ease-in-out ${tourStep === 2 ? 'top-10' : 'bottom-10' // ذكاء بسيط لتبديل مكانه
                            }`}
                    >
                        <div className={` max-w-xs max-h-full p-6 rounded-[2.5rem] border-2 shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-500 ${gameMode === 'maker' ? 'border-emerald-500 bg-[#181a18]' : 'border-red-500 bg-[#181a18]'
                            }`}>

                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-[10px] font-mono tracking-[0.4em] uppercase ${gameMode === 'maker' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    Mission Intelligence / Node {tourStep + 1}
                                </span>
                                <button onClick={() => {
                                    setShowTour(false)
                                    localStorage.setItem(`hasSeenTour_${gameMode}`, 'true');
                                }} className="bg-[#3f3f3f] text-white/60 hover:text-white text-[10px] font-bold uppercase">Skip</button>
                            </div>

                            <h2 className="text-xl font-black italic mb-3 uppercase tracking-tighter text-white">
                                {tourContent[gameMode as 'maker' | 'breaker'][tourStep].title}
                            </h2>

                            <p className="text-gray-300 font-mono text-sm leading-relaxed mb-8 border-l-2 border-white/10 pl-5 py-2">
                                {tourContent[gameMode as 'maker' | 'breaker'][tourStep].desc}
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        if (tourStep < 2) setTourStep(prev => prev + 1);
                                        else {
                                            setShowTour(false);
                                            localStorage.setItem(`hasSeenTour_${gameMode}`, 'true');
                                        }
                                    }}
                                    className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 ${gameMode === 'maker' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                        }`}
                                >
                                    {tourStep < 2 ? "NEXT" : "INITIALIZE MISSION"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

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

            {/* Mode Selection */}

            {/* {gameMode === 'choice' && (
                <div className="flex flex-col items-center justify-center flex-1 gap-8 animate-in fade-in zoom-in duration-500">
                    <h2 className="text-4xl font-black italic tracking-tighter text-center">SELECT YOUR PATH</h2>
                    <div className="flex gap-6">

                        {/* 🟢 MAKER BUTTON (تم تحويله للأخضر Emerald) */}
            {/* <button
                            onClick={() => setGameMode('maker')}
                            className="group p-8 rounded-[2rem] bg-gradient-to-b from-emerald-600/20 to-emerald-900/40 border border-emerald-500/30 hover:border-emerald-500 hover:scale-105 transition-all w-64 flex flex-col items-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                        >
                            <ShieldCheck size={60} className="text-emerald-400 group-hover:animate-bounce" />
                            <span className="font-black text-xl text-white">MAKER</span>
                            <p className="text-[10px] text-emerald-200/50 text-center uppercase tracking-widest">Build an unbreakable fortress</p>
                        </button> */}

            {/* 🔴 BREAKER BUTTON (تم تحويله للأحمر Red) */}
            {/* <button
                            onClick={() => initBreaker()}
                            className="group p-8 rounded-[2rem] bg-gradient-to-b from-red-600/20 to-red-900/40 border border-red-500/30 hover:border-red-500 hover:scale-105 transition-all w-64 flex flex-col items-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.05)]"
                        >
                            <Lock size={60} className="text-red-500 group-hover:animate-pulse" />
                            <span className="font-black text-xl text-white">BREAKER</span>
                            <p className="text-[10px] text-red-200/50 text-center uppercase tracking-widest">Think like a hacker</p>
                        </button>

                    </div>
                </div>
            )} 


            {/* Maker Mode UI */}
            {gameMode === 'maker' && (

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


                    {/* 🟢 القسم السفلي: شبكة العمل (معايير الحماية + الإدخال) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start ">

                        {/* الشاشة اليسرى: معايير النظام (Security Protocols) */}
                        <div className={`security-rules-list ... ${showTour && tourStep === 0 ?
                            'highlight-target highlight-maker' : ''} ${showTour && tourStep === 0 ?
                                'highlight-target highlight-maker' : ''}  ${showTour && tourStep > 0 ?
                                    'opacity-20 pointer-events-none' : ''}`}>
                            <div className="Security Protocols md:col-span-1 ">
                                <h3 className="text-emerald-500 text-[10px] font-black mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Shield size={14} className="animate-pulse" /> Security_Protocols
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        { label: "MIN_LENGTH_10", met: password.length >= 10 },
                                        { label: "UPPERCASE_CHAR", met: /[A-Z]/.test(password) },
                                        { label: "LOWERCASE_CHAR", met: /[a-z]/.test(password) },
                                        { label: "NUMERIC_DIGIT", met: /[0-9]/.test(password) },
                                        { label: "SPECIAL_SYMBOL", met: /[^A-Za-z0-9]/.test(password) },
                                    ].map((rule, idx) => (
                                        <li key={idx} className={`flex items-center justify-between px-4 py-3 rounded-xl  transition-all duration-500 ${rule.met ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' : 'border-white/5 text-gray-600'}`}>
                                            <span className="text-[10px] font-bold">{rule.label}</span>
                                            {rule.met ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* الشاشة اليمنى: لوحة الأوامر الرئيسية (الإدخال والزر) */}
                        <div className={`password-input-field md:col-span-2 ${showTour && tourStep === 1 ? 'highlight-target' : ''}`}>
                            <div className="Sequence Input md:col-span-2 flex flex-col gap-6">
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
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (strength >= 5) setIsVulnerable(false);
                                                else setIsVulnerable(true);
                                            }}
                                            className="w-full bg-transparent border-none pl-6 pr-12 text-2xl text-emerald-400 placeholder:text-emerald-900/30 focus:ring-0 font-mono tracking-widest outline-none focus:outline-none"
                                            placeholder="ENTER_PASS_SEQUENCE_"
                                            autoFocus
                                        />
                                        <button
                                            disabled={loading || password.length < 6}
                                            onClick={handleMakerSubmit}
                                            className="ml-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all disabled:cursor-not-allowed"
                                            title="Press Enter to Deploy"
                                        >
                                            {loading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} />}
                                        </button>
                                    </div>

                                    {/* بار القوة التفاعلي العريض */}
                                    <div className="flex gap-2 h-1.5 px-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`flex-1 rounded-full transition-all duration-1000 ${i < strength ? (strength <= 2 ? 'bg-red-600 shadow-[0_0_15px_#ef4444]' : strength <= 4 ? 'bg-amber-500 shadow-[0_0_15px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]') : 'bg-white/5'}`} />
                                        ))}
                                    </div>

                                    {/* AI Analysis Feed */}
                                    <div className={`ai-advisory-box ... ${showTour && tourStep === 2 ? 'highlight-target highlight-maker' : ''}`}>
                                        <div className="AI Analysis mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl relative overflow-hidden group min-h-[80px]">
                                            {isAiAnalyzing && (
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scanline pointer-events-none"
                                                    style={{ animation: 'scanline 2s linear infinite' }} />
                                            )}

                                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                                {isAiAnalyzing ? (
                                                    <Loader2 size={14} className="text-emerald-400 animate-spin" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                )}
                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">
                                                    {isAiAnalyzing ? "AI_DECRYPTING_PATTERNS..." : "AI_CO_PILOT_ADVISORY"}
                                                </span>
                                            </div>

                                            <div className="relative z-10">
                                                <p className="text-xs text-gray-300 font-mono leading-relaxed">
                                                    {isAiAnalyzing ? (
                                                        <span className="opacity-50 italic">
                                                            Analyzing entropy and keyboard sequence correlations...
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <span className="text-emerald-500 mr-2 font-bold">{">"}</span>
                                                            {displayedText}
                                                            {/* مؤشر الكتابة المومض (Cursor) */}
                                                            <span className="inline-block w-1.5 h-3 bg-emerald-500 ml-1 animate-pulse" />
                                                        </>
                                                    )}
                                                </p>
                                            </div>

                                            {/* الخط الجانبي المضيء - يظهر فقط بعد التحليل */}
                                            {!isAiAnalyzing && aiRecommendation && (
                                                <div className="absolute top-0 left-0 h-full w-1 bg-emerald-500 shadow-[0_0_15px_#10b981]" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-between items-center px-6 py-2 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                        <div className="flex gap-6 items-center">
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold font-mono">ENTER</span>
                                <span className="text-[9px] text-emerald-500/40 uppercase tracking-widest font-mono">Deploy Sequence</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold font-mono">ESC</span>
                                <span className="text-[9px] text-emerald-500/40 uppercase tracking-widest font-mono">Reboot</span>
                            </div>
                        </div>
                        <div className="text-[8px] text-emerald-500/80 font-mono  ">
                            Ready_to_protect
                        </div>
                    </div>
                </div>
            )}

            {/* Breaker Mode UI */}
            {gameMode === 'breaker' && (
                isWaitingForMaker ? (
                    <div className="flex flex-col items-center justify-center h-[500px] w-full text-red-500 animate-pulse font-mono z-50">
                        <Loader2 size={64} className="animate-spin mb-6" />
                        <h2 className="text-2xl font-black tracking-widest uppercase">WAITING FOR MAKER...</h2>
                        <p className="text-sm opacity-60 mt-2">Intercepting security sequence deployment</p>
                    </div>
                ) : breakerData && (
                    <div className="max-w-7xl mx-auto w-full flex flex-col gap-10 animate-in slide-in-from-bottom-12 duration-1000 font-mono relative">

                        <div className={`transition-all duration-500 ${showTour && tourStep === 2 ? 'highlight-target highlight-breaker' : ''}`}>

                            <div className="flex gap-4 ">
                                {[1, 2, 3].map((stage) => (
                                    <div
                                        key={stage}
                                        className={`h-2 flex-1 rounded-full transition-all duration-500 ${stage < currentStage ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                                            stage === currentStage ? 'bg-red-500 animate-pulse' : 'bg-white/10'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        {/* 🟢 القسم العلوي: ملف الهدف (Target Intel Folder) المدمج */}
                        <div className={`target-dossier transition-all duration-500 ${showTour && tourStep === 0 ? 'highlight-target highlight-breaker' : ''}`}>
                            <div className="Target Dossier bg-[#0a0000] border-2 border-red-500/20 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(239,68,68,0.05)] relative overflow-hidden group">

                                <div className="flex justify-between items-start mb-10 pb-6 border-b border-red-500/10">
                                    <div className="flex items-center gap-6">
                                        {/* 🟢 صورة الضحية (Avatar) */}
                                        {/* <div className="w-24 h-24 rounded-full border-4 border-red-600/30 overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                    <img
                                        src={breakerData.userData.name.length % 2 === 0 ? "/images/target_male.png" : "/images/target_female.png"} // صورة ديناميكية بناءً على الاسم
                                        alt="Target"
                                        className="w-full h-full object-cover grayscale opacity-80"
                                    />
                                </div> */}
                                        <div>
                                            <h3 className="text-red-500 text-xs font-black uppercase tracking-[0.3em]">Investigation_Dossier</h3>
                                            <p className="text-sm text-red-100/90 font-bold border-b border-red-500/20 pb-1 mb-1">TARGET_ID: {breakerData.userData.name.toUpperCase()}</p>
                                            <p className="text-[10px] text-red-500/40">Correlation Index: {Math.floor(Math.random() * 20 + 70)}% / VULNERABLE</p>
                                        </div>
                                    </div>
                                    {/* ختم "CLASSIFIED" الأحمر */}
                                    <div className="text-red-600 text-[9px] font-black px-3 py-1.5 rounded border-2 border-red-600 rotate-[-15deg] animate-pulse">CLASSIFIED</div>
                                </div>

                                {/* 🟢 تفاصيل الملف العميقة (Deep Intelligence) - مقسمة لأقسام */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">

                                    {/* 1. البيانات الشخصية */}
                                    <div className="space-y-4">
                                        <h4 className="text-red-500/60 text-[10px] uppercase tracking-widest border-b border-white/5 pb-1">Primary_Data</h4>
                                        {[
                                            { key: "Birth_Year", value: breakerData.userData.birthYear },
                                            { key: "Home_Sector", value: breakerData.userData.city },
                                            { key: "Unit_Pet", value: breakerData.userData.pet },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">{item.key}:</span>
                                                <span className="text-white/80 font-bold">{item.value || "UNKNOWN"}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 2. تتبع البصمة الرقمية (Deep Dive) */}
                                    <div className="space-y-4">
                                        <h4 className="text-red-500/60 text-[10px] uppercase tracking-widest border-b border-white/5 pb-1">Digital_Trace</h4>
                                        {[
                                            { key: "Email_Fragment", value: breakerData.userData.email ? breakerData.userData.email.split('@')[0] : "UNDETECTED" },
                                            { key: "Known_Alias", value: breakerData.userData.name.toLowerCase().replace(' ', '_') + "_01" },
                                            { key: "Device_Last_Active", value: Math.floor(Math.random() * 20 + 20) + "m ago" },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">{item.key}:</span>
                                                <span className="text-white/80 font-bold">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 3. تلميح الـ AI Agent (الملاحظة الميدانية) */}
                                    <div className={`agent-hint-box transition-all duration-500 ${showTour && tourStep === 1 ? 'highlight-target highlight-breaker' : ''}`}>
                                        <div className="Field Agent Hint bg-red-500/5  rounded-xl p-5 font-mono italic relative overflow-hidden group">
                                            <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-red-600/90 "></div>
                                            <div className="absolute -right-10 top-5 bg-red-500/80 text-white text-[8px] font-black px-10 py-1 rotate-45 shadow-lg">Agent Analysis</div>
                                            <p className="text-xs text-red-100/70 leading-relaxed pt-2">
                                                {displayedAnalysis}
                                                {/* <span className="text-red-600 font-black mr-2">&gt;&gt;</span>
                                            {breakerInput.length === 0 ? "Analyzing behavioral patterns... The target's Digital Identity correlation indicates high predictability in Level " + initialLevel : breakerData.hint} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 🟢 القسم السفلي: كونسول الاختراق (Cracking Console) */}
                        <div className=" md:col-span-2 flex flex-col gap-6">
                            <div className={`cracking-console transition-all duration-500 ${showTour && tourStep === 2 ? 'highlight-target highlight-breaker' : ''}`}>
                                <div className="bg-[#080808] border-2 border-red-500/20 rounded-[2.5rem] p-10 relative group shadow-2xl transition-all duration-300 focus-within:border-red-500/50">
                                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                                    <div className="flex justify-between items-center mb-8">
                                        <label className="text-red-500/40 text-[9px] uppercase tracking-[0.5em]">_Brute_Force_Terminal_</label>
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleBreakerGuess} className="relative mb-8 flex items-center">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-red-500 text-2xl font-bold opacity-30">$</span>
                                        <input
                                            type="text"
                                            value={breakerInput}
                                            onKeyDown={(e) => {
                                                handleKeyPress();
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleBreakerGuess();
                                                } else if (e.key === 'Escape') {
                                                    handleReset();
                                                }
                                            }}
                                            onChange={(e) => setBreakerInput(e.target.value)}
                                            disabled={isChecking || isAnswered}
                                            className={`w-full bg-transparent border-none pl-8 pr-12 text-3xl text-red-400 placeholder:text-red-900/10 focus:ring-0 font-mono tracking-[0.2em] outline-none ${isAnswered && breakerInput.toLowerCase() !== correctAnswerFromServer?.toLowerCase() ? 'animate-shake text-red-600' : ''}`}
                                            placeholder="GUESS_PASSWORD_"
                                            autoFocus
                                        />
                                        <button type="submit" disabled={isChecking || isAnswered || !breakerInput} className="absolute right-0 top-1/2 -translate-y-1/2 p-3 hover:bg-red-500 hover:text-black rounded-xl transition-all text-red-500/30">
                                            {isChecking ? <Loader2 className="animate-spin" /> : <ChevronRight size={28} />}
                                        </button>
                                    </form>

                                    {/* بار حالة الاختراق */}
                                    <div className="Breach Stages mt-8 flex gap-2 h-1 px-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className={`flex-1 rounded-full ${isChecking ? 'bg-red-600 animate-pulse' : 'bg-white/5'}`} style={{ animationDelay: `${i * 150}ms` }}></div>
                                        ))}
                                    </div>
                                </div>

                                {/* شريط معلومات تقني أسفل الحاوية (Shortcut Bar) */}
                                <div className="flex justify-between items-center px-8 py-3 bg-red-500/5 rounded-full border border-red-500/10">
                                    <div className="flex gap-6 items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-red-500/20 text-red-400 text-[8px] px-1.5 py-0.5 rounded border border-red-500/20 font-bold font-mono">ENTER</span>
                                            <span className="text-[9px] text-red-500/40 uppercase tracking-widest font-mono">Execute Crack</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-red-500/20 text-red-400  text-[8px] px-1.5 py-0.5 rounded border border-red-500/20 font-bold font-mono">ESC</span>
                                            <span className="text-[9px] text-red-500/40 uppercase tracking-widest font-mono">Reboot</span>
                                        </div>
                                    </div>
                                    <div className="text-[8px] text-red-500/40 italic flex items-center gap-2"><Lock size={10} /> LAYER: 128-bit_ENCRYPTION_ACTIVE_</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

        </div>
    );
};



export default PasswordMakerBreaker;