import React from 'react';
import SingleController from './controllers/SingleController';
import MultiController from './controllers/MultiController';

interface HackRaceProps {
    gameId: string;
    sessionId: string;
    initialLevel: number;
    userData: any;
    navigate: any;
    mode?: string;
    onFinish: any;
}

const HackRace: React.FC<HackRaceProps> = (props) => {
    
    // 🚦 توجيه المرور: إذا كان المود ملتي بلاير، نفتح متحكم اللعب الجماعي
    if (props.mode === 'multiplayer') {
        return <MultiController {...props} />;
    }

    // 🚦 الوضع الافتراضي: إذا ما كان ملتي بلاير، نفتح متحكم اللعب الفردي ضد الهكر
    return <SingleController {...props} />;
};

export default HackRace;