// src/pages/Friends.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Users, Search, UserPlus, X, Filter, Loader2, Zap, Trophy, ShieldAlert, Clock, ShieldHalf } from 'lucide-react';
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
      container: 'z-[99999]',
      title: 'font-black italic uppercase tracking-widest text-[#ff3b6b]'
    }
  });

  const getUserAvatar = (user: any) => {
    const style = user.characterStyle || 'saudi-man.png';
    return style.startsWith('/') ? style : `/${style}`;
  };

 useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (storedUser?._id) {
    socket.emit("register_user", {
      userId: storedUser._id,
      onlineStatus: storedUser.onlineStatus || 'Public'
    });
  }

  const handleUpdate = (ids: string[]) => {
    console.log("Friends Page - Online IDs (Privacy Enabled):", ids);
    setSocketOnlineIds(ids);
  };

  socket.on("update_online_users_list", handleUpdate);

  return () => {
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

        if (sortBy === 'xp-desc') return (b.totalScore || 0) - (a.totalScore || 0); 
        if (sortBy === 'xp-asc') return (a.totalScore || 0) - (b.totalScore || 0);  
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
      
      // إغلاق المودال أولاً لضمان تجربة مستخدم سريعة
      setIsModalOpen(false); 

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

      {/* 🚀 Wrapper للحماية من السايد بار 🚀 */}
      <div className="w-full max-w-[1400px] mx-auto flex flex-col flex-1 pb-10 px-4 md:px-6">
        
        {/* تقليل الـ Padding بالجوال */}
        <div className="bg-[#081020] border border-white/10 rounded-3xl md:rounded-[2.5rem] p-5 md:p-10 min-h-[600px] relative shadow-2xl w-full">
            
            {/* 🎯 Tabs */}
            <div className="flex w-full md:w-auto gap-2 md:gap-4 mb-8 md:mb-10">
                <button onClick={() => setActiveTab('Friends')} className={`flex-1 md:flex-none px-4 md:px-12 py-3 rounded-xl md:rounded-2xl text-sm md:text-xl font-black italic transition-all border ${activeTab === 'Friends' ? 'bg-white/5 border-[#ff3b6b] text-[#ff3b6b]' : 'text-gray-500 hover:text-white border-transparent'}`}>Friends</button>
                <button onClick={() => setActiveTab('Team')} className={`flex-1 md:flex-none px-4 md:px-12 py-3 rounded-xl md:rounded-2xl text-sm md:text-xl font-black italic transition-all border ${activeTab === 'Team' ? 'bg-white/5 border-[#ff3b6b] text-[#ff3b6b]' : 'text-gray-500 hover:text-white border-transparent'}`}>Team</button>
            </div>


            {/* 🎯 Search & Action Bar */}
            <div className="flex flex-col xl:flex-row gap-4 mb-8 md:mb-12 items-center w-full">
                <div className="relative flex-1 w-full xl:max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="text" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} placeholder={activeTab === 'Friends' ? "Filter Friends by Name" : "Search Team"} className="w-full bg-[#1c2438]/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#ff3b6b]/30 transition-all text-xs md:text-sm text-white italic" />
                </div>

                {activeTab === 'Friends' && (
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 md:gap-3 w-full xl:w-auto relative" ref={filterMenuRef}>
                    <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className={`flex-1 sm:flex-none border p-3 rounded-2xl transition-all flex items-center justify-center ${isFilterMenuOpen ? 'bg-[#ff3b6b] text-white shadow-lg' : 'bg-[#1c2438]/60 border-white/5 text-[#ff3b6b] hover:bg-white/5'}`}>
                      <Filter size={18} />
                    </button>

                    {isFilterMenuOpen && (
                      <div className="absolute top-14 left-0 sm:left-auto sm:right-0 w-[calc(100%-1rem)] sm:w-72 bg-[#0f172a] border border-white/10 rounded-[2rem] p-6 shadow-2xl z-[100] animate-in zoom-in duration-200">
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
                    
                    <button onClick={() => setIsEditing(!isEditing)} className={`flex-1 sm:flex-none bg-[#1c2438]/60 border border-white/5 px-4 md:px-6 py-3 rounded-2xl text-[11px] md:text-xs font-bold transition-all whitespace-nowrap ${isEditing ? 'text-[#ff3b6b] border-[#ff3b6b]/50' : 'text-gray-300 hover:text-white'}`}>{isEditing ? 'Done' : 'Edit List'}</button>
                    <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none bg-[#ff3b6b] hover:bg-[#ff3b6b]/90 px-4 md:px-6 py-3 rounded-2xl font-black text-[11px] md:text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 whitespace-nowrap"><UserPlus size={16} /> <span className="hidden sm:inline">Add Friend</span><span className="sm:hidden">Add</span></button>
                  </div>
                )}
            </div>

            <div className="w-full">
                {activeTab === 'Friends' ? (
                  <div className="w-full">
                      {/* 🚀 عناوين الجدول (تظهر باللابتوب فقط) 🚀 */}
                      <div className="hidden lg:grid grid-cols-12 text-gray-500 text-[10px] uppercase font-black tracking-widest px-6 pb-4 opacity-60 text-left border-b border-white/5 mb-4">
                          <div className="col-span-1 text-[#ff3b6b]">#</div>
                          <div className="col-span-4">Player</div>
                          <div className="col-span-2">Points (XP)</div>
                          <div className="col-span-3">Last Game Together</div>
                          <div className="col-span-2 text-center">No. of games</div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {loading ? ( 
                          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#ff3b6b]" /></div> 
                        ) : processedList.length === 0 ? ( 
                          <div className="text-center py-24 opacity-30"><Users size={60} className="mb-4 mx-auto text-gray-600" /><p className="text-lg font-black italic uppercase">No friends found</p></div> 
                        ) : (
                          processedList.map((friend, index) => (
                              // 🚀 كرت اللاعب (بالجوال كرت نازل تحت بعض، باللابتوب جدول מסطّر) 🚀
                              <div key={friend._id} className={`flex flex-col lg:grid lg:grid-cols-12 items-center bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 lg:py-3 lg:px-6 border ${isEditing ? 'border-[#ff3b6b]/30 shadow-[0_0_15px_rgba(255,59,107,0.1)]' : 'border-white/5'} gap-3 lg:gap-0 relative`}>
                                  
                                  {/* الترتيب (للابتوب فقط) */}
                                  <div className="hidden lg:block col-span-1 font-black italic text-[#ff3b6b] text-base opacity-40">{index + 1}</div>
                                  
                                  {/* بيانات اللاعب */}
                                  <div className="w-full lg:col-span-4 flex justify-between items-center lg:justify-start">
                                      <div className="flex items-center gap-3">
                                          <div className="relative">
                                              <img src={getUserAvatar(friend)} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-white/10 object-cover" alt="avatar" />
                                              {socketOnlineIds.includes(friend._id) && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#081020] rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                                              )}
                                          </div>
                                          <span className={`font-black italic text-sm lg:text-base tracking-wide ${socketOnlineIds.includes(friend._id) ? 'text-white' : 'text-gray-500'}`}>
                                            {friend.username}
                                          </span>
                                      </div>
                                      {/* الـ XP للجوال فقط عشان يكون جنب الاسم */}
                                      <div className="lg:hidden font-black italic text-sm text-yellow-500">{friend.totalScore || 0} XP</div>
                                  </div>

                                  {/* الـ XP للابتوب فقط */}
                                  <div className="hidden lg:block col-span-2 font-black italic text-sm text-yellow-500">{friend.totalScore || 0} XP</div>
                                  
                                  {/* اخر لعبة */}
                                  <div className="w-full lg:col-span-3 flex justify-between lg:justify-start items-center text-gray-400 text-[11px] lg:text-sm font-medium italic uppercase opacity-60">
                                      <span className="lg:hidden text-[9px] font-black tracking-widest opacity-50">LAST GAME:</span>
                                      { (friend.lastSharedGame && friend.lastSharedGame.toUpperCase() !== "NONE") ? friend.lastSharedGame : "NEVER" }
                                  </div>
                                  
                                  {/* عدد الالعاب */}
                                  <div className="w-full lg:col-span-2 flex justify-between lg:justify-center items-center font-black text-sm italic opacity-40">
                                      <span className="lg:hidden text-[9px] font-black tracking-widest opacity-50 uppercase">GAMES PLAYED:</span>
                                      {friend.sharedGamesCount || 0}
                                  </div>

                                  {/* زر الحذف */}
                                  {isEditing && (
                                    <div className="absolute top-2 right-2 lg:relative lg:top-0 lg:right-0 lg:col-span-1 flex justify-end w-full lg:w-auto">
                                      <button onClick={() => handleDeleteFriend(friend.friendshipId)} className="bg-[#ff3b6b] p-2 rounded-full hover:scale-125 transition-all shadow-lg active:bg-red-700 shadow-[#ff3b6b]/30 z-10"><X size={14} className="text-white" /></button>
                                    </div>
                                  )}
                              </div>
                          ))
                        )}
                      </div>
                  </div>
                ) : (
    <div className="grid grid-cols-1 gap-6 md:gap-8">
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
            <div key={team._id} className="relative group overflow-hidden bg-[#0a1120] border-2 border-white/5 rounded-3xl md:rounded-[3.5rem] p-5 md:p-8 hover:border-[#ff3b6b]/50 transition-all duration-500 shadow-2xl hover:shadow-[0_0_50px_rgba(255,59,107,0.1)]">
                  
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(255,59,107,0.08),transparent)] pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col xl:flex-row justify-start items-start xl:items-center gap-6">
                      
                      {/* بيانات الفريق */}
                      <div className="flex items-center gap-4 md:gap-5 w-full xl:w-auto xl:min-w-[280px]">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.8rem] bg-[#1c2438] border border-[#ff3b6b]/30 flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,59,107,0.15)] flex-shrink-0">
                              <ShieldHalf className="text-[#ff3b6b] w-6 h-6 md:w-8 md:h-8" />
                          </div>
                          <div className="text-left overflow-hidden w-full">
                              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white mb-2 md:mb-4 group-hover:text-[#ff3b6b] transition-colors leading-none truncate">
                                  {team.name}
                              </h3>

                              <div className="flex flex-col gap-1.5 md:gap-2.5">
                                  <div className="flex items-center gap-2 text-[#64748b]">
                                      <Clock size={10} className="text-[#ff3b6b]/60 md:w-3 md:h-3" />
                                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest italic leading-none">
                                          ACTIVE {getTimeAgo(team.updatedAt || team.createdAt)}
                                      </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-[#64748b]">
                                      <Users size={10} className="text-[#ff3b6b]/60 md:w-3 md:h-3" />
                                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest italic leading-none">
                                          {team.members?.length} Members
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>

                        {/* إحصائيات الفريق: flex-wrap عشان تنزل سطر جديد بالشاشات الصغيرة */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 md:gap-3 w-full xl:w-auto">
                            <div className="bg-[#0f172a]/80 border border-white/5 rounded-2xl md:rounded-3xl px-4 py-2 md:px-5 md:py-3 flex flex-col items-center shadow-inner flex-1 sm:flex-none sm:min-w-[100px]">
                              <span className="text-base md:text-lg font-black text-white italic leading-none">{totalGames}</span>
                              <span className="text-[6px] md:text-[7px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1 text-center">Games Played</span>
                          </div>
                          
                          <div className="bg-[#ff3b6b]/5 border border-[#ff3b6b]/20 rounded-2xl md:rounded-3xl px-4 py-2 md:px-5 md:py-3 flex flex-col items-center shadow-[0_0_15px_rgba(255,59,107,0.05)] flex-1 sm:flex-none sm:min-w-[100px]">
                              <span className="text-base md:text-lg font-black text-[#ff3b6b] italic leading-none">{winRate}%</span>
                              <span className="text-[6px] md:text-[7px] font-black text-[#ff3b6b]/40 uppercase tracking-[0.2em] mt-1 text-center">Efficiency</span>
                          </div>

                          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl sm:rounded-full px-4 py-2 md:px-5 md:py-3 flex items-center gap-2 md:gap-3 w-full sm:w-auto sm:min-w-max">
                              <div className={`p-1.5 rounded-lg flex-shrink-0 ${isRace ? 'bg-yellow-500/10' : isEscape ? 'bg-emerald-500/10' : 'bg-cyan-500/10'}`}>
                                  {isRace ? <Zap size={14} className="text-yellow-400" /> : 
                                   isEscape ? <ShieldAlert size={14} className="text-emerald-400" /> : 
                                   <Trophy size={14} className="text-cyan-400" />}
                              </div>
                              <div className="flex flex-col pr-1 overflow-hidden">
                                  <span className="text-[9px] md:text-[10px] font-black text-white italic uppercase tracking-tight leading-none truncate">
                                      {team.lastGamePlayed || "Cyber Mission"}
                                  </span>
                                  <span className="text-[6px] md:text-[6.5px] font-bold text-gray-500 uppercase tracking-widest mt-1">Last Game</span>
                              </div>
                          </div>
                      </div>

                      {/* 👥 الأعضاء */}
                      <div className="flex flex-col items-start xl:items-center gap-2 w-full xl:w-auto xl:min-w-[120px] mt-2 xl:mt-0">
                          <span className="text-[7px] md:text-[8px] font-black text-[#64748b] uppercase tracking-[0.3em] italic">Members</span>
                          <div className="flex -space-x-2 md:-space-x-3">
                              {team.members?.map((member: any, i: number) => (
                                  <div key={i} className="relative group/avatar">
                                      <img 
                                          src={getUserAvatar(member)} 
                                          className="w-8 h-8 md:w-10 md:h-10 rounded-full border-[2px] md:border-[3px] border-[#0a1120] object-cover ring-1 ring-white/10 group-hover/avatar:scale-125 group-hover/avatar:z-50 group-hover/avatar:ring-[#ff3b6b] transition-all cursor-help"
                                          alt="member"
                                      />
                                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#ff3b6b] text-white text-[8px] px-2 py-1 rounded-md opacity-0 group-hover/avatar:opacity-100 transition-all pointer-events-none uppercase font-black whitespace-nowrap z-[60] shadow-xl">
                                          {member.username || "Agent"}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {isEditing && (
                      <button onClick={() => handleDeleteFriend(team._id)} className="absolute top-2 right-2 md:-top-1 md:-right-1 bg-[#ff3b6b] text-white p-2 rounded-full hover:scale-110 transition-all border-2 md:border-4 border-[#0a1120] shadow-xl z-20">
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
      </div>

      {/* مودال الإضافة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            {/* 🚀 تحديد أقصى ارتفاع للمودال عشان ما ينعفص بالجوال 🚀 */}
            <div className="relative w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-hidden flex flex-col">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 md:top-8 md:right-8 text-gray-500 hover:text-white transition-colors z-10"><X size={24} className="md:w-7 md:h-7" /></button>
                <h2 className="text-xl md:text-3xl font-black italic uppercase text-center mb-6 md:mb-8 tracking-wider text-[#ff3b6b] mt-2">Add new Friend</h2>
                
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="relative mb-6">
                        <input type="text" value={searchQuery} onChange={(e) => handleSearchUsers(e.target.value)} placeholder="Type username..." className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:outline-none focus:border-[#ff3b6b]/50 transition-all font-bold italic text-white text-sm" />
                        <Search className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    </div>
                    
                    <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar flex-1">
                        {searchLoading ? ( <div className="flex justify-center py-4"><Loader2 className="animate-spin text-[#ff3b6b]" /></div> ) : (
                            searchResults.map(user => (
                                <div key={user._id} className="flex items-center justify-between bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <img src={getUserAvatar(user)} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#ff3b6b]/20 p-0.5 object-cover" alt="user" />
                                        <div>
                                            <p className="font-black italic text-sm md:text-base text-white tracking-wide">{user.username}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                                <p className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-tighter italic">FOR PLAY</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => sendFriendRequest(user)} className="bg-[#ff3b6b] text-[9px] md:text-[10px] font-black uppercase px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95 font-sans">Add</button>
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