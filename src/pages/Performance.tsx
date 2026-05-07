import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, Activity } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { BASE_URL } from '../api/auth.js';


const Performance = () => {
  const navigate = useNavigate();
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userRes = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const res = await axios.get(`${BASE_URL}/dashboard/${userRes.data._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.performance) {
          setPerformanceData(res.data.performance);
        }
      } catch (err) {
        console.error("Performance Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) return (
    <MainLayout activePage="dashboard">
      <div className="flex justify-center items-center h-[600px]">
        <Loader2 className="animate-spin text-cyan-400" size={50} />
      </div>
    </MainLayout>
  );

  return (
    <MainLayout activePage="dashboard">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col flex-1 pb-10 px-4">
        
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-gray-400 hover:text-white group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-3xl font-black tracking-widest text-white uppercase italic drop-shadow-md">
            PERFORMANCE
          </h1>
        </div>

        <div className="bg-[#050810]/60 border border-white/10 rounded-[2.5rem] p-10 w-full shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] backdrop-blur-xl min-h-[500px]">
          
          {performanceData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {performanceData.map((game, index) => (
                <div key={index} className="relative rounded-[2rem] p-[1.5px] bg-gradient-to-br from-cyan-400/40 to-purple-500/40 shadow-lg group hover:scale-[1.02] transition-all duration-300">
                  <div className="bg-[#0a0f1c] rounded-[calc(2rem-1.5px)] p-8 h-full flex flex-col justify-center border border-white/5">
                    
                    <h3 className="text-[15px] font-black text-white mb-8 uppercase italic tracking-wider group-hover:text-cyan-400 transition-colors">
                      {game.gameName}
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2 italic">
                        <span>Accuracy</span>
                        <span className="text-cyan-400">{game.accuracy}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${game.accuracy}%` }}></div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2 italic">
                        <span>Speed</span>
                        <span className="text-purple-400">{game.speed}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${game.speed}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2 italic">
                        <span>Consistency</span>
                        <span className="text-pink-400">{game.winRate}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000" style={{ width: `${game.winRate}%` }}></div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 opacity-20">
              <Activity size={80} className="mb-6 text-gray-500" />
              <p className="text-xl font-black italic uppercase tracking-[0.3em]">No Performance Data Found</p>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
};

export default Performance;