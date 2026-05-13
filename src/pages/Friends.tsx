// src/pages/Friends.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Users, Search, UserPlus, X, Filter, Loader2, Zap, Trophy, ShieldAlert, Clock,ShieldHalf } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Swal from 'sweetalert2';
import { socket } from "../socket"; 
import { BASE_URL } from '../api/auth.js';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('Friends'); 
  const [friends, setFriends] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [socketOnlineIds, setSocketOnlineIds] = useState<string[]>([]);

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('xp-desc'); 

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const token = localStorage.getItem('token');
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const getTimeAgo = (date: string | Date): string => {
    const now = new Date().getTime();
    const past = new Date(date).getTime();
    
    const seconds = Math.floor((now - past) / 1000);
    
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
};
  const HackHeroAlert = Swal.mixin({
    background: '#0f172a',
    color: '#fff',
    confirmButtonColor: '#ff3b6b',
    cancelButtonColor: '#1e293b',
    customClass: { 
      popup: 'rounded-[2rem] border border-white/10 shadow-2xl font-sans',
      container: 'z-[99999]', // لضمان ظهور الإشعار فوق مودال الإضافة
      title: 'font-black italic uppercase tracking-widest text-[#ff3b6b]'
    }
  });

  const getUserAvatar = (user: any) => {
    const style = user.characterStyle || 'saudi-man.png';
    return style.startsWith('/') ? style : `/${style}`;
  };

useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (!storedUser?._id) return;

  const register = () => {
    socket.emit("register_user", {
      userId: storedUser._id,
      onlineStatus: storedUser.onlineStatus || 'Public'
    });
  };

  if (socket.connected) register();
  socket.on("connect", register); 

  const handleUpdate = (ids: string[]) => setSocketOnlineIds(ids);
  socket.on("update_online_users_list", handleUpdate);

  return () => {
    socket.off("connect", register);
    socket.off("update_online_users_list", handleUpdate);
  };
}, []);

  const processedList = useMemo(() => {
    let list = activeTab === 'Friends' ? [...friends] : [...teams];
    
   if (localSearchQuery) {
      list = list.filter(f => {
        const searchTarget = f.username || f.name || f.teamName || "";
        return searchTarget.toLowerCase().includes(localSearchQuery.toLowerCase());
      });
    }

    if (activeTab === 'Friends') {
    list.sort((a, b) => {
      if (sortBy === 'online') {
        const aOnline = socketOnlineIds.includes(a._id);
        const bOnline = socketOnlineIds.includes(b._id);
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;
        return (b.totalScore || 0) - (a.totalScore || 0);
      }
        if (sortBy === 'xp-desc') return (b.totalScore || 0) - (a.totalScore || 0); // أعلى نقاط
        if (sortBy === 'xp-asc') return (a.totalScore || 0) - (b.totalScore || 0);  // أقل نقاط
        return 0;
      });
    }
    return list;
  }, [localSearchQuery, sortBy, friends, teams, activeTab, socketOnlineIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Friends') {
        const res = await axios.get(`${BASE_URL}/social/friends`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFriends(res.data);
      } else {
        const res = await axios.get(`${BASE_URL}/teams/my-teams`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeams(res.data.data);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [token, activeTab]);

  const sendFriendRequest = async (targetUser: any) => {
    try {
      await axios.post(`${BASE_URL}/social/friends/request`, 
        { friendId: targetUser._id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsModalOpen(false); 

      // عرض التنبيه المطلوب
      await HackHeroAlert.fire({
        icon: 'success',
        title: 'Request Sent!',
        text: `A friend request notification has been sent to ${targetUser.username} successfully.`,
        timer: 3000,
        showConfirmButton: false
      });

    } catch (err: any) {
      HackHeroAlert.fire({ icon: 'info', title: 'Note', text: err.response?.data?.message || 'Already pending.' });
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) return setSearchResults([]);
    setSearchLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/auth/users?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data);
    } finally { setSearchLoading(false); }
  };

  const handleDeleteFriend = async (friendshipId: string) => {
    const result = await HackHeroAlert.fire({
      title: 'Are you sure?',
      text: "Remove player?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/social/friends/${friendshipId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
        HackHeroAlert.fire({ icon: 'success', title: 'Removed', timer: 1000, showConfirmButton: false });
      } catch (err) { HackHeroAlert.fire({ icon: 'error', title: 'Error' }); }
    }
  };

  return (
    <MainLayout activePage="friends">
      <div className="bg-[#081020] border border-white/10 rounded-[2.5rem] p-10 min-h-[600px] relative shadow-2xl">
          
          <div className="flex gap-4 mb-10">
              <button onClick={() => setActiveTab('Friends')} className={`px-12 py-3 rounded-2xl text-xl font-black italic transition-all border ${activeTab === 'Friends' ? 'bg-white/5 border-[#ff3b6b] text-[#ff3b6b]' : 'text-gray-500 hover:text-white border-transparent'}`}>Friends</button>
              <button onClick={() => setActiveTab('Team')} className={`px-12 py-3 rounded-2xl text-xl font-black italic transition-all border ${activeTab === 'Team' ? 'bg-white/5 border-[#ff3b6b] text-[#ff3b6b]' : 'text-gray-500 hover:text-white border-transparent'}`}>Team</button>
          </div>

          <div className="flex gap-4 mb-12 items-center">
              <div className="relative flex-1 max-w-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} placeholder={activeTab === 'Friends' ? "Filter Friends by Name" : "Search Team"} className="w-full bg-[#1c2438]/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#ff3b6b]/30 transition-all text-sm text-white italic" />
              </div>

              {activeTab === 'Friends' && (
                <div className="flex gap-3 relative" ref={filterMenuRef}>
                  <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className={`border p-3.5 rounded-2xl transition-all ${isFilterMenuOpen ? 'bg-[#ff3b6b] text-white shadow-lg' : 'bg-[#1c2438]/60 border-white/5 text-[#ff3b6b] hover:bg-white/5'}`}>
                    <Filter size={18} />
                  </button>

                  {isFilterMenuOpen && (
                    <div className="absolute top-16 right-0 w-72 bg-[#0f172a] border border-white/10 rounded-[2rem] p-6 shadow-2xl z-[1000] animate-in zoom-in duration-200">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-[#ff3b6b] mb-4 tracking-widest italic">Sort Friends By</h4>
                            {[
                                { id: 'online', label: 'Online First (Live) 🟢' }, 
                                { id: 'xp-desc', label: 'Highest Points (XP) ⚡' },
                                { id: 'xp-asc', label: 'Lowest Points (XP) 📉' },
                            ].map(opt => (
                                <button key={opt.id} onClick={() => { setSortBy(opt.id); setIsFilterMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold transition-all ${sortBy === opt.id ? 'bg-[#ff3b6b]/10 text-[#ff3b6b] border border-[#ff3b6b]/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                  )}
                  
                  <button onClick={() => setIsEditing(!isEditing)} className={`bg-[#1c2438]/60 border border-white/5 px-6 py-3.5 rounded-2xl text-xs font-bold transition-all ${isEditing ? 'text-[#ff3b6b] border-[#ff3b6b]/50' : 'text-gray-300 hover:text-white'}`}>{isEditing ? 'Done' : 'Edit friend list'}</button>
                  <button onClick={() => setIsModalOpen(true)} className="bg-[#ff3b6b] hover:bg-[#ff3b6b]/90 px-6 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all shadow-lg active:scale-95"><UserPlus size={16} /> Add new Friend</button>
                </div>
              )}
          </div>

          <div className="overflow-x-auto">
              {activeTab === 'Friends' ? (
                <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-gray-500 text-[10px] uppercase font-black tracking-widest px-4 opacity-60">
                          <th className="pb-2 pl-6 text-[#ff3b6b]">#</th>
                          <th className="pb-2">Player</th>
                          <th className="pb-2">Points (XP)</th>
                          <th className="pb-2">Last Game Together</th>
                          <th className="pb-2 text-center">No. of games</th>
                          <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? ( <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#ff3b6b]" /></td></tr> ) : 
                       processedList.length === 0 ? ( <tr><td colSpan={7} className="text-center py-24 opacity-30"><Users size={60} className="mb-4 mx-auto text-gray-600" /><p className="text-lg font-black italic uppercase">No friends found</p></td></tr> ) : (
                        processedList.map((friend, index) => (
                            <tr key={friend._id} className={`bg-white/5 hover:bg-white/10 transition-all border ${isEditing ? 'border-[#ff3b6b]/30 shadow-[0_0_15px_rgba(255,59,107,0.1)]' : 'border-white/5'}`}>
                                <td className="py-4 pl-6 rounded-l-2xl font-black italic text-[#ff3b6b] text-base opacity-40">{index + 1}</td>
                               <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={getUserAvatar(friend)} className="w-10 h-10 rounded-full border border-white/10 object-cover" alt="avatar" />
                                            
                                            {socketOnlineIds.includes(friend._id) && (
                                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#081020] rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                                            )}
                                        </div>
                                        <span className={`font-black italic text-sm tracking-wide ${socketOnlineIds.includes(friend._id) ? 'text-white' : 'text-gray-500'}`}>
                                          {friend.username}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 font-black italic text-sm text-yellow-500">{friend.totalScore || 0} XP</td>
                                <td className="py-4 text-gray-400 text-sm font-medium italic uppercase opacity-60">
                                    { (friend.lastSharedGame && friend.lastSharedGame.toUpperCase() !== "NONE") 
                                        ? friend.lastSharedGame 
                                        : "NEVER" 
                                    }
                                </td>
                                <td className="py-4 text-center font-black text-sm italic opacity-40">
                                    {friend.sharedGamesCount || 0}
                                </td>
                                <td className="py-4 pr-6 rounded-r-2xl text-right">
                                    {isEditing && (
                                      <button onClick={() => handleDeleteFriend(friend.friendshipId)} className="bg-[#ff3b6b] p-2 rounded-full hover:scale-125 transition-all shadow-lg active:bg-red-700 shadow-[#ff3b6b]/30"><X size={14} className="text-white" /></button>
                                    )}
                                </td>
                            </tr>
                        ))
                      )}
                    </tbody>
                </table>
              ) : (
  <div className="grid grid-cols-1 gap-8">
    {loading ? (
      <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#ff3b6b]" /></div>
    ) : processedList.length === 0 ? (
      <div className="text-center py-24 opacity-30">
        <ShieldHalf size={60} className="mb-4 mx-auto text-gray-600" />
        <p className="text-lg font-black italic uppercase tracking-widest">No teams found</p>
      </div>
    ) : (
      processedList.map((team) => {
        const totalGames = (team.performance?.totalWins || 0) + (team.performance?.totalLosses || 0);
        const winRate = totalGames > 0 ? Math.round((team.performance.totalWins / totalGames) * 100) : 0;
        
        const isRace = team.lastGamePlayed?.toLowerCase().includes("race");
        const isEscape = team.lastGamePlayed?.toLowerCase().includes("escape");

        return (
          <div key={team._id} className="relative group overflow-hidden bg-[#0a1120] border-2 border-white/5 rounded-[3.5rem] p-8 hover:border-[#ff3b6b]/50 transition-all duration-500 shadow-2xl hover:shadow-[0_0_50px_rgba(255,59,107,0.1)]">
                
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(255,59,107,0.08),transparent)] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col xl:flex-row justify-start items-center gap-6">
                    
                    <div className="flex items-center gap-5 min-w-[280px]">
                          <div className="w-16 h-16 rounded-[1.8rem] bg-[#1c2438] border border-[#ff3b6b]/30 flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,59,107,0.15)]">
                            <ShieldHalf className="text-[#ff3b6b]" size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4 group-hover:text-[#ff3b6b] transition-colors leading-none">
                                {team.name}
                            </h3>

                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center gap-2 text-[#64748b]">
                                    <Clock size={11} className="text-[#ff3b6b]/60" />
                                    <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">
                                        ACTIVE {getTimeAgo(team.updatedAt || team.createdAt)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-[#64748b]">
                                    <Users size={11} className="text-[#ff3b6b]/60" />
                                    <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">
                                        {team.members?.length} Members
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                      <div className="flex flex-nowrap items-center gap-3">
                          <div className="bg-[#0f172a]/80 border border-white/5 rounded-3xl px-5 py-3 flex flex-col items-center shadow-inner flex-shrink-0 min-w-[100px]">
                            <span className="text-lg font-black text-white italic leading-none">{totalGames}</span>
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">Games Played</span>
                        </div>
                        
                        <div className="bg-[#ff3b6b]/5 border border-[#ff3b6b]/20 rounded-3xl px-5 py-3 flex flex-col items-center shadow-[0_0_15px_rgba(255,59,107,0.05)] flex-shrink-0 min-w-[100px]">
                            <span className="text-lg font-black text-[#ff3b6b] italic leading-none">{winRate}%</span>
                            <span className="text-[7px] font-black text-[#ff3b6b]/40 uppercase tracking-[0.2em] mt-1">Efficiency</span>
                        </div>

                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-full px-5 py-3 flex items-center gap-3 flex-shrink-0 min-w-max whitespace-nowrap">
                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${isRace ? 'bg-yellow-500/10' : isEscape ? 'bg-emerald-500/10' : 'bg-cyan-500/10'}`}>
                                {isRace ? <Zap size={14} className="text-yellow-400" /> : 
                                 isEscape ? <ShieldAlert size={14} className="text-emerald-400" /> : 
                                 <Trophy size={14} className="text-cyan-400" />}
                            </div>
                            <div className="flex flex-col pr-1 ">
                                <span className="text-[10px] font-black text-white italic uppercase tracking-tight leading-none">
                                    {team.lastGamePlayed || "Cyber Mission"}
                                </span>
                                <span className="text-[6.5px] font-bold text-gray-500 uppercase tracking-widest mt-1">Last Game</span>
                            </div>
                        </div>
                    </div>

                    {/* 👥 الأعضاء: تم تقليل المسافة (xl:items-center) وإصلاح الـ Tooltip */}
                    <div className="flex flex-col items-center xl:items-center gap-2 min-w-[120px]">
                        <span className="text-[8px] font-black text-[#64748b] uppercase tracking-[0.3em] italic">Members</span>
                        <div className="flex -space-x-3">
                            {team.members?.map((member: any, i: number) => (
                                <div key={i} className="relative group/avatar">
                                    <img 
                                        src={getUserAvatar(member)} 
                                        className="w-10 h-10 rounded-full border-[3px] border-[#0a1120] object-cover ring-1 ring-white/10 group-hover/avatar:scale-125 group-hover/avatar:z-50 group-hover/avatar:ring-[#ff3b6b] transition-all cursor-help"
                                        alt="member"
                                    />
                                    {/* إصلاح الـ Tooltip ليظهر اسم العضو بوضوح */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#ff3b6b] text-white text-[8px] px-2 py-1 rounded-md opacity-0 group-hover/avatar:opacity-100 transition-all pointer-events-none uppercase font-black whitespace-nowrap z-[60] shadow-xl">
                                        {member.username || "Agent"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <button onClick={() => handleDeleteFriend(team._id)} className="absolute -top-1 -right-1 bg-[#ff3b6b] text-white p-2 rounded-full hover:scale-110 transition-all border-4 border-[#0a1120] shadow-xl">
                        <X size={14} />
                    </button>
                )}
            </div>
        );
    }))}
</div>
)}
          </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[3rem] p-12 shadow-2xl animate-in zoom-in duration-300">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"><X size={28} /></button>
                <h2 className="text-3xl font-black italic uppercase text-center mb-8 tracking-wider text-[#ff3b6b]">Add new Friend</h2>
                <div className="space-y-6">
                    <div className="relative">
                        <input type="text" value={searchQuery} onChange={(e) => handleSearchUsers(e.target.value)} placeholder="Type username..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#ff3b6b]/50 transition-all font-bold italic text-white" />
                        <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {searchLoading ? ( <div className="flex justify-center py-4"><Loader2 className="animate-spin text-[#ff3b6b]" /></div> ) : (
                            searchResults.map(user => (
                                <div key={user._id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <img src={getUserAvatar(user)} className="w-12 h-12 rounded-full border border-[#ff3b6b]/20 p-0.5 object-cover" alt="user" />
                                        <div>
                                            <p className="font-black italic text-base text-white tracking-wide">{user.username}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter italic">FOR PLAY</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => sendFriendRequest(user)} className="bg-[#ff3b6b] text-[10px] font-black uppercase px-6 py-2.5 rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95 font-sans">Add</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Friends;