import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import { ToolIcon, AttackIcon, H, E , STYLES } from '../GameIcons';

interface Attack {
  instanceId: number; type: string; name: string;
  color: string; x: number; speed: number;
}

const DEFENSIVE_TOOLS = [
  { id: 'firewall',       name: 'Firewall',     solves: 'network',    color: '#ff4400' },
  { id: 'antivirus',      name: 'Antivirus',    solves: 'malware',    color: '#ff5f5f' },
  { id: 'updates',        name: 'Updates',      solves: 'vuln',       color: '#e63946' },
  { id: 'email_filter',   name: 'Email Filter', solves: 'phishing',   color: '#ff4d4d' },
  { id: 'mfa',            name: 'MFA + Pass',   solves: 'password',   color: '#ff2a2a' },
  { id: 'url_scanner',    name: 'URL Scanner',  solves: 'fake_page',  color: '#ff3a3a' },
  { id: 'verification',   name: 'Verify Tool',  solves: 'soc_eng',    color: '#e63946' },
  { id: 'backup',         name: 'Backup Sys',   solves: 'ransomware', color: '#ff4d4d' },
  { id: 'vpn',            name: 'Secure VPN',   solves: 'mitm',       color: '#ff3a3a' },
  { id: 'ids',            name: 'IDS/Monitor',  solves: 'leak',       color: '#ff3a3a' },
  { id: 'waf',            name: 'WAF',          solves: 'injection',  color: '#ff5f5f' },
  { id: 'access_control', name: 'Access Ctrl',  solves: 'insider',    color: '#e63946' },
];

const ATTACK_TYPES = [
  { type: 'network',    name: 'DDoS FLOOD',    color: E.purple,  baseSpeed: 0.3 },
  { type: 'malware',    name: 'VIRUS_LOADED',  color: E.toxic,   baseSpeed: 0.4 },
  { type: 'vuln',       name: 'ZERO-DAY',      color: E.red,     baseSpeed: 0.35 },
  { type: 'phishing',   name: 'PHISH_HOOK',    color: E.cyan,    baseSpeed: 0.45 },
  { type: 'password',   name: 'BRUTE_FORCE',   color: E.purple,  baseSpeed: 0.4 },
  { type: 'fake_page',  name: 'DRIVE_BY',      color: E.toxic,   baseSpeed: 0.5 },
  { type: 'ransomware', name: 'RANSOM.EXE',    color: E.red,     baseSpeed: 0.38 },
  { type: 'mitm',       name: 'MAN_IN_MIDDLE', color: E.cyan,    baseSpeed: 0.42 },
  { type: 'injection',  name: 'SQL_INJECT',    color: E.toxic,   baseSpeed: 0.48 },
];

const getStageDetails = (level: number) => {
  if (level >= 16) return { label: "EXPERT", toolCount: 12 };
  if (level >= 11) return { label: "ADVANCED", toolCount: 9 };
  if (level >= 6)  return { label: "INTERMEDIATE", toolCount: 6 };
  return { label: "BEGINNER", toolCount: 3 };
};

const FirewallDefender = ({ initialLevel = 1, timeLimit = 30, onFinish, mode }: any) => {      
  const stage = getStageDetails(initialLevel);
  
  const availableTools = React.useMemo(() => 
    DEFENSIVE_TOOLS.slice(0, stage.toolCount), [stage.toolCount]
  );
  
  const availableAttackTypes = React.useMemo(() => 
    ATTACK_TYPES.filter(atk => availableTools.some(t => t.solves === atk.type)),
    [availableTools]
  );

  const [health, setHealth]           = useState(100);
  const [score, setScore]             = useState(0);
  const [timeLeft, setTimeLeft]       = useState(timeLimit);
  const [activeAttacks, setActiveAttacks] = useState<Attack[]>([]);
  const [tutPage, setTutPage]         = useState(0);
  const [isBlocking, setIsBlocking]   = useState(false);
  const [blockColor, setBlockColor]   = useState(H.bright);
  const [explosions, setExplosions]   = useState<{id:number;x:number;color:string}[]>([]);
  const [damageFlash, setDamageFlash] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<string|null>(null);
  const [attempts, setAttempts] = useState(0);
  const totalTools = availableTools.length; 
  const [mistakesCount, setMistakesCount] = useState(0);

  const [gameState, setGameState] = useState<'tutorial'|'start'|'playing'|'defeat'|'victory'>(() => {
    const stage = getStageDetails(initialLevel);
    const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${stage.label}`);
    return hasSeenTutorial ? 'start' : 'tutorial';
  }); 

  const markTutorialAsSeen = useCallback(() => {
      const stage = getStageDetails(initialLevel);
      localStorage.setItem(`tutorial_seen_${stage.label}`, 'true');
      setGameState('start');
  }, [initialLevel]);

  const isToolFocus = gameState === 'tutorial' && tutPage > 0 && tutPage <= totalTools;
  const currentTool = isToolFocus ? availableTools[tutPage - 1] : null;
  
  const healthRef = useRef(health);
  const mistakesCountRef = useRef(mistakesCount);
  const processedIdsRef = useRef(new Set()); 

  useEffect(() => {
      setTimeLeft(timeLimit);
      setHealth(100);
      setScore(0);
  }, [initialLevel, timeLimit]);

  useEffect(() => { 
    healthRef.current = health; 
    mistakesCountRef.current = mistakesCount;
  }, [health, mistakesCount]);

  const scoreRef = React.useRef(score);
  const timeLeftRef = React.useRef(timeLeft);
  React.useEffect(() => { 
    scoreRef.current = score; 
    timeLeftRef.current = timeLeft; 
  }, [score, timeLeft]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      setGameState('victory');
      if (onFinish) onFinish({ 
        score: scoreRef.current, 
        status: 'Win', 
        duration: timeLimit,
        mistakesCount: mistakesCountRef.current 
      } as any);
      return;
    }

    const t = setInterval(() => {
      setTimeLeft((p: number) => p - 1); 
    }, 1000);

    return () => clearInterval(t);
  }, [gameState, timeLeft, onFinish, timeLimit]); 

  useEffect(() => {
    if (gameState !== 'playing' || availableAttackTypes.length === 0) return;

    const spawn = setInterval(() => {
      const atk = availableAttackTypes[Math.floor(Math.random() * availableAttackTypes.length)];
      
      setActiveAttacks((prev: Attack[]) => [...prev, { 
        ...atk, 
        x: 0, 
        instanceId: Date.now() + Math.random(),
        speed: atk.baseSpeed + (initialLevel * 0.04),
      }]);
    }, Math.max(800, 2800 - (initialLevel * 100)));

    const move = setInterval(() => {
      setActiveAttacks((prev: Attack[]) => { 
          const updated = prev.map(a => ({ ...a, x: a.x + a.speed }));
          const breached = updated.find(a => a.x > 82);

          if (breached) {
              if (!processedIdsRef.current.has(breached.instanceId)) {
                  processedIdsRef.current.add(breached.instanceId); 

                  setMistakesCount(prev => prev + 1); 

                  setHealth(h => { 
                      const nh = Math.max(0, h - 12); 
                      if (nh === 0 && onFinish) {
                          setGameState('defeat');
                          onFinish({ 
                              score: 0, 
                              status: 'Loss', 
                              duration: timeLimit - timeLeftRef.current,
                              mistakesCount: mistakesCountRef.current + 1 
                          } as any); 
                      }
                      return nh; 
                  });

                  setDamageFlash(true); 
                  setTimeout(() => setDamageFlash(false), 400);
              }

              return updated.filter(a => a.instanceId !== breached.instanceId);
          }

          return updated;
      });
    }, 30);

    return () => { clearInterval(spawn); clearInterval(move); };
    
  }, [gameState, initialLevel, availableAttackTypes, onFinish, timeLimit]);

  const lastDefendTimeRef = useRef(0);

  const handleDefend = useCallback((tool: typeof DEFENSIVE_TOOLS[0], e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      
      const now = Date.now();
      if (gameState !== 'playing' || (now - lastDefendTimeRef.current < 400)) return;

      const target = activeAttacks.find(a => a.type === tool.solves);

      if (target) {
          lastDefendTimeRef.current = now;
          
          setIsBlocking(true); 
          setBlockColor(tool.color);
          setTimeout(() => setIsBlocking(false), 400);

          setScore(prevScore => prevScore + 5); 

          const explosionId = Date.now();
          setExplosions(ex => [...ex, { id: explosionId, x: target.x, color: tool.color }]);
          setTimeout(() => setExplosions(ex => ex.filter(e => e.id !== explosionId)), 600);

          setActiveAttacks(prev => prev.filter(a => a.instanceId !== target.instanceId));
      }
  }, [gameState, activeAttacks]); 

  const pct = (timeLeft / timeLimit) * 100;
  const timeColor = pct > 50 ? H.bright : pct > 25 ? '#ffaa00' : '#ff0000';

  return (
    <div className="flex flex-col h-full w-full bg-[#030303] text-white p-3 md:p-6 select-none overflow-hidden relative font-mono z-10 fd-wrapper">
      <style>{STYLES}</style>

      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'100%', height:'100%', background:'radial-gradient(ellipse at 50% 50%, rgba(255,68,0,.04) 0%, transparent 70%)',
        pointerEvents:'none' }}/>
      {damageFlash && <div style={{ position:'absolute', inset:0, background:'rgba(255,0,0,.22)',
        animation:'damage-flash .4s ease', pointerEvents:'none', zIndex:99 }}/>}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2 md:mb-4 bg-[#0a0505f2] backdrop-blur-md px-4 md:px-8 py-2 md:py-3 rounded-[1rem] md:rounded-[1.5rem] border-b-2 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-[100] w-full shrink-0 relative fd-header" style={{ borderBottomColor: health < 30 ? E.red : '#ff440044' }}>
        <div className="flex items-center gap-2 md:gap-4 shrink">
          <div className="text-sm md:text-2xl fd-header-icon" style={{ filter: `drop-shadow(0 0 10px ${health < 30 ? E.red : H.bright})`, animation: health < 30 ? 'blink 0.5s ease infinite' : 'hero-pulse 2s ease-in-out infinite' }}>
            ❤️
          </div>

          <div className="w-[50px] md:w-[150px] h-1.5 md:h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 relative fd-header-health">
            <div style={{ height:'100%', width:`${health}%`, background:`linear-gradient(90deg, ${H.armor} 0%, ${H.bright} 100%)`, boxShadow:`0 0 15px ${H.bright}66`, transition:'width .8s cubic-bezier(0.4, 0, 0.2, 1)' }}/>
          </div>

          <div className="flex flex-col items-center">
            <span style={{ fontWeight:900, color:health < 30 ? E.red : '#fff', fontFamily:"'Orbitron', monospace", textShadow:`0 0 12px ${health < 30 ? E.red : H.bright}` }} className="text-xs md:text-base fd-header-text">
              {healthRef.current}%
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center shrink-0">
           <div style={{ fontWeight:900, color:timeColor, fontFamily:"'Orbitron', monospace", textShadow:`0 0 15px ${timeColor}`, lineHeight:1 }} className="text-xl md:text-4xl fd-header-text-lg">
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
           </div>
           <div className="w-10 md:w-20 h-0.5 md:h-1 opacity-30 mt-1 md:mt-2" style={{ background:timeColor }}/>
        </div>

        <div className="text-right flex items-center gap-2 md:gap-4 shrink-0">
          <div className="flex flex-col">
            <span className="text-[6px] md:text-[9px] text-[#777] tracking-[0.2em] font-black fd-header-sub">NEURAL SCORE</span>
            <div style={{ fontWeight:900, color:'#00f2ff', fontFamily:"'Orbitron', monospace", textShadow:'0 0 30px rgba(0,242,255,0.8)', lineHeight:1 }} className="text-xl md:text-4xl fd-header-text-lg">
              {score.toString().padStart(4, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* ARENA - flex-1 gives it the remaining space and pushes tools down */}
      <div className="relative w-full flex-1 min-h-[220px] md:min-h-[300px] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] bg-[#050505] overflow-hidden mb-2 md:mb-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] fd-arena">
        <div style={{ position:'absolute', inset:0, opacity:.07, backgroundImage:'linear-gradient(#111 1px,transparent 1px),linear-gradient(90deg,#111 1px,transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }}/>

        <div style={{ position:'absolute', left:0, right:0, height:1, background:`linear-gradient(90deg, transparent, ${H.bright}44, transparent)`, animation:'scan-line 4s linear infinite', zIndex:1, pointerEvents:'none' }}/>

        <div className="md:right-[32px] fd-guardian" style={{ position:'absolute', right:'5%', top:'50%', transform:'translateY(-50%)', zIndex:20, display:'flex', flexDirection:'column', alignItems:'center', animation: isBlocking ? 'blocked .5s ease' : 'float-hero 3s ease-in-out infinite', pointerEvents:'none' }}>
          <div style={{ position:'relative' }}>
            <img src="/F-Person.png" alt="Guardian" className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] object-contain fd-guardian-img" style={{ filter: isBlocking ? `drop-shadow(0 0 20px ${blockColor}) drop-shadow(0 0 40px ${blockColor}) brightness(1.3)` : 'drop-shadow(0 0 8px #ff4400) drop-shadow(0 0 16px #ff6600) brightness(.9)', transition:'filter .3s ease' }}/>
            {isBlocking && (
              <div style={{ position:'absolute', top:'10%', left:'5%', width:'90%', height:'90%', borderRadius:'50%', border:`2.5px solid ${blockColor}`, boxShadow:`0 0 30px ${blockColor}`, animation:'explode .5s ease forwards' }}/>
            )}
          </div>
          <div className="mt-1 md:mt-2 text-[6px] md:text-[9px] font-black tracking-[0.35em] uppercase px-2 md:px-4 py-0.5 md:py-1.5 rounded-full border fd-guardian-text" style={{ color:'rgba(255,68,0,.4)', background:'rgba(255,68,0,.05)', border:'1px solid rgba(255,68,0,.1)' }}>GUARDIAN</div>
        </div>

        {activeAttacks.map(atk => (
          <div key={atk.instanceId} style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', left:`${atk.x}%`, display:'flex', flexDirection:'column', alignItems:'center', zIndex:10, transition:'left .03s linear', animation:'float-evil 3s ease-in-out infinite, glitch 7s linear infinite', pointerEvents:'none' }}>
            <div className="scale-75 md:scale-110 fd-attack-icon"><AttackIcon type={atk.type} size={64}/></div>
            <div className="mt-0.5 md:mt-2 text-[7px] md:text-[11px] font-black px-1 md:px-2 py-0.5 md:py-1 rounded fd-attack-text" style={{ color:atk.color, background:'rgba(0,0,0,.85)', border:`1px solid ${atk.color}55`, letterSpacing:'0.08em', textTransform:'uppercase', textShadow:`0 0 6px ${atk.color}` }}>
              {atk.name}
            </div>
          </div>
        ))}

        {explosions.map(ex => (
          <div key={ex.id} className="w-[40px] h-[40px] md:w-[80px] md:h-[80px]" style={{ position:'absolute', top:'50%', left:`${ex.x}%`, transform:'translate(-50%,-50%)', borderRadius:'50%', border:`2px solid ${ex.color}`, boxShadow:`0 0 20px ${ex.color}`, animation:'explode .6s ease forwards', pointerEvents:'none', zIndex:30 }}/>
        ))}

        {/* OVERLAYS */}
        {gameState === 'tutorial' && (
          <div style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(0,0,0,.95)', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:32, border:'1px solid rgba(255,255,255,.05)' }} className="gap-3 p-6 text-center animate-in fade-in duration-500 fd-overlay">
            <div className="text-4xl md:text-7xl mb-2 md:mb-4 fd-overlay-icon" style={{ animation:'hero-pulse 2s ease-in-out infinite' }}>📖</div>
            <div style={{ fontFamily:"'Orbitron', monospace", fontWeight:900, color:H.bright, textShadow:`0 0 20px ${H.bright}` }} className="text-xl md:text-4xl mb-2 md:mb-4 uppercase fd-overlay-title">
              How to Defend
            </div>
            <p className="text-gray-400 text-[10px] md:text-lg max-w-2xl mb-4 md:mb-8 leading-relaxed font-sans font-bold fd-overlay-text">
              Cyber threats will attack your system from the left. 
              Match the incoming attack with the correct defensive tool from the bottom panel before they breach the Guardian!
            </p>
            <button onClick={markTutorialAsSeen} style={{ background:`linear-gradient(135deg, ${H.armor}, ${H.bright})`, border:'none', borderRadius:12, fontFamily:"'Orbitron', monospace", fontWeight:900, letterSpacing:'0.1em', color:'white', cursor:'pointer', boxShadow:`0 0 20px ${H.bright}55` }} className="px-6 py-2.5 md:px-12 md:py-5 text-[10px] md:text-base hover:scale-105 transition-transform uppercase fd-overlay-btn">
              Got it, Proceed
            </button>
          </div>
        )}

        {gameState === 'start' && (
          <div style={{ position:'absolute', inset:0, zIndex:50, background:'rgba(0,0,0,.95)', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:32, border:'1px solid rgba(255,255,255,.05)' }} className="gap-2 md:gap-4 p-4 text-center fd-overlay">
            <div className="text-3xl md:text-7xl fd-overlay-icon" style={{ animation:'hero-pulse 2s ease-in-out infinite' }}>🛡️</div>
            <div style={{ fontFamily:"'Orbitron', monospace", fontWeight:900, fontStyle:'italic', textTransform:'uppercase', letterSpacing:'0.1em', color:'white', textShadow:`0 0 20px ${H.bright}` }} className="text-lg md:text-4xl fd-overlay-title">
              READY TO DEFEND?
            </div>
            <div style={{ color:'#555', letterSpacing:'0.2em', textTransform:'uppercase' }} className="text-[8px] md:text-base fd-overlay-text">
              SELECT THE RIGHT TOOL — NEUTRALIZE THE THREAT
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-5 mt-2 md:mt-6">
              <button onClick={()=>{ setTutPage(0); setGameState('tutorial'); }} style={{ background:'#111', border:`1px solid #333`, borderRadius:10, color:'#666', fontFamily:"'Share Tech Mono', monospace", cursor:'pointer', letterSpacing:'0.1em' }} className="px-4 py-2 md:px-8 md:py-4 text-[9px] md:text-[13px] w-full md:w-auto hover:bg-[#222] transition-colors fd-overlay-btn">📖 TUTORIAL</button>
              <button onClick={() => setGameState('playing')} style={{ background:`linear-gradient(135deg, ${H.armor}, ${H.bright})`, border:'none', borderRadius:12, fontFamily:"'Orbitron', monospace", fontWeight:900, letterSpacing:'0.2em', textTransform:'uppercase', color:'white', cursor:'pointer', boxShadow:`0 0 30px ${H.bright}55, 0 4px 20px rgba(0,0,0,.5)` }} className="px-6 py-2.5 md:px-12 md:py-4 text-[10px] md:text-[15px] w-full md:w-auto hover:scale-105 transition-transform fd-overlay-btn">⚡ INITIALIZE MISSION</button>
            </div>
          </div>
        )}

        {gameState === 'victory' && (
          <div style={{ position:'absolute', inset:0, zIndex:50, background:'rgba(0,0,0,.95)', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:32 }} className="p-4 text-center fd-overlay">
            <div className="text-4xl md:text-7xl mb-1 md:mb-4 fd-overlay-icon">🏆</div>
            <div style={{ fontFamily:"'Orbitron', monospace", fontWeight:900, color:H.highlight, textShadow:`0 0 20px ${H.glow}` }} className="text-xl md:text-4xl mb-1 md:mb-2 fd-overlay-title">SYSTEM SECURED</div>
            {mode === 'weekly' ? (
              <div style={{ fontWeight:900, color:'#00f2ff', fontFamily:"'Orbitron', monospace", textShadow:'0 0 16px #00f2ff', letterSpacing: '1px' }} className="text-lg md:text-3xl mb-2 md:mb-6 fd-overlay-title">WEEKLY PROGRESS +1</div>
            ) : (
              <div style={{ fontWeight:900, color:'#00f2ff', fontFamily:"'Orbitron', monospace", textShadow:'0 0 16px #00f2ff' }} className="text-xl md:text-4xl mb-2 md:mb-6 fd-overlay-title">SCORE: {score}</div>
            )}
            <div style={{ color:'#555', letterSpacing:'0.2em' }} className="text-[8px] md:text-sm fd-overlay-text">MISSION COMPLETED SUCCESSFULLY</div>
          </div>
        )}

        {gameState === 'defeat' && (
          <div style={{ position:'absolute', inset:0, zIndex:50, background:'rgba(0,0,0,.97)', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:32 }} className="p-4 text-center fd-overlay">
            <div className="text-4xl md:text-7xl mb-1 md:mb-4 fd-overlay-icon" style={{ animation:'blink 1s ease infinite' }}>💀</div>
            <div style={{ fontFamily:"'Orbitron', monospace", fontWeight:900, color:E.red, textShadow:`0 0 20px ${E.red}` }} className="text-xl md:text-4xl mb-1 md:mb-2 fd-overlay-title">SYSTEM BREACHED</div>
            <div style={{ color:'#555', letterSpacing:'0.2em' }} className="text-[8px] md:text-sm mb-3 md:mb-8 fd-overlay-text">
              {attempts < 3 ? `NETWORK COMPROMISED - ATTEMPT ${attempts + 1} OF 3` : "CRITICAL FAILURE: MAXIMUM RETRIES EXHAUSTED"}
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-5 w-full md:w-auto px-4 md:px-0 relative z-[200]">
              {attempts < 3 && (
                <button onClick={() => { setAttempts(prev => prev + 1); setGameState('start'); setHealth(100); setScore(0); setTimeLeft(timeLimit); setActiveAttacks([]); processedIdsRef.current.clear(); }} style={{ background:`linear-gradient(135deg, ${E.redDark}, ${E.red})`, border:'none', borderRadius:12, fontFamily:"'Orbitron', monospace", fontWeight:900, letterSpacing:'0.1em', color:'white', cursor:'pointer', boxShadow:`0 0 15px ${E.red}44` }} className="py-2 px-4 md:py-4 md:px-8 text-[9px] md:text-[14px] w-full md:w-auto hover:brightness(1.1) fd-overlay-btn">↺ RETRY MISSION</button>
              )}
              <button onClick={() => onFinish({ status: 'QUIT' })} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, fontFamily:"'Orbitron', monospace", fontWeight:900, letterSpacing:'0.1em', color:'#aaa', cursor:'pointer', transition:'all 0.3s ease' }} className="py-2 px-4 md:py-4 md:px-8 text-[9px] md:text-[14px] w-full md:w-auto hover:bg-white/10 fd-overlay-btn">
                {attempts < 3 ? "🚪 ABORT TO GAMES" : "🚪 RETURN TO GAMES"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔥 التعديل: 6x6 للديسكتوب (md:grid-cols-6) و 4x3 للجوال بالطول (grid-cols-4) 🔥 */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-4 w-full shrink-0 z-[100] relative fd-tools">
        {availableTools.map((tool, index) => {
          const isHov = hoveredTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={(e) => handleDefend(tool, e)} 
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              className="flex flex-col items-center justify-center gap-1 md:gap-3 rounded-xl md:rounded-[1.5rem] transition-all duration-300 relative shrink-1 p-2 md:p-4 text-center h-auto min-w-0 min-h-0 fd-tool-btn"
              style={{
                background: isHov ? "#161616" : "#0b0b0b",
                border: `2px solid ${tool.color}`,
                cursor: "pointer",
                boxShadow: isHov ? `0 0 18px ${tool.color}` : "none",
              }}
            >
              <div className="scale-[0.7] md:scale-[1.2] shrink-0 -my-1 md:my-1 fd-tool-icon" style={{ transition: "0.2s" }}>
                <ToolIcon id={tool.id} size={42} />
              </div>
              
              <span className="text-[8px] md:text-[12px] font-black uppercase leading-tight mt-0.5 md:mt-2 fd-tool-text" style={{ color: isHov ? tool.color : "#bbb", letterSpacing: "0.05em", wordBreak: 'break-word' }}>
                {tool.name}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 930px) and (max-height: 600px) and (orientation: landscape) {
            .fd-wrapper { 
                position: fixed !important;
                top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
                height: 100dvh !important; max-height: 100dvh !important;
                width: 100vw !important; max-width: 100vw !important;
                padding: 4px !important; gap: 4px !important; 
                overflow: hidden !important; 
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-start !important;
                background: #030303 !important;
                z-index: 9999 !important;
            }
            .fd-header { 
                flex: none !important;
                padding: 2px 10px !important; 
                margin-bottom: 0 !important; 
                min-height: 25px !important;
            }
            .fd-header-icon { font-size: 12px !important; }
            .fd-header-health { width: 40px !important; height: 3px !important; }
            .fd-header-text { font-size: 8px !important; }
            .fd-header-text-lg { font-size: 12px !important; }
            .fd-header-sub { font-size: 5px !important; }
            
            .fd-arena { min-height: 0 !important; flex: 1 1 auto !important; border-radius: 0.75rem !important; margin-bottom: 0 !important; }
            .fd-guardian { transform: scale(0.8) !important; right: 5% !important; margin-top: -10px !important; }
            .fd-guardian-img { width: 65px !important; height: 65px !important; }
            .fd-guardian-text { font-size: 6px !important; padding: 1px 4px !important; }
            
            .fd-attack-icon { transform: scale(0.6) !important; margin-bottom: -5px !important; }
            .fd-attack-text { font-size: 6px !important; padding: 1px 3px !important; margin-top: -5px !important; }
            
            .fd-tools { 
                flex: none !important;
                grid-template-columns: repeat(6, 1fr) !important; 
                gap: 4px !important; 
                padding: 0 !important;
                margin-bottom: 4px !important;
            }
            .fd-tool-btn { 
                padding: 2px 4px !important; 
                height: 38px !important; 
                min-height: 38px !important;
                border-radius: 0.5rem !important; 
                flex-direction: row !important;
                justify-content: flex-start !important;
                align-items: center !important;
                gap: 4px !important;
            }
            .fd-tool-icon { transform: scale(0.65) !important; margin: -6px -4px -6px -8px !important; }
            .fd-tool-text { font-size: 6.5px !important; line-height: 1.1 !important; margin: 0 !important; text-align: left !important; }
            
            .fd-overlay { padding: 8px !important; border-radius: 1rem !important; }
            .fd-overlay-icon { font-size: 24px !important; margin-bottom: 2px !important; }
            .fd-overlay-title { font-size: 14px !important; margin-bottom: 4px !important; }
            .fd-overlay-text { font-size: 8px !important; margin-bottom: 6px !important; line-height: 1.2 !important;}
            .fd-overlay-btn { padding: 4px 12px !important; font-size: 9px !important; }
        }
      `}</style>
    </div>
  );
};

export default FirewallDefender;