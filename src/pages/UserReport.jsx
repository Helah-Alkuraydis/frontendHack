import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout'; 
import { ArrowLeft, Trophy, Target, Activity, Clock, ShieldAlert, Globe, Zap, ChevronRight } from 'lucide-react';

const UserReport = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/admin-task/users-management/report/${userId}`);
                setReportData(res.data);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [userId]);

    if (loading) return <AdminLayout activePage="admin-users"><div className="h-screen flex items-center justify-center text-blue-500 font-black italic animate-pulse tracking-[0.5em]">DECRYPTING DOSSIER...</div></AdminLayout>;
    
    if (!reportData || !reportData.profile) {
        return <AdminLayout activePage="admin-users"><div className="text-white p-10 font-mono text-center">ENCRYPTED DATA CORRUPTED.</div></AdminLayout>;
    }

    return (
        <AdminLayout activePage="admin-users">
            <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in zoom-in duration-1000 pb-24 px-4">
                                                 <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all uppercase font-black text-[9px] tracking-[0.3em] mb-2">
                                <ArrowLeft size={12} /> Return to Users
                            </button>   
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-[#0d111a]/80 border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">

                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="relative flex flex-col items-center">
                            <div className="w-40 h-40 rounded-[2.8rem] bg-gradient-to-b from-[#3b82f6] to-[#1e40af] p-0.5 shadow-[0_15px_40px_rgba(59,130,246,0.4)] overflow-hidden">
                                <img 
                                    src={`/${reportData.profile.avatar || 'Avatar.png'}`} 
                                    className="w-full h-full object-cover rounded-[2.6rem]" 
                                    alt="Agent Avatar" 
                                />
                            </div>
                            <div className="absolute -bottom-3 bg-[#3b82f6] text-white font-black italic text-[9px] px-6 py-2 rounded-full uppercase tracking-widest shadow-xl border border-blue-400/50">
                                Verified Agent
                            </div>
                        </div>

                       <div className="text-center md:text-left space-y-2">
    {/* اسم العميل مع مسافة أسفله */}
    <h1 className="text-7xl font-black italic uppercase tracking-tighter text-white leading-none mb-6">
        {reportData.profile.username}
    </h1>

    {/* خط ديكوري نحيف جداً يفصل بين الاسم والبيانات (اختياري لكنه جميل) */}
    <div className="w-24 h-[1px] bg-gradient-to-r from-blue-500/50 to-transparent mb-8"></div>

    {/* حاوية البيانات مع مسافة علوية كبيرة mt-10 */}
    <div className="flex flex-col gap-2 mt-10">
        <p className="text-blue-400 font-mono text-[11px] uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
            <span className="text-gray-500 w-24 inline-block">Email:</span> 
            <span className="text-blue-300/90">{reportData.profile.email}</span>
        </p>
        
        <p className="text-blue-400 font-mono text-[11px] uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
            <span className="text-gray-500 w-24 inline-block">JOINED:</span> 
            <span className="text-blue-300/90">
                {new Date(reportData.profile.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
        </p>
    </div>
</div>
</div>

                    <div className="bg-white/5 border border-white/5 px-10 py-6 rounded-[2.5rem] text-center backdrop-blur-xl relative group-hover:border-yellow-500/20 transition-all duration-500">
                        <Zap size={20} className="absolute top-4 right-4 text-yellow-500/20 group-hover:animate-bounce" />
                        <span className="block text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Total Points</span>
                        <span className="text-5xl font-black text-yellow-500 italic drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                            {reportData.performance?.totalXP || 0} <small className="text-sm not-italic opacity-50 uppercase">XP</small>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={<Trophy />} label="Global Rank" value={`#${reportData.performance?.globalRank || '?'}`} color="#facc15" />
                    <StatCard icon={<Clock />} label="Last Activity" value={new Date(reportData.profile.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} color="#10b981" />
                    <StatCard icon={<Activity />} label="Weekly Success" value={reportData.weeklyWins || 0} color="#3b82f6" />
                    <StatCard icon={<Globe />} label="Public Success" value={reportData.publicChallenges?.wins || 0} color="#a855f7" />
                </div>

                <div className="bg-[#0a0f1d]/60 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-black italic uppercase text-white flex items-center gap-3">
                            <Target className="text-red-500" size={24} /> Track Plays Of Games
                        </h3>
                        <div className="h-1 flex-1 mx-10 bg-gradient-to-r from-red-500/20 to-transparent rounded-full"></div>
                    </div>
                    
                    <div className="p-4 overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-gray-500 text-[9px] uppercase tracking-[0.3em] px-6">
                                    <th className="pb-4 pl-10">Game Name</th>
                                    <th className="pb-4 text-center">Deployments (Played)</th>
                                    <th className="pb-4 text-center">Efficiency Rate</th>
                                    <th className="pb-4 text-center">Wins</th>
                                    <th className="pb-4 text-center">Losses</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.performance?.gameStats?.map((game, idx) => {
                                    const winRate = game.totalPlayed > 0 ? Math.round((game.wins / game.totalPlayed) * 100) : 0;
                                    return (
                                        <tr key={idx} className="group transition-all">
                                            <td className="py-6 pl-10 bg-white/[0.02] rounded-l-[2rem] border-y border-l border-white/5">
                                                <div className="text-lg font-black italic uppercase text-white group-hover:text-blue-400 transition-colors">
                                                    {game.gameDetails?.gameName}
                                                </div>
                                                <div className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">{game.gameDetails?.category}</div>
                                            </td>
                                            <td className="py-6 text-center bg-white/[0.02] border-y border-white/5 text-white font-mono text-xl">
                                                {game.totalPlayed}
                                            </td>
                                           <td className="py-6 px-10 bg-white/[0.02] border-y border-white/5">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-4 w-full justify-center">
                                                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[100px] relative">
                                                            <div 
                                                                className={`h-full transition-all duration-1000 ${winRate > 50 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'}`} 
                                                                style={{ width: `${winRate}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-mono font-black text-white">{winRate}%</span>
                                                    </div>
                                                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-tighter italic">
                                                        Win {game.wins} of {game.totalPlayed}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-6 text-center bg-white/[0.02] border-y border-white/5 text-emerald-400 font-black italic text-xl">
                                                {game.wins}
                                            </td>
                                            <td className="py-6 text-center bg-white/[0.02] rounded-r-[2rem] border-y border-r border-white/5 text-red-500/40 font-black italic text-xl">
                                                {game.losses}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Community Engagement HUD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EngagementCard 
                        title="Total Public Played" 
                        value={reportData.publicChallenges?.played || 0} 
                        icon={<Activity className="text-blue-400" />}
                    />
                    <EngagementCard 
                        title="Challenges Created" 
                        value={reportData.publicChallenges?.created || 0} 
                        icon={<ShieldAlert className="text-purple-400" />}
                    />
                </div>

            </div>
        </AdminLayout>
    );
};

// --- Sub-Components (Clean & Creative) ---

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-[#121620]/60 border border-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/[0.03] hover:scale-[1.02] transition-all cursor-default shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            {React.cloneElement(icon, { size: 80 })}
        </div>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5" style={{ color }}>
            {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
        </div>
        <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-white italic leading-none tracking-tighter">{value}</p>
        </div>
    </div>
);

const EngagementCard = ({ title, value, icon }) => (
    <div className="bg-gradient-to-r from-white/[0.02] to-transparent border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-white/10 transition-all">
        <div className="flex items-center gap-5">
            <div className="p-4 bg-white/5 rounded-2xl group-hover:rotate-12 transition-transform duration-500">{icon}</div>
            <span className="text-xs font-black uppercase text-gray-500 italic tracking-[0.1em]">{title}</span>
        </div>
        <span className="text-5xl font-black text-white italic pr-4 group-hover:text-blue-400 transition-colors">{value}</span>
    </div>
);

export default UserReport;