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
    <div className="fixed inset-0 z-[500] bg-[#050810]/95 backdrop-blur-xl flex flex-col items-center justify-center p-10 font-mono text-white">
      <div className="text-center mb-12">
        <h2 className="text-cyan-400 text-3xl font-black italic tracking-[0.3em] mb-2 animate-pulse">
          — SELECT ROLE —
        </h2>
       
      </div>

      <div className={`grid gap-6 w-full max-w-6xl 
        ${ROLES.length === 2 ? 'grid-cols-2 max-w-4xl' : 
          ROLES.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
        
        {ROLES.map((role) => {
          const occupant = players.find(p => p.role === role.name);
          const isMe = occupant?.user === currentUserId || occupant?.id === currentUserId;

          return (
            <div 
              key={role.id}
              onClick={() => !occupant && onSelect(role.name)}
              className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 group
                ${occupant 
                  ? (isMe ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-red-500/20 opacity-40 grayscale') 
                  : 'border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 hover:scale-105 cursor-pointer'}`}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  {role.icon}
                </div>
                <h3 className="text-lg font-black uppercase italic tracking-tighter mb-2">{role.name}</h3>
                
                <p className="text-[10px] text-gray-400 leading-relaxed mb-4 min-h-[30px]">
                  {role.desc}
                </p>

                <div className="flex gap-2 mt-auto">
                  {role.rooms.map(room => (
                    <span key={room} className="text-[8px] bg-white/10 px-2 py-1 rounded-md text-cyan-400/70 font-bold border border-white/5">
                      {room}
                    </span>
                  ))}
                </div>
              </div>
              
              {occupant && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-[2.3rem] backdrop-blur-[2px] animate-in fade-in duration-300">
                  <span className={`text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest shadow-xl
                    ${isMe ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
                    {isMe ? "YOU SELECTED" : occupant.username.toUpperCase()}
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