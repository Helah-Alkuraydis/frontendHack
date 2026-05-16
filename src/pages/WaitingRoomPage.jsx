import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Play, PlusCircle, X, Search, Loader2, Check } from "lucide-react";
import MainLayout from "../components/MainLayout";
import { Sparkles } from "../components/sparkles";
import axios from "axios";
import { socket } from "../socket";
import Swal from "sweetalert2";
import GameOverOverlay from "../components/GameOverOverlay";
import MissionTour from '../components/games/EscapeRoom/MissionTour';
import { BASE_URL } from "../api/auth.js";


// 1. أضفنا players هنا في الـ Props
const InviteTable = ({ data, onInvite, type, invitedIds, onlineUserIds = [], players = [] }) => {
  
  // دالة مساعدة للتأكد من حالة الاتصال
  function isActuallyOnline(user) {
    return onlineUserIds.includes(String(user._id || user.id));
  }

  // الـ sort نخليه بسيط فقط للترتيب حسب الأونلاين
  const sortedData = [...data].sort((a, b) => {
    if (isActuallyOnline(b) && !isActuallyOnline(a)) return 1;
    if (!isActuallyOnline(b) && isActuallyOnline(a)) return -1;
    return 0; 
  });
  // Inside WaitingRoomPage component, add these:


  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 text-[10px] uppercase tracking-[0.2em] text-white/50">
            <th className="px-6 py-4 font-black">No.</th>
            <th className="px-6 py-4 font-black">Username</th>
            <th className="px-6 py-4 font-black text-center">Points</th>
            <th className="px-6 py-4 font-black text-right">Invite</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedData.length > 0 ? (
            sortedData.map((item, index) => { 
              const isOnline = isActuallyOnline(item);
              // نفحص الحالة هنا داخل الـ map لأن الـ item معرف هنا
              const isInvited = invitedIds.includes(item._id || item.id);
              
              // نفحص هل اللاعب موجود فعلياً في الغرفة حالياً؟
              const isInRoom = players.some(p => (p.id || p._id).toString() === (item._id || item.id).toString());

              return (
                <tr
                  key={item._id || item.id}
                  className={`group transition-colors ${isOnline ? "hover:bg-white/[0.03]" : "opacity-40 grayscale"}`}
                >
                  <td className="px-6 py-4 text-xs font-mono text-white/30">{index + 1}</td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <img 
                          src={item.characterStyle?.startsWith("/") ? item.characterStyle : `/${item.characterStyle || "Avatar.png"}`}
                          className={`w-8 h-8 rounded-full border ${isOnline ? "border-emerald-500/50" : "border-white/10"}`} 
                          alt="avatar" 
                        />
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-white">{item.username}</span>
                           <span className={`text-[9px] font-black ${isOnline ? "text-emerald-500" : "text-gray-500"}`}>
                             {isOnline ? "● Available" : "Offline"}
                           </span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                        {item.totalScore || 0} XP
                    </span>
                  </td>
               
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => isOnline && !isInRoom && onInvite(item._id || item.id)}
                      disabled={!isOnline || isInvited || isInRoom}
                      className={`text-[10px] font-black px-4 py-1.5 rounded-lg uppercase transition-all 
                        ${isInRoom ? "bg-emerald-500/20 text-emerald-500" : isInvited ? "bg-gray-600 text-gray-400" : isOnline ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-white/5 text-gray-500 cursor-not-allowed"}`}
                    >
                      {isInRoom ? "IN ROOM" : isInvited ? "Pending..." : "Invite"}
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic text-sm">No agents detected...</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};


// 📖 قاموس الرسائل المخصصة لكل لعبة
const gameMessages = {
  "password-maker-breaker": {
    makerWin: {
      title: "[ DEFENSE STABILIZED ]",
      msg: "Brute-force attempt repelled. Your entropy sequence held firm against the attack.",
    },
    breakerWin: {
      title: "[ ACCESS GRANTED ]",
      msg: "System override successful. You cracked the sequence and bypassed the firewall.",
    },
    makerLoss: {
      title: "[ SHIELD COLLAPSED ]",
      msg: "Fatal error. The attacker found a pattern in your sequence. Internal servers compromised.",
    },
    breakerLoss: {
      title: "[ TRACE DETECTED ]",
      msg: "Strikes exhausted. Your digital signature was correlated. Retreat immediately.",
    },
  },

  default: {
    win: {
      title: "[ MISSION ACCOMPLISHED ]",
      msg: "Objective secured. Your skills have outmatched the opponent's strategy.",
    },
    loss: {
      title: "[ SYSTEM COMPROMISED ]",
      msg: "You were outmaneuvered. Defense systems breached or attack thwarted.",
    },
  },
};

const WaitingRoomPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [players, setPlayers] = useState([]);
  const [showTour, setShowTour] = useState(false);
  const hasSeenTourRef = useRef(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [inviteTab, setInviteTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState([]);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const lobbyRef = useRef(null);
  const matchResults = location.state?.matchResults;
  const myRole = location.state?.myRole;
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const isPasswordGame = lobbyRef.current?.gameName?.toLowerCase().includes("password");
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [invitedTeamIds, setInvitedTeamIds] = useState([]); 
  const fetchLobbyData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/multiplayer/lobby/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const ESCAPE_ROOM_ID = "69cee7269c67c2d9c0ae209f";
      if (res.data.gameId === ESCAPE_ROOM_ID && !hasSeenTourRef.current) {
          setShowTour(true);
          hasSeenTourRef.current = true; // Mark as seen so it doesn't pop up again
      }

      lobbyRef.current = res.data;
      const formattedPlayers = res.data.players.map((p) => ({
        id: p.user._id || p.user,
        username: p.username,
        characterStyle: p.characterStyle,
        totalScore: p.user.totalScore || 0,
        level: p.gameLevel || 1,
        isHost:res.data.hostId.toString() === (p.user._id || p.user).toString(),
        isReady: p.isReady,
        role: p.role,
        dbSessionId: p.dbSessionId,
      }));

      setPlayers(formattedPlayers);
    } catch (err) {
      if (err.response?.status === 404) {
        Swal.fire("Lobby Closed", "The host has left the mission.", "info");
        navigate("/games");
      }
      console.error("Error fetching lobby:", err);
    }
  };

  useEffect(() => {
  if (!sessionId || !socket) return;

  const onConnect = () => {
    console.log("🟢 CONNECTED");

    const userData = JSON.parse(localStorage.getItem("user"));

    if (userData?._id) {
      console.log("🚀 SENDING REGISTER");

      socket.emit("register_user", {
        userId: userData._id,
        onlineStatus: userData.onlineStatus || "Public"
      });
    }

    socket.emit("join_room", sessionId);

    fetchLobbyData();
  };

  // إذا متصل بالفعل
  if (socket.connected) {
    onConnect();
  } else {
    socket.connect();
  }

  socket.on("connect", onConnect);

  socket.on("player_joined", () => {
    console.log("🔔 Room Update: Refreshing players list...");
    fetchLobbyData();
  });
    socket.on("invite_accepted_feedback", () => {
      console.log("✅ Invite accepted feedback received");
      Swal.fire({
        title: "ACCEPTED!",
        text: "An agent has joined your mission.",
        icon: "success",
        toast: true,
        position: "bottom-start",
        timer: 3000,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#10b981",
      });

      setIsInviteModalOpen(false); // يقفل المودال فوراً عند الداعي
      fetchLobbyData();
    });

    socket.on("player_ready_update", () => {
      console.log("🔔 A player is ready!");
      fetchLobbyData(); // نحدث البيانات عشان تتغير حالة isReady في المصفوفة
    });

    socket.on("game_starts", (data) => {
    console.log("🚀 START SIGNAL RECEIVED:", data);

    const lobbyInfo = lobbyRef.current;
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    if (!userData?._id) return;

    const myDataInLobby = lobbyInfo.players.find(
        p => (p.user._id || p.user).toString() === userData._id.toString()
    );

    // 1. الحل الجذري: نعتمد على الاسم القادم من السيرفر أو اللوبي نفسه
    // نستخدم الـ Optional Chaining (?.) عشان نضمن الكود ما ينهار لو البيانات ناقصة
    const rawName = data?.gameName || lobbyInfo?.gameName;

    // 2. تحويل أي اسم لعبة إلى رابط (Slug) صالح للمتصفح بشكل تلقائي
    // مثلاً: "Secure Coding Challenge" بتصير "secure-coding-challenge"
    // و "Cyber Escape Room" بتصير "cyber-escape-room"
    const gameSlug = rawName 
        ? rawName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") 
        : "unknown-game";

    console.log(`🎯 Dynamic Routing to: ${gameSlug}`);

    navigate(`/play/${sessionId}/${gameSlug}`, {
        state: {
            sessionId: sessionId,
            mode: "multiplayer",
            gameId: data?.gameId || lobbyInfo?.gameId,
            gameName: rawName,
            historyId: myDataInLobby?.dbSessionId,
            isHost: myDataInLobby?.isHost
        },
    });
    console.log("🎯 Navigating to:", gameSlug);
});

     socket.on("update_online_users_list", (ids) => {
    console.log("📡 ONLINE IDS:", ids);
    setOnlineUserIds(ids);
  });
    socket.on("lobby_updated", () => {
      fetchLobbyData(); // نستدعي دالة جلب البيانات عشان تتحدث الشاشة عند الطرفين
    });

    socket.on("host_disconnected", () => {
      console.log("🏠 Host disconnected, redirecting all...");
      // عشان ما تطلع رسالة لكل اللاعبين (بما فيهم اللي طلع):
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (
        lobbyRef.current &&
        lobbyRef.current.hostId.toString() !== storedUser._id
      ) {
        navigate("/games");
      } else {
        navigate("/games");
      }
    });

    return () => {
   socket.off("connect", onConnect);
      socket.off("player_joined");
      socket.off("invite_accepted_feedback");
      socket.off("player_ready_update");
      socket.off("game_starts");
      socket.off("lobby_updated");
      socket.off("host_disconnected");
      socket.off("update_online_users_list");
    };
  }, [sessionId, socket]);

useEffect(() => {
    const fetchRecentTeams = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${BASE_URL}/teams/my-teams`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log("📡 Teams Data Received:", res.data); 
            if (res.data.success) {
                setMyTeams(res.data.data); 
            }
        } catch (err) {
            console.error("Error fetching recent teams:", err);
        }
    };

    if (inviteTab === "recent") {
        fetchRecentTeams();
    }
}, [inviteTab]);

  useEffect(() => {
    if (players.length > 0) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      // نبحث في مصفوفة players المهيأة
      const me = players.find(
        (p) => p.id === storedUser._id || p.id?.toString() === storedUser._id,
      );

      if (me && me.role) {
        console.log("🕵️ My Role in this match is:", me.role);
        setCurrentUserRole(me.role);
      }
    }
  }, [players]);

  // 3. معالجة النهاية وتجهيز الشاشة الختامية
  useEffect(() => {
    if (matchResults && myRole) {
      const processResults = async () => {
        const isWinner = matchResults.winner === myRole;

        // --- الجزء المهم: تحديث النقاط ---
        if (isWinner) {
          try {
            const token = localStorage.getItem("token");
            const userData = JSON.parse(localStorage.getItem("user") || "{}");

            // 1. نجيب بيانات الغرفة "طازجة" الآن عشان نضمن وجود الـ dbSessionId
            const res = await axios.get(
              `${BASE_URL}/multiplayer/lobby/${sessionId}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );

            const freshLobbyData = res.data;
            const me = freshLobbyData.players.find(
              (p) =>
                (p.user._id || p.user).toString() === userData._id.toString(),
            );

            const realDbSessionId = me?.dbSessionId;

            if (realDbSessionId) {
              console.log("🎯 Found ID, submitting score:", realDbSessionId);

              // 2. إرسال النقاط للباك أند (الراوت اللي تبينه)
              await axios.post(
                `${BASE_URL}/games/submit`,
                {
                  sessionId: realDbSessionId,
                  score: 50,
                  status: "Win",
                  duration: matchResults.breakerTime || 0,
                  mistakesCount: matchResults.breakerMistakes || 0,
                },
                { headers: { Authorization: `Bearer ${token}` } },
              );

              // 3. رفع المستوى
              if (freshLobbyData.gameId) {
                await axios.post(
                  `${BASE_URL}/games/level/up`,
                  { gameId: freshLobbyData.gameId, status: "win" },
                  { headers: { Authorization: `Bearer ${token}` } },
                );
              }

              console.log("✅ XP & Level Updated Successfully!");
              fetchLobbyData(); // تحديث أخير للشاشة
            } else {
              console.error(
                "❌ Critical: dbSessionId not found in lobby players!",
              );
            }
          } catch (e) {
            console.error("❌ Submit Error:", e.response?.data || e.message);
          }
        }

        // --- عرض الشاشة الفخمة ---
        const gameSlugStr =
          location.state?.gameSlug || "password-maker-breaker";
        const gameMsgs = gameMessages[gameSlugStr] || gameMessages["default"];
        let msgConfig;

        if (gameMsgs === gameMessages["default"]) {
          msgConfig = isWinner ? gameMsgs.win : gameMsgs.loss;
        } else {
          const roleKey =
            myRole === "maker"
              ? isWinner
                ? "makerWin"
                : "makerLoss"
              : isWinner
                ? "breakerWin"
                : "breakerLoss";
          msgConfig = gameMsgs[roleKey];
        }

        setGameOverData({
          isWinner,
          title: msgConfig.title,
          message: msgConfig.msg,
          xpGained: isWinner ? 50 : 0,
          role: myRole,
        });
      };

      processResults();
    }
  }, [matchResults, myRole]);

  useEffect(() => {
    if (inviteTab === "search" && searchResults.length === 0) {
        handleSearchUsers("");
    }
}, [inviteTab]);

const inviteFullTeam = async (teamId) => {
    try {
        setInvitedTeamIds((prev) => [...prev, teamId]);

        const token = localStorage.getItem("token");
        const res = await axios.post(`${BASE_URL}/teams/invite-team`, 
            { teamId, sessionId: sessionId },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
            Swal.fire({
                title: "TEAM DEPLOYED!",
                text: "All online teammates have been notified.",
                icon: "success",
                toast: true,
                position: "top-end",
                timer: 3000,
                showConfirmButton: false
            });
            
            // إذا تبين الزر يرجع لطبيعته بعد فترة، فكي التعليق عن السطر تحت
            // setTimeout(() => setInvitedTeamIds(prev => prev.filter(id => id !== teamId)), 5000);
        }
    } catch (err) {
        setInvitedTeamIds((prev) => prev.filter((id) => id !== teamId));
        Swal.fire("Error", "Could not reach teammates", "error");
    }
};

useEffect(() => {
  if (players.length > 0 && invitedIds.length > 0) {
    setInvitedIds(prev => prev.filter(invitedId => 
      !players.some(p => p.id.toString() === invitedId.toString())
    ));
  }
}, [players]);

const handleSearchUsers = async (query) => {
    setSearchLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const hostPlayer = players.find(p => p.isHost);
      
      const currentLevel = hostPlayer?.level || 17; 

      console.log("🚀 [DEBUG] Sending Level to Backend:", currentLevel);

      const res = await axios.get(
        `${BASE_URL}/auth/users?search=${query}&level=${currentLevel}&gameId=${lobbyRef.current?.gameId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setSearchResults([]); } finally { setSearchLoading(false); }
};

  useEffect(() => {
    const fetchRecentPlayers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BASE_URL}/multiplayer/recent-players`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setRecentPlayers(res.data);
      } catch (err) {
        console.error("Error fetching recent players:", err);
      }
    };

    if (inviteTab === "recent" && recentPlayers.length === 0) {
      fetchRecentPlayers();
    }
  }, [inviteTab]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const renderTabContent = () => {
    switch (inviteTab) {
      case "friends":
        return (
          <InviteTable
            data={friends}
            onInvite={sendInvite}
            type="friends"
            invitedIds={invitedIds}
            onlineUserIds={onlineUserIds}
            players={players}
          />
        );
      case "search":
        return (
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                {searchLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                placeholder="Enter agent name to track..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-inner"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <InviteTable
                data={searchResults}
                onInvite={sendInvite}
                invitedIds={invitedIds}
                type="search"
                onlineUserIds={onlineUserIds} 
                players={players}
              />
            </div>
          </div>
        );
   case "recent":
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {myTeams.length > 0 ? (
        myTeams.map((team) => {
        const isTeamInRoom = team.members.every(member => 
                players.some(p => p.id.toString() === (member._id || member.id).toString())
            );

            const isInvited = invitedTeamIds.includes(team._id);

            return (
                <div key={team._id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.08] transition-all">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase">{team.name}</h3>
                            <div className="flex gap-4 mt-2">
                                <span className="text-[10px] font-bold text-emerald-400">WINS: {team.performance?.totalWins || 0}</span>
                                <span className="text-[10px] font-bold text-red-400">LOSSES: {team.performance?.totalLosses || 0}</span>
                            </div>
                        </div>

                        {/* 🎯 الزر المطور */}
                        <button 
                            onClick={() => !isInvited && !isTeamInRoom && inviteFullTeam(team._id)}
                            disabled={isInvited || isTeamInRoom}
                            className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all shadow-lg 
                                ${isTeamInRoom 
                                    ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-none" 
                                    : isInvited 
                                        ? "bg-gray-600 text-gray-400" 
                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                                }`}
                        >
                            {isTeamInRoom ? (
                                <span className="flex items-center gap-2">
                                    <Check size={12} /> IN ROOM
                                </span>
                            ) : isInvited ? (
                                "DEPLOYED"
                            ) : (
                                "Invite All Members"
                            )}
                        </button>
                    </div>

                    <div className="flex mt-4 -space-x-3">
                        {team.members?.map(member => {
                            // فحص حالة كل عضو بشكل منفرد (اختياري لو تبين تلونين آفاتارهم)
                            const memberInRoom = players.some(p => p.id.toString() === (member._id || member.id).toString());
                            return (
                                <img 
                                    key={member._id}
                                    src={`/${member.characterStyle || 'Avatar.png'}`} 
                                    className={`w-8 h-8 rounded-full border-2 ${memberInRoom ? 'border-emerald-500' : 'border-[#0f172a]'} transition-all`} 
                                    title={member.username}
                                />
                            );
                        })}
                    </div>
                </div>
            );
        })
    ) : (
                <div className="px-6 py-10 text-center text-gray-500 italic text-sm">
                    No recent teams found...
                </div>
            )}
        </div>
    );
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlayers([
          {
            id: res.data._id,
            username: res.data.username,
            characterStyle: res.data.characterStyle,
            isHost: true,
          },
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BASE_URL}/social/friends`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setFriends(res.data);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };
    if (isInviteModalOpen) fetchFriends();
  }, [isInviteModalOpen]);

 const sendInvite = async (friendId) => {
  try {
    setInvitedIds((prev) => [...prev, friendId]);

    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    try {
      await axios.post(
        `${BASE_URL}/multiplayer/invite`,
        {
          friendId,
          sessionId,
          gameName: location.state?.gameName || "Cyber Mission",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (dbErr) {
      console.log("⚠️ DB Notification bypassed due to backend sync delay. Switching to live socket...");
    }

    socket.emit("send_game_invite", {
      targetUserId: friendId,
      senderName: storedUser.username || "Agent",
      gameName: location.state?.gameName || "Cyber Escape Room",
      sessionId: sessionId
    });

    Swal.fire({
      title: "INVITATION DEPLOYED",
      text: "Mission transmitted via secure live socket channel.",
      icon: "success",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
    });

    setTimeout(() => {
      setIsInviteModalOpen(false);
    }, 800);

  } catch (err) {
    setInvitedIds((prev) => prev.filter((id) => id !== friendId));
    Swal.fire({
      title: "Mission Failed",
      text: "Could not establish connection link.",
      icon: "warning",
      background: "#0f172a",
      color: "#fff",
    });
  }
};
  const getStandingAvatar = (style) => {
    const avatars = {
      "Avatar.png": "/Avatar-standing.png",
      "man1.png": "/man1-standing.png",
      "saudi-man.png": "/saudi-man-standing.png",
      "Women1.png": "/women1-standing.png",
      "Women2.png": "/women2-standing.png",
      "Women3.png": "/women3-standing.png",
    };
    return avatars[style] || "/Avatar-standing.png";
  };

  const handleReady = async () => {
    try {
      const token = localStorage.getItem("token");
      // نرسل للباك أند إن هذا اللاعب صار جاهز (بنسوي الـ API حقها بعدين)
      await axios.put(
        `${BASE_URL}/multiplayer/ready/${sessionId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // نبلغ السوكيت
      socket.emit("player_ready", sessionId);
      fetchLobbyData();
    } catch (err) {
      console.error("Error setting ready state", err);
    }
  };

  // دالة لما الداعي (الهوست) يضغط Start Mission
  const handleStartMission = () => {
    // السوكيت يبلغ كل اللي بالغرفة إن اللعبة بدأت
    socket.emit("start_game", sessionId);
  };

  const handleLeaveRoom = async () => {
    try {
      const token = localStorage.getItem("token");

      // ننادي الباك أند فقط، وهو المسؤول عن تبليغ السوكيت بالترتيب الصح
      await axios.delete(
        `${BASE_URL}/multiplayer/lobby/leave/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      navigate("/games");
    } catch (err) {
      console.error("Error leaving:", err);
      navigate("/games");
    }
  };

  return (
    <MainLayout activePage="games">
      <div className="text-3xl font-black tracking-tight text-white uppercase italic mb-5">
        Waiting Room
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-2 relative">
        <div className="w-full max-w-6xl h-[750px] bg-[#0a0f1d]/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-7 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="flex justify-end items-center mb-4 relative z-30">
            <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full flex items-center gap-3">
              <span className="text-white/60 font-bold">Players</span>
              <span className="text-2xl font-black text-blue-400">
                {players.length} / 4
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 grid-rows-[auto_auto] gap-x-36 gap-y-0 relative content-center">
            {[0, 1, 2, 3].map((idx) => {
              const player = players[idx];
              const isTop = idx < 2;
              const isLeft = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col items-center justify-end h-full transition-all duration-700
                    ${isTop ? "scale-110 z-0" : "scale-150 z-10"} 
                    ${isLeft ? "justify-self-start" : "justify-self-end"}`}
                  style={{
                    paddingLeft: isTop && isLeft ? "30px" : "0",
                    paddingRight: isTop && !isLeft ? "30px" : "0",
                    marginLeft: !isTop && isLeft ? "160px" : "0",
                    marginRight: !isTop && !isLeft ? "160px" : "0",
                    marginBottom: !isTop ? "40px" : "0",
                  }}
                >
                  {player ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
                      <div className="mb-2 text-center">
                        {player.isHost && (
                          <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest block mb-1 font-mono">
                            'Host'
                          </span>
                        )}
                        <h3 className="font-bold text-white italic tracking-tight text-lg">
                          {player.username}
                        </h3>
                      </div>
                      <div
                        className={`relative ${!isTop ? "glitter-effect" : ""}`}
                      >
                        <Sparkles
                          density={100}
                          speed={1.2}
                          size={0.5}
                          direction="top"
                          opacitySpeed={2}
                          color="#FFFFFF"
                          className="absolute inset-x-0 bottom-0 h-full w-full"
                        />
                        <img
                          src={getStandingAvatar(player.characterStyle)}
                          className={`${isTop ? "w-48" : "w-96"} h-auto z-10 drop-shadow-[0_20px_40px_rgba(59,130,246,0.4)] animate-float`}
                          alt="Hero"
                        />
                      </div>
                      <img
                        src="/stage.png"
                        className={`${isTop ? "w-56" : "w-80"} h-auto mt-[-2px] opacity-90`}
                        alt="Platform"
                      />
                    </div>
                  ) : (
                    
                    (() => {
    const isPasswordGame = lobbyRef.current?.gameName?.toLowerCase().includes("password");
    if (isPasswordGame && players.length >= 2) {
      return (
        <div className="flex flex-col items-center opacity-20 grayscale">
          <div className="mb-12 flex flex-col items-center gap-2">
             <Lock size={20} className="text-gray-500" />
             <span className="text-[8px] font-black uppercase tracking-tighter text-gray-500">Dual Access Only</span>
          </div>
          <img src="/stage.png" className={`${isTop ? "w-56" : "w-64"} grayscale brightness-50 opacity-30 mt-[-50px]`} alt="Locked Stage" />
        </div>
      );
    }
    
    // المربع العادي للدعوة
    return (
      <div className="flex flex-col items-center opacity-30 hover:opacity-100 transition-all duration-500">
        <button
          className="group flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl mb-12 hover:bg-blue-500 transition-all z-20"
          onClick={() => setIsInviteModalOpen(true)}
        >
          <PlusCircle size={14} className="text-blue-400 group-hover:text-white" />
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 group-hover:text-white">Invite</span>
        </button>
        <img src="/stage.png" className={`${isTop ? "w-56" : "w-64"} grayscale brightness-50 opacity-50 mt-[-50px]`} alt="Empty Stage" />
      </div>
    );
  })()
)}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-6 relative z-30">
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-black uppercase text-xs hover:bg-red-500/20 hover:text-red-500 transition-all"
            >
              <LogOut size={16} /> Leaving
            </button>

            {(() => {
              const me = players.find(
                (p) => p.id === JSON.parse(localStorage.getItem("user"))?._id,
              );
              const isMeHost = me?.isHost;
              const allGuestsReady = players
                .filter((p) => !p.isHost)
                .every((p) => p.isReady);
              const hasGuests = players.length > 1;

              if (isMeHost) {
                return (
                  <button
                    onClick={handleStartMission}
                    disabled={!hasGuests || !allGuestsReady}
                    className={`flex items-center gap-3 px-14 py-4 rounded-2xl font-black text-xl italic uppercase tracking-widest transition-all shadow-lg 
                      ${
                        hasGuests && allGuestsReady
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:scale-105 shadow-emerald-500/50 animate-pulse"
                          : "bg-white/10 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    {hasGuests && allGuestsReady
                      ? "Start Mission"
                      : "Waiting for Agents"}{" "}
                    <Play size={20} fill="currentColor" />
                  </button>
                );
              } else {
                return (
                  <button
                    onClick={handleReady}
                    disabled={me?.isReady}
                    className={`flex items-center gap-3 px-14 py-4 rounded-2xl font-black text-xl italic uppercase tracking-widest transition-all shadow-lg 
                      ${
                        me?.isReady
                          ? "bg-blue-900/50 text-blue-300 cursor-wait border border-blue-500/30"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105"
                      }`}
                  >
                    {me?.isReady ? "Waiting for Host..." : "Ready"}{" "}
                    <Play size={20} fill="currentColor" />
                  </button>
                );
              }
            })()}
          </div>
        </div>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
          <div className="relative w-full max-w-2xl bg-[#0f172a]/95 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-500/10">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-widest mb-6">
                Inviting Players
              </h2>
              <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 w-full">
                <button
                  onClick={() => setInviteTab("friends")}
                  className={`flex-1 py-3 rounded-xl font-bold uppercase text-[10px] transition-all ${inviteTab === "friends" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                >
                  Invite Friends
                </button>
                <button
                  onClick={() => setInviteTab("search")}
                  className={`flex-1 py-3 rounded-xl font-bold uppercase text-[10px] transition-all ${inviteTab === "search" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                >
                  Searching for Players
                </button>
                <button
                  onClick={() => setInviteTab("recent")}
                  className={`flex-1 py-3 rounded-xl font-bold uppercase text-[10px] transition-all ${inviteTab === "recent" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                >
                  Recent Team
                </button>
              </div>
            </div>
            <div className="min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {renderTabContent()}
            </div>
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {gameOverData && (
        <GameOverOverlay
          {...gameOverData}
          onClose={() => {
            setGameOverData(null); // إغلاق الشاشة
            window.history.replaceState({}, document.title);
          }}
        />
      )}
      {showTour && (
          <MissionTour onComplete={() => setShowTour(false)} />
      )}
    </MainLayout>
  );
};

export default WaitingRoomPage;