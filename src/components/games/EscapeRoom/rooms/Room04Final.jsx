import React, { useState, useEffect } from 'react';
import { Lock, Zap, ShieldCheck, Unlock } from 'lucide-react';
import { socket } from '../../../../socket';

const Room04Final = ({ sessionId, myRole, data }) => {
  const [ansInput, setAnsInput] = useState("");
  const [finalInput, setFinalInput] = useState("");
  const [layer1Done, setLayer1Done] = useState(false);

const isMySpecialty = myRole && myRole?.includes('Infiltrator');

  useEffect(() => {
socket.on("receive_input_sync", (data) => {
      if (!isMySpecialty && data && typeof data === 'object') {
        if (data.field === 'layer1') setAnsInput(data.text);
        if (data.field === 'final') setFinalInput(data.text);
      }
    });

    socket.on("layer_01_unlocked", () => {
      setLayer1Done(true);
    });

    return () => {
      socket.off("receive_input_sync");
      socket.off("layer_01_unlocked");
    };
  }, [isMySpecialty]);

const handleLayer1Typing = (e) => {
    if (!isMySpecialty) return;
    const val = e.target.value.toUpperCase();
    setAnsInput(val);
    socket.emit("sync_room_input", { 
      sessionId, 
      value: { field: 'layer1', text: val } 
    });
  };

  const handleFinalTyping = (e) => {
    if (!isMySpecialty) return;
    const val = e.target.value.toUpperCase();
    setFinalInput(val);
    socket.emit("sync_room_input", { 
      sessionId, 
      value: { field: 'final', text: val } 
    });
  };

  const checkLayer1 = () => {
    if (!isMySpecialty || !ansInput.trim()) return;
    socket.emit("attempt_room_solve", { sessionId, attempt: { type: "layer1", value: ansInput } });
  };

  const checkFinalBreach = () => {
    if (!isMySpecialty || !finalInput.trim()) return;
    socket.emit("attempt_room_solve", { sessionId, attempt: { type: "final", value: finalInput } });
  };

  return (
    <div className="w-full max-w-4xl space-y-8 animate-in slide-in-from-top-4 duration-1000 font-mono relative pb-10">
      
      <div className="bg-[#0a1020] border-2 border-[#ff88cc] p-8 rounded-[2rem] shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
          <Lock size={80} />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-[#ff88cc]/20 rounded-lg text-white">
            <Lock size={20} />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.3em] text-white">
            ROOM_04: Dual-Layer Protocol
          </span>
        </div>

        <p className="text-md text-gray-300 leading-relaxed">
          <strong className="text-white uppercase">[ CRITICAL ]:</strong> The central core is protected by <span className="text-[#ff88cc] font-black underline">Two-Factor Encryption</span>. 
          Decrypt the Base64 hash first, then use the <span className="text-[#ff88cc] font-bold">Vigenère Key</span> to provide the Master Security Key.
          
          <span className="block mt-4 text-[13px] font-medium text-[#ff88cc]/60 italic border-t border-white/5 pt-3">
            * Specialist: <span className="text-[#ff88cc] font-black underline">Infiltrator</span> is responsible for terminal commands. Others assist via <span className="text-white font-black italic">chat</span>.
          </span>
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-[#ff88cc]/20 rounded-3xl blur opacity-20 transition duration-1000"></div>
        <div className="relative bg-[#060e08] border-2 border-[#ff88cc]/30 rounded-[2.5rem] p-12 text-center shadow-2xl">
          <div className="text-3xl md:text-5xl font-black text-[#ff88cc] tracking-[0.3em] drop-shadow-[0_0_20px_rgba(255,136,204,0.4)] break-all">
            {data?.layer1?.replace(/=/g, '')}
          </div>
          <div className="mt-8 flex justify-center gap-6 text-[11px] font-black uppercase tracking-widest text-gray-500">
            <span className="flex items-center gap-2"><Zap size={14}/> Algorithm: B64_VIG</span>
            <span className="flex items-center gap-2 animate-pulse text-[#ff88cc]"><Lock size={14}/> ACCESS_RESTRICTED</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className={`p-8 rounded-[2rem] border-2 transition-all duration-700 ${layer1Done ? 'bg-[#001a0a]/40 border-[#00ff96]/40 opacity-60 scale-[0.98]' : 'bg-[#0a1020] border-white/10 shadow-xl'}`}>
          <div className="flex items-center gap-4 mb-6 text-left">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${layer1Done ? 'bg-[#00ff96] text-black' : 'bg-white/10 text-white'}`}>
              {layer1Done ? '✓' : '1'}
            </div>
            <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${layer1Done ? 'text-[#00ff96]' : 'text-gray-400'}`}>Layer 01: Base64 Decryption</h3>
          </div>
          
          {!layer1Done && (
            <div className="flex gap-4">
              <input 
                value={ansInput} 
                onChange={handleLayer1Typing}
                disabled={!isMySpecialty}
                placeholder={isMySpecialty ? "DECODE_LAYER_01..." : "WAITING FOR INFILTRATOR..."} 
                className="flex-1 bg-black border border-white/10 p-5 rounded-2xl text-xl font-bold text-[#00ff96] tracking-[0.2em] outline-none uppercase focus:border-[#00ff96]/40 transition-all" 
              />
              {isMySpecialty && (
                <button onClick={checkLayer1} className="bg-[#00ff96] text-black px-10 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95">Verify</button>
              )}
            </div>
          )}
        </div>

        <div className={`p-8 rounded-[2rem] border-2 transition-all duration-700 ${layer1Done ? 'bg-[#0a1020] border-[#6040ff]/50 shadow-[0_0_40px_rgba(96,64,255,0.15)]' : 'bg-black/20 border-white/5 opacity-20 pointer-events-none'}`}>
          <div className="flex items-center justify-between mb-6 text-left">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${layer1Done ? 'bg-[#6040ff] text-white' : 'bg-white/10 text-white'}`}>2</div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                Layer 02: Vigenère Key: 
                <span className="px-4 py-1 bg-red-500/10 border-2 rounded-lg  animate-pulse skew-x-[-10deg] font-black tracking-widest">
                  {data?.vKey}
                </span>
              </h3>
            </div>
          </div>
          
          <div className="flex gap-4">
            <input 
              value={finalInput} 
              onChange={handleFinalTyping}
              disabled={!isMySpecialty || !layer1Done}
              placeholder={isMySpecialty ? "INPUT_MASTER_KEY..." : "WAITING FOR INFILTRATOR..."} 
              className="flex-1 bg-black border border-[#6040ff]/30  p-5 rounded-2xl text-xl font-bold tracking-[0.2em] outline-none shadow-inner uppercase focus:border-[#ff88cc]/40 transition-all" 
            />
            {isMySpecialty && (
              <button onClick={checkFinalBreach} className="bg-[#6040ff] text-white px-10 rounded-2xl font-black uppercase tracking-widest hover:bg-[#8060ff] transition-all shadow-[0_0_20px_#6040ff/40] active:scale-95">Unlock Door</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room04Final;