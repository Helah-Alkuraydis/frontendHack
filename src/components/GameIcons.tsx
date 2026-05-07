import React from 'react';
// ─── HERO COLORS (matches the red warrior) ────────────────────────────────────
export const H = {
  armor: '#cc2200', bright: '#ff4400', glow: '#ff6600',
  highlight: '#ffaa44', edge: '#ff8833', dark: '#1a0800',
  crystal: '#ffe8cc', white: '#fff5ee',
};

// ─── EVIL COLORS (attacks / enemies) ─────────────────────────────────────────
export const E = {
  purple: '#aa00ff', purpleBright: '#cc55ff', purpleDark: '#5500aa',
  toxic: '#00ff44', poison: '#44ff88', toxicDark: '#007722',
  red: '#ff1144', redDark: '#880022', cyan: '#00ffee',
  yellow: '#ffdd00', corrupt: '#ff44aa', dark: '#0a0015',
};

// ─── KEYFRAMES injected once ──────────────────────────────────────────────────
export const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');
  @keyframes hero-pulse { 0%,100%{filter:drop-shadow(0 0 6px #ff4400) drop-shadow(0 0 14px #ff6600)} 50%{filter:drop-shadow(0 0 14px #ff4400) drop-shadow(0 0 28px #ff8800) drop-shadow(0 0 42px #ffaa00)} }
  @keyframes evil-pulse { 0%,100%{filter:drop-shadow(0 0 5px #aa00ff) drop-shadow(0 0 12px #7700cc)} 50%{filter:drop-shadow(0 0 12px #cc55ff) drop-shadow(0 0 26px #aa00ff)} }
  @keyframes evil-pulse-red { 0%,100%{filter:drop-shadow(0 0 5px #ff1144)} 50%{filter:drop-shadow(0 0 14px #ff44aa) drop-shadow(0 0 28px #ff1144)} }
  @keyframes evil-pulse-green { 0%,100%{filter:drop-shadow(0 0 5px #00ff44)} 50%{filter:drop-shadow(0 0 12px #44ff88) drop-shadow(0 0 24px #00cc44)} }
  @keyframes evil-pulse-cyan  { 0%,100%{filter:drop-shadow(0 0 5px #00ffee)} 50%{filter:drop-shadow(0 0 12px #88ffff)} }
  @keyframes evil-pulse-yellow{ 0%,100%{filter:drop-shadow(0 0 5px #ffdd00)} 50%{filter:drop-shadow(0 0 12px #ffff44)} }
  @keyframes float-hero { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes float-evil { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-4px) rotate(0.6deg)} 66%{transform:translateY(2px) rotate(-0.6deg)} }
  @keyframes glitch { 0%,93%,100%{transform:translate(0,0)} 94%{transform:translate(-2px,1px)} 96%{transform:translate(2px,-1px)} }
  @keyframes energy-flow { 0%{stroke-dashoffset:200;opacity:.4} 50%{opacity:1} 100%{stroke-dashoffset:0;opacity:.4} }
  @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes spin-rev  { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
  @keyframes blink { 0%,49%,100%{opacity:1} 50%,90%{opacity:.15} }
  @keyframes scan-line { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
  @keyframes explode { 0%{transform:scale(0);opacity:1} 100%{transform:scale(3);opacity:0} }
  @keyframes blocked { 0%{transform:scale(1) translateX(0)} 50%{transform:scale(1.15) translateX(-8px)} 100%{transform:scale(1) translateX(0)} }
  @keyframes march { 0%{transform:translateX(0)} 100%{transform:translateX(2px)} }
  @keyframes tool-hover { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
  @keyframes damage-flash { 0%,100%{background:transparent} 50%{background:rgba(255,0,0,.25)} }
  @keyframes spark0 { 0%,100%{transform:scaleY(1) translateY(0);opacity:.9} 50%{transform:scaleY(1.35) translateY(-3px);opacity:1} }
  @keyframes spark1 { 0%,100%{transform:scaleY(.85) translateY(1px);opacity:.7} 50%{transform:scaleY(1.4) translateY(-4px);opacity:1} }
  @keyframes spark2 { 0%,100%{transform:scaleY(1.1) translateY(-1px);opacity:.8} 50%{transform:scaleY(.8) translateY(2px);opacity:.6} }
  @keyframes spark3 { 0%,100%{transform:scaleY(.9) translateY(0);opacity:.75} 50%{transform:scaleY(1.45) translateY(-5px);opacity:1} }
  @keyframes spark4 { 0%,100%{transform:scaleY(1.2) translateY(-2px);opacity:.85} 50%{transform:scaleY(.75) translateY(3px);opacity:.5} }
  @keyframes fw-glow-line { 0%{stroke-dashoffset:120;opacity:.3} 40%{opacity:1} 100%{stroke-dashoffset:0;opacity:.3} }
 @keyframes arrow-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes spotlight-pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 68, 0, 0.4); } 70% { box-shadow: 0 0 0 20px rgba(255, 68, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 68, 0, 0); } }
`;

// TOOL ICONS  (red/gold warrior style)
export function ToolIcon({ id, size = 44 }: { id: string; size?: number }) {
  const s = size;
  const c = H;
  const v = `0 0 ${s} ${s}`;
  const cx = s / 2, cy = s / 2;
  const glowAnim = 'hero-pulse 2.5s ease-in-out infinite';

const shared = (children: React.ReactNode) => (
  <svg 
    width={s} 
    height={s} 
    viewBox={v} 
    style={{ 
      filter: 'drop-shadow(0 0 8px #ff4400) drop-shadow(0 0 16px #ff6600)' 
    }} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id={`tg-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={c.highlight} /><stop offset="100%" stopColor={c.armor} />
      </linearGradient>
      <radialGradient id={`tr-${id}`} cx="50%" cy="40%">
        <stop offset="0%" stopColor={c.highlight} stopOpacity=".7" /><stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    {children}
  </svg>
);

  switch (id) {
    case 'firewall': return shared(<>
      <defs>
        <linearGradient id="fw-fire" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff2200"/>
          <stop offset="55%" stopColor="#ff8800"/>
          <stop offset="100%" stopColor="#ffee00" stopOpacity=".7"/>
        </linearGradient>
      </defs>
      {[0,1,2].map(row=>[0,1,2,3].map(col=>(
        <rect key={`${row}-${col}`}
          x={col*9+(row%2===0?0:4.5)+1} y={row*6+24}
          width={8} height={5} rx={1}
          fill={`url(#tg-${id})`} stroke={c.edge} strokeWidth={.4}/>
      )))}
      <line x1="1" y1="24" x2={s-1} y2="24"
        stroke={c.highlight} strokeWidth={1.4} strokeDasharray="4 2"
        style={{animation:'fw-glow-line 1.8s linear infinite'}}/>
      {[
        {cx:5,  cy:17, rx:3.2, ry:7, anim:'spark0 .9s ease-in-out infinite'},
        {cx:13, cy:15, rx:3.5, ry:8, anim:'spark1 1.1s ease-in-out infinite'},
        {cx:21, cy:16, rx:3,   ry:7, anim:'spark2 .8s ease-in-out infinite'},
        {cx:29, cy:14, rx:3.8, ry:9, anim:'spark3 1.0s ease-in-out infinite'},
        {cx:37, cy:16, rx:3.2, ry:7, anim:'spark4 .95s ease-in-out infinite'},
      ].map((f,i)=>(
        <ellipse key={i} cx={f.cx} cy={f.cy} rx={f.rx} ry={f.ry}
          fill="url(#fw-fire)" opacity={.92}
          style={{animation:f.anim, transformOrigin:`${f.cx}px 24px`}}/>
      ))}
    </>);

    case 'antivirus': return shared(<>
      <ellipse cx={cx} cy={cy+2} rx="9" ry="11" fill={`url(#tg-${id})`} opacity={.9}/>
      {[cy-4, cy+1, cy+6].map(y=><line key={y} x1={cx-9} y1={y} x2={cx+9} y2={y} stroke={c.dark} strokeWidth={1.2}/>)}
      <circle cx={cx} cy={cy-11} r="5.5" fill={`url(#tg-${id})`}/>
      <circle cx={cx-2.5} cy={cy-12} r="1.8" fill={c.white} opacity={.9}/>
      <circle cx={cx+2.5} cy={cy-12} r="1.8" fill={c.white} opacity={.9}/>
      <line x1={cx-2} y1={cy-16} x2={cx-7} y2={cy-22} stroke={c.edge} strokeWidth={1.5} strokeLinecap="round"/>
      <line x1={cx+2} y1={cy-16} x2={cx+7} y2={cy-22} stroke={c.edge} strokeWidth={1.5} strokeLinecap="round"/>
      <circle cx={cx-7} cy={cy-22} r="1.5" fill={c.highlight}/>
      <circle cx={cx+7} cy={cy-22} r="1.5" fill={c.highlight}/>
      {[-4,1,6].map((dy,i)=><g key={i}>
        <line x1={cx-9} y1={cy+dy} x2={cx-17} y2={cy+dy-4} stroke={c.edge} strokeWidth={1.5} strokeLinecap="round"/>
        <line x1={cx+9} y1={cy+dy} x2={cx+17} y2={cy+dy-4} stroke={c.edge} strokeWidth={1.5} strokeLinecap="round"/>
      </g>)}
      <line x1={cx-11} y1={cy-11} x2={cx+11} y2={cy+11} stroke={c.white} strokeWidth={3.5} strokeLinecap="round"/>
      <line x1={cx+11} y1={cy-11} x2={cx-11} y2={cy+11} stroke={c.white} strokeWidth={3.5} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="20" fill="none" stroke={c.glow} strokeWidth={.8} opacity={.4}
        strokeDasharray="4 3" style={{animation:'spin-slow 5s linear infinite'}}/>
    </>);

    case 'updates': return shared(<>
      <path d={`M${cx} 4 L${s-4} 12 L${s-4} 26 Q${s-4} 38 ${cx} 44 Q4 38 4 26 L4 12 Z`} fill="none" stroke={`url(#tg-${id})`} strokeWidth={1.8}/>
      <path d={`M${cx} 7 L${s-7} 14 L${s-7} 26 Q${s-7} 37 ${cx} 42 Q7 37 7 26 L7 14 Z`} fill="#1a0800" opacity={.7}/>
      <line x1={cx} y1="15" x2={cx} y2="30" stroke={c.highlight} strokeWidth={2} strokeLinecap="round"/>
      <polyline points={`${cx-6},21 ${cx},15 ${cx+6},21`} stroke={c.highlight} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d={`M${cx-8} 24 A8,8 0 0,1 ${cx+8},24`} fill="none" stroke={c.glow} strokeWidth={1.2} strokeDasharray="4 2" style={{animation:'energy-flow 1.5s linear infinite'}}/>
    </>);

    case 'email_filter': return shared(<>
      <rect x="5" y="13" width={s-10} height={22} rx="2" fill="none" stroke={`url(#tg-${id})`} strokeWidth={1.5}/>
      <rect x="6" y="14" width={s-12} height={20} rx="1.5" fill="#1a0800" opacity={.6}/>
      <polyline points={`5,13 ${cx},25 ${s-5},13`} stroke={c.bright} strokeWidth={1.5} strokeLinejoin="round"/>
      <polygon points={`${cx},30 ${cx-5},36 ${cx+5},36`} fill={c.glow} opacity={.9}/>
      <line x1={cx} y1="36" x2={cx} y2="41" stroke={c.glow} strokeWidth={1.5}/>
      <circle cx={s-6} cy="10" r="6" fill={c.armor}/><text x={s-6} y={13} textAnchor="middle" fill={c.white} fontSize="8" fontWeight="bold">!</text>
    </>);

    case 'mfa': return shared(<>
      <rect x="10" y="22" width={s-20} height={18} rx="3" fill="#1a0800" stroke={c.bright} strokeWidth={1.5}/>
      <path d={`M15 22 L15 16 A${cx-15},${cx-15} 0 0,1 ${s-15},16 L${s-15} 22`} fill="none" stroke={c.bright} strokeWidth={2}/>
      <circle cx={cx} cy="30" r="4" fill={c.glow} opacity={.9}/>
      <rect x={cx-1.5} y="32" width="3" height="5" rx="1" fill={c.glow}/>
      <circle cx={cx} cy={cy} r="15" fill="none" stroke={c.armor} strokeWidth={.8} strokeDasharray="5 2" style={{animation:'spin-slow 6s linear infinite'}}/>
      {[-9,0,9].map((dx,i)=><circle key={i} cx={cx+dx} cy="43" r="2" fill={i===1?c.highlight:c.armor}/>)}
    </>);

    case 'url_scanner': return shared(<>
      <circle cx="20" cy="20" r="12" fill="none" stroke={`url(#tg-${id})`} strokeWidth={2}/>
      <circle cx="20" cy="20" r="8" fill="#1a0800" opacity={.7}/>
      <line x1="29" y1="29" x2="40" y2="40" stroke={c.bright} strokeWidth={2.5} strokeLinecap="round"/>
      <line x1="13" y1="20" x2="27" y2="20" stroke={c.glow} strokeWidth={1} style={{animation:'energy-flow 1s linear infinite'}}/>
      <line x1="20" y1="13" x2="20" y2="27" stroke={c.glow} strokeWidth={1} style={{animation:'energy-flow 1s linear infinite'}}/>
      <circle cx="20" cy="20" r="4" fill={c.bright} opacity={.6} style={{animation:'blink 1.5s ease infinite'}}/>
    </>);

    case 'verification': return shared(<>
      <rect x="4" y="11" width={s-8} height={24} rx="3" fill="none" stroke={`url(#tg-${id})`} strokeWidth={1.5}/>
      <rect x="5" y="12" width={s-10} height={22} rx="2" fill="#1a0800" opacity={.7}/>
      <rect x="8" y="15" width="11" height="12" rx="1.5" fill={c.armor} opacity={.7}/>
      <circle cx="13" cy="19" r="3" fill={c.glow} opacity={.8}/>
      <path d="M8,27 Q13,22 18,27" fill={c.glow} opacity={.5}/>
      {[18,22,26].map(y=><rect key={y} x="22" y={y} width={y===18?16:10} height="1.5" rx=".7" fill={c.edge} opacity={.7}/>)}
      <circle cx={s-6} cy="10" r="6" fill={c.armor} stroke={c.highlight} strokeWidth={1}/>
      <polyline points={`${s-10},10 ${s-7},13 ${s-2},7`} stroke={c.white} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </>);

    case 'backup': return shared(<>
      {[6,15,24].map((y,i)=><g key={i}>
        <rect x="8" y={y} width={s-16} height="8" rx="1.5" fill="#1a0800" stroke={i===0?c.highlight:c.armor} strokeWidth={i===0?1.2:.8}/>
        <circle cx={s-10} cy={y+4} r="2" fill={i===0?c.glow:c.armor}/>
        <rect x="11" y={y+2.5} width={i===0?15:10} height="3" rx=".8" fill={c.edge} opacity={.5}/>
      </g>)}
      <path d="M13,36 A8,8 0 1,1 21,44" fill="none" stroke={c.bright} strokeWidth={1.8} strokeDasharray="4 2" style={{animation:'energy-flow 2s linear infinite'}}/>
      <polygon points={`21,41 21,47 26,44`} fill={c.bright}/>
    </>);

    case 'vpn': return shared(<>
      <ellipse cx={cx} cy={cx} rx="16" ry="16" fill="none" stroke={`url(#tg-${id})`} strokeWidth={1.8}/>
      <ellipse cx={cx} cy={cx} rx="8" ry="16" fill="none" stroke={c.armor} strokeWidth={.9}/>
      <line x1="6" y1={cx} x2={s-6} y2={cx} stroke={c.armor} strokeWidth={.9}/>
      <line x1="9" y1="16" x2={s-9} y2="16" stroke={c.armor} strokeWidth={.7} opacity={.6}/>
      <line x1="9" y1={s-16} x2={s-9} y2={s-16} stroke={c.armor} strokeWidth={.7} opacity={.6}/>
      <path d={`M${cx} 8 L${cx+9} 14 L${cx+9} ${cx} Q${cx+9} ${cx+7} ${cx} ${cx+10} Q${cx-9} ${cx+7} ${cx-9} ${cx} L${cx-9} 14 Z`}
        fill="#1a0800" fillOpacity={.9} stroke={c.highlight} strokeWidth={1.2}/>
      <rect x={cx-4} y={cx-2} width="8" height="6" rx="1.5" fill={c.bright} opacity={.85}/>
      <path d={`M${cx-3} ${cx-2} L${cx-3} ${cx-5} A3,3 0 0,1 ${cx+3},${cx-5} L${cx+3} ${cx-2}`} fill="none" stroke={c.bright} strokeWidth={1.2}/>
    </>);

    case 'ids': return shared(<>
      <rect x="4" y="8" width={s-8} height={s-18} rx="2.5" fill="#1a0800" stroke={c.bright} strokeWidth={1.5}/>
      <rect x="6" y="10" width={s-12} height={s-22} rx="2" fill="#0d0200"/>
      <polyline points={`8,${cy} 11,${cy-6} 14,${cy+4} 17,${cy-8} 20,${cy+6} 23,${cy-2} 26,${cy+3} 29,${cy-6} 32,${cy+1} 35,${cy-3} ${s-6},${cy}`}
        fill="none" stroke={`url(#tg-${id})`} strokeWidth={1.5} strokeLinejoin="round"
        style={{animation:'energy-flow 1.5s linear infinite',strokeDasharray:300}}/>
      <circle cx="26" cy={cy+3} r="3.5" fill={c.bright} opacity={.9} style={{animation:'blink .8s ease infinite'}}/>
      <rect x={cx-5} y={s-10} width="10" height="5" rx=".8" fill={c.armor}/>
      <rect x={cx-10} y={s-6} width="20" height="3" rx=".8" fill="#1a0800" stroke={c.armor} strokeWidth={.8}/>
    </>);

    case 'waf': return shared(<>
      <polygon points={`${cx},3 ${s-3},13 ${s-3},30 ${cx},40 3,30 3,13`} fill="none" stroke={`url(#tg-${id})`} strokeWidth={2}/>
      <polygon points={`${cx},6 ${s-6},15 ${s-6},29 ${cx},38 6,29 6,15`} fill="#1a0800" opacity={.7}/>
      <line x1="6" y1={cx} x2={s-6} y2={cx} stroke={c.armor} strokeWidth={.7}/>
      <line x1={cx} y1="6" x2={cx} y2="38" stroke={c.armor} strokeWidth={.7}/>
      <line x1="10" y1="13" x2={s-10} y2="31" stroke={c.armor} strokeWidth={.6} opacity={.5}/>
      <line x1={s-10} y1="13" x2="10" y2="31" stroke={c.armor} strokeWidth={.6} opacity={.5}/>
      <polyline points={`${cx-8},16 ${cx-5},25 ${cx},18 ${cx+5},25 ${cx+8},16`} fill="none" stroke={c.highlight} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
    </>);

    case 'access_control': return shared(<>
      <rect x="12" y="8" width={s-24} height={s-14} rx="2.5" fill="none" stroke={`url(#tg-${id})`} strokeWidth={1.8}/>
      <rect x="13" y="9" width={s-26} height={s-16} rx="2" fill="#1a0800" opacity={.7}/>
      <circle cx={s-12} cy={cy} r="2" fill={c.bright}/>
      <line x1="4" y1={s-8} x2={s-4} y2={s-8} stroke={c.bright} strokeWidth={1.8}/>
      {[10,18,26,34].map(x=><line key={x} x1={x} y1={s-8} x2={x} y2={s-2} stroke={c.edge} strokeWidth={1.2}/>)}
      <rect x="4" y={cy-5} width="7" height="10" rx="1.5" fill={c.armor} stroke={c.highlight} strokeWidth={.8}/>
      <circle cx={cx} cy={cy} r="6" fill="#1a0800" stroke={c.glow} strokeWidth={1.2}/>
      <polyline points={`${cx-3},${cy} ${cx-1},${cy+3} ${cx+4},${cy-2}`} stroke={c.highlight} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>);

    default: return <svg width={s} height={s} viewBox={v}/>;
  }
}

// ATTACK ICONS  — same richness/detail level as ToolIcon
export function AttackIcon({ type, size = 52 }: { type: string; size?: number }) {
  const s = size;
  const cx = s / 2, cy = s / 2;
  const v = `0 0 ${s} ${s}`;

  const cfgMap: Record<string, { anim: string; col: string; bg: string }> = {
    network:    { anim:'evil-pulse 2.2s ease-in-out infinite',        col:E.purple,      bg:'#0d0020' },
    malware:    { anim:'evil-pulse-green 2s ease-in-out infinite',    col:E.toxic,       bg:'#001a00' },
    vuln:       { anim:'evil-pulse-red 2.1s ease-in-out infinite',    col:E.red,         bg:'#1a0000' },
    phishing:   { anim:'evil-pulse-cyan 2s ease-in-out infinite',     col:E.cyan,        bg:'#001a1a' },
    password:   { anim:'evil-pulse 2.3s ease-in-out infinite',        col:E.purpleBright,bg:'#0a0018' },
    fake_page:  { anim:'evil-pulse-green 2s ease-in-out infinite',    col:E.toxic,       bg:'#001500' },
    soc_eng:    { anim:'evil-pulse-yellow 2.4s ease-in-out infinite', col:E.yellow,      bg:'#1a1400' },
    ransomware: { anim:'evil-pulse-red 2s ease-in-out infinite',      col:E.red,         bg:'#1a0000' },
    mitm:       { anim:'evil-pulse-cyan 2.2s ease-in-out infinite',   col:E.cyan,        bg:'#001818' },
    leak:       { anim:'evil-pulse 2s ease-in-out infinite',          col:E.purpleBright,bg:'#0d0020' },
    injection:  { anim:'evil-pulse-green 2.1s ease-in-out infinite',  col:E.toxic,       bg:'#001a00' },
    insider:    { anim:'evil-pulse-yellow 2.3s ease-in-out infinite', col:E.yellow,      bg:'#1a1400' },
  };
  const { anim, col, bg } = cfgMap[type] ?? cfgMap.network;

  const wrap = (children: React.ReactNode) => (
    <svg width={s} height={s} viewBox={v} style={{ animation: anim }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`eg-${type}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity=".9"/>
          <stop offset="100%" stopColor={bg}/>
        </linearGradient>
        <radialGradient id={`er-${type}`} cx="50%" cy="35%">
          <stop offset="0%" stopColor={col} stopOpacity=".6"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>
      {children}
    </svg>
  );

  switch (type) {

    /* ── DDoS: 3-stack server rack, flood arrows from left ── */
    case 'network': return wrap(<>
      {[4, 14, 24].map((y, i) => (
        <g key={i}>
          <rect x={cx-1} y={y} width={s/2-2} height={8} rx={1.5}
            fill={bg} stroke={col} strokeWidth={i===1?2:1.2}/>
          <rect x={cx+1} y={y+2} width={8} height={4} rx={1} fill={col} opacity={.35}/>
          <circle cx={cx+13} cy={y+4} r={1.8}
            fill={i===1?col:E.purpleDark}
            style={i===1?{animation:'blink .6s ease infinite'}:{}}/>
          <circle cx={cx+17} cy={y+4} r={1.5} fill={E.purpleDark} opacity={.6}/>
        </g>
      ))}
      <line x1={cx+10} y1={4} x2={cx+10} y2={1} stroke={col} strokeWidth={1.5}/>
      <circle cx={cx+10} cy={1} r={1.2} fill={col}/>
      {[6, 14, 22, 30].map((y, i) => (
        <g key={i}>
          <line x1={2} y1={y} x2={cx-4} y2={y}
            stroke={col} strokeWidth={1.8} strokeDasharray="3 2"
            style={{ animation: `energy-flow ${.7+i*.15}s linear infinite` }}/>
          <polygon points={`${cx-4},${y-3} ${cx-4},${y+3} ${cx},${y}`} fill={E.corrupt}/>
        </g>
      ))}
      <circle cx={cx+9} cy={16} r={14} fill="none" stroke={col} strokeWidth={.8}
        strokeDasharray="3 4" opacity={.4}
        style={{ animation:'spin-slow 4s linear infinite reverse' }}/>
    </>);

    case 'malware': return wrap(<>
      <ellipse cx={cx} cy={cy+2} rx={9} ry={11} fill={`url(#eg-${type})`} opacity={.95}/>
      {[cy-4, cy+1, cy+6].map(y =>
        <line key={y} x1={cx-9} y1={y} x2={cx+9} y2={y} stroke={bg} strokeWidth={1.2}/>
      )}
      <circle cx={cx} cy={cy-11} r={5.5} fill={`url(#eg-${type})`}/>
      <circle cx={cx-2.5} cy={cy-12} r={2.2} fill={E.red} opacity={.95}
        style={{ animation:'blink 1s ease infinite' }}/>
      <circle cx={cx+2.5} cy={cy-12} r={2.2} fill={E.red} opacity={.95}
        style={{ animation:'blink 1.2s ease infinite' }}/>
      <circle cx={cx-2.5} cy={cy-12} r={.9} fill="#300"/>
      <circle cx={cx+2.5} cy={cy-12} r={.9} fill="#300"/>
      <line x1={cx-2} y1={cy-16} x2={cx-7} y2={cy-22}
        stroke={col} strokeWidth={1.5} strokeLinecap="round"/>
      <line x1={cx+2} y1={cy-16} x2={cx+7} y2={cy-22}
        stroke={col} strokeWidth={1.5} strokeLinecap="round"/>
      <circle cx={cx-7} cy={cy-22} r={1.5} fill={col}/>
      <circle cx={cx+7} cy={cy-22} r={1.5} fill={col}/>
      {[-4, 1, 6].map((dy, i) => (
        <g key={i}>
          <line x1={cx-9} y1={cy+dy} x2={cx-17} y2={cy+dy-4}
            stroke={col} strokeWidth={1.5} strokeLinecap="round"/>
          <line x1={cx+9} y1={cy+dy} x2={cx+17} y2={cy+dy-4}
            stroke={col} strokeWidth={1.5} strokeLinecap="round"/>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={20} fill="none" stroke={col}
        strokeWidth={.8} opacity={.4} strokeDasharray="4 3"
        style={{ animation:'spin-slow 5s linear infinite reverse' }}/>
    </>);

/* ── ZERO-DAY: Scaled Down for better Tutorial visibility ── */
case 'vuln': return wrap(<>
  <path d={`M${cx} 10 L${cx+14} 18 L${cx+14} 34 Q${cx+14} 45 ${cx} 50 Q${cx-14} 45 ${cx-14} 34 L${cx-14} 18 Z`}
    fill="none" stroke={`url(#eg-${type})`} strokeWidth={2.5} strokeLinejoin="round"/>
  
  <path d={`M${cx} 12 L${cx+11} 19 L${cx+11} 34 Q${cx+11} 43 ${cx} 48 L${cx} 12 Z`}
    fill={bg} opacity={.7}/>
  <path d={`M${cx} 12 L${cx-11} 19 L${cx-11} 34 Q${cx-11} 43 ${cx} 48 L${cx} 12 Z`}
    fill={bg} opacity={.4}/>

  <polyline
    points={`${cx},10 ${cx-6},22 ${cx+5},30 ${cx-4},38 ${cx+3},50`}
    fill="none" stroke={col} strokeWidth={3.5}
    strokeLinejoin="round" strokeLinecap="round"
    style={{ filter: `drop-shadow(0 0 6px ${col})` }}/>
  
  <circle cx={cx} cy={30} r={3} fill={col} style={{ animation: 'blink 0.5s infinite' }} />

  {[[-18,22], [18,32], [-12,45]].map(([dx,dy], i) => (
    <rect key={i} x={cx+dx} y={dy} width={4} height={1.5} fill={col}
      style={{ animation: `glitch 0.5s infinite ${i*0.2}s`, opacity: 0.8 }} />
  ))}

  {[[cx+12,15], [cx-16,30], [cx+14,42]].map(([sx,sy], i) => (
    <circle key={i} cx={sx} cy={sy} r={1.2} fill={col}
      style={{ animation: 'blink 1s infinite' }}/>
  ))}
</>);

    /* ── PHISHING: ornate hook + rich envelope ── */
    case 'phishing': return wrap(<>
      <rect x={4} y={5} width={26} height={19} rx={2.5}
        fill={bg} stroke={col} strokeWidth={2}/>
      <polyline points={`4,5 17,17 30,5`}
        stroke={col} strokeWidth={1.8} strokeLinejoin="round" fill="none"/>
      <circle cx={15} cy={16} r={4} fill="none" stroke={col} strokeWidth={1.5}/>
      <circle cx={15} cy={16} r={1.8} fill={col} opacity={.8}/>
      <path d={`M19,16 Q21,12 19,10 Q15,8 12,11 Q10,14 12,18`}
        fill="none" stroke={col} strokeWidth={1.2} strokeLinecap="round"/>
      <path d={`M20,5 L20,31 Q20,44 31,44 Q42,44 42,34 Q42,26 35,26`}
        fill="none" stroke={`url(#eg-${type})`} strokeWidth={3.5} strokeLinecap="round"/>
      <line x1={35} y1={26} x2={35} y2={34} stroke={col} strokeWidth={3} strokeLinecap="round"/>
      <line x1={35} y1={34} x2={29} y2={34} stroke={col} strokeWidth={3} strokeLinecap="round"/>
      <line x1={20} y1={1} x2={20} y2={5}
        stroke={col} strokeWidth={1.5} strokeDasharray="2 2"/>
      <ellipse cx={15} cy={24} rx={8} ry={2.5} fill="none" stroke={col}
        strokeWidth={.9} opacity={.45}
        style={{ animation:'energy-flow 1.6s linear infinite' }}/>
    </>);

    /* ── BRUTE FORCE: padlock with cracked body + repeat key attempts ── */
    case 'password': return wrap(<>
      <rect x={cx-12} y={cy-2} width={24} height={20} rx={3}
        fill={bg} stroke={`url(#eg-${type})`} strokeWidth={2.2}/>
      <path d={`M${cx-7},${cy-2} L${cx-7},${cy-12} A7,7 0 0,1 ${cx+7},${cy-12} L${cx+7},${cy-2}`}
        fill="none" stroke={col} strokeWidth={2.5}/>
      <circle cx={cx} cy={cy+7} r={4.5} fill={col} opacity={.7}/>
      <rect x={cx-2} y={cy+9} width={4} height={6} rx={1} fill={col} opacity={.7}/>
      <polyline points={`${cx-12},${cy+4} ${cx-5},${cy+2} ${cx+3},${cy+10} ${cx+12},${cy+8}`}
        fill="none" stroke={E.corrupt} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
      {[[-18,cy-8],[-20,cy+2],[-18,cy+11]].map(([kx,ky],i) => (
        <g key={i} opacity={.35+i*.3}>
          <circle cx={kx+12} cy={ky} r={3.5} fill="none" stroke={col} strokeWidth={1.5}/>
          <line x1={kx+15} y1={ky} x2={kx+22} y2={ky} stroke={col} strokeWidth={1.5}/>
          <line x1={kx+19} y1={ky} x2={kx+19} y2={ky+3} stroke={col} strokeWidth={1.2}/>
          <line x1={kx+22} y1={ky} x2={kx+22} y2={ky+3} stroke={col} strokeWidth={1.2}/>
        </g>
      ))}
      {[[-8,-2],[6,-4],[8,5],[-6,7]].map(([dx,dy],i) => (
        <line key={i}
          x1={cx+dx*.4} y1={cy+2+dy*.4}
          x2={cx+dx}    y2={cy+2+dy}
          stroke={col} strokeWidth={1.5} strokeLinecap="round"
          style={{ animation:`blink ${.3+i*.12}s ease infinite` }}/>
      ))}
    </>);

    /* ── FAKE PAGE: browser with evil face + malware download arrow ── */
    case 'fake_page': return wrap(<>
      <rect x={2} y={3} width={s-4} height={s-5} rx={3}
        fill={bg} stroke={col} strokeWidth={2}/>
      <rect x={2} y={3} width={s-4} height={11} rx={3}
        fill={col} opacity={.2}/>
      {[8,14,20].map((x,i)=>
        <circle key={x} cx={x} cy={8.5} r={2.5}
          fill={i===0?E.red:i===1?E.yellow:col} opacity={.85}/>
      )}
      <rect x={24} y={5.5} width={24} height={5.5} rx={1.5} fill={bg}/>
      <text x={26} y={10} fill={col} fontSize={4} fontFamily="monospace">evil.ph1sh.ru</text>
      <circle cx={cx} cy={27} r={11} fill={bg} stroke={col} strokeWidth={1.8}/>
      <line x1={cx-7} y1={21} x2={cx-3} y2={23} stroke={col} strokeWidth={2} strokeLinecap="round"/>
      <line x1={cx+3} y1={23} x2={cx+7} y2={21} stroke={col} strokeWidth={2} strokeLinecap="round"/>
      <circle cx={cx-4} cy={25} r={2.5} fill={col}/>
      <circle cx={cx+4} cy={25} r={2.5} fill={col}/>
      <circle cx={cx-4} cy={25} r={1} fill={bg}/>
      <circle cx={cx+4} cy={25} r={1} fill={bg}/>
      <path d={`M${cx-6},31 Q${cx},37 ${cx+6},31`}
        fill="none" stroke={col} strokeWidth={2} strokeLinecap="round"/>
      {[cx-4,cx-1,cx+2].map(tx =>
        <line key={tx} x1={tx} y1={31} x2={tx} y2={34}
          stroke={col} strokeWidth={1.2}/>
      )}
      <line x1={cx} y1={40} x2={cx} y2={47}
        stroke={col} strokeWidth={2.5} strokeLinecap="round"
        style={{ animation:'energy-flow .9s linear infinite' }}/>
      <polygon points={`${cx-4},45 ${cx},50 ${cx+4},45`} fill={col}/>
    </>);

    /* ── SOCIAL ENGINEERING: theatrical mask — smiling front, devil behind ── */
    case 'soc_eng': return wrap(<>
      <ellipse cx={cx+4} cy={cy-2} rx={13} ry={15} fill={E.corrupt} opacity={.25}/>
      <polygon points={`${cx-4},${cy-15} ${cx-1},${cy-8} ${cx-8},${cy-8}`}
        fill={E.corrupt} opacity={.6}/>
      <polygon points={`${cx+12},${cy-15} ${cx+9},${cy-8} ${cx+16},${cy-8}`}
        fill={E.corrupt} opacity={.6}/>
      <ellipse cx={cx-3} cy={cy-1} rx={13} ry={15}
        fill={bg} stroke={`url(#eg-${type})`} strokeWidth={2}/>
      <path d={`M${cx-9},${cy-6} Q${cx-6},${cy-10} ${cx-3},${cy-6}`}
        fill="none" stroke={col} strokeWidth={2} strokeLinecap="round"/>
      <path d={`M${cx+1},${cy-6} Q${cx+4},${cy-10} ${cx+7},${cy-6}`}
        fill="none" stroke={col} strokeWidth={2} strokeLinecap="round"/>
      <path d={`M${cx-9},${cy+4} Q${cx-3},${cy+12} ${cx+3},${cy+4}`}
        fill="none" stroke={col} strokeWidth={2.5} strokeLinecap="round"/>
      <line x1={cx-3} y1={cy+14} x2={cx-3} y2={cy+22}
        stroke={col} strokeWidth={3} strokeLinecap="round"/>
      <circle cx={cx+11} cy={cy-2} r={3} fill={E.corrupt} opacity={.8}
        style={{ animation:'blink 1.4s ease infinite' }}/>
      <circle cx={cx+11} cy={cy-2} r={1.3} fill={bg}/>
      <line x1={cx+1} y1={cy-16} x2={cx+1} y2={cy+14}
        stroke={col} strokeWidth={.7} strokeDasharray="2 2" opacity={.4}/>
    </>);

    /* ── RANSOMWARE: file cabinet locked + $ dripping ── */
    case 'ransomware': return wrap(<>
      <path d={`M8,4 L36,4 L44,12 L44,52 L8,52 Z`}
        fill={bg} stroke={`url(#eg-${type})`} strokeWidth={2}/>
      <path d={`M36,4 L36,12 L44,12`} fill="none" stroke={col} strokeWidth={2}/>
      {[18,24,30].map(y =>
        <rect key={y} x={12} y={y} width={28} height={3} rx={1}
          fill={col} opacity={.2}/>
      )}
      <rect x={14} y={28} width={24} height={18} rx={3}
        fill={E.redDark} stroke={col} strokeWidth={2}/>
      <path d={`M19,28 L19,22 A7,7 0 0,1 33,22 L33,28`}
        fill="none" stroke={col} strokeWidth={2.5}/>
      <text x={cx} y={42} textAnchor="middle"
        fill={col} fontSize={14} fontWeight="bold" fontFamily="monospace">$</text>
      {[9,15,21,27,33,39,45].map(x =>
        <rect key={x} x={x} y={49} width={4} height={3} rx={1}
          fill={x===27?E.corrupt:col}
          opacity={x===27?.9:.3}
          style={{ animation:`blink ${.3+(x%7)*.1}s ease infinite` }}/>
      )}
    </>);

    /* ── MITM: two nodes, interceptor ghost in middle ── */
    case 'mitm': return wrap(<>
      <rect x={1} y={cy-9} width={15} height={11} rx={2}
        fill={bg} stroke={col} strokeWidth={1.8}/>
      <rect x={1} y={cy+2} width={15} height={2} rx={1} fill={col} opacity={.5}/>
      <line x1={4} y1={cy-6} x2={13} y2={cy-6} stroke={col} strokeWidth={1} opacity={.6}/>
      <line x1={4} y1={cy-3} x2={10} y2={cy-3} stroke={col} strokeWidth={1} opacity={.4}/>
      <rect x={s-16} y={cy-9} width={15} height={11} rx={2}
        fill={bg} stroke={col} strokeWidth={1.8}/>
      {[cy-7,cy-4,cy-1].map(y =>
        <rect key={y} x={s-14} y={y} width={8} height={2} rx={1}
          fill={col} opacity={.4}/>
      )}
      <circle cx={s-5} cy={cy+1} r={1.5} fill={col}
        style={{ animation:'blink .8s ease infinite' }}/>
      <line x1={16} y1={cy-4} x2={cx-9} y2={cy-4}
        stroke={col} strokeWidth={1.5} strokeDasharray="3 3"/>
      <line x1={cx+9} y1={cy-4} x2={s-16} y2={cy-4}
        stroke={col} strokeWidth={1.5} strokeDasharray="3 3"/>
      <circle cx={cx} cy={cy-4} r={9}
        fill={bg} stroke={`url(#eg-${type})`} strokeWidth={2}/>
      <ellipse cx={cx-3} cy={cy-6} rx={2.5} ry={3} fill={col} opacity={.9}/>
      <ellipse cx={cx+3} cy={cy-6} rx={2.5} ry={3} fill={col} opacity={.9}/>
      <ellipse cx={cx-3} cy={cy-6} rx={1} ry={1.5} fill={bg}/>
      <ellipse cx={cx+3} cy={cy-6} rx={1} ry={1.5} fill={bg}/>
      <path d={`M${cx-9},${cy+5} Q${cx-6},${cy+9} ${cx-3},${cy+5} Q${cx},${cy+9} ${cx+3},${cy+5} Q${cx+6},${cy+9} ${cx+9},${cy+5}`}
        fill={bg} stroke={col} strokeWidth={1.5}/>
      <line x1={cx} y1={cy-13} x2={cx} y2={cy-18}
        stroke={col} strokeWidth={1.5}/>
      <circle cx={cx} cy={cy-18} r={1.5} fill={col}
        style={{ animation:'blink .7s ease infinite' }}/>
    </>);

    /* ── DATA LEAK: database draining — elaborate cylinder + stream ── */
    case 'leak': return wrap(<>
      <ellipse cx={cx} cy={10} rx={17} ry={5.5}
        fill={bg} stroke={`url(#eg-${type})`} strokeWidth={2}/>
      <rect x={cx-17} y={10} width={34} height={20}
        fill={bg} stroke={`url(#eg-${type})`} strokeWidth={2}/>
      <ellipse cx={cx} cy={30} rx={17} ry={5.5}
        fill={bg} stroke={`url(#eg-${type})`} strokeWidth={2}/>
      {[14,18,22,26].map((y,i) =>
        <rect key={y} x={cx-12} y={y} width={i%2===0?18:12} height={2.5} rx={1}
          fill={col} opacity={.3}/>
      )}
      <polyline points={`${cx+11},12 ${cx+16},18 ${cx+11},24`}
        fill="none" stroke={E.corrupt} strokeWidth={2.5}
        strokeLinecap="round" strokeLinejoin="round"/>
      <line x1={cx+14} y1={20} x2={cx+14} y2={36}
        stroke={col} strokeWidth={3}
        style={{ animation:'energy-flow .8s linear infinite' }}/>
      {[[cx+14,37],[cx+14,42],[cx+12,46]].map(([dx,dy],i) => (
        <ellipse key={i} cx={dx} cy={dy} rx={3-i*.5} ry={4-i*.5}
          fill={col} opacity={.8-i*.2}
          style={{ animation:`blink ${.5+i*.2}s ease infinite` }}/>
      ))}
      <path d={`M${cx+6},46 Q${cx+4},52 ${cx+14},52 Q${cx+24},52 ${cx+22},46`}
        fill={E.redDark} stroke={col} strokeWidth={1.5}/>
    </>);

    /* ── SQL INJECTION: code terminal with glowing evil line ── */
    case 'injection': return wrap(<>
      <rect x={2} y={3} width={s-4} height={s-5} rx={3}
        fill={bg} stroke={`url(#eg-${type})`} strokeWidth={2}/>
      <rect x={2} y={3} width={s-4} height={10} rx={3}
        fill={col} opacity={.2}/>
      {[7,13,19].map(x =>
        <circle key={x} cx={x} cy={8} r={2.2} fill={col} opacity={.5}/>
      )}
      <text x={5} y={23} fill={E.purpleDark} fontSize={6} fontFamily="monospace">SELECT * users</text>
      <text x={5} y={31} fill={col} fontSize={6} fontFamily="monospace">WHERE id='1' OR</text>
      <rect x={3} y={33} width={s-6} height={9} rx={1} fill={col} opacity={.15}/>
      <text x={5} y={40} fill={col} fontSize={6} fontFamily="monospace" fontWeight="bold">'1'='1';DROP--</text>
      <rect x={5} y={43} width={5} height={7} rx={1}
        fill={col} style={{ animation:'blink .6s ease infinite' }}/>
      <line x1={3} y1={42} x2={s-3} y2={42}
        stroke={col} strokeWidth={1.2}
        style={{ animation:'energy-flow 1s linear infinite' }}/>
    </>);

    case 'insider': return wrap(<>
      <path d={`M${cx-14},s M${cx-14},44 Q${cx-14},26 ${cx},26 Q${cx+14},26 ${cx+14},44`}
        fill={bg} stroke={`url(#eg-${type})`} strokeWidth={2}/>
      <circle cx={cx} cy={14} r={10} fill={bg} stroke={`url(#eg-${type})`} strokeWidth={2}/>
      <path d={`M${cx-9},14 Q${cx-8},5 ${cx},4 Q${cx+8},5 ${cx+9},14`}
        fill={col} opacity={.3}/>
      <ellipse cx={cx} cy={16} rx={7} ry={5} fill={bg} opacity={.6}/>
      <circle cx={cx-3} cy={14} r={2.5} fill={col}
        style={{ animation:'blink 1.3s ease infinite' }}/>
      <circle cx={cx+3} cy={14} r={2.5} fill={col}
        style={{ animation:'blink 1.5s ease infinite' }}/>
      <circle cx={cx-3} cy={14} r={1} fill={bg}/>
      <circle cx={cx+3} cy={14} r={1} fill={bg}/>
      <rect x={cx-7} y={28} width={14} height={10} rx={2}
        fill={E.redDark} stroke={col} strokeWidth={1.5}/>
      <rect x={cx-5} y={30} width={10} height={2} rx={.5} fill={col} opacity={.6}/>
      <rect x={cx-5} y={33} width={7} height={1.5} rx={.5} fill={col} opacity={.4}/>
      <path d={`M${cx-2},26 Q${cx-5},23 ${cx},22 Q${cx+5},23 ${cx+2},26`}
        fill="none" stroke={col} strokeWidth={1.2} opacity={.5}/>
      <circle cx={cx+10} cy={36} r={4} fill="none" stroke={col} strokeWidth={2}/>
      <line x1={cx+14} y1={36} x2={cx+21} y2={36} stroke={col} strokeWidth={2}/>
      <line x1={cx+18} y1={36} x2={cx+18} y2={39} stroke={col} strokeWidth={1.8}/>
      <line x1={cx+21} y1={36} x2={cx+21} y2={39} stroke={col} strokeWidth={1.8}/>
      <circle cx={cx} cy={cy} r={s*.45} fill="none" stroke={col}
        strokeWidth={.7} strokeDasharray="3 4" opacity={.3}
        style={{ animation:'spin-slow 6s linear infinite' }}/>
    </>);

    default: return <svg width={s} height={s} viewBox={v}/>;
  }
}