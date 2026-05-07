import React from 'react';
import { Trophy, Medal } from 'lucide-react';

const LeaderboardTab = ({ players = [] }: any) => {
    
    const getMedalColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'; // ذهبي
        if (rank === 2) return 'text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]'; // فضي
        if (rank === 3) return 'text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]'; // برونزي
        return 'text-gray-500';
    };

    return (
        <div className="animate-in fade-in duration-500 bg-[#0b1221] border border-gray-800 rounded-[2.5rem] overflow-hidden max-w-4xl shadow-2xl">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Trophy className="text-cyan-400 w-6 h-6" />
                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Top Players</h2>
                </div>
                {}
                <span className="bg-gray-900 text-gray-400 text-[10px] px-3 py-1 rounded-full border border-gray-800 font-bold">
                    {players.length} TOTAL RANKED
                </span>
            </div>
            
            <div className="p-6 min-h-[350px] space-y-3">
                {players.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500 font-bold">
                        <Trophy className="w-12 h-12 mb-4 opacity-10" />
                        <p>No players have scores yet.</p>
                    </div>
                ) : (
                    players.map((player: any, i: number) => (
                        <div 
                            key={i} 
                            className={`flex items-center justify-between p-4 bg-[#050810]/50 border rounded-2xl transition-all duration-300 hover:scale-[1.01] ${
                                i === 0 ? 'border-yellow-400/20 bg-yellow-400/5' : 'border-gray-800/40 hover:border-cyan-500/30'
                            }`}
                        >
                            <div className="flex items-center gap-6">
                                {/* رقم الترتيب أو الميدالية */}
                                <div className="w-10 flex justify-center">
                                    {player.rank <= 3 ? (
                                        <Medal className={getMedalColor(player.rank)} size={28} />
                                    ) : (
                                        <span className="text-gray-600 font-black italic text-lg">#{player.rank}</span>
                                    )}
                                </div>
                                
                                {/* صورة اللاعب */}
                                <div className={`w-12 h-12 rounded-full border-2 overflow-hidden bg-gray-900 hidden sm:block ${
                                    player.rank === 1 ? 'border-yellow-400' : 'border-gray-800'
                                }`}>
                                    <img 
                                        src={`/${player.avatar || 'saudi-man.png'}`} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-white font-black tracking-wide text-md">{player.name}</span>
                                    {player.rank === 1 && <span className="text-[8px] text-yellow-400 font-black uppercase tracking-[0.2em]">Current Champion</span>}
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Total Points</span>
                                <div className="flex items-center gap-2 justify-end">
                                    <span className="text-cyan-400 font-black text-xl tracking-tighter">
                                        {player.points.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LeaderboardTab;