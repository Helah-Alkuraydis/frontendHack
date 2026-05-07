import React, { useState, useEffect } from 'react';
import MakerController from './controllers/MakerController';
import BreakerController from './controllers/BreakerController';
import { Loader2 } from 'lucide-react';

interface PasswordProps {
    gameId: string;
    sessionId: string;
    initialLevel: number;
    userData: any;
    navigate: any;
    mode?: string;
    initialRole?: 'maker' | 'breaker';
    onFinish: (results: any) => void;
}

const PasswordMakerBreaker: React.FC<PasswordProps> = (props) => {
    const { initialRole, mode } = props;
    const [gameMode, setGameMode] = useState<'choice' | 'maker' | 'breaker'>(initialRole || 'choice');

    // تحديد الدور (للعب الفردي إذا لم يمرر دور أولي)
    useEffect(() => {
        if (initialRole) {
            setGameMode(initialRole);
        }
    }, [initialRole]);

    // شاشة اختيار الدور للعب الفردي (إذا أردتي إبقاءها)
    if (gameMode === 'choice') {
        return (
            <div className="flex flex-col items-center justify-center flex-1 h-full gap-8 animate-in fade-in zoom-in duration-500 text-white">
                <h2 className="text-4xl font-black italic tracking-tighter text-center">SELECT YOUR PATH</h2>
                <div className="flex gap-6">
                    <button
                        onClick={() => setGameMode('maker')}
                        className="group p-8 rounded-[2rem] bg-gradient-to-b from-emerald-600/20 to-emerald-900/40 border border-emerald-500/30 hover:border-emerald-500 hover:scale-105 transition-all w-64 flex flex-col items-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                    >
                        <span className="font-black text-xl text-white">MAKER</span>
                    </button>
                    <button
                        onClick={() => setGameMode('breaker')}
                        className="group p-8 rounded-[2rem] bg-gradient-to-b from-red-600/20 to-red-900/40 border border-red-500/30 hover:border-red-500 hover:scale-105 transition-all w-64 flex flex-col items-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.05)]"
                    >
                        <span className="font-black text-xl text-white">BREAKER</span>
                    </button>
                </div>
            </div>
        );
    }

    // التوجيه الذكي للمتحكمات (Controllers)
    if (gameMode === 'maker') {
        return <MakerController {...props} />;
    }

    if (gameMode === 'breaker') {
        return <BreakerController {...props} />;
    }

    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-white" size={40}/></div>;
};

export default PasswordMakerBreaker;