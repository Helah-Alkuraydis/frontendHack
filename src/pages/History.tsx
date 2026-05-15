import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Star, Loader2, History as HistoryIcon, Filter, ChevronDown } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { BASE_URL } from '../api/auth.js';

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState('Newest Matches'); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
            setIsFilterOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

const sortedHistory = useMemo(() => {
    let list = [...history];
    
    switch (sortBy) {
        case 'Newest Matches': 
            list.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
            break;
        case 'Oldest Matches':
            list.sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime());
            break;
        case 'Highest Score': 
            list.sort((a, b) => (b.scoreEarned || 0) - (a.scoreEarned || 0));
            break;
        default:
            break;
    }

    return list.slice(0, 5); 
}, [history, sortBy]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userRes = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const myId = userRes.data._id;
        const res = await axios.get(`${BASE_URL}/dashboard/${myId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.history) {
           setHistory(res.data.history);
        }
      } catch (err) {
        console.error("Frontend Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return (
    <MainLayout activePage="dashboard">
      <div className="flex justify-center items-center h-[500px]">
        <Loader2 className="animate-spin text-[#ff3b6b]" size={40} />
      </div>
    </MainLayout>
  );

  return (
    <MainLayout activePage="dashboard">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col flex-1 pb-10 px-4 md:px-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-6">
              <button 
                  onClick={() => navigate('/dashboard')} 
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-gray-400 hover:text-white group"
              >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <h1 className="text-3xl font-black tracking-widest text-white uppercase italic drop-shadow-md">
                  HISTORY
              </h1>
          </div>

          <div className="relative w-full md:w-auto" ref={filterRef}>
              <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full md:w-auto flex items-center justify-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black italic text-gray-400 hover:text-[#ff3b6b] hover:border-[#ff3b6b]/30 transition-all uppercase tracking-widest"
              >
                  <Filter size={14} /> Sort By: {sortBy.replace('-', ' ')} <ChevronDown size={14} />
              </button>

              {isFilterOpen && (
                  <div className="absolute top-12 left-0 md:left-auto md:right-0 w-full md:w-56 bg-[#0f172a] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in zoom-in duration-200">
                      {[
                          { id: 'Newest Matches', label: 'Newest Matches 📅' },
                          { id: 'Oldest Matches', label: 'Oldest Matches ⏳' },
                          { id: 'Highest Score', label: 'Highest Score 🏆' },
                      ].map((option) => (
                          <button
                              key={option.id}
                              onClick={() => { setSortBy(option.id); setIsFilterOpen(false); }}
                              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                                  sortBy === option.id ? 'bg-[#ff3b6b]/10 text-[#ff3b6b]' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                              }`}
                          >
                              {option.label}
                          </button>
                      ))}
                  </div>
              )}
          </div>
        </div>

        <div className="bg-[#050810]/60 border border-white/10 rounded-[2.5rem] p-4 md:p-10 w-full shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] backdrop-blur-xl min-h-[500px] flex flex-col">
          
          {/* عناوين الجدول (تظهر باللابتوب فقط) */}
          <div className="hidden md:grid grid-cols-5 text-sm font-black italic text-gray-500 mb-6 px-4 pr-6 uppercase tracking-tighter">
            <div>Game</div>
            <div>Date & Time</div>
            <div>Duration</div>
            <div>Score</div>
            <div>Outcome</div>
          </div>

          <div className="hidden md:block h-px w-full bg-white/10 mb-2"></div>

          <div className="flex flex-col flex-1 overflow-y-auto pr-2 custom-scrollbar" 
               style={{ scrollbarWidth: 'thin', scrollbarColor: '#4b5563 transparent' }}>
            
            {sortedHistory.length > 0 ? (
                sortedHistory.map((row, index) => (
                <div key={row._id || index} className="grid grid-cols-1 md:grid-cols-5 items-center py-5 px-4 text-white hover:bg-white/5 rounded-2xl transition-all group border-b border-white/5 last:border-0 gap-3 md:gap-0">
                  
                  {/* أسم اللعبة والنتيجة بالجوال */}
                  <div className="font-bold text-[15px] group-hover:text-cyan-400 transition-colors uppercase italic flex justify-between md:block items-center">
                    {row.gameName || "Unknown Game"} 
                    <span className={`md:hidden px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                      row.status === 'Win' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </div>

                  <div className="text-gray-300 text-xs font-mono flex md:block justify-between items-center">
                    <span className="md:hidden text-gray-500 uppercase font-black text-[10px]">Date</span>
                    <span>{new Date(row.playedAt).toLocaleDateString()} - {new Date(row.playedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  
                  <div className="text-gray-300 text-sm flex md:block justify-between items-center">
                    <span className="md:hidden text-gray-500 uppercase font-black text-[10px]">Duration</span>
                    <span>{row.duration}s</span>
                  </div>
                  
                  <div className="flex justify-between md:justify-start items-center gap-2 text-yellow-500 font-black italic">
                    <span className="md:hidden text-gray-500 uppercase font-black text-[10px] not-italic">Score</span>
                    <div className="flex items-center gap-2">
                        <Star size={16} className="fill-yellow-500" /> {row.scoreEarned}
                    </div>
                  </div>
                  
                  {/* النتيجة باللابتوب */}
                  <div className="hidden md:block">
                    <span className={`px-4 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      row.status === 'Win' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-20">
                <HistoryIcon size={60} className="mb-4" />
                <p className="text-lg font-bold italic uppercase tracking-[0.3em]">No Match History Found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default History;