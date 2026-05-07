import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Zap } from 'lucide-react';
import { socket } from '../../../../socket';

const Room03Logic = ({ sessionId, myRole, data }) => {
  const [selectedPath, setSelectedPath] = useState([]);
  
const isMySpecialty = myRole && myRole?.includes('Logic');

  useEffect(() => {
    socket.on("sync_logic_tiles", (indices) => {
      setSelectedPath(indices);
    });
    return () => socket.off("sync_logic_tiles");
  }, []);

const handleTileClick = (index) => {
  if (!isMySpecialty) return;

  if (!data.correctIndices.includes(index)) {
      socket.emit("attempt_room_solve", { 
          sessionId, 
          attempt: { isSingleCheck: true, index: index } 
      });
      return; 
  }

  let newPath;
  if (selectedPath.includes(index)) {
    newPath = selectedPath.filter(i => i !== index);
  } else {
    newPath = [...selectedPath, index];
  }

  setSelectedPath(newPath);
  socket.emit("update_logic_state", { sessionId, selectedIndices: newPath });

  if (newPath.length === data?.correctIndices?.length) {
    socket.emit("attempt_room_solve", { sessionId, attempt: newPath });
  }
};

  return (
    <div className="w-full max-w-5xl space-y-8 animate-in zoom-in duration-700 font-mono relative pb-10">
      
      <div className="bg-[#0a1020] border-2 border-[#00ff96]/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Cpu size={80} /></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#00ff96]/20 rounded-lg text-[#00ff96]"><Cpu size={24} /></div>
          <span className="text-sm font-black uppercase tracking-[0.3em] text-[#00ff96]">
            ROOM_03: Logic Sequence Verification
          </span>
        </div>
        <p className="text-md text-gray-300 leading-relaxed max-w-3xl">
          <strong className="text-white uppercase">[ DIRECTIVE ]:</strong> The security gate is locked by a Boolean logic trap. 
          Analyze the blocks and select only the <span className="text-[#00ff96] font-black underline decoration-double italic text-lg">TAUTOLOGIES</span> <span className="text-[#00ff96]/70 italic"> (Statements always TRUE)</span>.
          <span className="block mt-3 text-[14px] font-medium text-[#00ff96]/50 italic">
  * Specialist: <span className="text-[#00ff96] font-black">Logic Specialist</span>. Others assist via <span className="text-white border-b border-white pb-0.5 font-black italic">chat</span>
</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data?.tiles?.map((tile, i) => {
          const isSelected = selectedPath.includes(i);
          return (
            <div 
              key={i} 
              onClick={() => handleTileClick(i)} 
              className={`group relative h-44 flex flex-col rounded-[2.5rem] border-2 transition-all duration-500 shadow-xl overflow-hidden
                ${isSelected 
                  ? 'bg-[#001a10] border-[#00ff96] shadow-[0_0_40px_rgba(0,255,150,0.2)] scale-105' 
                  : isMySpecialty 
                    ? 'bg-[#060e08] border-white/5 cursor-pointer hover:border-[#00ff96]/40 hover:bg-[#00ff96]/5 hover:-translate-y-1'
                    : 'bg-[#060e08] border-white/5 opacity-60 cursor-not-allowed'
                }`}
            >
              <div className={`absolute top-5 left-6 text-[10px] font-black tracking-widest 
                ${isSelected ? 'text-[#00ff96]' : 'text-gray-700'}`}>
                LOGIC_BLOCK_0{i + 1}
              </div>

              <div className="flex-1 flex items-center justify-center px-6">
                <span className={`text-2xl font-black tracking-tighter text-center transition-all duration-500
                  ${isSelected ? 'text-[#00ff96] drop-shadow-[0_0_10px_#00ff96] scale-110' : 'text-gray-500 group-hover:text-white'}`}>
                  {tile}
                </span>
              </div>

              <div className={`h-1.5 w-full transition-all duration-500 ${isSelected ? 'bg-[#00ff96]' : 'bg-transparent'}`}></div>
            </div>
          );
        })}
      </div>

      <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-black text-[#506070] uppercase tracking-[0.4em]">Validation Status:</span>
          <div className="flex gap-2">
            {Array(data?.correctIndices?.length || 0).fill(0).map((_, idx) => (
              <div 
                key={idx} 
                className={`w-12 h-1.5 rounded-full transition-all duration-1000 ${idx < selectedPath.length ? 'bg-[#00ff96] shadow-[0_0_15px_#00ff96]' : 'bg-white/5'}`}
              ></div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end leading-none">
          <span className="text-2xl font-black text-[#00ff96] italic tracking-tighter">
            {selectedPath.length}<span className="text-white/20 text-sm mx-1">/</span>{data?.correctIndices?.length}
          </span>
          <span className="text-[9px] font-bold text-[#00ff96]/40 uppercase tracking-widest mt-1">Keys Verified</span>
        </div>
      </div>

    </div>
  );
};

export default Room03Logic;