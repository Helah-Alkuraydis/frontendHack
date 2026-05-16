import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { ArrowLeft, Trophy, Zap, Loader2, Lock, Crown, ShieldCheck } from "lucide-react";
import MainLayout from '../components/MainLayout';
import PhishingHunter from '../components/games/PhishingHunter';
import HackRace from '../components/games/hack-race/HackRace';
import FirewallDefender from '../components/games/FirewallDefender';
import PrivacyAwareness from '../components/games/PrivacyAwareness';
import PasswordMakerBreaker from '../components/games/password-game/PasswordMakerBreaker';
import SecureCodingChallenge from '../components/games/SecureCodingChallenge';
import CyberEscapeRoom from '../components/games/EscapeRoom/CyberEscapeRoom';
import EscapeRoleSelector from '../components/games/EscapeRoom/EscapeRoleSelector'; 
import { socket } from "../socket";
import Swal from "sweetalert2";
import MultiplayerEscapeRoom from '../components/games/EscapeRoom/MultiplayerEscapeRoom';
import { BASE_URL } from '../api/auth.js';

const getLevelCategory = (level: number) => {
  if (level > 20) return { label: "MASTERED", color: "text-yellow-400" };
  if (level >= 16) return { label: "EXPERT", color: "text-red-500" };
  if (level >= 11) return { label: "ADVANCED", color: "text-purple-500" };
  if (level >= 6) return { label: "INTERMEDIATE", color: "text-blue-400" };
  return { label: "BEGINNER", color: "text-emerald-400" };
};

const getGameStyles = (gameId: string) => {
  const configs: Record<string, { img: string; btnGradient: string; description: string; gradient: string; border: string; glow: string }> = {
    "69cee7269c67c2d9c0ae209d": {
      img: "/image_1.png",
      btnGradient: "bg-gradient-to-r from-blue-600 to-cyan-400",
      gradient: "from-blue-600/40 to-blue-900/10",
      border: "border-blue-500/30",
      glow: "shadow-blue-500/20",
      description: "Identify safe from malicious emails by analyzing sender address, links, and language urgency"
    },
    "69cee7269c67c2d9c0ae209e": {
      img: "/game-shield.png",
      btnGradient: "bg-gradient-to-r from-orange-500 to-red-600",
      gradient: "from-red-600/40 to-red-900/10",
      border: "border-red-500/30",
      glow: "shadow-red-500/20",
      description: "Defend a digital network from moving cyberattacks by deploying specialized defensive tools"
    },
    "69cee7269c67c2d9c0ae209f": {
      img: "/game-escape.png",
      btnGradient: "bg-gradient-to-r from-purple-500 to-purple-700",
      gradient: "from-purple-600/40 to-purple-900/10",
      border: "border-purple-500/30",
      glow: "shadow-purple-500/20",
      description: "Collaborative multiplayer game to escape a breached network by solving four security puzzles in 10 minutes"
    },
    "69cee7269c67c2d9c0ae20a0": {
      img: "/game-runner.png",
      btnGradient: "bg-gradient-to-br from-emerald-500 to-emerald-700",
      gradient: "from-emerald-500/40 to-emerald-900/10",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/20",
      description: "Fast-paced scenario-based game to choose the best response to cybersecurity threats under pressure"
    },
    "69cee7269c67c2d9c0ae20a2": {
      img: "/game-key.png",
      btnGradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      gradient: "from-amber-500/40 to-amber-900/10",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/20",
      description: "Learn to create strong passwords and understand how weak ones are exploited via cracking simulations"
    },
    "69cee7269c67c2d9c0ae20a3": {
      img: "/Secure Coding Challenge.png",
      btnGradient: "bg-gradient-to-br from-rose-600 to-rose-800",
      gradient: "from-rose-600/40 to-rose-900/10",
      border: "border-rose-500/30",
      glow: "shadow-rose-500/20",
      description: "Analyze code snippets to find and fix vulnerabilities like SQL Injection and XSS"
    },
    "69cee7269c67c2d9c0ae20a1": {
      img: "/blue.png",
      btnGradient: "bg-gradient-to-br from-blue-400 to-blue-600",
      gradient: "from-sky-600/40 to-sky-900/10",
      border: "border-sky-500/30",
      glow: "shadow-sky-500/20",
      description: "Learn sensitive data handling and storage principles for database and system design"
    },
  };

  return configs[gameId] || {
    img: "/image_1.png",
    btnGradient: "bg-gradient-to-r from-gray-500 to-gray-700",
    gradient: "from-gray-600/40 to-gray-900/10",
    border: "border-gray-500/30",
    glow: "shadow-gray-500/20",
    description: "Start your cybersecurity mission and protect the digital world."
  };
};

