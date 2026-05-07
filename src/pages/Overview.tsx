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
      <div className="w-full max-w-[1400px] mx-auto flex flex-col flex-1 pb-10 px-4">
        
        <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-gray-400 hover:text-white mb-6 w-fit group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="border border-white/10 rounded-[2.5rem] p-10 w-full bg-[#050810]/50 backdrop-blur-2xl shadow-2xl">
          
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <h1 className="text-3xl font-black tracking-[0.3em] text-white italic uppercase">OVERVIEW</h1>
            <div className="h-[2px] w-20 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {data?.performance?.map((game: any, index: number) => (
              <div key={index} className={`bg-[#121620]/80 border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all shadow-lg group ${!game.played && 'opacity-40'}`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-[13px] text-white uppercase group-hover:text-cyan-400 transition-colors italic">{game.gameName}</h3>
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

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-[#121620]/80 border border-white/5 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><Clock size={20} /></div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Recent Activity</h2>
              </div>
              
              <div className="space-y-4">
                {data?.history?.map((activity: any, index: number) => {
                  const isAchievement = activity.type === 'ACHIEVEMENT';
              
                  const milestones: Record<number, string> = { 6: "INTERMEDIATE", 11: "ADVANCED", 16: "EXPERT", 21: "MASTERED" };
                  
                  // الترقية اللحظية في القمة
                  const isRankUp = !isAchievement && activity.status === 'Win' && milestones[activity.level] && 
                    !data.history.slice(0, index).some((h: any) => 
                      (h.gameId?._id || h.gameId) === (activity.gameId?._id || activity.gameId) && h.level === activity.level
                    );

                  return (
                    <div key={activity._id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isRankUp ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className="flex items-center gap-4">
                        {(isAchievement || isRankUp) ? (
                          <Trophy className={`${isRankUp ? 'text-yellow-400' : 'text-orange-400'} animate-pulse`} size={20} />
                        ) : (
                          <CheckCircle2 className={activity.status === 'Win' ? 'text-green-400' : 'text-red-500'} size={20} />
                        )}

                        <div>
                          <p className="font-bold text-[14px] uppercase text-white">
                            {isAchievement ? `UNLOCKED: ${activity.name}` : 
                             isRankUp ? `RANK PROMOTED: ${milestones[activity.level]}` : 
                             `${activity.status} IN ${activity.gameName}`}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {isRankUp ? `Elite Access in ${activity.gameName}` : new Date(activity.playedAt || activity.unlockedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {isAchievement ? (
                        <span className="text-[10px] font-black bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full border border-orange-500/30 uppercase tracking-tighter">New Badge</span>
                      ) : isRankUp ? (
                        <span className="text-[10px] font-black bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30 animate-bounce uppercase tracking-tighter">Level Up!</span>
                      ) : (
                        <div className="flex flex-col items-end justify-center">
                            {/* 🟢 تم حذف سطر الـ LVL الصغير هنا بناءً على طلبكِ */}
                            <span className="font-black italic text-cyan-400">+{activity.scoreEarned} XP</span>
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

            <div className="lg:col-span-2 bg-[#121620]/80 border border-white/5 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Trophy size={20} /></div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Top Friends</h2>
              </div>
              <div className="space-y-4">
                {data?.topFriends?.length > 0 ? data.topFriends.map((player: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={player.avatar?.startsWith('/') ? player.avatar : `/${player.avatar}`} 
                          className="w-12 h-12 rounded-full border border-white/10 object-cover shadow-lg group-hover:border-cyan-500/50 transition-colors" 
                          alt="avatar" 
                        />
                        {index < 3 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-600 text-[10px] flex items-center justify-center font-black shadow-lg">
                            #{index+1}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black uppercase text-sm italic text-gray-200 group-hover:text-cyan-400 transition-colors tracking-tight">
                          {player.name}
                        </span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Active Operative</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-md font-black italic text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                        {player.points?.toLocaleString()} 
                      </span>
                      <span className="text-[8px] font-black text-gray-600 uppercase">Credits</span>
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