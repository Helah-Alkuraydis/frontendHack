import React, { useEffect, useState } from 'react';
import { Trophy, ShieldAlert, Zap, Award, ChevronsRight } from 'lucide-react';

interface GameOverOverlayProps {
    isWinner: boolean;
    title: string;
    message: string;
    xpGained: number;
    role: 'maker' | 'breaker';
    onClose: () => void;
}

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ isWinner, title, message, xpGained, role, onClose }) => {
    const [animatedXP, setAnimatedXP] = useState(0);
    
    useEffect(() => {
        if (isWinner && xpGained > 0) {
            let start = 0;
            const end = xpGained;
            let timer = setInterval(() => {
                start += Math.ceil(end / 30); 
                if (start >= end) {
                    setAnimatedXP(end);
                    clearInterval(timer);
                } else {
                    setAnimatedXP(start);
                }
            }, 1000 / 30);
            return () => clearInterval(timer);
        }
    }, [isWinner, xpGained]);

    // 🔥 الحل السحري لمشكلة تيلويند (Tailwind JIT Purge)
    // لازم نكتب الكلاسات صريحة عشان تيلويند يفهمها وما يمسحها
    const theme = isWinner ? {
        text: "text-emerald-400",
        textDark: "text-emerald-500",
        border: "border-emerald-500",
        bgDark: "bg-emerald-950/40",
        pulse: "NeonPulseemerald",
        glow: "WinGlow",
        grid: "emerald-grid",
        btn: "bg-emerald-600 hover:bg-emerald-500 text-white"
    } : {
        text: "text-red-400",
        textDark: "text-red-500",
        border: "border-red-500",
        bgDark: "bg-red-950/40",
        pulse: "NeonPulsered",
        glow: "LossGlow",
        grid: "red-grid",
        btn: "bg-red-600 hover:bg-red-500 text-white hover:shadow-[0_0_15px_#ef4444]"
    };

    const Icon = isWinner ? Trophy : ShieldAlert;

    return (
        // الخلفية صارت شفافة أكثر (bg-[#0a0f1d]/70) عشان تبين الغرفة وراها
        <div className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-md bg-[#0a0f1d]/70 animate-in fade-in duration-500 font-mono p-4">
            
            {/* 🔥 هنا حقنّا ستايلات الـ CSS عشان تشتغل الحركات! */}
            <style>{customStyles}</style>

            {/* صغرنا الحجم من max-w-3xl إلى max-w-2xl عشان يكون مرتب */}
            <div className={`relative w-full max-w-2xl ${theme.glow} border-t-4 ${theme.border} bg-[#050810]/95 rounded-[2rem] p-8 overflow-hidden shadow-2xl`}>
                
                {/* شبكة نيون للخلفية */}
                <div className={`absolute inset-0 opacity-20 CyberGrid ${theme.grid} pointer-events-none`}></div>
                
                {/* خط Scanner لامع */}
                <div className={`absolute inset-x-0 h-1 bg-current opacity-30 ScannerLine ${theme.textDark} pointer-events-none`}></div>

                {/* الهيدر */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-white/5 relative z-10 text-center sm:text-left">
                    <div className={`p-4 rounded-2xl ${theme.bgDark} border border-white/10 ${theme.pulse}`}>
                        <Icon size={40} className={`${theme.text} drop-shadow-[0_0_10px_currentColor]`} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className={`text-2xl sm:text-3xl font-black uppercase italic tracking-widest ${theme.text} drop-shadow-[0_0_15px_currentColor] GlitchText`}>
                            {title}
                        </h1>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">
                             Match concluded / Protocol summary
                        </span>
                    </div>
                </div>

                {/* محتوى الرسالة */}
                <div className="relative z-10 mb-8 bg-[#080c16]/80 border border-white/5 p-5 rounded-2xl shadow-inner">
                    <p className={`text-sm text-gray-300 leading-relaxed italic`}>
                        <span className={`${theme.textDark} font-bold mr-2`}>  [SYSTEM_LOG]:</span> 
                        {message}
                    </p>
                </div>

                {/* قسم النقاط والدور */}
                <div className="relative z-10 grid grid-cols-2 gap-4 mb-8 items-center">
                    <div className="border border-white/5 bg-white/[0.02] p-4 rounded-2xl flex items-center gap-4">
                        <Award size={28} className="text-amber-400" />
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-[9px] font-bold uppercase">XP Extraction</span>
                            <div className="flex items-end gap-1">
                                <span className={`text-3xl font-black ${isWinner ? 'text-amber-400' : 'text-gray-600'} XPCount transition-all`}>
                                    {animatedXP}
                                </span>
                                <span className="text-amber-400/70 text-xs font-bold pb-1">XP</span>
                            </div>
                        </div>
                    </div>
                    <div className="border border-white/5 bg-white/[0.02] p-4 rounded-2xl flex items-center gap-4">
                        <Zap size={28} className="text-blue-400" />
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-[9px] font-bold uppercase">Operative Role</span>
                            <span className="text-sm font-bold text-white uppercase tracking-wider">{role}</span>
                        </div>
                    </div>
                </div>

                {/* الأزرار */}
                <div className="relative z-10 flex justify-center sm:justify-end">
                    <button 
                        onClick={onClose}
                        className={`group flex items-center gap-3 px-8 py-3 rounded-full font-black uppercase text-xs italic tracking-widest transition-all ${theme.btn} ${isWinner ? theme.pulse : ''} hover:scale-105 active:scale-95`}
                    >
                        {isWinner ? 'Claim Rewards' : 'Acknowledge'}
                        <ChevronsRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const customStyles = `
    .CyberGrid {
        background-image: linear-gradient(#1a1d2e 1px, transparent 1px), linear-gradient(90deg, #1a1d2e 1px, transparent 1px);
        background-size: 40px 40px;
        transform: skewY(-3deg) translateY(-20px) scale(1.2);
    }
    .emerald-grid { border-color: rgba(16, 185, 129, 0.2); }
    .red-grid { border-color: rgba(239, 68, 68, 0.2); }

    .WinGlow { box-shadow: 0 0 60px rgba(16, 185, 129, 0.15), inset 0 0 30px rgba(16, 185, 129, 0.05); }
    .LossGlow { box-shadow: 0 0 60px rgba(239, 68, 68, 0.15), inset 0 0 30px rgba(239, 68, 68, 0.05); }

    .ScannerLine {
        animation: scan 3s linear infinite;
        background: linear-gradient(90deg, transparent, currentColor, transparent);
    }
    @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }

    @keyframes pulse { 0%, 100% { box-shadow: 0 0 5px currentColor; } 50% { box-shadow: 0 0 20px currentColor; } }
    .NeonPulseemerald { animation: pulse 2s ease-in-out infinite; color: #10b981; }
    .NeonPulsered { animation: pulse 2s ease-in-out infinite; color: #ef4444; }

    .GlitchText {
        animation: glitch-text 4s infinite;
    }
    @keyframes glitch-text {
        0%, 100% { transform: none; opacity: 1; }
        92% { transform: skewX(-5deg); opacity: 0.8; }
        94% { transform: skewX(5deg); opacity: 0.9; }
        96% { transform: skewX(-2deg); opacity: 1; }
    }
`;

export default GameOverOverlay;