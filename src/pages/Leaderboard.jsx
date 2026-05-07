const Leaderboard = () => {
  const players = [
    { rank: 1, name: "Tala", score: 4500, status: "Legendary" },
    { rank: 2, name: "Cyber_King", score: 4200, status: "Master" },
    { rank: 3, name: "NullPointer", score: 3800, status: "Expert" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h3 className="text-2xl font-black mb-8 italic text-rose-500 uppercase">Top Heroes</h3>
      <div className="space-y-4">
        {players.map((p) => (
          <div key={p.rank} className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${p.rank === 1 ? 'bg-rose-500/10 border-rose-500/50 scale-105' : 'bg-white/5 border-gray-800'}`}>
            <div className="flex items-center gap-6">
              <span className={`text-2xl font-black ${p.rank === 1 ? 'text-rose-500' : 'text-gray-500'}`}>#{p.rank}</span>
              <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-cyan-500"></div>
              <div>
                <p className="font-bold text-lg">{p.name}</p>
                <p className="text-xs text-cyan-400 uppercase font-black tracking-widest">{p.status}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{p.score}</p>
              <p className="text-[10px] text-gray-500 uppercase">Points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Leaderboard;