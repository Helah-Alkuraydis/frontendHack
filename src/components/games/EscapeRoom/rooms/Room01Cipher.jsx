import React, { useState, useEffect } from 'react';
import { socket } from '../../../../socket';
import { Zap } from 'lucide-react';

const Room01Cipher = ({ sessionId, myRole, data }) => {
  const [ansInput, setAnsInput] = useState("");
  const isMySpecialty = myRole && (myRole.includes("Cipher") || myRole?.includes('Master'));

  const handleType = (e) => {
    if (!isMySpecialty) return;
    const val = e.target.value.toUpperCase();
    setAnsInput(val);
    socket.emit("sync_room_input", { sessionId, value: val });
  };

  useEffect(() => {
    socket.on("receive_input_sync", (val) => {
      if (!isMySpecialty) setAnsInput(val);
    });
    return () => socket.off("receive_input_sync");
  }, [isMySpecialty]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 sm:space-y-8 animate-in fade-in zoom-in duration-700">      
      {/* وصف المهمة */}
      <div className="bg-[#0d131f] border-l-4 border-[#00ff96] p-4 sm:p-5 rounded-r-xl text-left">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} className="animate-pulse text-[#00ff96]" />
          <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest">Target: Encrypted Packet</span>
        </div>
        <div className="text-xs sm:text-sm text-gray-400 leading-relaxed">
          Decrypt the <span className="text-white underline">Caesar Cipher</span> rotation to regain system control.
          <span className="block mt-2 text-[11px] sm:text-[13px] font-medium text-[#00ff96]/70 italic">
            * Only the <span className="font-black text-[#00ff96]">Cipher Master</span> has write access to this room, Assist Specialist via <span className="text-white border-b border-white pb-0.5 tracking-wider font-black">chat</span>
          </span>
        </div>
      </div>

      {/* 🟢 اللغز (النص المشفر): تصغير الخط والـ tracking لمنع خروج النص عن الشاشة بالموبايل في صورة 5 */}
      <div className="bg-[#060e08] border border-[#00ff9620] rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center shadow-2xl relative group overflow-hidden">
        <div className="absolute -inset-1 bg-[#00ff96]/5 rounded-3xl blur opacity-20 transition duration-1000"></div>
        <div className="relative text-xl sm:text-3xl md:text-5xl font-black text-[#ff88cc] tracking-[0.15em] sm:tracking-[0.4em] drop-shadow-[0_0_15px_rgba(255,136,204,0.3)] break-all uppercase">
          {data?.encoded || data?.encodedText || "INTERCEPTING..."}
        </div>
      </div>

      {/* حقل الإدخال والحل: الحين الـ gap ملموم في الموبايل عشان ما يطلع برا الشاشة */}
      <div className="space-y-4 pb-16 sm:pb-0">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 bg-black/40 border border-[#304050] p-2 sm:p-3 rounded-2xl focus-within:border-[#00ff9660] transition-all shadow-inner">
          <div className="flex items-center w-full sm:flex-1 gap-2">
            <div className="pl-2 text-[#304050] font-black text-sm">$</div>
            <input 
              value={ansInput}
              onChange={handleType}
              disabled={!isMySpecialty} 
              placeholder={isMySpecialty ? "ENTER DECRYPTED KEY..." : "WAITING FOR CIPHER MASTER..."}
              className={`w-full bg-transparent py-3 text-sm sm:text-xl font-bold tracking-[0.1em] sm:tracking-[0.3em] uppercase outline-none
                ${isMySpecialty ? 'text-[#00ff96]' : 'text-[#00ff96]/60 cursor-not-allowed'}`}
            />
          </div>
          {isMySpecialty && (
            <button 
              onClick={() => socket.emit("attempt_room_solve", { sessionId, attempt: ansInput })}
              className="bg-[#00ff96] text-black w-full sm:w-auto py-3 sm:py-0 px-6 sm:px-10 rounded-xl font-black uppercase italic tracking-wider sm:tracking-widest hover:shadow-[0_0_30px_#00ff96] transition-all text-center whitespace-nowrap text-xs sm:text-sm"
            >
              BREACH
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Room01Cipher;