import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";
import {
  Play, ChevronLeft, ChevronRight, DoorOpen, X, Loader2, Zap, 
  User, Users, Trophy, Crown, ShieldCheck, Lock,
} from "lucide-react";
import MainLayout from "../components/MainLayout";
import Swal from "sweetalert2";
import confetti from "canvas-confetti";
import { BASE_URL } from '../api/auth.js';

const getLevelInfo = (level) => {
  if (level > 20) return { label: "MASTERED", color: "#EAB308", bonus: 1000 };
  if (level >= 16) return { label: "EXPERT", color: "#EF4444", bonus: 500 };
  if (level >= 11) return { label: "ADVANCED", color: "#A855F7", bonus: 250 };
  if (level >= 6) return { label: "INTERMEDIATE", color: "#3B82F6", bonus: 100 };
  return { label: "BEGINNER", color: "#10B981", bonus: 50 };
};

const Games = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressIndex, setProgressIndex] = useState(0);
  const [weeklyWins, setWeeklyWins] = useState(0);
  const GAMES_PER_PAGE = 3;
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);
  const [realFriends, setRealFriends] = useState([]);
  const confettiCanvasRef = useRef(null);
  const [modalStep, setModalStep] = useState("mode");
  const [tempMode, setTempMode] = useState(null);
  const [socketOnlineIds, setSocketOnlineIds] = useState([]);

  // 1. سوكيت التسجيل والخصوصية
  useEffect(() => {
    if (!user?._id) return;
    const latestUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    socket.emit("register_user", {
      userId: user._id,
      onlineStatus: user.onlineStatus || latestUser.onlineStatus || 'Public' 
    });

    const handleUpdate = (ids) => {
      console.log("Live IDs from Server:", ids);
      setSocketOnlineIds(ids);
    };

    socket.on("update_online_users_list", handleUpdate);
    return () => socket.off("update_online_users_list", handleUpdate);
  }, [user?._id, user?.onlineStatus]);

  // 2. جلب الأصدقاء
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/social/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRealFriends(res.data);
      } catch (err) { console.error(err); }
    };
    fetchFriends();
  }, []);

  // 3. جلب التحدي الأسبوعي
  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/challenges/weekly`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWeeklyChallenge(res.data);
      } catch (err) { console.log("No active challenge"); }
    };
    fetchWeekly();
  }, []);

  const handleStartWeekly = () => {
    if (!weeklyChallenge) return;

    const game = games.find(g => g._id === weeklyChallenge.gameId);
    
    if (!game) {
        console.error("Game not found for this challenge ID");
        return;
    }

    const gameSlug = game.gameName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    navigate(`/play/${gameSlug}`, {
        state: {
            mode: 'weekly',
            challengeId: weeklyChallenge._id,
            gameId: game._id, 
            initialLevel: weeklyChallenge.challenge_level, 
            requiredWins: weeklyChallenge.required_wins
        }
    });
  };

  const showRankPromotion = (rankInfo, gameName) => {
    Swal.fire({
      title: `<span style="color: #fff; font-size: 1.1rem; font-family: sans-serif; letter-spacing: 2px;">RANK UPWARD!</span>`,
      html: `
        <div style="text-align: center; padding: 5px;">
          <div style="position: relative; width: 90px; height: 90px; margin: 0 auto 15px;">
             <div style="position: absolute; inset: 0; background: ${rankInfo.color}; clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); opacity: 0.15; animation: pulse 2s infinite;"></div>
             <div style="position: absolute; inset: 8px; border: 2px dashed ${rankInfo.color}; clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); animation: spin 15s linear infinite;"></div>
             <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: ${rankInfo.color};">
                <span style="font-size: 30px; filter: drop-shadow(0 0 10px ${rankInfo.color});">💠</span>
             </div>
          </div>
          <p style="color: #8a96a3; font-size: 0.8rem; font-style: italic;">Evolution Detected: ${gameName}</p>
          <h2 style="color: ${rankInfo.color}; font-size: 1.6rem; font-weight: 900; margin: 5px 0;">${rankInfo.label}</h2>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 15px; margin-top: 15px;">
            <span style="color: #EAB308; font-weight: 900; font-size: 0.9rem;">+${rankInfo.bonus} XP MILESTONE BONUS</span>
          </div>
        </div>
      `,
      background: "#050810",
      width: "320px",
      confirmButtonText: "ACKNOWLEDGE",
      confirmButtonColor: rankInfo.color,
      backdrop: `rgba(0,0,0,0.85)`,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        const userResponse = await axios.get(
          `${BASE_URL}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUser(userResponse.data);
        const gamesResponse = await axios.get(
          `${BASE_URL}/games`,
        );
        let gamesData = gamesResponse.data.data;

        const gamesWithLevels = await Promise.all(
          gamesData.map(async (game) => {
            try {
              const lvlRes = await axios.get(
                `${BASE_URL}/games/level/${game._id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              const currentLvl = lvlRes.data.level || 1;
              const lastKnownLvl = localStorage.getItem(
                `lvl_cache_${game._id}`,
              );
              if (lastKnownLvl && parseInt(lastKnownLvl) < currentLvl) {
                const oldInfo = getLevelInfo(parseInt(lastKnownLvl));
                const newInfo = getLevelInfo(currentLvl);
                if (oldInfo.label !== newInfo.label) {
                  showRankPromotion(newInfo, game.gameName);
                }
              }
              localStorage.setItem(
                `lvl_cache_${game._id}`,
                currentLvl.toString(),
              );
              return { ...game, currentLevel: currentLvl };
            } catch (err) {
              return { ...game, currentLevel: 1 };
            }
          }),
        );
        setGames(gamesWithLevels);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredGames = useMemo(() => {
    if (!user) return [];

    const activeOnly = games.filter((game) => game.isActive !== false);

    if (user.isTechnical) return activeOnly;
    return activeOnly.filter(
      (game) => game.category?.toLowerCase() === "non-technical",
    );
  }, [user, games]);

  const nextGames = () => {
    if (filteredGames.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredGames.length);
  };

  const prevGames = () => {
    if (filteredGames.length === 0) return;
    setCurrentIndex(
      (prev) => (prev - 1 + filteredGames.length) % filteredGames.length,
    );
  };

  const nextProgress = () => {
    if (filteredGames.length === 0) return;
    setProgressIndex((prev) => (prev + 1) % filteredGames.length);
  };

  const prevProgress = () => {
    if (filteredGames.length === 0) return;
    setProgressIndex(
      (prev) => (prev - 1 + filteredGames.length) % filteredGames.length,
    );
  };

  const visibleProgress = useMemo(() => {
    if (filteredGames.length === 0) return [];
    const result = [];
    for (let i = 0; i < GAMES_PER_PAGE; i++) {
      const targetIndex = (progressIndex + i) % filteredGames.length;
      result.push(filteredGames[targetIndex]);
    }
    return filteredGames.length < GAMES_PER_PAGE ? filteredGames : result;
  }, [progressIndex, filteredGames]);

  const visibleGames = useMemo(() => {
    if (filteredGames.length === 0) return [];
    const result = [];
    for (let i = 0; i < GAMES_PER_PAGE; i++) {
      const targetIndex = (currentIndex + i) % filteredGames.length;
      result.push(filteredGames[targetIndex]);
    }
    return filteredGames.length < GAMES_PER_PAGE ? filteredGames : result;
  }, [currentIndex, filteredGames]);

  const handleStartGame = async (role = null) => {
    if (!selectedGame) return;
    try {
      setSessionLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/games/session/start`,
        { gameId: selectedGame._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        const sessionId = response.data.sessionId;

        const gameSlug = selectedGame.gameName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");

        navigate(`/play/${sessionId}/${gameSlug}`, {
          state: {
            sessionId,
            mode: "single",
            gameId: selectedGame._id,
            initialLevel: selectedGame.currentLevel || 1,
            initialRole: role
          },
        });
      }
    } catch (error) {
      console.error("Error starting game:", error);
    } finally {
      setSessionLoading(false);
    }
  };

  const getGameStyles = (gameId) => {
    const configs = {
      "69cee7269c67c2d9c0ae20a1": {
        // Privacy Awareness
        img: "/blue.png",
        gradient: "bg-gradient-to-br from-sky-600/40 to-sky-900/10",
        border: "border-sky-500/30",
        glow: "shadow-sky-500/20",
        btn: "bg-sky-500/20 hover:bg-sky-500/40 text-emerald-400",
      },
      "69cee7269c67c2d9c0ae20a2": {
        // Password Maker/Breaker
        img: "/game-key.png",
        gradient: "bg-gradient-to-br from-amber-500/40 to-amber-900/10",
        border: "border-amber-500/30",
        glow: "shadow-amber-500/20",
        btn: "bg-amber-500/20 hover:bg-amber-500/40 text-emerald-400",
      },
      "69cee7269c67c2d9c0ae20a3": {
        // Secure Coding Challenge
        img: "/Secure Coding Challenge.png",
        gradient: "bg-gradient-to-br from-rose-600/40 to-rose-900/10",
        border: "border-rose-500/30",
        glow: "shadow-rose-500/20",
        btn: "bg-rose-500/20 hover:bg-rose-500/40 text-emerald-400",
      },
      "69cee7269c67c2d9c0ae209d": {
        // Phishing Hunter
        img: "/image_1.png",
        gradient: "bg-gradient-to-br from-blue-600/40 to-blue-900/10",
        border: "border-blue-500/30",
        glow: "shadow-blue-500/20",
        btn: "bg-blue-500/20 hover:bg-blue-500/40 text-blue-400",
      },
      "69cee7269c67c2d9c0ae209e": {
        // Firewall Defender
        img: "/game-shield.png",
        gradient: "bg-gradient-to-br from-red-600/40 to-red-900/10",
        border: "border-red-500/30",
        glow: "shadow-red-500/20",
        btn: "bg-red-500/20 hover:bg-red-500/40 text-red-400",
      },
      "69cee7269c67c2d9c0ae20a0": {
        // Hack Race
        img: "/game-runner.png",
        gradient: "bg-gradient-to-br from-emerald-500/40 to-emerald-900/10",
        border: "border-emerald-500/30",
        glow: "shadow-emerald-500/20",
        btn: "bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400",
      },
      "69cee7269c67c2d9c0ae209f": {
        // Cyber Escape Room
        img: "/game-escape.png",
        gradient: "bg-gradient-to-br from-purple-600/40 to-purple-900/10",
        border: "border-purple-500/30",
        glow: "shadow-purple-500/20",
        btn: "bg-purple-500/20 hover:bg-purple-500/40 text-purple-400",
      },
    };
    return configs[gameId] || configs["69cee7269c67c2d9c0ae209d"]; // Default to Phishing
  };

  useEffect(() => {
    const fetchProgress = async () => {
      if (!weeklyChallenge) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BASE_URL}/challenges/weekly/progress`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const currentWins = res.data.currentWins || 0;
        setWeeklyWins(currentWins);

        if (
          currentWins >= weeklyChallenge.required_wins &&
          confettiCanvasRef.current
        ) {
          const myConfetti = confetti.create(confettiCanvasRef.current, {
            resize: true,
            useWorker: true,
          });

          myConfetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: ["#3b82f6", "#10b981", "#fbbf24"],
          });
        }
      } catch (err) {
        console.log("Error fetching progress");
      }
    };
    fetchProgress();
  }, [weeklyChallenge]);

  const handleCreateMultiplayer = async (role = null) => {
    try {
      const sessionId = `GG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${BASE_URL}/multiplayer/create`,
        {
          gameId: selectedGame._id,
          hostRole: role,
          sessionId: sessionId,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.status === 201) {
        navigate(`/waiting-room/${sessionId}`, {
          state: { lobbyData: res.data.lobby , gameName: selectedGame.gameName},
        });
      }
    } catch (err) {
      console.error("Failed to create lobby", err);
    }
  };

  return (
    <MainLayout activePage="games">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {weeklyChallenge &&
          (() => {
            const styles = getGameStyles(weeklyChallenge.gameId);
            const isCompleted = weeklyWins >= weeklyChallenge.required_wins;
            const progressPercent = Math.min(
              (weeklyWins / weeklyChallenge.required_wins) * 100,
              100,
            );

            return (
              <div className="relative mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
                <h3 className="text-white text-[15px]  font-bold  uppercase tracking-[0.5em] mb-4 ml-4 italic">
                  Weekly Challenge
                </h3>

                <div className="flex items-stretch gap-4">
                  <div
                    className={`flex-[6] relative overflow-hidden rounded-[2rem] bg-gradient-to-r ${styles.gradient} backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 min-h-[220px] flex items-center group transition-all`}
                  >
                    <canvas
                      ref={confettiCanvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none z-0"
                    />
                    <div className="absolute top-5 right-8 bg-black/30 backdrop-blur-md border border-white/5 px-4 py-1 rounded-full flex items-center gap-2">
                      <span className="text-[10px] font-black text-blue-300 uppercase">
                        Get {weeklyChallenge.points_reward} XP
                      </span>
                      <Zap size={12} className="text-yellow-400 fill-current" />
                    </div>

                    <div className="flex items-center w-full relative z-10 gap-10">
                      <div className="w-[25%] flex justify-center items-center opacity-80 group-hover:opacity-60 transition-opacity">
                        <Trophy
                          size={140}
                          strokeWidth={1}
                          className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-center items-center text-center">
                        {" "}
                        <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2 leading-tight">
                          {weeklyChallenge.title}
                        </h2>
                        <p className="text-white/70 text-base font-medium mb-8 max-w-xl opacity-80 italic">
                          {weeklyChallenge.description}
                        </p>
                        {isCompleted ? (
                          <div className="mx-auto px-12 py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-black uppercase italic text-xs flex items-center justify-center gap-4 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <ShieldCheck size={18} className="animate-pulse" />
                            <span>Mission Accomplished</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleStartWeekly}
                            className="mx-auto px-12 py-4 bg-white text-black hover:bg-black hover:text-white rounded-full font-black uppercase italic text-xs transition-all flex items-center justify-center gap-4 group shadow-2xl active:scale-95 mb-4"
                          >
                            <Play size={16} fill="currentColor" />
                            <span>Start Challenge Now</span>
                          </button>
                        )}
                        <div className="w-full max-w-3xl">
                          <div className="flex justify-between items-center mb-2 px-2">
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">
                              Mission Progress
                            </span>
                            <span className="text-[11px] font-black text-white italic bg-white/10 px-3 py-0.5 rounded-lg border border-white/5">
                              {weeklyWins} <span className="opacity-30">/</span>{" "}
                              {weeklyChallenge.required_wins} WINS
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-white rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                {/* 👥 Squad SideBar - Socket.io Real-Time Edition */}
                      <div className="w-16 flex flex-col justify-center items-center gap-5 bg-black/20 rounded-[2.5rem] border border-white/5 py-8 backdrop-blur-md shadow-2xl">
                        
                        <div className="w-11 h-11 rounded-full border-2 border-blue-500 overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-transform hover:scale-105">
                          <img
                            src={user?.characterStyle?.startsWith("/") ? user.characterStyle : `/${user?.characterStyle || "Avatar.png"}`}
                            className="w-full h-full object-cover"
                            alt="Me"
                          />
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <Users size={16} className="text-[#ff3b6b]" />
                          <div className="w-4 h-[1px] bg-white/50"></div>
                        </div>

                        <div className="flex flex-col gap-4">
                          {(() => {
                            const liveFriends = realFriends.filter(f => socketOnlineIds.includes(f._id));

                              return liveFriends.slice(0, 3).map((friend) => (
                                <div key={friend._id} className="relative group/avatar">
                                <div className="w-10 h-10 rounded-full border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] overflow-hidden transition-all duration-500">
                                  <img
                                    src={friend.characterStyle?.startsWith("/") ? friend.characterStyle : `/${friend.characterStyle || "Avatar.png"}`}
                                    className="w-full h-full object-cover"
                                    alt={friend.username}
                                  />
                                </div>
                                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0b1224] rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0f172a] border border-white/10 text-white text-[10px] font-black italic uppercase tracking-widest rounded-lg opacity-0 group-hover/avatar:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-50 shadow-2xl">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                    {friend.username}
                                  </div>
                                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#0f172a] border-l border-b border-white/10 rotate-45"></div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>

                        {(() => {
                          const liveOnlineCount = realFriends.filter(f => socketOnlineIds.includes(f._id)).length;
                          return liveOnlineCount > 3 && (
                            <div className="w-9 h-9 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center shadow-inner">
                              <span className="text-[10px] font-black text-white/20 tracking-tighter">
                                +{liveOnlineCount - 3}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                </div>
              </div>
            );
          })()}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Available Games</h2>
        </div>
        <div className="relative group/carousel px-4">
          <button
            onClick={prevGames}
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-[#1c2438]/80 border border-gray-700 text-gray-400 hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            <ChevronLeft size={32} strokeWidth={2.5} />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {loading ? (
              <div className="col-span-3 flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={48} />
              </div>
            ) : (
              visibleGames.map((game, idx) => {
                const styles = getGameStyles(game._id);
                const isMastered = game.currentLevel > 20;

                const gameRoute = game.gameName
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-");
                const customPosition =
                  gameRoute === "phishing-hunter"
                    ? "-right-8 -bottom-8"
                    : "-right-8 -bottom-4";

                return (
                  <GameCardPopOut
                    key={`${game._id}-${idx}`}
                    title={game.gameName}
                    desc={
                      isMastered
                        ? "Legendary Hero! Mission complete."
                        : game.description
                    }
                    level={game.currentLevel || 1}
                    gradient={styles.gradient}
                    borderColor={
                      isMastered ? "border-yellow-500/50" : styles.border
                    }
                    bgImage={styles.img}
                    btnStyle={styles.btn}
                    imageSize="w-48"
                    imagePosition={customPosition}
                    onPlayClick={() => {
                      setSelectedGame(game);
                      setIsModalOpen(true);
                    }}
                    isMastered={isMastered}
                  />
                );
              })
            )}
          </div>
          <button
            onClick={nextGames}
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-[#1c2438]/80 border border-gray-700 text-gray-400 hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            <ChevronRight size={32} strokeWidth={2.5} />
          </button>
        </div>

        <div className="mt-16 pb-12">
          <h2 className="text-3xl font-bold mb-10 text-white">Your Progress</h2>

          <div className="relative group/progress px-4 max-w-6xl mx-auto">
            <button
              onClick={prevProgress}
              className="absolute -left-12 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/progress:opacity-100 backdrop-blur-md"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex justify-around items-center gap-4 min-h-[200px]">
              {visibleProgress.map((game, idx) => {
                const styles = getGameStyles(game.gameId || game._id);
                const info = getLevelInfo(game.currentLevel || 1);

                return (
                  <div
                    key={`${game._id}-${idx}`}
                    className="animate-in fade-in zoom-in duration-500"
                  >
                    <LevelCircle
                      title={game.gameName}
                      level={game.currentLevel || 1}
                      color={info.color}
                      icon={
                        game.currentLevel > 20 ? (
                          <Crown size={45} strokeWidth={1.2} />
                        ) : (
                          <DoorOpen size={45} strokeWidth={1.2} />
                        )
                      }
                      label={info.label}
                    />
                  </div>
                );
              })}
            </div>

            <button
              onClick={nextProgress}
              className="absolute -right-12 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/progress:opacity-100 backdrop-blur-md"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {isModalOpen && selectedGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setIsModalOpen(false);
                setModalStep("mode");
              }}
            ></div>

            <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#1e293b]/90 to-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setModalStep("mode");
                }}
                className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-4xl font-extrabold text-center text-white mb-2">
                {selectedGame.gameName}
              </h2>

              {modalStep === "mode" && (
                <div className="animate-in fade-in duration-500">
                  <p className="text-center text-blue-300 mb-12 font-medium">
                    {selectedGame.currentLevel > 20
                      ? "MISSION CONQUERED 🏆"
                      : `Select Mission Mode for Level ${selectedGame.currentLevel || 1}`}
                  </p>

                  <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
                    <div
                      onClick={() => {
                        if (
                          selectedGame.gameName === "Password Maker/Breaker"
                        ) {
                          setTempMode("single");
                          setModalStep("role");
                        } else {
                          handleStartGame(); // الدالة الأصلية حقتك لبدء السنقل
                        }
                      }}
                      className={`flex-1 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center transition-all shadow-lg hover:border-blue-400/30 ${sessionLoading ? "cursor-wait opacity-50" : "cursor-pointer hover:scale-105 hover:bg-white/15"}`}
                    >
                      <div className="w-24 h-24 mb-6">
                        <User
                          size={80}
                          strokeWidth={1.5}
                          className="text-white"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Single Player
                      </h3>
                      <p className="text-gray-400 text-sm font-medium">
                        {selectedGame.currentLevel > 20
                          ? "Replay for Fun"
                          : "Start your mission"}
                      </p>
                    </div>

                    {[
                      "Secure Coding Challenge",
                      "Hack Race",
                      "Cyber Escape Room",
                      "Password Maker/Breaker",
                    ].includes(selectedGame.gameName) ? (
                      <div
                        onClick={() => {
                          if (
                            selectedGame.gameName === "Password Maker/Breaker"
                          ) {
                            setTempMode("multiplayer"); 
                            setModalStep("role"); 
                          } else {
                            handleCreateMultiplayer(); 
                          }
                        }}
                        className="flex-1 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center cursor-pointer hover:scale-105 hover:border-blue-400/30 hover:bg-white/15 transition-all shadow-lg"
                      >
                        <div className="w-24 h-24 mb-6">
                          <Users
                            size={80}
                            strokeWidth={1.5}
                            className="text-white"
                          />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Multiplayer
                        </h3>
                        <p className="text-gray-400 text-sm font-medium tracking-tight">
                          Challenge Friends & Compete
                        </p>
                      </div>
                    ) : (
                      /* وضع القفل للألعاب التي لا تدعم ملتي بلاير */
                      <div className="flex-1 bg-white/5 opacity-30 cursor-not-allowed border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center">
                        <Users
                          size={80}
                          strokeWidth={1.5}
                          className="text-gray-500 mb-6"
                        />
                        <h3 className="text-2xl font-bold text-gray-500 mb-2">
                          Multiplayer
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Locked for this game
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {modalStep === "role" && (
                <div className="animate-in slide-in-from-right duration-500 text-center">
                  <p className="text-center text-blue-300 mb-12 font-medium">
                    Select Protocol Role
                  </p>
                  <div className="flex gap-6 justify-center mb-10">
                    {/* اختيار Maker */}
                    <button
                      onClick={() => {
                        if (tempMode === "single") {
                          handleStartGame("maker"); // يروح للبلاي قيم
                        } else {
                          //   const sessionId = `GG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                          //   navigate(`/waiting-room/${sessionId}`, {
                          //     state: {
                          //       gameId: selectedGame._id,
                          //       gameName: selectedGame.gameName,
                          //       mode: "multiplayer",
                          //       initialRole: "maker",
                          //     },
                          //   });

                          handleCreateMultiplayer("maker"); // أنشئ الغرفة مع تحديد الدور كـ Maker
                        }
                      }}
                      className="group flex flex-col items-center gap-4 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl hover:bg-emerald-500 hover:text-black transition-all w-48 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    >
                      <ShieldCheck
                        size={40}
                        className="text-emerald-500 group-hover:text-black"
                      />
                      <span className="text-2xl font-bold uppercase">
                        Maker
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        if (tempMode === "single") {
                          handleStartGame("breaker");
                        } else {
                          // const sessionId = `GG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                          // navigate(`/waiting-room/${sessionId}`, {
                          //   state: {
                          //     gameId: selectedGame._id,
                          //     gameName: selectedGame.gameName,
                          //     mode: "multiplayer",
                          //     initialRole: "breaker",
                          //   },
                          // });
                          handleCreateMultiplayer("breaker");
                        }
                      }}
                      className="group flex flex-col items-center gap-4 p-8 bg-red-500/5 border border-red-500/20 rounded-3xl hover:bg-red-500 hover:text-black transition-all w-48 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    >
                      <Lock
                        size={40}
                        className="text-red-500 group-hover:text-black"
                      />
                      <span className="text-2xl font-bold uppercase">
                        Breaker
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() => setModalStep("mode")}
                    className=" bg-slate-800 text-[10px] text-gray-400 hover:text-white uppercase font-bold tracking-widest transition-colors"
                  >
                    ← Back to Mode Selection
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.15; } 50% { transform: scale(1.05); opacity: 0.25; } }
      `}</style>
      </div>
    </MainLayout>
  );
};

const LevelCircle = ({ title, level, color, icon, label }) => {
  const isMastered = level > 20;
  return (
    <div className="flex flex-col items-center gap-6 group">
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full border-[3px] flex items-center justify-center transition-all duration-700 group-hover:scale-110 relative ${isMastered ? "mastered-glow" : ""}`}
          style={{
            borderColor: color,
            boxShadow: `0 0 20px ${color}33, inset 0 0 15px ${color}22`,
            background: isMastered
              ? `radial-gradient(circle, ${color}20 0%, transparent 70%)`
              : `radial-gradient(circle, ${color}05 0%, transparent 70%)`,
          }}
        >
          <div
            style={{ color: color, filter: `drop-shadow(0 0 8px ${color}aa)` }}
          >
            {icon}
          </div>
        </div>
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="relative px-4 py-1 flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-[#050810] skew-x-[-12deg] border border-white/10 shadow-xl"></div>
            <span
              className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] leading-tight"
              style={{ color: color }}
            >
              {label}
            </span>
            {!isMastered && (
              <span className="relative z-10 text-[9px] font-bold text-white/80 uppercase tracking-tighter mt-0.5">
                Level {level}
              </span>
            )}
          </div>
        </div>
      </div>
      <h4 className="font-black text-white text-xs uppercase tracking-[0.15em] opacity-70 transition-opacity duration-300 group-hover:opacity-100">
        {title}
      </h4>
    </div>
  );
};

