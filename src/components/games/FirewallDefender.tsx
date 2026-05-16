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
    <div className="flex flex-col h-full grow w-full bg-[#030303] text-white p-2 md:p-3 select-none overflow-hidden relative font-mono z-10">
      <style>{STYLES}</style>

      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'100%', height:'100%', background:'radial-gradient(ellipse at 50% 50%, rgba(255,68,0,.04) 0%, transparent 70%)',
        pointerEvents:'none' }}/>
      {damageFlash && <div style={{ position:'absolute', inset:0, background:'rgba(255,0,0,.22)',
        animation:'damage-flash .4s ease', pointerEvents:'none', zIndex:99 }}/>}

      {/* 🔥 HEADER: Compressed p-2 shrink-0 🔥 */}
      <div className="flex justify-between items-center mb-2 md:mb-3 bg-[#0a0505f2] backdrop-blur-md px-3 md:px-6 py-2 rounded-[1rem] md:rounded-[18px] border-b-2 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-[100] w-full shrink-0 relative" style={{ borderBottomColor: health < 30 ? E.red : '#ff440044' }}>
        <div className="flex items-center gap-2 md:gap-3 shrink">
          <div className="text-sm md:text-xl" style={{ filter: `drop-shadow(0 0 10px ${health < 30 ? E.red : H.bright})`, animation: health < 30 ? 'blink 0.5s ease infinite' : 'hero-pulse 2s ease-in-out infinite' }}>
            ❤️
          </div>

          <div className="w-[60px] md:w-[110px] h-2 md:h-3 bg-white/5 rounded-md overflow-hidden border border-white/10 relative">
            <div style={{ height:'100%', width:`${health}%`, background:`linear-gradient(90deg, ${H.armor} 0%, ${H.bright} 100%)`, boxShadow:`0 0 15px ${H.bright}66`, transition:'width .8s cubic-bezier(0.4, 0, 0.2, 1)' }}/>
          </div>

          <div className="flex flex-col items-center">
            <span style={{ fontSize:14, fontWeight:900, color:health < 30 ? E.red : '#fff', fontFamily:"'Orbitron', monospace", textShadow:`0 0 12px ${health < 30 ? E.red : H.bright}` }} className="text-xs md:text-sm">
              {healthRef.current}%
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center shrink-0">
           <div style={{ fontWeight:900, color:timeColor, fontFamily:"'Orbitron', monospace", textShadow:`0 0 15px ${timeColor}`, lineHeight:1 }} className="text-xl md:text-3xl">
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
           </div>
           <div className="w-10 md:w-16 h-0.5 md:h-1 opacity-30 mt-1" style={{ background:timeColor }}/>
        </div>

        <div className="text-right flex items-center gap-2 md:gap-4 shrink-0">
          <div className="flex flex-col">
            <span className="text-[6px] md:text-[7px] text-[#777] tracking-[0.2em] font-black">NEURAL SCORE</span>
            <div style={{ fontWeight:900, color:'#00f2ff', fontFamily:"'Orbitron', monospace", textShadow:'0 0 30px rgba(0,242,255,0.8)', lineHeight:1 }} className="text-xl md:text-3xl">
              {score.toString().padStart(4, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 ARENA: grow shrink-1 with min-h-150px (Desktop has fixed size logic) 🔥 */}
      <div className="relative w-full grow min-h-[150px] shrink-1 md:grow-0 md:h-[270px] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] bg-[#050505] overflow-hidden mb-2 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
        <div style={{ position:'absolute', inset:0, opacity:.07, backgroundImage:'linear-gradient(#111 1px,transparent 1px),linear-gradient(90deg,#111 1px,transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }}/>

        <div style={{ position:'absolute', left:0, right:0, height:1, background:`linear-gradient(90deg, transparent, ${H.bright}44, transparent)`, animation:'scan-line 4s linear infinite', zIndex:1, pointerEvents:'none' }}/>

        <div className="md:right-[32px]" style={{ position:'absolute', right:'5%', top:'30%', transform:'translateY(-50%)', zIndex:20, display:'flex', flexDirection:'column', alignItems:'center', animation: isBlocking ? 'blocked .5s ease' : 'float-hero 3s ease-in-out infinite', pointerEvents:'none' }}>
          <div style={{ position:'relative' }}>
            <img src="/F-Person.png" alt="Guardian" className="w-[80px] h-[80px] md:w-[128px] md:h-[128px] object-contain" style={{ filter: isBlocking ? `drop-shadow(0 0 20px ${blockColor}) drop-shadow(0 0 40px ${blockColor}) brightness(1.3)` : 'drop-shadow(0 0 8px #ff4400) drop-shadow(0 0 16px #ff6600) brightness(.9)', transition:'filter .3s ease' }}/>
            {isBlocking && (
              <div style={{ position:'absolute', top:'10%', left:'5%', width:'90%', height:'90%', borderRadius:'50%', border:`2.5px solid ${blockColor}`, boxShadow:`0 0 30px ${blockColor}`, animation:'explode .5s ease forwards' }}/>
            )}
          </div>
          <div className="mt-1 md:mt-1.5 text-[5px] md:text-[7px] font-black tracking-[0.35em] uppercase px-2 md:px-3 py-0.5 md:py-1 rounded-full border" style={{ color:'rgba(255,68,0,.4)', background:'rgba(255,68,0,.05)', border:'1px solid rgba(255,68,0,.1)' }}>GUARDIAN</div>
        </div>

        {activeAttacks.map(atk => (
          <div key={atk.instanceId} style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', left:`${atk.x}%`, display:'flex', flexDirection:'column', alignItems:'center', zIndex:10, transition:'left .03s linear', animation:'float-evil 3s ease-in-out infinite, glitch 7s linear infinite', pointerEvents:'none' }}>
            <div className="scale-75 md:scale-100"><AttackIcon type={atk.type} size={64}/></div>
            <div className="mt-0.5 md:mt-1 text-[7px] md:text-[10px] font-black px-1 md:px-1.5 py-0.5 rounded" style={{ color:atk.color, background:'rgba(0,0,0,.85)', border:`1px solid ${atk.color}55`, letterSpacing:'0.08em', textTransform:'uppercase', textShadow:`0 0 6px ${atk.color}` }}>
              {atk.name}
            </div>
          </div>
        ))}

        {explosions.map(ex => (
          <div key={ex.id} className="w-[40px] h-[40px] md:w-[60px] md:h-[60px]" style={{ position:'absolute', top:'50%', left:`${ex.x}%`, transform:'translate(-50%,-50%)', borderRadius:'50%', border:`2px solid ${ex.color}`, boxShadow:`0 0 20px ${ex.color}`, animation:'explode .6s ease forwards', pointerEvents:'none', zIndex:30 }}/>
        ))}

        {gameState === 'start' && (
          <div style={{ position:'absolute', inset:0, zIndex:50, background:'rgba(0,0,0,.95)', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:32, border:'1px solid rgba(255,255,255,.05)' }} className="gap-2 md:gap-3 p-4 text-center">
            <div className="text-3xl md:text-5xl" style={{ animation:'hero-pulse 2s ease-in-out infinite' }}>🛡️</div>
            <div style={{ fontFamily:"'Orbitron', monospace", fontWeight:900, fontStyle:'italic', textTransform:'uppercase', letterSpacing:'0.1em', color:'white', textShadow:`0 0 20px ${H.bright}` }} className="text-lg md:text-2xl">
              READY TO DEFEND?
            </div>
            <div style={{ color:'#555', letterSpacing:'0.2em', textTransform:'uppercase' }} className="text-[8px] md:text-[13px]">
              SELECT THE RIGHT TOOL — NEUTRALIZE THE THREAT
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-3 mt-2 md:mt-3">
              <button onClick={()=>{ setTutPage(0); setGameState('tutorial'); }} style={{ background:'#111', border:`1px solid #333`, borderRadius:10, color:'#666', fontFamily:"'Share Tech Mono', monospace", cursor:'pointer', letterSpacing:'0.1em' }} className="px-4 py-2 md:px-5 md:py-2.5 text-[9px] md:text-[11px] w-full md:w-auto">📖 TUTORIAL</button>
              <button onClick={() => setGameState('playing')} style={{ background:`linear-gradient(135deg, ${H.armor}, ${H.bright})`, border:'none', borderRadius:12, fontFamily:"'Orbitron', monospace", fontWeight:900, letterSpacing:'0.2em', textTransform:'uppercase', color:'white', cursor:'pointer', boxShadow:`0 0 30px ${H.bright}55, 0 4px 20px rgba(0,0,0,.5)` }} className="px-6 py-3 md:px-9 md:py-3.5 text-[10px] md:text-[13px] w-full md:w-auto">⚡ INITIALIZE MISSION</button>
            </div>
          </div>
        )}

        {gameState === 'victory' && (
          <div style={{ position:'absolute', inset:0, zIndex:50, background:'rgba(0,0,0,.95)', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:32 }} className="p-4 text-center">
            <div className="text-4xl md:text-5xl mb-1 md:mb-2">🏆</div>
            <div style={{ fontFamily:"'Orbitron', monospace", fontWeight:900, color:H.highlight, textShadow:`0 0 20px ${H.glow}` }} className="text-xl md:text-2xl mb-1">SYSTEM SECURED</div>
            {mode === 'weekly' ? (
              <div style={{ fontWeight:900, color:'#00f2ff', fontFamily:"'Orbitron', monospace", textShadow:'0 0 16px #00f2ff', letterSpacing: '1px' }} className="text-lg md:text-2xl mb-2 md:mb-4">WEEKLY PROGRESS +1</div>
            ) : (
              <div style={{ fontWeight:900, color:'#00f2ff', fontFamily:"'Orbitron', monospace", textShadow:'0 0 16px #00f2ff' }} className="text-2xl md:text-3xl mb-2 md:mb-4">SCORE: {score}</div>
            )}
            <div style={{ color:'#555', letterSpacing:'0.2em' }} className="text-[8px] md:text-[10px]">MISSION COMPLETED SUCCESSFULLY</div>
          </div>
        )}

        {gameState === 'defeat' && (
          <div style={{ position:'absolute', inset:0, zIndex:50, background:'rgba(0,0,0,.97)', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:32 }} className="p-4 text-center">
            <div className="text-4xl md:text-5xl mb-1 md:mb-2" style={{ animation:'blink 1s ease infinite' }}>💀</div>
            <div style={{ fontFamily:"'Orbitron', monospace", fontWeight:900, color:E.red, textShadow:`0 0 20px ${E.red}` }} className="text-xl md:text-2xl mb-1">SYSTEM BREACHED</div>
            <div style={{ color:'#555', letterSpacing:'0.2em' }} className="text-[8px] md:text-[11px] mb-3 md:mb-5">
              {attempts < 3 ? `NETWORK COMPROMISED - ATTEMPT ${attempts + 1} OF 3` : "CRITICAL FAILURE: MAXIMUM RETRIES EXHAUSTED"}
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto px-4 md:px-0 relative z-[200]">
              {attempts < 3 && (
                <button onClick={() => { setAttempts(prev => prev + 1); setGameState('start'); setHealth(100); setScore(0); setTimeLeft(timeLimit); setActiveAttacks([]); processedIdsRef.current.clear(); }} style={{ background:`linear-gradient(135deg, ${E.redDark}, ${E.red})`, border:'none', borderRadius:12, fontFamily:"'Orbitron', monospace", fontWeight:900, letterSpacing:'0.1em', color:'white', cursor:'pointer', boxShadow:`0 0 15px ${E.red}44` }} className="py-2.5 px-4 md:py-3 md:px-6 text-[10px] md:text-[12px] w-full md:w-auto hover:brightness(1.1)">↺ RETRY MISSION</button>
              )}
              <button onClick={() => onFinish({ status: 'QUIT' })} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, fontFamily:"'Orbitron', monospace", fontWeight:900, letterSpacing:'0.1em', color:'#aaa', cursor:'pointer', transition:'all 0.3s ease' }} className="py-2.5 px-4 md:py-3 md:px-6 text-[10px] md:text-[12px] w-full md:w-auto hover:bg-white/10">
                {attempts < 3 ? "🚪 ABORT TO GAMES" : "🚪 RETURN TO GAMES"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RESPONSIVE GRID TOOLS: Compressed padding & p-2 shrink-0 🔥 ── */}
      {/* cols-6 in portrait width, md:cols-12 in landscape width ensures 1 row */}
      <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5 md:gap-3 w-full py-1 md:py-2 shrink-0 z-[100] relative">
        {availableTools.map((tool, index) => {
          const isHov = hoveredTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={(e) => handleDefend(tool, e)} 
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              className="flex flex-col items-center justify-center gap-1.5 md:gap-2 rounded-2xl transition-all duration-300 relative shrink-1 p-2 md:p-4 text-center h-auto min-w-0 min-h-0"
              style={{
                background: isHov ? "#161616" : "#0b0b0b",
                border: `2px solid ${tool.color}`,
                cursor: "pointer",
                boxShadow: isHov ? `0 0 18px ${tool.color}` : "none",
              }}
            >
              {/* Icon is smaller on mobile (scale-75) */}
              <div className="scale-75 md:scale-100 shrink-0" style={{ transition: "0.2s" }}>
                <ToolIcon id={tool.id} size={42} />
              </div>
              
              {/* Text is text-[8px] on mobile and text-[12px] on desktop */}
              <span className="text-[8px] md:text-[12px] font-black uppercase leading-tight mt-0.5 md:mt-0" style={{ color: isHov ? tool.color : "#bbb", letterSpacing: "0.05em", wordBreak: 'break-word' }}>
                {tool.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FirewallDefender;