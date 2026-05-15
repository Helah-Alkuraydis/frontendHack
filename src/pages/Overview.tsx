import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, Trophy, CheckCircle2, Loader2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { BASE_URL } from '../api/auth.js';

const Overview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const gameColors: Record<string, string> = {
    "Phishing Hunter": "from-[#00b4d8] to-[#0077b6]",
    "Cyber Escape Room": "from-[#7b2cbf] to-[#3c096c]",
    "Firewall Defender": "from-[#00b4d8] to-[#0077b6]",
    "Password Maker/Breaker": "from-[#fca311] to-[#e85d04]",
    "Hack Race": "from-[#10b981] to-[#059669]",
    "Secure Coding Challenge": "from-[#e11d48] to-[#9f1239]",
    "Privacy Awareness": "from-[#6366f1] to-[#4338ca]"
  };

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userRes = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const res = await axios.get(`${BASE_URL}/dashboard/${userRes.data._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchOverviewData();
  }, []);

  if (loading) return (
    <MainLayout activePage="dashboard">
      <div className="flex justify-center items-center h-[600px]"><Loader2 className="animate-spin text-cyan-400" size={50} /></div>
    </MainLayout>
  );

  return (
    <MainLayout activePage="dashboard">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col flex-1 pb-10 px-4 md:px-6 lg:px-4">
        
        <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-gray-400 hover:text-white mb-4 lg:mb-6 w-fit group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="border border-white/10 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-10 w-full bg-[#050810]/50 backdrop-blur-2xl shadow-2xl">
          
          <div className="flex items-center justify-center gap-2 lg:gap-4 mb-8 lg:mb-10">
            <div className="h-[2px] w-12 lg:w-20 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <h1 className="text-xl lg:text-3xl font-black tracking-[0.2em] lg:tracking-[0.3em] text-white italic uppercase text-center">OVERVIEW</h1>
            <div className="h-[2px] w-12 lg:w-20 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
            {data?.performance?.map((game: any, index: number) => (
              <div key={index} className={`bg-[#121620]/80 border border-white/5 rounded-2xl p-4 lg:p-5 hover:border-white/20 transition-all shadow-lg group ${!game.played && 'opacity-40'}`}>
                <div className="flex justify-between items-start mb-3 lg:mb-4">
                    <h3 className="font-bold text-[12px] lg:text-[13px] text-white uppercase group-hover:text-cyan-400 transition-colors italic">{game.gameName}</h3>
                    <span className="text-[7px] bg-white/10 px-2 py-0.5 rounded text-cyan-400 font-black tracking-widest uppercase">{game.category}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-gray-500 mb-2 uppercase italic">
                  <span>{game.played ? 'Win Rate' : 'Not Played'}</span>
                  <span className="text-white">{game.winRate}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${gameColors[game.gameName] || 'from-gray-500 to-gray-700'} rounded-full transition-all duration-1000`} style={{ width: `${game.winRate}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* قسم النشاطات (Recent Activity) */}
            <div className="lg:col-span-3 bg-[#121620]/80 border border-white/5 rounded-2xl p-5 lg:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><Clock size={18} className="lg:w-5 lg:h-5" /></div>
                <h2 className="text-lg lg:text-xl font-black italic uppercase tracking-tighter">Recent Activity</h2>
              </div>
              
              <div className="space-y-3 lg:space-y-4">
                {/* 🔥 هنا أضفنا slice(0, 5) عشان نعرض أحدث 5 بس، وشلنا كود الإخفاء 🔥 */}
                {data?.history?.slice(0, 5).map((activity: any, index: number) => {
                  const isAchievement = activity.type === 'ACHIEVEMENT';
                  const milestones: Record<number, string> = { 6: "INTERMEDIATE", 11: "ADVANCED", 16: "EXPERT", 21: "MASTERED" };
                  
                  const isRankUp = !isAchievement && activity.status === 'Win' && milestones[activity.level] && 
                    !data.history.slice(0, index).some((h: any) => 
                      (h.gameId?._id || h.gameId) === (activity.gameId?._id || activity.gameId) && h.level === activity.level
                    );

                  return (
                    <div key={activity._id} className={`flex items-center justify-between p-3 lg:p-4 rounded-xl border transition-all ${isRankUp ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className="flex items-center gap-3 lg:gap-4">
                        {(isAchievement || isRankUp) ? (
                          <Trophy className={`${isRankUp ? 'text-yellow-400' : 'text-orange-400'} animate-pulse w-4 h-4 lg:w-5 lg:h-5`} />
                        ) : (
                          <CheckCircle2 className={`${activity.status === 'Win' ? 'text-green-400' : 'text-red-500'} w-4 h-4 lg:w-5 lg:h-5`} />
                        )}

                        <div>
                          <p className="font-bold text-[11px] lg:text-[14px] uppercase text-white">
                            {isAchievement ? `UNLOCKED: ${activity.name}` : 
                             isRankUp ? `RANK PROMOTED: ${milestones[activity.level]}` : 
                             `${activity.status} IN ${activity.gameName}`}
                          </p>
                          <p className="text-[9px] lg:text-[10px] text-gray-500 font-mono mt-0.5">
                            {isRankUp ? `Elite Access in ${activity.gameName}` : new Date(activity.playedAt || activity.unlockedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {isAchievement ? (
                        <span className="text-[8px] lg:text-[10px] font-black bg-orange-500/20 text-orange-400 px-2 py-1 lg:px-3 rounded-full border border-orange-500/30 uppercase tracking-tighter whitespace-nowrap">New Badge</span>
                      ) : isRankUp ? (
                        <span className="text-[8px] lg:text-[10px] font-black bg-yellow-500/20 text-yellow-400 px-2 py-1 lg:px-3 rounded-full border border-yellow-500/30 animate-bounce uppercase tracking-tighter whitespace-nowrap">Level Up!</span>
                      ) : (
                        <div className="flex flex-col items-end justify-center">
                            <span className="font-black italic text-cyan-400 text-[11px] lg:text-[14px] whitespace-nowrap">+{activity.scoreEarned} XP</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {(!data?.history || data.history.length === 0) && (
                    <div className="py-10 text-center text-gray-600 italic uppercase text-xs">No recent movements detected</div>
                )}
              </div>
            </div>

            {/* قسم الأصدقاء (Top Friends) */}
            <div className="lg:col-span-2 bg-[#121620]/80 border border-white/5 rounded-2xl p-5 lg:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Trophy size={18} className="lg:w-5 lg:h-5" /></div>
                <h2 className="text-lg lg:text-xl font-black italic uppercase tracking-tighter">Top Friends</h2>
              </div>
              <div className="space-y-3 lg:space-y-4">
                {data?.topFriends?.length > 0 ? data.topFriends.map((player: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 lg:p-5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="relative">
                        <img 
                          src={player.avatar?.startsWith('/') ? player.avatar : `/${player.avatar}`} 
                          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-white/10 object-cover shadow-lg group-hover:border-cyan-500/50 transition-colors" 
                          alt="avatar" 
                        />
                        {index < 3 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-600 text-[9px] lg:text-[10px] flex items-center justify-center font-black shadow-lg">
                            #{index+1}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black uppercase text-xs lg:text-sm italic text-gray-200 group-hover:text-cyan-400 transition-colors tracking-tight">
                          {player.name}
                        </span>
                        <span className="text-[8px] lg:text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Active Operative</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm lg:text-md font-black italic text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                        {player.points?.toLocaleString()} 
                      </span>
                      <span className="text-[7px] lg:text-[8px] font-black text-gray-600 uppercase mt-0.5">Credits</span>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center text-gray-600 italic font-bold uppercase text-xs tracking-widest">No friends found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Overview;