// 🟢 التعديل الإبداعي للختم (Mastered Badge) هنا في هذا المكون
// 🟢 التعديل: حولنا الأقواس () إلى بلوك {} لكي نستطيع تعريف المتغيرات بالداخل
const GameCardPopOut = ({
  title,
  desc,
  gradient,
  borderColor,
  level,
  bgImage,
  btnStyle,
  imageSize,
  imagePosition,
  onPlayClick,
  isMastered,
}) => {
  // 1. التعريف يجب أن يكون هنا (قبل الـ return)
  const rank = getLevelInfo(level || 1);

  return (
    <div
      className={`relative rounded-[2.5rem] ${gradient} backdrop-blur-md border ${borderColor} p-8 flex flex-col h-[420px] shadow-2xl group transition-all duration-500 hover:scale-[1.02] overflow-visible ${isMastered ? "mastered-card" : ""}`}
    >
      {/* 🏆 الختم التكتيكي الإبداعي (يظهر عند الماسترد) */}
      {isMastered && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none rounded-[2.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]" />

          <div className="relative flex flex-col items-center gap-2 bg-gradient-to-b from-yellow-400 to-orange-600 p-6 rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.5)] border border-white/30 transform -rotate-12 group-hover:rotate-0 transition-all duration-700 animate-in zoom-in">
            <Trophy
              size={48}
              className="text-white drop-shadow-lg"
              fill="currentColor"
            />
            <div className="flex flex-col items-center leading-none">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">
                Mission
              </span>
              <span className="text-2xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                Mastered
              </span>
            </div>
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/40" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/40" />
          </div>

          <div className="absolute top-8 -right-12 bg-yellow-500 text-black font-black py-1 px-12 rotate-45 shadow-2xl text-[10px] uppercase tracking-widest border-y border-black/10">
            Top Agent
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full items-center justify-center text-center pb-12">
        <h3 className="text-3xl font-extrabold mb-3 text-white drop-shadow-md tracking-tight leading-tight">
          {title}
        </h3>
        <p className="text-white/95 text-sm font-medium leading-relaxed px-1 mb-8">
          {desc}
        </p>

        <button
          onClick={onPlayClick}
          className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 backdrop-blur-sm transition-all active:scale-95 shadow-lg border border-white/10 ${isMastered ? "bg-yellow-600/90 text-black border-yellow-400" : `${btnStyle} text-white`}`}
        >
          {isMastered ? (
            <Trophy size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
          {isMastered ? "Mission Review" : "Play Now"}
        </button>
      </div>

      {/* 🏅 وسام المستوى المصغر - تصميم نيون صافي */}
      <div
        className="absolute bottom-5 left-5 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-1 rounded-xl border transition-all duration-300 shadow-lg"
        style={{
          borderColor: `${rank.color}30`, // حدود أنحف وأكثر شفافية
          boxShadow: `0 0 12px ${rank.color}15`,
        }}
      >
        <div className="relative flex items-center justify-center">
          <Zap
            size={10}
            className="animate-pulse z-10"
            style={{
              color: "#FACC15",
              fill: "#FACC15",
              filter: "drop-shadow(0 0 5px #FACC15)",
            }}
          />
        </div>

        <span className="text-[15px] font-black text-white/90 tracking-tighter italic leading-none">
          {isMastered ? "MAX" : `LEVEL ${level.toString()}`}
        </span>
      </div>
      {/* 🖼️ الصورة (w-64) */}
      <div
        className={`absolute ${imagePosition} z-30 transition-transform duration-700 group-hover:scale-110 -translate-y-2`}
      >
        <img
          src={bgImage}
          alt={title}
          className={`${imageSize} object-contain select-none pointer-events-none drop-shadow-2xl`}
        />
      </div>

      <style>{`
                .mastered-card { border-color: rgba(234, 179, 8, 0.6) !important; }
                .mastered-glow { animation: border-pulse 2s infinite; }
                @keyframes border-pulse { 0% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.2); } 50% { box-shadow: 0 0 35px rgba(234, 179, 8, 0.5); } 100% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.2); } }
            `}</style>
    </div>
  );
};

export default Games;
