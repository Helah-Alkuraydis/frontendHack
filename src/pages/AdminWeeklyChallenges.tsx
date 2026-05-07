// src/pages/AdminWeeklyChallenges.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { 
  Plus, Search, Gauge, Calendar, Award, Trophy, AlignLeft, TrendingUp, BarChart, Swords,
  Users, BarChart3, ChevronDown, Flame, X, Shield, Gamepad2, Coins, Zap, Repeat, Type, Pencil 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { BASE_URL } from '../api/auth.js';

interface WeeklyChallenge {
    _id: string;
    gameId: string;
    title: string;
    description: string;
    challenge_level: number;
    required_wins: number;
    points_reward: number;
    start_date: string;
    end_date: string;
    participantCount: number;
    completionRate: string;
}

const AdminWeeklyChallenges = () => {
    const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
    const [stats, setStats] = useState({ totalChallenges: 0, totalParticipants: 0, overallRate: 0 });
    const [history, setHistory] = useState<WeeklyChallenge[]>([]);
    const [games, setGames] = useState([]); 
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        gameId: '',
        title: '',
        description: '',
        points_reward: 100,
        start_date: '',
        end_date: '',
        challenge_level: 1, 
        required_wins: 1
    });

    const token = localStorage.getItem('token');

    // دالة جلب البيانات (نسخة واحدة نظيفة)
    const fetchData = async () => {
        try {
            const [resStats, resGames] = await Promise.all([
                axios.get(`${BASE_URL}/challenges/admin/stats?search=${search}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${BASE_URL}/games`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setStats(resStats.data.stats);
            setHistory(resStats.data.history);
            setGames(resGames.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [search]);

    // منطق التحدي النشط
   const activeChallenge = history.find((ch) => {
    const now = new Date();
    // تصفير الوقت في تاريخ "الآن" للمقارنة باليوم فقط
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    
    const start = new Date(ch.start_date);
    const end = new Date(ch.end_date);

    // التحقق من أن اليوم الحالي يقع ضمن النطاق أو بدأ فعلاً
    return todayStart >= new Date(start.setHours(0,0,0,0)) && todayStart <= end;
});

    const handleEditClick = (challenge: WeeklyChallenge) => {
        setFormData({
            gameId: challenge.gameId,
            title: challenge.title,
            description: challenge.description,
            points_reward: challenge.points_reward,
            start_date: challenge.start_date.split('T')[0], 
            end_date: challenge.end_date.split('T')[0],
            challenge_level: challenge.challenge_level,
            required_wins: challenge.required_wins
        });
        setEditingId(challenge._id);
        setView('edit');
    };

    // دالة المعالجة الموحدة (إضافة أو تحديث)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = view === 'edit' 
                ? `${BASE_URL}/challenges/weekly/${editingId}` 
    : `${BASE_URL}/challenges/weekly`;
            
            const method = view === 'edit' ? axios.put : axios.post;

            await method(url, formData, { headers: { Authorization: `Bearer ${token}` } });
            
            Swal.fire('Success', `Challenge ${view === 'edit' ? 'Updated' : 'Created'}!`, 'success');
            setView('list');
            setEditingId(null);
            fetchData();
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
        }
    };

    return (
        <AdminLayout activePage="admin-weekly">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                        {view === 'list' ? 'Weekly Challenges' : view === 'edit' ? 'Edit Challenge' : 'Add New Challenge'}
                    </h1>
                    {view === 'list' && (
                        <button 
                            onClick={() => {
                                setFormData({ gameId: '', title: '', description: '', points_reward: 100, start_date: '', end_date: '', challenge_level: 1, required_wins: 1 });
                                setView('add');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase text-xs transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Plus size={18} /> Add New
                        </button>
                    )}
                </div>

                {view === 'list' ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> {/* كبرنا الفراغ لـ gap-8 */}
                                <StatCard 
                                    title="Total Challenge" 
                                    value={stats.totalChallenges} 
                                    icon={<Award size={100} />} 
                                    sub="Operations Deployed" 
                                    colorClass="border-purple-600" 
                                />
                                <StatCard 
                                    title="Total Participants" 
                                    value={stats.totalParticipants} 
                                    icon={<Users size={100} />} 
                                    sub="Active Operatives" 
                                    colorClass="border-blue-500" 
                                />
                                <StatCard 
                                    title="Completion Rate" 
                                    value={`${stats.overallRate}%`} 
                                    icon={<BarChart3 size={100} />} 
                                    sub="Success Probability" 
                                    colorClass="border-emerald-500" 
                                />
                            </div>

                        {/* ✅ Active Challenge Section (مثل فيقما) */}
                        {activeChallenge ? (
                            <div className="bg-[#0b1224] border border-blue-500/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-bold italic text-white/90 flex items-center gap-2">
                                        <Zap size={18} className="text-blue-500" /> Active Challenge
                                    </h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEditClick(activeChallenge)}
                                            className="bg-white/5 hover:bg-white/10 text-gray-400 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all"
                                        >
                                            <Pencil size={12} /> Edit Challenge
                                        </button>
                                        <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            Active
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Name Challenge</p>
                                        <p className="text-lg font-bold text-white italic">{activeChallenge.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Participants</p>
                                        <p className="text-lg font-bold text-blue-400">{activeChallenge.participantCount} users</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Status</p>
                                        <p className="text-lg font-bold text-white">Ongoing</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Completion Rate</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-lg font-bold text-emerald-400">{activeChallenge.completionRate}%</p>
                                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden min-w-[60px]">
                                                <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" style={{ width: `${activeChallenge.completionRate}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#0b1224] border border-dashed border-white/10 rounded-[2.5rem] p-8 text-center text-gray-500 italic text-sm">
                                No active challenge currently. Deploy a mission to start tracking.
                            </div>
                        )}

                        {/* History Table Section */}
                        <div className="bg-[#0b1224] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold italic text-white/90">Challenge History</h3>
                                <div className="relative w-72">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input type="text" placeholder="Search challenges..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50" />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                                            <th className="pb-4">Name</th>
                                            <th className="pb-4">Participants</th>
                                            <th className="pb-4">Completion Rate</th>
                                            <th className="pb-4">Reward</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {history.map((ch) => (
                                            <tr key={ch._id} className="group hover:bg-white/5 transition-colors">
                                                <td className="py-4 font-bold text-white italic">{ch.title}</td>
                                                <td className="py-4 text-blue-400 font-bold">{ch.participantCount} users</td>
                                                <td className="py-4 text-emerald-400 font-bold">{ch.completionRate}%</td>
                                                <td className="py-4 text-yellow-500 font-bold">{ch.points_reward} XP</td>
                                                <td className="py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${new Date(ch.end_date) > new Date() ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-400'}`}>
                                                        {new Date(ch.end_date) > new Date() ? 'Active' : 'Expired'}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button onClick={() => handleEditClick(ch)} className="p-2 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-500 rounded-lg transition-all">
                                                        <Pencil size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Add Challenge Form - (تم ربط الـ value ليعمل التعديل) */
                    <div className="bg-[#0b1224] border border-white/5 rounded-[2.5rem] p-12 max-w-4xl mx-auto shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 blur-[100px] -ml-32 -mb-32"></div>

                        <button onClick={() => setView('list')} className="absolute top-8 right-8 text-gray-500 hover:text-white bg-white/5 p-2 rounded-xl transition-all hover:rotate-90 z-20">
                            <X size={20} />
                        </button>
                        
                        <div className="mb-10 relative z-10">
                            <h2 className="text-3xl font-black italic uppercase text-white flex items-center gap-4">
                                <Shield className="text-blue-500" size={32} /> Deploy New Mission
                            </h2>
                            <p className="text-gray-500 text-sm mt-2 font-medium uppercase tracking-[0.2em]">Configure Parameters for the Weekly Operation</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><Gamepad2 size={14} /> Select Game Source</label>
                                    <div className="relative group">
                                        <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <select required value={formData.gameId} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white appearance-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all cursor-pointer" onChange={(e) => setFormData({...formData, gameId: e.target.value})}>
                                            <option value="" className="bg-[#0b1224]">Choose Game Mechanics...</option>
                                            {games.map((g: any) => (<option key={g._id} value={g._id} className="bg-[#0b1224]">{g.gameName}</option>))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><Type size={14} /> Challenge Title</label>
                                    <div className="relative group">
                                        <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input type="text" required value={formData.title} placeholder="e.g., Phishing Master" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" onChange={(e) => setFormData({...formData, title: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><AlignLeft size={14} /> Mission Briefing (Description)</label>
                                <div className="relative group">
                                    <AlignLeft className="absolute left-4 top-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <textarea required rows={3} value={formData.description} placeholder="Provide clear instructions for the players..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><Gauge size={14} /> Difficulty Level</label>
                                    <div className="relative group">
                                        <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input type="number" min="1" max="20" value={formData.challenge_level} placeholder="1-20" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500/50 transition-all" onChange={(e) => setFormData({...formData, challenge_level: Number(e.target.value)})} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><Flame size={14} /> Win Streak Goal</label>
                                    <div className="relative group">
                                        <Flame className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500/70 group-focus-within:text-orange-500 transition-colors" size={20} />
                                        <input type="number" min="1" value={formData.required_wins} placeholder="Consecutive Wins" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500/50 transition-all" onChange={(e) => setFormData({...formData, required_wins: Number(e.target.value)})} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><Coins size={14} /> Reward Points</label>
                                    <div className="relative group">
                                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={20} />
                                        <input type="number" required value={formData.points_reward} placeholder="XP Amount" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500/50 transition-all" onChange={(e) => setFormData({...formData, points_reward: Number(e.target.value)})} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><Calendar size={14} /> Activation Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input type="date" required value={formData.start_date} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]" onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><Calendar size={14} /> Termination Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input type="date" required value={formData.end_date} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]" onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 py-6 rounded-2xl font-black uppercase italic tracking-[0.3em] shadow-[0_10px_40px_rgba(37,99,235,0.2)] flex items-center justify-center gap-4 transition-all active:scale-[0.98] group">
                                    <Zap size={22} className="group-hover:animate-bounce" fill="currentColor" /> 
                                    {view === 'edit' ? 'Update Challenge' : 'Add Challenge'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

// Component الداخلي للكروت (نسخة واحدة نظيفة)
const StatCard = ({ title, value, sub, icon, colorClass }: any) => (
    <div className={`bg-[#0b1224] border-t-2 ${colorClass} border-x border-b border-white/5 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group transition-all duration-500 hover:translate-y-[-10px] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]`}>
        
        <div className={`absolute -right-16 -top-16 w-48 h-48 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${colorClass.replace('border-', 'bg-')}`}></div>
        
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent opacity-20 pointer-events-none"></div>

        <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-15 group-hover:scale-150 group-hover:-rotate-12 transition-all duration-1000 ease-out">
            {icon}
        </div>
        
        <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
                <div className={`w-1 h-3 rounded-full ${colorClass.replace('border-', 'bg-')} shadow-[0_0_10px_currentColor]`}></div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 group-hover:text-gray-300 transition-colors">
                    {title}
                </p>
            </div>
            
            <h2 className="text-5xl font-black italic text-white tracking-tighter transition-all group-hover:tracking-normal">
                {value}
            </h2>
            
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('border-', 'bg-')} animate-pulse`}></span>
                {sub}
            </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>
);

export default AdminWeeklyChallenges;