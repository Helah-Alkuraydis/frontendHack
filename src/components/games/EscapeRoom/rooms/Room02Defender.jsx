import React, { useMemo } from 'react';
import { Search, ShieldAlert, Zap, Cpu, ShieldCheck } from 'lucide-react';
import { socket } from '../../../../socket';

const Room02Defender = ({ sessionId, myRole, data }) => {
const isMySpecialty = myRole && myRole?.includes('Defender');

  const deviceList = useMemo(() => {
    if (!data?.logs) return [];
    const uniqueIps = [...new Set(data.logs.map(l => l.ip))];
    const icons = ['💻', '🖥', '🖧', '📡', '🖨', '📱'];
    const names = ['STATION-PX', 'CORE-SRV', 'GATEWAY-HUB', 'NODE-SEC', 'IOT-UNIT', 'ACCESS-PT'];

    return uniqueIps.map((ip, i) => ({
      id: i,
      ip: ip,
      icon: icons[i % icons.length],
      name: names[i % names.length]
    }));
  }, [data]);

  const handleDeviceSelect = (ip) => {
    if (!isMySpecialty) return;
    socket.emit("attempt_room_solve", { sessionId, attempt: ip });
  };

  return (
    <div className="w-full max-w-6xl space-y-8 animate-in slide-in-from-right-4 duration-700 font-mono relative pb-10">
      
      <div className="bg-[#0a1020] border-2 border-blue-500/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Search size={80} /></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <Search size={24} />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">
            ROOM_02: Security Audit Required
          </span>
        </div>
        <p className="text-md text-gray-300 leading-relaxed max-w-3xl">
          <strong className="text-white uppercase">[ MISSION ]:</strong> Multiple unauthorized data packets detected. 
          Analyze the <span className="text-blue-400 underline decoration-dotted">Live Network Stream</span> below and identify which terminal has been compromised.
          <span className="block mt-3 text-[13px] font-medium text-blue-400/70 italic">
            * Only the <span className="font-black text-blue-400 underline">Network Defender</span> can isolate nodes. Assist via <span className="text-white border-b border-white pb-0.5 font-black italic">chat</span>
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {deviceList.map((dev) => (
          <div 
            key={dev.id} 
            onClick={() => handleDeviceSelect(dev.ip)} 
            className={`group relative bg-[#060e08] border-2 p-8 rounded-[2.5rem] text-center transition-all duration-500 shadow-xl
                ${isMySpecialty 
                ? 'border-white/5 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 hover:-translate-y-2 active:scale-95' 
                : 'border-white/5 opacity-80 cursor-not-allowed'}`} 
            >
            {isMySpecialty && (
                <div className="absolute inset-x-0 top-0 h-[2px] bg-blue-400 shadow-[0_0_15px_#60a5fa] opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity"></div>
            )}

            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                {dev.icon}
            </div>

            <div className="space-y-1">
                <h3 className="text-[12px] font-black text-white uppercase tracking-tighter opacity-80">{dev.name}</h3>
                <p className="text-[13px] font-bold text-blue-500/60 group-hover:text-blue-400 transition-colors">{dev.ip}</p>
            </div>

            </div>
        ))}
      </div>

      <div className="relative group text-left">
        <div className="absolute -inset-1 bg-blue-500/10 rounded-3xl blur opacity-20 transition duration-1000"></div>
        <div className="relative bg-[#050810] border-2 border-white/5 rounded-3xl p-8 shadow-inner">
          
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-[12px] font-black text-[#506070] uppercase tracking-[0.4em]">Live_Packet_Intercept_Stream</span>
              </div>
             
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
            {data?.logs?.map((log, i) => (
              <div key={i} className="flex items-start gap-6 py-2 px-4 rounded-lg border-l-2 border-transparent hover:bg-white/5 transition-all duration-300 group">
                <span className="text-[#405060] text-[13px] whitespace-nowrap mt-0.5">[{log.ts}]</span>
                <span className="text-sm font-black tracking-widest w-32 text-blue-400/80 group-hover:text-blue-400 transition-colors">
                  {log.ip}
                </span>
               <span className="text-sm flex-1 text-gray-400 group-hover:text-emerald-400 transition-colors">
        {log.msg}
      </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room02Defender;