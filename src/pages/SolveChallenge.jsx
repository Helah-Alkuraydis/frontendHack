import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PhishingLayout from "../components/challengesUI/PhishingLayout";
import BreakerLayout from "../components/challengesUI/BreakerLayout";
import SecureCodingLayout from "../components/challengesUI/SecureCodingLayout";
import PrivacyAwarenessLayout from "../components/challengesUI/PrivacyAwarenessLayout";
import HackRaceLayout from "../components/challengesUI/HackRaceLayout";
import EscapeRoomLayout from "../components/challengesUI/EscapeRoomLayout";
import MainLayout from "../components/MainLayout";
import Swal from "sweetalert2";
import { ArrowLeft, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { BASE_URL } from "../api/auth.js";

const ChallengeSolvePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lives, setLives] = useState(3);

  const [breakerInput, setBreakerInput] = useState("");
  const [displayedAnalysis, setDisplayedAnalysis] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const [phase, setPhase] = useState(1);
  const [userCode, setUserCode] = useState("");
  const [selectedLineIdx, setSelectedLineIdx] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [privacyResult, setPrivacyResult] = useState({ score: 0, details: [] });

  const [playerProgress, setPlayerProgress] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);

  const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
  const [activeHint, setActiveHint] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [sessionId, setSessionId] = useState(null);

  const [isWrong, setIsWrong] = useState(false);
  // 1. جلب بيانات التحدي عند فتح الصفحة
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BASE_URL}/challenges/public/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const rawData = res.data.challenge;
        setTimeLeft(rawData.timeLimit || 60);
        setLives(rawData.maxAttempts || 3);

        if (rawData && rawData.scenarioData) {
          // إذا كانت اللعبة فيشنق، نجهز الأزرار
          if (rawData.gameId.gameName === "Phishing Hunter") {
            const actions = [
              rawData.scenarioData.correctAnswer,
              ...(rawData.scenarioData.wrong_actions || []),
            ].sort(() => Math.random() - 0.5);
            rawData.scenarioData.actions = actions;
          }
          // إذا كانت بريكر، نشغل تأثير الكتابة للتقرير
          else if (rawData.gameId.gameName === "Password Maker/Breaker") {
            runTypeEffect(rawData.scenarioData.analysis_report || "");
          }

          // ابحثي عن الجزء اللي يشيك على نوع اللعبة داخل الـ fetchChallenge وزيدي هذا:
          else if (rawData.gameId.gameName === "Secure Coding Challenge") {
            setUserCode(rawData.scenarioData.vulnerable_code || "");
          } else if (rawData.gameId.gameName === "Cyber Escape Room") {
            if (rawData.scenarioData.rooms) {
              setCurrentRoomIdx(0);
            }
          }

          setChallengeData(rawData);
        }
      } catch (err) {
        navigate("/challenges");
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  useEffect(() => {
    let timer;
    if (!loading && challengeData && !isAnswered && timeLeft > 0 && lives > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (challengeData.gameId.gameName === "Hack Race") {
          setAiProgress((prev) => {
            const raceTime = challengeData.timeLimit || 60;
            const aiSpeedPerSecond = 93 / (raceTime * 1.1);

            const nextPos = prev + aiSpeedPerSecond;

            // إذا وصل الهكر للنهاية قبل اليوزر
            if (nextPos >= 93 && !isAnswered) {
              finishRace(playerProgress, 100); // 👈 التعديل هنا: مررنا القيم عشان يخسر صح
            }
            return nextPos;
          });
        }
      }, 1000);
    } else if (timeLeft === 0 && challengeData && !isAnswered) {
      handleChallengeSubmit("TIMEOUT_AUTO_FAILURE");
    }
    return () => clearInterval(timer);
  }, [loading, timeLeft, lives, isAnswered, challengeData, playerProgress]); // 👈 أضفنا playerProgress هنا

  const runTypeEffect = (text) => {
    setDisplayedAnalysis("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedAnalysis((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
  };

  const handleLineClick = (lineText, idx) => {
    if (phase !== 1) return;
    setSelectedLineIdx(idx);

    const cleanSelected = lineText.trim();
    const cleanTarget =
      challengeData.scenarioData.target_vulnerable_line.trim();

    if (
      cleanSelected.includes(cleanTarget) ||
      cleanTarget.includes(cleanSelected)
    ) {
      setFeedback({
        message: "Vulnerability identified! Now, fix the code.",
        isError: false,
      });
      setTimeout(() => {
        setPhase(2);
        setSelectedLineIdx(null);
        setFeedback(null);
      }, 1500);
    } else {
      setLives((prev) => prev - 1);
      setFeedback({ message: "Incorrect line. Look closer.", isError: true });
      if (lives <= 1) handleChallengeSubmit("FAILED_BY_MISTAKES");
    }
  };

  const handleSecureSubmit = () => {
    // نرسل الكود اللي كتبه المستخدم للسيرفر للتحقق منه
    handleChallengeSubmit(userCode);
  };

  const handleAddData = (item) => {
    if (!selectedIds.includes(item.id)) {
      setSelectedIds([...selectedIds, item.id]);
      setDecisions({
        ...decisions,
        [item.id]: {
          necessary: true,
          sensitivity: "normal",
          encryption: "plain",
          accessLevel: "admin",
        },
      });
    }
  };

  const handleRemoveData = (id) => {
    setSelectedIds(selectedIds.filter((sid) => sid !== id));
    const newDecisions = { ...decisions };
    delete newDecisions[id];
    setDecisions(newDecisions);
  };

  const handleUpdateDecision = (id, field, value) => {
    setDecisions({
      ...decisions,
      [id]: { ...decisions[id], [field]: value },
    });
  };

  // 2. دالة الإرسال للسيرفر (handleChallengeSubmit)
  const handleChallengeSubmit = async (actionName) => {
    if (isAnswered) return;
    setSelectedAction(actionName);
    setIsAnswered(true);
    setIsChecking(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/challenges/public/solve/${id}`,
        { userGuess: actionName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.isCorrect) {
        setIsAnswered(true);
        Swal.fire({
          title: "SUCCESS",
          text: "Challenge Secured!",
          icon: "success",
        }).then(() => navigate("/challenges"));
      } else {
        const newLives = Math.max(0, lives - 1);
        setLives(newLives);

        if (newLives <= 0) {
          setIsAnswered(true);
          Swal.fire({
            title: "FAILED",
            text: "System Locked!",
            icon: "error",
          }).then(() => navigate("/challenges"));
        } else {
          Swal.fire({
            title: "WRONG",
            text: "Try again!",
            icon: "warning",
            timer: 1000,
            showConfirmButton: false,
          });

          setTimeout(() => {
            setIsAnswered(false);
            setSelectedAction(null);
          }, 1000);
        }
      }
    } catch (err) {
      Swal.fire("Error", "Connection failed", "error");
      setIsAnswered(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLinkCheck = () => {
    Swal.fire({
      title: "Link Analysis",
      text: "URL: " + challengeData.scenarioData.links?.[0]?.url,
      icon: "info",
    });
  };

  const handlePrivacySubmit = async () => {
    setIsChecking(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/challenges/public/solve/${id}`,
        {
          userGuess: { selectedIds, decisions }, // نرسل كائن متكامل
          isPrivacyGame: true,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setPrivacyResult({
          score:
            res.data.score !== undefined
              ? res.data.score
              : res.data.isCorrect
                ? 100
                : 0,
          details: res.data.feedback, // تأكدي أن الباك أند يرجع feedback
        });
        setShowResult(true);
      }
    } catch (err) {
      Swal.fire("Error", "Failed to analyze architecture", "error");
    } finally {
      setIsChecking(false);
    }
  };

  
  const handleHackRaceAnswer = async (index) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOptionIndex(index);

    const scenario = challengeData.scenarioData.questions[currentQuestionIndex];
    const rawOption = scenario.options[index];

    // استخراج النص عشان الباك أند يفهمه
    const userAnswer = typeof rawOption === "object" ? rawOption.text : rawOption;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/challenges/public/solve/${id}`,
        { userGuess: userAnswer, currentQuestionIndex: currentQuestionIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let updatedPlayerProgress = playerProgress;
      let updatedAiProgress = aiProgress;
      
      // 💡 التعديل السحري: هنا المتغير النظيف اللي ما ينخدع!
      let updatedLives = lives; 

      if (res.data.isCorrect === true) {
        // ✅ الإجابة صحيحة
        updatedPlayerProgress = Math.min(playerProgress + 20, 100);
        setPlayerProgress(updatedPlayerProgress);
        setShowExplanation(false);
      } else {
        // ❌ الإجابة خاطئة: نخصم قلب يدوياً في الفرونت أند فقط!
        updatedLives = Math.max(0, lives - 1);
        setLives(updatedLives); // تحديث القلوب في الشاشة فوراً
        
        updatedAiProgress = Math.min(aiProgress + 20, 100);
        setAiProgress(updatedAiProgress);
        setShowExplanation(true); // تطلع الشاشة الحمراء حقت الشرح
      }

      // 2. الانتظار لرؤية النتيجة وبعدها نحدد الخطوة الجاية
      setTimeout(() => {
        setShowExplanation(false);

        if (res.data.isCorrect === true) {
          const isLastQuestion = currentQuestionIndex === challengeData.scenarioData.questions.length - 1;

          if (isLastQuestion) {
            finishRace(updatedPlayerProgress, updatedAiProgress);
          } else {
            setCurrentQuestionIndex((prev) => prev + 1);
            setIsAnswered(false);
            setSelectedOptionIndex(null);
          }
        } else {
          // 💡 اللحين مستحيل يطردك إلا إذا صارت القلوب صفر فعلياً
          if (updatedLives <= 0 || updatedAiProgress >= 93) {
            finishRace(updatedPlayerProgress, updatedAiProgress);
          } else {
            // باقي لك قلوب؟ نرجع نفتح لك الأزرار تحاولين من جديد
            setIsAnswered(false);
            setSelectedOptionIndex(null);
          }
        }
      }, 2500);
    } catch (err) {
      console.error(err);

      if (err.response && err.response.status === 403) {
        setLives(0);
        setTimeout(() => {
          finishRace(playerProgress, 100);
        }, 1000);
      } else {
        setIsAnswered(false);
        Swal.fire("Error", "Connection Lost", "error");
      }
    }
  };


  const finishRace = (finalPlayerPos, finalAiPos) => {
    // نستخدم المعايير التي وصلت للدالة الآن
    const isWin = finalPlayerPos >= 90 || finalPlayerPos >= finalAiPos;

    if (isWin) {
      Swal.fire({
        title: "RACE COMPLETE! 🏁",
        text: "Mission Accomplished! You secured the system.",
        icon: "success",
      }).then(() => navigate("/challenges"));
    } else {
      Swal.fire({
        title: "SYSTEM BREACHED! 💀",
        text: "The hacker was faster. Access denied.",
        icon: "error",
      }).then(() => navigate("/challenges"));
    }
  };

  // --- داخل ملف ChallengeSolvePage.jsx في الريأكت ---
  const handleEscapeBreach = async (directValue = null) => {
    const finalInput =
      (typeof directValue === "string" ? directValue : answerInput) || "";
    const cleanInput = finalInput.trim();

    if (!cleanInput) return;

    try {
      const token = localStorage.getItem("token");

      // 1. الطلب الوحيد للسيرفر
      const res = await axios.post(
        `${BASE_URL}/challenges/public/solve/${id}`,
        {
          userGuess: cleanInput,
          roomIdx: currentRoomIdx,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.isCorrect) {
        const isLastRoom =
          currentRoomIdx === challengeData.scenarioData.rooms.length - 1;

        if (isLastRoom) {
          // ✅ السكور هو اللي جاي من الباك أند (80)
          const finalCalculatedPoints = challengeData.points_pool || 80;

          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#00ff96", "#00d1ff", "#ff88cc"],
          });

          Swal.fire({
            title:
              '<div style="color:#00ff96; font-family:monospace; font-size: 1.8rem; font-weight: 900; letter-spacing:2px;">MISSION_ACCOMPLISHED</div>',
            html: `
            <div style="color: #a0aec0; font-family: monospace; text-align: center; padding-top: 10px;">
              <p style="font-size: 1rem; color: #fff; margin-bottom: 20px;">Excellent work, Player!</p>
              <div style="background: rgba(0,255,150,0.05); border: 2px dashed #00ff9650; padding: 20px; border-radius: 25px; margin: 10px 0;">
                <span style="color: #888; font-size: 0.8rem; display: block; margin-bottom: 5px; text-transform: uppercase;">Points Earned</span>
                <h2 style="margin: 0; color: #00ff96; font-size: 3.5rem; font-weight: 900;">+${finalCalculatedPoints} XP</h2>
              </div>
              <p style="margin-top: 20px; opacity: 0.6; font-style: italic;">"Core Security Restored."</p>
            </div>
          `,
            background: "#080c14",
            width: "500px",
            confirmButtonText: "RETURN TO HQ",
            confirmButtonColor: "#00ff96",
            customClass: {
              popup: "border-2 border-[#00ff9620] rounded-[3rem]",
              confirmButton:
                "rounded-xl px-10 py-3 font-black uppercase tracking-widest",
            },
            allowOutsideClick: false,
          }).then(() => navigate("/challenges"));
        } else {
          setCurrentRoomIdx((prev) => prev + 1);
          setAnswerInput("");
          setActiveHint("");
        }
      } else {
        // إجابة خاطئة
        setTimeLeft((prev) => Math.max(0, prev - 10));
        setIsWrong(true);
        setTimeout(() => setIsWrong(false), 1000);
      }
    } catch (err) {
      console.error("Breach Error:", err);
      // لإظهار سبب الـ 403 (إن التحدي محلول مسبقاً)
      Swal.fire({
        title: "ACCESS_DENIED",
        text: err.response?.data?.message || "Communication Lost",
        icon: "error",
        background: "#080c14",
        color: "#fff",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-5 animate-in fade-in duration-700">
        <div className="relative">
          {/* توهج خلفي يعطي لمسة جمالية */}
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>

          {/* الأيقونة اللي تدور باللون الأزرق */}
          <Loader2
            className="relative z-10 animate-spin text-blue-500"
            size={50}
            strokeWidth={2.5}
          />
        </div>
      </div>
    );
  }

  return (
    <MainLayout activePage="challenge">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <button
          onClick={() => navigate("/challenges")}
          className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full border border-white/10 transition-all focus:outline-none"
        >
          <ArrowLeft size={16} />
        </button>
      </div>

      <div
        className={`flex-1 relative rounded-[3rem] overflow-hidden border border-white/5 bg-[#0a0f1d]/40 backdrop-blur-3xl shadow-2xl flex flex-col mb-4 min-h-[640px]`}
      >
        {/* 2. عرض واجهة Phishing Hunter */}
        {challengeData &&
          challengeData.gameId.gameName === "Phishing Hunter" && (
            <PhishingLayout
              scenario={challengeData.scenarioData}
              userData={currentUser}
              isAnswered={isAnswered}
              selectedAction={selectedAction}
              onAction={handleChallengeSubmit}
              onLinkClick={handleLinkCheck}
              timeLeft={timeLeft}
              points_pool={challengeData.points_pool}
              lives={lives}
              initialLevel={challengeData.points_pool}
            />
          )}

        {/* 2. عرض واجهة Password Breaker */}
        {challengeData &&
          challengeData.gameId.gameName === "Password Maker/Breaker" && (
            <BreakerLayout
              scenario={challengeData.scenarioData}
              timeLeft={timeLeft}
              lives={lives}
              points_pool={challengeData.points_pool}
              breakerInput={breakerInput}
              setBreakerInput={setBreakerInput}
              isChecking={isChecking}
              isAnswered={isAnswered}
              onGuess={(e) => {
                e?.preventDefault();
                handleChallengeSubmit(breakerInput);
              }}
              displayedAnalysis={displayedAnalysis}
            />
          )}

        {/* 3. عرض واجهة secure code */}
        {challengeData &&
          challengeData.gameId.gameName === "Secure Coding Challenge" && (
            <SecureCodingLayout
              scenario={challengeData.scenarioData}
              phase={phase}
              timeLeft={timeLeft}
              points_pool={challengeData.points_pool}
              lives={lives}
              userCode={userCode}
              setUserCode={setUserCode}
              selectedLineIdx={selectedLineIdx}
              feedback={feedback}
              onLineClick={handleLineClick}
              onCodeSubmit={handleSecureSubmit}
              onQuit={() => navigate("/challenges")}
            />
          )}

        {/* 4. عرض واجهة الـ Privacy Awareness */}
        {challengeData &&
          challengeData.gameId.gameName === "Privacy Awareness" && (
            <PrivacyAwarenessLayout
              title={challengeData.title}
              scenario={challengeData.scenarioData}
              selectedIds={selectedIds}
              decisions={decisions}
              timeLeft={timeLeft}
              points_pool={challengeData.points_pool}
              showResult={showResult}
              result={privacyResult}
              retryCount={0} // يمكنك ربطها بـ State المحاولات لو أردتِ
              onAddData={handleAddData}
              onRemoveData={handleRemoveData}
              onUpdateDecision={handleUpdateDecision}
              onSubmit={handlePrivacySubmit}
              onReset={() => {
                setSelectedIds([]);
                setDecisions({});
                setShowResult(false);
              }}
              onQuit={() => navigate("/challenges")}
              onFinish={(data) => {
                // دالة النجاح النهائية
                Swal.fire(
                  "Success",
                  `System Secured with ${data.score}%`,
                  "success",
                ).then(() => navigate("/challenges"));
              }}
            />
          )}

        {/* 5. عرض واجهة الـ Hack Race */}
        {challengeData && challengeData.gameId.gameName === "Hack Race" && (
          <HackRaceLayout
            scenario={
              challengeData.scenarioData.questions[currentQuestionIndex]
            }
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={challengeData.scenarioData.questions.length}
            playerProgress={playerProgress}
            aiProgress={aiProgress}
            timeLeft={timeLeft}
            points_pool={challengeData.points_pool}
            lives={lives}
            initialLevel={challengeData.points_pool}
            isAnswered={isAnswered}
            selectedOptionIndex={selectedOptionIndex}
            showExplanation={showExplanation}
            userData={currentUser} // تأكدي أنcurrentUser يحتوي على characterStyle
            onAnswer={handleHackRaceAnswer}
            onHint={() =>
              Swal.fire({
                title: "Hint",
                text: challengeData.scenarioData.questions[currentQuestionIndex]
                  .explanation,
                icon: "info",
              })
            }
          />
        )}

        {/* 6. عرض واجهة الـ Cyber Escape Room */}
        {challengeData &&
          challengeData.gameId.gameName === "Cyber Escape Room" && (
            <EscapeRoomLayout
              scenario={challengeData.scenarioData.rooms} // المصفوفة كاملة للمكعبات
              currentRoomIdx={currentRoomIdx}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              points_pool={challengeData.points_pool}
              lives={lives}
              currentLevel={challengeData.points_pool}
              answerInput={answerInput}
              setAnswerInput={setAnswerInput}
              onBreach={handleEscapeBreach} // الدالة اللي كتبناها سابقاً للانتقال بين الغرف
              activeHint={activeHint}
              onShowHint={() =>
                setActiveHint(
                  challengeData.scenarioData.rooms[currentRoomIdx].hint,
                )
              }
            />
          )}
      </div>
    </MainLayout>
  );
};

export default ChallengeSolvePage;