const PlayGame = () => {
  const { sessionId: urlSessionId, gameSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId: stateSessionId, gameId: stateGameId, mode: stateMode, initialRole: stateInitialRole } = location.state || {};
  const sessionId = urlSessionId || stateSessionId;
  const mode = stateMode || (urlSessionId?.startsWith('GG-') ? "multiplayer" : "single");
  const [dbGame, setDbGame] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(mode === 'weekly');
  const [currentLevel, setCurrentLevel] = useState(1);
  
  const [chosenRole, setChosenRole] = useState<'maker' | 'breaker' | null>(null);
  const [myRole, setMyRole] = useState<'maker' | 'breaker' | null>(null);
  const [lobbyData, setLobbyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbSessionId, setDbSessionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const { mode, initialLevel } = location.state || {}; 

        const gamesRes = await axios.get(`${BASE_URL}/games`);
        const currentGame = gamesRes.data.data.find((g: any) => {
          const currentSlug = g.gameName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return g._id === stateGameId || currentSlug === gameSlug;
        });
        setDbGame(currentGame);

        if (currentGame) {
          if (mode === 'weekly' && initialLevel) {
            setCurrentLevel(initialLevel);
          } else {
            const res = await axios.get(`${BASE_URL}/games/level/${currentGame._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentLevel(res.data.level || 1);
          }
        }

        const userRes = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userRes.data);

        if (mode === 'weekly' || mode === 'multiplayer') {
          setIsPlaying(true);
        }

      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };

    fetchData();
  }, [gameSlug, stateGameId]);

  const handleGameFinish = async (results: any) => {
    try {
      const token = localStorage.getItem('token');
      const { mode, challengeId } = location.state || {};
      
      if (results.status === 'QUIT') {
        navigate('/games');
        return;
      }

      if (mode === 'weekly') {
        await axios.post(`${BASE_URL}/challenges/weekly/${challengeId}/solve`, {
          status: results.status
        }, { headers: { Authorization: `Bearer ${token}` } });

        setTimeout(() => navigate('/games'), 1500);
      } else {
        const isRoomCode = sessionId?.toString().startsWith('GG-');
        const validSessionId = dbSessionId || (isRoomCode ? null : sessionId);

        if (validSessionId) {
            await axios.post(`${BASE_URL}/games/submit`, {
              sessionId: validSessionId,
              score: results.score,
              status: results.status,
              duration: results.duration,
              mistakesCount: results.mistakesCount || 0
            }, { headers: { Authorization: `Bearer ${token}` } });
    
            console.log(`Mission Logged: ${results.status} saved to database.`);
        } else {
            console.log("Skipping generic DB submit for multiplayer room code.");
        }

        if (results.status.toLowerCase() === 'win') {
          await axios.post(`${BASE_URL}/games/level/up`,
            { gameId: dbGame?._id, status: 'win' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        
        setTimeout(() => navigate('/games'), 1500);
      }

    } catch (err) {
      console.error("Sync Failure:", err);
      setTimeout(() => navigate('/games'), 1500);
    }
  };

  const styles = getGameStyles(dbGame?._id);
  const category = getLevelCategory(currentLevel);

  useEffect(() => {
    if (mode !== "multiplayer" || !sessionId) {
      setLoading(false);
      return;
    }

    const fetchLobbyAndRole = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/multiplayer/lobby/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const lobby = res.data;
        setLobbyData(lobby);

        const userData = JSON.parse(localStorage.getItem("user") || "{}");

        const me = lobby.players.find((p: any) => p.user.toString() === userData._id);

        if (me) {
          setMyRole(me.role as 'maker' | 'breaker');
        }
      } catch (err) {
        console.error("Error fetching game session:", err);
        Swal.fire("Error", "Could not load mission data.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchLobbyAndRole();
  }, [sessionId, mode]);

useEffect(() => {
    const initSession = async () => {
        if (mode === 'multiplayer' && isPlaying && dbGame?._id) {
            try {
                const token = localStorage.getItem('token');
                
                const ESCAPE_GAME_ID = "69cee7269c67c2d9c0ae209f";
                if (dbGame?._id?.toString() === "69cee7269c67c2d9c0ae20a3") { 
                  console.log("💻 Secure Coding API initialization skipped. Using internal logic.");
                     return; 
                }
                
                let endpoint = '';
                if (dbGame._id.toString() === ESCAPE_GAME_ID) {
                    endpoint = '/api/games/escape/start';
                    console.log("🛡️ Routing to: Escape Room API");
                } else {
                    endpoint = '/api/games/password/start-session';
                    console.log("🔐 Routing to: Password Game API");
                }

                const res = await axios.post(`http://localhost:5000${endpoint}`, 
                    { gameId: dbGame._id }, 
                    { 
                        headers: { 
                            Authorization: `Bearer ${token}` 
                        } 
                    }
                );

                if (res.data.success) {
                    setDbSessionId(res.data.sessionId);
                    console.log(`✅ Session synchronized successfully:`, res.data.sessionId);
                }

            } catch (err) {
                console.error("❌ API Initialization Error:", err);
            }
        }
    };

    initSession();
    
}, [isPlaying, mode, dbGame?._id]);

 useEffect(() => {
    if (mode !== "multiplayer" || !sessionId) return;

    const joinMissionRoom = () => {
      console.log("📡 Requesting to join room:", sessionId);
      socket.emit("join_room", sessionId);
    };

    socket.on("connect", joinMissionRoom);

    if (socket.connected) {
      joinMissionRoom();
    } else {
      console.log("🔌 Socket asleep. Waking it up...");
      socket.connect(); 
    }

    socket.on("game_roles_updated", (updatedPlayers: any) => {
      console.log("🎮 Roles updated in-game:", updatedPlayers);
      setLobbyData((prev: any) => {
        const ESCAPE_ROOM_ID = "69cee7269c67c2d9c0ae209f";
        if (prev?.gameId === ESCAPE_ROOM_ID) {
          return { ...prev, players: updatedPlayers };
        }
        return prev;
      });
      const me = updatedPlayers.find((p: any) => p.user.toString() === userData?._id);
      if (me) {
        setMyRole(me.role && me.role !== 'none' ? me.role : 'none');
      }
    });

    socket.on("player_left", () => {
      Swal.fire("Mission Aborted", "The other agent disconnected.", "warning");
    });

    return () => {
      socket.off("connect", joinMissionRoom);
      socket.off("player_left");
      socket.off("game_roles_updated");
    };
  }, [sessionId, mode, userData?._id]);

  useEffect(() => {
    if (mode !== "multiplayer" || !sessionId) return;

    const handleReturnToLobby = (results: any) => {
      console.log("🔙 Returning to lobby with results:", results);
      console.log("🕵️ My Role when returning:", myRole);
      
      navigate(`/waiting-room/${sessionId}`, { 
        state: { 
            matchResults: results,
            myRole: myRole,
            gameSlug: gameSlug,
            gameId: dbGame?._id,
            dbSessionId: dbSessionId
        },
        replace: true
      });
    };

    socket.on("return_to_lobby_with_results", handleReturnToLobby);

    return () => {
      socket.off("return_to_lobby_with_results", handleReturnToLobby);
    };
  }, [sessionId, mode, myRole, gameSlug, dbGame?._id, dbSessionId, navigate]);

  const isEscapeRoom = dbGame?._id === "69cee7269c67c2d9c0ae209f";
  const isSecureCoding = dbGame?._id === "69cee7269c67c2d9c0ae20a3";
