import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal } from 'lucide-react';
import { socket } from '../../../socket';

const TacticalChat = ({ sessionId, userData, messages }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const myUsername = userData?.username;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMsg = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msgData = { 
      sessionId, 
      username: myUsername, 
      characterStyle: userData?.characterStyle || `https://ui-avatars.com/api/?name=${myUsername}`,
      text: input, 
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };

    socket.emit("send_tactical_msg", msgData);
    setInput('');
  };

  return (
    <div className="w-full max-w-[320px] sm:w-80 h-full bg-[#050810]/95 backdrop-blur-xl border-t sm:border-t-0 sm:border-l border-white/10 flex flex-col font-mono shadow-[-20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
      
      <div className="p-4 border-b border-white/5 bg-blue-500/5 flex items-center gap-2 text-gray-400 flex-shrink-0">
        <Terminal size={14} className="text-[#00ff96]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00ff96]">CHAT</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-[12px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.username === myUsername ? 'flex-row-reverse' : 'flex-row'}`}>
            
            <div className="flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-[#00ff96]/20 overflow-hidden bg-black/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
               <img 
                    src={m.characterStyle?.startsWith('http') ? m.characterStyle : `/${m.characterStyle}`} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.target.src = `https://ui-avatars.com/api/?name=${m.username}&background=06b6d4&color=fff`; 
                    }}
                  />
              </div>
            </div>

            <div className={`flex flex-col max-w-[75%] ${m.username === myUsername ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] sm:text-[12px] text-gray-500 mb-1 px-1 truncate max-w-full">
                {m.username} • {m.ts}
              </span>
              <div className={`px-3.5 py-2 rounded-2xl break-words shadow-sm leading-relaxed text-[11px] sm:text-[12px]
                ${m.username === myUsername 
                  ? 'bg-[#00ff96]/20 text-white rounded-tr-none border border-[#00ff96]/80' 
                  : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/10'}`}>
                {m.text}
              </div>
            </div>

          </div>
        ))}
      </div>

      <form onSubmit={sendMsg} className="p-3 sm:p-4 bg-black/40 border-t border-white/5 flex gap-2 flex-shrink-0">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Enter ..." 
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-[11px] outline-none focus:border-[#00ff96]/30 transition-all placeholder:text-gray-600" 
        />
        <button type="submit" className="p-2 bg-[#00ff96]/50 rounded-xl text-white hover:bg-[#00ff96]/20 transition-all active:scale-95 flex items-center justify-center">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default TacticalChat;