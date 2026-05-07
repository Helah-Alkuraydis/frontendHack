import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, Gamepad2, Clock, Trophy, Shield, ArrowUp } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AnalyticsTab from './AnalyticsTab'; 
import LeaderboardTab from './LeaderboardTab';
import { getSocket } from '..//socket'; 
import { BASE_URL } from '../api/auth.js';

const DashboardAdmin = () => {
    const [activeTab, setActiveTab] = useState('overview');
    
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalPlays: 0,
        totalGames: 0,
        leaderboard: [],
        gamePopularity: [], 
        weeklyTraffic: [],
        behavior: {} 
    });

  
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${BASE_URL}/admin/dashboard-stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (res.data.success) {
                    setStats({
                        totalUsers: res.data.overview.totalUsers,
                        activeUsers: res.data.overview.activeUsers,
                        totalPlays: res.data.overview.totalPlays,
                        totalGames: res.data.overview.totalGames,
                        leaderboard: res.data.leaderboard,
                        gamePopularity: res.data.gamePopularity,
                        weeklyTraffic: res.data.weeklyTraffic,
                        behavior: res.data.behavior || {} // 👈 حفظ بيانات السلوك
                    });
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };
        fetchDashboardStats();
    }, []);

    // (Real-time Listening)
    useEffect(() => {
        const socket = getSocket();

        
        socket.on("statsUpdated", (updatedData: any) => {
            console.log("📡 Real-time update received from server!");
            
            setStats(prev => ({
                ...prev,
                totalUsers: updatedData.overview.totalUsers,
                activeUsers: updatedData.overview.activeUsers,
                totalPlays: updatedData.overview.totalPlays,
                totalGames: updatedData.overview.totalGames,
                gamePopularity: updatedData.gamePopularity,
                weeklyTraffic: updatedData.weeklyTraffic,
                behavior: updatedData.behavior || prev.behavior
            }));
        });

        
        return () => {
            socket.off("statsUpdated");
        };
    }, []);

    const statsData = [
        { title: 'Total Users', value: stats.totalUsers, icon: Users, iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400', trendValue: 'Live' },
        { title: 'Active Users', value: stats.activeUsers, icon: UserCheck, iconBg: 'bg-green-500/20', iconColor: 'text-green-400', trendValue: 'Live' },
        { title: 'Total Plays', value: stats.totalPlays, icon: Gamepad2, iconBg: 'bg-pink-500/20', iconColor: 'text-pink-400', trendValue: 'Live' },
        { title: 'Total Games', value: stats.totalGames, icon: Shield, iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400', trendValue: 'Live' },
        { title: 'Completion Rate', value: '78%', icon: Trophy, iconBg: 'bg-rose-500/20', iconColor: 'text-rose-400', trendValue: 'Estimated' },
        { title: 'Avg Session', value: '12m', icon: Clock, iconBg: 'bg-yellow-500/20', iconColor: 'text-yellow-400', trendValue: 'Estimated' },
    ];

    return (
        <AdminLayout activePage="admin-dashboard">
            <div className="text-slate-200 font-sans w-full p-4 lg:p-8">
                
                {/* Tabs Navigation */}
                <div className="flex items-center gap-8 border-b border-gray-800 mb-8">
                    {['overview', 'analytics', 'leaderboard'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${activeTab === tab ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {tab}
                            {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>}
                        </button>
                    ))}
                </div>

                {/* Content Sections */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="relative bg-gradient-to-r from-[#1e293b] to-[#0f172a] border border-gray-700/50 rounded-[2rem] p-8 flex justify-between items-center overflow-hidden shadow-2xl">
                            <div className="relative z-10">
                                <p className="text-gray-400 text-sm font-medium mb-6">{new Date().toLocaleDateString()}</p>
                                <h2 className="text-3xl text-white font-medium">System Overview</h2>
                                <h1 className="text-4xl font-black text-white mt-2 flex items-center gap-3">
                                    HackHero Status <span className="text-3xl animate-pulse">🚀</span>
                                </h1>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {statsData.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={index} className="bg-[#0b1221] border border-gray-800 rounded-[2rem] p-6 flex flex-col justify-between h-48 transition-all hover:border-cyan-500/30 group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-gray-300 font-bold text-sm mb-2">{stat.title}</h3>
                                                <p className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">{stat.value}</p>
                                            </div>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                                                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 text-xs font-medium text-cyan-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></div> {stat.trendValue}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {}
                {activeTab === 'analytics' && <AnalyticsTab gamePopularity={stats.gamePopularity} weeklyTraffic={stats.weeklyTraffic} behavior={stats.behavior} />}
                {activeTab === 'leaderboard' && <LeaderboardTab players={stats.leaderboard} />}
            </div>
        </AdminLayout>
    );
};

export default DashboardAdmin;