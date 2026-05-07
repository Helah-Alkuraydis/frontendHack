import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Timer, Heart, Trash2, ShieldCheck, Mail, Archive, CornerUpLeft, MoreVertical, Star, ChevronDown, Lock, OctagonAlert, Lightbulb, Zap, Loader2 } from "lucide-react";
import { BASE_URL } from '../../api/auth.js';

interface PhishingProps {
  gameId: string;
  sessionId: string;
  initialLevel: number;
  userData: any;
  navigate: any;
  mode?: string; 
  onFinish: (results: any) => Promise<void>; 
}

const TOTAL_STEPS = 5;

const PhishingHunter: React.FC<PhishingProps> = ({ gameId, sessionId, initialLevel, userData, navigate,mode ,onFinish}) => {
  const [timeLeft, setTimeLeft] = useState(180); 
  const [lives, setLives] = useState(3);
  const [currentStep, setCurrentStep] = useState(0);
  const [scenario, setScenario] = useState<any>(null);
  const [loadingScenario, setLoadingScenario] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0); 
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
    const [attempts, setAttempts] = useState(0);
  

  const winXP = 25 * initialLevel;

  const getActionIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('report') || n.includes('phishing')) return <OctagonAlert size={14}/>;
    if (n.includes('delete') || n.includes('trash')) return <Trash2 size={14}/>;
    if (n.includes('safe') || n.includes('legitimate')) return <ShieldCheck size={14}/>;
    return <Zap size={14}/>;
  };

  const fetchAIScenario = useCallback(async () => {
    try {
      setLoadingScenario(true);
      const token = localStorage.getItem('token');
      const currentSubject = scenario?.subject || "";
      const res = await axios.get(`${BASE_URL}/games/phishing/start?t=${Date.now()}&lastSubject=${currentSubject}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data) {
          let data = res.data.data;
          if (Array.isArray(data)) data = data[0];
          const actions = [data.correct_action, ...(data.wrong_actions || [])].sort(() => Math.random() - 0.5);
          setSelectedAction(null);
          setIsAnswered(false);
          setScenario({ ...data, actions });
      } 
    } catch (error) { console.error("AI Error"); }
    finally { setLoadingScenario(false); }
  }, [scenario?.subject]);

  useEffect(() => { fetchAIScenario(); }, []);

  const restartCurrentLevel = () => {
    setLives(3);
    setCurrentStep(0);
    setTimeLeft(180);
    setMistakesCount(0);
    fetchAIScenario();
  };

const handleFinishGame = async (status: 'Win' | 'Loss') => {
    const results = {
        status: status,
        score: status === 'Win' ? winXP : 0,
        duration: 180 - timeLeft,
        mistakesCount: mistakesCount
    };

    if (status === 'Win') {
        const isWeekly = mode === 'weekly';

        await Swal.fire({
    title: '<div style="color: #10b981; font-weight: 900; font-size: 30px; letter-spacing: 2px;">MISSION SUCCESS</div>',
    html: `
        <div style="background: rgba(16, 185, 129, 0.05); padding: 30px; border: 4px double #10b981; border-radius: 30px; position: relative; overflow: hidden;">
            <div style="font-size: 80px; margin-bottom: 20px; animation: scaleUp 0.5s ease-out;">🏆✨</div>
            <p style="color: #fff; font-size: 18px; font-weight: bold; margin-bottom: 10px;">LEVEL ${initialLevel} SECURED</p>
            
            ${!isWeekly 
                ? `<div style="font-size: 50px; color: #10b981; font-weight: 900; margin: 15px 0; filter: drop-shadow(0 0 10px #10b98155);">+${winXP} XP</div>` 
                : `<div style="font-size: 22px; color: #3b82f6; font-weight: 900; margin: 15px 0; letter-spacing: 1px; text-transform: uppercase;">Weekly Progress +1</div>`
            }
            <div style="color: #64748b; font-size: 12px; margin-top: 10px; font-family: monospace;">REDIRECTING TO COMMAND CENTER...</div>
        </div>`,
    width: '500px', 
    background: '#050810', 
    showConfirmButton: false, 
    timer: 2500, 
    timerProgressBar: true,
    allowOutsideClick: false,
    didOpen: () => {
    }
});

 onFinish(results);

    } else {
        const result = await Swal.fire({
            title: `<div style="color: #ef4444; font-weight: 900; font-size: 36px;">${attempts < 2 ? 'SYSTEM OVERLOAD' : 'TERMINAL FAILURE'}</div>`,
            html: `<div style="background: rgba(239, 68, 68, 0.1); padding: 40px; border: 5px solid #ef4444; border-radius: 20px;"><div style="font-size: 100px; margin-bottom: 20px;">💀</div><p style="color: #fff; font-size: 20px; font-weight: 900;">${attempts < 2 ? `Attempt ${attempts + 1} of 3 Failed` : 'Max Retries Exhausted'}</p></div>`,
            width: '550px', background: '#0a0000',
            showConfirmButton: attempts < 2,
            confirmButtonText: 'REBOOT (RETRY)',
            confirmButtonColor: '#ef4444',
            showCancelButton: true,
            cancelButtonText: attempts < 2 ? 'ABORT' : 'RETURN',
            cancelButtonColor: '#1e293b',
            allowOutsideClick: false
        });

        if (result.isConfirmed && attempts < 2) {
            setAttempts(prev => prev + 1);
            restartCurrentLevel();
        } else {
            await onFinish(results);
        }
    }
};
  useEffect(() => {
    let timer: any;
    if (timeLeft > 0 && lives > 0) timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    else if (timeLeft === 0 || lives === 0) handleFinishGame('Loss');
    return () => clearInterval(timer);
  }, [timeLeft, lives]);

const handleAction = (actionName: string) => {
    if (isAnswered) return;
    setSelectedAction(actionName);
    setIsAnswered(true);

    const isPhishing = scenario.type === 'Phishing'; 

    setTimeout(() => {
        if (actionName === scenario.correct_action) {
            if (currentStep < TOTAL_STEPS - 1) { 
                setCurrentStep(prev => prev + 1); 
                fetchAIScenario(); 
            } else {
                handleFinishGame('Win');
            }
        } else {
            setMistakesCount(m => m + 1);
            setLives(l => l - 1);

            if (isPhishing) {
                document.body.classList.add('glitch-effect');
                Swal.fire({
                    icon: 'error',
                    title: '⚠️ BREACH DETECTED',
                    text: "SYSTEM COMPROMISED: YOU FELL FOR A PHISHING ATTACK!",
                    background: '#0a0000',
                    color: '#ff3b6b',
                    showConfirmButton: false,
                    timer: 2000,
                }).then(() => {
                    document.body.classList.remove('glitch-effect');
                    if (lives - 1 <= 0) handleFinishGame('Loss');
                    else { setCurrentStep(prev => prev + 1); fetchAIScenario(); }
                });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: '📂 INCORRECT ASSESSMENT',
                    text: "FALSE ALARM: THIS WAS A LEGITIMATE COMMUNICATION.",
                    background: '#0a0f1d',
                    color: '#3b82f6',
                    showConfirmButton: false,
                    timer: 2000,
                }).then(() => {
                    if (lives - 1 <= 0) handleFinishGame('Loss');
                    else { setCurrentStep(prev => prev + 1); fetchAIScenario(); }
                });
            }
        }
    }, 1500);
};
  return (
    <div className="flex flex-1 flex-col h-full p-6 z-10">
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-8 bg-[#1c2438]/60 px-6 py-2 rounded-full border border-white/5 backdrop-blur-xl shadow-xl mx-auto">
          <div className="flex items-center gap-2 text-yellow-500 font-bold border-r border-white/10 pr-5 text-sm"><Zap size={14} fill="currentColor"/> <span>LEVEL {initialLevel}</span></div>
          <div className="flex items-center gap-3"><Timer size={16} className="text-blue-400" /><span className="text-lg font-mono font-black text-white">{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</span></div>
          <div className="flex items-center gap-6 border-l border-white/10 pl-6">
            <div onClick={() => Swal.fire({ title: 'INTEL', text: scenario?.explanation, background: '#0a0f1d', color: '#fff' })} className="p-2 bg-yellow-400/10 text-yellow-500 rounded-lg cursor-pointer animate-pulse"><Lightbulb size={16} /></div>
            <div className="flex gap-1.5">{[...Array(3)].map((_, i) => <Heart key={i} size={18} fill={i < lives ? "#ef4444" : "none"} color="#ef4444" className={i < lives ? "animate-pulse" : "opacity-10"} />)}</div>
          </div>
        </div>
      </div>

      {loadingScenario ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4"><Loader2 className="animate-spin text-blue-500" size={48} /><p className="text-blue-400 font-mono text-sm font-black animate-pulse">GENERATING CONTENT...</p></div>
      ) : scenario ? (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-[1.25rem] overflow-hidden shadow-2xl flex flex-col h-full border border-gray-200 animate-in slide-in-from-bottom-12 duration-700 font-sans text-gray-900">
            <div className="bg-[#f2f6fc] px-8 py-3 border-b border-gray-200 flex justify-between items-center text-gray-400">
                <div className="flex gap-10"><Archive size={18}/><OctagonAlert size={18}/><Trash2 size={18}/><Mail size={18}/></div>
                <MoreVertical size={18} className="cursor-pointer"/>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="w-16 bg-[#f8fafc] border-r border-gray-100 flex flex-col items-center py-8 gap-8"><div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm"><Mail size={18} /></div><Star size={16} className="text-gray-300"/><CornerUpLeft size={16} className="text-gray-300"/></div>
                <div className="flex-1 bg-white p-10 overflow-y-auto flex flex-col">
                    <h2 className="text-[22px] font-normal text-[#202124] mb-6 leading-tight tracking-tight">{scenario.subject}</h2>
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#1a73e8] flex items-center justify-center text-white font-bold text-lg uppercase shadow-md">{scenario.sender?.charAt(0)}</div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-[14px]">{scenario.sender}</span>
                                <div className="text-[11px] text-[#5f6368] mt-1">to {userData?.email || "lamia@hackhero.com"} <ChevronDown size={11} className="inline-block ml-1"/></div>
                            </div>
                        </div>
                        <span className="text-[10px] text-[#5f6368] font-bold uppercase mt-2">JUST NOW</span>
                    </div>
                    <div className="text-[14px] text-[#202124] leading-[1.6] mb-10 flex-1 whitespace-pre-line">{scenario.body}
                        <div onClick={(e) => { e.stopPropagation(); if(scenario?.links?.[0]?.isMalicious) handleAction("MALICIOUS LINK"); else { if (currentStep < TOTAL_STEPS - 1) { setCurrentStep(prev => prev + 1); fetchAIScenario(); } else handleFinishGame('Win'); } }} className="mt-8 p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl flex items-center gap-4 group cursor-pointer hover:bg-red-50 transition-all shadow-sm max-w-sm">
                            <div className="p-2 bg-white rounded-lg shadow-sm border border-[#dadce0] text-[#1a73e8] group-hover:scale-110 group-hover:text-red-600 transition-all"><Lock size={18} /></div>
                            <div className="flex flex-col gap-0.5 overflow-hidden"><span className="text-[12px] font-medium text-[#202124]">Verify Link</span><span className="text-[10px] text-[#0b57d0] font-mono truncate underline group-hover:text-red-700">{scenario.links?.[0]?.url}</span></div>
                        </div>
                    </div>
<div className="flex flex-col items-center gap-3 mt-auto pt-4 border-t border-gray-100 w-full overflow-visible pb-3">
    
    <div className="flex items-center gap-2 px-4 py-1 bg-blue-50/50 rounded-full border border-blue-100 shadow-sm">
        <OctagonAlert size={16} className="text-blue-600" />
        <span className="text-[15px] font-black text-blue-700 uppercase tracking-widest leading-none">
            Action Required: Choose your response
        </span>
        <OctagonAlert size={16} className="text-blue-600" />
    </div>

    <div className="flex flex-row flex-wrap items-center gap-2 justify-center w-full overflow-visible px-4">
        {scenario.actions?.map((act: any, idx: number) => {
            let buttonClass = "border-[#dadce0] text-gray-700 hover:border-[#1a73e8] hover:text-[#1a73e8] hover:bg-blue-50 bg-white"; 
            
            if (isAnswered) {
                if (act === scenario.correct_action) buttonClass = "border-green-500 text-green-700 bg-green-50 font-black border-2 scale-105"; 
                else if (act === selectedAction) buttonClass = "border-red-500 text-red-700 bg-red-50 border-2"; 
                else buttonClass = "border-gray-200 text-gray-400 opacity-50 bg-gray-50"; 
            }

            return (
               <button 
    key={idx} 
    onClick={() => handleAction(act)} 
    disabled={isAnswered} 
    className={`
        flex items-center justify-center 
        gap-3 
        px-6 py-4                   
        rounded-4xl                
        border-2 
        transition-all duration-300 
        shadow-sm 
        uppercase tracking-tighter 
        active:scale-95 
        text-[12px]      
        w-[calc(50%-1rem)]          
        min-w-[200px]              
        h-auto 
        leading-tight 
        
        ${buttonClass}
    `}
>
    <span className="scale-220">{getActionIcon(act)}</span>
    <span className="flex-1 text-center">{act}</span>
</button>
            );
        })}
    </div>
</div>
                </div>
            </div>
        </div>
      ) : null}
      <style>{`
        @keyframes glitch { 0% { transform: translate(0,0); } 20% { transform: translate(-5px, 2px); } 40% { transform: translate(5px, -2px); } 60% { transform: translate(-5px, -2px); } 80% { transform: translate(5px, 2px); } 100% { transform: translate(0,0); } }
        .glitch-effect { animation: glitch 0.15s linear infinite; }
      `}</style>
    </div>
  );
};

export default PhishingHunter;