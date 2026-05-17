import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Play, PlusCircle, X, Search, Loader2, Check, Lock } from "lucide-react";
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

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[400px]">
        <thead>
          <tr className="bg-white/5 text-[10px] uppercase tracking-[0.2em] text-white/50">
            <th className="px-3 py-3 md:px-6 md:py-4 font-black">No.</th>
            <th className="px-3 py-3 md:px-6 md:py-4 font-black">Username</th>
            <th className="px-3 py-3 md:px-6 md:py-4 font-black text-center">Points</th>
            <th className="px-3 py-3 md:px-6 md:py-4 font-black text-right">Invite</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedData.length > 0 ? (
            sortedData.map((item, index) => { 
              const isOnline = isActuallyOnline(item);
              const isInvited = invitedIds.includes(item._id || item.id);
              const isInRoom = players.some(p => (p.id || p._id).toString() === (item._id || item.id).toString());

              return (
                <tr
                  key={item._id || item.id}
                  className={`group transition-colors ${isOnline ? "hover:bg-white/[0.03]" : "opacity-40 grayscale"}`}
                >
                  <td className="px-3 py-3 md:px-6 md:py-4 text-[10px] md:text-xs font-mono text-white/30">{index + 1}</td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                     <div className="flex items-center gap-2 md:gap-3">
                        <img 
                          src={item.characterStyle?.startsWith("/") ? item.characterStyle : `/${item.characterStyle || "Avatar.png"}`}
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-full border ${isOnline ? "border-emerald-500/50" : "border-white/10"}`} 
                          alt="avatar" 
                        />
                        <div className="flex flex-col">
                           <span className="text-xs md:text-sm font-bold text-white">{item.username}</span>
                           <span className={`text-[8px] md:text-[9px] font-black ${isOnline ? "text-emerald-500" : "text-gray-500"}`}>
                             {isOnline ? "● Available" : "Offline"}
                           </span>
                        </div>
                     </div>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 text-center">
                    <span className="text-[10px] md:text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-1 md:px-3 rounded-full whitespace-nowrap">
                        {item.totalScore || 0} XP
                    </span>
                  </td>
               
                  <td className="px-3 py-3 md:px-6 md:py-4 text-right">
                    <button
                      onClick={() => isOnline && !isInRoom && onInvite(item._id || item.id)}
                      disabled={!isOnline || isInvited || isInRoom}
                      className={`text-[9px] md:text-[10px] font-black px-3 py-1.5 md:px-4 rounded-lg uppercase transition-all whitespace-nowrap 
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
          hasSeenTourRef.current = true; 
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
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?._id) {
      socket.emit("register_user", {
        userId: userData._id,
        onlineStatus: userData.onlineStatus || "Public"
      });
    }
    socket.emit("join_room", sessionId);
    fetchLobbyData();
  };

  if (socket.connected) {
    onConnect();
  } else {
    socket.connect();
  }

  socket.on("connect", onConnect);
  socket.on("player_joined", () => { fetchLobbyData(); });
  socket.on("invite_accepted_feedback", () => {
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
      setIsInviteModalOpen(false);
      fetchLobbyData();
    });

    socket.on("player_ready_update", () => { fetchLobbyData(); });
    socket.on("game_starts", (data) => {
    const lobbyInfo = lobbyRef.current;
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData?._id) return;
    const myDataInLobby = lobbyInfo.players.find(
        p => (p.user._id || p.user).toString() === userData._id.toString()
    );
    const rawName = data?.gameName || lobbyInfo?.gameName;
    const gameSlug = rawName 
        ? rawName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") 
        : "unknown-game";

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
});

  socket.on("update_online_users_list", (ids) => { setOnlineUserIds(ids); });
  socket.on("lobby_updated", () => { fetchLobbyData(); });
  socket.on("host_disconnected", () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (lobbyRef.current && lobbyRef.current.hostId.toString() !== storedUser._id) {
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
      const me = players.find((p) => p.id === storedUser._id || p.id?.toString() === storedUser._id);
      if (me && me.role) {
        setCurrentUserRole(me.role);
      }
    }
  }, [players]);

  useEffect(() => {
    if (matchResults && myRole) {
      const processResults = async () => {
        const isWinner = matchResults.winner === myRole;
        if (isWinner) {
          try {
            const token = localStorage.getItem("token");
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await axios.get(
              `${BASE_URL}/multiplayer/lobby/${sessionId}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            const freshLobbyData = res.data;
            const me = freshLobbyData.players.find((p) => (p.user._id || p.user).toString() === userData._id.toString());
            const realDbSessionId = me?.dbSessionId;

            if (realDbSessionId) {
              await axios.post(
                `${BASE_URL}/games/submit`,
                { sessionId: realDbSessionId, score: 50, status: "Win", duration: matchResults.breakerTime || 0, mistakesCount: matchResults.breakerMistakes || 0 },
                { headers: { Authorization: `Bearer ${token}` } },
              );

              if (freshLobbyData.gameId) {
                await axios.post(
                  `${BASE_URL}/games/level/up`,
                  { gameId: freshLobbyData.gameId, status: "win" },
                  { headers: { Authorization: `Bearer ${token}` } },
                );
              }
              fetchLobbyData();
            } 
          } catch (e) {
            console.error("❌ Submit Error:", e.response?.data || e.message);
          }
        }

        const gameSlugStr = location.state?.gameSlug || "password-maker-breaker";
        const gameMsgs = gameMessages[gameSlugStr] || gameMessages["default"];
        let msgConfig;

        if (gameMsgs === gameMessages["default"]) {
          msgConfig = isWinner ? gameMsgs.win : gameMsgs.loss;
        } else {
          const roleKey = myRole === "maker" ? (isWinner ? "makerWin" : "makerLoss") : (isWinner ? "breakerWin" : "breakerLoss");
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
        const res = await axios.get(`${BASE_URL}/multiplayer/recent-players`, { headers: { Authorization: `Bearer ${token}` }});
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
      case "friends": return <InviteTable data={friends} onInvite={sendInvite} type="friends" invitedIds={invitedIds} onlineUserIds={onlineUserIds} players={players} />;
      case "search":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                {searchLoading ? <Loader2 className="animate-spin w-[16px] h-[16px] md:w-[18px] md:h-[18px]" /> : <Search className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]" />}
              </div>
              <input
                type="text"
                value={searchQuery}
                placeholder="Enter agent name to track..."
                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 text-xs md:text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-inner"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <InviteTable data={searchResults} onInvite={sendInvite} invitedIds={invitedIds} type="search" onlineUserIds={onlineUserIds} players={players} />
            </div>
          </div>
        );
   case "recent":
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {myTeams.length > 0 ? (
        myTeams.map((team) => {
        const isTeamInRoom = team.members.every(member => players.some(p => p.id.toString() === (member._id || member.id).toString()));
            const isInvited = invitedTeamIds.includes(team._id);

            return (
                <div key={team._id} className="bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] p-4 md:p-6 hover:bg-white/[0.08] transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-white italic uppercase">{team.name}</h3>
                            <div className="flex gap-3 md:gap-4 mt-1 md:mt-2">
                                <span className="text-[9px] md:text-[10px] font-bold text-emerald-400">WINS: {team.performance?.totalWins || 0}</span>
                                <span className="text-[9px] md:text-[10px] font-bold text-red-400">LOSSES: {team.performance?.totalLosses || 0}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => !isInvited && !isTeamInRoom && inviteFullTeam(team._id)}
                            disabled={isInvited || isTeamInRoom}
                            className={`w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-black uppercase text-[9px] md:text-[10px] transition-all shadow-lg 
                                ${isTeamInRoom ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-none" : isInvited ? "bg-gray-600 text-gray-400" : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"}`}
                        >
                            {isTeamInRoom ? <span className="flex items-center justify-center gap-2"><Check size={12} /> IN ROOM</span> : isInvited ? "DEPLOYED" : "Invite All"}
                        </button>
                    </div>

                    <div className="flex mt-3 md:mt-4 -space-x-2 md:-space-x-3">
                        {team.members?.map(member => {
                            const memberInRoom = players.some(p => p.id.toString() === (member._id || member.id).toString());
                            return (
                                <img key={member._id} src={member.characterStyle?.startsWith("/") ? member.characterStyle : `/${member.characterStyle || 'Avatar.png'}`} className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 ${memberInRoom ? 'border-emerald-500' : 'border-[#0f172a]'} transition-all`} title={member.username} alt="avatar" />
                            );
                        })}
                    </div>
                </div>
            );
        })
    ) : ( <div className="px-6 py-10 text-center text-gray-500 italic text-xs md:text-sm">No recent teams found...</div> )}
        </div>
    );
      default: return null;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        setPlayers([{ id: res.data._id, username: res.data.username, characterStyle: res.data.characterStyle, isHost: true }]);
      } catch (err) { console.error(err); }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/social/friends`, { headers: { Authorization: `Bearer ${token}` } });
        setFriends(res.data);
      } catch (err) { console.error("Error fetching friends:", err); }
    };
    if (isInviteModalOpen) fetchFriends();
  }, [isInviteModalOpen]);

 const sendInvite = async (friendId) => {
  try {
    setInvitedIds((prev) => [...prev, friendId]);
    const token = localStorage.getItem("token");
    await axios.post(`${BASE_URL}/multiplayer/invite`, { friendId, sessionId, gameName: location.state?.gameName || "Cyber Mission" }, { headers: { Authorization: `Bearer ${token}` } });
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    socket.emit("send_game_invite", { targetUserId: friendId, senderName: storedUser.username || "Agent", gameName: location.state?.gameName || "Cyber Escape Room", sessionId: sessionId });

Swal.fire({ 
  title: "INVITATION SENT", 
  text: "The invitation has been successfully sent to the user 🛡️", 
  icon: "success", 
  toast: true, 
  position: "top-end", 
  timer: 3000, 
  showConfirmButton: false 
});    setTimeout(() => { setIsInviteModalOpen(false); }, 800);
  } catch (err) {
    setInvitedIds((prev) => prev.filter((id) => id !== friendId));
    Swal.fire({ title: "Mission Failed", text: "Could not sync notification hub.", icon: "warning", background: "#0f172a", color: "#fff" });
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
      await axios.put(`${BASE_URL}/multiplayer/ready/${sessionId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      socket.emit("player_ready", sessionId);
      fetchLobbyData();
    } catch (err) { console.error("Error setting ready state", err); }
  };

  const handleStartMission = () => { socket.emit("start_game", sessionId); };

  const handleLeaveRoom = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/multiplayer/lobby/leave/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } });
      navigate("/games");
    } catch (err) { navigate("/games"); }
  };

  return (
    <MainLayout activePage="games">
      <div className="text-xl md:text-3xl font-black tracking-tight text-white uppercase italic mb-4 md:mb-5 px-2 ml-header">
        Waiting Room
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-2 relative ml-wrapper">
        <div className="w-full max-w-6xl min-h-[600px] md:h-[750px] bg-[#0a0f1d]/90 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[3rem] p-4 md:p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between ml-container">
          <div className="flex justify-end items-center mb-4 relative z-30">
            <div className="bg-white/5 border border-white/10 px-4 md:px-6 py-1.5 md:py-2 rounded-full flex items-center gap-2 md:gap-3">
              <span className="text-white/60 font-bold text-xs md:text-base">Players</span>
              <span className="text-lg md:text-2xl font-black text-blue-400">
                {players.length} / 4
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 grid-rows-[auto_auto] gap-x-2 md:gap-x-36 gap-y-2 md:gap-y-0 relative content-center my-auto md:my-0 ml-grid">
            {[0, 1, 2, 3].map((idx) => {
              const player = players[idx];
              const isTop = idx < 2;
              const isLeft = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col items-center justify-end h-full transition-all duration-700
                    ${isTop ? "md:scale-110 z-0" : "md:scale-150 z-10"} 
                    ${isLeft ? "justify-self-start" : "justify-self-end"}
                    ${isTop && isLeft ? "md:pl-[30px]" : ""}
                    ${isTop && !isLeft ? "md:pr-[30px]" : ""}
                    ${!isTop && isLeft ? "md:ml-[160px]" : ""}
                    ${!isTop && !isLeft ? "md:mr-[160px]" : ""}
                    ${!isTop ? "mt-4 md:mb-[40px] md:mt-0 ml-grid-item-bottom" : ""}`}
                >
                  {player ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
                      <div className="mb-1 md:mb-2 text-center">
                        {player.isHost && (
                          <span className="text-[8px] md:text-[10px] text-cyan-400 font-black uppercase tracking-widest block mb-0.5 md:mb-1 font-mono">
                            'Host'
                          </span>
                        )}
                        <h3 className="font-bold text-white italic tracking-tight text-xs md:text-lg">
                          {player.username}
                        </h3>
                      </div>
                      <div className={`relative ${!isTop ? "glitter-effect" : ""}`}>
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
                          className={`${isTop ? "w-24 md:w-48 ml-avatar-top" : "w-32 md:w-96 ml-avatar-bottom"} h-auto z-10 drop-shadow-[0_20px_40px_rgba(59,130,246,0.4)] animate-float`}
                          alt="Hero"
                        />
                      </div>
                      <img
                        src="/stage.png"
                        className={`${isTop ? "w-36 md:w-56 ml-stage-top" : "w-44 md:w-80 ml-stage-bottom"} h-auto mt-[-2px] opacity-90`}
                        alt="Platform"
                      />
                    </div>
                  ) : (
                    (() => {
                      const isPasswordGame = lobbyRef.current?.gameName?.toLowerCase().includes("password");
                      if (isPasswordGame && players.length >= 2) {
                        return (
                          <div className="flex flex-col items-center opacity-20 grayscale">
                            <div className="mb-2 md:mb-12 flex flex-col items-center gap-1 md:gap-2 ml-invite-btn">
                               <Lock className="text-gray-500 w-4 h-4 md:w-5 md:h-5" />
                               <span className="text-[8px] font-black uppercase tracking-tighter text-gray-500 text-center leading-tight">Dual<br/>Access</span>
                            </div>
                            <img src="/stage.png" className={`${isTop ? "w-36 md:w-56" : "w-44 md:w-64"} ml-empty-stage grayscale brightness-50 opacity-30 mt-[-20px] md:mt-[-50px]`} alt="Locked Stage" />
                          </div>
                        );
                      }
                      
                      return (
                        <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-all duration-500">
                          <button
                            className="group flex items-center gap-1 md:gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 md:px-3 md:py-1.5 rounded-lg md:rounded-xl mb-2 md:mb-12 hover:bg-blue-500 transition-all z-20 ml-invite-btn"
                            onClick={() => setIsInviteModalOpen(true)}
                          >
                            <PlusCircle className="text-blue-400 group-hover:text-white w-3 h-3 md:w-4 md:h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 group-hover:text-white">Invite</span>
                          </button>
                          <img src="/stage.png" className={`${isTop ? "w-36 md:w-56" : "w-44 md:w-64"} ml-empty-stage grayscale brightness-50 opacity-50 mt-[-20px] md:mt-[-50px]`} alt="Empty Stage" />
                        </div>
                      );
                    })()
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-row justify-between items-end mt-auto pt-4 md:mt-6 relative z-30 gap-2 w-full ml-footer">
            <button
              onClick={handleLeaveRoom}
              className="flex items-center justify-center gap-1.5 w-auto px-4 py-2.5 md:px-8 md:py-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-black uppercase text-[10px] md:text-xs hover:bg-red-500/20 hover:text-red-500 transition-all"
            >
              <LogOut size={14} /> Leaving
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
                    className={`flex items-center justify-center gap-1.5 w-auto px-4 py-2.5 md:px-14 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-xl italic uppercase tracking-widest transition-all shadow-lg text-center
                      ${
                        hasGuests && allGuestsReady
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:scale-105 shadow-emerald-500/50 animate-pulse"
                          : "bg-white/10 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    <span className="max-w-[100px] md:max-w-none whitespace-normal leading-tight">
                       {hasGuests && allGuestsReady ? "Start Mission" : "Waiting for Agents"}
                    </span>
                    <Play className="w-3 h-3 md:w-5 md:h-5 shrink-0" fill="currentColor" />
                  </button>
                );
              } else {
                return (
                  <button
                    onClick={handleReady}
                    disabled={me?.isReady}
                    className={`flex items-center justify-center gap-1.5 w-auto px-4 py-2.5 md:px-14 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-xl italic uppercase tracking-widest transition-all shadow-lg text-center
                      ${
                        me?.isReady
                          ? "bg-blue-900/50 text-blue-300 cursor-wait border border-blue-500/30"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105"
                      }`}
                  >
                     <span className="max-w-[100px] md:max-w-none whitespace-normal leading-tight">
                        {me?.isReady ? "Waiting for Host..." : "Ready"}
                     </span>
                    <Play className="w-3 h-3 md:w-5 md:h-5 shrink-0" fill="currentColor" />
                  </button>
                );
              }
            })()}
          </div>
        </div>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
          <div className="relative w-full max-w-2xl bg-[#0f172a]/95 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-blue-500/10 max-h-[90vh] flex flex-col">
            <div className="flex flex-col items-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-widest mb-4 md:mb-6">
                Inviting Players
              </h2>
              <div className="flex flex-col sm:flex-row bg-white/5 p-1.5 rounded-2xl border border-white/5 w-full gap-1 sm:gap-0">
                <button
                  onClick={() => setInviteTab("friends")}
                  className={`flex-1 py-2.5 md:py-3 rounded-xl font-bold uppercase text-[9px] md:text-[10px] transition-all ${inviteTab === "friends" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                >
                  Friends
                </button>
                <button
                  onClick={() => setInviteTab("search")}
                  className={`flex-1 py-2.5 md:py-3 rounded-xl font-bold uppercase text-[9px] md:text-[10px] transition-all ${inviteTab === "search" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                >
                  Search
                </button>
                <button
                  onClick={() => setInviteTab("recent")}
                  className={`flex-1 py-2.5 md:py-3 rounded-xl font-bold uppercase text-[9px] md:text-[10px] transition-all ${inviteTab === "recent" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                >
                  Recent
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2 min-h-[200px] max-h-[400px]">
              {renderTabContent()}
            </div>
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-gray-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full md:bg-transparent md:p-0"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      )}

      {gameOverData && (
        <GameOverOverlay
          {...gameOverData}
          onClose={() => {
            setGameOverData(null); 
            window.history.replaceState({}, document.title);
          }}
        />
      )}
      {showTour && (
          <MissionTour onComplete={() => setShowTour(false)} />
      )}

      {/* سحر ببجي المخصص لشاشات الجوال المقلوبة فقط 🎮 */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }

        @media (max-width: 930px) and (orientation: landscape) {
          .ml-wrapper { padding: 0 !important; }
          .ml-header { display: none !important; }
          .ml-container {
            min-height: 100dvh !important;
            height: 100dvh !important;
            border-radius: 0 !important;
            border: none !important;
            padding: 10px 20px !important;
          }
          .ml-grid { gap: 0 !important; margin: auto 0 !important; }
          .ml-grid-item-bottom { margin-top: 10px !important; margin-bottom: 0 !important; }
          .ml-avatar-top { width: 60px !important; }
          .ml-stage-top { width: 110px !important; margin-top: -5px !important; }
          .ml-avatar-bottom { width: 80px !important; }
          .ml-stage-bottom { width: 150px !important; margin-top: -10px !important; }
          .ml-empty-stage { width: 130px !important; margin-top: -20px !important; }
          .ml-invite-btn { margin-bottom: 5px !important; }
          .ml-footer { padding-top: 5px !important; margin-top: 5px !important; }
          .ml-footer button { padding-top: 8px !important; padding-bottom: 8px !important; font-size: 10px !important; }
        }
      `}</style>
    </MainLayout>
  );
};

export default WaitingRoomPage;