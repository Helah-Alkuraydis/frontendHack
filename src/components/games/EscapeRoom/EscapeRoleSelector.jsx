import React from 'react';

const EscapeRoleSelector = ({ players, onSelect, currentUserId }) => {
  const getDynamicRoles = () => {
    const count = players.length;

    if (count <= 2) {
      return [
        { 
          id: 'combo1', 
          name: 'Cipher & Logic', 
          icon: '🔐🧠', 
          rooms: ['Room 01', 'Room 03'],
          desc: 'Decrypt codes and solve boolean traps.' 
        },
        { 
          id: 'combo2', 
          name: 'Defender & Infiltrator', 
          icon: '🛡️💻', 
          rooms: ['Room 02', 'Room 04'],
          desc: 'Isolate threats and breach the system core.' 
        },
      ];
    } else if (count === 3) {
      return [
        { 
          id: 'combo1', 
          name: 'Master Infiltrator', 
          icon: '🔐💻', 
          rooms: ['Room 01', 'Room 04'],
          desc: 'Manage decryption and final system breach.' 
        },
        { 
          id: 'room2', 
          name: 'Network Defender', 
          icon: '🛡️', 
          rooms: ['Room 02'],
          desc: 'Identify and isolate malicious network nodes.' 
        },
        { 
          id: 'room3', 
          name: 'Logic Strategist', 
          icon: '🧠', 
          rooms: ['Room 03'],
          desc: 'Bypass logic gates through tautology analysis.' 
        },
      ];
    } else {
      return [
        { id: 'room1', name: 'Cipher Master', icon: '🔐', rooms: ['Room 01'], desc: 'Decrypt intercepted data packets.' },
        { id: 'room2', name: 'Network Defender', icon: '🛡️', rooms: ['Room 02'], desc: 'Isolate compromised network terminals.' },
        { id: 'room3', name: 'Logic Strategist', icon: '🧠', rooms: ['Room 03'], desc: 'Solve boolean logic traps to proceed.' },
        { id: 'room4', name: 'System Infiltrator', icon: '💻', rooms: ['Room 04'], desc: 'Execute the final multi-layer breach.' },
      ];
    }
  };

  const ROLES = getDynamicRoles();

  return (
    <div className="fixed inset-0 z-[500] bg-[#050810]/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-10 font-mono text-white overflow-y-auto custom-scrollbar">
      <div className="text-center mb-6 sm:mb-12">
        <h2 className="text-cyan-400 text-lg sm:text-3xl font-black italic tracking-[0.15em] sm:tracking-[0.3em] mb-1 animate-pulse">
          — SELECT ROLE —
        </h2>
      </div>

      {/* 🟢 تعديل الـ Grid ليصبح عمودين (cols-2) بالجوال لتقعد الكروت جمب بعضها بشكل صغير ومنظم */}
      <div className={`grid gap-3 sm:gap-6 w-full max-w-6xl 
        ${ROLES.length === 2 ? 'grid-cols-2 max-w-4xl' : 
          ROLES.length === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
        
        {ROLES.map((role) => {
          const occupant = players.find(p => p.role === role.name);
          const isMe = occupant?.user === currentUserId || occupant?.id === currentUserId;

          return (
            <div 
              key={role.id}
              onClick={() => !occupant && onSelect(role.name)}
              className={`relative p-3.5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 transition-all duration-500 group min-h-fit
                ${occupant 
                  ? (isMe ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-red-500/20 opacity-40 grayscale') 
                  : 'border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 hover:scale-105 cursor-pointer'}`}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="text-3xl sm:text-5xl mb-3 sm:mb-6 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  {role.icon}
                </div>
                <h3 className="text-xs sm:text-lg font-black uppercase italic tracking-tighter mb-1 truncate w-full">{role.name}</h3>
                
                <p className="text-[9px] sm:text-[10px] text-gray-400 leading-tight sm:leading-relaxed mb-3 min-h-[auto] sm:min-h-[30px] line-clamp-2 sm:line-clamp-none">
                  {role.desc}
                </p>

                <div className="flex flex-wrap justify-center gap-1 mt-auto">
                  {role.rooms.map(room => (
                    <span key={room} className="text-[7px] sm:text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-cyan-400/70 font-bold border border-white/5">
                      {room}
                    </span>
                  ))}
                </div>
              </div>
              
              {occupant && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-[1.3rem] sm:rounded-[2.3rem] backdrop-blur-[2px] p-2 animate-in fade-in duration-300">
                  <span className={`text-[8px] sm:text-[10px] font-black px-2 sm:px-4 py-1 rounded-full tracking-wider shadow-xl text-center truncate w-11/12
                    ${isMe ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
                    {isMe ? "YOU" : occupant.username.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EscapeRoleSelector;