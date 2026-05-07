import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import MakerSingleLayout from '../layouts/MakerSingleLayout';
import MakerMultiLayout from '../layouts/MakerMultiLayout'; // استيراد الواجهة الجديدة
import { socket } from '../../../../socket';
import  {BASE_URL} from '../../../../api/auth.js';
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

const MakerController: React.FC<PasswordProps> = ({ gameId, sessionId, initialLevel, userData, navigate, mode, onFinish }) => {

    // --- States المشتركة والخاصة بالوضع الفردي ---
    const [password, setPassword] = useState('');
    const [strength, setStrength] = useState(0);
    const [isAlertActive, setIsAlertActive] = useState(false);
    const [aiRecommendation, setAiRecommendation] = useState('');
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
    const [displayedText, setDisplayedText] = useState("");
    const [gameStatus, setGameStatus] = useState<'Win' | 'Loss' | null>(null);
    const [timeLeft, setTimeLeft] = useState(180);
    const [lives, setLives] = useState(3);
    const [loading, setLoading] = useState(false);

    // --- States الخاصة بالوضع الجماعي (Multiplayer Dossier) ---
    const [targetName, setTargetName] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [city, setCity] = useState('');
    const [pet, setPet] = useState('');
    const [hint, setHint] = useState('');
    const [isDeployed, setIsDeployed] = useState(false); // هل تم إرسال المهمة؟
    const [attackLogs, setAttackLogs] = useState<{ guess: string, isCorrect: boolean, time: string }[]>([]); // سجل الهجمات

    const typeAudioRef = useRef(new Audio('/sounds/type.mp3'));
    const handleKeyPress = () => {
        typeAudioRef.current.currentTime = 0;
        typeAudioRef.current.play().catch(() => { });
    };


    // حساب قوة كلمة المرور (للوضع الفردي)
    useEffect(() => {
        let s = 0;
        if (password.length >= 10) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[a-z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        setStrength(s);
    }, [password]);

    // تأثير الطباعة للـ AI
    useEffect(() => {
        if (!isAiAnalyzing && aiRecommendation) {
            setDisplayedText("");
            let i = 0;
            const typingInterval = setInterval(() => {
                if (i < aiRecommendation.length) {
                    setDisplayedText(aiRecommendation.substring(0, i + 1));
                    i++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 50);
            return () => clearInterval(typingInterval);
        }
    }, [aiRecommendation, isAiAnalyzing]);

    // 🎧 استماع الميكر لتخمينات البريكر (كاميرا المراقبة)
    useEffect(() => {
        if (mode !== 'multiplayer') return;

        const handleBreakerAttempt = (data: any) => {
            const newLog = {
                guess: data.guess,
                isCorrect: data.isCorrect,
                time: new Date().toLocaleTimeString([], { hour12: false }) // وقت المحاولة
            };
            
            // إضافة المحاولة الجديدة في بداية السجل
            setAttackLogs(prev => [newLog, ...prev]);

            
        };

        socket.on("receive_breaker_guess", handleBreakerAttempt);

        return () => {
            socket.off("receive_breaker_guess", handleBreakerAttempt);
        };
    }, [mode]);

    // منطق إرسال المهمة في الوضع الجماعي (Multiplayer Deploy)
    const handleMultiplayerDeploy = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        console.log("🚀 Deploying Mission...");
        setLoading(true);

        const missionData = {
            sessionId,
            password,
            dossier: {
                name: targetName,
                birthYear,
                city,
                pet,
                hint
            }
        };

        console.log("📦 Sending Data to Socket:", missionData);

        // 🔥 التعديل החاسم: التأكد من اتصال السوكيت قبل الإرسال
        if (!socket.connected) {
            console.log("🔌 Socket was disconnected. Reconnecting...");
            socket.connect();

            // ننتظر قليلاً لضمان اكتمال الاتصال قبل الإرسال
            setTimeout(() => {
                // التأكد من الانضمام للغرفة مرة أخرى في حال انقطع الاتصال
                socket.emit("join_room", sessionId);
                socket.emit("send_password", missionData);
                setLoading(false);
                setIsDeployed(true);
                showSuccessMessage();
            }, 500);
        } else {
            // السوكيت متصل بالفعل، نرسل فوراً
            socket.emit("send_password", missionData);
            setIsDeployed(true);
            showSuccessMessage();
        }
    };

    // 🏆 استماع الميكر لنتيجة المباراة النهائية من السيرفر
    // useEffect(() => {
    //     if (mode !== 'multiplayer') return;

    //     const handleMatchEnded = (data: any) => {
    //         if (data.winner === 'maker') {
    //             // الميكر فاز لأن البريكر فشل
    //             handleFinishGame('Win');
    //         } else if (data.winner === 'breaker') {
    //             // الميكر خسر لأن البريكر جاب الكلمة
    //             handleFinishGame('Loss');
    //         }
    //     };

    //     socket.on("match_ended", handleMatchEnded);

    //     return () => {
    //         socket.off("match_ended", handleMatchEnded);
    //     };
    // }, [mode, sessionId]);

    // دالة مساعدة لعرض رسالة النجاح
    const showSuccessMessage = () => {
        setTimeout(() => {
            setLoading(false);
           
        }, 1000);
    }

    // منطق التحقق في الوضع الفردي (يبقى كما هو)
    const handleMakerSubmit = async () => {
        setIsAlertActive(false);
        setIsAiAnalyzing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${BASE_URL}/games/password/evaluate`, {
                password, gameId, duration: 180 - timeLeft, level: initialLevel
            }, { headers: { Authorization: `Bearer ${token}` } });

            const { status, aiRecommendation: aiRes } = res.data;
            setAiRecommendation(aiRes);
            setGameStatus(status);
            setIsAiAnalyzing(false);
        } catch (e) {
            setIsAiAnalyzing(false);
            setAiRecommendation("CRITICAL_ERROR: AI_NEURAL_LINK_SEVERED.");
        }
    };

    const handleFinishGame = (status: 'Win' | 'Loss') => {
        const winXP = 25 * initialLevel;
        onFinish({ status, score: status === 'Win' ? winXP : 0, duration: 180 - timeLeft });
    };

    // --- التوجيه بناءً على وضع اللعب ---
    if (mode === 'multiplayer') {
        return (
            <MakerMultiLayout
                targetName={targetName} setTargetName={setTargetName}
                birthYear={birthYear} setBirthYear={setBirthYear}
                city={city} setCity={setCity}
                pet={pet} setPet={setPet}
                hint={hint} setHint={setHint}
                handleKeyPress={handleKeyPress}
                password={password} setPassword={setPassword}
                handleDeploy={handleMultiplayerDeploy}
                loading={loading}
                isAlertActive={isAlertActive}
                isDeployed={isDeployed} 
                attackLogs={attackLogs}
            />
        );
    }

    return (
        <MakerSingleLayout
            password={password} setPassword={setPassword}
            strength={strength} isVulnerable={strength < 5}
            handleKeyPress={handleKeyPress}
            isAlertActive={isAlertActive} isAiAnalyzing={isAiAnalyzing}
            displayedText={displayedText} aiRecommendation={aiRecommendation}
            loading={loading} timeLeft={timeLeft} lives={lives}
            initialLevel={initialLevel} handleMakerSubmit={handleMakerSubmit}
            handleReset={() => setPassword('')}
        />
    );
};

export default MakerController;