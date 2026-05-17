import React, { useState } from "react";
import {
  X,
  Zap,
  Shield,
  Key,
  Info,
  Cpu,
  Network,
  Lock,
  Hash,
  Search,
  Timer,
  Star,
} from "lucide-react";
import Swal from "sweetalert2";

const EscapeRoomBuilder = ({ formData, setFormData, onSubmit, onBack }) => {
  const [activeRoom, setActiveRoom] = useState(0);

  const updateRoom = (roomIdx, updates) => {
    setFormData((prev) => {
      const currentRooms = [
        ...(prev.scenarioData?.rooms || [
          { puzzle_data: "", answer: "", hint: "", type: "cipher" },
          { puzzle_data: "", answer: "", hint: "", type: "network" },
          { puzzle_data: "", answer: "", hint: "", type: "logic" },
          { puzzle_data: "", answer: "", hint: "", type: "dual" },
        ]),
      ];

      let room = { ...currentRooms[roomIdx] };

      Object.entries(updates).forEach(([field, value]) => {
        room[field] = value;
        if (roomIdx === 3) {
          const room4Mapping = {
            puzzle_data: "layer1",
            hint: "vKey",
            answer: "masterKey",
          };
          const targetField = room4Mapping[field] || field;
          room.room4 = { ...(room.room4 || {}), [targetField]: value };
        }
      });

      currentRooms[roomIdx] = room;
      return {
        ...prev,
        scenarioData: { ...prev.scenarioData, rooms: currentRooms },
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
      result += String.fromCharCode(
        ((c - 65 + (key.charCodeAt(j % key.length) - 65)) % 26) + 65,
      );
      j++;
    }
    return result;
  };

  const roomConfig = [
    {
      title: "CIPHER_BREACH",
      icon: <Hash size={18} />,
      color: "text-pink-400",
      bg: "bg-pink-500/5",
      border: "border-pink-500/20",
    },
    {
      title: "NETWORK_AUDIT",
      icon: <Network size={18} />,
      color: "text-blue-400",
      bg: "bg-blue-500/5",
      border: "border-blue-500/20",
    },
    {
      title: "LOGIC_VERIFICATION",
      icon: <Cpu size={18} />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
    },
    {
      title: "DUAL_CORE_PROTO",
      icon: <Lock size={18} />,
      color: "text-rose-500",
      bg: "bg-rose-500/5",
      border: "border-rose-500/20",
    },
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
        return !!(
          room.room4?.layer1 &&
          room.room4?.vKey &&
          room.room4?.masterKey
        );
      default:
        return false;
    }
  };

  const getEncryptionPreview = (plain, key) => {
    if (!plain || !key) return { ciphertext: "", base64: "" };

    let ciphertext = "";
    const p = plain.toUpperCase().replace(/[^A-Z]/g, "");
    const k = key.toUpperCase().replace(/[^A-Z]/g, "");

    for (let i = 0, j = 0; i < p.length; i++) {
      const charCode = p.charCodeAt(i);
      ciphertext += String.fromCharCode(
        ((charCode - 65 + (k.charCodeAt(j % k.length) - 65)) % 26) + 65,
      );
      j++;
    }

    return {
      ciphertext: ciphertext,
      base64: btoa(ciphertext),
    };
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {/* 🟢 شريط الغرف: تم دعمه بالتمرير الأفقي المريح والأنيق لشاشات الجوال */}
      <div className="flex overflow-x-auto no-scrollbar flex-nowrap gap-2 mb-6 bg-black/40 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-white/5">
        {roomConfig.map((room, i) => {
          const isLocked = i > 0 && !isRoomComplete(i - 1);
          return (
            <button
              key={i}
              disabled={isLocked}
              onClick={() => setActiveRoom(i)}
              className={`flex-shrink-0 min-w-[115px] sm:min-w-0 flex-1 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center justify-center gap-1.5 
                ${activeRoom === i ? "bg-emerald-600 text-white shadow-lg" : isLocked ? "opacity-20 cursor-not-allowed text-gray-500" : "text-gray-600 hover:text-gray-300"}`}
            >
              {isLocked ? <Lock size={12} /> : room.icon}
              ROOM_0{i + 1}
            </button>
          );
        })}
      </div>

      {/* لوحة التحكم داخل الغرفة النشطة */}
      <div
        className={`rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border-2 transition-all duration-500 ${roomConfig[activeRoom].bg} ${roomConfig[activeRoom].border} min-h-fit`}
      >
        {activeRoom === 0 && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-2">
              <label className="text-[10px] text-pink-400 font-black uppercase ml-2 flex items-center gap-2">
                <Search size={12} /> Encrypted Text by Caesar Cipher
              </label>
              <input
                className="w-full bg-black/60 border border-pink-500/30 rounded-2xl p-4 sm:p-6 text-xl sm:text-3xl font-black text-[#ff88cc] text-center tracking-[0.2em] sm:tracking-[0.4em] outline-none"
                value={formData.scenarioData?.rooms?.[0]?.puzzle_data || ""}
                placeholder="KHOOR_ZRUOG"
                onChange={(e) =>
                  updateRoom(0, { puzzle_data: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase ml-2">
                  Clean Answer
                </label>
                <input
                  className="w-full bg-black border border-white/10 rounded-xl p-3.5 text-emerald-400 font-bold uppercase text-xs md:text-sm"
                  value={formData.scenarioData?.rooms?.[0]?.answer || ""}
                  placeholder="HELLO_WORLD"
                  onChange={(e) =>
                    updateRoom(0, { answer: e.target.value.toUpperCase() })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase ml-2">
                  Cipher Hint
                </label>
                <input
                  className="w-full bg-black border border-white/10 rounded-xl p-3.5 text-blue-400 text-xs md:text-sm"
                  value={formData.scenarioData?.rooms?.[0]?.hint || ""}
                  placeholder="Ex: Shift +3"
                  onChange={(e) => updateRoom(0, { hint: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {activeRoom === 1 && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2">
            
            {/* 1. بناء سجلات الشبكة (Logs) */}
            <div className="bg-black/40 border border-blue-500/20 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] sm:text-[11px] text-blue-400 font-black uppercase italic tracking-widest flex items-center gap-2">
                  <Network size={14} /> Step 1: Construct Live Packet Stream
                </label>
                <span className="hidden sm:inline text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">
                  PROT_V.2.4
                </span>
              </div>

              <div className="space-y-3">
                {/* 🟢 تم إصلاح الانحشار أفقياً عبر التحول العمودي في الموبايل */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="logInput"
                    type="text"
                    placeholder="Add a log entry... ([192.168.1.105])"
                    className="w-full sm:flex-1 bg-black border border-white/10 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-blue-500 transition-all"
                  />
                  <button
                    id="addLogBtn"
                    onClick={() => {
                      const val = document.getElementById("logInput").value;
                      if (val) {
                        const currentLogs = formData.scenarioData?.rooms?.[1]?.logs || [];
                        const ipMatch = val.match(/\[(.*?)\]/);
                        const extractedIp = ipMatch ? ipMatch[1] : "0.0.0.0";

                        updateRoom(1, {
                          logs: [
                            ...currentLogs,
                            {
                              ts: new Date().toLocaleTimeString(),
                              ip: extractedIp,
                              msg: val,
                              status: "normal",
                            },
                          ],
                        });
                        document.getElementById("logInput").value = "";
                      }
                    }}
                    className="w-full sm:w-auto bg-blue-600 py-3 sm:py-0 px-5 rounded-xl text-[10px] font-black text-white hover:bg-blue-500 shadow-lg shadow-blue-500/10 transition-all text-center whitespace-nowrap uppercase tracking-wider"
                  >
                    ADD_LOG
                  </button>
                </div>

                <div className="max-h-32 overflow-y-auto space-y-2 bg-black/20 p-3 rounded-xl border border-white/5 custom-scrollbar">
                  {(formData.scenarioData?.rooms?.[1]?.logs || []).length === 0 ? (
                    <p className="text-[9px] text-gray-600 italic text-center py-4">
                      No packet logs deployed yet...
                    </p>
                  ) : (
                    (formData.scenarioData?.rooms?.[1]?.logs || []).map((log, lIdx) => (
                      <div
                        key={lIdx}
                        className="text-[10px] font-mono flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5 gap-2 group"
                      >
                        <span className="text-blue-400 truncate flex-1">
                          <span className="text-gray-600 mr-1">[{log.ts}]</span>
                          <span className="bg-blue-500/10 px-1 rounded text-[9px] mr-2">IP_{log.ip}</span>
                          <span className="text-gray-400 text-[10px]">{log.msg}</span>
                        </span>
                        <button
                          onClick={() => {
                            const currentLogs = formData.scenarioData?.rooms?.[1]?.logs || [];
                            const filteredLogs = currentLogs.filter((_, idx) => idx !== lIdx);
                            updateRoom(1, { logs: filteredLogs });
                          }}
                          className="text-rose-500 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity px-2 flex-shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 2. بناء الأجهزة (Network Terminals) */}
            <div className="bg-[#0a1020] border border-blue-500/10 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center px-1 gap-2">
                <label className="text-[10px] sm:text-[11px] text-gray-500 uppercase font-black italic tracking-widest">
                  Step 2: Deploy Network Terminals
                </label>
                <span
                  className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded w-fit ${
                    formData.scenarioData?.rooms?.[1]?.options?.length === 5
                      ? "bg-emerald-500/20 text-emerald-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}
                >
                  {formData.scenarioData?.rooms?.[1]?.options?.length || 0} / 5 DEVICES READY
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="nodeIpInput"
                  type="text"
                  placeholder="New Device IP (e.g. 10.0.0.45)..."
                  className="w-full sm:flex-1 bg-black border border-white/10 rounded-xl p-3 text-white font-mono text-xs outline-none focus:border-blue-500 transition-all"
                />
                <button
                  id="deployBtn"
                  onClick={() => {
                    const ip = document.getElementById("nodeIpInput").value;
                    if (ip) {
                      const opts = formData.scenarioData?.rooms?.[1]?.options || [];
                      if (opts.length < 5) {
                        updateRoom(1, { options: [...opts, ip] });
                        document.getElementById("nodeIpInput").value = "";
                      } else {
                        Swal.fire({
                          title: "Network Segment Full",
                          text: "You can only deploy exactly 5 devices for this audit.",
                          icon: "info",
                          background: "#080c14",
                          color: "#fff",
                          confirmButtonColor: "#3b82f6",
                        });
                      }
                    }
                  }}
                  className="w-full sm:w-auto bg-emerald-600 py-3 px-5 rounded-xl text-[10px] font-black text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/10 transition-all tracking-wider uppercase whitespace-nowrap"
                >
                  DEPLOY_DEVICE
                </button>
              </div>

              {/* 🟢 تم إصلاح توزيع الـ 5 كروت لتتنفس كصفين في الجوال بدلاً من سطر مضغوط ومكسور */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 w-full min-h-fit pb-1">
                {(formData.scenarioData?.rooms?.[1]?.options || []).map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    onClick={() => updateRoom(1, { answer: opt })}
                    className={`p-2.5 border-2 rounded-xl relative group cursor-pointer transition-all flex flex-col items-center justify-center
                    ${opt === formData.scenarioData?.rooms?.[1]?.answer
                        ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        : "border-white/5 bg-white/5 opacity-70 hover:opacity-100 hover:border-white/20"}`}
                  >
                    <div className={`text-base md:text-2xl mb-1 ${opt === formData.scenarioData?.rooms?.[1]?.answer ? "animate-pulse" : ""}`}>
                      {opt === formData.scenarioData?.rooms?.[1]?.answer ? "☣️" : "💻"}
                    </div>
                    <p className="text-[7px] text-gray-500 uppercase font-black tracking-tighter mb-0.5">
                      Device_{optIdx + 1}
                    </p>
                    <p className="font-mono text-[8px] md:text-[9px] text-blue-400 truncate w-full text-center">
                      {opt}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentOptions = formData.scenarioData?.rooms?.[1]?.options || [];
                        const filteredOptions = currentOptions.filter((_, i) => i !== optIdx);
                        let updates = { options: filteredOptions };
                        if (opt === formData.scenarioData?.rooms?.[1]?.answer) {
                          updates.answer = "";
                        }
                        updateRoom(1, updates);
                      }}
                      className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full w-4 h-4 text-[8px] flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {[...Array(5 - (formData.scenarioData?.rooms?.[1]?.options?.length || 0))].map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="border-2 border-dashed border-white/5 bg-black/20 rounded-xl h-14 sm:h-24 flex flex-col items-center justify-center opacity-20"
                  >
                    <div className="text-sm mb-0.5 text-gray-600">📡</div>
                    <p className="text-[6px] font-black text-gray-600">OFFLINE</p>
                  </div>
                ))}
              </div>

              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <p className="text-[9px] md:text-[11px] text-center text-gray-500 italic flex items-center justify-center gap-1.5 leading-relaxed">
                  <Info size={12} className="text-blue-500 flex-shrink-0" />
                  Protocol: Click the suspicious device icon to deploy it as the INFECTED_TARGET.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeRoom === 2 && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 text-center">
            <div className="bg-[#0a1020] border-l-4 border-emerald-500 p-4 sm:p-6 rounded-2xl text-left shadow-inner">
              <label className="text-[10px] text-emerald-500 font-black uppercase mb-2 block tracking-widest">
                Boolean Equation
              </label>
              <textarea
                className="w-full bg-transparent text-sm md:text-lg font-mono text-white outline-none h-16 sm:h-20 resize-none"
                value={formData.scenarioData?.rooms?.[2]?.puzzle_data || ""}
                placeholder="Solve: (!FALSE && TRUE)..."
                onChange={(e) => updateRoom(2, { puzzle_data: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2">
              <button
                onClick={() => updateRoom(2, { answer: "TRUE" })}
                className={`p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border-2 transition-all duration-300 flex items-center justify-center ${formData.scenarioData?.rooms?.[2]?.answer === "TRUE" ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-black/40 border-white/5 opacity-40 hover:opacity-100"}`}
              >
                <span className="text-base sm:text-2xl font-black text-emerald-500 italic">TRUE</span>
              </button>
              <button
                onClick={() => updateRoom(2, { answer: "FALSE" })}
                className={`p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border-2 transition-all duration-300 flex items-center justify-center ${formData.scenarioData?.rooms?.[2]?.answer === "FALSE" ? "bg-rose-500/20 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]" : "bg-black/40 border-white/5 opacity-40 hover:opacity-100"}`}
              >
                <span className="text-base sm:text-2xl font-black text-rose-500 italic">FALSE</span>
              </button>
            </div>
          </div>
        )}

        {activeRoom === 3 && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 pb-2">
            
            {/* 📝 الجزء الأول: مدخلات المصمم */}
            <div className="p-4 sm:p-6 bg-[#0a0f1d] rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-white/5 text-left shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black italic ml-1">
                    1. Final Answer (Plaintext)
                  </label>
                  <input
                    className="w-full bg-black border-2 border-emerald-500/20 rounded-xl p-3 text-emerald-400 font-black uppercase outline-none focus:border-emerald-500 text-xs transition-all"
                    placeholder="Ex: HACKHERO"
                    value={formData.scenarioData?.rooms?.[3]?.room4?.masterKey || ""}
                    onChange={(e) => {
                      const plain = e.target.value.toUpperCase();
                      const key = formData.scenarioData?.rooms?.[3]?.room4?.vKey || "";
                      const results = getEncryptionPreview(plain, key);

                      updateRoom(3, {
                        answer: plain,
                        puzzle_data: results.base64,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black italic ml-1">
                    2. Secret Key
                  </label>
                  <input
                    className="w-full bg-black border-2 border-purple-500/20 rounded-xl p-3 text-purple-400 font-black uppercase outline-none focus:border-purple-500 text-xs transition-all"
                    placeholder="Ex: DARK"
                    value={formData.scenarioData?.rooms?.[3]?.room4?.vKey || ""}
                    onChange={(e) => {
                      const key = e.target.value.toUpperCase();
                      const plain = formData.scenarioData?.rooms?.[3]?.room4?.masterKey || "";
                      const results = getEncryptionPreview(plain, key);

                      updateRoom(3, {
                        hint: key,
                        puzzle_data: results.base64,
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 👁️ الجزء الثاني: ما سيراه اللاعب (Preview) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 sm:p-6 bg-pink-500/5 border-2 border-pink-500/20 rounded-[1.5rem] sm:rounded-[2.5rem] text-left relative overflow-hidden">
                <div className="absolute top-2 right-4 text-[6px] font-black text-pink-500/30 uppercase italic">
                  Layer_01
                </div>
                <label className="text-[10px] md:text-[11px] text-pink-400 font-black uppercase mb-2 block tracking-tighter">
                  Player's Initial Packet (Base64)
                </label>
                <div className="bg-black/60 rounded-xl p-3 font-mono text-[10px] md:text-xs text-pink-400 break-all min-h-[50px] flex items-center justify-center border border-pink-500/10 text-center">
                  {formData.scenarioData?.rooms?.[3]?.room4?.layer1 || "WAITING_FOR_DATA..."}
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-purple-500/5 border-2 border-purple-500/20 rounded-[1.5rem] sm:rounded-[2.5rem] text-left relative overflow-hidden">
                <div className="absolute top-2 right-4 text-[6px] font-black text-purple-500/30 uppercase italic">
                  Layer_02
                </div>
                <label className="text-[10px] md:text-[11px] text-purple-400 font-black uppercase mb-2 block tracking-tighter">
                  Result after Base64 Decode
                </label>
                <div className="bg-black/60 rounded-xl p-3 font-mono text-[10px] md:text-xs text-purple-300 break-all min-h-[50px] flex items-center justify-center border border-purple-500/10 text-center">
                  {getEncryptionPreview(
                    formData.scenarioData?.rooms?.[3]?.room4?.masterKey,
                    formData.scenarioData?.rooms?.[3]?.room4?.vKey,
                  ).ciphertext || "LOCKED"}
                </div>
              </div>
            </div>

            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-gray-500">
                Execution Path:{" "}
                <span className="text-emerald-500">Plaintext</span> ➔{" "}
                <span className="text-purple-400">Vigenère</span> ➔{" "}
                <span className="text-pink-400">Base64</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* مصفوفات التحكم والـ Validation متروكة كومنتد بالكامل كما هي بملفك الأصلي */}
      {/* <div className="flex gap-4 mt-8 pt-8 border-t border-white/5"> ... </div> */}
    </div>
  );
};

export default EscapeRoomBuilder;