import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
// @ts-ignore
import '../styles/AdminStyles.css';
import { Settings, Save, X, Eye, EyeOff, Edit3 } from 'lucide-react';

const getGameStyles = (gameId: string) => {
 const configs: any = {
  // 1. Privacy Awareness 
  "69cee7269c67c2d9c0ae20a1": { 
    img: "/blue.png", 
    gradient: "from-sky-600/40 to-sky-900/10", 
    border: "border-sky-500/30", 
    glow: "shadow-sky-500/20" 
  },

  // 2. Password Maker/Breaker
  "69cee7269c67c2d9c0ae20a2": { 
    img: "/game-key.png", 
    gradient: "from-amber-500/40 to-amber-900/10", 
    border: "border-amber-500/30", 
    glow: "shadow-amber-500/20" 
  },

  // 3. Secure Coding Challenge
  "69cee7269c67c2d9c0ae20a3": { 
    img: "/Secure Coding Challenge.png", 
    gradient: "from-rose-600/40 to-rose-900/10", 
    border: "border-rose-500/30", 
    glow: "shadow-rose-500/20" 
  },

  // 4. Phishing Hunter 
  "69cee7269c67c2d9c0ae209d": { 
    img: "/image_1.png", 
    gradient: "from-blue-600/40 to-blue-900/10", 
    border: "border-blue-500/30", 
    glow: "shadow-blue-500/20" 
  },

  // 5. Firewall Defender 
  "69cee7269c67c2d9c0ae209e": { 
    img: "/game-shield.png", 
    gradient: "from-red-600/40 to-red-900/10", 
    border: "border-red-500/30", 
    glow: "shadow-red-500/20" 
  },

  // 6. Hack Race 
  "69cee7269c67c2d9c0ae20a0": { 
    img: "/game-runner.png", 
    gradient: "from-emerald-500/40 to-emerald-900/10", 
    border: "border-emerald-500/30", 
    glow: "shadow-emerald-500/20" 
  },

  // 7. Cyber Escape Room 
  "69cee7269c67c2d9c0ae209f": { 
    img: "/game-escape.png", 
    gradient: "from-purple-600/40 to-purple-900/10", 
    border: "border-purple-500/30", 
    glow: "shadow-purple-500/20" 
  }
};
  return configs[gameId] || { img: "/image_1.png", gradient: "from-gray-600/40 to-gray-900/10", border: "border-gray-500/30", glow: "shadow-gray-500/20" };
};

const AdminGamesManagement = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<any>(null);

const fetchGames = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/games?all=true', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setGames(res.data.data || []);
    } catch (err) { 
        console.error(err); 
    } finally { 
        setLoading(false); 
    }
};

  useEffect(() => { fetchGames(); }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/games/${editingGame._id}`, 
        { gameName: editingGame.gameName, isActive: editingGame.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingGame(null);
      fetchGames();
    } catch (err) { alert("Update Failed"); }
  };

  if (loading) return <div className="p-20 text-white font-black italic animate-pulse text-center">LOADING SYSTEM ...</div>;

  return (
<AdminLayout activePage="admin-games">
          <div className="max-w-5xl mx-auto pb-20">
        
        <div className="mb-12">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
        Games Management
          </h1>
        </div>

<div className="admin-main-wrapper-card space-y-6"> 
  {games.map((game: any) => {
    const style = getGameStyles(game._id);
    return (
      <div key={game._id} className={`flex items-center justify-between p-6 rounded-[2.5rem] border ${style.border} bg-gradient-to-r ${style.gradient} backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50`}>
        
        <div className="flex items-center gap-8"> 
          
          <div className={`w-20 h-20 rounded-[1.5rem] bg-black/40 flex items-center justify-center border ${style.border} shadow-2xl ${style.glow}`}>
            <img src={style.img} className="w-20 h-20 object-contain" alt="Icon" />
          </div>

          <div>
            <h3 className="text-2xl font-black italic uppercase text-white mb-2 tracking-tight">
              {game.gameName}
            </h3>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${game.isActive !== false ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'}`}>
                {game.isActive !== false ? 'Active' : 'Inactive'}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                {game.category}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setEditingGame(game)}
          className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all shadow-lg active:scale-95"
        >
          Manage
        </button>
      </div>
    );
  })}
</div>
      </div>

      {editingGame && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="admin-main-wrapper-card w-full max-w-md border-blue-500/30">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black italic uppercase text-white">Edit Asset</h2>
                <button onClick={() => setEditingGame(null)} className="text-gray-500 hover:text-white"><X size={20}/></button>
             </div>

             <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                   <label className="admin-label">Display Name</label>
                   <input 
                     type="text" 
                     className="admin-input font-bold italic"
                     value={editingGame.gameName}
                     onChange={(e) => setEditingGame({...editingGame, gameName: e.target.value})}
                   />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                   <div>
                      <p className="text-xs font-black uppercase italic text-white">Status</p>
                      <p className="text-[9px] text-gray-500 uppercase">Visibility in User Dashboard</p>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setEditingGame({...editingGame, isActive: !editingGame.isActive})}
                     className={`p-3 rounded-xl transition-all ${editingGame.isActive !== false ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}
                   >
                     {editingGame.isActive !== false ? <Eye size={20}/> : <EyeOff size={20}/>}
                   </button>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20">
                   <Save size={18}/> Save Asset Data
                </button>
             </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminGamesManagement;