import React, { useState } from "react";
import { X, Zap, Shield, Key, Info, Cpu, Network, Lock, Hash, Search, Timer, Star } from "lucide-react";
import Swal from "sweetalert2";
const EscapeChallengeModal = ({ isOpen, onClose, formData, setFormData, onSubmit, step, setStep }) => {
  const [activeRoom, setActiveRoom] = useState(0);

  if (!isOpen || !formData) return null;

const updateRoom = (roomIdx, updates) => {
    setFormData(prev => {
      const currentRooms = [...(prev.scenarioData?.rooms || [
        { puzzle_data: "", answer: "", hint: "", type: "cipher" },
        { puzzle_data: "", answer: "", hint: "", type: "network" },
        { puzzle_data: "", answer: "", hint: "", type: "logic" },
        { puzzle_data: "", answer: "", hint: "", type: "dual" },
      ])];

      let room = { ...currentRooms[roomIdx] };

      // تنفيذ كل التحديثات المطلوبة في دورة واحدة
      Object.entries(updates).forEach(([field, value]) => {
        room[field] = value;
        if (roomIdx === 3) {
          const room4Mapping = { "puzzle_data": "layer1", "hint": "vKey", "answer": "masterKey" };
          const targetField = room4Mapping[field] || field;
          room.room4 = { ...(room.room4 || {}), [targetField]: value };
        }
      });

      currentRooms[roomIdx] = room;
      return {
        ...prev,
        scenarioData: { ...prev.scenarioData, rooms: currentRooms }
      };
    });
  };

  
const vigenereEncrypt = (text, key) => {
  if (!text || !key) return "";
  let result = "";
  text = text.toUpperCase().replace(/[^A-Z]/g, "");
  key = key.toUpperCase().replace(/[^A-Z]/g, "");
  for (let i = 0, j = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    result += String.fromCharCode(((c - 65 + (key.charCodeAt(j % key.length) - 65)) % 26) + 65);
    j++;
  }
  return result;
};

  const roomConfig = [
    { title: "CIPHER_BREACH", icon: <Hash size={18}/>, color: "text-pink-400", bg: "bg-pink-500/5", border: "border-pink-500/20" },
    { title: "NETWORK_AUDIT", icon: <Network size={18}/>, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20" },
    { title: "LOGIC_VERIFICATION", icon: <Cpu size={18}/>, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
    { title: "DUAL_CORE_PROTO", icon: <Lock size={18}/>, color: "text-rose-500", bg: "bg-rose-500/5", border: "border-rose-500/20" }
  ];

  const isRoomComplete = (idx) => {
    const room = formData.scenarioData?.rooms?.[idx];
    if (!room) return false;

    switch (idx) {
      case 0: 
        return !!(room.puzzle_data && room.answer && room.hint);
      case 1: 
          return !!(
              room.logs?.length > 0 && 
              room.options?.length === 5 && 
              room.answer
            );    

      case 2: 
        return !!(room.puzzle_data && room.answer);
      case 3: 
        return !!(room.room4?.layer1 && room.room4?.vKey && room.room4?.masterKey);
      default:
        return false;
    }
  };

  const generateFinalPacket = (plain, key) => {
    if (!plain || !key) return "";
    
    // 1. Vigenère Encryption Logic
    let cipherText = "";
    const p = plain.toUpperCase().replace(/[^A-Z]/g, "");
    const k = key.toUpperCase().replace(/[^A-Z]/g, "");
    
    for (let i = 0, j = 0; i < p.length; i++) {
      const charCode = p.charCodeAt(i);
      cipherText += String.fromCharCode(((charCode - 65 + (k.charCodeAt(j % k.length) - 65)) % 26) + 65);
      j++;
    }

    return btoa(cipherText);
  };

  const getEncryptionPreview = (plain, key) => {
    if (!plain || !key) return { ciphertext: "", base64: "" };
    
    let ciphertext = "";
    const p = plain.toUpperCase().replace(/[^A-Z]/g, "");
    const k = key.toUpperCase().replace(/[^A-Z]/g, "");
    
    for (let i = 0, j = 0; i < p.length; i++) {
      const charCode = p.charCodeAt(i);
      ciphertext += String.fromCharCode(((charCode - 65 + (k.charCodeAt(j % k.length) - 65)) % 26) + 65);
      j++;
    }

    return {
      ciphertext: ciphertext,
      base64: btoa(ciphertext)
    };
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto font-mono text-left">
      <div className="bg-[#080c14] border border-white/10 w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl relative my-auto">
        
        <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
          <X size={24} />
        </button>

        {/* 1. STEP ONE: MISSION IDENTITY (هذا الجزء اللي كان ناقصك) */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"><Shield size={24} /></div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Cyber Escape Room</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Challenge Title</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all" 
                  value={formData.title || ""} 
                  placeholder="Ex: OPERATION_CYBER_GHOST" 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Description</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white h-32 resize-none focus:border-emerald-500 outline-none transition-all font-sans" 
                  value={formData.description || ""} 
                  placeholder="Describe the challenge to the players..." 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl relative group">
                  <Star className="absolute top-4 right-4 text-yellow-500/20 group-hover:text-yellow-500 transition-colors" size={16}/>
                  <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block">Reward (XP)</label>
                  <input type="number" className="bg-transparent text-3xl font-black text-yellow-500 outline-none w-full" value={formData.points_pool || 0} onChange={(e)=>setFormData({...formData, points_pool: parseInt(e.target.value)})}/>
                </div>
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl relative group">
                  <Timer className="absolute top-4 right-4 text-blue-500/20 group-hover:text-blue-500 transition-colors" size={16}/>
                  <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block">System Timer (Sec)</label>
                  <input type="number" className="bg-transparent text-3xl font-black text-blue-400 outline-none w-full" value={formData.timeLimit || 0} onChange={(e)=>setFormData({...formData, timeLimit: parseInt(e.target.value)})}/>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                 <button onClick={onClose} className="flex-1 py-5 text-gray-600 font-black uppercase text-s hover:text-white transition-all">cancel</button>
                 <button onClick={() => setStep(2)} className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-[1.5rem] font-black uppercase italic tracking-widest transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  Create Escap room challenge
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. STEP TWO: ROOM ARCHITECTURE (التصميم اللي تأكدنا منه قبل شوي) */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><Shield size={24} /></div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">challenge Constructor</h2>
              </div>
            </div>

            <div className="flex gap-2 mb-8 bg-black/40 p-2 rounded-2xl border border-white/5">
              {roomConfig.map((room, i) => {
                const isLocked = i > 0 && !isRoomComplete(i - 1);
                return (
                  <button 
                    key={i} 
                    disabled={isLocked}
                    onClick={() => setActiveRoom(i)} 
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 
                      ${activeRoom === i ? 'bg-emerald-600 text-white shadow-lg' : isLocked ? 'opacity-20 cursor-not-allowed text-gray-500' : 'text-gray-600 hover:text-gray-300'}`}
                  >
                    {isLocked ? <Lock size={14}/> : room.icon} 
                    ROOM_0{i+1}
                  </button>
                );
              })}
            </div>

            <div className={`rounded-[2.5rem] p-8 border-2 transition-all duration-500 ${roomConfig[activeRoom].bg} ${roomConfig[activeRoom].border}`}>
              {/* هنا بقية كود الـ Designer (الـ 4 غرف) اللي شيكنا عليه سابقاً */}
              {activeRoom === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                   <div className="space-y-2">
                     <label className="text-[10px] text-pink-400 font-black uppercase ml-2 flex items-center gap-2"><Search size={12}/> Encrypted Text by Caesar Cipher</label>
                     <input className="w-full bg-black/60 border border-pink-500/30 rounded-2xl p-6 text-3xl font-black text-[#ff88cc] text-center tracking-[0.4em] outline-none glitch-text" value={formData.scenarioData?.rooms?.[0]?.puzzle_data || ""} placeholder="KHOOR_ZRUOG" onChange={(e) => updateRoom(0, { puzzle_data: e.target.value.toUpperCase() })} />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2"><label className="text-[10px] text-gray-500 uppercase ml-2">Clean Answer</label><input className="w-full bg-black border border-white/10 rounded-xl p-4 text-emerald-400 font-bold uppercase" value={formData.scenarioData?.rooms?.[0]?.answer || ""} placeholder="HELLO_WORLD" onChange={(e) => updateRoom(0, { answer: e.target.value.toUpperCase() })} /></div>
                      <div className="space-y-2"><label className="text-[10px] text-gray-500 uppercase ml-2">Cipher Hint</label><input className="w-full bg-black border border-white/10 rounded-xl p-4 text-blue-400 text-sm" value={formData.scenarioData?.rooms?.[0]?.hint || ""} placeholder="Ex: Shift +3" onChange={(e) => updateRoom(0, { hint: e.target.value })}/></div>
                   </div>
                </div>
              )}

             {activeRoom === 1 && (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
    {/* 1. بناء سجلات الشبكة (Logs Construction) */}
   <div className="bg-black/40 border border-blue-500/20 p-6 rounded-[2rem] shadow-inner">
  <div className="flex justify-between items-center mb-4">
    <label className="text-[12px] text-blue-400 font-black uppercase italic tracking-widest flex items-center gap-2">
      <Network size={14}/> Step 1: Construct Live Packet Stream
    </label>
    <span className="text-[12px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded">PROT_V.2.4</span>
  </div>
  
  <div className="space-y-3">
    <div className="flex gap-2">
      <input 
        id="logInput"
        type="text"
        placeholder="Add a log entry... (e.g. Unauthorized handshake from [192.168.1.105])"
        className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-blue-500 transition-all"
        onKeyDown={(e) => {
          if (e.key === 'Enter') document.getElementById('addLogBtn').click();
        }}
      />
      <button 
        id="addLogBtn"
        onClick={() => {
          const val = document.getElementById('logInput').value;
          if(val) {
            const currentLogs = formData.scenarioData?.rooms?.[1]?.logs || [];
            const ipMatch = val.match(/\[(.*?)\]/);
            const extractedIp = ipMatch ? ipMatch[1] : "0.0.0.0";
            
            // ✅ التعديل هنا: نرسل كائن { logs: ... }
            updateRoom(1, { 
              logs: [...currentLogs, { 
                ts: new Date().toLocaleTimeString(), 
                ip: extractedIp, 
                msg: val,
                status: 'normal' 
              }] 
            });
            document.getElementById('logInput').value = '';
          }
        }}
        className="bg-blue-600 px-6 rounded-xl text-[10px] font-black text-white hover:bg-blue-500 shadow-lg shadow-blue-500/10 transition-all"
      >
        ADD_LOG
      </button>
    </div>

        {/* قائمة السجلات المضافة */}
        <div className="max-h-32 overflow-y-auto space-y-2 bg-black/20 p-3 rounded-xl border border-white/5 custom-scrollbar">
          {(formData.scenarioData?.rooms?.[1]?.logs || []).length === 0 ? (
            <p className="text-[9px] text-gray-600 italic text-center py-4">No packet logs deployed yet...</p>
          ) : (
            (formData.scenarioData?.rooms?.[1]?.logs || []).map((log, lIdx) => (
              <div key={lIdx} className="text-[10px] font-mono flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5 group">
                <span className="text-blue-400">
                  <span className="text-gray-600 mr-2">[{log.ts}]</span>
                  <span className="bg-blue-500/10 px-1 rounded">IP_{log.ip}</span> 
                  <span className="ml-2 text-gray-400">{log.msg}</span>
                </span>
                <button 
                  onClick={() => {
                      const val = document.getElementById('logInput').value;
                      if(val) {
                          const currentLogs = formData.scenarioData?.rooms?.[1]?.logs || [];
                          const ipMatch = val.match(/\[(.*?)\]/);
                          const extractedIp = ipMatch ? ipMatch[1] : "0.0.0.0";
                          updateRoom(1, { logs: [...currentLogs, { ts: new Date().toLocaleTimeString(), ip: extractedIp, msg: val, status: 'normal' }] });
                          document.getElementById('logInput').value = '';
                      }
                  }} 
                  className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                >
                  <X size={12}/>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    {/* 2. بناء الأجهزة (Exactly 5 Devices) */}
    <div className="bg-[#0a1020] border border-blue-500/10 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
      <div className="flex justify-between items-center px-2">
        <label className="text-[12px] text-gray-500 uppercase font-black italic tracking-widest">
          Step 2: Deploy Network Terminals
        </label>
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-black tracking-tighter px-2 py-1 rounded ${
            (formData.scenarioData?.rooms?.[1]?.options?.length === 5) ? 'bg-emerald-500/20 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
          }`}>
            {formData.scenarioData?.rooms?.[1]?.options?.length || 0} / 5 DEVICES READY
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <input 
          id="nodeIpInput"
          type="text"
          placeholder="New Device IP (e.g. 10.0.0.45)..."
          className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-white font-mono text-xs outline-none focus:border-blue-500 transition-all"
          onKeyDown={(e) => {
            if (e.key === 'Enter') document.getElementById('deployBtn').click();
          }}
        />
        <button 
          id="deployBtn"
          onClick={() => {
            const ip = document.getElementById('nodeIpInput').value;
            if(ip) {
              const opts = formData.scenarioData?.rooms?.[1]?.options || [];
              if(opts.length < 5) {
                  updateRoom(1, { options: [...opts, ip] });
                  document.getElementById('nodeIpInput').value = '';
              } else {
                Swal.fire({ 
                  title: "Network Segment Full", 
                  text: "You can only deploy exactly 5 devices for this audit.", 
                  icon: "info",
                  background: "#080c14",
                  color: "#fff",
                  confirmButtonColor: "#3b82f6"
                });
              }
            }
          }}
          className="bg-emerald-600 px-6 rounded-xl text-[10px] font-black text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/10 transition-all"
        >
          DEPLOY_DEVICE
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3 h-32">
        {/* عرض الأجهزة المضافة */}
        {(formData.scenarioData?.rooms?.[1]?.options || []).map((opt, optIdx) => (
          <div 
            key={optIdx}
            onClick={() => updateRoom(1, { answer: opt })}
            className={`p-4 border-2 rounded-2xl relative group cursor-pointer transition-all flex flex-col items-center justify-center
              ${opt === formData.scenarioData?.rooms?.[1]?.answer 
                ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                : 'border-white/5 bg-white/5 opacity-70 hover:opacity-100 hover:border-white/20'}`}
          >
            <div className={`text-2xl mb-1 transition-transform group-hover:scale-110 ${opt === formData.scenarioData?.rooms?.[1]?.answer ? 'animate-pulse' : ''}`}>
              {opt === formData.scenarioData?.rooms?.[1]?.answer ? '☣️' : '💻'}
            </div>
            <p className="text-[8px] text-gray-500 uppercase font-black tracking-tighter mb-1">Device_{optIdx+1}</p>
            <p className="font-mono text-[9px] text-blue-400 truncate w-full text-center">{opt}</p>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const filtered = formData.scenarioData.rooms[1].options.filter((_, i) => i !== optIdx);
                updateRoom(1, "options", filtered);
                if (opt === formData.scenarioData?.rooms?.[1]?.answer) updateRoom(1, "answer", "");
              }}
              className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full w-4 h-4 text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X size={10}/>
            </button>
          </div>
        ))}

        {/* الـ Placeholders لإكمال الـ 5 أجهزة */}
        {[...Array(5 - (formData.scenarioData?.rooms?.[1]?.options?.length || 0))].map((_, i) => (
          <div key={`empty-${i}`} className="border-2 border-dashed border-white/5 bg-black/20 rounded-2xl flex flex-col items-center justify-center opacity-20 group">
            <div className="text-xl mb-1 text-gray-600">📡</div>
            <p className="text-[7px] font-black text-gray-600">OFFLINE</p>
          </div>
        ))}
      </div>
      
      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
        <p className="text-[11px] text-center text-gray-500 italic flex items-center justify-center gap-2">
          <Info size={12} className="text-blue-500"/>
          PROTOCOL: Analyze the logs above, then click the suspicious device to set it as the <span className="text-emerald-500 font-black">INFECTED_TARGET</span>
        </p>
      </div>
    </div>
  </div>
)}

              {activeRoom === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 text-center">
                   <div className="bg-[#0a1020] border-l-4 border-emerald-500 p-6 rounded-2xl text-left">
                      <label className="text-[10px] text-emerald-500 font-black uppercase mb-2 block">Boolean Equation</label>
                      <textarea className="w-full bg-transparent text-lg font-mono text-white outline-none h-20" value={formData.scenarioData?.rooms?.[2]?.puzzle_data || ""} placeholder="Solve: (!FALSE && TRUE)..." onChange={(e) => updateRoom(2, { puzzle_data: e.target.value })} />
                   </div>
                   <div className="grid grid-cols-2 gap-6 pt-4">
                      <button onClick={() => updateRoom(2, { answer: "TRUE" })} className={`p-8 rounded-[2.5rem] border-2 transition-all ${formData.scenarioData?.rooms?.[2]?.answer === "TRUE" ? 'bg-emerald-500/20 border-emerald-500' : 'bg-black/40 border-white/5 opacity-40'}`}><span className="text-2xl font-black text-emerald-500">TRUE</span></button>
                      <button onClick={() => updateRoom(2, { answer: "FALSE" })} className={`p-8 rounded-[2.5rem] border-2 transition-all ${formData.scenarioData?.rooms?.[2]?.answer === "FALSE" ? 'bg-rose-500/20 border-rose-500' : 'bg-black/40 border-white/5 opacity-40'}`}><span className="text-2xl font-black text-rose-500">FALSE</span></button>
                   </div>
                </div>
              )}

                  {activeRoom === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  
                  {/* 📝 الجزء الأول: مدخلات المصمم */}
                  <div className="p-6 bg-[#0a0f1d] rounded-[2.5rem] border-2 border-white/5 text-left">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] text-gray-500 uppercase font-black italic">1. Final Answer (Plaintext)</label>
                        <input 
                          className="w-full bg-black border-2 border-emerald-500/20 rounded-2xl p-4 text-emerald-400 font-black uppercase outline-none focus:border-emerald-500" 
                          placeholder="Ex: HACKHERO"
                          value={formData.scenarioData?.rooms?.[3]?.room4?.masterKey || ""}
                          onChange={(e) => {
                            const plain = e.target.value.toUpperCase();
                            const key = formData.scenarioData?.rooms?.[3]?.room4?.vKey || "";
                            const results = getEncryptionPreview(plain, key);
                            
                            updateRoom(3, { 
                              answer: plain, 
                              puzzle_data: results.base64 
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] text-gray-500 uppercase font-black italic">2. Secret Key</label>
                        <input 
                          className="w-full bg-black border-2 border-purple-500/20 rounded-2xl p-4 text-purple-400 font-black uppercase outline-none focus:border-purple-500" 
                          placeholder="Ex: DARK"
                          value={formData.scenarioData?.rooms?.[3]?.room4?.vKey || ""}
                        onChange={(e) => {
                          const key = e.target.value.toUpperCase();
                          const plain = formData.scenarioData?.rooms?.[3]?.room4?.masterKey || "";
                          const results = getEncryptionPreview(plain, key);
                          
                          updateRoom(3, { 
                            hint: key, 
                            puzzle_data: results.base64 
                          });
                        }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 👁️ الجزء الثاني: ما سيراه اللاعب (Preview) */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* الطبقة الأولى التي ستظهر للاعب */}
                    <div className="p-6 bg-pink-500/5 border-2 border-pink-500/20 rounded-[2.5rem] text-left relative overflow-hidden">
                      <div className="absolute top-2 right-4 text-[7px] font-black text-pink-500/30 uppercase italic">Layer_01: First Sight</div>
                      <label className="text-[12px] text-pink-400 font-black uppercase mb-3 block">Player's Initial Packet (Base64)</label>
                      <div className="bg-black/60 rounded-xl p-4 font-mono text-xs text-[#ff88cc] break-all min-h-[60px] flex items-center justify-center border border-pink-500/10">
                        {formData.scenarioData?.rooms?.[3]?.room4?.layer1 || "WAITING_FOR_DATA..."}
                      </div>
                    </div>

                    {/* ما سيظهر للاعب بعد فك الـ Base64 */}
                    <div className="p-6 bg-purple-500/5 border-2 border-purple-500/20 rounded-[2.5rem] text-left relative overflow-hidden">
                      <div className="absolute top-2 right-4 text-[7px] font-black text-purple-500/30 uppercase italic">Layer_02: Decoded Cipher</div>
                      <label className="text-[12px] text-purple-400 font-black uppercase mb-3 block">Result after Base64 Decode</label>
                      <div className="bg-black/60 rounded-xl p-4 font-mono text-xs text-purple-300 break-all min-h-[60px] flex items-center justify-center border border-purple-500/10">
                        {/* هنا نقوم بعرض الـ Vigenere Ciphertext فقط للمعاينة */}
                        {getEncryptionPreview(formData.scenarioData?.rooms?.[3]?.room4?.masterKey, formData.scenarioData?.rooms?.[3]?.room4?.vKey).ciphertext || "LOCKED"}
                      </div>
                    </div>
                  </div>

                  {/* شريط المسار التقني */}
                  <div className="bg-black/40 p-4 rounded-[2rem] border border-white/5 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                      Execution Path: <span className="text-emerald-500">Plaintext</span> ➔ <span className="text-purple-400">Vigenère</span> ➔ <span className="text-pink-400">Base64</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

                    <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
                            <button 
                              onClick={() => {
                                if (activeRoom > 0) setActiveRoom(prev => prev - 1);
                                else setStep(1); 
                              }} 
                              className="flex-1 py-5 text-gray-600 font-black uppercase text-s hover:text-white transition-all tracking-widest italic"
                            >
                              {activeRoom === 0 ? "Identity Menu" : "Previous Room"}
                            </button>      
                        <button 
                            onClick={() => {
                              const room = formData.scenarioData?.rooms?.[activeRoom];
                              let missingFields = [];

                              // 🕵️ تدقيق النواقص بدقة هندسية
                              if (activeRoom === 0) { // Cipher
                                if (!room?.puzzle_data) missingFields.push("Cipher Text (The code)");
                                if (!room?.answer) missingFields.push("Clean Answer (Decrypted text)");
                                if (!room?.hint) missingFields.push("Cipher Hint (Shift value)");
                              } 
                              else if (activeRoom === 1) { // Network
                                if (!room?.logs?.length) missingFields.push("Network Logs (At least 1)");
                                if (room?.options?.length !== 5) missingFields.push(`Exactly 5 Devices (Current: ${room?.options?.length || 0})`);
                                if (!room?.answer) missingFields.push("Infected Target (Click a device)");
                              } 
                              else if (activeRoom === 2) { // Logic
                                if (!room?.puzzle_data) missingFields.push("Boolean Equation");
                                if (!room?.answer) missingFields.push("Logic Result (TRUE/FALSE)");
                              } 
                              else if (activeRoom === 3) { // Dual Core
                                const r4 = room?.room4 || {}; 
                                if (!r4.layer1) missingFields.push("Base64 Layer Data");
                                if (!r4.vKey) missingFields.push("Vigenère Secret Key");
                                if (!r4.masterKey) missingFields.push("Final Master Answer");
                              }

                              if (missingFields.length > 0) {
                                console.log("🛑 Protocol Blocked. Missing:", missingFields); 
                                
                                Swal.fire({
                                  title: "PROTOCOL_INCOMPLETE",
                                  html: `
                                    <div style="text-align: left; font-family: monospace; font-size: 13px;">
                                      <p style="color: #666; margin-bottom: 10px;">Security parameters missing in ROOM_0${activeRoom + 1}:</p>
                                      <ul style="color: #ff3b6b; list-style-type: square; padding-left: 20px;">
                                        ${missingFields.map(f => `<li style="margin-bottom: 5px;">${f}</li>`).join('')}
                                      </ul>
                                    </div>
                                  `,
                                  icon: "warning",
                                  background: "#080c14",
                                  color: "#fff",
                                  confirmButtonColor: "#10b981",
                                  confirmButtonText: "RE-EVALUATE",
                                  didOpen: () => {
                                    const container = Swal.getContainer();
                                    if (container) container.style.zIndex = "3000"; 
                                  }
                                });
                                return; 
                              }

                              if (activeRoom < 3) {
                                setActiveRoom(prev => prev + 1);
                              } else {
                                onSubmit();
                              }
                            }} 
                            className={`flex-[2] py-5 rounded-2xl font-black uppercase italic tracking-widest transition-all 
                              ${activeRoom === 3 
                                ? "bg-[#00ff96] text-black shadow-[0_0_30px_rgba(0,255,150,0.3)]" 
                                : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                              }`}
                          >
                            {activeRoom === 3 ? "DEPLOY CHALLENGE" : "NEXT ROOM"}
                          </button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscapeChallengeModal;