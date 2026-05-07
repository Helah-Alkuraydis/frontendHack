import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import { ToolIcon, AttackIcon, H, E , STYLES } from '../GameIcons';


// GAME DATA
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

// ══════════════════════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ══════════════════════════════════════════════════════════════════════════════




const FirewallDefender = ({ initialLevel = 1, timeLimit = 30, onFinish, mode }: any) => {      const stage = getStageDetails(initialLevel);
  
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
}, [initialLevel]);

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
    <div style={{
      display:'flex', flexDirection:'column', height:'100%', width:'100%',
      background:'#030303', color:'white', padding:8, userSelect:'none',
      overflow:'hidden', position:'relative', fontFamily:"'Share Tech Mono', monospace",
    }}>
      <style>{STYLES}</style>

      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'100%', height:'100%', background:'radial-gradient(ellipse at 50% 50%, rgba(255,68,0,.04) 0%, transparent 70%)',
        pointerEvents:'none' }}/>
      {damageFlash && <div style={{ position:'absolute', inset:0, background:'rgba(255,0,0,.22)',
        animation:'damage-flash .4s ease', pointerEvents:'none', zIndex:99 }}/>}

<div style={{ 
  display:'flex', justifyContent:'space-between', alignItems:'center',
  marginBottom:10, 
  background:'rgba(10,5,5,0.95)', 
  backdropFilter:'blur(15px)',
  padding:'12px 24px', 
  borderRadius:'18px', 
  borderBottom:`2px solid ${health < 30 ? E.red : '#ff4400'}44`,
  boxShadow:'0 10px 30px rgba(0,0,0,0.8)', 
  zIndex:100, position:'relative' 
}}>

  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
    <div style={{ 
      fontSize:20, 
      filter: `drop-shadow(0 0 10px ${health < 30 ? E.red : H.bright})`,
      animation: health < 30 ? 'blink 0.5s ease infinite' : 'hero-pulse 2s ease-in-out infinite'
    }}>
      ❤️
    </div>

    <div style={{ 
      width:110, height:12, background:'rgba(255,255,255,0.03)', 
      borderRadius:4, overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)',
      position:'relative'
    }}>
      <div style={{ 
        height:'100%', width:`${health}%`,
        background:`linear-gradient(90deg, ${H.armor} 0%, ${H.bright} 100%)`,
        boxShadow:`0 0 15px ${H.bright}66`, 
        transition:'width .8s cubic-bezier(0.4, 0, 0.2, 1)' 
      }}/>
    </div>

    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <span style={{ 
        fontSize:14, fontWeight:900, color:health < 30 ? E.red : '#fff', 
        fontFamily:"'Orbitron', monospace", textShadow:`0 0 12px ${health < 30 ? E.red : H.bright}` 
      }}>
        {health}%
      </span>
    </div>
  </div>

  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
     <div style={{ fontSize:28, fontWeight:900, color:timeColor, fontFamily:"'Orbitron', monospace", textShadow:`0 0 15px ${timeColor}`, lineHeight:1 }}>
        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
     </div>
     <div style={{ width:60, height:2, background:timeColor, marginTop:4, opacity:0.3 }}/>
  </div>

  <div style={{ textAlign:'right', display:'flex', alignItems:'center', gap:15 }}>
    <div style={{ display:'flex', flexDirection:'column' }}>
      <span style={{ fontSize:7, color:'#777', letterSpacing:'0.2em', fontWeight:900 }}>NEURAL SCORE</span>
      <div style={{ 
        fontSize:30, fontWeight:900, color:'#00f2ff',
        fontFamily:"'Orbitron', monospace", 
        textShadow:'0 0 30px rgba(0,242,255,0.8)', 
        lineHeight:1
      }}>
        {score.toString().padStart(4, '0')}
      </div>
    </div>
    

  </div>
