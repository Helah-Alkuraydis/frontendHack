import React, { useState, useEffect, useMemo } from 'react';  
import axios from 'axios';
import { Timer, Trophy, Shield, Zap, Lock, ChevronRight, Search, Cpu, ShieldAlert, Globe, ShieldCheck, Lightbulb, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../api/auth.js';

const CyberEscapeRoom = ({ onFinish, gameId, sessionId, initialLevel, mode }) => { 
  const [scenario, setScenario] = useState(null);
  const [revealedHints, setRevealedHints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [screen, setScreen] = useState('start');
  const [roomIdx, setRoomIdx] = useState(0);
  const [score, setScore] = useState(150);
  const [timeLeft, setTimeLeft] = useState(600);
  const [ansInput, setAnsInput] = useState("");
  const [finalInput, setFinalInput] = useState("");
  const [layer1Done, setLayer1Done] = useState(false);
  const [activeHint, setActiveHint] = useState(false);
  const [selectedPath, setSelectedPath] = useState([]);
  const [feedback, setFeedback] = useState({ show: false, msg: "", type: "" });
  const [briefingStep, setBriefingStep] = useState(0);
  const [activeTool, setActiveTool] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const timeUsed = 600 - timeLeft;
  const [currentScenarioId, setCurrentScenarioId] = useState(null); 
  const [usedHints, setUsedHints] = useState([]); 



const finalizeScenario = async () => {
  if (!currentScenarioId) return;
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${BASE_URL}/games/escape/use/${currentScenarioId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Scenario marked as consumed.");
  } catch (err) {
    console.error("❌ Failed to finalize scenario:", err);
  }
};

 useEffect(() => {
  const fetchGameData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/games/escape/start?level=${initialLevel}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setScenario(res.data.data);
        setCurrentScenarioId(res.data.scenarioId); 

      }
    } catch (err) {
      console.error("Connection Error:", err);
      setScenario(null); 
    } finally {
      setLoading(false);
    }
  };
  fetchGameData();
}, [initialLevel]);



