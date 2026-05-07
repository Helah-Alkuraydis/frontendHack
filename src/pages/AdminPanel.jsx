const AdminPanel = () => {
  return (
    <div className="p-10 bg-[#0a0f1a] rounded-[3rem] border border-emerald-500/20">
      <h2 className="text-2xl font-black text-emerald-400 mb-8 uppercase italic">Admin: Deploy Weekly Mission</h2>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Release Date</label>
          <input type="date" className="w-full bg-black/40 border border-gray-800 p-4 rounded-2xl text-white outline-none focus:border-emerald-500" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Special Points Multiplier</label>
          <select className="w-full bg-black/40 border border-gray-800 p-4 rounded-2xl text-white outline-none focus:border-emerald-500">
            <option>x1.5 Points</option>
            <option>x2.0 Points (Golden Week)</option>
          </select>
        </div>
      </div>
      <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-900/20">
        Push Weekly Challenge to Server 🚀
      </button>
    </div>
  );
};
export default AdminPanel;