</div>

      {/* ── ARENA ── */}
      <div style={{ position:'relative', height:270, width:'100%',
        border:'1px solid rgba(255,255,255,.05)', borderRadius:32,
        background:'#050505', overflow:'hidden', marginBottom:6,
        boxShadow:'inset 0 0 40px rgba(0,0,0,.8)' }}>

        {/* Grid */}
        <div style={{ position:'absolute', inset:0, opacity:.07,
          backgroundImage:'linear-gradient(#111 1px,transparent 1px),linear-gradient(90deg,#111 1px,transparent 1px)',
          backgroundSize:'32px 32px' }}/>

        {/* Scan line */}
        <div style={{ position:'absolute', left:0, right:0, height:1,
          background:`linear-gradient(90deg, transparent, ${H.bright}44, transparent)`,
          animation:'scan-line 4s linear infinite', zIndex:1 }}/>

        {/* Guardian */}
        <div style={{ position:'absolute', right:32, top:'30%', transform:'translateY(-50%)',
          zIndex:20, display:'flex', flexDirection:'column', alignItems:'center',
          animation: isBlocking ? 'blocked .5s ease' : 'float-hero 3s ease-in-out infinite' }}>
          <div style={{ position:'relative' }}>
            <img src="/F-Person.png" alt="Guardian"
              style={{ width:128, height:128, objectFit:'contain',
                filter: isBlocking
                  ? `drop-shadow(0 0 20px ${blockColor}) drop-shadow(0 0 40px ${blockColor}) brightness(1.3)`
                  : 'drop-shadow(0 0 8px #ff4400) drop-shadow(0 0 16px #ff6600) brightness(.9)',
                transition:'filter .3s ease' }}/>
            {isBlocking && (
              <div style={{ position:'absolute', top:'10%', left:'5%', width:'90%', height:'90%',
                borderRadius:'50%', border:`2.5px solid ${blockColor}`,
                boxShadow:`0 0 30px ${blockColor}`,
                animation:'explode .5s ease forwards' }}/>
            )}
          </div>
          <div style={{ marginTop:6, fontSize:7, fontWeight:900, color:'rgba(255,68,0,.4)',
            letterSpacing:'0.35em', textTransform:'uppercase',
            background:'rgba(255,68,0,.05)', padding:'2px 10px', borderRadius:20,
            border:'1px solid rgba(255,68,0,.1)' }}>GUARDIAN</div>
        </div>

        {/* Attacks */}
        {activeAttacks.map(atk => (
          <div key={atk.instanceId} style={{
            position:'absolute', top:'50%', transform:'translateY(-50%)',
            left:`${atk.x}%`, display:'flex', flexDirection:'column', alignItems:'center',
            zIndex:10, transition:'left .03s linear',
            animation:'float-evil 3s ease-in-out infinite, glitch 7s linear infinite',
          }}>
            <AttackIcon type={atk.type} size={64}/>
            <div style={{ marginTop:3, fontSize:10, fontWeight:900, color:atk.color,
              background:'rgba(0,0,0,.85)', padding:'1px 5px', borderRadius:3,
              border:`1px solid ${atk.color}55`, letterSpacing:'0.08em',
              textTransform:'uppercase', textShadow:`0 0 6px ${atk.color}` }}>
              {atk.name}
            </div>
          </div>
        ))}

        {/* Explosions */}
        {explosions.map(ex => (
          <div key={ex.id} style={{ position:'absolute', top:'50%', left:`${ex.x}%`,
            transform:'translate(-50%,-50%)', width:60, height:60, borderRadius:'50%',
            border:`2px solid ${ex.color}`, boxShadow:`0 0 20px ${ex.color}`,
            animation:'explode .6s ease forwards', pointerEvents:'none', zIndex:30 }}/>
        ))}



        {/* START overlay */}
        {gameState === 'start' && (
          <div style={{ position:'absolute', inset:0, zIndex:50,
            background:'rgba(0,0,0,.95)', backdropFilter:'blur(12px)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            borderRadius:32, border:'1px solid rgba(255,255,255,.05)', gap:10 }}>
            <div style={{ fontSize:48, animation:'hero-pulse 2s ease-in-out infinite' }}>🛡️</div>
            <div style={{ fontFamily:"'Orbitron', monospace", fontSize:26, fontWeight:900,
              fontStyle:'italic', textTransform:'uppercase', letterSpacing:'0.1em',
              color:'white', textShadow:`0 0 20px ${H.bright}` }}>
              READY TO DEFEND?
            </div>
            <div style={{ fontSize:13, color:'#555', letterSpacing:'0.3em', textTransform:'uppercase' }}>
              SELECT THE RIGHT TOOL — NEUTRALIZE THE THREAT
            </div>
            <div style={{display:'flex', gap:10, marginTop:8}}>
              <button onClick={()=>{ setTutPage(0); setGameState('tutorial'); }} style={{
                background:'#111', border:`1px solid #333`,
                padding:'10px 20px', borderRadius:10, color:'#666',
                fontFamily:"'Share Tech Mono', monospace", fontSize:11,
                cursor:'pointer', letterSpacing:'0.1em',
              }}>📖 TUTORIAL</button>
              <button onClick={() => setGameState('playing')} style={{
                background:`linear-gradient(135deg, ${H.armor}, ${H.bright})`,
                border:'none', padding:'12px 36px', borderRadius:12,
                fontFamily:"'Orbitron', monospace", fontWeight:900, fontSize:13,
                letterSpacing:'0.2em', textTransform:'uppercase', color:'white', cursor:'pointer',
                boxShadow:`0 0 30px ${H.bright}55, 0 4px 20px rgba(0,0,0,.5)`,
              }}>⚡ INITIALIZE MISSION</button>
            </div>
          </div>
        )}

        {/* VICTORY overlay */}
{gameState === 'victory' && (
  <div style={{ 
    position:'absolute', inset:0, zIndex:50,
    background:'rgba(0,0,0,.95)', backdropFilter:'blur(12px)',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:32 
  }}>
    <div style={{ fontSize:50, marginBottom:8 }}>🏆</div>
    <div style={{ 
        fontFamily:"'Orbitron', monospace", fontSize:26, fontWeight:900,
        color:H.highlight, textShadow:`0 0 20px ${H.glow}`, marginBottom:4 
    }}>SYSTEM SECURED</div>

    {mode === 'weekly' ? (
      <div style={{ 
        fontSize:24, fontWeight:900, color:'#00f2ff',
        fontFamily:"'Orbitron', monospace", textShadow:'0 0 16px #00f2ff', marginBottom:16,
        letterSpacing: '1px'
      }}>
        WEEKLY PROGRESS +1
      </div>
    ) : (
      <div style={{ 
        fontSize:32, fontWeight:900, color:'#00f2ff',
        fontFamily:"'Orbitron', monospace", textShadow:'0 0 16px #00f2ff', marginBottom:16 
      }}>
        SCORE: {score}
      </div>
    )}
    
    <div style={{ fontSize:10, color:'#555', letterSpacing:'0.2em' }}>MISSION COMPLETED SUCCESSFULLY</div>
  </div>
)}

{gameState === 'defeat' && (
  <div style={{ 
    position:'absolute', inset:0, zIndex:50,
    background:'rgba(0,0,0,.97)', backdropFilter:'blur(12px)',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:32 
  }}>
    <div style={{ fontSize:48, marginBottom:8, animation:'blink 1s ease infinite' }}>💀</div>
    <div style={{ fontFamily:"'Orbitron', monospace", fontSize:24, fontWeight:900,
      color:E.red, textShadow:`0 0 20px ${E.red}`, marginBottom:4 }}>SYSTEM BREACHED</div>
    
    <div style={{ fontSize:11, color:'#555', letterSpacing:'0.2em', marginBottom:20 }}>
      {attempts < 3 
        ? `NETWORK COMPROMISED - ATTEMPT ${attempts + 1} OF 3` 
        : "CRITICAL FAILURE: MAXIMUM RETRIES EXHAUSTED"}
    </div>
    
    <div style={{ display:'flex', gap:15 }}>
      {attempts < 3 && (
        <button onClick={() => { 
            setAttempts(prev => prev + 1);
            setGameState('start'); 
            setHealth(100); 
            setScore(0); 
            setTimeLeft(timeLimit); 
            setActiveAttacks([]); 
          }}
          style={{ 
            background:`linear-gradient(135deg, ${E.redDark}, ${E.red})`, border:'none',
            padding:'12px 24px', borderRadius:12, fontFamily:"'Orbitron', monospace",
            fontWeight:900, fontSize:12, letterSpacing:'0.1em', color:'white', cursor:'pointer',
            boxShadow:`0 0 15px ${E.red}44` 
          }}>
          ↺ RETRY MISSION
        </button>
      )}

      <button onClick={() => onFinish({ status: 'QUIT' })}
        style={{ 
          background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
          padding:'12px 24px', borderRadius:12, fontFamily:"'Orbitron', monospace",
          fontWeight:900, fontSize:12, letterSpacing:'0.1em', color:'#aaa', cursor:'pointer',
          transition:'all 0.3s ease'
        }}>
        {attempts < 3 ? "🚪 ABORT TO Games" : "🚪 RETURN TO Games"}
      </button>
    </div>
  </div>
)}
      </div>

    {/* TOOL GRID */}

    {/* ── INTERACTIVE TOUR TUTORIAL (English Version with Attack Icons) ── */}
{gameState === 'tutorial' && (() => {
  const totalTools = availableTools.length; 
  const isToolFocus = tutPage > 0 && tutPage <= totalTools;
  const currentTool = isToolFocus ? availableTools[tutPage - 1] : null;

  const colIndex = isToolFocus ? (tutPage - 1) % 6 : 0;
  const rowIndex = isToolFocus ? Math.floor((tutPage - 1) / 6) : 0;

  return (
    <div style={{ 
      position:'absolute', inset:0, zIndex:150, 
      background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)',
      display:'flex', flexDirection:'column', pointerEvents: 'none' 
    }}>
      
      {/* 1. Tutorial Info Box */}
      <div style={{ 
        position: 'absolute',
        pointerEvents: 'auto',
        bottom: isToolFocus ? (rowIndex === 0 ? '260px' : '150px') : '260px', 
        left: '50%',
        transform: 'translateX(-50%)', 
        width: '88%', maxWidth: 400,
        background: 'rgba(10,10,10,0.98)', 
        border: `2px solid ${isToolFocus ? '#ff4400' : H.bright}`,
        borderRadius: 20, padding: 22, textAlign: 'center',
        zIndex: 210, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {!isToolFocus ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <h2 style={{ fontFamily: "'Orbitron', monospace", color: 'white', fontSize: 24, letterSpacing: '0.1em' }}>DEFENSE PROTOCOL</h2>
        <p style={{ color: '#aaa', fontSize: 16, lineHeight: 1.6, marginTop: 10 }}>
  Welcome to **HackHero** system.
  <br/>Let's introduce your {totalTools} advanced defensive tools.
</p>
          </>
        ) : (
          <div>
            {/* Tool Header - Increased Icon Size for clarity */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 2 }}>
              <div style={{ filter: 'drop-shadow(0 0 12px #ff4400)' }}>
                 <ToolIcon id={currentTool!.id} size={45}/> 
              </div>
              <h2 style={{ fontFamily: "'Orbitron', monospace", color: '#ff4400', margin: 0, fontSize: 19, letterSpacing: '0.05em' }}>
                {currentTool!.name.toUpperCase()}
              </h2>
            </div>

            <p style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 17, lineHeight: 1.6, opacity: 0.9 }}>
               {currentTool!.solves === 'network' && "Solid barrier to block DDoS attacks trying to flood the network."}
               {currentTool!.solves === 'malware' && "Detects and removes malware and viruses immediately."}
               {currentTool!.solves === 'vuln' && "Patches security vulnerabilities (CVE) and prevents exploitation."}
               {currentTool!.solves === 'phishing' && "Intersects phishing emails and suspicious malicious links."}
               {currentTool!.solves === 'password' && "Secures accounts via Multi-Factor Authentication (MFA)."}
               {currentTool!.solves === 'fake_page' && "Detects fake websites mimicking official login pages."}
               {currentTool!.solves === 'soc_eng' && "Advanced verification to detect social engineering tactics."}
               {currentTool!.solves === 'ransomware' && "Data recovery system to counter file encryption attacks."}
               {currentTool!.solves === 'mitm' && "Secure VPN to prevent Man-in-the-Middle interceptions."}
               {currentTool!.solves === 'leak' && "Monitoring system to detect and prevent sensitive data leaks."}
               {currentTool!.solves === 'injection' && "Web Application Firewall (WAF) to block SQL injections."}
               {currentTool!.solves === 'insider' && "Access control system to prevent internal system threats."}
            </p>

            {/* Target Section with Attack Icon */}
<div style={{ 
  display:'flex', 
  alignItems:'center', 
  justifyContent:'center', 
  gap: 12, 
  padding: '6px 16px', 
  background: `rgba(0, 0, 0, 0.5)`, 
  borderRadius: 12, 
  border: `1px solid #fbf7f6`, 
  marginTop: 15
}}>
  <span style={{ opacity: 0.8, fontSize: 14, fontWeight: 900,  color: '#fff', 
    textShadow: '0 0 8px #ff4400' , letterSpacing: '1px' }}>
    TARGET THREAT:
  </span>
  
  <div style={{ 
    display: 'flex', 
    alignItems: 'center',
    background: '#050505', 
    padding: '4px',
    borderRadius: '8px',
    boxShadow: 'inset 0 0 10px rgba(17, 187, 196, 0.1)',
    filter: 'drop-shadow(0 0 2px #ff4400' 
  }}>
    <AttackIcon type={currentTool!.solves} size={55} /> 
  </div>

  <span style={{ 
    fontSize: 14, 
    fontWeight: 900, 
    color: '#fff', 
    textShadow: '0 0 8px #ff4400' 
  }}>
    {currentTool!.solves.toUpperCase()}
  </span>
</div>
          </div>
        )}

        {/* Navigation Controls */}
        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'center' }}>
          <button 
            onClick={markTutorialAsSeen} 
            style={{ background: 'transparent', border: '1px solid #333', color: '#666', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 10, fontWeight: 700 }}
          >
            SKIP
          </button>

          <button 
            onClick={() => tutPage === totalTools ? markTutorialAsSeen() : setTutPage(p => p + 1)} 
            style={{ 
              background: isToolFocus ? `linear-gradient(#ff440075)` : `linear-gradient(135deg, ${H.armor}, ${H.bright})`, 
              border: 'none', color: 'white', padding: '10px 28px', borderRadius: 12, cursor: 'pointer', fontWeight: 900, fontSize: 11,
              boxShadow: `0 0 20px ${isToolFocus ? '#b8cbcd66' : H.bright+'55'}` 
            }}
          >
            {tutPage === totalTools ? "START MISSION" : (tutPage === 0 ? "BEGIN TOUR" : "NEXT TOOL →")}
          </button>
        </div>
      </div>

      {isToolFocus && (
        <div style={{ 
          position: 'absolute',
          bottom: rowIndex === 0 ? '115px' : '10px',
          left: `${(100 / 6) * colIndex}%`,
          width: `${100 / 6}%`, 
          height: '90px', 
          border: `4px solid #ffffff`, 
          borderRadius: 16, zIndex: 200, 
          animation: 'spotlight-pulse 2s infinite',
          boxShadow: `0 0 30px #eff5f6, 0 0 0 9999px rgba(0,0,0,0.75)` 
        }} />
      )}
    </div>
  );
})()}
<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gridTemplateRows: "repeat(2, 90px)", 
  gap: 10,
  maxWidth: "100%",
  padding: "10px 0",
  minHeight: 190, 
  position: "relative",
}}>
  {DEFENSIVE_TOOLS.map((tool, index) => {
    const isUnlocked = index < stage.toolCount; 
    const isHov = hoveredTool === tool.id && isUnlocked;
    const isHighlighted = isToolFocus && currentTool?.id === tool.id;

    return (
      <button
        key={tool.id}
        onClick={(e) => isUnlocked && handleDefend(tool, e)} 
        onMouseEnter={() => isUnlocked && setHoveredTool(tool.id)}
        onMouseLeave={() => setHoveredTool(null)}
        disabled={!isUnlocked} 
        style={{
          background: isUnlocked ? (isHov ? "#161616" : "#0b0b0b") : "rgba(255,255,255,0.02)",
          border: isUnlocked ? `2px solid ${tool.color}` : "1px dashed rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "12px 6px",
          cursor: isUnlocked ? "pointer" : "default",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          minHeight: 85,
          zIndex: isHighlighted ? 201 : 1,
          position: 'relative',
          opacity: isUnlocked ? ((gameState === 'tutorial' && !isHighlighted) ? 0.3 : 1) : 0.15,
          boxShadow: isHighlighted 
            ? `0 0 30px #f2f5f5, 0 0 60px #00f2ff66` 
            : (isHov ? `0 0 18px ${tool.color}` : "none"),
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ filter: isUnlocked ? "none" : "grayscale(1) brightness(0.5)", transition: "0.2s" }}>
          <ToolIcon id={tool.id} size={42} />
        </div>

        {/* اسم الأداة */}
        <span style={{
          fontSize: 13,
          fontWeight: 800,
          color: isUnlocked ? (isHov ? tool.color : "#bbb") : "#444",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          textAlign: "center",
        }}>
          {isUnlocked ? tool.name : "LOCKED"}
        </span>
      </button>
    );
  })}
</div>
    </div>
  );
};

export default FirewallDefender;
