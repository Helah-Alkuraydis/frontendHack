import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import SingleLayout from '../layouts/SingleLayout';
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

const SingleController: React.FC<HackRaceProps> = ({
    gameId, sessionId, initialLevel, userData, navigate, mode, onFinish
}) => {

    const [scenarios, setScenarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔥 Fallback scenarios
    const premiumFallbackScenarios = [
        {
            id: 1,
            question: "You receive an urgent email from the 'CEO' requesting a wire transfer to a new vendor. The email address looks slightly off (e.g., @company-inc.com). What is your immediate action?",
            options: ["Execute the transfer immediately.", "Reply to the email to confirm.", "Verify by calling the CEO via a known number.", "Ignore it."],
            correctAnswer: "Verify by calling the CEO via a known number.",
            hint: "Check for Business Email Compromise (BEC) signs.",
            explanation: "Always verify urgent financial requests through a different communication channel."
        },
        {
            id: 2,
            question: "Your computer screen suddenly locks, displaying a message demanding Bitcoin to decrypt your files. What should you do first?",
            options: ["Pay the ransom immediately.", "Disconnect the computer from the network.", "Restart the computer.", "Email the attacker for a discount."],
            correctAnswer: "Disconnect the computer from the network.",
            hint: "Stop the infection from spreading.",
            explanation: "Disconnecting prevents ransomware from reaching other devices on the network."
        },
        {
            id: 3,
            question: "While entering the secure server room, a person you don't recognize carrying heavy boxes asks you to hold the door. What is the secure action?",
            options: ["Hold the door to be polite.", "Ask them to badge in themselves.", "Take the boxes for them.", "Let them in but watch them closely."],
            correctAnswer: "Ask them to badge in themselves.",
            hint: "Think about 'Tailgating' risks.",
            explanation: "Security policy requires everyone to use their own credentials for entry."
        },
        {
            id: 4,
            question: "You are working remotely from a cafe and need to access sensitive company data. The Wi-Fi is free and open. What is the safest approach?",
            options: ["Connect directly to the free Wi-Fi.", "Use a Virtual Private Network (VPN) before accessing data.", "Ask the barista for a hidden network.", "Work offline only."],
            correctAnswer: "Use a Virtual Private Network (VPN) before accessing data.",
            hint: "Encrypt your traffic on public networks.",
            explanation: "A VPN creates a secure tunnel, protecting your data from interception."
        },
        {
            id: 5,
            question: "You find a USB drive labeled 'Q4 Employee Bonuses' in the company parking lot. What is the safest course of action?",
            options: ["Plug it into your work laptop to find the owner.", "Plug it into a personal laptop at home.", "Hand it over to the IT or Security department.", "Throw it in the trash."],
            correctAnswer: "Hand it over to the IT or Security department.",
            hint: "Malware can hide in hardware.",
            explanation: "Unknown USBs can carry malicious payloads that execute automatically upon connection."
        }
    ];

    const [lives, setLives] = useState(3);
    const [playerProgress, setPlayerProgress] = useState(0);
    const [aiProgress, setAiProgress] = useState(0);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isWarning, setIsWarning] = useState(false);
    const [gameResult, setGameResult] = useState<"win" | "loss" | null>(null);
    const [message, setLossReason] = useState<string>("");
    const [showExplanation, setShowExplanation] = useState(false);

    const warningSound = useRef(new Audio("/warning.mp3"));

    const scenario = scenarios[currentScenarioIndex] || {};
    const TOTAL_STEPS = scenarios.length;

    const FINISH_LINE = 93;
    const FINISH_POSITION = 95;

    // 🔥 نفس القديم (ثابت)
    const STEP_INCREMENT = 20;

    const getRaceTime = (level: number) => {
        if (level > 20) return 60;
        if (level >= 16) return 75;
        if (level >= 11) return 90;
        if (level >= 6) return 105;
        return 120;
    };

    const raceTime = getRaceTime(initialLevel);
    const AI_SPEED = 100 / (raceTime * 1.18);
    const [timeLeft, setTimeLeft] = useState(raceTime);

    // 🔥 Fetch + fallback
    useEffect(() => {
        const fetchGameData = async () => {
                try {
                   if (scenarios.length === 0) setLoading(true);
   
                   const token = localStorage.getItem("token");
   
                   const res = await axios.get(
                       `${BASE_URL}/games/hackrace/start?level=${initialLevel}`,
                       { headers: { Authorization: `Bearer ${token}` } }
                   );
   
                   if (res.data.success) {
                       const rawData = res.data.data?.questions || res.data.data;
   
                       if (rawData && rawData.length > 0) {
                           setScenarios(Array.isArray(rawData) ? rawData : [rawData]);
                       } else {
                           setScenarios(premiumFallbackScenarios);
                       }
                   } else {
                       setScenarios(premiumFallbackScenarios);
                   }
   
                   setLoading(false);
   
               } catch (err) {
                   console.error("Error fetching AI scenarios", err);
                   setScenarios(premiumFallbackScenarios);
                   setLoading(false);
               }
            
        };

        fetchGameData();
    }, [initialLevel]);

    // التايمر + حركة الهكر
    useEffect(() => {
        if (isGameOver || loading) return;

        const interval = setInterval(() => {

            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleFinishGame("Loss", "Time has expired");
                    return 0;
                }
                return prev - 1;
            });

            setAiProgress((prev) => {
                const next = prev + AI_SPEED;

                if (next >= FINISH_LINE) {
                    handleFinishGame("Loss", "The hacker reached the finish line!");
                    return FINISH_LINE;
                }

                return next;
            });

        }, 1000);

        return () => clearInterval(interval);

    }, [isGameOver, loading]);

    // صوت التحذير
    useEffect(() => {
        if (playerProgress === 0) return;

        const distance = aiProgress - playerProgress;

        if (distance > -2 && distance < 4) {
            setIsWarning(true);
            warningSound.current.currentTime = 0;
            warningSound.current.play().catch(() => { });
            const timeout = setTimeout(() => setIsWarning(false), 200);
            return () => clearTimeout(timeout);
        } else {
            setIsWarning(false);
        }

    }, [playerProgress, aiProgress]);

    // الإجابة
    const handleAnswer = async (index: number) => {
        if (isAnswered || isGameOver) return;

        setIsAnswered(true);
        setSelectedOptionIndex(index);

        const userAnswer = scenario.options?.[index];
        const correctAnswer = scenario.correctAnswer;

        try {
            const token = localStorage.getItem("token");

            const res = await axios.post(
                `${BASE_URL}/games/hackrace/check`,
                { userAnswer, correctAnswer },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const isCorrect = res.data.isCorrect;

            setTimeout(() => {

                let newPlayer = playerProgress;
                let newAi = aiProgress;

                if (isCorrect) {
                    newPlayer = Math.min(playerProgress + STEP_INCREMENT, 100);
                    setPlayerProgress(newPlayer);
                    finalizeStep(newPlayer, newAi);
                } else {
                    const newLives = lives - 1;
                    setLives(newLives);

                    newAi = Math.min(aiProgress + 20, 100);
                    setAiProgress(newAi);

                    if (newLives <= 0) {
                        handleFinishGame("Loss", "You lost! No lives remaining");
                        return;
                    }

                    setShowExplanation(true);

                    setTimeout(() => {
                        setShowExplanation(false);
                        finalizeStep(newPlayer, newAi);
                    }, 3500);
                }

            }, 1200);

        } catch (err) {
            setIsAnswered(false);
        }
    };

    const finalizeStep = (pProgress: number, aProgress: number) => {

        const isLastQuestion = currentScenarioIndex === scenarios.length - 1;

        if (pProgress >= FINISH_LINE) {
            handleFinishGame("Win", "Mission Accomplished!");
            return;
        }

        if (isLastQuestion) {
            if (pProgress > aProgress) {
                setPlayerProgress(100);
                setTimeout(() => handleFinishGame("Win", "Mission Accomplished!"), 800);
            } else {
                handleFinishGame("Loss", "Hacker was faster!");
            }
            return;
        }

        if (currentScenarioIndex < scenarios.length - 1) {
            setCurrentScenarioIndex(prev => prev + 1);
            setIsAnswered(false);
            setSelectedOptionIndex(null);
        }
    };

    const handleFinishGame = async (status: "Win" | "Loss", message: string) => {

        if (isGameOver) return;

        setIsGameOver(true);

        const token = localStorage.getItem("token");

        try {
            await axios.post(`${BASE_URL}/games/submit`, {
                sessionId: sessionId,
                score: status === "Win" ? 25 * initialLevel : 0,
                status: status,
                duration: raceTime - timeLeft
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (status === "Win") {
                await axios.post(`${BASE_URL}/games/level/up`, {
                    gameId: gameId,
                    score: 25 * initialLevel,
                    status: "Win"
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

        } catch (err) {
            console.error("Game sync error", err);
        }

        if (status === "Win") setGameResult("win");
        else {
            setGameResult("loss");
            setLossReason(message);
        }

        if (onFinish) {
            onFinish({
                status: status,
                score: status === "Win" ? 25 * initialLevel : 0,
                duration: raceTime - timeLeft,
                mistakesCount: 3 - lives
            });
        }
    };

    return (
        <SingleLayout
            loading={loading}
            scenarios={scenarios}
            currentScenarioIndex={currentScenarioIndex}
            scenario={scenario}
            TOTAL_STEPS={TOTAL_STEPS}
            FINISH_POSITION={FINISH_POSITION}
            initialLevel={initialLevel}
            timeLeft={timeLeft}
            lives={lives}
            playerProgress={playerProgress}
            aiProgress={aiProgress}
            isWarning={isWarning}
            isAnswered={isAnswered}
            selectedOptionIndex={selectedOptionIndex}
            gameResult={gameResult}
            message={message}
            showExplanation={showExplanation}
            userData={userData}
            navigate={navigate}
            handleAnswer={handleAnswer}
        />
    );
};

export default SingleController;