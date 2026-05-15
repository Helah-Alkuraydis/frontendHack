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
      <div className="w-full max-w-[1400px] mx-auto flex flex-col flex-1 px-4 lg:px-0">

        <div className="border border-white/10 rounded-3xl lg:rounded-[2.5rem] p-4 sm:p-6 lg:p-10 w-full flex flex-col justify-center bg-[#050810]/50 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] mb-4">

          {/* 🔥 التعديل الجوهري: خليناها flex-row دائماً، وصغرنا الـ gap في الجوال 🔥 */}
          <div className="flex flex-row justify-between items-center mb-8 lg:mb-16 w-full gap-2 sm:gap-4 lg:gap-6">

            {/* الكرت الأول */}
            {/* استخدمنا flex-1 عشان تتقاسم العرض، وصغرنا الطول والبادينق للجوال */}
            <div className="flex-1 h-[90px] sm:h-[110px] lg:h-[240px] rounded-[1rem] lg:rounded-[2rem] p-[1px] lg:p-[2px] bg-gradient-to-br from-pink-500/50 to-cyan-500/50 shadow-[0_0_15px_rgba(236,72,153,0.1)] transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] group">
              <div className="flex flex-col items-center justify-center text-center bg-[#121620] rounded-[calc(1rem-1px)] lg:rounded-[calc(2rem-2px)] p-1 sm:p-2 lg:p-6 h-full w-full transition-all group-hover:bg-[#121620]/80">
                {/* تصغير الأيقونة ومربعها للجوال */}
                <div className="w-6 h-6 sm:w-10 sm:h-10 lg:w-16 lg:h-16 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-md sm:rounded-xl lg:rounded-2xl flex items-center justify-center mb-1 lg:mb-4">
                  <Zap className="w-3 h-3 sm:w-5 sm:h-5 lg:w-8 lg:h-8" fill="currentColor" />
                </div>
                {/* تصغير النصوص ومنعها من النزول لسطر جديد */}
                <p className="text-gray-400 text-[8px] sm:text-[11px] lg:text-[16px] mb-0.5 lg:mb-2 font-medium whitespace-nowrap">Total Point</p>
                <h2 className="text-[12px] sm:text-xl lg:text-4xl font-bold tracking-wide">
                  {data?.totalPoints?.toLocaleString('en-US') || 0}
                </h2>
              </div>
            </div>

            {/* الكرت الثاني */}
            <div className="flex-1 h-[90px] sm:h-[110px] lg:h-[240px] rounded-[1rem] lg:rounded-[2rem] p-[1px] lg:p-[2px] bg-gradient-to-br from-pink-500/50 to-cyan-500/50 shadow-[0_0_15px_rgba(236,72,153,0.1)] transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] group">
              <div className="flex flex-col items-center justify-center text-center bg-[#121620] rounded-[calc(1rem-1px)] lg:rounded-[calc(2rem-2px)] p-1 sm:p-2 lg:p-6 h-full w-full transition-all group-hover:bg-[#121620]/80">
                <div className="w-6 h-6 sm:w-10 sm:h-10 lg:w-16 lg:h-16 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-md sm:rounded-xl lg:rounded-2xl flex items-center justify-center mb-1 lg:mb-4">
                  <Trophy className="w-3 h-3 sm:w-5 sm:h-5 lg:w-8 lg:h-8" fill="currentColor" />
                </div>
                <p className="text-gray-400 text-[8px] sm:text-[11px] lg:text-[16px] mb-0.5 lg:mb-2 font-medium whitespace-nowrap">Games Won</p>
                <h2 className="text-[12px] sm:text-xl lg:text-4xl font-bold tracking-wide">{data?.gamesWon || 0}</h2>
              </div>
            </div>

            {/* الكرت الثالث */}
            <div className="flex-1 h-[90px] sm:h-[110px] lg:h-[240px] rounded-[1rem] lg:rounded-[2rem] p-[1px] lg:p-[2px] bg-gradient-to-br from-pink-500/50 to-cyan-500/50 shadow-[0_0_15px_rgba(236,72,153,0.1)] transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] group">
              <div className="flex flex-col items-center justify-center text-center bg-[#121620] rounded-[calc(1rem-1px)] lg:rounded-[calc(2rem-2px)] p-1 sm:p-2 lg:p-6 h-full w-full transition-all group-hover:bg-[#121620]/80">
                <div className="w-6 h-6 sm:w-10 sm:h-10 lg:w-16 lg:h-16 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-md sm:rounded-xl lg:rounded-2xl flex items-center justify-center mb-1 lg:mb-4">
                  <Shield className="w-3 h-3 sm:w-5 sm:h-5 lg:w-8 lg:h-8" fill="currentColor" />
                </div>
                <p className="text-gray-400 text-[8px] sm:text-[11px] lg:text-[16px] mb-0.5 lg:mb-2 font-medium whitespace-nowrap">Current Rank</p>
                <h2 className={`font-bold tracking-wide ${data?.rank ? 'text-[12px] sm:text-xl lg:text-4xl' : 'text-[9px] sm:text-[14px] lg:text-2xl text-white'}`}>
                  {data?.rank ? `#${data.rank}` : "Unranked"}
                </h2>
              </div>
            </div>

          </div>

          {/* الكروت السفلية باقية زي ما هي (شبكة 2x2 بالجوال) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-4 lg:gap-6 h-auto lg:h-[400px] w-full">

            <div onClick={() => navigate('/overview')} className="relative rounded-[2rem] flex-1 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-b from-[#050810]/90 to-[#00b4d8] shadow-[0_10px_40px_rgba(0,180,216,0.2)] group overflow-hidden min-h-[220px] lg:min-h-0">
              <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-300 z-10">
                <Target size={35} strokeWidth={1.5} className="text-white lg:w-[45px] lg:h-[45px]" />
              </div>
              <h3 className="font-bold text-[12px] lg:text-[14px] tracking-[0.2em] text-white absolute bottom-6 lg:bottom-10 z-10 uppercase">OVERVIEW</h3>
            </div>

            <div onClick={() => navigate('/ai-analysis')} className="relative rounded-[2rem] flex-1 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-b from-[#050810]/90 to-[#6d28d9] shadow-[0_10px_40px_rgba(109,40,217,0.2)] group overflow-hidden min-h-[220px] lg:min-h-0">
              <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-300 z-10">
                <BrainCircuit size={35} strokeWidth={1.5} className="text-white lg:w-[45px] lg:h-[45px]" />
              </div>
              <h3 className="font-bold text-[12px] lg:text-[14px] tracking-[0.2em] text-white absolute bottom-6 lg:bottom-10 text-center leading-relaxed z-10 uppercase">AI <br className="hidden lg:block"/>ANALYSIS</h3>
            </div>

            <div onClick={() => navigate('/performance')} className="relative rounded-[2rem] flex-1 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-b from-[#050810]/90 to-[#f97316] shadow-[0_10px_40px_rgba(249,115,22,0.2)] group overflow-hidden min-h-[220px] lg:min-h-0">
              <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-300 z-10">
                <Rocket size={35} strokeWidth={1.5} className="text-white lg:w-[45px] lg:h-[45px]" />
              </div>
              <h3 className="font-bold text-[12px] lg:text-[14px] tracking-[0.2em] text-white absolute bottom-6 lg:bottom-10 z-10 uppercase">PERFORMANCE</h3>
            </div>

            <div onClick={() => navigate('/history')} className="relative rounded-[2rem] flex-1 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-b from-[#050810]/90 to-[#e11d48] shadow-[0_10px_40px_rgba(225,29,72,0.2)] group overflow-hidden min-h-[220px] lg:min-h-0">
              <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-300 z-10">
                <History size={35} strokeWidth={1.5} className="text-white lg:w-[45px] lg:h-[45px]" />
              </div>
              <h3 className="font-bold text-[12px] lg:text-[14px] tracking-[0.2em] text-white absolute bottom-6 lg:bottom-10 z-10 uppercase">HISTORY</h3>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;