const deviceList = React.useMemo(() => {
  if (!scenario) return [];
  const uniqueIps = [...new Set(scenario.room2.logs.map(l => l.ip))];
  const icons = ['💻', '🖥', '🖧', '📡', '🖨', '📱'];
  const names = ['STATION-PX', 'CORE-SRV', 'GATEWAY-HUB', 'NODE-SEC', 'IOT-UNIT', 'ACCESS-PT'];

  return uniqueIps.map((ip, i) => ({
    id: i,
    ip: ip,
    icon: icons[i % icons.length],
    name: names[i % names.length]
  }));
}, [scenario]);

  useEffect(() => {
    if (screen !== 'room' || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [screen, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0 && screen === 'room') {
        setScreen('gameover');
        finalizeScenario();
    if (onFinish) {
      onFinish({
        status: 'Loss',
        score: 0,
        duration: 600,
        mistakesCount: mistakes
      });
  }
}
  }, [timeLeft, screen, onFinish, mistakes]);


  useEffect(() => {
    if (screen === 'success') {
      const redirectTimer = setTimeout(() => navigate('/games'), 5000);
      return () => clearTimeout(redirectTimer);
    }
  }, [screen, navigate]);


  const restartMission = () => {
    setScreen('start'); setRoomIdx(0); setScore(150); setTimeLeft(600);
    setAnsInput(""); setFinalInput(""); setLayer1Done(false);
    setFeedback({ show: false, msg: "", type: "" }); setActiveHint(false); setSelectedPath([]); setBriefingStep(0);
    setUsedHints([]);       
  setRevealedHints([]);   
  
  if (typeof setRoom3HintCount === 'function') {
    setRoom3HintCount(0);
  }
  };


  const triggerHint = (hintId, cost) => {
  if (!usedHints.includes(hintId)) {
    setScore(prev => Math.max(0, prev - (cost)));
    setUsedHints(prev => [...prev, hintId]);
    
    setFeedback({ show: true, msg: "HINT_ACTIVATED", type: 'hint-err' });
    setTimeout(() => setFeedback({ show: false }), 2000);
    return true; 
  }
  return false; 
};

const handleToolClick = (toolId) => {
  if (activeTool !== toolId) {
    triggerHint(toolId, 10);
  }
  
  setActiveTool(activeTool === toolId ? null : toolId);
};
  
 
  const checkRoom1 = () => {
    if (ansInput.trim().toUpperCase() === scenario.room1.answer) {
      setFeedback({ show: true, msg: "✅ ACCESS GRANTED!", type: "ok" });
      setTimeout(() => { setRoomIdx(1); setFeedback({ show: false }); setAnsInput(""); setActiveTool(null); }, 2000);
    } else {
      setFeedback({ show: true, msg: "INVALID KEY!", type: "err" });
      setTimeLeft(prev => Math.max(0, prev - 15));
      setScore(prev => Math.max(0, prev - 5));
      setMistakes(prev => prev + 1);
      setTimeout(() => setFeedback({ show: false }), 1500);
    }
  };

  const selectDevice = (device) => {
    if (device.ip === scenario.room2.infectedIp) {
      setFeedback({ show: true, msg: "✅ NODE ISOLATED!", type: "ok" });
      setTimeout(() => { setRoomIdx(2); setFeedback({ show: false }); }, 2000);
    } else {
      setFeedback({ show: true, msg: "WRONG NODE!", type: "err" });
      setTimeLeft(prev => Math.max(0, prev - 15));
      setScore(prev => Math.max(0, prev - 15));
      setMistakes(prev => prev + 1);
      setTimeout(() => setFeedback({ show: false }), 1500);
    }
  };

  const stepTile = (idx) => {
    if (selectedPath.includes(idx)) return;
    if (scenario.room3.correctIndices.includes(idx)) {
      setFeedback({ show: false });
      const newPath = [...selectedPath, idx];
      setSelectedPath(newPath);
      if (scenario.room3.correctIndices.every(tile => newPath.includes(tile))) {
        setFeedback({ show: true, msg: "✅ LOGIC BYPASS COMPLETE!", type: "ok" });
        setTimeout(() => { setRoomIdx(3); setFeedback({ show: false }); }, 2500);
      }
    } else {
      setFeedback({ show: true, msg: "TRAP ACTIVATED!", type: "err" });
      setTimeLeft(prev => Math.max(0, prev - 15));
      setScore(prev => Math.max(0, prev - 10));
      setMistakes(prev => prev + 1);
      setTimeout(() => setFeedback({ show: false }), 1500);
    }
  };

 const checkLayer1 = () => {
  try {
    const decodedFromBase64 = atob(scenario.room4.layer1); 
    if (ansInput.trim().toUpperCase() === decodedFromBase64.toUpperCase()) {
      setLayer1Done(true);
      setAnsInput(""); 
      setFeedback({ show: true, msg: "✅ BASE64 DECODED! NOW BREAK VIGENÈRE", type: "ok" });
      setTimeout(() => setFeedback({ show: false }), 2000);
    } else {
      setScore(prev => Math.max(0, prev - 10));
      setMistakes(prev => prev + 1);
      setFeedback({ show: true, msg: "INVALID DECODING!", type: "err" });
      setTimeLeft(prev => Math.max(0, prev - 15));
      setTimeout(() => setFeedback({ show: false }), 2000);
    }
  } catch (e) {
    console.error("Base64 format error");
  }
};

const checkFinalBreach = async () => {
  if (!layer1Done) return; 
  if (finalInput.trim().toUpperCase() === scenario.room4.masterKey.toUpperCase()) {
    await finalizeScenario();
    setScreen('success');
    if (onFinish) {
      onFinish({
        status: 'Win',
        score: score, 
        duration: timeUsed, 
        mistakesCount: mistakes
      });
    }
  } else {
    setFeedback({ show: true, msg: "MASTER KEY DENIED!", type: "err" });
    setTimeLeft(prev => Math.max(0, prev - 15));
    setScore(prev => Math.max(0, prev - 10));
    setMistakes(prev => prev + 1);
    setTimeout(() => setFeedback({ show: false }), 2000);
  }
};

 if (screen === 'start') {

    return (

      <div className="h-screen cyber-bg flex flex-col items-center justify-center p-6 text-center gap-8 font-mono">
        <div className="space-y-2 animate-in fade-in duration-1000">
          <h1 className="text-7xl font-black text-[#00ff96] tracking-tighter glitch-text uppercase">Cyber Fortress</h1>
          <p className="text-[#00ff96] font-black not-italic tracking-[0.6em] text-sm uppercase italic opacity-50">Cyber Escape Room •
                                  Level {initialLevel?.toString().padStart(2, '0') || "01"}
         </p>
        </div>
        <div className="w-full max-w-2xl bg-[#0a1020]/80 border-2 border-[#00ff9620] p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden min-h-[320px] flex flex-col justify-center transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff9650] to-transparent animate-pulse"></div>
          {briefingStep === 0 && (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
              <p className="text-[#00ff96] font-black uppercase tracking-[0.4em] text-s">-- Intelligence Report --</p>
              <h3 className="text-3xl font-black text-white italic">[ SITUATION ]</h3>
              <p className="text-lg text-gray-400 leading-relaxed font-sans">
                An unauthorized brute-force entity has bypassed our primary firewall.
                The <strong className="text-white border-b border-[#00ff96]">Digital Fortress</strong> is currently in lockdown mode.
              </p>
            </div>
          )}
      {briefingStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                    <p className="text-[#00ff96] font-black uppercase tracking-[0.4em] text-s">-- Mission Parameters --</p>
                    <h3 className="text-3xl font-black text-white italic">[ OBJECTIVE ]</h3>
                    <div className="text-left max-w-md mx-auto space-y-3">
                      <p className="text-gray-400 text-base font-sans">You must navigate through 4 Room:</p>
                      <ul className="text-sm space-y-2 text-[#00ff96] font-black uppercase tracking-widest italic">
                          <li className="flex items-center gap-3"><ChevronRight size={14}/> 01. Encoding Room</li>
                          <li className="flex items-center gap-3"><ChevronRight size={14}/> 02. Infected Device Control Room</li>
                          <li className="flex items-center gap-3"><ChevronRight size={14}/> 03. Logic Trap Gate Room</li>
                          <li className="flex items-center gap-3"><ChevronRight size={14}/> 04. The Final Decode Chamber</li>
                      </ul>
                    </div>
                  </div>
          )}
          {briefingStep === 2 && (
            <div className="space-y-6 animate-in zoom-in duration-500">
              <h3 className="text-3xl font-black text-red-500 italic">[ WARNING ]</h3>
              <p className="text-lg text-gray-400 leading-relaxed font-sans">
                Every incorrect attempt will trigger a <strong className="text-white">Time Dilation Penalty & Score Deduction</strong> ,
                accelerating the system wipe-out sequence.
              </p>
              <div className="pt-6 border-t border-white/5 text-[16px] text-red-400/90 uppercase tracking-[0.2em]">
                Byte-loss imminent !! Regain control or face sterilization.
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-4 items-center">
          {briefingStep < 2 ? (
            <button
              onClick={() => setBriefingStep(prev => prev + 1)}
              className="px-20 py-5 bg-[#00ff96] text-black font-black tracking-[0.3em] uppercase hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,150,0.3)] active:scale-95"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setScreen('room')}
              className="px-20 py-6 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black tracking-[0.4em] uppercase hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,0,0,0.4)] animate-pulse"
            >
              Start Mission
            </button>
          )}
        </div>
        <div className="flex gap-2">
            {[0, 1, 2].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${briefingStep === i ? 'bg-[#00ff96] w-6' : 'bg-white/10'}`} />
            ))}
        </div>
      </div>
    );
}

      if (screen === 'success') {
        return (
          <div className="h-screen cyber-bg flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-1000">
            
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#00ff96] blur-[50px] opacity-20 animate-pulse"></div>
              <Trophy size={100} className="text-[#00ff96] relative z-10 drop-shadow-[0_0_15px_#00ff96]" />
            </div>

            <div className="mb-10">
              <h1 className="text-6xl font-black text-[#00ff96] glitch-text uppercase tracking-tighter">Mission Complete</h1>
              <p className="text-[#506070] tracking-[0.4em] text-[10px] font-black uppercase mt-2">Data Integrity Secured • Command Center Sync</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl mb-12">
              
              <div className="bg-[#0a1020] border-2 border-[#00ff96]/20 p-8 rounded-[2.5rem] shadow-2xl transition-all hover:border-[#00ff96]/40 group">
                <p className="text-[10px] text-[#506070] uppercase mb-2 font-black tracking-widest group-hover:text-[#00ff96] transition-colors">Total XP Gained</p>
                <p className="text-5xl font-black text-[#00ff96] drop-shadow-[0_0_10px_#00ff96]">{score}</p>
              </div>

              <div className="bg-[#0a1020] border-2 border-white/5 p-8 rounded-[2.5rem] shadow-2xl transition-all hover:border-red-500/20 group">
                <p className="text-[10px] text-[#506070] uppercase mb-2 font-black tracking-widest group-hover:text-red-500 transition-colors">Security Alerts</p>
                <p className={`text-5xl font-black ${mistakes > 0 ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-white'}`}>
                  {mistakes}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-[#00ff96] animate-progress-load shadow-[0_0_15px_#00ff96]"></div>
              </div>
              <p className="text-[9px] text-[#00ff96] font-black uppercase tracking-[0.3em] animate-pulse italic">
                Redirecting to HackHero Core...
              </p>
            </div>

          </div>
        );
      }


  if (screen === 'gameover') {

  return (
    <div className="h-screen cyber-bg flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="mb-8 p-10 bg-red-500/10 rounded-full border border-red-500/20 shadow-[0_0_50px_rgba(220,38,38,0.1)]">
          <ShieldAlert size={80} className="text-red-500 animate-bounce" />
      </div>
      <h1 className="text-6xl font-black text-red-500 uppercase tracking-tighter mb-4 glitch-text">System Breach</h1>
      <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-12 uppercase tracking-widest">
        Mission Failed. The encryption sequence reached zero. All data packets have been purged from the system.
      </p>
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
        <button
          onClick={restartMission}
          className="flex-1 px-8 py-5 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] active:scale-95 flex items-center justify-center gap-3"
        >
          <Zap size={18} fill="currentColor" /> Retry Mission
        </button>
        <button
          onClick={() => navigate('/games')}
          className="flex-1 px-8 py-5 bg-white/5 border border-white/10 text-gray-400 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95"
        >
          Abort Mission
        </button>
      </div>
    </div>
  );

}

if (loading) {
  return <div className="h-screen cyber-bg flex items-center justify-center text-[#00ff96]">Loading Intelligence...</div>;
}

if (!scenario) {
  return (
    <div className="h-screen cyber-bg flex flex-col items-center justify-center gap-6 text-red-500">
      <h1 className="text-4xl font-black italic">CONNECTION LOST</h1>
      <p className="font-mono text-sm opacity-70">Could not sync with Command Center.</p>
      <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white font-black uppercase">
        Retry Linkup
      </button>
    </div>
  );
}
  return (
    <div className="h-screen cyber-bg flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-8 py-4 bg-[#080c16] border-b border-[#00ff9610]">
        <div className="text-xs font-black text-[#00ff96] tracking-[0.3em] uppercase">⬡ Cyber Escape</div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 bg-[#0d1a0d] border border-[#00ff9630] px-5 py-1.5 rounded-sm">
            <span className="font-mono text-2xl font-bold text-[#00ff96]">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-3 bg-[#0d0d1a] border border-[#6060ff30] px-5 py-1.5 rounded-sm">
            <span className="font-mono text-xl font-bold text-[#8888ff]">{score}</span>
          </div>
        </div>
      </header>

      <div className="flex h-1 bg-[#1a1a2e]">
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx} className={`flex-1 mx-[1px] transition-all duration-700 ${idx < roomIdx ? 'bg-[#00ff96]' : idx === roomIdx ? 'bg-[#00cc77] animate-pulse' : 'bg-[#1a1a2e]'}`} />
        ))}
      </div>

      <main className="flex-1 p-8 max-w-4xl mx-auto w-full overflow-y-auto">
     
      {/* ROOM 1: Cipher Breach */}
              {roomIdx === 0 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 relative">
                  
                  {feedback.show && feedback.type === 'err' && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none animate-in fade-in zoom-in duration-300">
                      <div className="bg-red-600 text-white px-12 py-6 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.5)] border-2 border-white/20 flex items-center gap-4 animate-bounce pointer-events-auto">
                        <ShieldAlert size={40} className="text-white" />
                        <div className="text-left">
                          <h4 className="text-xl font-black uppercase tracking-tighter">Access Denied!</h4>
                          <div className="flex flex-col">
                            <p className="text-sm font-bold opacity-90">-15 Seconds Time Penalty</p>
                            
                            <p className="text-sm font-black text-yellow-300 animate-pulse">-5 Points Security Deduction</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {feedback.show && feedback.type === 'hint-err' && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none animate-in fade-in zoom-in duration-300">
                      <div className="bg-red-600 text-white px-12 py-6 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.5)] border-2 border-white/20 flex items-center gap-4 animate-bounce pointer-events-auto">
                        <ShieldAlert size={40} className="text-white" />
                        <div className="text-left">
                          <h4 className="text-xl font-black uppercase tracking-tighter">Hint Activated!</h4>
                          <div className="flex flex-col">
                            <p className="text-sm font-black text-yellow-300 animate-pulse">-10 Points Security Deduction</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-[#0d131f] border-l-4 border-[#00ff96] p-4 rounded-r-xl shadow-lg relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Shield size={40} /></div>
                      <div className="flex items-center gap-3 mb-2">
                          <Zap size={16} className="text-[#00ff96] animate-pulse" />
                          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#00ff96]">ROOM_01: Cipher_Breach</span>
                      </div>
                     <p className="text-s text-gray-400 font-sans leading-relaxed pr-8">
                            An encrypted data packet has been intercepted. System identifies the protocol as 
                            <span className="text-white underline ml-1">Caesar Cipher</span>  
                           , Analyze the sequence to regain access.
      
                          </p>
                  </div>

                  <div className="bg-[#060e08] border border-[#00ff9620] rounded-xl p-10 font-mono text-center shadow-2xl relative">
                      <div className="text-4xl text-[#ff88cc] font-black tracking-[0.4em] drop-shadow-[0_0_15px_rgba(255,136,204,0.3)] glitch-text">
                        {scenario?.room1?.encoded}
                      </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'scan', label: 'DEEP SCAN', icon: <Search size={14}/> },
                          { id: 'map', label: 'SHIFT MAP', icon: <Globe size={14}/> },
                          { id: 'frequency', label: 'LOG ANALYZER', icon: <Cpu size={14}/> }
                        ].map(tool => {
                          const isUsed = usedHints.includes(tool.id);
                          return (
                            <button 
                              key={tool.id}
                              onClick={() => handleToolClick(tool.id)} 
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all relative
                                ${activeTool === tool.id 
                                  ? 'bg-[#00ff96]/10 border-[#00ff96] text-[#00ff96] shadow-[0_0_15px_rgba(0,255,150,0.2)]' 
                                  : 'bg-[#0a1020] border-white/5 text-gray-500 hover:border-white/20'}`}
                            >
                              {!isUsed && (
                                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg animate-pulse">
                                  -10s
                                </span>
                              )}
                              
                              {tool.icon}
                              <span className="text-[12px] font-black tracking-widest uppercase">{tool.label}</span>
                              
                              {isUsed && <div className="absolute top-1 left-1 w-1 h-1 bg-[#00ff96] rounded-full shadow-[0_0_5px_#00ff96]"></div>}
                            </button>
                          );
                        })}
                      </div>

                  {activeTool && (
                      <div className="bg-[#080c14] border border-blue-500/30 p-5 rounded-xl animate-in slide-in-from-top-2 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-red-500/10 px-3 py-1 text-[10px] font-bold text-red-400 uppercase tracking-tighter">
                          Hint Mode Active
                        </div>

                        <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                            <Cpu size={12} className="text-blue-400" />
                            <span className="text-[12px] font-black text-blue-400 uppercase tracking-widest">Workstation Output</span>
                        </div>
                      
                      <div className="text-s font-mono text-gray-300 leading-relaxed">
                        {activeTool === 'scan' && (
                          <p>Scan complete: <span className="text-[#00ff96]">Partial match.</span> Identified prefix: 
                          <span className="text-white font-bold bg-white/10 px-2 ml-2 italic">
                            "{scenario?.room1?.answer?.substring(0, 2)}..."
                          </span></p>
                        )}

                        {activeTool === 'map' && (
                          <div className="grid grid-cols-2 gap-2 text-[15px] text-emerald-500/70">
                            <div>
                              [{scenario?.room1?.encoded?.slice(-2, -1)}] → {scenario?.room1?.answer?.slice(-2, -1)}
                            </div>
                            
                            <div>
                              [{scenario?.room1?.encoded?.slice(-1)}] → {scenario?.room1?.answer?.slice(-1)}
                            </div>
                          </div>
                        )}

                        {activeTool === 'frequency' && (
                          <p>Pattern Analysis: Found repetitive bit-shift of <span className="text-red-400">-{scenario?.room1?.shift}</span>. Apply reverse rotation to decrypt packet.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <div className="flex gap-3 p-2 bg-black/40 border border-[#304050] rounded-2xl focus-within:border-[#00ff9660] transition-all shadow-inner">
                      <div className="pl-4 flex items-center text-[#304050] font-black text-sm">$</div>
                      <input 
                        value={ansInput} 
                        onChange={e => setAnsInput(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && checkRoom1()} 
                        placeholder="ENTER DECRYPTED KEY..." 
                        className="flex-1 bg-transparent p-4 text-[#00ff96] font-bold tracking-[0.3em] uppercase outline-none placeholder:text-[#1a2331]" 
                      />
                      <button 
                        onClick={checkRoom1} 
                        className="bg-[#00ff96] text-black px-12 py-4 rounded-xl font-black uppercase italic tracking-widest hover:shadow-[0_0_30px_#00ff96] transition-all"
                      >
                        BREACH
                      </button>
                    </div>
                  </div>

                    {feedback.show && feedback.type === 'ok' && (
                <div className="mt-8 p-8 rounded-[2.5rem] bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 text-center font-black animate-in slide-in-from-bottom-4 shadow-xl flex items-center justify-center gap-4">
                  <ShieldCheck size={30} />
                  <span className="text-xl italic uppercase tracking-widest">{feedback.msg}</span>
                </div>
              )}
                </div>
              )}

        {/* ROOM 2*/}
            {roomIdx === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-700 font-mono relative">
                
                {feedback.show && feedback.type === 'err' && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none animate-in fade-in zoom-in duration-300">
                    <div className="bg-red-600 text-white px-12 py-6 rounded-2xl shadow-[0_0_60px_rgba(220,38,38,0.5)] border-2 border-white/20 flex items-center gap-4 animate-bounce pointer-events-auto">
                      <ShieldAlert size={40} className="text-white" />
                      <div className="text-left">
                        <h4 className="text-xl font-black uppercase tracking-tighter">Security Breach!</h4>
                        <div className="flex flex-col">
                          <p className="text-sm font-bold opacity-90">-15 Seconds Time Penalty</p>
                          <p className="text-sm font-black text-yellow-300 animate-pulse">-15 Points Security Deduction</p>
                          <span className="text-[10px] uppercase mt-1 opacity-70 tracking-widest italic">System Status: Clean Node Selected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {feedback.show && feedback.type === 'hint-err' && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none animate-in fade-in zoom-in duration-300">
                      <div className="bg-red-600 text-white px-12 py-6 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.5)] border-2 border-white/20 flex items-center gap-4 animate-bounce pointer-events-auto">
                        <ShieldAlert size={40} className="text-white" />
                        <div className="text-left">
                          <h4 className="text-xl font-black uppercase tracking-tighter">Hint Activated!</h4>
                          <div className="flex flex-col">
                            <p className="text-sm font-black text-yellow-300 animate-pulse">-30 Points Security Deduction</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="bg-[#0a1020] border-2 border-blue-500/20 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Search size={80} /></div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Search size={20} /></div>
                    <span className="text-s font-black uppercase tracking-[0.3em] text-blue-400">ROOM_02: Security Audit Required</span>
                  </div>
                  <p className="text-m text-gray-300 leading-relaxed max-w-2xl">
                    <strong className="text-white uppercase">[ MISSION ]:</strong> Multiple unauthorized data packets detected. 
                    Analyze the <span className="text-blue-400 underline decoration-dotted">Live Network Stream</span> below and identify which terminal has been compromised.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {deviceList.map((dev) => (
                    <div 
                      key={dev.id} 
                      onClick={() => selectDevice(dev)} 
                      className="group relative bg-[#060e08] border-2 border-white/5 p-8 rounded-[2.5rem] text-center cursor-pointer transition-all duration-500 hover:border-blue-500/50 hover:bg-blue-500/5 hover:-translate-y-2 active:scale-95 shadow-xl"
                    >
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-blue-400 shadow-[0_0_15px_#60a5fa] opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity"></div>
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                        {dev.icon}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-[13px] font-black text-white uppercase tracking-tighter opacity-80">{dev.name}</h3>
                        <p className="text-[14px] font-bold text-blue-500/60 group-hover:text-blue-400 transition-colors">{dev.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative group text-left">
                  <div className="absolute -inset-1 bg-blue-500/10 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-[#050810] border-2 border-white/5 rounded-3xl p-8 shadow-inner">
                    
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${usedHints.includes('unmask') ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></div>
                            <span className="text-[12px] font-black text-[#607060] uppercase tracking-[0.4em]">Live_Packet_Intercept_Stream</span>
                        </div>
                        
                        {!usedHints.includes('unmask') ? (
                          <button 
                            onClick={() => triggerHint('unmask', 30)} 
                            className="text-[13px] bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-1.5 rounded-full font-black hover:bg-orange-500 hover:text-black transition-all animate-pulse flex items-center gap-2"
                          >
                            <Zap size={10} /> Hints of THREATS (-30s)
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-[15px] text-orange-500 font-black italic tracking-widest bg-orange-500/5 px-3 py-1 rounded-lg border border-orange-500/20">
                            <Cpu size={12} className="animate-spin-slow" />     Hints Mode Active

                          </div>
                        )}
                    </div>

                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-4 custom-scrollbar">
                      {scenario.room2.logs.map((log, i) => {
                        const isRevealed = log.status === 'malicious' && usedHints.includes('unmask');
                        
                        return (
                          <div key={i} className={`flex items-start gap-6 py-2 px-4 rounded-lg border-l-2 transition-all duration-500
                            ${isRevealed ? 'border-orange-600 bg-orange-600/10 shadow-[inner_0_0_10px_rgba(234,88,12,0.1)]' : 'border-transparent hover:bg-white/5'}`}>
                            
                            <span className="text-[#506070] text-[14px] whitespace-nowrap mt-0.5">[{log.ts}]</span>
                            
                            <span className={`text-s font-black tracking-widest w-32 transition-colors
                              ${isRevealed ? 'text-orange-400' : 'text-blue-400/80'}`}>
                              {log.ip}
                            </span>

                            <span className={`text-s flex-1 transition-all
                              ${isRevealed ? 'text-orange-500 font-black italic animate-pulse' : 'text-emerald-500/70'}`}>
                              {log.msg}
                            </span>

                            {isRevealed && (
                              <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter animate-in zoom-in">
                                Threat Detected
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {feedback.show && feedback.type === 'ok' && (
                  <div className="p-8 rounded-[2.5rem] bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 text-center font-black animate-in slide-in-from-bottom-4 shadow-xl flex items-center justify-center gap-4">
                    <ShieldCheck size={30} />
                    <span className="text-xl italic uppercase tracking-widest">{feedback.msg}</span>
                  </div>
                )}

              </div>
            )}


            {/* ROOM 3 */}
                  {roomIdx === 2 && (
                    <div className="space-y-8 animate-in zoom-in duration-700 font-mono relative min-h-[600px]">
                      
                      {feedback.show && (feedback.type === 'err' || feedback.type === 'hint-err') && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none animate-in fade-in zoom-in duration-300">
                          <div className="bg-red-600 text-white px-12 py-6 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.5)] border-2 border-white/20 flex items-center gap-4 animate-bounce pointer-events-auto">
                            <ShieldAlert size={40} className="text-white" />
                            <div className="text-left">
                              <h4 className="text-xl font-black uppercase tracking-tighter">
                                {feedback.type === 'hint-err' ? 'System Override!' : 'Trap Activated!'}
                              </h4>
                              <div className="flex flex-col">
                                {feedback.type === 'hint-err' ? (
                                  <p className="text-sm font-black text-yellow-300 animate-pulse">-10 Points: Target Identified</p>
                                ) : (
                                  <>
                                    <p className="text-sm font-bold opacity-90">-15 Seconds Time Penalty</p>
                                    <p className="text-sm font-black text-yellow-300 animate-pulse">-10 Points Security Deduction</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-[#0a1020] border-2 border-[#00ff96]/20 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Cpu size={80} /></div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-[#00ff96]/20 rounded-lg text-[#00ff96]"><Cpu size={20} /></div>
                          <span className="text-s font-black uppercase tracking-[0.3em] text-[#00ff96]">ROOM_03: Logic Sequence Verification</span>
                        </div>
                        <p className="text-base text-gray-300 leading-relaxed font-sans">
                          <strong className="text-white uppercase">[ DIRECTIVE ] : </strong> The security gate is locked by a Boolean logic trap. 
                          Select only the <span className="text-[#00ff96] font-black underline decoration-double text-lg italic">TAUTOLOGIES</span> <span className="text-[#00ff96] font-black text-m italic"> -Always TRUE-</span> to bypass the sector.
                        </p>
                      </div>

                      <div className="flex justify-between items-center mb-4 px-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${revealedHints.length > 0 ? 'bg-cyan-400 animate-pulse' : 'bg-gray-700'}`}></div>
                          <div className="flex items-center gap-2 bg-blue-500/5 px-3 py-1.5 rounded-md border border-blue-500/10">
                            <span className="text-[12px] text-cyan-400 font-bold uppercase tracking-tighter">Scanner_State</span>
                           <span className="text-[12px] text-red-400 font-mono font-black tracking-widest">
                                [ {selectedPath.length + revealedHints.length} TARGETS_UNLOCKED ]
                              </span>
                          </div>
                        </div>
                        
                        {(selectedPath.length + revealedHints.length) < scenario.room3.correctIndices.length && (
                          <button 
                            onClick={() => {
                              const nextTarget = scenario.room3.correctIndices.find(
                                idx => !selectedPath.includes(idx) && !revealedHints.includes(idx)
                              );

                              if (nextTarget !== undefined) {
                                setScore(prev => Math.max(0, prev - 10)); 
                                setRevealedHints(prev => [...prev, nextTarget]); 
                                setFeedback({ show: true, msg: "TARGET_LOCKED", type: 'hint-err' });
                                setTimeout(() => setFeedback({ show: false }), 1500);
                              }
                            }} 
                            className="text-[11px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-1.5 rounded-full font-black hover:bg-cyan-500 hover:text-black transition-all animate-pulse flex items-center gap-2"
                          >
                            <Zap size={10} /> REVEAL Hint (-10 pts)
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {scenario.room3.tiles.map((tile, i) => {
                          const isSelected = selectedPath.includes(i);
                          
                          const isHinted = revealedHints.includes(i);

                          return (
                            <div 
                              key={i} 
                              onClick={() => {
                                stepTile(i);
                                if (revealedHints.includes(i)) {
                                  setRevealedHints(prev => prev.filter(h => h !== i));
                                }
                              }} 
                              className={`group relative h-44 flex flex-col rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer shadow-lg overflow-hidden
                                ${isSelected 
                                  ? 'bg-[#001a10] border-[#00ff96] shadow-[0_0_40px_rgba(0,255,150,0.2)] scale-105' 
                                  : isHinted 
                                    ? 'bg-[#00151a] border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                                    : 'bg-[#060e08] border-white/5 hover:border-[#00ff96]/40 hover:bg-[#00ff96]/5 hover:-translate-y-1'
                                }`}
                            >
                              {isHinted && !isSelected && (
                                <div className="absolute top-4 right-6 text-cyan-400 animate-pulse flex items-center gap-1">
                                  <span className="text-[8px] font-black uppercase tracking-tighter">Verified</span>
                                  <ShieldCheck size={12} />
                                </div>
                              )}

                              <div className={`absolute top-5 left-6 text-[11px] font-black tracking-widest 
                                ${isSelected ? 'text-[#00ff96]' : isHinted ? 'text-cyan-400' : 'text-gray-700'}`}>
                                BLOCK_0{i + 1}
                              </div>

                              <div className="flex-1 flex items-center justify-center px-6">
                                <span className={`text-2xl md:text-2xl font-black tracking-tighter text-center transition-all duration-500
                                  ${isSelected ? 'text-[#00ff96] drop-shadow-[0_0_10px_#00ff96] scale-110' : isHinted ? 'text-cyan-400' : 'text-gray-500 group-hover:text-white'}
                                `}>
                                  {tile}
                                </span>
                              </div>

                              <div className={`h-1.5 w-full transition-all duration-500 
                                ${isSelected ? 'bg-[#00ff96]' : isHinted ? 'bg-cyan-400' : 'bg-transparent group-hover:bg-white/10'}`}>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-black/40 border border-white/5 p-5 rounded-[1.5rem] flex items-center justify-between shadow-inner">
                        <div className="flex items-center gap-4">
                          <span className="text-[13px] font-black text-[#506070] uppercase tracking-[0.4em]">Validation Status:</span>
                          <div className="flex gap-2">
                            {Array(scenario.room3.correctIndices.length).fill(0).map((_, idx) => (
                              <div 
                                key={idx} 
                                className={`w-10 h-1.5 rounded-full transition-all duration-1000 ${idx < selectedPath.length ? 'bg-[#00ff96] shadow-[0_0_15px_#00ff96]' : 'bg-white/5'}`}
                              ></div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end leading-none">
                          <span className="text-xl font-black text-[#00ff96] italic tracking-tighter">
                              {selectedPath.length}<span className="text-white/20 text-sm mx-1">/</span>{scenario.room3.correctIndices.length}
                          </span>
                          <span className="text-[10px] font-bold text-[#00ff96]/40 uppercase tracking-widest mt-1 text-right">Keys Found</span>
                        </div>
                      </div>

                      {feedback.show && feedback.type === 'ok' && (
                        <div className="mt-8 p-8 rounded-[2.5rem] bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 text-center font-black animate-in slide-in-from-bottom-4 shadow-xl flex items-center justify-center gap-4">
                          <ShieldCheck size={30} />
                          <span className="text-xl italic uppercase tracking-widest">{feedback.msg}</span>
                        </div>
                      )}

                    </div>
                  )}


        {/* ROOM 4 */}
            {roomIdx === 3 && (
              <div className="space-y-8 animate-in slide-in-from-top-4 duration-1000 font-mono relative">
                
                {feedback.show && (feedback.type === 'err' || feedback.type === 'hint-err') && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none animate-in fade-in zoom-in duration-300">
                    <div className="bg-red-600 text-white px-12 py-6 rounded-2xl shadow-[0_0_60px_rgba(220,38,38,0.6)] border-2 border-white/20 flex items-center gap-4 animate-bounce pointer-events-auto">
                      <ShieldAlert size={40} className="text-white" />
                      <div className="text-left">
                        <h4 className="text-xl font-black uppercase tracking-tighter">
                          {feedback.type === 'hint-err' ? 'Decryption Aid' : 'Master Key Denied!'}
                        </h4>
                        <div className="flex flex-col">
                          {feedback.type === 'hint-err' ? (
                            <p className="text-sm font-black text-yellow-300 animate-pulse">-Points Deducted: Aid Injected</p>
                          ) : (
                            <p className="text-sm font-bold opacity-90">-40 Seconds Penalty • Access Blocked</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-[#0a1020] border-2 border-[#ff0055]/30 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-[#ff0055]"><Lock size={80} /></div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#ff0055]/20 rounded-lg text-[#ff0055]"><Lock size={20} /></div>
                    <span className="text-s font-black uppercase tracking-[0.3em] text-[#ff0055]">ROOM_04 : Dual-Layer Protocol</span>
                  </div>
                  <p className="text-base text-gray-300 leading-relaxed font-sans">
                    <strong className="text-white uppercase">[ CRITICAL ]: </strong> The central core is protected by <span className="text-[#ff0055] font-black underline">Two-Factor Encryption</span>. 
                    Decrypt the Base64 hash first, then provide the Master Security Key.
                  </p>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-[#ff88cc]/20 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-[#060e08] border-2 border-[#ff88cc]/30 rounded-[2.5rem] p-12 text-center shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff88cc] to-transparent opacity-30"></div>
                    
                    <div className="text-3xl md:text-4xl font-black text-[#ff88cc] tracking-[0.3em] drop-shadow-[0_0_20px_rgba(255,136,204,0.4)] break-all px-4">
                      {scenario?.room4?.layer1?.replace(/=/g, '')}
                    </div>

                    <div className="mt-8 flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-[#4a5d4a]">
                      <span className="flex items-center gap-2 text-[14px]"><Zap size={12}/> Algorithm: B64_VIG</span>
                      <span className="flex items-center gap-2 animate-pulse  text-[14px]"><Lock size={12}/> ACCESS_RESTRICTED</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  
                  <div className={`p-8 rounded-[2rem] border-2 transition-all duration-700 ${layer1Done ? 'bg-[#001a0a]/40 border-[#00ff96]/40 opacity-60 scale-[0.98]' : 'bg-[#0a1020] border-white/10 shadow-xl'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${layer1Done ? 'bg-[#00ff96] text-black' : 'bg-white/10 text-white'}`}>
                          {layer1Done ? '✓' : '1'}
                        </div>
                        <h3 className={`text-s font-black uppercase tracking-[0.2em] ${layer1Done ? 'text-[#00ff96]' : 'text-gray-400'}`}>Layer 01: Base64 Decryption</h3>
                      </div>
                      
                      {!layer1Done && (
                        <button 
                          onClick={() => triggerHint('r4-b64', 15)}
                          className={`text-[12px] px-3 py-1 rounded-full border transition-all font-black
                            ${usedHints.includes('r4-b64') ?  'border-white/20 text-gray-500 hover:text-white':'border-[#00ff96] text-[#00ff96]'}`}
                        >
                          {usedHints.includes('r4-b64') ? 'DECODER_READY' : 'RUN B64_INTERPRETER (-15 pts)'}
                        </button>
                      )}
                    </div>
                    
                    {!layer1Done && (
                      <div className="space-y-4 text-left">
                        <div className="flex gap-4">
                          <input value={ansInput} onChange={e => setAnsInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkLayer1()} placeholder="DECODE_LAYER_01..." className="flex-1 bg-black border border-white/10 p-5 rounded-2xl text-xl font-bold text-[#00ff96] tracking-[0.2em] outline-none focus:border-[#00ff9660] transition-all uppercase" />
                          <button onClick={checkLayer1} className="bg-[#00ff96] text-black px-10 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95">Verify</button>
                        </div>
                  {usedHints.includes('r4-b64') && (
                    <div className="mt-4 p-4 bg-[#00ff96]/5 border-l-2 border-[#00ff96] rounded-r-xl animate-in fade-in slide-in-from-left-2">
                      <p className="text-[15px] text-[#00ff96] font-mono leading-relaxed">
                        <span className="font-black">[ HINT_INJECTED ]:</span> Analysis shows the decoded sequence starts with 
                        <span className="text-white font-black bg-[#00ff96]/20 px-2 mx-1 tracking-widest uppercase">
                          "{atob(scenario?.room4?.layer1).substring(0, 3)}..."
                        </span> 
                        and consists of 
                        <span className="text-white font-black ml-1">
                          {atob(scenario?.room4?.layer1).length} characters
                        </span>.
                      </p>
                    </div>
                  )}
                      </div>
                    )}
                  </div>
                    <div className={`p-8 rounded-[2rem] border-2 transition-all duration-700 ${layer1Done ? 'bg-[#0a1020] border-[#6040ff]/50 shadow-[0_0_40px_rgba(96,64,255,0.15)]' : 'bg-black/20 border-white/5 opacity-20 pointer-events-none'}`}>
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black bg-[#6040ff] text-white shadow-[0_0_15px_#6040ff50]">2</div>
                          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                            Layer 02: Vigenère Key : 
                            <span className="px-4 py-1 bg-red-500/10 border-2  rounded-lg text-[#ff88cc] font-black tracking-[0.3em] drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse inline-block skew-x-[-10deg]">
                              {scenario?.room4?.vKey}
                            </span>
                          </h3>
                        </div>
                        
                        {layer1Done && !usedHints.includes('r4-vig') && (
                          <button 
                            onClick={() => triggerHint('r4-vig', 20)}
                            className="text-[10px] px-4 py-1.5 rounded-full border border-[#ff88cc] text-[#ff88cc] font-black hover:bg-[#ff88cc] hover:text-black transition-all animate-pulse"
                          >
                            BRUTE_FORCE_KEY (-20 pts)
                          </button>
                        )}
                      </div>

                      {usedHints.includes('r4-vig') && (
                        <div className="mb-6 p-4 bg-[#ff88cc]/5 border-l-2 border-[#ff88cc] rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-500">
                          <p className="text-[13px] text-[#ff88cc] font-mono leading-relaxed">
                            <span className="font-black">[ SYSTEM_ADVISORY ]:</span> Master Key is a single word. 
                            Partial decryption successful: 
                            <span className="text-white font-black bg-[#ff88cc]/20 px-2 mx-1 tracking-widest underline">
                              {scenario?.room4?.masterKey?.substring(0, 2)}...
                            </span>
                            <br/>
                            <span className="opacity-70 mt-1 block tracking-tighter italic">// Use the Vigenère table with the PINK key provided above.</span>
                          </p>
                        </div>
                      )}

                      <div className="space-y-4 text-left">
                        <div className="flex gap-4">
                          <input 
                            value={finalInput} 
                            onChange={e => setFinalInput(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && checkFinalBreach()} 
                            placeholder="INPUT_MASTER_KEY..." 
                            className="flex-1 bg-black border border-white/10 p-5 rounded-2xl text-xl font-bold text-[#ff88cc] tracking-[0.2em] outline-none focus:border-[#6040ff60] transition-all uppercase shadow-inner" 
                          />
                          <button 
                            onClick={checkFinalBreach} 
                            className="bg-[#6040ff] text-white px-10 rounded-2xl font-black uppercase tracking-widest hover:bg-[#8060ff] transition-all shadow-[0_0_25px_rgba(96,64,255,0.4)] active:scale-95"
                          >
                            Unlock Door
                          </button>
                        </div>

                      </div>
                    </div>
                </div>
                  {feedback.show && feedback.type === 'ok' && (
                        <div className="mt-8 p-8 rounded-[2.5rem] bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 text-center font-black animate-in slide-in-from-bottom-4 shadow-xl flex items-center justify-center gap-4">
                          <ShieldCheck size={30} />
                          <span className="text-xl italic uppercase tracking-widest">{feedback.msg}</span>
                        </div>
                      )}
              </div>
            )}
                          
      </main>
    </div>
  );
};

export default CyberEscapeRoom;