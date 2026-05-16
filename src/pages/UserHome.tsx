import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // 🟢 تم إصلاح الاستيراد هنا ليكون صحيحاً ومنع انهيار التطبيق
import MainLayout from '../components/MainLayout';
import OnboardingTour from '../OnboardingTour'; 
import { Zap, Lock, ShieldCheck, Clock, Play, Trophy , UserX , Users} from 'lucide-react';
import { BASE_URL } from '../api/auth.js';

interface LastActivity {
  friendName: string;
  avatar: string;
  teamName: string;
  lastGame: string;
}

const UserHome = () => {
  const [showTour, setShowTour] = useState(false);
  const [activeStep, setActiveStep] = useState(0); 
  const [user, setUser] = useState<any>(null);
  
  const [latestAchievement, setLatestAchievement] = useState<any>(null);
  const [weeklyProgress, setWeeklyProgress] = useState({ percent: 0, current: 0, required: 0 });
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [lastActivity, setLastActivity] = useState<LastActivity | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userRes = await axios.get(`${BASE_URL}/auth/me`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setUser(userRes.data);

        const lastRes = await axios.get(`${BASE_URL}/teams/last-played`,  {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (lastRes.data.success) {
          setLastActivity(lastRes.data.data);
        }

        const dashboardRes = await axios.get(`${BASE_URL}/dashboard/${userRes.data._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (dashboardRes.data.latestAchievement) {
          setLatestAchievement(dashboardRes.data.latestAchievement);
        }

        const challengeRes = await axios.get(`${BASE_URL}/challenges/weekly/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (challengeRes.data) {
          const current = challengeRes.data.currentWins || 0;
          const required = challengeRes.data.requiredWins || 3;
          const percent = Math.min(Math.round((current / required) * 100), 100);
          setWeeklyProgress({ percent, current, required });
        }

        if (localStorage.getItem('showTourAfterLogin') === 'true') {
          setShowTour(true);
          localStorage.removeItem('showTourAfterLogin');
        }
      } catch (error) {
        console.error("Home data error:", error);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchData();
  }, []);

  const characterImg = user?.characterStyle ? `/${user.characterStyle}` : '/saudi-man.png';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning," : hour < 18 ? "Good Afternoon," : "Good Evening,";

  return (
    <MainLayout 
      activePage="home" 
      highlightedId={showTour ? (
        activeStep === 1 ? 'games-step' : 
        activeStep === 2 ? 'challenge-step' : 
        activeStep === 3 ? 'achievements-step' : 
        activeStep === 4 ? 'dashboard-step' : 
        activeStep === 5 ? 'friends-step' : 
        activeStep === 6 ? 'profile-step' : '' 
      ) : ''}
      headerActions={
        <button 
          onClick={() => {setActiveStep(0); setShowTour(true);}} 
          className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-white border border-white/20 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all hover:bg-white/10 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)] whitespace-nowrap"
        >
          <span className="md:hidden">Tour</span>
          <span className="hidden md:inline">Replay Tour</span>
        </button>
      }
    >
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} onStepChange={(step: number) => setActiveStep(step)} />}
      
      {/* Banner Section */}
      <div className="w-full relative bg-[#121620]/80 backdrop-blur-md rounded-[2.5rem] p-6 md:p-12 mb-10 flex flex-row justify-between items-center border border-gray-800/50 shadow-xl overflow-hidden min-h-[140px] md:min-h-[320px] gap-4">
          <div className="w-24 h-28 md:w-64 md:h-72 bg-contain bg-no-repeat bg-center drop-shadow-2xl transition-transform hover:scale-105 duration-500 shrink-0" 
               style={{backgroundImage: `url('${characterImg}')`}}>
          </div>

          <div className="z-10 relative text-right flex-1">
              <p className="text-gray-400 text-[10px] md:text-sm mb-1 md:mb-4 font-medium tracking-widest uppercase italic">{new Date().toDateString()}</p>
              <h1 className="text-xl md:text-5xl font-black mb-1 text-white italic tracking-tight">{greeting}</h1>
              <h2 className="text-xl md:text-5xl font-black text-white italic tracking-tight">
                 {user?.name || user?.username || "Guest"} <span className="animate-pulse">🌙</span>
              </h2>
          </div>
      </div>

      <h3 className="text-2xl font-black mb-8 tracking-tighter italic uppercase text-white/90 px-1">Most games</h3>
      
      {/* 🎮 حاوي الألعاب الأفقي */}
      <div className="flex flex-nowrap overflow-x-auto md:grid md:grid-cols-2 gap-6 md:gap-8 mb-12 pb-4 snap-x scrollbar-none md:scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent px-1">
          <div className="snap-center shrink-0 w-[85vw] md:w-auto">
            <Link to="/games"><GameCard title="Fast, smart, unstoppable !" desc="Race against time and other hackers to capture the flag first" gradient="bg-gradient-to-br from-emerald-600/40 to-emerald-900/5" borderColor="border-emerald-500/20" btnColor="text-white bg-emerald-600 hover:bg-emerald-700" icon={<Zap className="text-emerald-300 mb-3" size={32} />} bgImage="/game-runner.png" /></Link>
          </div>
          
          <div className="snap-center shrink-0 w-[85vw] md:w-auto">
            <Link to="/games"><GameCard title="Can you escape the Room ?" desc="Solve security puzzles and find your way out to break free" gradient="bg-gradient-to-br from-purple-600/40 to-purple-900/5" borderColor="border-purple-500/20" btnColor="text-white bg-purple-600 hover:bg-purple-700" icon={<Lock className="text-purple-300 mb-3" size={32} />} bgImage="/game-escape.png" /></Link>
          </div>
          
          <div className="snap-center shrink-0 w-[85vw] md:w-auto">
            <Link to="/games">
              <GameCard           
                 title="Think you can outsmart hackers ?" 
                 desc="Crack and create the strongest passwords before time runs out!"
                 gradient="bg-gradient-to-br from-orange-500/40 to-orange-900/5"
                 borderColor="border-orange-500/30"
                 btnColor="text-white bg-orange-600 hover:bg-orange-700 border-none shadow-lg shadow-orange-900/20"
                 icon={<Clock className="text-orange-300 mb-3 drop-shadow-lg" size={32} />}
                 bgImage="/game-key.png"
              />
            </Link>
          </div>

          <div className="snap-center shrink-0 w-[85vw] md:w-auto">
            <Link to="/games">
              <GameCard 
                 title="Defend your network like a pro !" 
                 desc="Stop cyberattacks before they breach your system"
                 gradient="bg-gradient-to-br from-red-600/40 to-red-900/5"
                 borderColor="border-red-500/20"
                 btnColor="text-white bg-red-600 hover:bg-red-700 border-none shadow-lg shadow-red-900/20"
                 icon={<ShieldCheck className="text-red-300 mb-3 drop-shadow-lg" size={32} />}
                 bgImage="/game-shield.png"
              />
            </Link>
          </div>
      </div>

      <h3 className="text-2xl font-black mb-8 tracking-tighter italic uppercase text-white/90 px-1">Recent Activity</h3>
      
      {/* 🚀 حاوي كروت الأنشطة الثلاثة بالتمرير الأفقي للجوال والشبكة للابتوب */}
      <div className="flex flex-nowrap overflow-x-auto md:grid md:grid-cols-3 gap-6 md:gap-8 pb-12 scrollbar-none md:scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent px-1 snap-x">
        
        {/* الكرت الأول: نشاط الأعضاء */}
        <div className="snap-center shrink-0 w-[85vw] md:w-auto bg-[#121620]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-800/50 flex flex-col items-center justify-center text-center shadow-xl min-h-[250px] md:min-h-[280px] group hover:border-[#ff3b6b]/30 transition-all">
          {lastActivity ? (
              <>
                  <div className="relative mb-6">
                      <img 
                          src={lastActivity.avatar?.startsWith('http') ? lastActivity.avatar : `/${lastActivity.avatar}`} 
                          className="w-20 h-20 rounded-full border-2 border-[#ff3b6b] shadow-[0_0_20px_rgba(255,59,107,0.15)] object-cover group-hover:scale-105 transition-transform" 
                          alt="Last Player"
                      />
                      <div className="absolute bottom-0 right-0 bg-[#1c2438] p-1.5 rounded-full border-2 border-[#121620] shadow-lg transform translate-x-1 translate-y-1">
                          <Users size={12} className="text-[#ff3b6b]" />
                      </div>
                  </div>
                  
                  <h4 className="font-bold text-xl italic uppercase tracking-tighter text-white">
                      {lastActivity.friendName}
                  </h4>
                  
                  <p className="text-[#ff3b6b] text-[10px] font-black uppercase tracking-widest mt-1 italic">
                      PLAYED {lastActivity.lastGame}
                  </p>

                  <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mt-4 border-t border-white/5 pt-4 w-full">
                      FROM Team {lastActivity.teamName}
                  </p>
              </>
          ) : (
              <div className="opacity-40 flex flex-col items-center py-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                      <UserX size={32} className="text-gray-500" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                     No Member Activity
                  </p>
                  <p className="text-[9px] font-bold text-gray-600 mt-2 italic max-w-[150px] leading-relaxed">
                      You haven't played with any member yet. Start a mission with him to see them here!
                  </p>
              </div>
          )}
        </div>     

        {/* الكرت الثاني: آخر إنجاز */}
        <div className="snap-center shrink-0 w-[85vw] md:w-auto bg-[#121620]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-800/50 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl min-h-[250px] md:min-h-[280px]">
          <p className="text-gray-400 text-[10px] mb-6 uppercase font-black tracking-[0.3em] relative z-10">
              Latest Achievement
          </p>

          {latestAchievement ? (
              <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
                  <div className="w-28 h-28 mb-4 flex items-center justify-center p-2 bg-blue-500/5 rounded-full border border-blue-500/10">
                      <img 
                          src="/achievement.png" 
                          className="max-w-full max-h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                          alt="Badge"
                      />
                  </div>
                  
                  <h4 className="font-black text-xl italic text-white uppercase tracking-tighter">
                      {latestAchievement.name}
                  </h4>
              </div>
          ) : (
              <div className="relative z-10 py-10 opacity-30">
                  <Trophy size={40} className="text-gray-600 mb-2 mx-auto" />
                  <p className="text-gray-500 italic text-sm">No achievements yet</p>
              </div>
          )}
        </div>
                 
        {/* الكرت الثالث: التحدي الأسبوعي */}
        <div className="snap-center shrink-0 w-[85vw] md:w-auto bg-[#121620]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-800/50 flex flex-col items-center justify-center text-center shadow-xl min-h-[250px] md:min-h-[280px] relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5 blur-[40px] rounded-full"></div>

          <p className="text-gray-400 text-[10px] mb-6 uppercase font-black tracking-[0.3em] relative z-10">
              Weekly Challenge
          </p>

          <div className="relative w-32 h-32 flex items-center justify-center z-10"> 
              <svg className="w-full h-full transform -rotate-90">
                  <circle 
                      cx="50%" cy="50%" r="58" 
                      stroke="#1f2937" strokeWidth="10" fill="transparent"
                  />
                  <circle 
                      cx="50%" cy="50%" r="58" 
                      stroke={weeklyProgress.percent === 100 ? "#10b981" : "#3b82f6"} 
                      strokeWidth="10" 
                      fill="transparent" 
                      strokeDasharray="364.4" 
                      strokeDashoffset={364.4 - (364.4 * weeklyProgress.percent) / 100} 
                      strokeLinecap="round" 
                      className="transition-all duration-1000 ease-out"
                      style={{ filter: `drop-shadow(0 0 8px ${weeklyProgress.percent === 100 ? "#10b981" : "#3b82f6"}88)` }}
                  />
              </svg>
              <span className="absolute text-2xl font-black text-white italic tracking-tighter">
                  {weeklyProgress.percent}%
              </span>
          </div>

          <p className="text-[10px] text-gray-500 mt-6 uppercase font-bold tracking-widest relative z-10">
              {weeklyProgress.current} <span className="text-gray-700">/</span> {weeklyProgress.required} Wins Logged
          </p>
        </div>

      </div>
    </MainLayout>
  );
};

const GameCard = ({ title, desc, gradient, borderColor, btnColor, icon, bgImage }: any) => (
  <div className={`relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] ${gradient} backdrop-blur-md border ${borderColor} p-6 md:p-10 flex flex-col justify-between min-h-[260px] md:min-h-[300px] h-full group transition-all duration-500 hover:scale-[1.02] shadow-2xl w-full`}> 
     <div className="z-20 relative">
        {icon}
        <h3 className="text-2xl font-black mt-4 uppercase italic leading-none">{title}</h3>
        <p className="text-white/70 text-sm mt-3 max-w-[70%] font-medium">{desc}</p>
     </div>
     <button className={`w-fit px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 ${btnColor} shadow-xl z-20`}>
        <Play size={16} fill="currentColor" /> Play Now
     </button>
     <div className="absolute -right-8 -bottom-8 w-[70%] h-[70%] z-10 bg-contain bg-no-repeat bg-right-bottom opacity-100 transition-transform duration-700 group-hover:scale-110" 
          style={{ backgroundImage: `url('${bgImage}')` }}>
     </div>
  </div>
);

export default UserHome;