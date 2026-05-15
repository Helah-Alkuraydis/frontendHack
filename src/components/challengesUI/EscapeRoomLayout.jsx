import React, { useEffect, useState } from "react";
import { Search, Zap, ShieldCheck, Loader2, ShieldAlert, Cpu, Globe, Shield, Lock, HelpCircle, Key, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";

const EscapeRoomLayout = ({
  scenario,
  currentRoomIdx,
  timeLeft,
  setTimeLeft, 
  answerInput,
  setAnswerInput,
  onBreach,
  activeHint,  
  onShowHint,   
  isWrong, 
}) => {
  // --- حالات خاصة بالغرفة الرابعة (الطبقات) ---
  const [layer1Done, setLayer1Done] = useState(false);
  const [layer1Input, setLayer1Input] = useState("");

  // --- حالات المؤثرات البصرية ---
  const [showPenalty, setShowPenalty] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState("");

  const currentRoom = scenario && scenario[currentRoomIdx] ? scenario[currentRoomIdx] : null;

  // تصغير التلميح والطبقات عند الانتقال بين الغرف
  useEffect(() => {
    setLayer1Done(false);
    setLayer1Input("");
  }, [currentRoomIdx]);

  // 🔊 تنبيه النجاح عند الانتقال لغرفة جديدة
  useEffect(() => {
    if (currentRoomIdx > 0) {
      Swal.fire({
        title: 'PROTOCOL_BREACHED',
        text: `Node 0${currentRoomIdx} Isolated Successfully!`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#080c14',
        color: '#00ff96',
        customClass: { popup: 'border-2 border-[#00ff96] rounded-[2rem] font-mono shadow-[0_0_30px_rgba(0,255,150,0.2)]' }
      });
    }
  }, [currentRoomIdx]);

  
  useEffect(() => {
    if (isWrong) {
      triggerPenalty("-15s");
      Swal.fire({
        title: 'ACCESS_DENIED',
        text: 'Security Trap Triggered: Penalty Applied.',
        icon: 'error',
        timer: 1500, 
        showConfirmButton: false,
        background: '#080c14',
        color: '#ff0055',
        customClass: { popup: 'border-2 border-[#ff0055] rounded-[2rem] font-mono shadow-[0_0_30px_rgba(255,0,85,0.2)]' }
      });
    }
  }, [isWrong]);

 const triggerPenalty = (amount) => {
    setPenaltyAmount(amount);
    setShowPenalty(true);
    setTimeout(() => setShowPenalty(false), 1500);
  };

  // ✅ حل مشكلة الضغطة الواحدة: نرسل القيمة مباشرة للدالة لنتخطى تأخير الـ State
  const handleInstantBreach = (value) => {
    setAnswerInput(value);
    onBreach(value); 
  };

  // دالة فحص الطبقة الأولى (Base64) محلياً قبل فتح الطبقة الثانية
  const checkLayer1 = () => {
    try {
      const decoded = window.atob(currentRoom?.puzzle_data || "");
      if (layer1Input.trim().toUpperCase() === decoded.toUpperCase()) {
        setLayer1Done(true);
        setAnswerInput(""); // تصفير الحقل للخطوة النهائية
        Swal.fire({ title: 'LAYER_01_DECRYPTED', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      } else {
        if (typeof setTimeLeft === 'function') setTimeLeft(prev => Math.max(0, prev - 10));
        triggerPenalty("-10s");
      }
    } catch (e) {
      triggerPenalty("-10s");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentRoom) return (
    <div className="h-screen bg-[#050810] flex items-center justify-center text-[#00ff96] font-mono animate-pulse uppercase tracking-[0.3em]">
      <Loader2 className="mr-3 animate-spin" /> SYNCING_WITH_CORE...
    </div>
  );

  return (
    <div className={`h-screen cyber-bg flex flex-col overflow-hidden font-mono transition-all duration-500 
      ${isWrong ? 'bg-red-950/20 shake-screen' : ''}`}>
      
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-10px); } 40%, 80% { transform: translateX(10px); } }
        .shake-screen { animation: shake 0.3s ease-in-out; }
        @keyframes float-up { 0% { opacity: 0; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-20px); } 100% { opacity: 0; transform: translateY(-50px); } }
        .penalty-anim { animation: float-up 1.5s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #00ff9620; border-radius: 10px; }
      `}</style>
      
      {/* 1. Header */}
      {/* <header className="flex items-center justify-between px-8 py-5 bg-[#080c16] border-b border-[#00ff9610] relative z-20 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 bg-[#00ff96] rounded-full animate-pulse shadow-[0_0_10px_#00ff96]"></div>
          <div className="text-xs font-black text-[#00ff96] tracking-[0.4em] uppercase italic opacity-80">HACKHERO_ESCAPE</div>
        </div>

        <div className="relative flex items-center gap-6">
          {showPenalty && <span className="absolute -left-16 font-black text-red-500 text-xl penalty-anim">{penaltyAmount}</span>}
          <div className={`flex items-center gap-3 bg-[#0d1a0d] border ${timeLeft < 30 ? 'border-red-500 animate-pulse' : 'border-[#00ff9620]'} px-8 py-2 rounded-full shadow-[0_0_20px_rgba(0,255,150,0.05)]`}>
             <span className={`text-3xl font-black ${timeLeft < 30 ? 'text-red-500' : 'text-[#00ff96]'}`}>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header> */}

      

      {/* 2. Progress Bar */}
      <div className="flex h-1.5 bg-[#1a1a2e] relative z-20">
        {scenario.map((_, idx) => (
          <div key={idx} className={`flex-1 mx-[1px] transition-all duration-1000 ${idx < currentRoomIdx ? 'bg-[#00ff96] shadow-[0_0_15px_#00ff96]' : idx === currentRoomIdx ? 'bg-[#00cc77] animate-pulse' : 'bg-[#1a1a2e]'}`} />
        ))}
      </div>

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto z-10 flex flex-col items-center gap-8 custom-scrollbar">
        
        {/* ROOM 1: Cipher */}
        {currentRoomIdx === 0 && (
          <div className="w-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700 relative">
            <div className="bg-[#0d131f] border-l-4 border-pink-500 p-6 rounded-r-xl shadow-lg text-left border border-white/5 backdrop-blur-sm">
                <span className="text-[12px] font-black uppercase text-pink-500">ROOM_01: INTERCEPTED_SIGNAL</span>
                <p className="text-gray-400 text-sm italic">Analyze the packet stream and recover the plaintext.</p>
            </div>
            <div className="bg-[#060e08] border border-pink-500/20 rounded-[2rem] p-12 font-mono text-center shadow-2xl relative overflow-hidden group">
                <div className="text-4xl md:text-6xl text-[#ff88cc] font-black tracking-[0.4em] glitch-text uppercase relative z-10">
                  {currentRoom?.puzzle_data}
                </div>
            </div>
            <div className="flex justify-end px-2">
                <button onClick={() => { if(!activeHint) { triggerPenalty("-10s"); setTimeLeft(p => p - 10); onShowHint(); } }} 
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all font-mono ${activeHint ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'bg-[#0a1020] border-white/5 text-gray-500 hover:text-white'}`}>
                  <Lock size={14} /> <span className="text-[11px] font-black uppercase">{activeHint ? `DECRYPTION: ${currentRoom?.hint}` : "REQUEST_HINT (-10S)"}</span>
                </button>
            </div>
            <div className="relative group">
              <div className="relative flex gap-3 p-2 bg-black/60 border border-white/10 rounded-2xl focus-within:border-[#00ff9650] backdrop-blur-xl">
                <input 
                  value={answerInput} 
                  onChange={e => setAnswerInput(e.target.value.toUpperCase())} 
                  onKeyDown={e => e.key === 'Enter' && onBreach(answerInput)}
                  placeholder="ENTER DECRYPTED KEY..." 
                  className="flex-1 bg-transparent p-5 text-[#00ff96] font-bold tracking-[0.3em] outline-none text-xl uppercase" 
                />
                <button onClick={() => onBreach(answerInput)} className="bg-[#00ff96] text-black px-12 py-4 rounded-xl font-black uppercase italic tracking-widest hover:bg-white transition-all active:scale-95">BREACH</button>
              </div>
            </div>
          </div>
        )}

        {/* ROOM 2: Network Audit */}
        {currentRoomIdx === 1 && (
          <div className="w-full flex flex-col gap-6 animate-in slide-in-from-right-4 duration-700">
             <div className="bg-[#0a1020] border-l-4 border-blue-500 p-6 rounded-r-xl text-left border border-white/5 shadow-lg">
                <span className="text-[11px] font-black uppercase text-blue-400 block mb-2 font-mono">SCANNING_LIVE_ROOM...</span>
                <p className="text-gray-300 text-sm italic">Identify the compromised terminal IP from the logs below.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {currentRoom?.options?.map((ip, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleInstantBreach(ip)} 
                      className={`group bg-[#060e08] border-2 p-8 rounded-[2.5rem] text-center cursor-pointer transition-all hover:border-blue-500/50 hover:-translate-y-1
                        ${answerInput === ip ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-white/5 opacity-70'}`}
                    >
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💻</div>
                      <p className="text-[13px] font-bold text-blue-400 font-mono tracking-tighter">{ip}</p>
                    </div>
                ))}
            </div>
            <div className="bg-black/60 border border-white/5 rounded-[2.5rem] p-8 text-left shadow-inner">
                <div className="space-y-3 max-h-48 overflow-y-auto font-mono text-xs pr-4 custom-scrollbar">
                  {currentRoom?.logs?.map((log, i) => (
                    <div key={i} className="flex gap-4 text-blue-500/80">
                       <span className="opacity-40">[{log.ts}]</span> <span className="text-gray-400">&gt; {log.msg}</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        )}

        {/* ROOM 3: Logic Sequence */}
        {currentRoomIdx === 2 && (
          <div className="w-full flex flex-col gap-6 animate-in zoom-in">
             <div className="bg-[#060e08] border-2 border-emerald-500/20 p-12 rounded-[3.5rem] text-center shadow-2xl relative overflow-hidden">
                <div className="text-xl md:text-3xl font-mono text-white bg-white/5 p-8 rounded-3xl mb-10 border border-white/5 shadow-inner">
                   {currentRoom?.puzzle_data}
                </div>
                <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                   <button onClick={() => handleInstantBreach("TRUE")} className="py-8 rounded-[2rem] border-2 border-emerald-500/20 text-emerald-500 font-black text-2xl hover:bg-emerald-500/10 transition-all uppercase tracking-widest shadow-lg">TRUE</button>
                   <button onClick={() => handleInstantBreach("FALSE")} className="py-8 rounded-[2rem] border-2 border-rose-500/20 text-rose-500 font-black text-2xl hover:bg-rose-500/10 transition-all uppercase tracking-widest shadow-lg">FALSE</button>
                </div>
             </div>
          </div>
        )}

        {/* ROOM 4: Dual-Layer Protocol (المطور بنظام الخطوات) */}
        {currentRoomIdx === 3 && (
          <div className="w-full flex flex-col gap-6 animate-in slide-in-from-top-4 duration-1000">
             
             {/* صندوق تعريف المهمة */}
             <div className="bg-[#0a1020] border-2 border-[#ff0055]/30 p-6 rounded-[2rem] text-left relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-[#ff0055]"><Lock size={60} /></div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[#ff0055]/20 rounded-lg text-[#ff0055]"><Shield size={18} /></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#ff0055]">ROOM_04: Dual-Layer Protocol</span>
                </div>
                <p className="text-sm text-gray-300 font-sans">
                  <strong className="text-white uppercase">[ CRITICAL ]: </strong> The central core is protected by <span className="text-[#ff0055] font-black underline">Two-Factor Encryption</span>. 
                  Decode the Base64 hash first, then provide the Master Security Key.
                </p>
             </div>

             {/* عرض النص المشفر (Puzzle Data) */}
             <div className="relative group">
                <div className="absolute -inset-1 bg-[#ff88cc]/20 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#060e08] border-2 border-[#ff88cc]/30 rounded-[2.5rem] p-12 text-center shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff88cc] to-transparent opacity-30"></div>
                    <div className="text-3xl md:text-5xl font-black text-[#ff88cc] tracking-[0.3em] drop-shadow-[0_0_20px_rgba(255,136,204,0.4)] break-all uppercase">
                      {currentRoom?.puzzle_data?.replace(/=/g, '')}
                    </div>
                    <div className="mt-8 flex justify-center gap-6 text-[12px] font-black uppercase tracking-widest text-[#4a5d4a]">
                      <span className="flex items-center gap-2"><Zap size={14}/> Algorithm: B64_VIG</span>
                      <span className="flex items-center gap-2 animate-pulse"><Lock size={14}/> ACCESS_RESTRICTED</span>
                    </div>
                </div>
             </div>

             {/* الطبقات (الخطوة 1 والخطوة 2) */}
             <div className="grid grid-cols-1 gap-6">
                
                {/* 1. طبقة الـ Base64 */}
                <div className={`p-8 rounded-[2rem] border-2 transition-all duration-700 
                  ${layer1Done ? 'bg-[#001a0a]/40 border-[#00ff96]/40 opacity-60 scale-[0.98]' : 'bg-[#0a1020] border-white/10 shadow-xl'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${layer1Done ? 'bg-[#00ff96] text-black' : 'bg-white/10 text-white'}`}>
                              {layer1Done ? '✓' : '1'}
                            </div>
                            <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${layer1Done ? 'text-[#00ff96]' : 'text-gray-400'}`}>Layer 01: Base64 Decryption</h3>
                        </div>
                    </div>
                    
                    {!layer1Done && (
                      <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                        <input value={layer1Input} onChange={e => setLayer1Input(e.target.value.toUpperCase())} placeholder="DECODE_LAYER_01..." className="flex-1 bg-black border border-white/10 p-5 rounded-2xl text-xl font-bold text-[#00ff96] tracking-[0.2em] outline-none focus:border-[#00ff9660] transition-all uppercase" />
                        <button onClick={checkLayer1} className="bg-[#00ff96] text-black px-10 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95">Verify</button>
                      </div>
                    )}
                </div>

                {/* 2. طبقة الـ Vigenère والحل النهائي */}
                {/* 2. طبقة الـ Vigenère (التعديل المطلوب: دمج المفتاح وحذف الأكشن ✅) */}
                <div className={`p-8 rounded-[2rem] border-2 transition-all duration-700 
                  ${layer1Done ? 'bg-[#0a1020] border-[#6040ff]/50 shadow-[0_0_40px_rgba(96,64,255,0.15)] animate-in zoom-in' : 'bg-black/20 border-white/5 opacity-20 pointer-events-none'}`}>
                    
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${layer1Done ? 'bg-[#6040ff] text-white shadow-[0_0_15px_#6040ff50]' : 'bg-white/5 text-gray-600'}`}>2</div>
                            <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${layer1Done ? 'text-white' : 'text-gray-600'}`}>Layer 02: Master Plaintext Recovery</h3>
                        </div>

                        {/* دمج المفتاح هنا بجانب العنوان ✅ */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                           <Key size={14} className="text-[#ff88cc]" />
                           <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mr-2">Secret Key:</span>
                           <span className="text-[#ff88cc] font-black text-xl tracking-[0.3em] drop-shadow-[0_0_10px_rgba(255,136,204,0.5)] animate-pulse inline-block skew-x-[-10deg]">
                             {currentRoom?.hint}
                           </span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <input 
                          value={answerInput} 
                          onChange={e => setAnswerInput(e.target.value.toUpperCase())} 
                          onKeyDown={e => e.key === 'Enter' && onBreach(answerInput)}
                          placeholder="INPUT_MASTER_SECURITY_KEY..." 
                          className="flex-1 bg-black border border-white/10 p-5 rounded-2xl text-xl font-bold text-[#ff88cc] tracking-[0.2em] outline-none focus:border-[#6040ff60] transition-all uppercase shadow-inner" 
                        />
                        <button onClick={() => onBreach(answerInput)} className="bg-[#6040ff] text-white px-10 rounded-2xl font-black uppercase tracking-widest hover:bg-[#8060ff] transition-all shadow-[0_0_25px_rgba(96,64,255,0.4)] active:scale-95">Unlock Door</button>
                    </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="px-8 py-6 bg-[#080c16] border-t border-white/5 flex justify-between items-center z-20">
        <div className="flex gap-5 italic text-[#00ff96]/30 text-[10px] font-black tracking-[0.2em] uppercase">
           {scenario.map((_, i) => (
              <span key={i} className={currentRoomIdx >= i ? "text-[#00ff96] opacity-100" : "opacity-20"}>ROOM_0{i+1} {i < scenario.length - 1 && " // "}</span>
           ))}
        </div>
        <div className="text-[10px] font-black text-gray-400 uppercase italic flex items-center gap-2">
           <Shield size={12} className="text-[#00ff96]/40" />
           Security_Status: {currentRoomIdx === scenario.length - 1 ? "FINAL_GATE_ACTIVE" : "IN_PROGRESS"}
        </div>
      </footer>
    </div>
  );
};

export default EscapeRoomLayout;