import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { socket } from '../../../../socket';
import MultiLayout from '../layouts/MultiLayout';
import { BASE_URL } from "../../../../api/auth.js";

interface HackRaceProps {
    gameId: string;
    sessionId: string;
    initialLevel: number;
    userData: any;
    navigate: any;
    mode?: string;
    onFinish: any;
}

const MultiController: React.FC<HackRaceProps> = ({
    gameId, sessionId, initialLevel, userData, navigate, mode, onFinish
}) => {
    const [scenarios, setScenarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [gameResult, setGameResult] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(120);
    const [lobbyPlayers, setLobbyPlayers] = useState<any[]>([]);
    const [raceState, setRaceState] = useState<any>(null);

    const myUserId = userData?._id;

    // 🔥 الحل السحري لمشكلة رجوع التقدم للخلف (Stale Closure Fix)
    const raceStateRef = useRef<any>(null);
    useEffect(() => {
        raceStateRef.current = raceState;
    }, [raceState]);

    const premiumFallbackScenarios = [
        {
            id: 1,
            question: "You receive an urgent email from the 'CEO' requesting a wire transfer to a new vendor. The email address looks slightly off (e.g., @company-inc.com). What is your immediate action?",
            options: ["Execute the transfer immediately.", "Reply to the email to confirm.", "Verify by calling the CEO via a known number.", "Ignore it."],
            correctAnswer: "Verify by calling the CEO via a known number.",
            explanation: "This is a Business Email Compromise (BEC) attack. Always verify urgent financial requests out-of-band."
        },
        {
            id: 2,
            question: "Your computer screen suddenly locks, displaying a message demanding Bitcoin to decrypt your files. What should you do first?",
            options: ["Pay the ransom immediately.", "Disconnect the computer from the network.", "Restart the computer.", "Email the attacker for a discount."],
            correctAnswer: "Disconnect the computer from the network.",
            explanation: "Disconnecting prevents the ransomware from spreading to other devices on the network."
        },
        {
            id: 3,
            question: "While entering the secure server room, a person you don't recognize carrying heavy boxes asks you to hold the door. What is the secure action?",
            options: ["Hold the door to be polite.", "Ask them to badge in themselves.", "Take the boxes for them.", "Let them in but watch them closely."],
            correctAnswer: "Ask them to badge in themselves.",
            explanation: "This is called 'Tailgating'. Everyone must use their own credentials to enter secure areas."
        },
        {
            id: 4,
            question: "You are working remotely from a local cafe and need to access sensitive company data. The cafe provides a free, open Wi-Fi network. What is the safest approach?",
            options: ["Connect directly to the free Wi-Fi.", "Use a Virtual Private Network (VPN) before accessing data.", "Ask the barista for a hidden network.", "Work offline only."],
            correctAnswer: "Use a Virtual Private Network (VPN) before accessing data.",
            explanation: "Open Wi-Fi networks can be easily intercepted. A VPN encrypts your traffic."
        },
        {
            id: 5,
            question: "You find a USB drive labeled 'Q4 Employee Bonuses' in the company parking lot. What is the safest course of action?",
            options: ["Plug it into your work laptop to find the owner.", "Plug it into a personal laptop at home.", "Hand it over to the IT or Security department.", "Throw it in the trash."],
            correctAnswer: "Hand it over to the IT or Security department.",
            explanation: "Unknown USBs can contain malicious payloads (like keyloggers) that execute automatically."
        }
    ];

    useEffect(() => {
        let isInitialized = false;
        const initializeMultiplayer = async () => {
            if (isInitialized || !myUserId || !sessionId) return;
            try {
                const token = localStorage.getItem("token");
                const lobbyRes = await axios.get(`${BASE_URL}/multiplayer/lobby/${sessionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const lobby = lobbyRes.data;
                setLobbyPlayers(lobby.players);

                // 🔥 حل مشكلة اختلاف الأسئلة: التأكد من مطابقة الـ ID كـ String 100%
                const isHost = String(lobby.hostId) === String(myUserId);

                if (isHost) {
                    isInitialized = true;
                    let finalQuestions = [];
                    try {
                        const qRes = await axios.get(`${BASE_URL}/games/hackrace/start?level=${initialLevel}&count=10`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const rawData = qRes.data.data;
                        finalQuestions = Array.isArray(rawData) ? rawData : [rawData];

                        if (finalQuestions.length === 0) throw new Error("Empty AI Response");
                    } catch (aiError) {
                        console.warn("AI Generation failed. Switching to Fallback.");
                        finalQuestions = premiumFallbackScenarios;
                    }

                    // الـ Host فقط يرسل الأسئلة للسيرفر ليوزعها على البقية
                    socket.emit("init_hack_race", {
                        sessionId,
                        players: lobby.players,
                        questions: finalQuestions
                    });
                }
            } catch (err) {
                console.error("Multiplayer Init Error", err);
            }
        };

        initializeMultiplayer();

        socket.on("hack_race_started", (data) => {
            setScenarios(data.questions);
            setRaceState(data.raceState);
            setLoading(false);
        });

        socket.on("race_state_update", (data) => {
            setRaceState(data.raceState);
        });

        socket.on("game_finished", (data) => {
            setGameResult(data.results);
            const myFinalData = data.results[myUserId];
            const isWinner = myFinalData?.rank === 1;
            handleFinishGame(isWinner ? "Win" : "Loss", myFinalData);
        });

        return () => {
            socket.off("hack_race_started");
            socket.off("race_state_update");
            socket.off("game_finished");
        };
    }, [sessionId, initialLevel, myUserId]);

    useEffect(() => {
        if (loading || gameResult) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    socket.emit("player_finished", { sessionId, userId: myUserId });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, gameResult]);

    const handleAnswer = async (index: number) => {
        // 🔥 نستخدم raceStateRef بدلاً من raceState المباشر
        if (isAnswered || !raceStateRef.current) return;

        const myPlayer = raceStateRef.current.players[myUserId];
        if (myPlayer?.eliminated) return;

        setIsAnswered(true);
        setSelectedOptionIndex(index);

        const scenario = scenarios[currentScenarioIndex];
        const userAnswer = scenario.options[index];

        const isCorrect = typeof userAnswer === "object"
            ? (userAnswer.isCorrect ?? userAnswer.text === scenario.correctAnswer)
            : userAnswer === scenario.correctAnswer;

        setTimeout(() => {
            // 🔥 قراءة أحدث حالة للتقدم في هذه اللحظة بالضبط
            const freshRaceState = raceStateRef.current;
            const freshMyPlayer = freshRaceState.players[myUserId];

            if (isCorrect) {
                const stepIncrement = 100 / scenarios.length;
                // نحسب التقدم بناءً على أحدث بيانات، وليس القديمة!
                const newProgress = Math.min((freshMyPlayer?.progress || 0) + stepIncrement, 100);

                socket.emit("update_race_progress", { sessionId, userId: myUserId, newProgress });

                if (newProgress >= 99 || currentScenarioIndex === scenarios.length - 1) {
                    socket.emit("player_finished", { sessionId, userId: myUserId });
                } else {
                    setCurrentScenarioIndex(prev => prev + 1);
                    setIsAnswered(false);
                    setSelectedOptionIndex(null);
                }
            } else {
                socket.emit("player_mistake", { sessionId, userId: myUserId });
                setShowExplanation(true);

                setTimeout(() => {
                    setShowExplanation(false);
                    if (currentScenarioIndex === scenarios.length - 1) {
                        socket.emit("player_finished", { sessionId, userId: myUserId });
                    }
                    else if (currentScenarioIndex < scenarios.length - 1 && (freshMyPlayer?.lives - 1) > 0) {
                        setCurrentScenarioIndex(prev => prev + 1);
                        setIsAnswered(false);
                        setSelectedOptionIndex(null);
                    }
                }, 3500);
            }
        }, 1000);
    };

    const handleFinishGame = async (status: "Win" | "Loss", myFinalData: any) => {
        const token = localStorage.getItem("token");
        try {
            // 🔥 الخطوة 1: استدعاء دالة زميلتك لإنشاء جلسة حقيقية في قاعدة البيانات أولاً
            const startSessionRes = await axios.post(`${BASE_URL}/games/session/start`, {
                gameId: gameId // نرسل الـ ID حق اللعبة
            }, { headers: { Authorization: `Bearer ${token}` } });

            // أخذنا الـ ID الحقيقي اللي يقبله كود زميلتك
            const realDatabaseSessionId = startSessionRes.data.sessionId;

            // 🔥 الخطوة 2: الآن نرسل النقاط والهيستوري باستخدام الـ ID الحقيقي!
            await axios.post(`${BASE_URL}/games/submit`, {
                sessionId: realDatabaseSessionId, // 👈 السر هنا! استبدلنا رقم الغرفة بالرقم الحقيقي
                score: status === "Win" ? 25 * initialLevel : 0,
                status: status,
                duration: 120 - timeLeft,
                mistakesCount: 3 - (myFinalData?.lives || 0)
            }, { headers: { Authorization: `Bearer ${token}` } });

            // تحديث الليفل في حال الفوز
            if (status === "Win") {
                await axios.post("http://localhost:5000/ap/games/level/up", {
                    gameId: gameId, score: 25 * initialLevel, status: "Win"
                }, { headers: { Authorization: `Bearer ${token}` } });
            }
        } catch (err) {
            console.error("Game sync error", err);
        }

        if (onFinish) {
            onFinish({
                status: status,
                score: status === "Win" ? 25 * initialLevel : 0,
                duration: 120 - timeLeft,
                mistakesCount: 3 - (myFinalData?.lives || 0)
            });
        }
    };
    const scenario = scenarios[currentScenarioIndex] || {};
    const myPlayerState = raceState?.players?.[myUserId];
    return (
        <MultiLayout
            loading={loading}
            scenarios={scenarios}
            currentScenarioIndex={currentScenarioIndex}
            scenario={scenario}
            TOTAL_STEPS={scenarios.length}
            initialLevel={initialLevel}
            myUserId={myUserId}
            raceState={raceState}
            myPlayerState={myPlayerState}
            isAnswered={isAnswered}
            selectedOptionIndex={selectedOptionIndex}
            showExplanation={showExplanation}
            gameResult={gameResult}
            userData={userData}
            timeLeft={timeLeft}
            lobbyPlayers={lobbyPlayers}
            navigate={navigate}
            handleAnswer={handleAnswer}
        />
    );
};

export default MultiController;