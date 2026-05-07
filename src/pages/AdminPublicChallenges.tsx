// src/pages/AdminPublicChallenges.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import {
    Plus, Search, Gauge, Calendar, Award, Trophy, AlignLeft,
    Users, BarChart3, ChevronDown, Flame, X, Shield, Gamepad2,
    Coins, Zap, Type, Pencil, Trash2, User
} from 'lucide-react';
import Swal from 'sweetalert2';
import ChallengeModal from '../components/ChallengeModal';

interface publicChallenge {
    _id: string;
    userId: { _id: string; username: string; avatar: string }; // أضفنا بيانات اليوزر المنشئ
    gameId: { _id: string; gameName: string } | string;
    title: string;
    description: string;
    challenge_level: number;
    required_wins: number;
    points_pool: number; // تأكدي من المسمى مطابق للمودل (points_pool)
    start_date: string;
    end_date: string;
    scheduledDate: string;
    status: string;
    maxAttempts: number;
    timeLimit: number;
    scenarioData: any;
    participantCount?: number;
    completionRate?: string;
}

const AdminPublicChallenges = () => {
    const [stats, setStats] = useState({ totalChallenges: 0, totalParticipants: 0, overallRate: 0 });
    const [history, setHistory] = useState<publicChallenge[]>([]);
    const [games, setGames] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        gameId: '',
        title: '',
        description: '',
        points_pool: 10,
        maxAttempts: 3,
        timeLimit: 60,
        status: 'Pending',
        scenarioData: {}
    });

    const token = localStorage.getItem('token');

    const fetchData = async (searchQuery = '') => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/admin-task/public-challenges/stats?search=${searchQuery}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data.stats);
            setHistory(res.data.history);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // 2. تحديث الـ useEffect ليمرر قيمة الـ search الحالية
    useEffect(() => {
        fetchData(search); // نرسل قيمة البحث هنا
    }, [search]);

    useEffect(() => { fetchData(); }, [search]);

    const handleEditClick = (challenge: publicChallenge) => {
        setFormData({
            gameId: typeof challenge.gameId === 'object' ? challenge.gameId._id : challenge.gameId, title: challenge.title,
            description: challenge.description,
            points_pool: challenge.points_pool,
            maxAttempts: challenge.maxAttempts,
            timeLimit: challenge.timeLimit,
            status: challenge.status,
            scenarioData: challenge.scenarioData || {}
        });
        setEditingId(challenge._id);
        setStep(1);
        setIsModalOpen(true);
    };

    // دالة الحذف الخاصة بالأدمن
    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Terminate Mission?',
            text: "This will permanently remove the challenge from the platform.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Delete Content'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/admin-task/public-challenges/delete/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Deleted', 'Mission has been removed by Admin.', 'success');
                fetchData();
            } catch (err: any) {
                Swal.fire('Error', err.response?.data?.message || 'Deletion failed', 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `http://localhost:5000/api/admin-task/public-challenges/update/${editingId}`
                : `http://localhost:5000/api/admin-task/public-challenges/create`;

            const method = editingId ? axios.put : axios.post;
            await method(url, formData, { headers: { Authorization: `Bearer ${token}` } });

            Swal.fire('Success', 'Mission Configured!', 'success');
            setIsModalOpen(false);
            fetchData(search);
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
        }
    };

    return (
        <AdminLayout activePage="admin-public">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-black italic uppercase text-white">Challenge Control</h1>
                </div>


                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard title="Total Missions" value={stats.totalChallenges} icon={<Award size={100} />} sub="In Database" colorClass="border-purple-600" />
                    <StatCard title="Active Operatives" value={stats.totalParticipants} icon={<Users size={100} />} sub="Engagement" colorClass="border-blue-500" />
                    <StatCard title="Global Success" value={`${stats.overallRate}%`} icon={<BarChart3 size={100} />} sub="Avg. Rate" colorClass="border-emerald-500" />
                </div>

                {/* Table */}
                <div className="bg-[#0b1224] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold italic text-white/90">Central Governance Panel</h3>
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input type="text" placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm text-white focus:border-blue-500/50 outline-none" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                                    <th className="pb-4">Mission Title</th>
                                    <th className="pb-4">Creator</th>
                                    <th className="pb-4">XP Reward</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 text-right">Admin Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {history.map((ch) => (
                                    <tr key={ch._id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-4 font-bold text-white italic">{ch.title}</td>
                                        <td className="py-4 text-blue-400 font-bold flex items-center gap-2">
                                            <User size={14} className="text-gray-500" />
                                            {ch.userId?.username || 'Unknown'}
                                        </td>
                                        <td className="py-4 text-yellow-500 font-bold">{ch.points_pool} XP</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${ch.status === 'Published' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                {ch.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right space-x-2">
                                            <button onClick={() => handleEditClick(ch)} className="p-2 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-500 rounded-lg">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(ch._id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ChallengeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    step={step}
                    setStep={setStep}
                    games={games}
                    editingId={editingId}
                    userLevels={[]} // الأدمن لا يحتاج قيود ليفل، سنعالج هذا في تعديل المودال
                />
            </div>
        </AdminLayout>
    );
};

// تم دمج StatCard داخل نفس الملف للتسهيل
const StatCard = ({ title, value, sub, icon, colorClass }: any) => (
    <div className={`bg-[#0b1224] border-t-2 ${colorClass} border-white/5 rounded-[2.5rem] p-8 shadow-xl group transition-all hover:translate-y-[-10px]`}>
        <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">{title}</p>
            </div>
            <h2 className="text-5xl font-black italic text-white tracking-tighter">{value}</h2>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{sub}</p>
        </div>
    </div>
);

export default AdminPublicChallenges;