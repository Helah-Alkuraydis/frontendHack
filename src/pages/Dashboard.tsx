import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Zap, Trophy, Shield, Target, BrainCircuit,
  Rocket, History, Loader2
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { BASE_URL } from '../api/auth.js';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userRes = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const res = await axios.get(`${BASE_URL}/dashboard/${userRes.data._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <MainLayout activePage="dashboard">
      <div className="flex justify-center items-center h-[600px]">
        <Loader2 className="animate-spin text-[#ff3b6b]" size={50} />
      </div>
    </MainLayout>
  );

  return (
    <MainLayout activePage="dashboard">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col flex-1">

        <div className="border border-white/10 rounded-[2.5rem] p-10 w-full flex flex-col justify-center bg-[#050810]/50 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] mb-4">

          <div className="flex justify-between mb-16 w-full gap-4">

            <div className="w-[240px] h-[240px] rounded-[2rem] p-[2px] bg-gradient-to-br from-pink-500/50 to-cyan-500/50 shadow-[0_0_20px_rgba(236,72,153,0.1)] transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] group">
              <div className="flex flex-col items-center justify-center text-center bg-[#121620] rounded-[calc(2rem-2px)] p-6 h-full w-full transition-all group-hover:bg-[#121620]/80">
                <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mb-4">
                  <Zap size={32} fill="currentColor" />
                </div>
                <p className="text-gray-400 text-[16px] mb-2 font-medium">Total Point</p>
                <h2 className="text-4xl font-bold tracking-wide">
                  {data?.totalPoints?.toLocaleString('en-US') || 0}
                </h2>
              </div>
            </div>

            <div className="w-[240px] h-[240px] rounded-[2rem] p-[2px] bg-gradient-to-br from-pink-500/50 to-cyan-500/50 shadow-[0_0_20px_rgba(236,72,153,0.1)] transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] group">
              <div className="flex flex-col items-center justify-center text-center bg-[#121620] rounded-[calc(2rem-2px)] p-6 h-full w-full transition-all group-hover:bg-[#121620]/80">
                <div className="w-16 h-16 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-2xl flex items-center justify-center mb-4">
                  <Trophy size={32} fill="currentColor" />
                </div>
                <p className="text-gray-400 text-[16px] mb-2 font-medium">Games Won</p>
                <h2 className="text-4xl font-bold tracking-wide">{data?.gamesWon || 0}</h2>
              </div>
            </div>

            <div className="w-[240px] h-[240px] rounded-[2rem] p-[2px] bg-gradient-to-br from-pink-500/50 to-cyan-500/50 shadow-[0_0_20px_rgba(236,72,153,0.1)] transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] group">
              <div className="flex flex-col items-center justify-center text-center bg-[#121620] rounded-[calc(2rem-2px)] p-6 h-full w-full transition-all group-hover:bg-[#121620]/80">
                <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-4">
                  <Shield size={32} fill="currentColor" />
                </div>
                <p className="text-gray-400 text-[16px] mb-2 font-medium">Current Rank</p>
                <h2 className={`font-bold tracking-wide ${data?.rank ? 'text-4xl' : 'text-2xl text-white'}`}>
                  {data?.rank ? `#${data.rank}` : "Unranked"}
                </h2>
              </div>
            </div>

          </div>

          <div className="flex gap-6 h-[400px] w-full">

            <div onClick={() => navigate('/overview')} className="relative rounded-[2rem] flex-1 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-b from-[#050810]/90 to-[#00b4d8] shadow-[0_10px_40px_rgba(0,180,216,0.2)] group overflow-hidden">
              <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 z-10">
                <Target size={45} strokeWidth={1.5} className="text-white" />
              </div>
              <h3 className="font-bold text-[14px] tracking-[0.2em] text-white absolute bottom-10 z-10 uppercase">OVERVIEW</h3>
            </div>

            <div onClick={() => navigate('/ai-analysis')} className="relative rounded-[2rem] flex-1 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-b from-[#050810]/90 to-[#6d28d9] shadow-[0_10px_40px_rgba(109,40,217,0.2)] group overflow-hidden">
              <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 z-10">
                <BrainCircuit size={45} strokeWidth={1.5} className="text-white" />
              </div>
              <h3 className="font-bold text-[14px] tracking-[0.2em] text-white absolute bottom-10 text-center leading-relaxed z-10 uppercase">AI <br />ANALYSIS</h3>
            </div>

            <div onClick={() => navigate('/performance')} className="relative rounded-[2rem] flex-1 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-b from-[#050810]/90 to-[#f97316] shadow-[0_10px_40px_rgba(249,115,22,0.2)] group overflow-hidden">
              <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 z-10">
                <Rocket size={45} strokeWidth={1.5} className="text-white" />
              </div>
              <h3 className="font-bold text-[14px] tracking-[0.2em] text-white absolute bottom-10 z-10 uppercase">PERFORMANCE</h3>
            </div>

            <div onClick={() => navigate('/history')} className="relative rounded-[2rem] flex-1 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-b from-[#050810]/90 to-[#e11d48] shadow-[0_10px_40px_rgba(225,29,72,0.2)] group overflow-hidden">
              <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 z-10">
                <History size={45} strokeWidth={1.5} className="text-white" />
              </div>
              <h3 className="font-bold text-[14px] tracking-[0.2em] text-white absolute bottom-10 z-10 uppercase">HISTORY</h3>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;