if (loading || (mode === 'multiplayer' && !myRole && !isEscapeRoom && !isSecureCoding)) {
      return (
      <div className="flex h-screen items-center justify-center text-white flex-col gap-4">
        <Loader2 size={40} className="animate-spin text-emerald-500" />
        <span className="font-mono text-sm tracking-widest text-emerald-500/80 uppercase animate-pulse">
          Establishing Secure Role...
        </span>
      </div>
    );
  }

const handleRoleSelect = (roleName: string) => {
    if (!userData?._id || !sessionId) return;
    
    console.log(`📤 Picking role: ${roleName}`);
    socket.emit("game_pick_role", { 
        sessionId, 
        roleName, 
        userId: userData._id 
    });
};

  return (
    <MainLayout activePage="games">
        {mode !== 'multiplayer' && (
          <div className="flex justify-between items-center mb-6 relative z-10 px-2 md:px-0">
            <button 
              onClick={() => navigate("/games")} 
              className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full border border-white/10 transition-all focus:outline-none"
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        )}

      {/* 🔥 التعديل هنا: صغرنا البوردر راديوس وخلينا min-height يتجاوب مع الجوال */}
      <div className={`flex-1 relative rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/5 bg-[#0a0f1d]/40 backdrop-blur-3xl shadow-2xl flex flex-col mb-4 min-h-[500px] md:min-h-[640px] mx-2 md:mx-0`}>

        {
          (!isPlaying && mode !== 'weekly' && mode !== 'multiplayer') ? (
            /* 🔥 التعديل هنا: flex-col للجوال و flex-row للابتوب + ترتيب المسافات */
            <div className={`flex flex-col-reverse md:flex-row h-full px-6 md:px-20 items-center justify-center gap-8 md:gap-10 z-10 animate-in fade-in duration-1000 md:translate-y-20 py-12 md:pb-40 text-center md:text-left`}>
              
              <div className="flex flex-col justify-center h-full space-y-5 md:space-y-6 w-full md:w-auto">
                <div className="space-y-3 md:space-y-4 animate-in slide-in-from-left duration-1000 flex flex-col items-center md:items-start">
                  
                  <div className={`flex items-center gap-2 ${category.color} font-mono text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/10`}>
                    {currentLevel > 20 ? <Crown size={14} /> : <Trophy size={14} />}
                    {currentLevel > 20 ? "MISSION CONQUERED" : `${category.label} - LEVEL: ${currentLevel}`}
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-black italic uppercase text-white leading-[1.1] tracking-tighter w-full">{dbGame?.gameName.toUpperCase()}</h1>
                  
                  <p className="text-gray-400 text-xs md:text-base max-w-sm italic border-l-2 md:border-l-4 border-white/10 pl-3 md:pl-5 opacity-80 leading-relaxed">
                    {styles.description}
                  </p>
                </div>
                
                <button onClick={() => setIsPlaying(true)} className={`w-full md:w-auto px-8 py-3.5 md:px-14 md:py-5 rounded-full font-black text-sm md:text-xl text-white hover:scale-105 transition-all shadow-lg focus:outline-none uppercase italic tracking-widest ${styles.btnGradient}`}>
                  {currentLevel > 20 ? "Replay Mastered" : "Deploy Mission"}
                </button>
              </div>
              
              <div className="flex justify-center items-center h-full relative mt-6 md:mt-0 md:translate-y-10">
                <img src={styles.img} alt="Game Icon" className="relative w-48 md:w-[380px] drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-float" />
              </div>
            </div>
          ) : (
            /* 2. هنا الجزء الثاني (بدأ اللعب أو وضع التحدي الأسبوعي) */
            <>
              {(!dbGame || !userData) ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-blue-400">
                  <Loader2 className="animate-spin" size={48} />
                  <p className="font-mono text-xs tracking-widest animate-pulse text-center px-4">SYNCHRONIZING CHALLENGE DATA...</p>
                </div>
              ) : (
                <>
                  {dbGame?._id?.toString() === "69cee7269c67c2d9c0ae209d" && (<PhishingHunter
                    gameId={dbGame?._id} sessionId={sessionId}
                    initialLevel={currentLevel > 20 ? 20 : currentLevel}
                    userData={userData}
                    navigate={navigate}
                    mode={location.state?.mode}
                    onFinish={handleGameFinish}
                  />
                  )}


                  {dbGame?._id?.toString() === "69cee7269c67c2d9c0ae20a2" && (isPlaying || mode === 'weekly' || mode === 'multiplayer') && (
                    <PasswordMakerBreaker
                      gameId={dbGame?._id || ''}
                      sessionId={sessionId || ''}
                      initialLevel={currentLevel}
                      userData={userData}
                      navigate={navigate}
                      mode={mode}
                      onFinish={handleGameFinish}
                      initialRole={mode === 'multiplayer' ? myRole : stateInitialRole}
                    />
                  )}


                  {dbGame?._id?.toString() === "69cee7269c67c2d9c0ae20a0" && (
                    <HackRace
                      gameId={dbGame?._id}
                      sessionId={sessionId}
                      initialLevel={currentLevel > 20 ? 20 : currentLevel}
                      userData={userData}
                      navigate={navigate}
                      mode={location.state?.mode}
                      onFinish={handleGameFinish}

                    />
                  )}

                  {dbGame?._id?.toString() === "69cee7269c67c2d9c0ae209e" && (
                    <FirewallDefender
                      initialLevel={currentLevel}
                      mode={location.state?.mode}
                      onFinish={handleGameFinish}
                    />
                  )}

                  {dbGame?._id?.toString() === "69cee7269c67c2d9c0ae20a1" && (
                    <PrivacyAwareness
                      initialLevel={currentLevel}
                      mode={location.state?.mode}
                      onFinish={handleGameFinish}
                    />
                  )}
                 {dbGame?._id?.toString() === "69cee7269c67c2d9c0ae20a3" && (
                   <SecureCodingChallenge
                       gameId={dbGame?._id}
                        sessionId={sessionId}
                        level={currentLevel > 20 ? 20 : currentLevel}
                        mode={mode}
                        isHost={lobbyData?.host === userData?._id || lobbyData?.players?.[0]?.user === userData?._id || location.state?.isHost}
                      onFinish={handleGameFinish}
                       />
                  )}

                {dbGame?._id?.toString() === "69cee7269c67c2d9c0ae209f" && (
                  mode === 'multiplayer' ? (
                    <MultiplayerEscapeRoom 
                      sessionId={sessionId} 
                      userData={userData} 
                      myRole={myRole} 
                    />
                  ) : (
                    <CyberEscapeRoom
                      gameId={dbGame?._id}
                      sessionId={sessionId}
                      initialLevel={currentLevel > 20 ? 20 : currentLevel}
                      mode={location.state?.mode}
                      onFinish={handleGameFinish}
                    />
                  )
                )}

                </>
              )}

            </>
          )}
      </div>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

        {mode === 'multiplayer' && 
        isEscapeRoom && 
        lobbyData?.players && 
        lobbyData.players.some((p: any) => !p.role || p.role === 'none') && (
          <EscapeRoleSelector 
              players={lobbyData.players}
              onSelect={handleRoleSelect}
              currentUserId={userData?._id}
          />
        )}

    </MainLayout>
  );
};

export default PlayGame;